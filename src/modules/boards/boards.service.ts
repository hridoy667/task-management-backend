import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { PrismaService } from '../prisma/prisma.service';
import { cursorPaginationDto } from 'src/common/pagination/cursor-pagination.dto';
import { metadata } from 'reflect-metadata/no-conflict';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService
  ) { }

  async create(createBoardDto: CreateBoardDto, userId: string) {
    await this.prisma.board.create({
      data: {
        ...createBoardDto,
        ownerId: userId
      }
    });
    return {
      success: true,
      message: 'Board created successfully'
    };
  }

  async findAll(userId: string, paginationDto: cursorPaginationDto) {
    const { cursor, limit, title, priority, dueDate } = paginationDto;

    const filterCriteria: any = {
      ownerId: userId,
      deletedAt: null,
    };

    if (title) {
      filterCriteria.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    if (priority !== undefined) {
      filterCriteria.priority = priority;
    }

    if (dueDate) {
      filterCriteria.dueDate = {
        lte: new Date(dueDate)
      };
    }

    // Fetch matching records
    const boards = await this.prisma.board.findMany({
      where: filterCriteria,
      take: limit ? Number(limit) : 10,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
    });

    return {
      success: true,
      message: 'Records retrieved successfully',
      data: boards,
      metadata: {
        cursor: boards.length > 0 ? boards[boards.length - 1].id : null,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: {
        id,
        ownerId: userId
      },
      include: {
        columns: {
          include: {
            tasks: true
          }
        }
      }
    });
    return {
      success: true,
      message: 'Board retrieved successfully',
      data: board
    };
  }

  async remove(id: string, userId: string) {
    const deletedBoard = await this.prisma.board.update({
      where: {
        id,
        ownerId: userId
      },
      data: {
        deletedAt: new Date()
      }
    });

    if (!deletedBoard) {
      throw new Error('Board not found or you do not have permission to delete it');
    }

    return {
      success: true,
      message: 'Board removed successfully'
    };
  }
}
