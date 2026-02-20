import { t } from 'elysia'

export const TaskModel = {
  GetTaskStatusQuery: t.Object({
    task_id: t.String(),
  }),
  GetTaskStatusSuccess: t.Object({
    message: t.String(),
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
    message: t.String(),
    data: t.Null(),
  }),
  GetTaskStatusFailedParse: t.Object({
    message: t.String(),
    data: t.Null(),
  }),
}

export interface TaskModelType {
  GetTaskStatusQuery: typeof TaskModel.GetTaskStatusQuery.static
}
