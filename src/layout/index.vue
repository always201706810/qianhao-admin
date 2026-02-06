<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside-menu">
      <div class="logo-box">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <span class="logo-text">号池管理系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :unique-opened="true"
        router
        class="el-menu-vertical"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Phone /></el-icon>
            <span>号码办理</span>
          </template>
          
          <el-menu-item 
            index="/number/pending"
            v-if="checkPermission(['admin', 'district_admin'])"
          >待沟通</el-menu-item>
          
          <el-menu-item 
            index="/number/completed"
            v-if="checkPermission(['admin', 'district_admin'])"
          >已沟通</el-menu-item>
          
          <el-menu-item 
            index="/number/process"
            v-if="checkPermission(['admin', 'import_admin'])"
          >数据处理</el-menu-item>
          
          <el-menu-item index="/number/analysis" v-if="checkPermission(['admin', 'import_admin'])">数据分析</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="2" v-if="checkPermission(['admin'])">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>基础信息管理</span>
          </template>
          <el-menu-item index="/system/users">用户信息</el-menu-item>
          <el-menu-item index="/system/logs">用户日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="navbar">
        <div class="navbar-left">
          <el-icon class="hamburger" size="20"><Expand /></el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="navbar-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-wrapper">
              <el-avatar :size="30" class="user-avatar" icon="UserFilled" />
              <span class="username">{{ username }}</span>
              <el-icon class="el-icon--right"><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Monitor, 
  Phone, 
  Setting, 
  Expand, 
  CaretBottom, 
  UserFilled 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 获取当前激活的菜单项（高亮显示）
const activeMenu = computed(() => route.path)

// 获取当前页面标题（用于面包屑）
const currentTitle = computed(() => route.meta.title || '控制台')

// --- 获取用户信息逻辑优化 ---
// 尝试从 user_info JSON 中解析昵称，如果失败则取 role，再失败显示默认值
const getUserName = () => {
  const infoStr = localStorage.getItem('user_info')
  if (infoStr) {
    try {
      const info = JSON.parse(infoStr)
      return info.nick_name || info.username // 优先显示昵称
    } catch (e) {
      return localStorage.getItem('role') || '管理员'
    }
  }
  return localStorage.getItem('role') || '管理员'
}
const username = ref(getUserName())

// --- 权限控制核心逻辑 ---
const currentRole = localStorage.getItem('role') || ''

const checkPermission = (allowedRoles: string[]) => {
  // 1. 如果是 admin，无条件拥有所有权限
  if (currentRole === 'admin') return true
  // 2. 否则检查当前角色是否在允许名单里
  return allowedRoles.includes(currentRole)
}

// 处理下拉菜单点击
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 1. 清除所有缓存
      localStorage.clear()
      // 2. 提示
      ElMessage.success('已安全退出')
      // 3. 跳转回登录页
      router.push('/login')
    })
  } else if (command === 'profile') {
    ElMessage.info(`当前角色: ${currentRole}`)
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
}

/* --- 侧边栏样式 --- */
.aside-menu {
  background-color: #304156;
  color: #fff;
  transition: width 0.28s;
  overflow-x: hidden;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 1001;
}

.logo-box {
  height: 50px;
  line-height: 50px;
  text-align: center;
  background-color: #2b2f3a;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.el-menu-vertical {
  border-right: none;
}

/* --- 顶部导航栏样式 --- */
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.hamburger {
  margin-right: 15px;
  cursor: pointer;
  color: #606266;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #5a5e66;
}

.username {
  margin: 0 8px;
  font-weight: 500;
}

/* --- 主内容区样式 --- */
.app-main {
  background-color: #f0f2f5; 
  padding: 20px;
  overflow-y: auto;
}

/* 页面切换动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>