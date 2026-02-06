<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header">
        <span class="title">待沟通订单</span>
        <div class="right-tools">
          <el-button icon="Refresh" circle @click="fetchData" style="margin-right: 15px"/>
          
          <el-input v-model="query.phoneNumber" placeholder="意向号码" style="width: 140px" clearable @change="fetchData" />
          <el-input v-model="query.customerName" placeholder="客户姓名" style="width: 120px" clearable @change="fetchData" />
          <el-input v-model="query.customerPhone" placeholder="客户电话" style="width: 140px" clearable @change="fetchData" />
          
          <el-button type="primary" :icon="Search" @click="fetchData">查询</el-button>
        </div>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column label="订单编号" width="160" align="center">
          <template #default="scope">
            <span class="order-id">{{ formatOrderId(scope.row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="意向号码" width="160" align="center">
          <template #default="scope">
            <div class="phone-text">{{ scope.row.phone_number }}</div>
            <el-tag size="small" type="info">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="客户姓名" width="120" align="center" prop="customer_name">
           <template #default="scope">
             <el-icon><User /></el-icon> {{ scope.row.customer_name }}
           </template>
        </el-table-column>

        <el-table-column label="客户电话" width="140" align="center">
           <template #default="scope">
             <el-icon><Iphone /></el-icon> {{ scope.row.customer_phone }}
           </template>
        </el-table-column>
        
        <el-table-column label="地址" min-width="150" show-overflow-tooltip>
           <template #default="scope">
             <el-icon><Location /></el-icon> {{ scope.row.customer_address }}
           </template>
        </el-table-column>

        <el-table-column label="申请时间" prop="apply_time" width="180" align="center" />

        <el-table-column label="业务操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              type="success" 
              size="small" 
              icon="Check"
              :loading="processingId === scope.row.id"
              :disabled="processingId !== 0"
              @click="quickHandle(scope.row, 2)"
            >办理</el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Iphone, Location, Refresh, Check, Close, Search } from '@element-plus/icons-vue'
import request from '@/utils/request'
import dayjs from 'dayjs' // 如果项目没装dayjs，用下面的 split 处理

const loading = ref(false)
const processingId = ref(0)
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 独立的搜索条件
const query = reactive({
  phoneNumber: '',
  customerName: '',
  customerPhone: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/order/list', {
      params: { 
        page: currentPage.value, 
        size: pageSize.value, 
        status: 1,
        // 传给后端的新字段
        phone_number: query.phoneNumber || undefined,
        customer_name: query.customerName || undefined,
        customer_phone: query.customerPhone || undefined
      }
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (e) { console.error(e) } 
  finally { loading.value = false }
}

const handlePageChange = (val: number) => { currentPage.value = val; fetchData() }

// 格式化订单号：ORD-20260201-105
const formatOrderId = (row: any) => {
  // 简单提取日期部分
  const datePart = row.apply_time.replace(/-/g, '').substring(0, 8) 
  return `ORD-${datePart}-${row.id}`
}

const quickHandle = (row: any, action: number) => {
  const actionText = action === 2 ? '办理成功' : '拒绝/释放'
  const actionType = action === 2 ? 'success' : 'warning'

  ElMessageBox.confirm(
    `确认将订单 [${row.customer_name}] 标记为“${actionText}”吗？`,
    '操作确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: actionType }
  ).then(async () => {
    processingId.value = row.id
    try {
      await request.post('/order/handle', {
        order_id: row.id,
        action: action
      })
      ElMessage.success('操作成功')
      await fetchData() 
    } catch (e) {
    } finally {
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
.right-tools { display: flex; gap: 10px; } /* 让搜索框有间距 */
.phone-text { font-family: Consolas, monospace; font-size: 16px; font-weight: bold; color: #E6A23C; }
.order-id { font-family: Consolas, monospace; color: #606266; font-weight: bold;}
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>