import { IsEmail, IsString } from 'class-validator';

export class LoginRecoveryDto {
    @IsEmail()
    email: string;

    @IsString()
    recoveryCode: string;
}
