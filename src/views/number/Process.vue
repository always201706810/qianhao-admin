<template>
  <div class="page-container">
    <el-card shadow="never" class="action-card">
      <div class="toolbar">
        <div class="left-panel">
          <el-button type="primary" icon="Plus" @click="openDialog('add')">单个录入</el-button>
          
          <el-upload
            class="upload-btn"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".xlsx, .xls"
          >
            <el-button type="success" icon="Upload">Excel 批量导入</el-button>
          </el-upload>
          
          <el-button type="info" link icon="Download" @click="downloadTemplate">下载模板</el-button>
        </div>

        <div class="right-panel">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索号码..." 
            style="width: 200px" 
            clearable 
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="60" align="center" />
        
        <el-table-column prop="number" label="号码资源" align="center">
          <template #default="scope">
            <span class="number-font">{{ scope.row.number }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="号码类别" align="center">
          <template #default="scope">
            <el-tag :type="getCategoryTag(scope.row.category)" effect="light">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="当前状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'available' ? 'success' : 'info'" round>
              {{ scope.row.status === 'available' ? '待抢注' : '已锁定' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="importTime" label="导入时间" width="180" align="center" />

        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button 
              link 
              type="danger" 
              icon="Delete" 
              :disabled="scope.row.status !== 'available'"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :page-size="10"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增号码' : '编辑号码'"
      width="400px"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="手机号码">
          <el-input v-model="formData.number" placeholder="请输入号码" />
        </el-form-item>
        <el-form-item label="号码类别">
          <el-select v-model="formData.category" placeholder="请选择" style="width: 100%">
            <el-option label="特等号" value="特等号" />
            <el-option label="一等号" value="一等号" />
            <el-option label="普通号" value="普通号" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始状态" v-if="dialogType === 'add'">
          <el-radio-group v-model="formData.status">
            <el-radio label="available">待抢注</el-radio>
            <el-radio label="locked">锁定中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search, Edit, Delete } from '@element-plus/icons-vue'

// --- 类型定义 ---
interface NumberItem {
  id: number
  number: string
  category: string
  status: 'available' | 'locked'
  importTime: string
}

// --- 状态变量 ---
const loading = ref(false)
const tableData = ref<NumberItem[]>([])
const total = ref(0)
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')

// 表单数据
const formData = reactive({
  id: 0,
  number: '',
  category: '',
  status: 'available'
})

// --- 模拟数据加载 ---
const fetchData = (page = 1) => {
  loading.value = true
  setTimeout(() => {
    // 这里模拟从后端获取数据
    tableData.value = [
      { id: 1, number: '18888888888', category: '特等号', status: 'available', importTime: '2023-10-20' },
      { id: 2, number: '13666666666', category: '一等号', status: 'locked', importTime: '2023-10-21' },
      { id: 3, number: '13912345678', category: '普通号', status: 'available', importTime: '2023-10-22' },
      { id: 4, number: '15900001111', category: '普通号', status: 'available', importTime: '2023-10-22' },
    ]
    total.value = 100
    loading.value = false
  }, 400)
}

// --- 交互逻辑 ---
const handleSearch = () => {
  ElMessage.info(`正在搜索: ${searchQuery.value}`)
  fetchData()
}

const getCategoryTag = (cat: string) => {
  switch (cat) {
    case '特等号': return 'danger'
    case '一等号': return 'warning'
    default: return ''
  }
}

// 打开弹窗
const openDialog = (type: 'add' | 'edit', row?: NumberItem) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    formData.id = row.id
    formData.number = row.number
    formData.category = row.category
    formData.status = row.status
  } else {
    // 重置表单
    formData.id = 0
    formData.number = ''
    formData.category = '普通号'
    formData.status = 'available'
  }
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  if (!formData.number) return ElMessage.warning('请输入号码')
  
  loading.value = true
  setTimeout(() => {
    if (dialogType.value === 'add') {
      tableData.value.unshift({
        id: Date.now(),
        number: formData.number,
        category: formData.category,
        status: formData.status as any,
        importTime: new Date().toISOString().split('T')[0]
      })
      ElMessage.success('录入成功')
    } else {
      // 更新逻辑
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        tableData.value[index] = { ...tableData.value[index], ...formData }
      }
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    loading.value = false
  }, 300)
}

// 删除号码
const handleDelete = (row: NumberItem) => {
  ElMessageBox.confirm('确认删除该号码？删除后无法恢复。', '警告', { type: 'warning' })
    .then(() => {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      ElMessage.success('删除成功')
    })
}

// 模拟 Excel 导入
const handleFileChange = (file: any) => {
  // 这里可以引入 xlsx 库解析文件
  // import * as XLSX from 'xlsx'
  
  const loadingInstance = ElMessage.loading({
    message: `正在解析文件: ${file.name}...`,
    duration: 0
  })

  // 模拟解析耗时
  setTimeout(() => {
    loadingInstance.close()
    ElMessage.success(`成功导入 50 条号码数据！`)
    fetchData() // 刷新列表
  }, 1500)
}

// 下载模板
const downloadTemplate = () => {
  ElMessage.info('开始下载 Excel 模板...')
  // window.location.href = '/template.xlsx'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.action-card { margin-bottom: 20px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.left-panel { display: flex; gap: 10px; align-items: center; }
.upload-btn { display: inline-flex; margin: 0 10px; }
.number-font { font-family: Consolas, Monaco, monospace; font-size: 16px; font-weight: bold; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>