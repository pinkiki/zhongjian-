<template>
  <div class="permissions-container">
    <!-- 顶部区域 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">权限管理</h1>
          <p class="subtitle">管理房地产项目的角色和权限设置</p>
        </div>
        <el-button type="primary" class="create-btn" @click="handleOpenDialog">
          <el-icon><Plus /></el-icon>
          创建角色
        </el-button>
      </div>
    </div>

    <!-- 角色卡片区 -->
    <div class="roles-section">
      <el-row :gutter="24" class="role-cards">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          v-for="role in roles"
          :key="role.id"
        >
          <div class="role-card">
            <div class="role-header">
              <div class="role-info">
                <el-tag :type="role.tagType" round>{{ role.name }}</el-tag>
              </div>
              <div class="user-count">
                <span>{{ role.userCount }} 用户</span>
                <el-dropdown trigger="click" @command="handleRoleAction">
                  <el-icon class="more-icon"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`edit-${role.id}`">
                        <el-icon><Edit /></el-icon>
                        编辑角色
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="`delete-${role.id}`"
                        class="delete-item"
                      >
                        <el-icon><Delete /></el-icon>
                        删除角色
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="role-description">拥有所有权限, 可以管理组织设置</div>
            <div class="role-permissions">
              <div class="permission-list">
                <div
                  v-for="(permission, index) in role.displayPermissions"
                  :key="index"
                  class="permission-item"
                >
                  <el-icon><Check /></el-icon>
                  <span>{{ permission }}</span>
                </div>
                <el-button
                  v-if="role.permissions.length > 3"
                  text
                  @click="showMorePermissions(role)"
                >
                  更多
                </el-button>
              </div>
            </div>
            <div class="role-actions">
              <el-button plain size="large" @click="handleAssignUsers(role)">
                <el-icon><UserFilled /></el-icon>
                &nbsp; 分配用户
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 权限详情矩阵 -->
    <div class="permissions-matrix">
      <div class="section-top">
        <div class="section-title">权限详情矩阵</div>
        <div class="section-view">查看和配置每个角色的具体权限（动态更新）</div>
      </div>

      <!-- 项目权限 -->
      <div class="permission-group">
        <h3 class="group-title">项目权限</h3>
        <div class="permission-items">
          <div
            v-for="permission in projectPermissions"
            :key="permission.key"
            class="permission-row"
          >
            <div class="permission-info">
              <span class="permission-title">{{ permission.title }}</span>
              <div class="permission-roles">
                <el-tag
                  v-for="roleId in permission.roles"
                  :key="roleId"
                  class="role-tag"
                  round
                  color="#fff"
                >
                  {{ getRoleName(roleId) }}
                </el-tag>
              </div>
            </div>
            <div class="permission-control">
              <el-switch />
            </div>
          </div>
        </div>
      </div>

      <!-- 人员权限 -->
      <div class="permission-group">
        <h3 class="group-title">
          <el-icon><UserFilled /></el-icon>
          人员权限
        </h3>
        <div class="permission-items">
          <div
            v-for="permission in personnelPermissions"
            :key="permission.key"
            class="permission-row"
          >
            <div class="permission-info">
              <span class="permission-title">{{ permission.title }}</span>
              <div class="permission-roles">
                <el-tag
                  v-for="roleId in permission.roles"
                  :key="roleId"
                  class="role-tag"
                  round
                  color="#fff"
                >
                  {{ getRoleName(roleId) }}
                </el-tag>
              </div>
            </div>
            <div class="permission-control">
              <el-switch />
            </div>
          </div>
        </div>
      </div>

      <!-- 文件权限 -->
      <div class="permission-group">
        <h3 class="group-title">
          <el-icon><Document /></el-icon>
          文件权限
        </h3>
        <div class="permission-items">
          <div
            v-for="permission in filePermissions"
            :key="permission.key"
            class="permission-row"
          >
            <div class="permission-info">
              <span class="permission-title">{{ permission.title }}</span>
              <div class="permission-roles">
                <el-tag
                  v-for="roleId in permission.roles"
                  :key="roleId"
                  class="role-tag"
                  round
                  color="#fff"
                >
                  {{ getRoleName(roleId) }}
                </el-tag>
              </div>
            </div>
            <div class="permission-control">
              <el-switch />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建角色弹窗 -->
    <CreateRoleDialog
      v-model="showCreateDialog"
      @confirm="handleCreateRole"
    />

    <!-- 分配用户弹窗 -->
    <UserAssignmentModal
      v-model="showUserAssignmentDialog"
      :current-role="currentRole"
      :assigned-users="getAssignedUsers(currentRole?.id)"
      @confirm="handleUserAssignmentConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import CreateRoleDialog from './components/CreateRoleDialog.vue'
import UserAssignmentModal from './components/UserAssignmentModal.vue'
import {
  Plus,
  Check,
  UserFilled,
  Document,
  MoreFilled,
  Edit,
  Delete,
} from '@element-plus/icons-vue'

interface Role {
  id: string
  name: string
  tagType: 'danger' | 'primary' | 'success' | 'info'
  userCount: number
  permissions: string[]
  displayPermissions: string[]
}

interface Permission {
  key: string
  title: string
  roles: string[]
}

interface CreateRoleData {
  name: string
  description: string
  permissions: string[]
}

const showCreateDialog = ref(false)
const showUserAssignmentDialog = ref(false)
const currentRole = ref<Role | null>(null)

// Mock user assignments for roles
const roleUserAssignments = ref<Record<string, string[]>>({
  admin: ['1', '3'], // 李明, 王五
  director: ['2', '4'], // 张三, 赵六
  designer: ['5'], // 陈七
  observer: ['6'], // 刘八
})

const roles = ref<Role[]>([
  {
    id: 'admin',
    name: '管理员',
    tagType: 'danger',
    userCount: 3,
    permissions: [
      '创建项目',
      '编辑项目',
      '删除项目',
      '查看项目',
      '添加成员',
      '移除成员',
      '分配角色',
      '上传文件',
      '删除文件',
      '下载文件',
    ],
    displayPermissions: [],
  },
  {
    id: 'director',
    name: '项目总监',
    tagType: 'primary',
    userCount: 5,
    permissions: [
      '创建项目',
      '编辑项目',
      '查看项目',
      '添加成员',
      '移除成员',
      '上传文件',
      '下载文件',
    ],
    displayPermissions: [],
  },
  {
    id: 'designer',
    name: '设计师',
    tagType: 'success',
    userCount: 12,
    permissions: ['查看项目', '上传文件', '下载文件'],
    displayPermissions: [],
  },
  {
    id: 'observer',
    name: '观察者',
    tagType: 'info',
    userCount: 8,
    permissions: ['查看项目', '下载文件'],
    displayPermissions: [],
  },
])

// 初始化显示权限（只显示前3个）
roles.value.forEach((role) => {
  role.displayPermissions = role.permissions.slice(0, 3)
})

const projectPermissions = ref<Permission[]>([
  {
    key: 'create_project',
    title: '创建项目',
    roles: ['admin', 'director'],
  },
  {
    key: 'edit_project',
    title: '编辑项目',
    roles: ['admin', 'director'],
  },
  {
    key: 'delete_project',
    title: '删除项目',
    roles: ['admin'],
  },
  {
    key: 'view_project',
    title: '查看项目',
    roles: ['admin', 'director', 'designer', 'observer'],
  },
])

const personnelPermissions = ref<Permission[]>([
  {
    key: 'add_member',
    title: '添加成员',
    roles: ['admin', 'director'],
  },
  {
    key: 'remove_member',
    title: '移除成员',
    roles: ['admin', 'director'],
  },
  {
    key: 'assign_role',
    title: '分配角色',
    roles: ['admin'],
  },
])

const filePermissions = ref<Permission[]>([
  {
    key: 'upload_file',
    title: '上传文件',
    roles: ['admin', 'director', 'designer'],
  },
  {
    key: 'delete_file',
    title: '删除文件',
    roles: ['admin'],
  },
  {
    key: 'download_file',
    title: '下载文件',
    roles: ['admin', 'director', 'designer', 'observer'],
  },
])

const getRoleName = (roleId: string): string => {
  const role = roles.value.find((r) => r.id === roleId)
  return role ? role.name : ''
}

const showMorePermissions = (role: Role) => {
  ElMessage.info(`${role.name}的全部权限：${role.permissions.join('、')}`)
}

const handleRoleAction = (command: string) => {
  const [action, roleId] = command.split('-')
  const role = roles.value.find((r) => r.id === roleId)

  if (!role) return

  switch (action) {
    case 'edit':
      ElMessage.info(`编辑角色：${role.name}`)
      break
    case 'delete':
      ElMessage.warning(`删除角色：${role.name}`)
      break
  }
}

const updatePermissionRoles = (permissionKey: string, roleId: string) => {
  // 在项目权限中查找
  const projectPermission = projectPermissions.value.find(p => p.key === permissionKey)
  if (projectPermission && !projectPermission.roles.includes(roleId)) {
    projectPermission.roles.push(roleId)
    return
  }

  // 在人员权限中查找
  const personnelPermission = personnelPermissions.value.find(p => p.key === permissionKey)
  if (personnelPermission && !personnelPermission.roles.includes(roleId)) {
    personnelPermission.roles.push(roleId)
    return
  }

  // 在文件权限中查找
  const filePermission = filePermissions.value.find(p => p.key === permissionKey)
  if (filePermission && !filePermission.roles.includes(roleId)) {
    filePermission.roles.push(roleId)
  }
}

const handleOpenDialog = () => {
  showCreateDialog.value = true
}

const handleCreateRole = (data: CreateRoleData) => {
  // 创建新的角色对象
  const newRole: Role = {
    id: `role_${Date.now()}`, // 生成唯一ID
    name: data.name,
    tagType: 'info', // 默认为info类型
    userCount: 0,
    permissions: data.permissions,
    displayPermissions: data.permissions.slice(0, 3) // 显示前3个权限
  }

  // 添加到角色列表
  roles.value.push(newRole)

  // 更新权限矩阵中的角色配置
  data.permissions.forEach(permissionKey => {
    // 在对应的权限项中添加新角色
    updatePermissionRoles(permissionKey, newRole.id)
  })

  ElMessage.success(`角色 "${data.name}" 创建成功！`)
}

// 获取角色已分配的用户
const getAssignedUsers = (roleId?: string): string[] => {
  if (!roleId) return []
  return roleUserAssignments.value[roleId] || []
}

// 处理分配用户按钮点击
const handleAssignUsers = (role: Role) => {
  currentRole.value = role
  showUserAssignmentDialog.value = true
}

// 处理用户分配确认
const handleUserAssignmentConfirm = (userIds: string[]) => {
  if (currentRole.value) {
    // 更新角色用户分配
    roleUserAssignments.value[currentRole.value.id] = userIds

    // 更新角色用户数量
    const roleIndex = roles.value.findIndex(r => r.id === currentRole.value!.id)
    if (roleIndex > -1) {
      roles.value[roleIndex].userCount = userIds.length
    }
  }
}
</script>

<style scoped lang="scss">
.permissions-container {
  padding: 24px;
  background-color: var(--el-bg-color);
  height: 100%;
  overflow-y: scroll;

  // 暗黑模式适配
  [data-theme='dark'] & {
    background-color: var(--el-bg-color-page);
  }
}

.header-section {
  margin-bottom: 32px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  .title-section {
    .main-title {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .subtitle {
      margin: 0;
      font-size: 16px;
      color: var(--el-text-color-regular);
    }
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.roles-section {
  margin-bottom: 26px;
  .role-cards {
    .role-card {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      height: 320px;
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .role-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .role-info {
          .role-name {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
        }

        .user-count {
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--el-text-color-regular);
          font-size: 15px;
          .more-icon {
            transform: rotate(90deg);
            transition: transform 0.3s ease; // 可选：加个过渡动画更顺滑
            cursor: pointer;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
      }
      .role-description {
        margin: 10px 0;
        font-size: 14px;
        color: #5d5c5c;
      }

      .role-permissions {
        margin-bottom: 16px;

        .permission-list {
          .permission-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: var(--el-text-color-regular);
            font-size: 14px;
            background-color: #f3f4f6;
            padding: 3px 5px;
            border-radius: 15px;
            .el-icon {
              color: var(--el-color-success);
              font-size: 16px;
            }
          }
        }
      }

      .role-actions {
        .el-button {
          width: 100%;
          justify-content: center;
          font-size: 16px;
          color: #161616;
        }
      }
    }
  }
}

.permissions-matrix {
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  .section-top {
    margin-bottom: 30px;
    .section-title {
      font-size: 18px;
      font-weight: 800;
    }
    .section-view {
      color: #6b6b6b;
    }
  }

  .permission-group {
    margin-bottom: 32px;

    .group-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px 0;
      font-size: 16px;
      // color: var(--el-text-color-primary);

      .el-icon {
        font-size: 20px;
      }
    }

    .permission-items {
      .permission-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 16px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        margin-bottom: 12px;
        transition: all 0.2s ease;

        &:hover {
          background: var(--el-fill-color-light);
        }

        .permission-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;

          .permission-title {
            min-width: 100px;
            font-weight: 500;
          }

          .permission-roles {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;

            .role-tag {
              border: 1px solid #dad3d3;
              font-size: 14px;
              color: #000;
            }
          }
        }

        .permission-control {
          .el-switch {
            // 开关样式
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .permissions-container {
    padding: 16px;
  }

  .permission-row {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;

    .permission-info {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;
      width: 100%;
    }

    .permission-control {
      align-self: flex-end;
    }
  }
}

// 下拉菜单样式
:deep(.el-dropdown-menu__item) {
    gap: 8px;
    display: flex;
    align-items: center;
    padding: 10px 14px;
    font-size: 16px;

    &.delete-item {
      color: red !important;

      &:hover {
        background-color: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }
    }

    .el-icon {
      font-size: 16px;
    }
  }

</style>
