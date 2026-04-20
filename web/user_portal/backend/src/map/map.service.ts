import { Injectable, Logger } from '@nestjs/common';

export enum VehicleType {
  EBIKE = 'ebike',
  SCOOTER = 'scooter',
}

export interface MicromobilityVehicle {
  id: string;
  type: VehicleType;
  lat: number;
  lon: number;
  batteryLevel: number; // As a percentage, e.g., 85
}

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);

  // Mock data simulating a response from a partner's API
  private mockVehicles: MicromobilityVehicle[] = [];

  /**
   * Fetches available micromobility vehicles within a given map area.
   * In a real app, this would take map bounds and make an API call to a partner.
   * @returns A list of available e-bikes and scooters.
   */
  async getAvailableMicromobilityVehicles(): Promise<MicromobilityVehicle[]> {
    this.logger.log('Fetching available micromobility vehicles from partner API...');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return this.mockVehicles;
  }
}