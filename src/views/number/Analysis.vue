<template>
  <div class="page-container">
    <div class="header-tools">
        <span class="page-title">数据监控大屏</span>
        <el-button icon="Refresh" circle @click="initData" :loading="loading" />
    </div>

    <el-row :gutter="20" class="card-row">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-blue">
          <div class="card-title">号码池总量</div>
          <div class="card-num">{{ stats.total_phones }}</div>
          <div class="card-icon"><el-icon><Odometer /></el-icon></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-green">
          <div class="card-title">累计已办理</div>
          <div class="card-num">{{ stats.sold_phones }}</div>
          <div class="card-icon"><el-icon><Select /></el-icon></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-orange">
          <div class="card-title">当前待办理</div>
          <div class="card-num">{{ stats.pending_orders }}</div>
          <div class="card-icon"><el-icon><Timer /></el-icon></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card bg-red">
          <div class="card-title">累计已拒绝</div>
          <div class="card-num">{{ stats.rejected_orders }}</div>
          <div class="card-icon"><el-icon><CloseBold /></el-icon></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <span>📊 各区县业务处理情况</span>
            </div>
          </template>
          <div ref="chartRef" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { Odometer, Select, Timer, CloseBold, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const loading = ref(false)
const chartRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null

// 统计数据
const stats = reactive({
  total_phones: 0,
  sold_phones: 0,
  pending_orders: 0,
  rejected_orders: 0
})

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/analysis/dashboard')
    
    // 1. 填充卡片数据
    stats.total_phones = res.total_phones
    stats.sold_phones = res.sold_phones
    stats.pending_orders = res.pending_orders
    stats.rejected_orders = res.rejected_orders

    // 2. 渲染图表
    renderChart(res.district_stats || [])
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 渲染 ECharts
const renderChart = (data: any[]) => {
  if (!chartRef.value) return
  // 按照区县名称的中文拼音顺序排序，确保 X 轴位置永远固定
  const sortedData = [...data].sort((a, b) => {
    return a.district_name.localeCompare(b.district_name, 'zh-CN')
  })

  if (!myChart) {
    myChart = echarts.init(chartRef.value)
  }

  // // 提取数据
  // const districts = data.map(item => item.district_name)
  // const pendingData = data.map(item => item.pending_count)
  // const soldData = data.map(item => item.sold_count)
  // // 获取已拒绝数据
  // const rejectedData = data.map(item => item.rejected_count || 0)
  const districts = sortedData.map(item => item.district_name)
  const pendingData = sortedData.map(item => item.pending_count)
  const soldData = sortedData.map(item => item.sold_count)
  const rejectedData = sortedData.map(item => item.rejected_count || 0)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      // 增加 '已拒绝'
      data: ['待办理', '已办理', '已拒绝'],
      top: 'top',
      left: 'center'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: districts
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '待办理',
        type: 'bar',
        stack: 'total',
        label: { show: true },
        emphasis: { focus: 'series' },
        data: pendingData,
        itemStyle: { color: '#E6A23C' } // 黄色
      },
      {
        name: '已办理',
        type: 'bar',
        stack: 'total',
        label: { show: true },
        emphasis: { focus: 'series' },
        data: soldData,
        itemStyle: { color: '#67C23A' } // 绿色
      },
      //  新增：已拒绝系列
      {
        name: '已拒绝',
        type: 'bar',
        stack: 'total',
        label: { show: true },
        emphasis: { focus: 'series' },
        data: rejectedData,
        itemStyle: { color: '#F56C6C' } // 红色
      }
    ]
  }

  myChart.setOption(option)
}

const handleResize = () => {
  myChart?.resize()
}

onMounted(() => {
  initData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.dispose()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.header-tools { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: bold; color: #303133; }

.data-card {
  position: relative;
  height: 120px;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: transform 0.3s;
}
.data-card:hover { transform: translateY(-5px); }

.bg-blue { background: linear-gradient(135deg, #409EFF, #79bbff); }
.bg-green { background: linear-gradient(135deg, #67C23A, #95d475); }
.bg-orange { background: linear-gradient(135deg, #E6A23C, #f3d19e); }
.bg-red { background: linear-gradient(135deg, #F56C6C, #fab6b6); }

.card-title { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
.card-num { font-size: 32px; font-weight: bold; font-family: Impact, sans-serif; }
.card-icon { position: absolute; right: 20px; top: 35px; font-size: 40px; opacity: 0.3; }

.chart-header { font-weight: bold; color: #606266; }
</style>