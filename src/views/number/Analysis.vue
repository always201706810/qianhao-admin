<template>
  <div class="analysis-container">
    <div class="page-header">
      <h2>数据看板</h2>
      <span class="subtitle">实时监控号码池状态与业务办理进度</span>
    </div>

    <el-row :gutter="20">
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">已处理号码总数</div>
              <div class="value">2,845</div>
            </div>
            <div class="icon-area blue-bg">
              <el-icon class="icon-blue"><List /></el-icon>
            </div>
          </div>
          <div class="card-footer">
            <span>较昨日</span>
            <span class="trend-up">+120 <el-icon><Top /></el-icon></span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">用户已办理完成</div>
              <div class="value">1,932</div>
            </div>
            <div class="icon-area green-bg">
              <el-icon class="icon-green"><SuccessFilled /></el-icon>
            </div>
          </div>
          <div class="card-footer">
            <span>办理成功率</span>
            <span class="trend-text">68%</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">全区待办理号码</div>
              <div class="value">458</div>
            </div>
            <div class="icon-area orange-bg">
              <el-icon class="icon-orange"><Timer /></el-icon>
            </div>
          </div>
          <div class="card-footer">
            <span>平均等待时长</span>
            <span class="trend-down">2.5小时</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <div class="text-area">
              <div class="label">区县超时未处理</div>
              <div class="value danger-text">45</div>
            </div>
            <div class="icon-area red-bg">
              <el-icon class="icon-red"><BellFilled /></el-icon>
            </div>
          </div>
          <div class="card-footer">
            <span>需紧急介入</span>
            <el-link type="danger" :underline="false" style="font-size:12px">查看详情 ></el-link>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <span>近七日业务趋势图</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button label="apply">申请量</el-radio-button>
                <el-radio-button label="handle">办理量</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表数据加载中..." />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  List, 
  SuccessFilled, 
  Timer, 
  BellFilled, 
  Top 
} from '@element-plus/icons-vue'

const trendType = ref('apply')
</script>

<style scoped>
.analysis-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px); /* 减去顶部高度 */
}

.page-header {
  margin-bottom: 25px;
}
.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}
.subtitle {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
  display: block;
}

/* 卡片样式 */
.data-card {
  border: none;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1) !important;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.danger-text {
  color: #F56C6C;
}

/* 图标样式 */
.icon-area {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

/* 颜色主题 */
.blue-bg { background-color: #ecf5ff; }
.icon-blue { color: #409EFF; }

.green-bg { background-color: #f0f9eb; }
.icon-green { color: #67C23A; }

.orange-bg { background-color: #fdf6ec; }
.icon-orange { color: #E6A23C; }

.red-bg { background-color: #fef0f0; }
.icon-red { color: #F56C6C; }

/* 底部辅助信息 */
.card-footer {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-up { color: #F56C6C; display: flex; align-items: center; }
.trend-down { color: #67C23A; }
.trend-text { font-weight: bold; color: #303133; }

/* 图表占位 */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-placeholder {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
}
</style>