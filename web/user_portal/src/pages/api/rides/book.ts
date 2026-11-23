import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { isValidContactPhone } from '@/config/contactConfig';
import { extractCallerUser } from '@/lib/serverAuth';

function normalizeVehicleType(vehicleType?: string): 'STANDARD' | 'PREMIUM' | 'XL' | 'BODA' {
    const raw = (vehicleType || 'STANDARD').toUpperCase();
    if (raw.includes('BODA')) return 'BODA';
    if (raw.includes('EXECUTIVE') || raw.includes('PREMIUM')) return 'PREMIUM';
    if (raw.includes('XL') || raw.includes('DIPLOMATIC')) return 'XL';
    return 'STANDARD';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { pickupLocation, dropoffLocation, vehicleType, fare, passengerId, verification, requestedFor } = req.body ?? {};
    const caller = extractCallerUser(req);

    const hasValidVerification =
        verification &&
        verification.verified === true &&
        typeof verification.name === 'string' &&
        verification.name.trim().length >= 2 &&
        typeof verification.phone === 'string' &&
        isValidContactPhone(verification.phone) &&
        typeof verification.code === 'string' &&
        /^\d{4,6}$/.test(verification.code.trim());

    if (!caller && !hasValidVerification) {
        return res.status(401).json({
            message: 'Please complete passenger verification or sign in to confirm your trip.',
        });
    }

    if (!pickupLocation || !dropoffLocation || !vehicleType) {
        return res.status(400).json({ message: 'Missing required pickup, drop-off, or vehicle tier.' });
    }

    const numericFare = Number(fare ?? 0);
    if (!Number.isFinite(numericFare) || numericFare < 0) {
        return res.status(400).json({ message: 'Fare must be a valid non-negative number' });
    }

    let resolvedPassengerId =
        caller && (caller.role === 'ADMIN' || caller.role === 'DISPATCHER')
            ? passengerId || caller.sub || caller.id
            : caller?.sub || caller?.id || passengerId;

    // Ensure verified web passengers have a real database User record before creating a ride
    if (!resolvedPassengerId && hasValidVerification) {
        try {
            const cleanPhone = verification.phone.trim();
            const cleanName = verification.name.trim();
            const existingUser = await prisma.user.findUnique({ where: { phone: cleanPhone } });
            if (existingUser) {
                resolvedPassengerId = existingUser.id;
            } else {
                const emailSlug = cleanPhone.replace(/[^0-9]/g, '');
                const createdUser = await prisma.user.create({
                    data: {
                        fullName: cleanName,
                        phone: cleanPhone,
                        email: `rider.${emailSlug}.${Date.now()}@cabi.africa`,
                        password: '',
                        role: 'PASSENGER',
                        isPhoneVerified: true,
                        isVerifiedPassenger: true,
                        status: 'ACTIVE',
                    },
                });
                resolvedPassengerId = createdUser.id;
            }
        } catch (dbUserErr) {
            console.warn('Could not resolve or create passenger user in Prisma:', (dbUserErr as Error).message);
        }
    }

    // 1. Try creating ride via dispatch-service
    try {
        const rawDispatchUrl =
            process.env.DISPATCH_SERVICE_URL ||
            process.env.NEXT_PUBLIC_DISPATCH_SERVICE_URL ||
            (process.env.NODE_ENV === 'production'
                ? 'https://cabi.africa/api'
                : 'http://127.0.0.1:3334/api');
        const cleanBaseUrl = rawDispatchUrl.replace(/\/+$/, '');
        const targetUrl = cleanBaseUrl.endsWith('/api') ? `${cleanBaseUrl}/rides` : `${cleanBaseUrl}/api/rides`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                passengerId: resolvedPassengerId || 'guest',
                pickupLocation,
                dropoffLocation,
                vehicleType: normalizeVehicleType(vehicleType),
                fare: numericFare,
                isVerifiedPassenger: true,
                verificationMethod: verification?.method || 'PHONE_OTP',
            }),
        });

        if (response.ok) {
            const ride = await response.json();
            return res.status(201).json(ride);
        }

        const errorData = await response.json().catch(() => ({}));
        console.warn('Dispatch service returned non-OK response:', response.status, errorData);
    } catch (error) {
        console.warn('Dispatch service unreachable, attempting direct database persistence:', (error as Error).message);
    }

    // 2. Direct Prisma persistence (real database record, status REQUESTED, driver null)
    if (resolvedPassengerId) {
        try {
            const tripCode = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
            const normalizedRequestedFor =
                requestedFor &&
                typeof requestedFor.name === 'string' &&
                requestedFor.name.trim().length >= 2 &&
                typeof requestedFor.phone === 'string' &&
                isValidContactPhone(requestedFor.phone)
                    ? { name: requestedFor.name.trim(), phone: requestedFor.phone.trim() }
                    : undefined;

            const pickupPayload =
                typeof pickupLocation === 'string'
                    ? { address: pickupLocation, tripCode, ...(normalizedRequestedFor ? { requestedFor: normalizedRequestedFor } : {}) }
                    : { ...pickupLocation, tripCode, ...(normalizedRequestedFor ? { requestedFor: normalizedRequestedFor } : {}) };
            const dropoffPayload =
                typeof dropoffLocation === 'string'
                    ? { address: dropoffLocation }
                    : dropoffLocation;

            const ride = await prisma.ride.create({
                data: {
                    passengerId: resolvedPassengerId,
                    pickupLocation: pickupPayload,
                    dropoffLocation: dropoffPayload,
                    status: 'REQUESTED',
                    requestedVehicleType: normalizeVehicleType(vehicleType),
                    matchingStartedAt: new Date(),
                    fare: numericFare,
                    distance: 0,
                    duration: 0,
                },
            });
            return res.status(201).json({ ...ride, tripCode });
        } catch (dbRideErr) {
            console.error('Database ride persistence failed:', (dbRideErr as Error).message);
        }
    }

    return res.status(503).json({
        message: 'Dispatch service is currently unavailable. Please ensure dispatch backend connectivity and try again.',
    });
}
