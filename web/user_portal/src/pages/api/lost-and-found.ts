import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { extractCallerUser } from '@/lib/serverAuth';

const STORE_KEY = 'lost_and_found:items';

function maskPhoneNumber(phone?: string): string {
    if (!phone) return '';
    const clean = phone.trim();
    if (clean.length <= 5) return '***';
    const prefix = clean.slice(0, 4);
    const suffix = clean.slice(-2);
    return `${prefix}****${suffix}`;
}

async function loadItems(): Promise<any[]> {
    try {
        const record = await prisma.setting.findUnique({ where: { key: STORE_KEY } });
        return record ? (typeof record.value === 'string' ? JSON.parse(record.value) : record.value) as any[] : [];
    } catch {
        return [];
    }
}

async function saveItems(items: any[]): Promise<void> {
    await prisma.setting.upsert({
        where: { key: STORE_KEY },
        update: { value: JSON.stringify(items) },
        create: { key: STORE_KEY, value: JSON.stringify(items) },
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const caller = extractCallerUser(req);
    const isAdminOrDispatcher = caller && (caller.role === 'ADMIN' || caller.role === 'DISPATCHER');

    if (req.method === 'GET') {
        const items = await loadItems();

        // Sanitize items: mask PII unless caller is Admin/Dispatcher
        const sanitizedItems = items.map((item) => {
            const isOwner = caller && (item.userId === caller.sub || item.userId === caller.id || item.contactPhone === caller.phone);
            if (isAdminOrDispatcher || isOwner) {
                return item;
            }
            return {
                ...item,
                contactPhone: maskPhoneNumber(item.contactPhone),
                // Hide private communications history from unauthenticated public
                communications: (item.communications || []).length > 0 ? [{ message: 'Updates registered with dispatch desk.', sentAt: item.createdAt }] : [],
            };
        });

        return res.status(200).json({ success: true, items: sanitizedItems });
    }

    if (req.method === 'POST') {
        const { description, reporterRole = 'PASSENGER', contactPhone, tripCode, droppedAtOffice = false } = req.body ?? {};
        if (typeof description !== 'string' || description.trim().length < 3) {
            return res.status(400).json({ success: false, message: 'Please provide a short description of the item.' });
        }

        const cleanPhone = String(contactPhone || caller?.phone || '').trim();
        const now = new Date();
        const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const obNumber = `OB-LOST-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

        const item = {
            id: `LF-${Date.now().toString().slice(-6)}`,
            userId: caller ? caller.sub || caller.id : undefined,
            obNumber,
            description: description.trim(),
            reporterRole: String(reporterRole).toUpperCase(),
            contactPhone: cleanPhone,
            tripCode: typeof tripCode === 'string' ? tripCode.trim() : '',
            droppedAtOffice: Boolean(droppedAtOffice),
            status: droppedAtOffice ? 'AT_OFFICE_AWAITING_COLLECTION' : 'REPORTED',
            createdAt: now.toISOString(),
            collectionDeadline: deadline.toISOString(),
            communications: [] as Array<{ message: string; sentAt: string }>,
        };

        // Link with ride and record in official Occurrence Book
        try {
            let rideRecord = null;
            if (item.tripCode) {
                rideRecord = await prisma.ride.findFirst({
                    where: {
                        OR: [
                            { tripCode: item.tripCode },
                            { id: item.tripCode },
                        ],
                    },
                });
            }

            // Find valid registeredById (admin or passenger)
            const adminUser = await prisma.user.findFirst({
                where: { role: 'ADMIN' },
                select: { id: true },
            });
            const registeredById = adminUser?.id || rideRecord?.passengerId || caller?.sub || '00000000-0000-0000-0000-000000000000';

            await prisma.occurrence.create({
                data: {
                    obNumber,
                    category: 'PROPERTY_DAMAGE',
                    severity: 'LOW',
                    title: `Lost Property: ${item.description.slice(0, 60)}`,
                    description: `Lost & found property reported by ${item.reporterRole}. Details: "${item.description}". ${
                        item.droppedAtOffice ? 'Item handed over to Cabi Office.' : 'Awaiting retrieval/driver coordination.'
                    }`,
                    rideId: rideRecord?.id || null,
                    driverId: rideRecord?.driverId || null,
                    passengerId: rideRecord?.passengerId || null,
                    occurrenceDate: now,
                    occurrenceTime: now,
                    occurredAt: now,
                    source: `${item.reporterRole}_LOST_PROPERTY`,
                    registeredById,
                    status: item.droppedAtOffice ? 'UNDER_INVESTIGATION' : 'OPEN',
                    tags: ['LOST_PROPERTY', item.id, item.droppedAtOffice ? 'OFFICE_CUSTODY' : 'IN_TRANSIT'],
                },
            });
        } catch (occErr: any) {
            console.error('Failed to create Occurrence record for lost item:', occErr.message);
        }

        const items = await loadItems();
        items.unshift(item);
        await saveItems(items);

        return res.status(201).json({
            success: true,
            item,
            obNumber,
            message: `Lost & Found report submitted [${obNumber}]. Items at the office must be collected within 7 days.`,
        });
    }

    if (req.method === 'PATCH') {
        const { id, communicationMessage, status } = req.body ?? {};
        if (!id) {
            return res.status(400).json({ success: false, message: 'Item id is required.' });
        }

        const items = await loadItems();
        const idx = items.findIndex((i) => i.id === id);
        if (idx === -1) {
            return res.status(404).json({ success: false, message: 'Lost & Found item not found.' });
        }

        const item = items[idx];
        const isOwner = caller && (item.userId === caller.sub || item.userId === caller.id || item.contactPhone === caller.phone);

        if (!isAdminOrDispatcher && !isOwner) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to update this report.' });
        }

        if (typeof communicationMessage === 'string' && communicationMessage.trim()) {
            items[idx].communications = items[idx].communications || [];
            items[idx].communications.push({
                message: communicationMessage.trim(),
                sentAt: new Date().toISOString(),
            });
            items[idx].status = 'EXTENSION_COMMUNICATED';
        }
        if (status && isAdminOrDispatcher) {
            items[idx].status = String(status);
        }

        await saveItems(items);
        return res.status(200).json({ success: true, item: items[idx] });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
