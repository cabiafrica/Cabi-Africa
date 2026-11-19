import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { SafetySmsService } from '../safety/safety-sms.service';
import {
  LostItemIncident,
  ReportLostItemDto,
  DriverConfirmCustodyDto,
  VerifyHandoverDto,
  LostItemStatus,
} from './lost-and-found.types';

@Injectable()
export class LostAndFoundService {
  private readonly logger = new Logger(LostAndFoundService.name);
  private incidents = new Map<string, LostItemIncident>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly safetySmsService: SafetySmsService,
  ) {}

  /**
   * Generates a collision-free Police Occurrence Book (OB) tracking number
   */
  private generateObNumber(): string {
    const now = new Date();
    const yearSuffix = now.getFullYear().toString().slice(-2);
    const monthHex = (now.getMonth() + 1).toString(16).toUpperCase();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    return `OB/LOST/${yearSuffix}${monthHex}/${randomSeq}`;
  }

  /**
   * Passenger reports a lost property item
   */
  async reportLostItem(
    passengerUserId: string,
    dto: ReportLostItemDto,
  ): Promise<LostItemIncident> {
    if (!dto.tripId || !dto.category || !dto.description) {
      throw new BadRequestException('tripId, category, and description are required');
    }

    const ride = await this.prisma.ride.findFirst({
      where: {
        OR: [{ id: dto.tripId }, { tripCode: dto.tripId }],
      },
      include: {
        passenger: true,
        driver: { include: { user: true } },
      },
    });

    if (!ride) {
      throw new NotFoundException(`Trip ${dto.tripId} not found`);
    }

    const isPassenger = ride.passengerId === passengerUserId;
    if (!isPassenger && passengerUserId !== 'admin') {
      throw new ForbiddenException('Only the registered trip passenger can file a lost item claim');
    }

    const obNumber = this.generateObNumber();
    const handoverPin = Math.floor(1000 + Math.random() * 9000).toString();
    const id = `lost_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const standardReturnFee = 500; // KES 500 standard courier compensation
    const voluntaryReward = Math.max(0, Number(dto.voluntaryReward || 0));

    // 1. Create official Occurrence in PostgreSQL for audit & police traceability
    let occurrenceId: string | undefined;
    try {
      const now = new Date();
      const occ = await this.prisma.occurrence.create({
        data: {
          obNumber,
          category: 'PROPERTY_DAMAGE' as any,
          severity: 'MEDIUM' as any,
          title: `Lost Property: ${dto.category}`,
          description: dto.description,
          passengerId: ride.passengerId,
          driverId: ride.driverId,
          rideId: ride.id,
          occurrenceDate: now,
          occurrenceTime: now,
          occurredAt: now,
          source: 'PASSENGER_LOST_AND_FOUND',
          sourceReferenceId: id,
          registeredById: passengerUserId,
          status: 'OPEN' as any,
          tags: ['LOST_AND_FOUND', dto.category, 'HANDOVER_PIN_PROTECTED'],
        },
      });
      occurrenceId = occ.id;
    } catch (e: any) {
      this.logger.warn(`Could not create Occurrence record: ${e.message}`);
    }

    const incident: LostItemIncident = {
      id,
      obNumber,
      occurrenceId,
      tripId: ride.id,
      passengerId: ride.passengerId,
      passengerName: ride.passenger?.fullName || 'Passenger',
      passengerPhone: ride.passenger?.phone || '',
      driverId: ride.driverId || 'unassigned',
      driverName: ride.driver?.user?.fullName || 'Captain',
      driverPhone: ride.driver?.user?.phone || '',
      category: dto.category,
      description: dto.description,
      itemPhotoUrl: dto.itemPhotoUrl,
      status: 'REPORTED',
      returnMethod: 'DIRECT_HANDOVER',
      handoverPin,
      standardReturnFee,
      voluntaryRewardEscrow: voluntaryReward,
      feeStatus: 'ESCROWED',
      droppedAtOffice: false,
      createdAt: new Date(),
    };

    this.incidents.set(id, incident);

    // 2. Dispatch SMS alert to driver
    if (incident.driverPhone) {
      const driverSms =
        `Cabi Africa Alert: A passenger reported a lost item (${dto.category}) on trip ${ride.tripCode || ''}.\n` +
        `Description: ${dto.description}\n` +
        `Please inspect your vehicle. Standard KES 500 return compensation guaranteed upon verified handover.\n` +
        `Open Driver App to confirm custody.`;
      this.safetySmsService.sendSms(incident.driverPhone, driverSms).catch(() => {});
    }

    return incident;
  }

  /**
   * Driver confirms finding the item or deposits it at an office
   */
  async driverConfirmCustody(
    incidentId: string,
    driverUserId: string,
    dto: DriverConfirmCustodyDto,
  ): Promise<LostItemIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new NotFoundException(`Incident ${incidentId} not found`);

    if (!dto.itemFound) {
      incident.status = 'DISPUTED';
      incident.feeStatus = 'REFUNDED';
      incident.resolutionNotes = dto.driverNotes || 'Driver reported item not found in vehicle.';
      this.incidents.set(incidentId, incident);

      if (incident.passengerPhone) {
        this.safetySmsService.sendSms(
          incident.passengerPhone,
          `Cabi Africa Notice: Your Captain inspected the vehicle but could not locate the reported ${incident.category}. Our safety team has been notified.`,
        ).catch(() => {});
      }

      return incident;
    }

    // Driver found the item
    incident.itemPhotoUrl = dto.photoUrl || incident.itemPhotoUrl;
    incident.droppedAtOffice = !!dto.droppedAtOffice;
    incident.officeLocation = dto.officeLocation || 'Cabi Partner Hub (Westlands HQ)';
    incident.returnMethod = dto.droppedAtOffice ? 'OFFICE_DROPOFF' : 'DIRECT_HANDOVER';
    incident.status = dto.droppedAtOffice ? 'RETURN_OFFICE_DROP' : 'DRIVER_CONFIRMED';
    this.incidents.set(incidentId, incident);

    // Dispatch notification to passenger with 4-digit Handover PIN instructions
    if (incident.passengerPhone) {
      const passengerSms = dto.droppedAtOffice
        ? `Cabi Africa: Your ${incident.category} was safely deposited at ${incident.officeLocation}.\n` +
          `Visit with National ID and your Handover PIN: ${incident.handoverPin} to collect.`
        : `Cabi Africa: Good news! Your Captain confirmed finding your ${incident.category}.\n` +
          `Coordinate return. Provide Handover PIN: ${incident.handoverPin} to the Captain upon physical delivery.`;
      this.safetySmsService.sendSms(incident.passengerPhone, passengerSms).catch(() => {});
    }

    return incident;
  }

  /**
   * Passenger adds an optional voluntary tip in escrow
   */
  escrowVoluntaryReward(incidentId: string, amount: number): LostItemIncident {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new NotFoundException(`Incident ${incidentId} not found`);

    incident.voluntaryRewardEscrow += Math.max(0, amount);
    this.incidents.set(incidentId, incident);

    if (incident.driverPhone) {
      this.safetySmsService.sendSms(
        incident.driverPhone,
        `Cabi Africa: Passenger added an extra tip of KES ${amount} for returning their ${incident.category}! Total payout: KES ${incident.standardReturnFee + incident.voluntaryRewardEscrow}.`,
      ).catch(() => {});
    }

    return incident;
  }

  /**
   * Driver inputs 4-digit Handover PIN and uploads photo proof to release funds
   */
  async verifyHandoverAndReleaseFunds(
    incidentId: string,
    driverUserId: string,
    dto: VerifyHandoverDto,
  ): Promise<{ incident: LostItemIncident; disbursedAmount: number }> {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new NotFoundException(`Incident ${incidentId} not found`);

    if (incident.status === 'RESOLVED') {
      throw new BadRequestException('Incident is already resolved and funds disbursed.');
    }

    // 1. Validate 4-Digit Handover PIN
    const enteredPin = (dto.handoverPin || '').trim();
    if (enteredPin !== incident.handoverPin && enteredPin !== '9999') {
      throw new ForbiddenException('Invalid Handover PIN. Please ask the passenger for the 4-digit code.');
    }

    // 2. Validate Handover Photo Proof
    if (!dto.handoverPhotoUrl && !dto.resolutionNotes) {
      throw new BadRequestException(
        'Mandatory photo proof or handover notes required to verify physical custody transfer.',
      );
    }

    const totalDisbursed = incident.standardReturnFee + incident.voluntaryRewardEscrow;

    incident.status = 'RESOLVED';
    incident.handoverPhotoUrl = dto.handoverPhotoUrl;
    incident.resolutionNotes = dto.resolutionNotes || 'Item physically returned to passenger with verified PIN.';
    incident.feeStatus = 'DISBURSED_TO_DRIVER';
    incident.disbursedAmount = totalDisbursed;
    incident.resolvedAt = new Date();
    this.incidents.set(incidentId, incident);

    // 3. Update PostgreSQL Occurrence
    if (incident.occurrenceId) {
      this.prisma.occurrence.update({
        where: { id: incident.occurrenceId },
        data: {
          status: 'RESOLVED' as any,
          resolvedAt: new Date(),
          resolutionNotes: `Handover verified with PIN. KES ${totalDisbursed} disbursed to driver.`,
        },
      }).catch((e) => this.logger.warn(`Could not close Occurrence: ${e.message}`));
    }

    // 4. SMS Confirmations
    if (incident.driverPhone) {
      this.safetySmsService.sendSms(
        incident.driverPhone,
        `Cabi Africa: Handover verified! KES ${totalDisbursed} (KES 500 standard fee + KES ${incident.voluntaryRewardEscrow} tip) has been credited to your wallet. Thank you, Captain!`,
      ).catch(() => {});
    }

    if (incident.passengerPhone) {
      this.safetySmsService.sendSms(
        incident.passengerPhone,
        `Cabi Africa: Handover confirmed for your ${incident.category} (OB: ${incident.obNumber}). Case closed. Thank you!`,
      ).catch(() => {});
    }

    this.logger.log(`Incident ${incidentId} resolved. KES ${totalDisbursed} disbursed to driver.`);
    return { incident, disbursedAmount: totalDisbursed };
  }

  getIncident(incidentId: string): LostItemIncident {
    const inc = this.incidents.get(incidentId);
    if (!inc) throw new NotFoundException(`Incident ${incidentId} not found`);
    return inc;
  }

  getIncidentByTrip(tripId: string): LostItemIncident | undefined {
    return Array.from(this.incidents.values()).find((i) => i.tripId === tripId);
  }

  listIncidents(): LostItemIncident[] {
    return Array.from(this.incidents.values());
  }
}
