import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll(userId: string) {
    const boards = await this.prisma.board.findMany({
      where: {
        ownerId: userId
      }
    });
    return {
      success: true,
      message: 'Boards retrieved successfully',
      data: boards
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
    await this.prisma.board.update({
      where: {
        id,
        ownerId: userId
      },
      data: {
        deletedAt: new Date()
      }
    });
    return {
      success: true,
      message: 'Board removed successfully'
    };
  }
}
