// src/modules/boards/boards.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Query 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { cursorPaginationDto } from 'src/common/pagination/cursor-pagination.dto';

@ApiTags('Boards')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  @ApiBody({ type: CreateBoardDto })
  @ApiResponse({ status: 201, description: 'The board has been successfully created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing or invalid JWT token.' })
  async create(@Body() createBoardDto: CreateBoardDto, @Req() req: any) {
    const userId = req.user.id;
    return this.boardsService.create(createBoardDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved user boards.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Req() req: any, @Query() paginationDto: cursorPaginationDto) {
    const userId = req.user.id;
    return this.boardsService.findAll(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific board with its nested columns and tasks' })
  @ApiParam({ name: 'id', description: 'The unique ID of the board', type: String })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the board details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User does not own this board.' })
  @ApiResponse({ status: 404, description: 'Board not found or has been soft-deleted.' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.boardsService.findOne(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a board' })
  @ApiParam({ name: 'id', description: 'The unique ID of the board to delete', type: String })
  @ApiResponse({ status: 200, description: 'The board has been successfully soft-deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only the board owner can delete this resource.' })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.boardsService.remove(id, userId);
  }
}