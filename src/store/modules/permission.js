import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import { Message } from 'element-ui'

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    sidebarRouters: [],
    // 修改默认首页
    indexPage: '',
    defaultRoutes: [],
    topbarRouters: [],
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes)
    },
    SET_INDEX_PAGE: (state, indexPage) => {
      state.indexPage = indexPage
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes
    },
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_SIDEBAR_ROUTERS: (state, routers) => {
      state.sidebarRouters = constantRoutes.concat(routers)
    },
  },
  actions: {
    // 生成路由
    GenerateRoutes({
      commit
    }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          const sdata = JSON.parse(JSON.stringify(res.data))
          const rdata = JSON.parse(JSON.stringify(res.data))
          // 修改默认首页。
          // 登录后跳转404，要看看登录页url的redirect重定向值是什么。
          console.log('路由modules/permission', res.data)
          if(res.data.length > 0){
            // 登录的用户有菜单权限
            let pathIndex = ''
            // 第一个菜单要区分有子菜单和没有子菜单的情况
            if (res.data[0].path == '/') {
              // 一级子菜单
              pathIndex = res.data[0].path + res.data[0].children[0].path
            } else {
              if (res.data[0].children) {
                if (res.data[0].children[0]&&res.data[0].children[0].children&&res.data[0].children[0].children.length > 0) {
                  // 三级子菜单
                  pathIndex = res.data[0].path + '/' + res.data[0].children[0].path + '/' + res.data[0].children[0].children[0].path
                } else {
                  // 二级子菜单
                  pathIndex = res.data[0].path + '/' + res.data[0].children[0].path
                }
              }
            }
            // console.log('store permission---', pathIndex)
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
            rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })
            router.addRoutes(asyncRoutes);
            commit('SET_ROUTES', rewriteRoutes)
            commit('SET_SIDEBAR_ROUTERS', constantRoutes.concat(sidebarRoutes))
            commit('SET_DEFAULT_ROUTES', sidebarRoutes)
            commit('SET_TOPBAR_ROUTES', sidebarRoutes)
            resolve(rewriteRoutes)
          } else {
            // 登录的用户没有任何一个菜单权限
            Message({
              message: '非常抱歉，该用户没有菜单权限！',
              type: 'warning'
            });
            resolve()
          }
        })
      })
    }
  }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, isRewrite = false) {
  return asyncRouterMap.filter(route => {
    if (isRewrite && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      }else if (route.component === 'InnerLink') {
        route.component = InnerLink
      }  else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, isRewrite)
    }else{
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
      if (el.children && el.children.length) {
        children = children.concat(filterChildren(el.children, el))
        return
      }
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view) => {
  if (process.env.NODE_ENV === 'development') {
    return (resolve) => require([`@/views/${view}`], resolve)
  } else {
    // 使用 import 实现生产环境的路由懒加载
    return () => import(`@/views/${view}`)
  }
}
// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}
export default permission
