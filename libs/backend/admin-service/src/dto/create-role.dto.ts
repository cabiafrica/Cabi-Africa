import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
    /**
     * Unique name of the role (system identifier), e.g., "PAYOUTS_MANAGER"
     */
    @IsString()
    name: string;

    /**
     * Human readable name, e.g., "Payouts Manager"
     */
    @IsOptional()
    @IsString()
    displayName?: string;

    /**
     * Detailed description of what this role does
     */
    @IsOptional()
    @IsString()
    description?: string;

    /**
     * The type/category of role (e.g. ADMIN, DISPATCHER)
     */
    @IsOptional()
    @IsString()
    type?: string;

    /**
     * The platform this role applies to (Admin Panel, Dispatch Panel, etc.)
     */
    @IsOptional()
    @IsString()
    platform?: string;

    /**
     * List of permission strings assigned to this role.
     */
    @IsArray()
    @IsString({ each: true })
    permissions: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
