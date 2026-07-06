import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiParam, 
  ApiResponse, 
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Columns')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post('boards/:id/columns')
  @ApiOperation({ summary: 'Create a new column inside a board' })
  @ApiParam({ name: 'id', description: 'The unique UUID/CUID of the parent Board', type: String })
  @ApiBody({ type: CreateColumnDto })
  @ApiResponse({ status: 21, description: 'Column successfully created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing or invalid JWT token.' })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  async create(
    @Param('id') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return this.columnsService.create(createColumnDto, boardId);
  }

  @Patch('columns/:id')
  @ApiOperation({ summary: 'Update a column properties (title, order)' })
  @ApiParam({ name: 'id', description: 'The unique UUID/CUID of the Column to update', type: String })
  @ApiBody({ type: UpdateColumnDto })
  @ApiResponse({ status: 200, description: 'Column successfully updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Column not found.' })
  async update(
    @Param('id') id: string, 
    @Body() updateColumnDto: UpdateColumnDto
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete('columns/:id')
  @ApiOperation({ summary: 'Delete a specific column' })
  @ApiParam({ name: 'id', description: 'The unique UUID/CUID of the Column to delete', type: String })
  @ApiResponse({ status: 200, description: 'Column successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Column not found.' })
  async remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }
}