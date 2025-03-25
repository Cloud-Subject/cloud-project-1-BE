import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('hello')
  hello() {
    return 'Hello from tasks';
  }

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: Express.Request,
  ) {
    return this.tasksService.create(
      createTaskDto,
      (req.user as { userId: string }).userId,
    );
  }

  @Get()
  findAll(@Request() req: Express.Request) {
    return this.tasksService.findAll((req.user as { userId: string }).userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: Express.Request) {
    return this.tasksService.findOne(
      id,
      (req.user as { userId: string }).userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: Express.Request,
  ) {
    return this.tasksService.update(
      id,
      updateTaskDto,
      (req.user as { userId: string }).userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: Express.Request) {
    return this.tasksService.remove(
      id,
      (req.user as { userId: string }).userId,
    );
  }
}
