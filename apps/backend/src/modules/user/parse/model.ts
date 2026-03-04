import { Typeboxs } from '@backend/db'
import { t } from 'elysia'

export const ParseModel = {
  getKeyInfoQuery: t.Object({
    key: t.String(),
  }),
  getKeyInfoSuccess: t.Object({
    message: t.Literal('获取成功'),
    data: t.Object({
      user_data: t.Nullable(Typeboxs.KeyUserData),
      key: t.String(),
      used_count: t.Integer({ minimum: 0 }),
      total_count: t.Integer({ minimum: 0 }),
      expired_at: t.Nullable(t.Date()),
      total_hours: t.Integer({ minimum: 0 }),
      status: t.Boolean(),
      reason: t.String(),
    }),
  }),
  getKeyInfoFailedNotFound: t.Object({
    message: t.Literal('密钥不存在'),
    data: t.Null(),
  }),

  getListQuery: t.Object({
    key: t.String(),
    surl: t.String(),
    pwd: t.Undefined(t.String()),
    dir: t.Undefined(t.String()),
    page: t.Undefined(t.Integer({ minimum: 0 })),
    num: t.Undefined(t.Integer({ minimum: 0 })),
    order: t.Undefined(t.Enum({
      filename: 'filename',
      time: 'time',
      size: 'size',
      type: 'type',
    })),
  }),
  getListSuccess: t.Object({
    message: t.Literal('获取文件列表成功'),
    data: t.Object({
      title: t.String(),
      link_ctime: t.Integer({ minimum: 0 }),
      has_more: t.Boolean(),
      list: t.Array(t.Object({
        category: t.Integer(),
        fs_id: t.Integer({ minimum: 0 }),
        is_dir: t.Boolean(),
        local_ctime: t.Integer({ minimum: 0 }),
        local_mtime: t.Integer({ minimum: 0 }),
        md5: t.String(),
        path: t.String(),
        server_ctime: t.Integer({ minimum: 0 }),
        server_filename: t.String(),
        server_mtime: t.Integer({ minimum: 0 }),
        size: t.Integer({ minimum: 0 }),
      })),
      user: t.Object({
        avatar: t.String(),
      }),
      uname: t.String(),
      uk: t.Integer({ minimum: 0 }),
      shareid: t.Integer({ minimum: 0 }),
      seckey: t.String(),
    }),
  }),
  getListFailed: t.Object({
    message: t.String(),
    data: t.Null(),
  }),

  transferBody: t.Object({
    key: t.String(),
    surl: t.String(),
    pwd: t.Undefined(t.String()),
    dir: t.Undefined(t.String()),
    fs_ids: t.Array(t.Integer({ minimum: 0 })),
  }),
}

export interface ParseModelType {
  getKeyInfoQuery: typeof ParseModel.getKeyInfoQuery.static
  getListQuery: typeof ParseModel.getListQuery.static
  transferBody: typeof ParseModel.transferBody.static
}
