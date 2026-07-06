// src/modules/tasks/tasks.controller.ts
import { Body, Controller, Param, Post, Patch, Delete, UseGuards } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { MoveTaskPositionDto } from "./dto/move-task.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}
    
    @Post('columns/:id/tasks')
    async create(@Param('id') columnId: string, @Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(columnId, createTaskDto);
    }    

    @Patch('tasks/:id')
    async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Delete('tasks/:id')
    async delete(@Param('id') id: string) {
        return this.tasksService.delete(id);
    }

    @Patch('tasks/:id/position')
    async movePosition(@Param('id') id: string, @Body() moveTaskPositionDto: MoveTaskPositionDto) {
        return this.tasksService.movePosition(id, moveTaskPositionDto);
    }
}