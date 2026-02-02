import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入 Layout (确保路径正确)
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
    redirect: '/number/process', // 登录后默认跳到这里
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        // 如果你没有 dashboard 页面，先用 Process 占位
        component: () => import('@/views/number/Process.vue'), 
        meta: { title: '首页', icon: 'Odometer' }
      },
      // --- 号码管理模块 ---
      {
        path: '/number/process',
        name: 'NumberProcess',
        component: () => import('@/views/number/Process.vue'),
        meta: { title: '号码池管理', icon: 'List' }
      },
      {
        path: '/number/pending',
        name: 'NumberPending',
        component: () => import('@/views/number/Pending.vue'),
        meta: { title: '待沟通订单', icon: 'Timer' }
      },
      {
        path: '/number/completed',
        name: 'NumberCompleted',
        component: () => import('@/views/number/Completed.vue'),
        meta: { title: '已完成订单', icon: 'Check' }
      },
      {
        path: '/number/all',
        name: 'NumberAll',
        component: () => import('@/views/number/AllOrders.vue'),
        meta: { title: '全部订单(纠错)', icon: 'Files' }
      },
      {
        path: '/number/analysis',
        name: 'NumberAnalysis',
        component: () => import('@/views/number/Analysis.vue'),
        meta: { title: '数据分析', icon: 'TrendCharts' }
      },
      // --- 系统管理模块 ---
      {
        path: '/system/users',
        name: 'SystemUsers',
        component: () => import('@/views/system/Users.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: '/system/logs',
        name: 'SystemLogs',
        component: () => import('@/views/system/Logs.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      }
    ]
  },
  // 404 路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/number/process'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// --- 路由守卫 (关键！) ---
router.beforeEach((to, from, next) => {
  NProgress.start()
  
  const token = localStorage.getItem('token')
  
  // 1. 如果去的是登录页
  if (to.path === '/login') {
    // 如果已有 token，直接踢回首页
    if (token) {
      next('/')
    } else {
      next()
    }
  } 
  // 2. 如果去的是非登录页
  else {
    // 如果没有 token，踢回登录页
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router