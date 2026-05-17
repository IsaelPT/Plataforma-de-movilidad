import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('drivers/pending')
  @Roles(UserRole.ADMIN)
  async getPendingDrivers() {
    return this.adminService.getAllPendingDrivers();
  }

  @Get('documents/pending')
  @Roles(UserRole.ADMIN)
  async getPendingDocuments() {
    return this.adminService.getPendingDocuments();
  }

  @Post('documents/:id/review')
  @Roles(UserRole.ADMIN)
  async reviewDocument(
    @Param('id') documentId: string,
    @Body() reviewDto: ReviewDocumentDto,
  ) {
    return this.adminService.reviewDocument(documentId, reviewDto);
  }

  @Get('drivers')
  @Roles(UserRole.ADMIN)
  async getAllDrivers() {
    return this.adminService.getAllDrivers();
  }

  @Get('drivers/:id')
  @Roles(UserRole.ADMIN)
  async getDriverDetails(@Param('id') driverId: string) {
    return this.adminService.getDriverDetails(driverId);
  }
}