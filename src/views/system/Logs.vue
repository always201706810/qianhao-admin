<template>
  <div class="page-container">
    <el-card shadow="never">
      <el-form :inline="true" class="search-form">
        <el-form-item label="操作人">
          <el-input placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search">查询日志</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="logData" border style="width: 100%" size="small">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="username" label="操作账号" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="module" label="操作模块" width="120">
          <template #default="scope">
            <el-tag size="small" effect="plain">{{ scope.row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="操作内容" />
        <el-table-column prop="status" label="结果" width="80" align="center">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.status === '成功' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination layout="total, prev, pager, next" :total="100" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const logData = ref([
  { time: '2023-10-27 15:30:22', username: 'admin', ip: '192.168.1.10', module: '用户管理', content: '新增了用户 [district_03]', status: '成功' },
  { time: '2023-10-27 15:10:05', username: 'district_01', ip: '114.22.10.5', module: '待沟通', content: '将号码 [888888] 标记为 [已办理]', status: '成功' },
  { time: '2023-10-27 14:00:00', username: 'importer_01', ip: '114.22.10.8', module: '数据处理', content: '导入了 Excel 文件 [号池10月.xlsx]', status: '成功' },
  { time: '2023-10-27 13:55:12', username: 'admin', ip: '192.168.1.10', module: '系统登录', content: '登录系统', status: '成功' },
  { time: '2023-10-27 12:30:00', username: 'unknown', ip: '202.10.11.1', module: '系统登录', content: '尝试登录失败 (密码错误)', status: '失败' },
])
</script>

<style scoped>
.page-container { padding: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>