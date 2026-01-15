export class CreateRoleDto {
    /**
     * Unique name of the role (system identifier), e.g., "PAYOUTS_MANAGER"
     */
    name: string;

    /**
     * Human readable name, e.g., "Payouts Manager"
     */
    displayName?: string;

    /**
     * Detailed description of what this role does
     */
    description?: string;

    /**
     * The type/category of role (e.g. ADMIN, DISPATCHER)
     */
    type?: string;

    /**
     * The platform this role applies to (Admin Panel, Dispatch Panel, etc.)
     */
    platform?: string;

    /**
     * List of permission strings assigned to this role.
     */
    permissions: string[];

    isActive?: boolean;
}
