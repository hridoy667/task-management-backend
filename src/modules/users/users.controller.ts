import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current logged-in user profile data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the profile metadata of the authenticated user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access token.' })
  async me(@Req() req: any) {
    const userId = req.user.id;
    return this.usersService.getMe(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user profile by public ID' })
  @ApiParam({ name: 'id', description: 'The unique Identification string (cuid) of the user' })
  @ApiResponse({ status: 200, description: 'User profile details matched and retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No user matching that ID exists in the database.' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}