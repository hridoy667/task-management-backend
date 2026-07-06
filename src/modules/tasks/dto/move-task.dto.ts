import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class MoveTaskPositionDto {
    @IsString()
    @IsNotEmpty()
    columnId!: string;

    @IsInt()
    @IsNotEmpty()
    position!: number;
}