import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBoardDto {

    @ApiProperty({ example: 'Task Management Board', description: 'The title of the board' })
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    title!: string;
}
