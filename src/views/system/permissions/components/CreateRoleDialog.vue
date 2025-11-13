<template>
  <el-dialog
    v-model="visible"
    width="600px"
    @close="handleClose"
    class="create-role-dialog"
  >
    <template #header>
      <strong style="font-size: 22px">创建新角色</strong>
      <div style="color: #727272;">
        为房地产项目创建自定义角色，并分配相应的权限
      </div>
    </template>
    <div class="dialog-content">
      <!-- 角色名称输入 -->
      <div class="form-section">
        <label class="form-label">角色名称</label>
        <el-input
          v-model="form.name"
          placeholder="请输入角色名称"
          class="role-input"
        />
      </div>

      <!-- 角色描述 -->
      <div class="form-section">
        <label class="form-label">角色描述</label>
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="简要描述该角色的职责和权限范围"
          class="role-textarea"
        />
      </div>
      <div class="form-section">
        <label class="form-label">角色颜色</label>
        <div class="color-selector">
          <div
            v-for="item in colors"
            :key="item.name"
            class="color-item"
            :class="{ active: selectedColor === item.name }"
            @click="selectedColor = item.name"
          >
            <div
              class="color-circle"
              :style="{ backgroundColor: item.value }"
            ></div>
            <span class="color-name">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 权限配置 -->
      <div class="form-section">
        <label class="form-label">权限配置</label>
        <div class="permissions-config">
          <!-- 项目权限 -->
          <div class="permission-group">
            <div class="group-header">
              <el-checkbox
                v-model="permissionStates.project.checked"
                :indeterminate="permissionStates.project.indeterminate"
                @change="handleGroupChange('project')"
                class="group-checkbox"
              >
                <span class="group-title">项目权限</span>
              </el-checkbox>
            </div>
            <div class="group-content">
              <el-checkbox
                v-for="permission in projectPermissions"
                :key="permission.key"
                v-model="form.permissions[permission.key]"
                class="permission-checkbox"
                @change="updateGroupState('project')"
              >
                {{ permission.title }}
              </el-checkbox>
            </div>
          </div>

          <!-- 人员权限 -->
          <div class="permission-group">
            <div class="group-header">
              <el-checkbox
                v-model="permissionStates.personnel.checked"
                :indeterminate="permissionStates.personnel.indeterminate"
                @change="handleGroupChange('personnel')"
                class="group-checkbox"
              >
                <span class="group-title">人员权限</span>
              </el-checkbox>
            </div>
            <div class="group-content">
              <el-checkbox
                v-for="permission in personnelPermissions"
                :key="permission.key"
                v-model="form.permissions[permission.key]"
                class="permission-checkbox"
                @change="updateGroupState('personnel')"
              >
                {{ permission.title }}
              </el-checkbox>
            </div>
          </div>

          <!-- 文件权限 -->
          <div class="permission-group">
            <div class="group-header">
              <el-checkbox
                v-model="permissionStates.file.checked"
                :indeterminate="permissionStates.file.indeterminate"
                @change="handleGroupChange('file')"
                class="group-checkbox"
              >
                <span class="group-title">文件权限</span>
              </el-checkbox>
            </div>
            <div class="group-content">
              <el-checkbox
                v-for="permission in filePermissions"
                :key="permission.key"
                v-model="form.permissions[permission.key]"
                class="permission-checkbox"
                @change="updateGroupState('file')"
              >
                {{ permission.title }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">取消</el-button>
        <el-button type="primary" @click="handleConfirm" size="large">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
const colors = [
  { name: '红色', value: '#E74C3C' },
  { name: '橙色', value: '#E67E22' },
  { name: '黄色', value: '#F1C40F' },
  { name: '绿色', value: '#2ECC71' },
  { name: '青色', value: '#1ABC9C' },
  { name: '蓝色', value: '#3498DB' },
  { name: '紫色', value: '#9B59B6' },
  { name: '灰色', value: '#95A5A6' },
]

const selectedColor = ref('')

interface Permission {
  key: string
  title: string
}

interface PermissionState {
  checked: boolean
  indeterminate: boolean
}

interface PermissionStates {
  project: PermissionState
  personnel: PermissionState
  file: PermissionState
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: any]
}>()

const visible = ref(props.modelValue)

const form = reactive({
  name: '',
  description: '',
  permissions: {} as Record<string, boolean>,
})

const permissionStates = reactive<PermissionStates>({
  project: { checked: false, indeterminate: false },
  personnel: { checked: false, indeterminate: false },
  file: { checked: false, indeterminate: false },
})

const projectPermissions: Permission[] = [
  { key: 'create_project', title: '创建项目' },
  { key: 'edit_project', title: '编辑项目' },
  { key: 'delete_project', title: '删除项目' },
  { key: 'view_project', title: '查看项目' },
]

const personnelPermissions: Permission[] = [
  { key: 'add_member', title: '添加成员' },
  { key: 'remove_member', title: '移除成员' },
  { key: 'assign_role', title: '分配角色' },
]

const filePermissions: Permission[] = [
  { key: 'upload_file', title: '上传文件' },
  { key: 'delete_file', title: '删除文件' },
  { key: 'download_file', title: '下载文件' },
]

// 初始化权限对象
const initPermissions = () => {
  const allPermissions = [
    ...projectPermissions,
    ...personnelPermissions,
    ...filePermissions,
  ]

  allPermissions.forEach((permission) => {
    form.permissions[permission.key] = false
  })
}

// 更新分组状态
const updateGroupState = (group: 'project' | 'personnel' | 'file') => {
  let permissions: Permission[]

  switch (group) {
    case 'project':
      permissions = projectPermissions
      break
    case 'personnel':
      permissions = personnelPermissions
      break
    case 'file':
      permissions = filePermissions
      break
  }

  const checkedCount = permissions.filter((p) => form.permissions[p.key]).length
  const totalCount = permissions.length

  permissionStates[group].checked = checkedCount === totalCount
  permissionStates[group].indeterminate =
    checkedCount > 0 && checkedCount < totalCount
}

// 处理分组全选/取消全选
const handleGroupChange = (group: 'project' | 'personnel' | 'file') => {
  let permissions: Permission[]

  switch (group) {
    case 'project':
      permissions = projectPermissions
      break
    case 'personnel':
      permissions = personnelPermissions
      break
    case 'file':
      permissions = filePermissions
      break
  }

  const isChecked = permissionStates[group].checked
  permissions.forEach((permission) => {
    form.permissions[permission.key] = isChecked
  })
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
  resetForm()
}

// 确认提交
const handleConfirm = () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入角色名称')
    return
  }

  const selectedPermissions = Object.keys(form.permissions).filter(
    (key) => form.permissions[key],
  )

  if (selectedPermissions.length === 0) {
    ElMessage.warning('请至少选择一项权限')
    return
  }

  const roleData = {
    name: form.name.trim(),
    description: form.description.trim(),
    permissions: selectedPermissions,
  }

  emit('confirm', roleData)
  handleClose()
}

// 重置表单
const resetForm = () => {
  form.name = ''
  form.description = ''
  initPermissions()

  // 重置分组状态
  Object.keys(permissionStates).forEach((key) => {
    permissionStates[key as keyof PermissionStates] = {
      checked: false,
      indeterminate: false,
    }
  })
}

// 监听显示状态
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      initPermissions()
      // 初始化分组状态
      updateGroupState('project')
      updateGroupState('personnel')
      updateGroupState('file')
    }
  },
)

// 初始化
initPermissions()
</script>

<style scoped lang="scss">
.create-role-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
  }

  :deep(.el-dialog__header) {
    padding: 24px 24px 0;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 0 24px 24px;
  }
}

.dialog-content {
  .form-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .role-input {
      :deep(.el-input__wrapper) {
        padding: 5px 16px;
        border-radius: 8px;
        font-size: 16px;
      }
    }

    .role-textarea {
      :deep(.el-textarea__inner) {
        padding: 12px 16px;
        border-radius: 8px;
        resize: none;
        font-size: 16px;
      }
    }
  }
  .color-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 每行4个 */
    gap: 14px 14px; /* 行间距24px，列间距16px */
    justify-items: center;
    margin-top: 10px;
  }
  .color-item {
    border: 1px solid #ececf0;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease;
    padding: 15px 26px;
    border-radius: 10px;

    &:hover {
      transform: scale(1.1);
    border: 1px solid #050505;
    }
  }
  .color-circle {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    margin-right: 20px;
  }

  .color-name {
    // margin-top: 6px;
    font-size: 16px;
    color: #181818;
  }
  .permissions-config {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;

    // 滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--el-fill-color-lighter);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-darker);
      border-radius: 3px;

      &:hover {
        background: var(--el-border-color-dark);
      }
    }

    .permission-group {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .group-header {
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        .group-checkbox {
          :deep(.el-checkbox__label) {
            .group-title {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
          }
        }
      }

      .group-content {
        padding-left: 24px;

        .permission-checkbox {
          display: block;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          :deep(.el-checkbox__label) {
            font-size: 16px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
  }
}
</style>
