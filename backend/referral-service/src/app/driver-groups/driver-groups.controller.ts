import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, HttpStatus, HttpException, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { DriverGroupsService } from './driver-groups.service';
import { CreateDriverGroupDto, UpdateDriverGroupDto, AssignDriverDto } from './dto/driver-groups.dto';

@Controller('admin/driver-groups')
export class DriverGroupsController {
  constructor(private readonly driverGroupsService: DriverGroupsService) {}

  private assertAdmin(req: any): void {
    const internalKey = process.env.INTERNAL_API_KEY;
    const providedKey = req?.headers?.['x-internal-api-key'];
    if (internalKey && providedKey && typeof providedKey === 'string') {
      try {
        const a = Buffer.from(internalKey);
        const b = Buffer.from(providedKey);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
          return;
        }
      } catch {
        // continue
      }
    }
    let user = req?.user;
    if (!user && req?.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
      if (secret) {
        try {
          user = jwt.verify(token, secret) as any;
        } catch {
          user = null;
        }
      }
    }
    if (!user) {
      throw new UnauthorizedException('Authentication required for administrative driver-group operations.');
    }
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      perms.some((p: string) => p.startsWith('ORGANIZATION_') || p.startsWith('DRIVER_') || p === 'SUPER_ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Admin driver-group privileges required.');
    }
  }

  @Get()
  async findAll(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    this.assertAdmin(req);
    return this.driverGroupsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
    });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    this.assertAdmin(req);
    const group = await this.driverGroupsService.findOne(id);
    if (!group) {
      throw new HttpException('Driver group not found', HttpStatus.NOT_FOUND);
    }
    return group;
  }

  @Post()
  async create(@Req() req: any, @Body() createDriverGroupDto: CreateDriverGroupDto) {
    this.assertAdmin(req);
    try {
      return await this.driverGroupsService.create(createDriverGroupDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDriverGroupDto: UpdateDriverGroupDto
  ) {
    this.assertAdmin(req);
    try {
      const updatedGroup = await this.driverGroupsService.update(id, updateDriverGroupDto);
      if (!updatedGroup) {
        throw new HttpException('Driver group not found', HttpStatus.NOT_FOUND);
      }
      return updatedGroup;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    this.assertAdmin(req);
    try {
      const deleted = await this.driverGroupsService.remove(id);
      if (!deleted) {
        throw new HttpException('Driver group not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Driver group deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/assign-driver')
  async assignDriver(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDriverDto: AssignDriverDto
  ) {
    this.assertAdmin(req);
    try {
      return await this.driverGroupsService.assignDriver(id, assignDriverDto.driverId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id/remove-driver/:driverId')
  async removeDriver(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('driverId', ParseUUIDPipe) driverId: string
  ) {
    this.assertAdmin(req);
    try {
      await this.driverGroupsService.removeDriver(id, driverId);
      return { message: 'Driver removed from group successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id/hierarchy')
  async getHierarchy(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    this.assertAdmin(req);
    try {
      return await this.driverGroupsService.getHierarchy(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/members')
  async getMembers(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    this.assertAdmin(req);
    return this.driverGroupsService.getGroupMembers(id, {
      page: Number(page),
      limit: Number(limit),
    });
  }
}