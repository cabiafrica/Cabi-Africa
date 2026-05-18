import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { vehicleId, driverProfileId } = req.body;

    if (!vehicleId || !driverProfileId) {
        return res.status(400).json({ success: false, message: 'Vehicle ID and Driver Profile ID are required' });
    }

    try {
        // Strict Mutual Exclusivity Check #1: Check if driver is currently on an active shift on ANY vehicle
        const activeDriverShift = await prisma.vehicleShift.findFirst({
            where: {
                driverProfileId,
                status: 'ACTIVE'
            },
            include: {
                vehicle: {
                    select: { plateNumber: true, make: true, model: true }
                }
            }
        });

        if (activeDriverShift) {
            return res.status(409).json({
                success: false,
                code: 'DRIVER_ALREADY_ACTIVE',
                message: `You are already on an active shift with vehicle ${activeDriverShift.vehicle.plateNumber} (${activeDriverShift.vehicle.make} ${activeDriverShift.vehicle.model}). Please end your current shift before starting a new one.`,
                currentShift: activeDriverShift
            });
        }

        // Strict Mutual Exclusivity Check #2: Check if vehicle is currently actively in use by ANY driver
        const activeVehicleShift = await prisma.vehicleShift.findFirst({
            where: {
                vehicleId,
                status: 'ACTIVE'
            },
            include: {
                driver: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                }
            }
        });

        if (activeVehicleShift) {
            const driverName = activeVehicleShift.driver.user?.fullName || 'Another driver';
            return res.status(409).json({
                success: false,
                code: 'VEHICLE_IN_USE',
                message: `This vehicle is currently in an active shift operated by ${driverName}. Only one driver can operate a vehicle at a time.`,
                currentShift: activeVehicleShift
            });
        }

        // Both mutual exclusivity checks passed! Create the active shift.
        const newShift = await prisma.vehicleShift.create({
            data: {
                vehicleId,
                driverProfileId,
                status: 'ACTIVE',
                startedAt: new Date()
            },
            include: {
                vehicle: true,
                driver: {
                    include: { user: { select: { fullName: true } } }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Shift started successfully',
            shift: newShift
        });

    } catch (error: any) {
        console.error('Error starting shift:', error);
        return res.status(500).json({ success: false, message: 'Internal server error starting shift', error: error.message });
    }
}
