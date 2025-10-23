<template>
  <div class="data-overview-container">
    <el-card class="page-header" shadow="never">
      <div class="header-content">
        <h2 class="page-title">数据总览</h2>
        <p class="page-description">查看系统数据的整体概况和统计信息</p>
      </div>
    </el-card>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="statistic-card" shadow="hover">
          <el-statistic title="项目总数" :value="statistics.projectCount">
            <template #prefix>
              <el-icon color="#409eff">
                <Folder />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="statistic-card" shadow="hover">
          <el-statistic title="模型数量" :value="statistics.modelCount">
            <template #prefix>
              <el-icon color="#67c23a">
                <Document />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="statistic-card" shadow="hover">
          <el-statistic title="今日检查" :value="statistics.todayCheck">
            <template #prefix>
              <el-icon color="#e6a23c">
                <CircleCheck />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="statistic-card" shadow="hover">
          <el-statistic title="问题待处理" :value="statistics.pendingIssues">
            <template #prefix>
              <el-icon color="#f56c6c">
                <Warning />
              </el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近7天检查趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon :size="60" color="#e6e6e6">
              <TrendCharts />
            </el-icon>
            <p>图表区域 </p>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">问题分类统计</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon :size="60" color="#e6e6e6">
              <PieChart />
            </el-icon>
            <p>图表区域 </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-card class="activity-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">最近活动</span>
          <el-button text type="primary">查看更多</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="index"
          :timestamp="activity.time"
          placement="top"
          :color="activity.color"
        >
          <el-card shadow="hover" class="timeline-card">
            <p class="activity-title">{{ activity.title }}</p>
            <p class="activity-description">{{ activity.description }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Folder,
  Document,
  CircleCheck,
  Warning,
  TrendCharts,
  PieChart
} from '@element-plus/icons-vue'

defineOptions({
  name: 'DataOverview',
})

// 统计数据
const statistics = ref({
  projectCount: 0,
  modelCount: 0,
  todayCheck: 0,
  pendingIssues: 0,
})

// 最近活动
const recentActivities = ref([
  {
    title: '完成一致性检查',
    description: '对项目 A 进行了完整的一致性检查',
    time: '2025-10-23 14:30',
    color: '#67c23a',
  },
  {
    title: '上传新模型',
    description: '上传了建筑模型 BIM_2025_v3',
    time: '2025-10-23 12:15',
    color: '#409eff',
  },
  {
    title: '发现问题',
    description: '在模型检查中发现 3 个待处理问题',
    time: '2025-10-23 10:20',
    color: '#e6a23c',
  },
])

// 模拟加载数据
const loadStatistics = () => {
  // 这里可以调用API获取真实数据
  setTimeout(() => {
    statistics.value = {
      projectCount: 156,
      modelCount: 342,
      todayCheck: 28,
      pendingIssues: 15,
    }
  }, 500)
}

onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss" scoped>
.data-overview-container {
  padding: 0;

  .page-header {
    margin-bottom: 20px;
    border-radius: 8px;

    .header-content {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .page-description {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .statistics-row {
    margin-bottom: 20px;

    .statistic-card {
      border-radius: 8px;
      margin-bottom: 20px;

      :deep(.el-statistic) {
        .el-statistic__head {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 12px;
        }

        .el-statistic__content {
          font-size: 28px;
          font-weight: 600;
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .chart-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-weight: 600;
          font-size: 16px;
        }
      }

      .chart-placeholder {
        height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-secondary);
        background-color: var(--el-fill-color-light);
        border-radius: 4px;

        p {
          margin-top: 16px;
          font-size: 14px;
        }
      }
    }
  }

  .activity-card {
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-weight: 600;
        font-size: 16px;
      }
    }

    .timeline-card {
      border-radius: 4px;

      .activity-title {
        margin: 0 0 8px 0;
        font-weight: 600;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }

      .activity-description {
        margin: 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .data-overview-container {
    .statistics-row {
      :deep(.el-col) {
        margin-bottom: 0;
      }
    }
  }
}
</style>
