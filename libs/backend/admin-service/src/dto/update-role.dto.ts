import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
    /**
     * Updated name of the role.
     */
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    /**
     * Updated list of permissions.
     */
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}
