// src/modules/tasks/tasks.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { MoveTaskPositionDto } from "./dto/move-task.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) { }

    async create(columnId: string, dto: CreateTaskDto) {
        const { labels, position, ...taskData } = dto;

        if (position === undefined || position < 0) {
            throw new InternalServerErrorException('Position must be a non-negative integer');
        }
        //if this column already have any product which has the same position, then we will way this position is already taken,we will not let the user to create a new product with the same position, we will return an error message
        const existingTask = await this.prisma.task.findUnique({
            where: {
                columnId_position: {
                    columnId,
                    position
                }
            }
        });

        if (existingTask) {
            throw new InternalServerErrorException('A task with the same position already exists in this column');
        }

        await this.prisma.task.create({
            data: {
                ...taskData,
                columnId,
                position,
                dueDate: dto.dueDate ? dto.dueDate : null,
                labels: labels ? {
                    create: labels.map(labelName => ({ name: labelName, color: '#3B82F6' }))
                } : undefined
            },
            include: { labels: true }
        });
        return {
            success: true,
            message: 'Task created successfully'
        };
    }

    async update(id: string, dto: UpdateTaskDto) {
        const { labels, ...taskData } = dto;

        try {
            return await this.prisma.$transaction(async (tx) => {

                if (labels) {
                    await tx.taskLabel.deleteMany({ where: { taskId: id } });

                    if (labels.length > 0) {
                        await tx.taskLabel.createMany({
                            data: labels.map(name => ({ name, color: '#3B82F6', taskId: id }))
                        });
                    }
                }
                const updatedTask = await tx.task.update({
                    where: {
                        id,
                        deletedAt: null
                    },
                    data: {
                        ...taskData,
                        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                    },
                    include: { labels: true }
                });

                return {
                    success: true,
                    message: 'Task updated successfully',
                    data: updatedTask
                };
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException('Task not found');
            }
            throw new InternalServerErrorException('An error occurred while updating the task');
        }
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