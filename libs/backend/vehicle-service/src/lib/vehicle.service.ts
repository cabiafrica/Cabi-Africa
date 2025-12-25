import { Injectable } from '@nestjs/common';

export interface Vehicle {
    id: string;
    driverId: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    vehicleType: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';
    isActive: boolean;
    createdAt: Date;
    verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'; // Story 23.2
}

@Injectable()
export class VehicleService {
    private vehicles: Vehicle[] = [];

    constructor() {
        // Seed data
        this.vehicles.push({
            id: 'veh_1',
            driverId: 'driver_bob',
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Silver',
            licensePlate: 'ABC123',
            vehicleType: 'SEDAN',
            isActive: true,
            createdAt: new Date()
        });
    }

    async addVehicle(data: Omit<Vehicle, 'id' | 'isActive' | 'createdAt'>) {
        const newVehicle: Vehicle = {
            ...data,
            id: `veh_${Date.now()}`,
            isActive: false, // New vehicles start inactive
            createdAt: new Date()
        };

        this.vehicles.push(newVehicle);
        console.log(`[VehicleService] Vehicle added: ${newVehicle.make} ${newVehicle.model} for driver ${newVehicle.driverId}`);
        return newVehicle;
    }

    async getDriverVehicles(driverId: string) {
        return this.vehicles
            .filter(v => v.driverId === driverId)
            .sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
    }

    async getActiveVehicle(driverId: string) {
        return this.vehicles.find(v => v.driverId === driverId && v.isActive);
    }

    async setActiveVehicle(driverId: string, vehicleId: string) {
        // Deactivate all vehicles for this driver
        this.vehicles.forEach(v => {
            if (v.driverId === driverId) {
                v.isActive = false;
            }
        });

        // Activate the selected vehicle
        const vehicle = this.vehicles.find(v => v.id === vehicleId && v.driverId === driverId);
        if (!vehicle) throw new Error('Vehicle not found');

        vehicle.isActive = true;
        console.log(`[VehicleService] Active vehicle set: ${vehicle.make} ${vehicle.model} for driver ${driverId}`);
        return vehicle;
    }

    async updateVehicle(vehicleId: string, updates: Partial<Vehicle>) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) throw new Error('Vehicle not found');

        Object.assign(vehicle, updates);
        return vehicle;
    }

    async deleteVehicle(vehicleId: string, driverId: string) {
        const index = this.vehicles.findIndex(v => v.id === vehicleId && v.driverId === driverId);
        if (index === -1) throw new Error('Vehicle not found');

        const vehicle = this.vehicles[index];
        if (vehicle.isActive) {
            throw new Error('Cannot delete active vehicle. Please activate another vehicle first.');
        }

        this.vehicles.splice(index, 1);
        return { success: true };
    }

    async getVehicleById(vehicleId: string) {
        return this.vehicles.find(v => v.id === vehicleId);
    }

    // Story 23.2: Vehicle Documents
    private vehicleDocs = new Map<string, any[]>();

    async uploadVehicleDocument(vehicleId: string, type: string, url: string) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) throw new Error('Vehicle not found');

        const docs = this.vehicleDocs.get(vehicleId) || [];
        docs.push({ type, url, status: 'PENDING', uploadedAt: new Date() });
        this.vehicleDocs.set(vehicleId, docs);

        return { success: true };
    }

    async getVehicleDocuments(vehicleId: string) {
        return this.vehicleDocs.get(vehicleId) || [];
    }

    async adminUpdateVehicleStatus(vehicleId: string, status: 'VERIFIED' | 'REJECTED') {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) throw new Error('Vehicle not found');
        vehicle.verificationStatus = status;
        return vehicle;
    }

    // Story 23.4: Maintenance
    async checkMaintenance(vehicleId: string) {
        return { due: false, mileage: 12000, nextService: 15000 };
    }
}
