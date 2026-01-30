import { TaskModel } from '@backend/modules/task/model.ts'
import { TaskService } from '@backend/modules/task/service.ts'
import { Elysia } from 'elysia'

export const TaskModule = new Elysia({ prefix: '/task' }).get(
  '/',
  async ({ query }) => await TaskService.getTaskStatus(query),
  {
    query: TaskModel.GetTaskStatusQuery,
    response: {
      200: TaskModel.GetTaskStatusSuccess,
      404: TaskModel.GetTaskStatusFailedNotFound,
      500: TaskModel.GetTaskStatusFailedParse,
    },
    detail: {
      summary: '获取任务状态',
      tags: ['异步任务'],
    },
  },
)
