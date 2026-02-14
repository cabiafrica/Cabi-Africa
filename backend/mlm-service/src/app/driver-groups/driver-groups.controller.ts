import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, HttpStatus, HttpException } from '@nestjs/common';
import { DriverGroupsService } from './driver-groups.service';
import { CreateDriverGroupDto, UpdateDriverGroupDto, AssignDriverDto } from './dto/driver-groups.dto';

@Controller('admin/driver-groups')
export class DriverGroupsController {
  constructor(private readonly driverGroupsService: DriverGroupsService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    return this.driverGroupsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const group = await this.driverGroupsService.findOne(id);
    if (!group) {
      throw new HttpException('Driver group not found', HttpStatus.NOT_FOUND);
    }
    return group;
  }

  @Post()
  async create(@Body() createDriverGroupDto: CreateDriverGroupDto) {
    try {
      return await this.driverGroupsService.create(createDriverGroupDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDriverGroupDto: UpdateDriverGroupDto
  ) {
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
  async remove(@Param('id', ParseUUIDPipe) id: string) {
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDriverDto: AssignDriverDto
  ) {
    try {
      return await this.driverGroupsService.assignDriver(id, assignDriverDto.driverId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id/remove-driver/:driverId')
  async removeDriver(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('driverId', ParseUUIDPipe) driverId: string
  ) {
    try {
      await this.driverGroupsService.removeDriver(id, driverId);
      return { message: 'Driver removed from group successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id/hierarchy')
  async getHierarchy(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.driverGroupsService.getHierarchy(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/members')
  async getMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    return this.driverGroupsService.getGroupMembers(id, {
      page: Number(page),
      limit: Number(limit),
    });
  }
}