import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { MoveTaskPositionDto } from "./dto/move-task.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}
    
    // Create Task with Activity Log
    async create(columnId: string, dto: CreateTaskDto, userId: string) {
        const { labels, position, ...taskData } = dto;

        if (position === undefined || position < 0) {
            throw new InternalServerErrorException('Position must be a non-negative integer');
        }

        const existingTask = await this.prisma.task.findUnique({
            where: {
                columnId_position: { columnId, position }
            }
        });

        if (existingTask) {
            throw new InternalServerErrorException('A task with the same position already exists in this column');
        }

        return this.prisma.$transaction(async (tx) => {
            const createdTask = await tx.task.create({
                data: {
                    ...taskData,
                    columnId,
                    position,
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                    labels: labels ? {
                        create: labels.map(labelName => ({ name: labelName, color: '#3B82F6' }))
                    } : undefined
                },
                include: { labels: true }
            });

            //activity log
            await tx.taskActivity.create({
                data: {
                    taskId: createdTask.id,
                    userId: userId,
                    action: `Created the task: "${createdTask.title}"`
                }
            });

            return {
                success: true,
                message: 'Task created successfully',
                data: createdTask
            };
        });
    }

    // Update Task with Activity Log
    async update(id: string, dto: UpdateTaskDto, userId: string) {
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
                    where: { id, deletedAt: null },
                    data: {
                        ...taskData,
                        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                    },
                    include: { labels: true }
                });

                // activity log
                await tx.taskActivity.create({
                    data: {
                        taskId: updatedTask.id,
                        userId: userId,
                        action: `Updated task details/labels`
                    }
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

    // Move Task Position with Dynamic Column/Sequence Activity Log
    async movePosition(id: string, dto: MoveTaskPositionDto, userId: string) {
        const { columnId: targetColumnId, position: targetPosition } = dto;

        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task || task.deletedAt) throw new NotFoundException('Task not found');

        const sourceColumnId = task.columnId;
        const sourcePosition = task.position;

        return this.prisma.$transaction(async (tx) => {
            let actionMessage = '';

            if (sourceColumnId === targetColumnId) {
                actionMessage = `Changed position within the same column from index ${sourcePosition} to ${targetPosition}`;
                
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
                actionMessage = `Moved task to a different column (From Column: ${sourceColumnId} to ${targetColumnId})`;

                await tx.task.updateMany({
                    where: { columnId: sourceColumnId, position: { gt: sourcePosition }, deletedAt: null },
                    data: { position: { decrement: 1 } }
                });

                await tx.task.updateMany({
                    where: { columnId: targetColumnId, position: { gte: targetPosition }, deletedAt: null },
                    data: { position: { increment: 1 } }
                });
            }

            const updatedTask = await tx.task.update({
                where: { id },
                data: { columnId: targetColumnId, position: targetPosition }
            });

            // activity log
            await tx.taskActivity.create({
                data: {
                    taskId: id,
                    userId: userId,
                    action: actionMessage
                }
            });

            return {
                success: true,
                message: 'Task moved successfully',
                data: updatedTask
            };
        });
    }

    // Soft Delete Task with Activity Log
    async delete(id: string, userId: string) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task || task.deletedAt) throw new NotFoundException('Task not found');

        return this.prisma.$transaction(async (tx) => {
             await tx.task.update({
                where: { id },
                data: { deletedAt: new Date() }
            });

            // activity log
            await tx.taskActivity.create({
                data: {
                    taskId: id,
                    userId: userId,
                    action: `Soft-deleted the task`
                }
            });

            return {
                success: true,
                message: 'Task soft-deleted successfully'
            };
        });
    }
}