import request from '@/utils/request'

// 查询审核信息列表
export function listProcess(query) {
  return request({
    url: '/volunteer/process/list',
    method: 'get',
    params: query
  })
}

// 查询审核信息详细
export function getProcess(processId) {
  return request({
    url: '/volunteer/process/' + processId,
    method: 'get'
  })
}
// 审核活动信息
export function processActivity(data){
  return request({
    url: '/volunteer/process/activity',
    method: 'post',
    data: data
  })
}
// 新增审核信息
export function addProcess(data) {
  return request({
    url: '/volunteer/process',
    method: 'post',
    data: data
  })
}

// 修改审核信息
export function updateProcess(data) {
  return request({
    url: '/volunteer/process',
    method: 'put',
    data: data
  })
}

// 删除审核信息
export function delProcess(processId) {
  return request({
    url: '/volunteer/process/' + processId,
    method: 'delete'
  })
}
