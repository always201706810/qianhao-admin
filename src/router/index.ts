import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { ElMessage } from 'element-plus'

import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    // ✅ 优化：动态重定向
    // 如果是区县管理员，进门直接去 "待沟通订单"
    // 其他人（超级管理员、号码管理员），进门去 "数据分析"
    redirect: () => {
      const role = localStorage.getItem('role')
      if (role === 'district_admin') {
        return '/number/pending'
      }
      return '/number/analysis'
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/number/Analysis.vue'), 
        // ✅ 加上权限限制
        meta: { title: '数据大屏', icon: 'Odometer', roles: ['admin', 'import_admin'] }
      },
      
      // --- 号码管理模块 ---
      {
        path: '/number/process',
        name: 'NumberProcess',
        component: () => import('@/views/number/Process.vue'),
        meta: { title: '号码池管理', icon: 'List', roles: ['admin', 'import_admin'] }
      },
      {
        path: '/number/pending',
        name: 'NumberPending',
        component: () => import('@/views/number/Pending.vue'),
        meta: { title: '待沟通订单', icon: 'Timer', roles: ['admin', 'district_admin'] }
      },
      {
        path: '/number/completed',
        name: 'NumberCompleted',
        component: () => import('@/views/number/Completed.vue'),
        meta: { title: '已完成订单', icon: 'Check', roles: ['admin', 'district_admin'] }
      },
      // {
      //   path: '/number/all',
      //   name: 'NumberAll',
      //   component: () => import('@/views/number/AllOrders.vue'),
      //   meta: { title: '全部订单(纠错)', icon: 'Files', roles: ['admin', 'district_admin'] }
      // },
      {
        path: '/number/analysis',
        name: 'NumberAnalysis',
        component: () => import('@/views/number/Analysis.vue'),
        // ✅ 加上权限限制：区县管理员不可见
        meta: { title: '数据分析', icon: 'TrendCharts', roles: ['admin', 'import_admin'] } 
      },
      
      // --- 系统管理模块 ---
      {
        path: '/system/users',
        name: 'SystemUsers',
        component: () => import('@/views/system/Users.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['admin'] }
      },
      {
        path: '/system/logs',
        name: 'SystemLogs',
        component: () => import('@/views/system/Logs.vue'),
        meta: { title: '操作日志', icon: 'Document', roles: ['admin'] }
      }
    ]
  },
  // 404 路由
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const role = localStorage.getItem('role')
      if (role === 'district_admin') return '/number/pending'
      return '/number/analysis'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// --- 路由守卫 ---
router.beforeEach((to, from, next) => {
  NProgress.start()
  
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role') || ''
  
  if (to.path === '/login') {
    if (token) {
      next('/') 
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login') 
    } else {
      // 权限判断
      if (to.meta.roles && Array.isArray(to.meta.roles)) {
        if (!to.meta.roles.includes(userRole)) {
          ElMessage.error('无权访问该页面')
          // 如果无权访问，踢回到各自的安全页面
          if (userRole === 'district_admin') {
            next('/number/pending')
          } else {
            next('/number/analysis')
          }
          return
        }
      }
      next()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router