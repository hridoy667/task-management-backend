import { ApiProperty } from "@nestjs/swagger";
import { Priority } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
    @ApiProperty({ example: 'Implement authentication', description: 'The title of the task' })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiProperty({ example: 'Implement the authentication logic for the application', description: 'The description of the task' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: Priority.MEDIUM, description: 'The priority of the task' })
    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @ApiProperty({ example: '2023-12-31', description: 'The due date of the task' })
    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @ApiProperty({ example: 1, description: 'The position of the task' })
    @IsInt()
    @IsNotEmpty()
    position!: number;

    @ApiProperty({ example: 'user-123', description: 'The ID of the user assigned to the task' })
    @IsOptional()
    @IsString()
    assigneeId?: string;

    @ApiProperty({ example: ['label-1', 'label-2'], description: 'The labels associated with the task' })
    @IsOptional()
    @IsString({ each: true }) 
    labels?: string[];
}