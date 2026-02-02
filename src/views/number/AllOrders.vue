<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header">
        <span class="title">全部订单记录</span>
        <div class="right-tools">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px" @change="fetchData">
            <el-option label="待沟通" :value="1" />
            <el-option label="已办理" :value="2" />
            <el-option label="已拒绝" :value="3" />
          </el-select>
          <el-button icon="Refresh" circle @click="fetchData" />
        </div>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        
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

        <el-table-column label="申请时间" prop="apply_time" width="170" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="warning">待沟通</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="success">已办理</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              icon="Edit" 
              @click="openCorrect(scope.row)"
            >状态纠错</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="订单状态纠错" width="400px">
      <div class="warning-box">
        <el-icon><Warning /></el-icon>
        注意：修改状态会联动变更号码的占用状态。如果号码已被他人抢占，将无法修改成功。
      </div>
      
      <el-form :model="form" label-width="80px" style="margin-top: 20px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusType(currentOrder?.status)">{{ getStatusText(currentOrder?.status) }}</el-tag>
        </el-form-item>
        
        <el-form-item label="变更为">
          <el-select v-model="form.action" placeholder="请选择新状态">
            <el-option label="待沟通 (重置)" :value="1" />
            <el-option label="已办理 (成交)" :value="2" />
            <el-option label="已拒绝 (释放)" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCorrection" :loading="submitLoading">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Iphone, Location, Warning } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const filterStatus = ref<number | undefined>(undefined)

const dialogVisible = ref(false)
const submitLoading = ref(false)
const currentOrder = ref<any>(null)
const form = reactive({
  action: 1
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/order/list', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        status: filterStatus.value || 0 // 0或不传代表查全部
      }
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

// 打开纠错
const openCorrect = (row: any) => {
  currentOrder.value = row
  form.action = row.status // 默认选中当前状态
  dialogVisible.value = true
}

const submitCorrection = async () => {
  if (form.action === currentOrder.value.status) {
    ElMessage.warning('状态未发生变更')
    return
  }

  submitLoading.value = true
  try {
    await request.post('/order/handle', {
      order_id: currentOrder.value.id,
      action: form.action,
      district_id: currentOrder.value.district_id // 保持原区县不变，或者你可以加个下拉框允许改
    })
    ElMessage.success('状态已修正')
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    // 错误已拦截
  } finally {
    submitLoading.value = false
  }
}

const getStatusType = (status: number) => {
  if (status === 1) return 'warning'
  if (status === 2) return 'success'
  return 'danger'
}
const getStatusText = (status: number) => (['', '待沟通', '已办理', '已拒绝'][status] || '未知')

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: bold; border-left: 4px solid #909399; padding-left: 10px; }
.info-row { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; font-size: 14px; }
.address { color: #666; font-size: 12px; }
.phone-text { font-family: Consolas, monospace; font-size: 16px; font-weight: bold; color: #E6A23C; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.warning-box { background: #fdf6ec; color: #e6a23c; padding: 10px; border-radius: 4px; font-size: 12px; display: flex; align-items: center; gap: 5px; }
</style>