import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() body: { username: string; email: string }) {
    return this.usersService.createUser(body.username, body.email);
  }

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findUserById(parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
