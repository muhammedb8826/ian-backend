import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateVendorDto {
    @IsNotEmpty()
    fullName: string;
    
    @IsOptional()
    @IsEmail()
    email: string;

    phone: string;
    company: string;
    address: string;
    reference: string;
    description: string;
}
