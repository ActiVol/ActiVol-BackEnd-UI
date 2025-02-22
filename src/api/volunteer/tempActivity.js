import request from '@/utils/request'

// 查询临时活动列表
export function listTempActivity(query) {
return request({
url: '/volunteer/tempActivity/list',
method: 'get',
params: query
})
}

// 查询临时活动详细
export function getTempActivity(id) {
return request({
url: '/volunteer/tempActivity/' + id,
method: 'get'
})
}

// 新增临时活动
export function addTempActivity(data) {
return request({
url: '/volunteer/tempActivity',
method: 'post',
data: data
})
}

// 修改临时活动
export function updateTempActivity(data) {
return request({
url: '/volunteer/tempActivity',
method: 'put',
data: data
})
}

// 删除临时活动
export function delTempActivity(id) {
return request({
url: '/volunteer/tempActivity/' + id,
method: 'delete'
})
}
// 审核临时活动
export function processTempActivity(id){
  return request({
    url: '/volunteer/tempActivity/processTempActivity/' + id,
    method: 'put'
  })
}
