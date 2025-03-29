import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Delete,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt')) // Sử dụng AuthGuard để bảo vệ các route
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async addTask(
    @Req() req: Request,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    const user = req.user as { userId: string };
    createTaskDto.userId = user.userId; // Gán userId từ token vào task
    return await this.tasksService.addTask(createTaskDto);
  }

  @Put(':id')
  async editTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.editTask(id, updateTaskDto);
  }

  @Get()
  async getAllTasks(): Promise<Task[]> {
    return await this.tasksService.getAllTasks();
  }

  // @Get(':id')
  // async getTaskById(@Param('id') id: string): Promise<Task> {
  //   return await this.tasksService.getTaskById(id);
  // }

  @Get('user/:userId')
  async getTasksByUserId(@Param('userId') userId: string): Promise<Task[]> {
    return await this.tasksService.getTasksByUserId(userId);
  }

  //ham xoa
  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<void> {
    return await this.tasksService.deleteTask(id);
  }

  @Get('/filter')
  async filterTasks(
    @Query('id') id?: string,
    @Query('dueDate') dueDate?: string,
    @Query('priority') priority?: number,
  ): Promise<Task[]> {
    const formattedDueDate = dueDate ? new Date(dueDate) : undefined;
    return await this.tasksService.filterTasks(id, formattedDueDate, priority);
  }

}
