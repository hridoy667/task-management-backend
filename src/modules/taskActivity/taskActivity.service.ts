import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TaskActivityService {

    constructor(private readonly prisma: PrismaService) { }

    async getActivityLogByTaskId(userId, id) {
        const logs = await this.prisma.taskActivity.findMany({
            where: {
                taskId: id,
                userId: userId
            }
        });

        if (logs.length === 0) {
            throw new BadRequestException("You do not have permission or no task logs were found");
        }

        return {
            success: true,
            message: "Task log retrieved",
            task: logs
        };
    }
}