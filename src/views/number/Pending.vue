<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header">
        <span class="title">待沟通订单</span>
        <div class="right-tools">
          <el-button icon="Refresh" circle @click="fetchData" />
        </div>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="订单号" width="80" align="center" />
        
        <el-table-column label="客户信息" min-width="200">
          <template #default="scope">
            <div class="info-row"><el-icon><User /></el-icon> {{ scope.row.customer_name }}</div>
            <div class="info-row"><el-icon><Iphone /></el-icon> {{ scope.row.customer_phone }}</div>
            <div class="info-row address"><el-icon><Location /></el-icon> {{ scope.row.customer_address }}</div>
          </template>
        </el-table-column>

        <el-table-column label="意向号码" width="160" align="center">
          <template #default="scope">
            <div class="phone-text">{{ scope.row.phone_number }}</div>
            <el-tag size="small" type="info">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="申请时间" prop="apply_time" width="180" align="center" />

        <el-table-column label="业务操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              type="success" 
              size="small" 
              icon="Check"
              :loading="processingId === scope.row.id"
              :disabled="processingId !== 0"
              @click="quickHandle(scope.row, 2)"
            >已办理</el-button>
            <el-button 
              type="danger" 
              size="small" 
              icon="Close"
              :loading="processingId === scope.row.id"
              :disabled="processingId !== 0"
              @click="quickHandle(scope.row, 3)"
            >拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Iphone, Location, Refresh, Check, Close } from '@element-plus/icons-vue'
import request from '@/utils/request'

interface OrderItem {
  id: number
  customer_name: string
  customer_phone: string
  customer_address: string
  phone_number: string
  category: string
  apply_time: string
}

const loading = ref(false)
const processingId = ref(0) // 记录当前正在处理哪一行
const tableData = ref<OrderItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/order/list', {
      params: { page: currentPage.value, size: pageSize.value, status: 1 }
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const handlePageChange = (val: number) => { currentPage.value = val; fetchData() }

// 快速处理逻辑
const quickHandle = (row: OrderItem, action: number) => {
  const actionText = action === 2 ? '办理成功' : '拒绝/释放'
  const actionType = action === 2 ? 'success' : 'warning'

  ElMessageBox.confirm(
    `确认将订单 [${row.customer_name}] 标记为“${actionText}”吗？`,
    '操作确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: actionType }
  ).then(async () => {
    // 1. 开始转圈
    processingId.value = row.id
    try {
      await request.post('/order/handle', {
        order_id: row.id,
        action: action
      })
      ElMessage.success('操作成功')
      // 2. 只有成功了才刷新
      await fetchData() 
    } catch (e) {
      // 失败了不做处理
    } finally {
      // 3. 停止转圈
      processingId.value = 0
    }
  })
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.page-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: bold; border-left: 4px solid #409EFF; padding-left: 10px; }
.info-row { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; font-size: 14px; }
.address { color: #666; font-size: 12px; }
.phone-text { font-family: Consolas, monospace; font-size: 16px; font-weight: bold; color: #E6A23C; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>