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
        :rules="rules"
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

        <el-form-item prop="code">
          <div class="captcha-row">
            <el-input 
              v-model="loginForm.code" 
              placeholder="验证码" 
              :prefix-icon="Key"
              @keyup.enter="handleLogin"
            />
            <img 
              v-if="captchaUrl"
              :src="captchaUrl" 
              class="captcha-img" 
              @click="getCaptcha" 
              alt="验证码"
              title="点击刷新"
            />
          </div>
        </el-form-item>

        <el-form-item>
            <el-checkbox v-model="loginForm.rememberMe" style="color: #666;">记住账号</el-checkbox>
        </el-form-item>

        <el-button 
          type="primary" 
          :loading="loading" 
          class="login-btn" 
          @click="handleLogin"
        >
          {{ loading ? '登 录 中...' : '立 即 登 录' }}
        </el-button>

      </el-form>
    </div>
    
    <div class="footer">
      Copyright © 2026 抢号管理系统 All Rights Reserved.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Monitor } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  code: '',      
  captchaId: '',  
  rememberMe: false 
})

const captchaUrl = ref('')

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 1. 获取验证码
const getCaptcha = async () => {
  try {
    const res: any = await request.get('/base/captcha')
    if (res) {
        captchaUrl.value = res.base64
        loginForm.captchaId = res.captcha_id
    }
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

// 2. 登录处理 (这里是关键修改点)
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // 请求路径改为 /base/login 以匹配后端
        const res: any = await request.post('/user/login', {
          username: loginForm.username,
          password: loginForm.password,
          captcha: loginForm.code,       
          captcha_id: loginForm.captchaId 
        })
        
        ElMessage.success('登录成功')

        // ✅ 1. 存储核心数据
        localStorage.setItem('token', res.token)
        localStorage.setItem('role', res.role) // 存储后端返回的角色
        
        // ✅ 2. 存储用户详情 (可选，用于右上角显示昵称等)
        localStorage.setItem('user_info', JSON.stringify({
            username: res.username,
            nick_name: res.nick_name,
            district_id: res.district_id
        }))

        // ✅ 3. 记住账号逻辑 (保持原样)
        if (loginForm.rememberMe) {
          localStorage.setItem('saved_username', loginForm.username)
          localStorage.setItem('is_remember', 'true')
        } else {
          localStorage.removeItem('saved_username')
          localStorage.removeItem('is_remember')
        }
        
        router.push('/')
        
      } catch (error: any) {
        getCaptcha()
        loginForm.password = ''
        loginForm.code = ''
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  getCaptcha()
  const savedUsername = localStorage.getItem('saved_username')
  const isRemember = localStorage.getItem('is_remember')
  
  if (savedUsername && isRemember === 'true') {
    loginForm.username = savedUsername
    loginForm.rememberMe = true
  }
})
</script>

<style scoped>
/* 保持你原有的样式完全不变 */
.login-container {
  height: 100vh;
  width: 100%;
  background-color: #2d3a4b; 
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
  width: 120px; 
  height: 40px;
  background: #f2f6fc;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  object-fit: contain; /* 让图片自适应 */
}

.login-btn {
  width: 100%;
  font-size: 16px;
  letter-spacing: 2px;
  padding: 20px 0;
}

.footer {
  position: absolute;
  bottom: 20px;
  color: #757d8a;
  font-size: 12px;
}
</style>