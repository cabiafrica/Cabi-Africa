import { IsString, IsPhoneNumber } from 'class-validator';

export class InitiateForgotEmailDto {
    @IsString()
    @IsPhoneNumber()
    phone: string;
}
