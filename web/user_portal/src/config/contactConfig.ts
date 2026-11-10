/**
 * Centralized Contact details, support issue categories, and appointment slots.
 */
export const CONTACT_INFO = {
    phoneDisplay: '+254 756 777 222',
    phoneDial: '+254756777222',
    email: 'cabifastafrica@gmail.com',
    officeName: 'Nairobi Hub (HQ) • Westlands & CBD',
    officeHours: 'Mon – Sat • 8:00 AM – 6:00 PM EAT',
    appointmentPath: '/appointments',
} as const;

export const CONTACT_ISSUE_OPTIONS = [
    'Ride Booking or Fare Inquiry',
    'Lost Item in Vehicle',
    'Driver or Safety Concern',
    'M-Pesa Payment & Receipt Issue',
    'Corporate Travel Account Inquiry',
    'Driver / Fleet Partner Onboarding',
    'Account Verification & App Support',
    'Partnership / Other Inquiry',
] as const;

export type ContactIssueOption = (typeof CONTACT_ISSUE_OPTIONS)[number];

export const APPOINTMENT_PURPOSES = [
    'Driver Onboarding & Document Verification',
    'Fleet & Vehicle Inspection',
    'Corporate Travel Partnership',
    'Lost & Found Collection',
    'General Support Consultation',
] as const;

export const APPOINTMENT_TIME_SLOTS = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM',
] as const;

export function isValidContactPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^\+?\d{9,15}$/.test(cleaned);
}
