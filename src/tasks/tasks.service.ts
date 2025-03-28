import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async addTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    return await this.taskRepository.save(task);
  }

  async editTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    const updatedTask = { ...task, ...updateTaskDto };
    return await this.taskRepository.save(updatedTask);
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.taskRepository.delete(id);
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return await this.taskRepository.find({ where: { userId } });
  }

  async filterTasks(
    dueDate?: Date,
    priority?: number,
  ): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');

    if (dueDate) {
      query.andWhere('task.dueDate = :dueDate', { dueDate });
    }
    if (priority !== undefined) {
      query.andWhere('task.priority = :priority', { priority });
    }

    return await query.getMany();
  }
}
