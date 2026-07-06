import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post('boards/:id/columns')
  async create(@Body() createColumnDto: CreateColumnDto,@Param('id') boardId: string) {
    return this.columnsService.create(createColumnDto, boardId);
  }

  @Patch('columns/:id')
  async update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete('columns/:id')
  async remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }
}
