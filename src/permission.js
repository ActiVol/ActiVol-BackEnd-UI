import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isPathMatch } from './utils/validate';

import { getToken } from '@/utils/auth'
import config from 'config'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect', '/bind', '/register']
const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path));
};
router.beforeEach((to, from, next) => {
  // console.log(to, from, getToken(), store.state.permission.indexPage)
  // debugger
  NProgress.start()

  if (getToken()) {
    // 登录之后，访问路由会执行这个方法。
    /* has token*/
    // 已经登录了，但你想跳到登录页。那系统会跳到路由接口的第一个路由地址，不会给你跳到登录页，除非你点击退出登录。
    if (to.path === '/login') {
      // next({ path: '/' })
      if(store.state.permission.indexPage) {
        next(`/login`)
        NProgress.done()
      } else {
        // 如果在登录界面，点击登录成功，但是还没获取到路由就刷新页面，这时候会出现一直在登录界面刷新的情况。
        // 这个时候要重新获取用户信息和路由进行跳转。
        store.dispatch('GetInfo').then(res => {
          // 拉取user_info
          const roles = res.roles
          store.dispatch('GenerateRoutes', { roles }).then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            // 修改默认首页
            console.log('路由/permssion', accessRoutes, from, to.fullPath)
            if(accessRoutes){
              // 登录的用户有菜单权限
              router.addRoutes(accessRoutes) // 动态添加可访问路由表
              if (to.fullPath == '/') {
                // 当登录之后，直接通过ip地址和端口号访问时，跳转到第一个路由页面indexPage。如：http://10.12.7.76:6090/，这样直接访问。
                let pathIndex = ''
                // 第一个菜单要区分有子菜单和没有子菜单的情况
                if(accessRoutes[0].path == '/'){
                  pathIndex = accessRoutes[0].path + accessRoutes[0].children[0].path
                } else {
                  // pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path
                  // 存在多级子菜单的情况
                  if(accessRoutes[0].children) {
                    if(accessRoutes[0].children[0]&&accessRoutes[0].children[0].children&&accessRoutes[0].children[0].children.length > 0) {
                      // 三级子菜单
                      pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path + '/' + accessRoutes[0].children[0].children[0].path
                    } else {
                      // 二级子菜单
                      pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path
                    }
                  }
                }
                // replace: true只是一个设置信息，告诉VUE本次操作后，不能通过浏览器后退按钮，返回前一个路由。
                next({ path: pathIndex, replace: true }) // hack方法 确保addRoutes已完成
              } else {
                // 如果是点击了一个菜单，然后刷新，保持在当前的页面。
                // 如果是从其他页面点击，通过打开新窗口跳转路由。如从当前故障报警详情里跳到实时监控页面。

                next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
                // 使用next({ ...to, replace: true })来确保addRoutes()时动态添加的路由已经被完全加载上去。
              }
              // 修改默认首页end
            } else {
              // 登录的用户没有任何一个菜单权限
              store.dispatch('LogOut').then(() => {
                next({ path:'/login' })
              })
            }
          })
        })
        .catch(err => {
          store.dispatch('LogOut').then(() => {
            Message.error(err)
            next({ path: '/login' })
          })
        })
      }
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then(res => {
          // 拉取user_info
          const roles = res.roles
          store.dispatch('GenerateRoutes', { roles }).then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            // 修改默认首页
            // console.log(accessRoutes, from, to.fullPath)
            router.addRoutes(accessRoutes) // 动态添加可访问路由表
            if (to.fullPath == '/') {
              // 当登录之后，直接通过ip地址和端口号访问时，跳转到第一个路由页面indexPage。如：http://10.12.7.76:6090/，这样直接访问。
              let pathIndex = ''
              // 第一个菜单要区分有子菜单和没有子菜单的情况
              if(accessRoutes[0].path == '/'){
                pathIndex = accessRoutes[0].path + accessRoutes[0].children[0].path
              } else {
                // pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path
                // 存在多级子菜单的情况
                if(accessRoutes[0].children) {
                  if(accessRoutes[0].children[0]&&accessRoutes[0].children[0].children&&accessRoutes[0].children[0].children.length > 0) {
                    // 三级子菜单
                    pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path + '/' + accessRoutes[0].children[0].children[0].path
                  } else {
                    // 二级子菜单
                    pathIndex = accessRoutes[0].path + '/' + accessRoutes[0].children[0].path
                  }
                }
              }
              // replace: true只是一个设置信息，告诉VUE本次操作后，不能通过浏览器后退按钮，返回前一个路由。
              next({ path: pathIndex, replace: true }) // hack方法 确保addRoutes已完成
            } else {
              // 如果是点击了一个菜单，然后刷新，保持在当前的页面。
              // 如果是从其他页面点击，通过打开新窗口跳转路由。如从当前故障报警详情里跳到实时监控页面。
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
              // 使用next({ ...to, replace: true })来确保addRoutes()时动态添加的路由已经被完全加载上去。
            }
            // 修改默认首页end
          })
        })
        .catch(err => {
          store.dispatch('LogOut').then(() => {
            Message.error(err)
            next({ path: '/login' })
          })
        })
      } else {
        // 跳转到对应的页面

        next()
      }
    }
  } else {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      // next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页。
      next(`/login`) // 否则全部重定向到登录页。

      // 但to.fullPath有可能为%2F，即http://172.16.6.205:9090/login?redirect=%2F，不带任何跳转路由。这时候，请看login.vue的跳转方法。
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
