import { t } from 'elysia'

export const TaskModel = {
  GetTaskStatusQuery: t.Object({
    task_id: t.String(),
  }),
  GetTaskStatusSuccess: t.Object({
    message: t.Literal('获取任务状态成功'),
    data: t.Object({
      progress: t.Number(),
      status: t.Enum({
        processing: 'processing',
        completed: 'completed',
        failed: 'failed',
      }),
      message: t.String(),
      data: t.Nullable(t.Any()),
    }),
  }),
  GetTaskStatusFailedNotFound: t.Object({
    message: t.Literal('任务不存在或已过期'),
    data: t.Null(),
  }),
  GetTaskStatusFailedParse: t.Object({
    message: t.Literal('任务状态解析失败'),
    data: t.Null(),
  }),
}

export interface TaskModelType {
  GetTaskStatusQuery: typeof TaskModel.GetTaskStatusQuery.static
}
