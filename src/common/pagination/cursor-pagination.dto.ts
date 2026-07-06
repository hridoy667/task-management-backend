import { IsInt, IsOptional, IsString } from "class-validator";

export class cursorPaginationDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @IsInt()
    limit?: number;
}