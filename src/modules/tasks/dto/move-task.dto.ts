import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class MoveTaskPositionDto {

@ApiProperty({ 
        example: 'cln123abc456def789', 
        description: 'The unique CUID identifier of the target destination column',
        type: String 
    })
    @IsString()
    @IsNotEmpty()
    columnId!: string;

    @ApiProperty({ 
        example: 2, 
        description: 'The zero-indexed layout array position sequence where the task should land inside the destination column',
        type: Number,
        minimum: 0
    })
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    position!: number;
}