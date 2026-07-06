import { Priority } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsInt()
    @IsNotEmpty()
    position!: number;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @IsString({ each: true }) 
    labels?: string[];
}