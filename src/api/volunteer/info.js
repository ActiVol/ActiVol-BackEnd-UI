import request from '@/utils/request'

export function publishInfo(activityId){
  return request({
    url: '/volunteer/info/publish/'+activityId,
    method: 'put',
  })
}
// 查询审核信息列表
export function processListInfo(query) {
  return request({
    url: '/volunteer/info/process/list',
    method: 'get',
    params: query
  })
}
// 查询活动信息列表
export function listInfo(query) {
  return request({
    url: '/volunteer/info/list',
    method: 'get',
    params: query
  })
}

// 查询活动信息详细
export function getInfo(activityId) {
  return request({
    url: '/volunteer/info/' + activityId,
    method: 'get'
  })
}

// 新增活动信息
export function addInfo(data) {
  return request({
    url: '/volunteer/info',
    method: 'post',
    data: data
  })
}

// 修改活动信息
export function updateInfo(data) {
  return request({
    url: '/volunteer/info',
    method: 'put',
    data: data
  })
}

// 删除活动信息
export function delInfo(activityId) {
  return request({
    url: '/volunteer/info/' + activityId,
    method: 'delete'
  })
}
