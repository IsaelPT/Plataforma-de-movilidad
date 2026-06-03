import { Controller, Post, Get, Patch, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from './schemas/user.schema';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

interface AvailabilityBody {
  isAvailable: boolean;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('documents')
  @UseGuards(JwtAuthGuard)
  async uploadDocument(
    @Request() req: AuthenticatedRequest, 
    @Body() uploadDocumentDto: UploadDocumentDto,
  ) {
    return this.usersService.uploadDocument(req.user.userId, uploadDocumentDto);
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  async getDocuments(@Request() req: AuthenticatedRequest) {
    return this.usersService.getDocuments(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: AuthenticatedRequest, 
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<{ profile: UserDocument['profile'] }> {
    const user = await this.usersService.updateProfile(req.user.userId, updateProfileDto);
    return { profile: user.profile };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findById(req.user.userId);
    return { profile: user.profile, role: user.role };
  }

  @Patch('availability')
  @UseGuards(JwtAuthGuard)
  async setAvailability(
    @Request() req: AuthenticatedRequest, 
    @Body() body: AvailabilityBody,
  ) {
    if (typeof body.isAvailable !== 'boolean') {
      throw new BadRequestException('isAvailable must be a boolean');
    }
    return this.usersService.setDriverAvailability(req.user.userId, body.isAvailable);
  }

  @Get('availability')
  @UseGuards(JwtAuthGuard)
  async getAvailability(@Request() req: AuthenticatedRequest) {
    const isAvailable = await this.usersService.getDriverAvailability(req.user.userId);
    return { isAvailable };
  }
}