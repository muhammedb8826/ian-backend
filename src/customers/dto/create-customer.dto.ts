import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateCustomerDto {
    id: string;

    @IsNotEmpty()
    fullName: string;
    
    @IsOptional()
    email: string;

    @IsNotEmpty()
    phone: string;

    company?: string;
    address: string;
    description?: string;
}
