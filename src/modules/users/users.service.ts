import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {

  constructor(private readonly prisma:PrismaService) { }

  async getMe(userId: string) {
    const user = await this.findOne(userId);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };
  }

}
