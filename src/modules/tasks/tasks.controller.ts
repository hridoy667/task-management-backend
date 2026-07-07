// src/modules/tasks/tasks.controller.ts
import { Body, Controller, Param, Post, Patch, Delete, UseGuards, Req } from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam
} from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { MoveTaskPositionDto } from "./dto/move-task.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post('columns/:id/tasks')
    @ApiOperation({ summary: 'Create a new task inside a column' })
    @ApiParam({ name: 'id', description: 'The unique identification string of the parent Column' })
    @ApiResponse({ status: 201, description: 'The task and its on-the-fly labels have been successfully created.' })
    @ApiResponse({ status: 401, description: 'Unauthorized access token.' })
    @ApiResponse({ status: 404, description: 'Parent column not found.' })
    async create(@Param('id') columnId: string, @Body() createTaskDto: CreateTaskDto, @Req() req: any) {
        const userId = req.user.id;
        return this.tasksService.create(columnId, createTaskDto, userId);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @Patch('tasks/:id')
    @ApiOperation({ summary: 'Update specific details or labels of a task' })
    @ApiParam({ name: 'id', description: 'The identification string of the Task to modify' })
    @ApiResponse({ status: 200, description: 'The task details were updated and synchronized successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Task not found or is currently soft-deleted.' })
    async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: any) {
        const userId = req.user.id;
        return this.tasksService.update(id, updateTaskDto, userId);
    }

    @Delete('tasks/:id')
    @ApiOperation({ summary: 'Soft-delete a task from the system' })
    @ApiParam({ name: 'id', description: 'The identification string of the target Task to remove' })
    @ApiResponse({ status: 200, description: 'The task was flagged as soft-deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Task matching that ID does not exist.' })
    async delete(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.tasksService.delete(id, userId);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @Patch('tasks/:id/position')
    @ApiOperation({ summary: 'Move a task into a different column or shift its vertical sequence order' })
    @ApiParam({ name: 'id', description: 'The identification string of the moving Task' })
    @ApiResponse({ status: 200, description: 'Neighboring task indexes and target metrics recalculation completed successfully.' })
    @ApiResponse({ status: 400, description: 'Bad formatting or transaction index out of bounds.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Target task or target column not found.' })
    async movePosition(@Param('id') id: string, @Body() moveTaskPositionDto: MoveTaskPositionDto, @Req() req: any) {
        const userId = req.user.id;
        return this.tasksService.movePosition(id, moveTaskPositionDto, userId);
    }
}