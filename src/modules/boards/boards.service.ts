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
    const boards = await this.prisma.board.findMany({
      where: {
        ownerId: userId
      },
      take: paginationDto.limit,
      skip: paginationDto.cursor ? 1 : 0
    });
    return {
      success: true,
      message: 'Boards retrieved successfully',
      data: boards,
      metadata:{
        cursor: boards.length > 0 ? boards[boards.length - 1].id : null
      }
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
