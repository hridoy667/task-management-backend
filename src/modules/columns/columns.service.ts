import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColumnsService {

  constructor(private readonly prisma:PrismaService) { }

  async create(createColumnDto: CreateColumnDto, boardId: string) {
    await this.prisma.column.create({
      data: {
        ...createColumnDto,
        boardId
      }
    });
    return {
      success: true,
      message: 'Column created successfully'
    };
  }

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    const column = await this.prisma.column.update({
      where: { id },
      data: updateColumnDto
    });
    if (!column) {
      throw new Error('Column not found');
    }
    return {
      success: true,
      message: 'Column updated successfully'
    };
  }

  async remove(id: string) {
    await this.prisma.column.delete({
      where: { id }
    });
    return {
      success: true,
      message: 'Column removed successfully'
    };
  }
}
