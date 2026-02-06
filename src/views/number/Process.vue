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
            <el-button type="success" icon="Upload" :loading="uploadLoading">Excel 批量导入</el-button>
          </el-upload>
          
          <el-button type="info" link icon="Download" @click="downloadTemplate">下载模板</el-button>
        </div>

        <div class="right-panel">
          <el-input 
            v-model="searchPhoneNumber" 
            placeholder="搜手机号" 
            clearable 
            style="width: 160px; margin-right: 10px" 
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
             <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <el-select 
            v-model="searchCategory" 
            placeholder="筛选类别" 
            clearable 
            style="width: 140px; margin-right: 10px" 
            @change="handleSearch"
          >
             <el-option label="AAA号码" value="AAA号码" />
             <el-option label="ABC号码" value="ABC号码" />
             <el-option label="CBA号码" value="CBA号码" />
             <el-option label="AABB号码" value="AABB号码" />
             <el-option label="ABAB号码" value="ABAB号码" />
             <el-option label="ABBA号码" value="ABBA号码" />
             <el-option label="AAAB号码" value="AAAB号码" />
             <el-option label="ABB号码" value="ABB号码" />
             <el-option label="ABCAB号码" value="ABCAB号码" />
             <el-option label="9号码" value="9号码" />
             <el-option label="6号码" value="6号码" />
             <el-option label="8号码" value="8号码" />
             <el-option label="情人号号码" value="情人号号码" />
          </el-select>
          <el-button icon="Refresh" circle @click="fetchData" />
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="60" align="center" />
        
        <el-table-column prop="phone_number" label="号码资源" align="center" width="140">
          <template #default="scope">
            <span class="number-font">{{ scope.row.phone_number }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="号码类别" align="center">
          <template #default="scope">
            <el-tag effect="light">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="grade" label="等级" width="80" align="center">
          <template #default="scope">
            <el-tag type="warning" effect="dark" v-if="scope.row.grade > 0">Lv.{{ scope.row.grade }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="预存/价格" width="120" align="center">
           <template #default="scope">
             <span v-if="scope.row.price > 0" style="color: #f56c6c; font-weight: bold;">
               ¥ {{ scope.row.price }}
             </span>
             <span v-else style="color: #67c23a;">免费</span>
           </template>
        </el-table-column>
        
        <el-table-column label="归属区县" align="center" min-width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.district_name" type="info">{{ scope.row.district_name }}</el-tag>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="当前状态" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" round>
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button 
              link 
              type="danger" 
              icon="Delete" 
              @click="handleDelete(scope.row)"
              :disabled="scope.row.status !== 0"
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
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增号码' : '编辑号码'"
      width="450px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="手机号码">
          <el-input v-model="formData.phone_number" placeholder="请输入11位手机号" />
        </el-form-item>
        <el-form-item label="号码类别">
          <el-select 
            v-model="formData.category" 
            placeholder="选择或输入类别" 
            filterable 
            allow-create 
            default-first-option
            style="width: 100%"
          >
             <el-option label="AAA号码" value="AAA号码" />
             <el-option label="ABC号码" value="ABC号码" />
             <el-option label="CBA号码" value="CBA号码" />
             <el-option label="AABB号码" value="AABB号码" />
             <el-option label="ABAB号码" value="ABAB号码" />
             <el-option label="ABBA号码" value="ABBA号码" />
             <el-option label="AAAB号码" value="AAAB号码" />
             <el-option label="ABB号码" value="ABB号码" />
             <el-option label="ABCAB号码" value="ABCAB号码" />
             <el-option label="9号码" value="9号码" />
             <el-option label="6号码" value="6号码" />
             <el-option label="8号码" value="8号码" />
             <el-option label="情人号号码" value="情人号号码" />
          </el-select>
        </el-form-item>
        <el-form-item label="号码等级">
           <el-input-number v-model="formData.grade" :min="0" :max="3" />
        </el-form-item>
        
        <el-form-item label="号码价格">
           <el-input-number 
             v-model="formData.price" 
             :min="0" 
             :max="999999"
             :precision="2" 
             :step="100"
             style="width: 100%" 
             placeholder="请输入价格(0表示免费)"
           />
        </el-form-item>
        
        <el-form-item label="派发区县" v-if="dialogType === 'edit' && currentStatus === 1">
          <el-select v-model="formData.district_id" placeholder="修改归属区县" style="width: 100%">
            <el-option 
              v-for="item in districtList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
          <div class="tips">修改此处会将订单转派给对应区县！</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'
import * as XLSX from 'xlsx'

interface PhoneItem {
  id: number
  phone_number: string
  category: string
  grade: number
  price: number
  status: number
  district_name?: string
  district_id?: number
}

const loading = ref(false)
const uploadLoading = ref(false)
const submitLoading = ref(false)
const tableData = ref<PhoneItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchCategory = ref('')
const searchPhoneNumber = ref('') // ✅ 新增搜索变量
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentStatus = ref(0)
const districtList = ref<any[]>([])

const formData = reactive({
  id: 0,
  phone_number: '',
  category: '',
  grade: 0,
  price: 0,
  district_id: 0
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/phone/list', { 
      params: {
        page: currentPage.value,
        size: pageSize.value,
        category: searchCategory.value || undefined,
        // ✅ 传递搜索参数 (如果后端没接这个参数，它会直接忽略，不影响现有功能)
        phone_number: searchPhoneNumber.value || undefined 
      }
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchDistricts = async () => {
  try {
    const res: any = await request.get('/district/list') 
    districtList.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'info'
    default: return 'danger'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待抢号'
    case 1: return '锁定中'
    case 2: return '已办理'
    case 3: return '已拒绝'
    default: return '未知'
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handlePageChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

const openDialog = (type: 'add' | 'edit', row?: PhoneItem) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    formData.id = row.id
    formData.phone_number = row.phone_number
    formData.category = row.category
    formData.grade = row.grade
    formData.price = row.price || 0
    formData.district_id = row.district_id || 0
    currentStatus.value = row.status
  } else {
    formData.id = 0
    formData.phone_number = ''
    formData.category = ''
    formData.grade = 0
    formData.price = 0
    formData.district_id = 0
    currentStatus.value = 0
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formData.phone_number) return ElMessage.warning('请输入号码')
  
  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      const payload = { 
        list: [{ 
          phone_number: formData.phone_number, 
          category: formData.category, 
          grade: formData.grade,
          price: formData.price
        }] 
      }
      await request.post('/phone/import', payload)
      ElMessage.success('录入成功')
    } else {
      await request.post('/phone/update', {
        id: formData.id,
        phone_number: formData.phone_number, 
        category: formData.category,
        grade: formData.grade,
        price: formData.price,
        district_id: formData.district_id
      })
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    // handled
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: PhoneItem) => {
  ElMessageBox.confirm(`确认删除号码 ${row.phone_number}?`, '警告', { type: 'warning' })
    .then(async () => {
      await request.post('/phone/delete', { id: row.id })
      ElMessage.success('删除成功')
      fetchData()
    })
}

const handleFileChange = (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return
  uploadLoading.value = true
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) { ElMessage.warning('空文件'); return }
      const worksheet = workbook.Sheets[firstSheetName]
      if (!worksheet) return

      const results: any[] = XLSX.utils.sheet_to_json(worksheet)
      
      const importList = results.map((item: any) => ({
        phone_number: String(item['手机号'] || item['phone_number'] || ''),
        category: item['类别'] || item['category'] || '普通号',
        grade: Number(item['等级'] || item['grade'] || 0),
        price: Number(item['价格'] || item['price'] || 0)
      })).filter(item => item.phone_number)

      if (importList.length === 0) return

      const res: any = await request.post('/phone/import', { list: importList })
      ElMessage.success(`成功导入 ${res.success_count} 条数据`)
      fetchData()

    } catch (error) {
      console.error(error)
      ElMessage.error('导入失败')
    } finally {
      uploadLoading.value = false
    }
  }
  reader.readAsBinaryString(rawFile)
}

const downloadTemplate = () => {
  const header = [['手机号', '类别', '等级', '价格'], ['13800138000', 'AAA号码', 3, 2000]]
  const ws = XLSX.utils.aoa_to_sheet(header)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '导入模板')
  XLSX.writeFile(wb, '号码导入模板.xlsx')
}

onMounted(() => {
  fetchData()
  fetchDistricts()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.action-card { margin-bottom: 20px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.left-panel { display: flex; gap: 10px; align-items: center; }
.number-font { font-family: Consolas, monospace; font-size: 16px; font-weight: bold; color: #409EFF; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.text-gray { color: #909399; }
.tips { font-size: 12px; color: #E6A23C; margin-top: 5px; }
</style>