import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockTaskRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
});

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: MockRepository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository(),
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<MockRepository<Task>>(getRepositoryToken(Task));
  });

  describe('addTask', () => {
    it('should add a new task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 1,
      };

      const userId = 'user-id-from-token';

      const newtask ={
        ...createTaskDto,
        userId,
      }

      const savedTask = { 
        id: '1', 
        ...newtask,
      };

      taskRepository.create!.mockReturnValue(savedTask);
      taskRepository.save!.mockResolvedValue(savedTask);

      const result = await tasksService.addTask(newtask);

      // Kiểm tra các bước trong quá trình xử lý
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        userId: 'user-id-from-token',
      });
      expect(taskRepository.save).toHaveBeenCalledWith(savedTask);

      // Kết quả phải khớp với task đã lưu
      expect(result).toEqual(savedTask);
    });
  });

  describe('editTask', () => {
    it('should update an existing task', async () => {
      const updateTaskDto = { title: 'Updated Task' };
      const existingTask = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        priority: 1,
        userId: 'user-id',
      };
      const updatedTask = { ...existingTask, ...updateTaskDto };

      taskRepository.findOne!.mockResolvedValue(existingTask);
      taskRepository.save!.mockResolvedValue(updatedTask);

      const result = await tasksService.editTask('1', updateTaskDto);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(taskRepository.save).toHaveBeenCalledWith({
        ...existingTask,
        ...updateTaskDto,
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      taskRepository.findOne!.mockResolvedValue(null);

      await expect(tasksService.editTask('1', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const tasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ];

      taskRepository.find!.mockResolvedValue(tasks);

      const result = await tasksService.getAllTasks();

      expect(taskRepository.find).toHaveBeenCalled();
      expect(result).toEqual(tasks);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      const task = { id: '1', title: 'Task 1' };

      taskRepository.findOne!.mockResolvedValue(task);

      const result = await tasksService.getTaskById('1');

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      taskRepository.findOne!.mockResolvedValue(null);

      await expect(tasksService.getTaskById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const taskId = '1';
      const task = { id: taskId, title: 'Task to delete' };

      taskRepository.findOne!.mockResolvedValue(task);
      taskRepository.delete!.mockResolvedValue({ affected: 1 });

      await tasksService.deleteTask(taskId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const taskId = '1';

      taskRepository.findOne!.mockResolvedValue(null);

      await expect(tasksService.deleteTask(taskId)).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
  });

  describe('getTasksByUserId', () => {
    it('should return tasks for a specific user', async () => {
      const userId = 'user-id';
      const tasks = [
        { id: '1', title: 'Task 1', userId },
        { id: '2', title: 'Task 2', userId },
      ];

      taskRepository.find!.mockResolvedValue(tasks);

      const result = await tasksService.getTasksByUserId(userId);

      expect(taskRepository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(tasks);
    });

    it('should return an empty array if no tasks found', async () => {
      const userId = 'user-id';

      taskRepository.find!.mockResolvedValue([]);

      const result = await tasksService.getTasksByUserId(userId);

      expect(taskRepository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual([]);
    });
  });

  describe('filterTasks', () => {
    it('should filter tasks by id, due date, and priority', async () => {
      const id = '1';
      const dueDate = new Date('2023-12-01');
      const priority = 1;
      const tasks = [{ id: '1', title: 'Filtered Task', dueDate, priority }];
  
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(tasks),
      };
  
      taskRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
      taskRepository.findOne = jest.fn();
  
      const result = await tasksService.filterTasks(id, dueDate, priority);
  
      // Kiểm tra các lời gọi hàm
      expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.id = :id', { id });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.dueDate = :dueDate', { dueDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.priority = :priority', { priority });
  
      // Kết quả trả về phải khớp với mock data
      expect(result).toEqual(tasks);
    });
  
    it('should throw NotFoundException if no tasks are found', async () => {
      const id = '2';
      const dueDate = new Date('2023-12-01');
      const priority = 1;
  
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([]), // Trả về danh sách rỗng
      };
  
      taskRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
  
      // Xác nhận ngoại lệ được ném ra
      await expect(tasksService.filterTasks(id, dueDate, priority)).rejects.toThrow(
        new NotFoundException('No tasks found with the given criteria'),
      );
  
      // Kiểm tra các lời gọi hàm
      expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.id = :id', { id });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.dueDate = :dueDate', { dueDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.priority = :priority', { priority });
    });
  });  
});
