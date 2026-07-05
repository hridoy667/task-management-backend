import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(@Body() createBoardDto: CreateBoardDto,@Req() req: any) {
    const userId = req.user.id
    return this.boardsService.create(createBoardDto, userId);
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.boardsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.boardsService.findOne(id, userId);
  }

  @Patch(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.boardsService.remove(id, userId);
  }
}
