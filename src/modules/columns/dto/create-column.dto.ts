import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateColumnDto {
    @ApiProperty({ example: 'To Do', description: 'The title of the column' })
    @IsString()
    title!: string;

    @ApiProperty({ example: 1, description: 'The order of the column' })
    @IsInt()
    order!: number;
}
