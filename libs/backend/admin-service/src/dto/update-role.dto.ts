export class UpdateRoleDto {
    /**
     * Updated name of the role.
     */
    name?: string;

    displayName?: string;
    description?: string;
    isActive?: boolean;

    /**
     * Updated list of permissions.
     */
    permissions?: string[];
}
