<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header-action">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增用户</el-button>
        <div class="search-box">
          <el-input v-model="searchKey" placeholder="输入用户名搜索" clearable @clear="handleSearch">
            <template #append><el-button icon="Search" @click="handleSearch" /></template>
          </el-input>
        </div>
      </div>

      <el-table :data="tableData" border style="margin-top: 20px" stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="登录账号" width="150" />
        <el-table-column prop="realName" label="真实姓名" width="150" />
        <el-table-column prop="role" label="所属角色" width="150">
          <template #default="scope">
            <el-tag :type="getRoleTag(scope.row.role)">{{ scope.row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center">
          <template #default>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="warning" size="small">重置密码</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination layout="total, prev, pager, next" :total="10" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchKey = ref('')

// 模拟数据
const tableData = ref([
  { id: 1, username: 'admin', realName: '系统管理员', role: 'admin', roleName: '超级管理员', phone: '13800000000', status: 1 },
  { id: 2, username: 'district_01', realName: '张主任', role: 'district', roleName: '区县管理员', phone: '13911112222', status: 1 },
  { id: 3, username: 'importer_01', realName: '李专员', role: 'importer', roleName: '导入管理员', phone: '13788889999', status: 1 },
  { id: 4, username: 'district_02', realName: '王科长', role: 'district', roleName: '区县管理员', phone: '15566667777', status: 0 },
])

const getRoleTag = (role: string) => {
  const map: any = { admin: 'danger', district: 'primary', importer: 'success' }
  return map[role] || 'info'
}

const handleAdd = () => ElMessage.info('点击了新增用户')
const handleSearch = () => ElMessage.success('搜索已触发')
</script>

<style scoped>
.page-container { padding: 20px; }
.header-action { display: flex; justify-content: space-between; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>