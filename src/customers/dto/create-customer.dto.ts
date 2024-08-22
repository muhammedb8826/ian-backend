export class CreateCustomerDto {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    address: string;
    description?: string;
}
