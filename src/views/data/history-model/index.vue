<template>
  <div class="history-model-container">
    <el-card class="page-header" shadow="never">
      <div class="header-content">
        <h2 class="page-title">历史模型</h2>
        <p class="page-description">查看和管理历史版本的模型文件</p>
      </div>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="action-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="模型名称">
          <el-input
            v-model="searchForm.modelName"
            placeholder="请输入模型名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="项目">
          <el-select
            v-model="searchForm.projectId"
            placeholder="请选择项目"
            clearable
            style="width: 180px"
          >
            <el-option label="全部项目" value="" />
            <el-option label="中建八局总部大楼" value="1" />
            <el-option label="智慧园区项目" value="2" />
            <el-option label="住宅小区A区" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" :icon="Upload" @click="handleUpload">
          上传模型
        </el-button>
        <el-button :icon="Download" @click="handleBatchDownload">
          批量下载
        </el-button>
        <el-button :icon="Delete" type="danger" plain @click="handleBatchDelete">
          批量删除
        </el-button>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="文件路径">
                  {{ row.filePath }}
                </el-descriptions-item>
                <el-descriptions-item label="文件大小">
                  {{ row.fileSize }}
                </el-descriptions-item>
                <el-descriptions-item label="上传者">
                  {{ row.uploader }}
                </el-descriptions-item>
                <el-descriptions-item label="版本说明">
                  {{ row.versionNote }}
                </el-descriptions-item>
                <el-descriptions-item label="标签" :span="2">
                  <el-tag
                    v-for="tag in row.tags"
                    :key="tag"
                    style="margin-right: 8px"
                    size="small"
                  >
                    {{ tag }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="modelName"
          label="模型名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="version"
          label="版本号"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="info">{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="projectName"
          label="所属项目"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="fileType"
          label="文件类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getFileTypeTag(row.fileType)">
              {{ row.fileType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="uploadTime"
          label="上传时间"
          width="180"
          align="center"
          sortable
        />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '当前版本' : '历史版本' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              :icon="View"
              @click="handlePreview(row)"
            >
              预览
            </el-button>
            <el-button
              text
              type="success"
              :icon="Download"
              @click="handleDownload(row)"
            >
              下载
            </el-button>
            <el-button
              v-if="row.status !== 'active'"
              text
              type="warning"
              :icon="RefreshRight"
              @click="handleRestore(row)"
            >
              恢复
            </el-button>
            <el-button
              text
              type="danger"
              :icon="Delete"
              @click="handleDelete(row)"
            >
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
  Upload,
  Download,
  Delete,
  View,
  RefreshRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'HistoryModel',
})

// 搜索表单
const searchForm = ref({
  modelName: '',
  projectId: '',
  dateRange: [],
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 获取文件类型标签
const getFileTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    RVT: 'primary',
    IFC: 'success',
    DWG: 'warning',
    SKP: 'info',
  }
  return typeMap[type] || ''
}

// 搜索
const handleSearch = () => {
  console.log('搜索:', searchForm.value)
  loadTableData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    modelName: '',
    projectId: '',
    dateRange: [],
  }
  loadTableData()
}

// 上传模型
const handleUpload = () => {
  ElMessage.success('上传模型功能待实现')
}

// 批量下载
const handleBatchDownload = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要下载的模型')
    return
  }
  ElMessage.success(`批量下载 ${selectedRows.value.length} 个模型`)
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的模型')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个模型吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

// 预览
const handlePreview = (row: any) => {
  ElMessage.info(`预览模型: ${row.modelName}`)
}

// 下载
const handleDownload = (row: any) => {
  ElMessage.success(`下载模型: ${row.modelName}`)
}

// 恢复版本
const handleRestore = (row: any) => {
  ElMessageBox.confirm(
    `确定要将 ${row.modelName} 恢复为当前版本吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('恢复成功')
  })
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除 ${row.modelName} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
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
        modelName: 'BIM_HQ_2025_v3',
        version: 'v3.0',
        projectName: '中建八局总部大楼',
        fileType: 'RVT',
        uploadTime: '2025-10-23 14:30:00',
        status: 'active',
        filePath: '/models/hq/BIM_HQ_2025_v3.rvt',
        fileSize: '256 MB',
        uploader: '张三',
        versionNote: '修复了若干结构问题，优化了渲染性能',
        tags: ['结构优化', '性能提升'],
      },
      {
        modelName: 'BIM_HQ_2025_v2',
        version: 'v2.0',
        projectName: '中建八局总部大楼',
        fileType: 'RVT',
        uploadTime: '2025-10-20 10:15:00',
        status: 'archived',
        filePath: '/models/hq/BIM_HQ_2025_v2.rvt',
        fileSize: '245 MB',
        uploader: '李四',
        versionNote: '更新了建筑外观设计',
        tags: ['外观设计'],
      },
      {
        modelName: 'BIM_Park_2025_v2',
        version: 'v2.0',
        projectName: '智慧园区项目',
        fileType: 'IFC',
        uploadTime: '2025-10-22 16:45:00',
        status: 'active',
        filePath: '/models/park/BIM_Park_2025_v2.ifc',
        fileSize: '189 MB',
        uploader: '王五',
        versionNote: '集成了智能化系统',
        tags: ['智能化', 'BIM'],
      },
      {
        modelName: 'BIM_RES_A_2025_v1',
        version: 'v1.0',
        projectName: '住宅小区A区',
        fileType: 'DWG',
        uploadTime: '2025-10-18 09:20:00',
        status: 'archived',
        filePath: '/models/res/BIM_RES_A_2025_v1.dwg',
        fileSize: '128 MB',
        uploader: '赵六',
        versionNote: '初始版本',
        tags: ['初始版本'],
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
.history-model-container {
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

    .expand-content {
      padding: 16px 48px;
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}

@media screen and (max-width: 768px) {
  .history-model-container {
    .search-form {
      :deep(.el-form-item) {
        display: block;
        margin-right: 0;
      }
    }

    .action-buttons {
      flex-wrap: wrap;
    }

    .expand-content {
      padding: 16px !important;
    }
  }
}
</style>
