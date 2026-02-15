import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(Role)
    role: Role;

    @IsUUID()
    @IsNotEmpty()
    businessId: string;
}
