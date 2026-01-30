<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-circle">
          <el-icon><Monitor /></el-icon>
        </div>
        <h2 class="title">号池管理系统</h2>
        <p class="subtitle">高效 · 安全 · 便捷的号码资源管理平台</p>
      </div>

      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入账号" 
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input 
              v-model="loginForm.captcha" 
              placeholder="验证码" 
              :prefix-icon="Key" 
              style="flex: 1"
            />
            <div class="captcha-img" @click="refreshCaptcha" title="点击刷新">
              {{ captchaCode }}
            </div>
          </div>
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="rememberMe">记住账号</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>

        <el-button 
          type="primary" 
          :loading="loading" 
          class="login-btn" 
          @click="handleLogin"
        >
          {{ loading ? '登 录 中...' : '立 即 登 录' }}
        </el-button>
        
        <div class="tips">
          <span>测试账号：admin / district / importer</span>
          <span>密码：任意</span>
        </div>
      </el-form>
    </div>
    
    <div class="footer">
      Copyright © 2023 抢号管理系统 All Rights Reserved.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Monitor } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)
const captchaCode = ref('8888') // 模拟验证码

const loginForm = reactive({
  username: 'admin', // 默认填好方便你测试
  password: '',
  captcha: ''
})

// 表单校验规则
const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 刷新验证码（模拟）
const refreshCaptcha = () => {
  const codes = ['1234', 'ABCD', '8888', '5678']
  captchaCode.value = codes[Math.floor(Math.random() * codes.length)]
  loginForm.captcha = '' // 清空输入框
}

// 登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 校验验证码
      if (loginForm.captcha.toUpperCase() !== captchaCode.value) {
        ElMessage.error('验证码错误')
        refreshCaptcha()
        return
      }

      loading.value = true
      
      // 模拟后端请求延迟
      setTimeout(() => {
        loading.value = false
        
        // 简单的角色判断逻辑 (实际开发中由后端返回 token 和 userInfo)
        const roleMap: any = {
          'admin': '超级管理员',
          'district': '区县管理员',
          'importer': '导入管理员'
        }

        if (roleMap[loginForm.username]) {
          ElMessage.success(`欢迎回来，${roleMap[loginForm.username]}`)
          
          // 这里将用户信息存入 localStorage，以便 Layout 页面读取
          localStorage.setItem('userRole', loginForm.username)
          localStorage.setItem('userName', roleMap[loginForm.username])
          
          // 跳转到首页
          router.push('/')
        } else {
          ElMessage.error('账号不存在 (测试账号: admin, district, importer)')
        }
      }, 1000)
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100%;
  background-color: #2d3a4b; /* 深色背景 */
  background-image: linear-gradient(135deg, #2d3a4b 0%, #1f2a38 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.login-box {
  width: 420px;
  padding: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.logo-circle {
  width: 50px;
  height: 50px;
  background: #409EFF;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
}

.title {
  margin: 0;
  font-size: 26px;
  color: #303133;
  font-weight: 600;
}

.subtitle {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.captcha-row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.captcha-img {
  width: 100px;
  height: 40px;
  background: #f2f6fc;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 5px;
  font-style: italic;
  color: #409EFF;
  font-size: 18px;
  user-select: none;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.login-btn {
  width: 100%;
  font-size: 16px;
  letter-spacing: 2px;
  padding: 20px 0;
}

.tips {
  margin-top: 20px;
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.footer {
  position: absolute;
  bottom: 20px;
  color: #757d8a;
  font-size: 12px;
}
</style>