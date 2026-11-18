export interface TimeSlotInfo {
    value: string;
    label: string;
    startHour: number;
    startMinute: number;
}

export function getSlotsForDate(dateStr: string): { isClosed: boolean; reason?: string; slots: TimeSlotInfo[] } {
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return { isClosed: true, reason: 'Invalid date selected.', slots: [] };
    }

    const day = parsed.getDay(); // 0 = Sun, 6 = Sat
    if (day === 0) {
        return { isClosed: true, reason: 'Our office is closed on Sundays. Please select Monday–Saturday.', slots: [] };
    }

    // Mon-Fri: 08:00 - 16:00 (last slot 15:30 - 16:00)
    // Sat (half-day): 08:00 - 12:30 (last slot 12:00 - 12:30)
    const endMinutes = day === 6 ? 12 * 60 + 30 : 16 * 60;
    const slots: TimeSlotInfo[] = [];

    for (let mins = 8 * 60; mins + 30 <= endMinutes; mins += 30) {
        const startH = Math.floor(mins / 60);
        const startM = mins % 60;
        const endH = Math.floor((mins + 30) / 60);
        const endM = (mins + 30) % 60;

        const fmt = (h: number, m: number) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 === 0 ? 12 : h % 12;
            return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
        };

        const value = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        const label = `${fmt(startH, startM)} – ${fmt(endH, endM)}`;
        slots.push({ value, label, startHour: startH, startMinute: startM });
    }

    return { isClosed: false, slots };
}

export function buildAppointmentIcs(params: {
    reference: string;
    purpose: string;
    date: string;
    timeSlot: string;
    fullName: string;
    email: string;
    officeLocation: string;
}): string {
    const startPart = params.timeSlot.split('-')[0].trim(); // e.g. "09:30"
    const [hh, mm] = startPart.split(':').map(Number);
    const start = new Date(`${params.date}T${String(hh || 9).padStart(2, '0')}:${String(mm || 0).padStart(2, '0')}:00`);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const toIcsDate = (d: Date) =>
        d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CABI Africa//Appointments//EN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${params.reference}@cabi.africa`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${toIcsDate(start)}`,
        `DTEND:${toIcsDate(end)}`,
        `SUMMARY:CABI Africa Appointment — ${params.purpose}`,
        `DESCRIPTION:Reference: ${params.reference}\\nAttendee: ${params.fullName}\\nPurpose: ${params.purpose}`,
        `LOCATION:${params.officeLocation}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}
