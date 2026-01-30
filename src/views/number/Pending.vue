<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>待沟通列表</span>
          <el-button type="primary" link icon="Refresh" @click="fetchData">刷新数据</el-button>
        </div>
      </template>

      <el-table 
        v-loading="loading" 
        :data="tableData" 
        border 
        style="width: 100%" 
        stripe
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        
        <el-table-column label="用户信息" min-width="120">
          <template #default="scope">
            <div style="font-weight: bold">{{ scope.row.userName }}</div>
            <div style="color: #666; font-size: 12px">{{ scope.row.userPhone }}</div>
          </template>
        </el-table-column>

        <el-table-column label="所选号码" width="150" align="center">
          <template #default="scope">
            <span class="highlight-number">{{ scope.row.number }}</span>
          </template>
        </el-table-column>

        <el-table-column label="号码类别" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getCategoryType(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="收货/办理地址" min-width="200" show-overflow-tooltip />

        <el-table-column prop="applyTime" label="申请时间" width="180" align="center" />

        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <el-button 
              type="success" 
              size="small" 
              icon="Check"
              @click="handleComplete(scope.row)"
            >已办理</el-button>
            
            <el-button 
              type="danger" 
              size="small" 
              icon="Close"
              @click="handleReject(scope.row)"
            >拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Check, Close } from '@element-plus/icons-vue'

// --- 1. 定义数据接口 ---
interface PendingItem {
  id: number
  userName: string
  userPhone: string
  number: string
  category: '特等号' | '一等号' | '普通号'
  address: string
  applyTime: string
}

// --- 2. 状态定义 ---
const loading = ref(false)
const searchForm = reactive({
  name: '',
  phone: ''
})
const tableData = ref<PendingItem[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// --- 3. 模拟数据加载 ---
const fetchData = () => {
  loading.value = true
  // 模拟 API 请求延迟
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        userName: '张三',
        userPhone: '13800138000',
        number: '888888',
        category: '特等号',
        address: '某某市某某区科技路 101 号',
        applyTime: '2023-10-27 10:30:00'
      },
      {
        id: 2,
        userName: '李四',
        userPhone: '15966667777',
        number: '666666',
        category: '一等号',
        address: '某某市某某区建设大道 55 号',
        applyTime: '2023-10-27 11:15:00'
      },
      {
        id: 3,
        userName: '王五',
        userPhone: '13344445555',
        number: '1314520',
        category: '普通号',
        address: '某某市某某区幸福小区 2-301',
        applyTime: '2023-10-27 14:20:00'
      }
    ]
    pagination.total = 3
    loading.value = false
  }, 500)
}

// --- 4. 辅助函数 ---
const getCategoryType = (category: string) => {
  if (category === '特等号') return 'danger'
  if (category === '一等号') return 'warning'
  return 'success'
}

// --- 5. 交互逻辑 ---
const handleSearch = () => {
  ElMessage.success('搜索功能：触发后端查询接口')
  fetchData()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.phone = ''
  fetchData()
}

// 处理 "已办理"
const handleComplete = (row: PendingItem) => {
  ElMessageBox.confirm(
    `确认用户 [${row.userName}] 的号码 [${row.number}] 已办理成功？\n确认后号码将永久锁定。`,
    '办理确认',
    {
      confirmButtonText: '确认已办理',
      cancelButtonText: '取消',
      type: 'success',
    }
  ).then(() => {
    // 这里调用后端 API: POST /api/handle/complete
    loading.value = true
    setTimeout(() => {
      // 模拟成功
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      loading.value = false
      ElMessage.success('操作成功，该记录已移入“已沟通”列表')
    }, 500)
  }).catch(() => {})
}

// 处理 "拒绝"
const handleReject = (row: PendingItem) => {
  ElMessageBox.confirm(
    `确认拒绝办理？\n点击确认后，号码 [${row.number}] 将释放回号池，供他人重新抢注。`,
    '拒绝确认',
    {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 这里调用后端 API: POST /api/handle/reject
    loading.value = true
    setTimeout(() => {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      loading.value = false
      ElMessage.warning('已拒绝，号码释放回号池')
    }, 500)
  }).catch(() => {})
}

// 分页逻辑
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchData()
}
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchData()
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.table-card {
  min-height: 500px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.highlight-number {
  color: #409EFF;
  font-weight: bold;
  font-size: 16px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>