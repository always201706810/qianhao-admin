import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  // 新增：登录页路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  
  // 主应用路由
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/number/pending',
    children: [
      // === 一级菜单：号码办理 ===
      {
        path: '/number/pending',
        name: 'Pending',
        component: () => import('../views/number/Pending.vue'),
        meta: { title: '待沟通', roles: ['admin', 'district'] }
      },
      {
        path: '/number/completed',
        name: 'Completed',
        component: () => import('../views/number/Completed.vue'),
        meta: { title: '已沟通', roles: ['admin', 'district'] }
      },
      {
        path: '/number/process',
        name: 'Process',
        component: () => import('../views/number/Process.vue'),
        meta: { title: '数据处理', roles: ['admin', 'importer'] }
      },
      {
        path: '/number/analysis',
        name: 'Analysis',
        component: () => import('../views/number/Analysis.vue'),
        meta: { title: '数据分析', roles: ['admin', 'importer'] }
      },

      // === 一级菜单：基础信息管理 ===
      {
        path: '/system/logs',
        name: 'Logs',
        component: () => import('../views/system/Logs.vue'),
        meta: { title: '用户日志', roles: ['admin'] }
      },
      {
        path: '/system/permissions',
        name: 'Permissions',
        component: () => import('../views/system/Permissions.vue'),
        meta: { title: '用户与权限管理', roles: ['admin'] }
      },
      {
        path: '/system/users',
        name: 'Users',
        component: () => import('../views/system/Users.vue'),
        meta: { title: '用户信息管理', roles: ['admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简单的路由守卫（防止没登录直接进后台）
router.beforeEach((to, from, next) => {
  // 从 localStorage 获取登录状态
  const isLogin = localStorage.getItem('userRole')
  
  if (to.path === '/login') {
    next()
  } else {
    // 如果没有登录，强制跳回登录页
    if (!isLogin) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router