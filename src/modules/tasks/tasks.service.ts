// src/modules/tasks/tasks.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { MoveTaskPositionDto } from "./dto/move-task.dto";

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}

    async create(columnId: string, dto: CreateTaskDto) {
        const { labels, ...taskData } = dto;

        return this.prisma.task.create({
            data: {
                ...taskData,
                columnId,
                dueDate: dto.dueDate ? dto.dueDate : null,
                labels: labels ? {
                    create: labels.map(labelName => ({ name: labelName, color: '#3B82F6' }))
                } : undefined
            },
            include: { labels: true }
        });
    }

    async update(id: string, dto: UpdateTaskDto) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task || task.deletedAt) throw new NotFoundException('Task not found');

        const { labels, ...taskData } = dto;

        return this.prisma.$transaction(async (tx) => {

            if (labels) {
                await tx.taskLabel.deleteMany({ where: { taskId: id } });
                await tx.taskLabel.createMany({
                    data: labels.map(name => ({ name, color: '#3B82F6', taskId: id }))
                });
            }

            return tx.task.update({
                where: { id },
                data: {
                    ...taskData,
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                },
                include: { labels: true }
            });
        });
    }

    async movePosition(id: string, dto: MoveTaskPositionDto) {
        const { columnId: targetColumnId, position: targetPosition } = dto;

        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task || task.deletedAt) throw new NotFoundException('Task not found');

        const sourceColumnId = task.columnId;
        const sourcePosition = task.position;

        return this.prisma.$transaction(async (tx) => {
            if (sourceColumnId === targetColumnId) {
                if (sourcePosition < targetPosition) {
                    await tx.task.updateMany({
                        where: { columnId: sourceColumnId, position: { gt: sourcePosition, lte: targetPosition }, deletedAt: null },
                        data: { position: { decrement: 1 } }
                    });
                } else if (sourcePosition > targetPosition) {
                    await tx.task.updateMany({
                        where: { columnId: sourceColumnId, position: { gte: targetPosition, lt: sourcePosition }, deletedAt: null },
                        data: { position: { increment: 1 } }
                    });
                }
            } else {
                await tx.task.updateMany({
                    where: { columnId: sourceColumnId, position: { gt: sourcePosition }, deletedAt: null },
                    data: { position: { decrement: 1 } }
                });

                await tx.task.updateMany({
                    where: { columnId: targetColumnId, position: { gte: targetPosition }, deletedAt: null },
                    data: { position: { increment: 1 } }
                });
            }

            return tx.task.update({
                where: { id },
                data: { columnId: targetColumnId, position: targetPosition }
            });
        });
    }

    async delete(id: string) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task || task.deletedAt) throw new NotFoundException('Task not found');

        await this.prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

}