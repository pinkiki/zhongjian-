<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑成员信息' : '邀请新成员'"
    width="520px"
    :close-on-click-modal="false"
    class="member-dialog"
    align-center
  >
    <!-- 对话框头部 -->
    <template #header>
      <div class="dialog-header">
        <div class="member-info">
          <el-avatar :src="memberAvatar" :size="48" class="member-avatar">
            {{ formData.name[0] || '?' }}
          </el-avatar>
          <div class="member-details">
            <h3 class="member-name">{{ formData.name || '新成员' }}</h3>
            <div v-if="isEdit && formData.email" class="member-email">
              {{ formData.email }}
            </div>
            <div v-if="isEdit" class="member-meta">
              <span class="member-role">{{ formData.role }}</span>
              <el-tag type="info" size="small" class="department-tag">
                {{ formData.department }}
              </el-tag>
            </div>
          </div>
        </div>
        <div v-if="isEdit" class="status-toggle">
          <span class="status-label">状态</span>
          <el-switch
            v-model="formData.status"
            active-text="在职"
            inactive-text="离职"
            active-color="#67c23a"
            inactive-color="#f56c6c"
            @change="handleStatusChange"
          />
        </div>
      </div>
    </template>

    <!-- 对话框主体 -->
    <div class="dialog-body">
      <div class="info-section">
        <h4 class="section-title">基础信息</h4>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          size="default"
          class="edit-form"
        >
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入成员姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="员工编号" prop="employeeId">
                <el-input
                  v-model="formData.employeeId"
                  placeholder="请输入员工编号"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="formData.email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="role-section">
        <h4 class="section-title">权限信息</h4>
        <el-form
          ref="formRef2"
          :model="formData"
          label-position="top"
          size="default"
          class="role-form"
        >
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="角色" prop="role">
                <el-select
                  v-model="formData.role"
                  placeholder="请选择角色"
                  style="width: 100%"
                >
                  <el-option label="项目总监" value="项目总监" />
                  <el-option label="主创建筑师" value="主创建筑师" />
                  <el-option label="施工经理" value="施工经理" />
                  <el-option label="结构工程师" value="结构工程师" />
                  <el-option label="BIM工程师" value="BIM工程师" />
                  <el-option label="造价工程师" value="造价工程师" />
                  <el-option label="普通员工" value="普通员工" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门" prop="department">
                <el-select
                  v-model="formData.department"
                  placeholder="请选择部门"
                  style="width: 100%"
                >
                  <el-option label="工程部" value="工程部" />
                  <el-option label="设计部" value="设计部" />
                  <el-option label="技术部" value="技术部" />
                  <el-option label="成本部" value="成本部" />
                  <el-option label="市场部" value="市场部" />
                  <el-option label="财务部" value="财务部" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 对话框底部 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          size="large"
          @click="handleSubmit"
          :loading="loading"
          :icon="isEdit ? Select : Message"
          class="footer-btn"
        >
          {{ isEdit ? '确认' : '发送邀请' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Select, Message } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { FormItemRule } from 'element-plus'

interface FormData {
  id?: number
  name: string
  email: string
  phone: string
  role: string
  department: string
  employeeId: string
  status: boolean
  avatar?: string
}

interface Props {
  visible: boolean
  member?: FormData | null
  mode?: 'edit' | 'invite'
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', member: FormData, mode: 'edit' | 'invite'): void
}

const props = withDefaults(defineProps<Props>(), {
  member: null,
  mode: 'invite',
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const formRef2 = ref<FormInstance>()
const loading = ref(false)
const dialogVisible = ref(false)

// 计算属性
const isEdit = computed(() => props.mode === 'edit')

// 表单数据
const formData = reactive<FormData>({
  id: undefined,
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  employeeId: '',
  status: true,
  avatar: '',
})

// 计算头像
const memberAvatar = computed(() => {
  if (formData.avatar) {
    return formData.avatar
  }
  return ''
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入成员姓名', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: '姓名长度应在 2 到 20 个字符之间',
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: isEdit.value
    ? [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        {
          pattern: /^1[3-9]\d{9}$/,
          message: '请输入正确的手机号码格式',
          trigger: 'blur',
        },
      ]
    : [],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  employeeId: isEdit.value
    ? [{ required: true, message: '请输入员工编号', trigger: 'blur' }]
    : [],
}

// 监听 visible 变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
      resetForm()
      if (isEdit.value && props.member) {
        // 编辑时填充表单数据
        Object.assign(formData, {
          id: props.member.id,
          name: props.member.name,
          email: props.member.email,
          phone: props.member.phone,
          role: props.member.role,
          department: props.member.department,
          employeeId: props.member.employeeId,
          status: props.member.status ?? true,
          avatar: props.member.avatar || '',
        })
      }
    }
  },
)

// 监听 dialogVisible 变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 监听模式变化，重新生成验证规则
watch(isEdit, () => {
  updateFormRules()
})

// 方法

const updateFormRules = () => {
  const phoneRequired: FormItemRule[] = isEdit.value
    ? [{ required: true, message: '请输入手机号码', trigger: 'blur' }]
    : []

  const employeeIdRequired: FormItemRule[] = isEdit.value
    ? [{ required: true, message: '请输入员工编号', trigger: 'blur' }]
    : []

  formRules.phone = phoneRequired.concat([
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码格式',
      trigger: 'blur',
    },
  ])

  formRules.employeeId = employeeIdRequired
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  if (formRef2.value) {
    formRef2.value.resetFields()
  }
  Object.assign(formData, {
    id: undefined,
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    employeeId: '',
    status: true,
    avatar: '',
  })
}

const handleStatusChange = (value: boolean) => {
  console.log('状态变化:', value)
}

const handleSubmit = async () => {
  if (!formRef.value || !formRef2.value) return

  try {
    // 验证两个表单
    await Promise.all([formRef.value.validate(), formRef2.value.validate()])

    loading.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 生成员工编号（邀请模式）
    if (!isEdit.value && !formData.employeeId) {
      formData.employeeId = `EMP${Date.now().toString().slice(-6)}`
    }

    emit('success', { ...formData }, isEdit.value ? 'edit' : 'invite')
    dialogVisible.value = false

    ElMessage.success(isEdit.value ? '修改成功' : '邀请发送成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.member-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }

  :deep(.el-dialog__header) {
    padding: 0;
    border-bottom: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 20px 24px;
    border-top: 1px solid #f0f0f0;
    background-color: #fafafa;
  }

  // 对话框头部
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 20px;
    background-color: #f8f9fb;
    border-bottom: 1px solid #e5e7eb;

    .member-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .member-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-size: 18px;
      }

      .member-details {
        .member-name {
          margin: 0 0 5px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .member-email {
          margin: 5px 0;
          font-size: 14px;
          color: #64748b;
        }

        .member-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .member-role {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }

          .department-tag {
            font-size: 12px;
            border-radius: 4px;
            font-weight: 500;
          }
        }
      }
    }

    .status-toggle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .status-label {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
      }

      :deep(.el-switch) {
        .el-switch__label {
          font-size: 12px;
          font-weight: 500;
        }
      }
    }
  }

  // 对话框主体
  .dialog-body {
    padding: 20px 24px;

    .info-section,
    .role-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }
    }

    // 表单样式
    .edit-form,
    .role-form {
      :deep(.el-form-item) {
        margin-bottom: 16px;

        .el-form-item__label {
          color: #374151;
          font-weight: 600;
          font-size: 14px;
          line-height: 20px;
        }
      }

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background-color: #ffffff;
        box-shadow: none;
        transition: all 0.3s ease;

        &:hover {
          border-color: #9ca3af;
        }

        &.is-focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .el-input__inner {
          font-size: 14px;
          color: #1a1a1a;
        }
      }

      :deep(.el-select) {
        width: 100%;

        .el-input__wrapper {
          &.is-focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }
      }
    }
  }

  // 对话框底部
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      border-radius: 8px;
      padding: 10px 24px;
      font-weight: 500;
      font-size: 14px;

      &.el-button--primary {
        background-color: #1a1a1a;
        border-color: #1a1a1a;

        &:hover {
          background-color: #374151;
          border-color: #374151;
        }
      }

      &.el-button--default {
        border-color: #d1d5db;
        color: #374151;

        &:hover {
          background-color: #f9fafb;
          border-color: #9ca3af;
        }
      }
    }
  }
}

// 暗黑模式适配
:deep(.dark) {
  .member-dialog {
    :deep(.el-dialog) {
      background-color: #1a1a1a;
      border-color: #3a3a3a;
    }

    .dialog-header {
      background-color: #252525;
      border-bottom-color: #3a3a3a;

      .member-info {
        .member-details {
          .member-name {
            color: #ffffff;
          }

          .member-email {
            color: #a0a0a0;
          }

          .member-meta {
            .member-role {
              color: #a0a0a0;
            }
          }
        }
      }

      .status-toggle {
        .status-label {
          color: #a0a0a0;
        }
      }
    }

    .dialog-body {
      .info-section,
      .role-section {
        .section-title {
          color: #ffffff;
          border-bottom-color: #3a3a3a;
        }
      }

      .edit-form,
      .role-form {
        :deep(.el-form-item__label) {
          color: #ffffff;
        }

        :deep(.el-input__wrapper) {
          background-color: #2a2a2a;
          border-color: #3a3a3a;

          &:hover {
            border-color: #4a4a4a;
          }

          &.is-focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
          }

          .el-input__inner {
            color: #ffffff;
          }
        }
      }
    }

    :deep(.el-dialog__footer) {
      background-color: #252525;
      border-top-color: #3a3a3a;

      .dialog-footer {
        .el-button {
          &.el-button--primary {
            background-color: #3b82f6;
            border-color: #3b82f6;

            &:hover {
              background-color: #60a5fa;
              border-color: #60a5fa;
            }
          }

          &.el-button--default {
            background-color: #2a2a2a;
            border-color: #3a3a3a;
            color: #ffffff;

            &:hover {
              background-color: #3a3a3a;
              border-color: #4a4a4a;
            }
          }
        }
      }
    }
  }
}
.footer-btn :deep(.el-icon) {
  font-size: 18px;
}
</style>
