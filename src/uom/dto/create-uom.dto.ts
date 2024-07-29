export class CreateUomDto {
    name: string;
    abbreviation: string;
    conversionRate: number;
    baseUnit: boolean;
    unitCategoryId: string;
    attributes: {
        name: string;
        value: string;
    }[];
}
