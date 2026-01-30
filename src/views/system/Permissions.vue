<template>
  <div class="page-container">
    <el-card shadow="never">
      <div slot="header">
        <span>角色权限配置</span>
        <span style="font-size: 12px; color: #999; margin-left: 10px">此处配置各角色可访问的菜单页面</span>
      </div>
      
      <el-table :data="roleData" border style="width: 100%; margin-top: 15px">
        <el-table-column prop="roleName" label="角色名称" width="180" font-weight="bold" />
        <el-table-column prop="code" label="角色标识" width="150" />
        <el-table-column prop="desc" label="职能描述" width="250" />
        <el-table-column label="拥有权限 (可见菜单)">
          <template #default="scope">
            <el-tag 
              v-for="perm in scope.row.permissions" 
              :key="perm" 
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ perm }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default>
            <el-button link type="primary" icon="Edit">权限设置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Edit } from '@element-plus/icons-vue'

const roleData = ref([
  {
    roleName: '超级管理员',
    code: 'admin',
    desc: '拥有系统所有权限，可管理用户及配置',
    permissions: ['待沟通', '已沟通', '数据处理', '数据分析', '基础信息管理']
  },
  {
    roleName: '区县管理员',
    code: 'district',
    desc: '负责具体区县的号码沟通与办理',
    permissions: ['待沟通', '已沟通']
  },
  {
    roleName: '导入管理员',
    code: 'importer',
    desc: '负责号码池的数据导入与维护',
    permissions: ['数据处理', '数据分析']
  }
])
</script>

<style scoped>
.page-container { padding: 20px; }
</style>