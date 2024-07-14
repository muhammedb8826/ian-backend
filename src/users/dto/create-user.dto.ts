import { Role } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    confirm_password: string;

    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsNotEmpty()
    @IsString()
    middle_name: string;
    last_name: string;

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    phone: string;

    address: string;
    roles: Role;
    profile: string;
    machinePermissions: [];
    isActive: boolean;
}
