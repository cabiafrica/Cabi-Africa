import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class VehicleService {
    private readonly logger = new Logger(VehicleService.name);

    // Mock data store
    private vehicles = [
        { id: 'v1', driverId: 'driver-abc', make: 'Toyota', model: 'Camry', licensePlate: 'KDA 123A', isActive: true },
        { id: 'v2', driverId: 'driver-abc', make: 'Honda', model: 'Fit', licensePlate: 'KDB 456B', isActive: false },
        { id: 'v3', driverId: 'driver-xyz', make: 'Nissan', model: 'Note', licensePlate: 'KDC 789C', isActive: true },
    ];

    setActive(driverId: string, vehicleId: string) {
        this.logger.log(`Attempting to set vehicle ${vehicleId} as active for driver ${driverId}`);

        const driverVehicles = this.vehicles.filter(v => v.driverId === driverId);
        if (driverVehicles.length === 0) {
            throw new NotFoundException(`No vehicles found for driver ${driverId}`);
        }

        const targetVehicle = driverVehicles.find(v => v.id === vehicleId);
        if (!targetVehicle) {
            throw new ForbiddenException(`Vehicle ${vehicleId} does not belong to driver ${driverId}`);
        }

        // Set all of this driver's vehicles to inactive
        driverVehicles.forEach(v => v.isActive = false);

        // Set the target vehicle to active
        targetVehicle.isActive = true;

        this.logger.log(`Vehicle ${vehicleId} is now active for driver ${driverId}`);
        return { success: true };
    }

    getActiveVehicleForDriver(driverId: string) {
        this.logger.log(`Fetching active vehicle for driver ${driverId}`);
        const activeVehicle = this.vehicles.find(v => v.driverId === driverId && v.isActive);

        if (!activeVehicle) {
            this.logger.warn(`No active vehicle found for driver ${driverId}.`);
            return null;
        }

        return activeVehicle;
    }
}