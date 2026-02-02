<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header">
        <span class="title">历史订单归档</span>
        <div class="right-tools">
          <el-button type="warning" plain icon="Search" @click="openHistory">
            全部记录 / 状态纠错
          </el-button>
          <el-button icon="Refresh" circle @click="fetchData" />
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="mb-20">
        <el-tab-pane label="✅ 已办理成功" name="success"></el-tab-pane>
        <el-tab-pane label="❌ 已拒绝/释放" name="rejected"></el-tab-pane>
      </el-tabs>

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
        <el-table-column label="当前状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 2" type="success" effect="dark">办理成功</el-tag>
            <el-tag v-else type="danger" effect="dark">已拒绝</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              icon="Edit" 
              @click="openCorrectDialog(scope.row)"
            >修改状态</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" @current-change="handlePageChange" />
      </div>
    </el-card>

    <el-dialog v-model="historyVisible" title="全部订单记录" width="85%" top="5vh">
      <div class="history-toolbar" style="margin-bottom: 10px; text-align: right;">
        <el-button icon="Refresh" circle @click="fetchHistory" />
      </div>
      <el-table :data="historyData" border height="500px" v-loading="historyLoading">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="客户" width="100" prop="customer_name" />
        <el-table-column label="号码" width="140" prop="phone_number" />
        <el-table-column label="状态" width="100" align="center">
           <template #default="scope">
             <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
           </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
           <template #default="scope">
              <el-button type="primary" link icon="Edit" @click="openCorrectDialog(scope.row)">修改</el-button>
           </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" style="margin-top: 10px">
         <el-pagination layout="prev, pager, next" :total="historyTotal" :page-size="20" @current-change="handleHistoryPageChange" />
      </div>
    </el-dialog>

    <el-dialog v-model="correctVisible" title="状态变更确认" width="400px" append-to-body>
      <div class="warning-box">
        <el-icon><Warning /></el-icon> 注意：修改状态会联动变更号码占用。
      </div>
      <el-form :model="correctForm" label-width="80px" style="margin-top: 20px">
        <el-form-item label="变更为">
          <el-select v-model="correctForm.action" placeholder="请选择新状态">
            <el-option label="待沟通 (重置)" :value="1" />
            <el-option label="已办理 (成交)" :value="2" />
            <el-option label="已拒绝 (释放)" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="correctVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCorrection" :loading="submitLoading">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { User, Iphone, Location, Refresh, Search, Edit, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeTab = ref('success')

// 获取主列表
const fetchData = async () => {
  loading.value = true
  try {
    const statusParam = activeTab.value === 'success' ? 2 : 3
    const res: any = await request.get('/order/list', {
      params: { page: currentPage.value, size: pageSize.value, status: statusParam }
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (e) { console.error(e) } 
  finally { loading.value = false }
}
const handleTabChange = () => { currentPage.value = 1; fetchData() }
const handlePageChange = (val: number) => { currentPage.value = val; fetchData() }

// --- 纠错逻辑 ---
const correctVisible = ref(false)
const submitLoading = ref(false)
const currentOrder = ref<any>(null)
const correctForm = reactive({ action: 1 })

const openCorrectDialog = (row: any) => {
  currentOrder.value = row
  correctForm.action = row.status
  correctVisible.value = true
}

const submitCorrection = async () => {
  if (correctForm.action === currentOrder.value.status) return ElMessage.warning('状态未变更')
  submitLoading.value = true
  try {
    await request.post('/order/handle', {
      order_id: currentOrder.value.id,
      action: correctForm.action
    })
    ElMessage.success('状态已修正')
    correctVisible.value = false
    
    // 关键：修改成功后，刷新所有列表
    fetchData() 
    if (historyVisible.value) fetchHistory()
    // window.location.reload()
    
  } catch (e) {
    // 错误被拦截
  } finally {
    submitLoading.value = false
  }
}

// --- 历史记录弹窗逻辑 ---
const historyVisible = ref(false)
const historyLoading = ref(false)
const historyData = ref<any[]>([])
const historyTotal = ref(0)
const historyPage = ref(1)

const openHistory = () => { historyVisible.value = true; fetchHistory() }
const fetchHistory = async () => {
  historyLoading.value = true
  try {
    const res: any = await request.get('/order/list', { params: { page: historyPage.value, size: 20, status: 0 } })
    historyData.value = res.list || []
    historyTotal.value = res.total || 0
  } catch(e){} finally { historyLoading.value = false }
}
const handleHistoryPageChange = (val: number) => { historyPage.value = val; fetchHistory() }

const getStatusType = (status: number) => { if(status===1)return 'warning'; if(status===2)return 'success'; return 'danger' }
const getStatusText = (status: number) => (['', '待沟通', '已办理', '已拒绝'][status] || '未知')

onMounted(() => { fetchData() })
</script>

<style scoped>
.page-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: bold; border-left: 4px solid #67C23A; padding-left: 10px; }
.info-row { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; font-size: 14px; }
.phone-text { font-family: Consolas, monospace; font-size: 16px; font-weight: bold; color: #909399; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.warning-box { background: #fdf6ec; color: #e6a23c; padding: 10px; border-radius: 4px; font-size: 12px; }
</style>