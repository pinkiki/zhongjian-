<template>
  <div class="consistency-check-container">
    <el-card class="page-header" shadow="never">
      <div class="header-content">
        <h2 class="page-title">一致性校验</h2>
        <p class="page-description">对模型进行完整性和一致性检查，确保数据质量</p>
      </div>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="action-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.projectName"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="检查状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="待检查" value="pending" />
            <el-option label="检查中" value="checking" />
            <el-option label="已完成" value="completed" />
            <el-option label="检查失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" :icon="Plus" @click="handleStartCheck">
          开始检查
        </el-button>
        <el-button :icon="Download" @click="handleExport">导出报告</el-button>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          prop="projectName"
          label="项目名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="modelName"
          label="模型名称"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="checkType" label="检查类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getCheckTypeTag(row.checkType)">
              {{ row.checkType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueCount" label="问题数量" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'issue-count': row.issueCount > 0 }">
              {{ row.issueCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="progress"
          label="进度"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.progress === 100 ? 'success' : undefined"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="checkTime"
          label="检查时间"
          width="180"
          align="center"
        />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'completed'"
              text
              type="primary"
              :icon="View"
              @click="handleViewReport(row)"
            >
              查看报告
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              text
              type="success"
              :icon="VideoPlay"
              @click="handleStart(row)"
            >
              开始
            </el-button>
            <el-button
              v-if="row.status === 'failed'"
              text
              type="warning"
              :icon="RefreshRight"
              @click="handleRetry(row)"
            >
              重试
            </el-button>
            <el-button text type="danger" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Search,
  Refresh,
  Plus,
  Download,
  View,
  VideoPlay,
  RefreshRight,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'ConsistencyCheck',
})

// 搜索表单
const searchForm = ref({
  projectName: '',
  status: '',
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 获取检查类型标签
const getCheckTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '完整性检查': '',
    '一致性检查': 'success',
    '规范检查': 'warning',
    '碰撞检查': 'danger',
  }
  return typeMap[type] || ''
}

// 获取状态标签
const getStatusTag = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'info',
    checking: 'warning',
    completed: 'success',
    failed: 'danger',
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusTextMap: Record<string, string> = {
    pending: '待检查',
    checking: '检查中',
    completed: '已完成',
    failed: '检查失败',
  }
  return statusTextMap[status] || status
}

// 搜索
const handleSearch = () => {
  console.log('搜索:', searchForm.value)
  loadTableData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    projectName: '',
    status: '',
  }
  loadTableData()
}

// 开始检查
const handleStartCheck = () => {
  ElMessage.success('开始检查功能待实现')
}

// 导出报告
const handleExport = () => {
  ElMessage.success('导出报告功能待实现')
}

// 查看报告
const handleViewReport = (row: any) => {
  ElMessage.info(`查看 ${row.projectName} 的检查报告`)
}

// 开始检查
const handleStart = (row: any) => {
  ElMessage.success(`开始检查 ${row.projectName}`)
}

// 重试
const handleRetry = (row: any) => {
  ElMessage.warning(`重试检查 ${row.projectName}`)
}

// 删除
const handleDelete = (row: any) => {
  ElMessage.error(`删除 ${row.projectName}`)
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadTableData()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadTableData()
}

// 加载表格数据
const loadTableData = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    tableData.value = [
      {
        projectName: '中建八局总部大楼',
        modelName: 'BIM_HQ_2025_v1',
        checkType: '一致性检查',
        status: 'completed',
        issueCount: 3,
        progress: 100,
        checkTime: '2025-10-23 14:30:00',
      },
      {
        projectName: '智慧园区项目',
        modelName: 'BIM_Park_2025_v2',
        checkType: '完整性检查',
        status: 'checking',
        issueCount: 0,
        progress: 65,
        checkTime: '2025-10-23 15:00:00',
      },
      {
        projectName: '住宅小区A区',
        modelName: 'BIM_RES_A_2025',
        checkType: '规范检查',
        status: 'pending',
        issueCount: 0,
        progress: 0,
        checkTime: '-',
      },
      {
        projectName: '工业厂房改造',
        modelName: 'BIM_Factory_2025',
        checkType: '碰撞检查',
        status: 'failed',
        issueCount: 0,
        progress: 30,
        checkTime: '2025-10-23 10:20:00',
      },
    ] as any
    pagination.value.total = 4
    loading.value = false
  }, 500)
}

onMounted(() => {
  loadTableData()
})
</script>

<style lang="scss" scoped>
.consistency-check-container {
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

  .action-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .search-form {
      margin-bottom: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }

  .table-card {
    border-radius: 8px;

    .issue-count {
      color: var(--el-color-danger);
      font-weight: 600;
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}

@media screen and (max-width: 768px) {
  .consistency-check-container {
    .search-form {
      :deep(.el-form-item) {
        display: block;
        margin-right: 0;
      }
    }

    .action-buttons {
      flex-wrap: wrap;
    }
  }
}
</style>
