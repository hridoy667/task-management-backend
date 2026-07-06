import { Transform } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class cursorPaginationDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @IsInt()
    limit?: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}