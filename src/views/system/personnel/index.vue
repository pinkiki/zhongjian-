<template>
  <div class="personnel-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">人员管理</h1>
          <p class="page-description">管理房地产项目团队成员和组织架构</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleInvite">
            <el-icon><Plus /></el-icon>
            邀请成员
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计信息卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ totalMembers }}</div>
            <div class="count-label">总成员数</div>
            <div class="stat-label">团队成员</div>
          </div>
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ departmentCount }}</div>
            <div class="count-label">部门数量</div>
            <div class="stat-label">组织架构</div>
          </div>
          <div class="stat-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ newMembersThisMonth }}</div>
            <div class="count-label">本月新增</div>
            <div class="stat-label">新加入成员</div>
          </div>
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ activeRate }}%</div>
            <div class="count-label">活跃度</div>
            <div class="stat-label">成员活跃状态</div>
          </div>
          <div class="stat-icon">
            <el-icon><View /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索成员姓名、邮箱、角色或部门..."
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 成员表格 -->
    <div class="table-container">
      <el-table
        :data="paginatedPersonnel"
        class="personnel-table"
        empty-text="暂无数据"
        style="width: 100%"
      >
        <el-table-column label="成员" min-width="300">
          <template #default="{ row }">
            <div class="member-cell">
              <el-avatar :src="row.avatar" :size="40" class="member-avatar">
                {{ row.name[0] }}
              </el-avatar>
              <div class="member-info">
                <div class="member-name">{{ row.name }}</div>
                <div class="member-id">{{ row.employeeId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="邮箱" min-width="400">
          <template #default="{ row }">
            <div class="email-cell">
              <el-icon class="email-icon"><Message /></el-icon>
              <span>{{ row.email }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色"  min-width="250">
          <template #default="{ row }">
            <el-tag
              :type="getRoleTagType(row.role) as any"
              size="default"
              class="role-tag"
            >
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="部门" min-width="180">
          <template #default="{ row }">
            <div class="department-cell">{{ row.department }}</div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button
                type="success"
                text
                size="small"
                @click="handleEdit(row)"
                class="action-btn"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                type="danger"
                text
                size="small"
                @click="handleDelete(row)"
                class="action-btn"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredPersonnel.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 成员对话框 -->
    <MemberDialog
      v-model:visible="memberDialogVisible"
      :member="currentMember"
      :mode="dialogMode"
      @success="handleMemberSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  User,
  View,
  OfficeBuilding,
  TrendCharts,
  Message,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import MemberDialog from './components/MemberDialog.vue'

defineOptions({
  name: 'PersonnelManagement',
})

// 响应式数据
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const memberDialogVisible = ref(false)
const currentMember = ref(null)
const dialogMode = ref<'invite' | 'edit'>('invite')

// 统计数据
const totalMembers = ref(6)
const departmentCount = ref(4)
const newMembersThisMonth = ref(2)
const activeRate = ref(95)

// 模拟人员数据
const personnelList = ref([
  {
    id: 1,
    name: '李建国',
    employeeId: 'EMP001',
    email: 'lijianguo@vanke.com',
    role: '项目总监',
    department: '工程部',
    avatar: '',
    status: true,
  },
  {
    id: 2,
    name: '王芳',
    employeeId: 'EMP002',
    email: 'wangfang@vanke.com',
    role: '主创建筑师',
    department: '设计部',
    avatar: '',
    status: true,
  },
  {
    id: 3,
    name: '张强',
    employeeId: 'EMP003',
    email: 'zhangqiang@vanke.com',
    role: '结构工程师',
    department: '技术部',
    avatar: '',
    status: true,
  },
  {
    id: 4,
    name: '刘洋',
    employeeId: 'EMP004',
    email: 'liuyang@vanke.com',
    role: 'BIM工程师',
    department: '技术部',
    avatar: '',
    status: true,
  },
  {
    id: 5,
    name: '陈静',
    employeeId: 'EMP005',
    email: 'chenjing@vanke.com',
    role: '施工经理',
    department: '工程部',
    avatar: '',
    status: true,
  },
  {
    id: 6,
    name: '赵明',
    employeeId: 'EMP006',
    email: 'zhaoming@vanke.com',
    role: '造价工程师',
    department: '成本部',
    avatar: '',
    status: true,
  },
])

// 计算属性
const filteredPersonnel = computed(() => {
  let filtered = personnelList.value

  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (person) =>
        person.name.toLowerCase().includes(keyword) ||
        person.email.toLowerCase().includes(keyword) ||
        person.role.toLowerCase().includes(keyword) ||
        person.department.toLowerCase().includes(keyword),
    )
  }

  return filtered
})

const paginatedPersonnel = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPersonnel.value.slice(start, end)
})

// 方法
const getRoleTagType = (
  role: string,
): 'success' | 'warning' | 'danger' | 'info' | 'primary' | '' => {
  const roleTypes: Record<
    string,
    'success' | 'warning' | 'danger' | 'info' | 'primary' | ''
  > = {
    项目总监: 'danger',
    主创建筑师: 'warning',
    施工经理: 'success',
    结构工程师: 'info',
    BIM工程师: 'primary',
    造价工程师: '',
  }
  return roleTypes[role] || ''
}
const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const handleInvite = () => {
  currentMember.value = null
  dialogMode.value = 'invite'
  memberDialogVisible.value = true
}

const handleEdit = (member: any) => {
  currentMember.value = { ...member }
  dialogMode.value = 'edit'
  memberDialogVisible.value = true
}

const handleDelete = async (member: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除成员 ${member.name} 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const index = personnelList.value.findIndex((p) => p.id === member.id)
    if (index > -1) {
      personnelList.value.splice(index, 1)
      totalMembers.value = personnelList.value.length
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const handleMemberSuccess = (member: any, mode: 'invite' | 'edit') => {
  if (mode === 'invite') {
    personnelList.value.unshift({
      ...member,
      id: Date.now(),
      status: true,
    })
    totalMembers.value = personnelList.value.length
    newMembersThisMonth.value += 1
  } else {
    const index = personnelList.value.findIndex((p) => p.id === member.id)
    if (index > -1) {
      personnelList.value[index] = { ...personnelList.value[index], ...member }
    }
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.personnel-container {
  height: 100%;
  background-color: #fff;
  padding: 24px;
  overflow-y: scroll;

  .page-header {
    background: #ffffff;
    border-radius: 12px;
    margin-bottom: 34px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-text {
        .page-title {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .page-description {
          margin: 0;
          font-size: 16px;
          color: #64748b;
          line-height: 1.5;
        }
      }

      .header-actions {
        .el-button {
          // background-color: #1a1a1a;
          background-color: #4a9dfb;
          color: #ffffff;
          height: 40px;
          padding: 0 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          }
        }
      }
    }
  }

  .stats-section {
    margin-bottom: 24px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .stat-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 34px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .stat-content {
          .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 4px;
            line-height: 1;
          }
          .count-label {
            font-size: 16px;
            color: #3a4350;
          }
          .stat-label {
            font-size: 15px;
            color: #64748b;
            font-weight: 500;
          }
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6c9ff7 0%, #aed9f8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
        }
        &:nth-child(2) .stat-icon {
          background: linear-gradient(135deg, #63a767 0%, #c1eecb 100%);
        }
        &:nth-child(4) .stat-icon {
          background: linear-gradient(135deg, #d071f2 0%, #efbaf0 100%);
        }
        &:nth-child(3) .stat-icon {
          background: linear-gradient(135deg, #f6a767 0%, #fbecd4 100%);
        }
      }
    }
  }

  .search-section {
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;

    .search-input {
      max-width: 30%;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        height: 48px;

        &:hover {
          border-color: #cbd5e1;
        }

        &.is-focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .el-input__inner {
          font-size: 16px;
          color: #1a1a1a;
        }
      }
    }
  }

  .table-container {
    border: 1px solid #e6e1e1;
    border-radius: 12px;
    overflow: hidden;

    .personnel-table {
      // padding: 20px;
      .member-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .member-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
        }

        .member-info {
          .member-name {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 2px;
          }

          .member-id {
            font-size: 13px;
            color: #64748b;
          }
        }
      }

      .email-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #1a1a1a;

        .email-icon {
          color: #64748b;
          font-size: 16px;
        }
      }

      .role-tag {
        border-radius: 6px;
        font-weight: 500;
        padding: 4px 12px;
        font-size: 13px;
      }

      .department-cell {
        color: #1a1a1a;
        font-weight: 500;
      }

      .action-cell {
        display: flex;
        gap: 8px;

        .action-btn {
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 14px;

          &.el-button--text {
            &:hover {
              background-color: #f8fafc;
            }
          }
        }
      }

      :deep(.el-table__row) {
        &:hover {
          background-color: #f8fafc;
        }
      }

      :deep(.el-table__header) {
        th {
          background-color: #fff;
          border-bottom: 1px solid #e2e8f0;
          height: 50px;
          color: #1a1a1a;
          font-weight: 800;
        }
      }
    }

    .pagination-wrapper {
      padding: 20px;
      display: flex;
      justify-content: end;

      :deep(.el-pagination) {
        .el-pager li {
          border-radius: 6px;
          margin: 0 2px;
        }

        .btn-prev,
        .btn-next {
          border-radius: 6px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .personnel-container {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .personnel-container {
    padding: 16px;

    .page-header {
      padding: 24px;

      .header-content {
        flex-direction: column;
        gap: 16px;

        .header-text {
          .page-title {
            font-size: 24px;
          }

          .page-description {
            font-size: 14px;
          }
        }
      }
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 16px;

      .stat-card {
        padding: 20px;

        .stat-content .stat-number {
          font-size: 28px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          font-size: 20px;
        }
      }
    }

    .search-section {
      padding: 20px;
    }

    .table-container {
      .pagination-wrapper {
        padding: 16px;
      }
    }
  }
}

// 暗黑模式
html.dark {
  .personnel-container {
    background: var(--el-bg-color) !important;

    .page-header {
      background: var(--el-bg-color) !important;
      border: 1px solid var(--el-border-color) !important;

      .header-text {
        .page-title {
          color: var(--el-text-color-primary) !important;
        }

        .page-description {
          color: var(--el-text-color-regular) !important;
        }
      }
    }

    .stats-section {
      .stat-card {
        background: var(--el-bg-color) !important;
        border: 1px solid var(--el-border-color) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;

        &:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3) !important;
        }

        .stat-content {
          .stat-number {
            color: var(--el-text-color-primary) !important;
          }

          .count-label {
            color: var(--el-text-color-primary) !important;
          }

          .stat-label {
            color: var(--el-text-color-regular) !important;
          }
        }
      }
    }

    .search-section {
      background: var(--el-bg-color) !important;
      border: 1px solid var(--el-border-color) !important;

      .search-input {
        :deep(.el-input__wrapper) {
          background: var(--el-fill-color-dark) !important;
          border-color: var(--el-border-color) !important;

          &:hover {
            border-color: var(--el-border-color-hover) !important;
          }

          &.is-focus {
            border-color: var(--el-color-primary) !important;
          }

          .el-input__inner {
            color: var(--el-text-color-primary) !important;
          }
        }
      }
    }

    .table-container {
      background: var(--el-bg-color) !important;
      border-color: var(--el-border-color) !important;

      .personnel-table {
        .member-cell {
          .member-info {
            .member-name {
              color: var(--el-text-color-primary) !important;
            }

            .member-id {
              color: var(--el-text-color-regular) !important;
            }
          }
        }

        .email-cell {
          color: var(--el-text-color-primary) !important;

          .email-icon {
            color: var(--el-text-color-regular) !important;
          }
        }

        .department-cell {
          color: var(--el-text-color-primary) !important;
        }

        .action-cell {
          .action-btn {
            &.el-button--text {
              &:hover {
                background-color: var(--el-fill-color-dark) !important;
              }
            }
          }
        }

        :deep(.el-table__row) {
          background: var(--el-bg-color) !important;

          &:hover {
            background: var(--el-fill-color-dark) !important;
          }
        }

        :deep(.el-table__header) {
          th {
            background: var(--el-bg-color) !important;
            border-color: var(--el-border-color) !important;
            color: var(--el-text-color-primary) !important;
          }
        }

        :deep(.el-table__body) {
          tr {
            td {
              border-color: var(--el-border-color) !important;
            }
          }
        }
      }
    }
  }
}
</style>
