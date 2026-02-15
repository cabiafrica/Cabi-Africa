import { IsString, IsOptional, IsUUID, IsNotEmpty, IsArray, validate } from 'class-validator';

export class CreateDriverGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  parentGroupId?: string;
}

export class UpdateDriverGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  parentGroupId?: string;
}

export class AssignDriverDto {
  @IsUUID()
  @IsNotEmpty()
  driverId: string;
}

export class PaginationDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}

export class SearchDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;
}