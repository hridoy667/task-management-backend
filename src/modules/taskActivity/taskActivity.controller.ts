// src/modules/tasks/task-activity.controller.ts
import { Controller, Get, Param, UseGuards, Req } from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam
} from "@nestjs/swagger";
import { TaskActivityService } from "./taskActivity.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@ApiTags('Task Activity Logs') // Groups this under a distinct section in Swagger UI
@ApiBearerAuth('JWT-auth')    // Secure lock configuration icon for JWT validation
@UseGuards(JwtAuthGuard)
@Controller()
export class taskActivityController {
    constructor(
        private readonly taskActivityService: TaskActivityService
    ) { }

    @Get('log/:id')
    @ApiOperation({ summary: 'Retrieve historical execution and move activity logs for a specific task' })
    @ApiParam({
        name: 'id',
        description: 'The identification string (CUID) of the target Task',
        example: 'cmr9jx69f0001vwg0wrhu8l83'
    })
    @ApiResponse({
        status: 200,
        description: 'Chronological list of task manipulation logs retrieved successfully.'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - Log record mismatch or insufficient scope permissions.'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Guarded route access requires a valid bearer token.'
    })
    async getActivityLogOfTask(@Req() req: any, @Param('id') id: string) {
        const userId = req.user.id;
        return this.taskActivityService.getActivityLogByTaskId(userId, id);
    }
}