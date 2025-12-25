export class CreateRoleDto {
    /**
     * Human readable name of the role, e.g., "Payouts Manager"
     */
    name: string;

    /**
     * List of permission strings assigned to this role.
     */
    permissions: string[];
}
