<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header">
        <span class="title">系统用户管理</span>
        <div class="right-tools">
          <el-button type="primary" icon="Plus" @click="openDialog('add')">新增用户</el-button>
          <el-button icon="Refresh" circle @click="fetchData" />
        </div>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nick_name" label="昵称" width="150" />
        
        <el-table-column label="角色" width="180" align="center">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">{{ getRoleText(scope.row.role) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="归属区县" min-width="150" align="center">
          <template #default="scope">
             <span v-if="scope.row.role === 'district_admin'">{{ scope.row.district_name || '未绑定' }}</span>
             <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="create_time" label="创建时间" width="180" align="center" />

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增用户' : '编辑用户'" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="用户名" v-if="dialogType === 'add'">
          <el-input v-model="formData.username" placeholder="登录账号" />
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input v-model="formData.password" type="password" show-password :placeholder="dialogType === 'edit' ? '留空则不修改' : '登录密码'" />
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="formData.nick_name" placeholder="显示名称" />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="admin" />
            <el-option label="号码导入员" value="import_admin" />
            <el-option label="区县管理员" value="district_admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="归属区县" v-if="formData.role === 'district_admin'">
          <el-select v-model="formData.district_id" placeholder="请选择区县" style="width: 100%">
             <el-option 
               v-for="item in districtList" 
               :key="item.id" 
               :label="item.name" 
               :value="item.id" 
             />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const districtList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)

const formData = reactive({
  id: 0,
  username: '',
  password: '',
  nick_name: '',
  role: '',
  district_id: undefined as number | undefined
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/system/user/list', { params: { page: 1, size: 100 } })
    tableData.value = res.list || []
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const fetchDistricts = async () => {
  try {
    const res: any = await request.get('/district/list')
    districtList.value = res.list || []
  } catch (e) {}
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    formData.id = row.id
    formData.username = row.username
    formData.nick_name = row.nick_name
    formData.role = row.role
    formData.district_id = row.district_id || undefined
    formData.password = '' // 编辑时不回显密码
  } else {
    formData.id = 0
    formData.username = ''
    formData.password = ''
    formData.nick_name = ''
    formData.role = ''
    formData.district_id = undefined
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (dialogType.value === 'add' && !formData.username) return ElMessage.warning('请输入用户名')
  if (dialogType.value === 'add' && !formData.password) return ElMessage.warning('请输入密码')
  if (!formData.role) return ElMessage.warning('请选择角色')
  
  if (formData.role === 'district_admin' && !formData.district_id) {
    return ElMessage.warning('区县管理员必须绑定区县')
  }

  submitLoading.value = true
  try {
    const url = dialogType.value === 'add' ? '/system/user/add' : '/system/user/update'
    await request.post(url, formData)
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  } catch (e) {
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除用户 ${row.username}?`, '提示', { type: 'warning' }).then(async () => {
    // 需要后端补充 DeleteUser 接口，如果没写，暂时只是前端演示
    // await request.post('/system/user/delete', { id: row.id })
    // ElMessage.success('删除成功')
    // fetchData()
    ElMessage.warning('后端需补充 Delete 接口')
  })
}

const getRoleText = (role: string) => {
  const map: any = { admin: '超级管理员', import_admin: '号码导入员', district_admin: '区县管理员' }
  return map[role] || role
}
const getRoleType = (role: string) => {
  const map: any = { admin: 'danger', import_admin: 'primary', district_admin: 'success' }
  return map[role] || 'info'
}

onMounted(() => {
  fetchData()
  fetchDistricts()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: bold; border-left: 4px solid #409EFF; padding-left: 10px; }
.text-gray { color: #909399; }
</style>