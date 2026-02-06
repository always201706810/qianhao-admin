<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header">
        <span class="title">业务记录总览</span>
        
        <div class="right-tools">
          <el-button icon="Refresh" circle @click="fetchData" style="margin-right: 15px"/>

          <el-input v-model="query.phoneNumber" placeholder="意向号码" style="width: 140px" clearable @change="fetchData" />
          <el-input v-model="query.customerName" placeholder="客户姓名" style="width: 120px" clearable @change="fetchData" />
          <el-input v-model="query.customerPhone" placeholder="客户电话" style="width: 140px" clearable @change="fetchData" />
          
          <el-button type="primary" :icon="Search" @click="fetchData">查询</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="mb-20">
        <el-tab-pane label="全部记录" name="all"></el-tab-pane>
        <el-tab-pane label="已办理" name="success"></el-tab-pane>
        <el-tab-pane label="已拒绝" name="rejected"></el-tab-pane>
        <el-tab-pane label="已过期" name="expired"></el-tab-pane>
      </el-tabs>

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

        <el-table-column label="客户姓名" width="120" align="center">
           <template #default="scope"><el-icon><User /></el-icon> {{ scope.row.customer_name }}</template>
        </el-table-column>
        
        <el-table-column label="客户电话" width="140" align="center">
           <template #default="scope"><el-icon><Iphone /></el-icon> {{ scope.row.customer_phone }}</template>
        </el-table-column>

        <el-table-column label="地址" min-width="150" show-overflow-tooltip>
           <template #default="scope"><el-icon><Location /></el-icon> {{ scope.row.customer_address }}</template>
        </el-table-column>

        <el-table-column label="申请时间" prop="apply_time" width="180" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="dark">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="openCorrectDialog(scope.row)">修改状态</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" @current-change="handlePageChange" />
      </div>
    </el-card>

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
            <el-option label="已过期 (失效)" :value="4" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
// 默认选全部，或者你可以改回 'success'
const activeTab = ref('all') 

// 搜索条件
const query = reactive({
  phoneNumber: '',
  customerName: '',
  customerPhone: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    // 映射 Tab 到具体的 Status 值
    let statusParam = 0
    if (activeTab.value === 'success') statusParam = 2
    else if (activeTab.value === 'rejected') statusParam = 3
    else if (activeTab.value === 'expired') statusParam = 4
    // else if (activeTab.value === 'all') statusParam = 0 (传0给后端就是查全部)
    else if (activeTab.value === 'all') statusParam = -1 // ✅ 修改这里：传 -1 给后端，表示“排除待沟通”
    const res: any = await request.get('/order/list', {
      params: { 
        page: currentPage.value, 
        size: pageSize.value, 
        status: statusParam,
        // 三个搜索字段
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

const handleTabChange = () => { currentPage.value = 1; fetchData() }
const handlePageChange = (val: number) => { currentPage.value = val; fetchData() }

const formatOrderId = (row: any) => {
  const datePart = row.apply_time.replace(/-/g, '').substring(0, 8) 
  return `ORD-${datePart}-${row.id}`
}

const getStatusType = (status: number) => { 
  if(status===1) return 'warning' // 待沟通
  if(status===2) return 'success' // 已办理
  if(status===3) return 'danger'  // 已拒绝
  if(status===4) return 'info'    // 已过期
  return 'info'
}

const getStatusText = (status: number) => (['', '待沟通', '已办理', '已拒绝', '已过期'][status] || '未知')

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

const submitCorrection = () => {
  // 1. 校验状态是否改变
  if (correctForm.action === currentOrder.value.status) {
    return ElMessage.warning('状态未发生变更')
  }

  // 2. 获取状态文字，用于提示
  const statusMap: any = { 1: '待沟通', 2: '已办理', 3: '已拒绝', 4: '已过期' }
  const targetText = statusMap[correctForm.action]

  // 3. 弹出二次确认框
  ElMessageBox.confirm(
    `确定将该订单状态修正为 “${targetText}” 吗？\n此操作将同步变更号码的占用/释放状态。`,
    '高风险操作确认',
    {
      confirmButtonText: '确定修正',
      cancelButtonText: '我再想想',
      type: 'warning'
    }
  ).then(async () => {
    // 4. 用户点击确定后，执行提交
    submitLoading.value = true
    try {
      await request.post('/order/handle', {
        order_id: currentOrder.value.id,
        action: correctForm.action
      })
      
      ElMessage.success('状态已成功修正')
      correctVisible.value = false // 关闭弹窗
      fetchData() // 刷新列表
      
    } catch (e) {
      // 错误已由 request 拦截器处理
    } finally {
      submitLoading.value = false
    }
  }).catch(() => {
    // 用户点击取消，什么都不做
  })
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.page-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: bold; border-left: 4px solid #67C23A; padding-left: 10px; }
.right-tools { display: flex; gap: 10px; }
.phone-text { font-family: Consolas, monospace; font-size: 16px; font-weight: bold; color: #909399; }
.order-id { font-family: Consolas, monospace; color: #606266; font-weight: bold;}
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.warning-box { background: #fdf6ec; color: #e6a23c; padding: 10px; border-radius: 4px; font-size: 12px; }
</style>