/**
 * Cabi Africa Corporate Mobility Migration & CSV Parser Utility
 * 
 * Supports automatic header detection and preset schema normalization for:
 * - Cabi Africa Standard Format
 * - Uber for Business Roster Export
 * - Bolt for Business Employee Export
 * - Little Cab Corporate Staff Roster
 * - Generic CSV with heuristic column detection
 */

export interface ParsedEmployeeRow {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    role: 'ADMIN' | 'BILLING_LEAD' | 'EMPLOYEE';
    employeeNumber?: string;
    monthlyLimit?: number;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sourcePlatform: 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB' | 'GENERIC';
}

export interface ParseResult {
    rows: ParsedEmployeeRow[];
    totalRows: number;
    validCount: number;
    errorCount: number;
    detectedPlatform: 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB' | 'GENERIC';
    headersFound: string[];
}

/**
 * Normalizes phone numbers to standard international format (e.g., +254...)
 */
export function normalizePhone(rawPhone: string): string {
    if (!rawPhone) return '';
    const cleaned = rawPhone.replace(/[\s\-().]/g, '').trim();

    // Already in +254 or international format
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // Kenyan local formats: 0712345678, 0112345678 -> +254712345678
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        return '+254' + cleaned.slice(1);
    }

    // 254712345678 -> +254712345678
    if (cleaned.startsWith('254') && cleaned.length === 12) {
        return '+' + cleaned;
    }

    // Default prepend + if digits look international
    if (/^\d{9,15}$/.test(cleaned)) {
        return '+' + cleaned;
    }

    return cleaned;
}

/**
 * Splits CSV string handling quoted fields with commas
 */
function parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
}

/**
 * Detects which platform exported the CSV based on characteristic header signatures
 */
export function detectPlatformFormat(headers: string[]): 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB' | 'GENERIC' {
    const headerStr = headers.map(h => h.toLowerCase()).join(' | ');

    if (headerStr.includes('program') || (headerStr.includes('first name') && headerStr.includes('expense code')) || (headerStr.includes('uber') || headerStr.includes('uuid'))) {
        return 'UBER_BUSINESS';
    }

    if (headerStr.includes('work email') || (headerStr.includes('group') && headerStr.includes('monthly limit'))) {
        return 'BOLT_BUSINESS';
    }

    if (headerStr.includes('staff name') || headerStr.includes('cost center') || headerStr.includes('little')) {
        return 'LITTLE_CAB';
    }

    if (headerStr.includes('cabi') || (headerStr.includes('full name') && headerStr.includes('department') && headerStr.includes('role'))) {
        return 'CABI';
    }

    return 'GENERIC';
}

/**
 * Core Parser: Parses CSV text content into structured, validated employee rows
 */
export function parseMigrationCsv(
    csvText: string,
    forcedPlatform?: 'AUTO' | 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB' | 'GENERIC',
    defaults?: { department?: string; defaultLimit?: number }
): ParseResult {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length < 2) {
        return {
            rows: [],
            totalRows: 0,
            validCount: 0,
            errorCount: 0,
            detectedPlatform: 'GENERIC',
            headersFound: []
        };
    }

    const rawHeaders = parseCsvLine(lines[0]);
    const cleanHeaders = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    let platform: 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB' | 'GENERIC' = 'GENERIC';
    if (!forcedPlatform || forcedPlatform === 'AUTO') {
        platform = detectPlatformFormat(rawHeaders);
    } else {
        platform = forcedPlatform;
    }

    // Column indices mapping
    let nameIdx = -1;
    let firstNameIdx = -1;
    let lastNameIdx = -1;
    let emailIdx = -1;
    let phoneIdx = -1;
    let deptIdx = -1;
    let roleIdx = -1;
    let empIdIdx = -1;
    let limitIdx = -1;

    cleanHeaders.forEach((h, idx) => {
        if (h === 'fullname' || h === 'name' || h === 'staffname' || h === 'employeename') {
            nameIdx = idx;
        } else if (h === 'firstname' || h === 'fname') {
            firstNameIdx = idx;
        } else if (h === 'lastname' || h === 'surname' || h === 'lname') {
            lastNameIdx = idx;
        } else if (h.includes('email') || h === 'workemail' || h === 'businessemail') {
            emailIdx = idx;
        } else if (h.includes('phone') || h.includes('mobile') || h.includes('tel') || h === 'contact') {
            phoneIdx = idx;
        } else if (h.includes('dept') || h.includes('department') || h.includes('group') || h.includes('costcenter') || h.includes('program')) {
            deptIdx = idx;
        } else if (h.includes('role') || h.includes('title') || h.includes('tier')) {
            roleIdx = idx;
        } else if (h.includes('staffid') || h.includes('empid') || h.includes('employeenumber') || h.includes('badge')) {
            empIdIdx = idx;
        } else if (h.includes('limit') || h.includes('budget') || h.includes('allowance') || h.includes('cap')) {
            limitIdx = idx;
        }
    });

    // Fallbacks if specific detection missed
    if (nameIdx === -1 && firstNameIdx !== -1 && lastNameIdx !== -1) {
        // Will combine first and last
    } else if (nameIdx === -1 && cleanHeaders.length > 0) {
        nameIdx = 0; // Default first column
    }

    if (emailIdx === -1) {
        emailIdx = cleanHeaders.findIndex(h => h.includes('mail'));
    }
    if (phoneIdx === -1) {
        phoneIdx = cleanHeaders.findIndex(h => h.includes('phone') || h.includes('mob'));
    }

    const rows: ParsedEmployeeRow[] = [];
    let validCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.every(v => v.trim() === '')) continue; // Skip empty row

        const errors: string[] = [];
        const warnings: string[] = [];

        // Extract Name
        let fullName = '';
        if (firstNameIdx !== -1 && lastNameIdx !== -1) {
            const first = values[firstNameIdx] || '';
            const last = values[lastNameIdx] || '';
            fullName = `${first} ${last}`.trim();
        } else if (nameIdx !== -1) {
            fullName = (values[nameIdx] || '').trim();
        }

        if (!fullName) {
            errors.push('Missing employee full name');
        }

        // Extract Email
        const email = (emailIdx !== -1 && values[emailIdx]) ? values[emailIdx].trim().toLowerCase() : '';
        if (!email) {
            errors.push('Missing work email address');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push(`Invalid email format: "${email}"`);
        }

        // Extract Phone
        const rawPhone = (phoneIdx !== -1 && values[phoneIdx]) ? values[phoneIdx].trim() : '';
        const phone = normalizePhone(rawPhone);
        if (!phone) {
            warnings.push('No phone number provided; user can link phone later on app sign-in');
        } else if (phone.length < 9) {
            warnings.push(`Phone number "${rawPhone}" might be incomplete`);
        }

        // Department
        let department = (deptIdx !== -1 && values[deptIdx]) ? values[deptIdx].trim() : '';
        if (!department) {
            department = defaults?.department || 'General';
        }

        // Role
        let role: 'ADMIN' | 'BILLING_LEAD' | 'EMPLOYEE' = 'EMPLOYEE';
        if (roleIdx !== -1 && values[roleIdx]) {
            const rawRole = values[roleIdx].toUpperCase().trim();
            if (rawRole.includes('ADMIN')) role = 'ADMIN';
            else if (rawRole.includes('BILLING') || rawRole.includes('FINANCE') || rawRole.includes('MANAGER')) role = 'BILLING_LEAD';
        }

        // Employee Number
        const employeeNumber = (empIdIdx !== -1 && values[empIdIdx]) ? values[empIdIdx].trim() : undefined;

        // Spending Limit
        let monthlyLimit: number | undefined = defaults?.defaultLimit || 35000;
        if (limitIdx !== -1 && values[limitIdx]) {
            const parsedNum = Number(values[limitIdx].replace(/[^0-9.]/g, ''));
            if (!isNaN(parsedNum) && parsedNum > 0) {
                monthlyLimit = parsedNum;
            }
        }

        const isValid = errors.length === 0;
        if (isValid) validCount++;
        else errorCount++;

        rows.push({
            id: `row-${i}-${Date.now().toString(36)}`,
            fullName: fullName || 'Unknown Member',
            email,
            phone: phone || '+254',
            department,
            role,
            employeeNumber,
            monthlyLimit,
            isValid,
            errors,
            warnings,
            sourcePlatform: platform
        });
    }

    return {
        rows,
        totalRows: rows.length,
        validCount,
        errorCount,
        detectedPlatform: platform,
        headersFound: rawHeaders
    };
}

/**
 * Pre-baked sample CSV template generator
 */
export function generateSampleCsv(format: 'CABI' | 'UBER_BUSINESS' | 'BOLT_BUSINESS' | 'LITTLE_CAB' = 'CABI'): string {
    switch (format) {
        case 'UBER_BUSINESS':
            return `First Name,Last Name,Email,Mobile Phone,Group / Program,Expense Code\nJane,Wanjiku,jane.w@enterprise.co.ke,+254711223344,Executive Travel,EXP-EXEC-01\nPeter,Kamau,peter.k@enterprise.co.ke,+254722334455,Sales & Field,EXP-SALES-02\nAmina,Hassan,amina.h@enterprise.co.ke,+254733445566,Engineering,EXP-TECH-04\nMichael,Otieno,michael.o@enterprise.co.ke,+254744556677,Operations,EXP-OPS-03`;

        case 'BOLT_BUSINESS':
            return `Name,Work Email,Phone Number,Group,Monthly Limit\nJane Wanjiku,jane.w@enterprise.co.ke,+254711223344,Management,50000\nPeter Kamau,peter.k@enterprise.co.ke,+254722334455,Sales,35000\nAmina Hassan,amina.h@enterprise.co.ke,+254733445566,Product,30000\nMichael Otieno,michael.o@enterprise.co.ke,+254744556677,Logistics,25000`;

        case 'LITTLE_CAB':
            return `Staff Name,Email,Mobile,Cost Center,Staff ID\nJane Wanjiku,jane.w@enterprise.co.ke,0711223344,HQ Executive,EMP-101\nPeter Kamau,peter.k@enterprise.co.ke,0722334455,Commercial Sales,EMP-102\nAmina Hassan,amina.h@enterprise.co.ke,0733445566,Technology,EMP-103\nMichael Otieno,michael.o@enterprise.co.ke,0744556677,Client Support,EMP-104`;

        case 'CABI':
        default:
            return `Full Name,Email,Phone,Department,Role,Monthly Limit,Employee ID\nJane Wanjiku,jane.w@enterprise.co.ke,+254711223344,Executive,ADMIN,60000,CABI-001\nPeter Kamau,peter.k@enterprise.co.ke,+254722334455,Sales & Growth,EMPLOYEE,40000,CABI-002\nAmina Hassan,amina.h@enterprise.co.ke,+254733445566,Engineering,EMPLOYEE,35000,CABI-003\nMichael Otieno,michael.o@enterprise.co.ke,+254744556677,Finance,BILLING_LEAD,45000,CABI-004`;
    }
}
