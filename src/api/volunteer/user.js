import request from '@/utils/request'

// 查询活动关联人员列表
export function listUser(query) {
  return request({
    url: '/volunteer/user/list',
    method: 'get',
    params: query
  })
}

// 查询活动关联人员详细
export function getUser(id) {
  return request({
    url: '/volunteer/user/' + id,
    method: 'get'
  })
}

// 新增活动关联人员
export function addUser(data) {
  return request({
    url: '/volunteer/user',
    method: 'post',
    data: data
  })
}

// 修改活动关联人员
export function updateUser(data) {
  return request({
    url: '/volunteer/user',
    method: 'put',
    data: data
  })
}

// 删除活动关联人员
export function delUser(id) {
  return request({
    url: '/volunteer/user/' + id,
    method: 'delete'
  })
}
