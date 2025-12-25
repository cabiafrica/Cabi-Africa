import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data
    const stats = {
        activeDrivers: Math.floor(Math.random() * 500) + 1200,
        completedTrips: Math.floor(Math.random() * 1000) + 45000,
        happyPassengers: Math.floor(Math.random() * 500) + 8500
    };

    return NextResponse.json(stats);
}
