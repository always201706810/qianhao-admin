<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="办理状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="已办理" value="completed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="50" align="center" />
        
        <el-table-column prop="userName" label="用户姓名" width="120" />
        <el-table-column prop="userPhone" label="联系电话" width="150" />
        
        <el-table-column label="所选号码" width="150" align="center">
          <template #default="scope">
            <span style="font-weight: bold; color: #333">{{ scope.row.number }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="当前状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'danger'">
              {{ scope.row.status === 'completed' ? '已办理' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="handleTime" label="处理时间" width="180" align="center" />
        <el-table-column prop="operator" label="操作人" width="120" align="center" />
        <el-table-column prop="remark" label="备注说明" show-overflow-tooltip />

        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="openEditDialog(scope.row)">
              修改状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="修改办理状态" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="当前号码">
          <strong>{{ editForm.number }}</strong>
        </el-form-item>
        
        <el-form-item label="修改为">
          <el-radio-group v-model="editForm.newStatus">
            <el-radio label="pending">待沟通 (回退)</el-radio>
            <el-radio label="completed">已办理</el-radio>
            <el-radio label="rejected">已拒绝</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" placeholder="请填写修改原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { Search, Refresh, Edit } from '@element-plus/icons-vue'

// --- 类型定义 ---
interface CompletedItem {
  id: number
  userName: string
  userPhone: string
  number: string
  status: 'completed' | 'rejected'
  handleTime: string
  operator: string
  remark: string
}

// --- 状态数据 ---
const loading = ref(false)
const tableData = ref<CompletedItem[]>([])
const total = ref(0)
const dialogVisible = ref(false)

const searchForm = reactive({
  name: '',
  status: ''
})

// 编辑表单
const editForm = reactive({
  id: 0,
  number: '',
  newStatus: '',
  remark: ''
})

// --- 模拟数据加载 ---
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      {
        id: 101,
        userName: '赵六',
        userPhone: '13911112222',
        number: '999888',
        status: 'completed',
        handleTime: '2023-10-26 14:00:00',
        operator: '张管理员',
        remark: '用户已确认开户'
      },
      {
        id: 102,
        userName: '钱七',
        userPhone: '13700009999',
        number: '444444',
        status: 'rejected',
        handleTime: '2023-10-26 15:30:00',
        operator: '李管理员',
        remark: '用户电话打不通，超时释放'
      }
    ]
    total.value = 2
    loading.value = false
  }, 500)
}

// --- 交互逻辑 ---
const handleSearch = () => {
  ElMessage.success('查询已触发')
  fetchData()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  fetchData()
}

const handlePageChange = (page: number) => {
  console.log('翻页', page)
  fetchData()
}

// 打开修改弹窗
const openEditDialog = (row: CompletedItem) => {
  editForm.id = row.id
  editForm.number = row.number
  editForm.newStatus = row.status // 默认选中当前状态
  editForm.remark = ''
  dialogVisible.value = true
}

// 确认修改
const confirmEdit = () => {
  if (!editForm.newStatus) return
  
  // 模拟后端请求
  console.log('提交修改:', editForm)
  
  let msg = ''
  if (editForm.newStatus === 'pending') {
    msg = `号码 ${editForm.number} 已回退至“待沟通”列表`
  } else {
    msg = `号码 ${editForm.number} 状态已更新`
  }

  ElNotification({
    title: '修改成功',
    message: msg,
    type: 'success',
  })
  
  dialogVisible.value = false
  // 实际开发中，如果回退到 pending，应该从当前列表移除该条数据
  if (editForm.newStatus === 'pending') {
    tableData.value = tableData.value.filter(item => item.id !== editForm.id)
  } else {
    // 只是改了状态（比如拒绝变已办理），本地更新一下显示
    const item = tableData.value.find(i => i.id === editForm.id)
    if (item) item.status = editForm.newStatus as 'completed' | 'rejected'
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.search-card { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>