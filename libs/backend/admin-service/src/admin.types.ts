
export interface AdminUser {
    id: string;
    email: string;
    roles: string[]; // Role Names
    directGrants: string[]; // Permission Enums
    directRevokes: string[]; // Permission Enums
    suspensionReason?: string;
    suspensionDate?: string;
}

export type Permission = string;
