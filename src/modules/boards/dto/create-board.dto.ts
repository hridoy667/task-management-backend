import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateBoardDto {

    @ApiProperty({ example: 'Task Management Board', description: 'The title of the board' })
    @IsString()
    title!: string;
}
