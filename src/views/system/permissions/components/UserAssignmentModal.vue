<template>
  <el-dialog
    v-model="visible"
    width="680px"
    :before-close="handleClose"
    class="user-assignment-modal"
  >
  <template #header>
    <el-icon class="header-icon">
      <UserFilled />
    </el-icon>
      <strong style="font-size: 20px">分配用户到角色: {{ currentRole?.name || '' }}</strong>
      <div style="color: #727272; margin-left: 20px;">
        选择要分配到该角色的用户成员
      </div>
    </template>
    <div class="modal-content">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户姓名、邮箱或部门..."
          :prefix-icon="Search"
          size="large"
          clearable
          class="search-input"
        />
      </div>

      <!-- User Count Status -->
      <div class="status-section">
        <span class="status-text">
          已分配:&nbsp; <span class="count">{{ selectedUsers.length }}</span> 人 &nbsp; 总人数:&nbsp; <span class="total-count">{{ allUsers.length }}</span> 人
        </span>
      </div>

      <!-- User List -->
      <div class="user-list">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-item"
          :class="{ 'selected': selectedUsers.includes(user.id) }"
          @click="toggleUserSelection(user.id)"
        >
          <!-- User Checkbox -->
          <div class="checkbox-section">
            <el-checkbox
              :model-value="selectedUsers.includes(user.id)"
              @change="toggleUserSelection(user.id)"
            />
          </div>

          <!-- User Avatar -->
          <div class="avatar-section">
            <el-avatar :size="42" :src="user.avatar">
              {{ user.name.charAt(0) }}
            </el-avatar>
          </div>

          <!-- User Info (Left Side) -->
          <div class="user-info-left">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>

          <!-- Department & Position (Right Side) -->
          <div class="user-info-right">
            <div class="user-department">{{ user.department }}</div>
            <div class="user-position">{{ user.position }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="modal-footer">
        <el-button @click="handleClose" size="large">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          size="large"
          class="confirm-btn"
        >
          完成
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Search } from '@element-plus/icons-vue'

interface User {
  id: string
  name: string
  email: string
  department: string
  position: string
  avatar?: string
}

interface Role {
  id: string
  name: string
}

interface Props {
  modelValue: boolean
  currentRole?: Role | null
  assignedUsers?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', userIds: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  currentRole: null,
  assignedUsers: () => []
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const searchQuery = ref('')
const selectedUsers = ref<string[]>([])

// Mock user data
const allUsers = ref<User[]>([
  {
    id: '1',
    name: '李明',
    email: 'liming@example.com',
    department: '技术部',
    position: '技术总监',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: '2',
    name: '张三',
    email: 'zhangsan@example.com',
    department: '开发部',
    position: '前端开发工程师',
    avatar: ''
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    department: '测试部',
    position: '测试工程师',
    avatar: ''
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    department: '设计部',
    position: 'UI设计师',
    avatar: ''
  },
  {
    id: '5',
    name: '陈七',
    email: 'chenqi@example.com',
    department: '产品部',
    position: '产品经理',
    avatar: ''
  },
  {
    id: '6',
    name: '刘八',
    email: 'liuba@example.com',
    department: '运维部',
    position: '运维工程师',
    avatar: ''
  }
])

// Filter users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return allUsers.value
  }

  const query = searchQuery.value.toLowerCase()
  return allUsers.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.department.toLowerCase().includes(query) ||
    user.position.toLowerCase().includes(query)
  )
})

// Toggle user selection
const toggleUserSelection = (userId: string) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

// Close modal
const handleClose = () => {
  visible.value = false
}

// Confirm selection
const handleConfirm = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }

  emit('confirm', selectedUsers.value)
  ElMessage.success(`已为 ${props.currentRole?.name} 分配 ${selectedUsers.value.length} 个用户`)
  handleClose()
}

// Watch for modal open/close and assigned users changes
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Reset selected users when modal opens
    selectedUsers.value = [...props.assignedUsers]
    searchQuery.value = ''
  }
})
</script>

<style scoped lang="scss">
.user-assignment-modal {
  .header-icon {
    margin: 20px 0 10px 20px;
    font-size: 20px;
  }
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 0;
  }
}

.modal-content {
  padding: 14px 24px;
  max-height: 500px;
  overflow-y: auto;
}

.search-section {
  margin-bottom: 16px;

  .search-input {
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      // padding: 12px 16px;
    }

    :deep(.el-input__inner) {
      font-size: 16px;
    }
  }
}

.status-section {
  margin-bottom: 20px;

  .status-text {
    font-size: 16px;
    color: var(--el-text-color-regular);

    .count {
      font-weight: 500;
      color: var(--el-color-primary);
    }

    .total-count {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
}

.user-list {
  .user-item {
    display: flex;
    align-items: center;
    padding: 16px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--el-border-color-lighter);
    margin-bottom: 8px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.selected {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-6);
    }

    .checkbox-section {
      margin-right: 12px;
      display: flex;
      align-items: center;
    }

    .avatar-section {
      margin-right: 12px;
    }

    .user-info-left {
      flex: 1;
      margin-right: 12px;

      .user-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .user-email {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .user-info-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      min-width: 120px;

      .user-department {
        font-size: 16px;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
        font-weight: 500;
      }

      .user-position {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--el-border-color-lighter);

  .confirm-btn {
    min-width: 80px;
  }
}

// Dark mode support
[data-theme='dark'] {
  .user-item {
    &:hover {
      background-color: var(--el-fill-color-dark);
    }

    &.selected {
      background-color: var(--el-color-primary-light-8);
    }
  }
}
</style>
