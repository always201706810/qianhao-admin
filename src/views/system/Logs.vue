<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="header">
        <span class="title">系统操作日志</span>
        <div class="right-tools">
          <el-input 
            v-model="searchUser" 
            placeholder="搜索账号" 
            style="width: 200px; margin-right: 10px"
            clearable 
            @clear="fetchData"
            @keyup.enter="fetchData"
          >
            <template #append><el-button :icon="Search" @click="fetchData" /></template>
          </el-input>
          <el-button icon="Refresh" circle @click="fetchData" />
        </div>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column label="操作账号" width="150" prop="username" align="center">
           <template #default="scope">
             <el-tag>{{ scope.row.username }}</el-tag>
           </template>
        </el-table-column>


        <el-table-column label="操作内容" min-width="180" prop="action" align="center">
            <template #default="scope">
                <el-tag :type="getActionType(scope.row.action)" effect="light">
                  {{ scope.row.action }}
                </el-tag>
            </template>
        </el-table-column>

        <!-- <el-table-column label="操作内容" width="150" prop="action" align="center">
            <template #default="scope">
                <el-tag type="success" effect="plain">{{ scope.row.action }}</el-tag>
            </template>
        </el-table-column> -->

        <el-table-column label="IP 地址" width="150" prop="ip" align="center" />
        
        <el-table-column label="浏览器/设备 (UA)" prop="ua" show-overflow-tooltip />

        <el-table-column label="操作时间" width="180" prop="create_time" align="center" />
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
import { Search, Refresh } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15) // 日志一页多展示点
const searchUser = ref('')


// 根据操作内容关键词，返回不同的 Tag 颜色
const getActionType = (action: string) => {
  if (!action) return 'info'
  
  // 灰色：常规登录，频率高，降低视觉干扰
  if (action.includes('登录')) return 'info' 
  
  // 红色：危险操作或拒绝
  if (action.includes('拒绝') || action.includes('删除') || action.includes('重置')) return 'danger' 
  
  // 绿色：成功、通过、已办理
  if (action.includes('通过') || action.includes('已办理') || action.includes('成功')) return 'success' 
  
  // 橙色：修改类操作、导入
  if (action.includes('编辑') || action.includes('修改') || action.includes('导入') || action.includes('新增')) return 'warning' 
  
  // 默认蓝色：其他操作
  return '' 
}


const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/system/logs', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        username: searchUser.value || undefined
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: bold; border-left: 4px solid #909399; padding-left: 10px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>