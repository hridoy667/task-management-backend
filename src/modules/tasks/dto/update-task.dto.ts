import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {

    @ApiProperty({ example: 'columnId123', description: 'The ID of the column to which the task belongs', required: false })
    @IsOptional()
    @IsString()
    columnId?: string;
}