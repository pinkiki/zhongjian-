<template>
  <div class="organization-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ t('menus.pureOrgManagement') }}</h1>
      <p class="page-description">{{ t('organization.pageDescription') }}</p>
    </div>


    <!-- 展示列表 -->
    <div class="company-list">
      <div class="even">
        <div class="count">
          <span class="desc">总公司数量</span>
          <span class="num">{{ headquartersCount }}</span>
        </div>
        <div class="icon">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
      </div>
      <div class="even">
        <div class="count">
          <span class="desc">分公司数量</span>
          <span class="num">{{ subsidiariesCount }}</span>
        </div>
        <div class="icon">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
      </div>
      <div class="even">
        <div class="count">
          <span class="desc">总成员数量</span>
          <span class="num">{{ totalMembersCount }}</span>
        </div>
        <div class="icon">
          <el-icon><User /></el-icon>
        </div>
      </div>
    </div>
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          :placeholder="t('organization.searchPlaceholder')"
          class="search-input"
          clearable
          @input="handleSearch"
          size="large"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="filter-section">
        <el-radio-group v-model="statusFilter" @change="handleFilterChange">
          <el-radio-button label="all">
            {{ t('organization.all') }}
          </el-radio-button>
          <el-radio-button label="active">
            {{ t('organization.active') }}
          </el-radio-button>
          <el-radio-button label="inactive">
            {{ t('organization.inactive') }}
          </el-radio-button>
          <el-radio-button label="pending">
            {{ t('organization.pending') }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="action-section">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          {{ t('organization.create') }}
        </el-button>
      </div>
    </div>
    <!-- 组织卡片列表 -->
    <div class="organization-list">
      <div
        v-for="company in filteredCompanies"
        :key="company.id"
        class="company-card"
      >
        <!-- 主公司卡片 -->
        <div class="main-company">
          <div class="company-header">
            <div class="company-info">
              <div class="company-logo">
                <img :src="company.logo" :alt="company.name" />
              </div>
              <div class="company-details">
                <h3 class="company-name">{{ company.name }}</h3>
                <div class="company-badges">
                  <el-tag
                    :type="getTagType(company.type)"
                    size="small"
                    class="type-tag"
                  >
                    {{ getTagText(company.type) }}
                  </el-tag>
                  <el-tag
                    :type="getStatusType(company.status)"
                    size="small"
                    class="status-tag"
                  >
                    {{ getStatusText(company.status) }}
                  </el-tag>
                </div>
                <p class="company-description">{{ company.description }}</p>
              </div>
            </div>

            <div class="company-actions">
              <el-button
                v-if="company.subsidiaries && company.subsidiaries.length > 0"
                text
                type="primary"
                @click="toggleExpand(company.id)"
              >
                <el-icon>
                  <ArrowDown v-if="!company.expanded" />
                  <ArrowUp v-else />
                </el-icon>
                {{
                  company.expanded
                    ? t('organization.collapse')
                    : t('organization.expand')
                }}
              </el-button>

              <el-dropdown trigger="click">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEdit(company)">
                      <el-icon><Edit /></el-icon>
                      {{ t('common.edit') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(company)">
                      <el-icon><Delete /></el-icon>
                      {{ t('common.delete') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <!-- 公司详细信息 -->
          <div class="company-meta">
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ company.address }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Phone /></el-icon>
              <span>{{ company.phone }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Message /></el-icon>
              <span>{{ company.email }}</span>
            </div>
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>
                {{
                  t('organization.memberCount', { count: company.memberCount })
                }}
              </span>
            </div>
            <div class="meta-item subsidiary-item">
              <el-icon class="subsidiary-icon"><OfficeBuilding /></el-icon>
              <span>
                {{
                  company.subsidiaries ? company.subsidiaries.length : 0
                }}家分公司
              </span>
            </div>

            <div class="meta-item">
              <el-icon><Folder /></el-icon>
              <span>
                {{
                  t('organization.projectCount', {
                    count: company.projectCount,
                  })
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- 子公司列表 -->
        <div
          v-if="company.expanded && company.subsidiaries"
          class="subsidiaries"
        >
          <div
            v-for="subsidiary in company.subsidiaries"
            :key="subsidiary.id"
            class="subsidiary-card"
          >
            <div class="subsidiary-content">
              <div class="subsidiary-info">
                <div class="subsidiary-title">
                  <h4 class="subsidiary-name">{{ subsidiary.name }}</h4>
                  <div class="company-badges">
                    <el-tag
                      :type="getTagType(subsidiary.type)"
                      size="small"
                      class="type-tag1"
                    >
                      {{ getTagText(subsidiary.type) }}
                    </el-tag>
                  </div>
                </div>
                <p class="subsidiary-description">
                  {{ subsidiary.description }}
                </p>

                <div class="subsidiary-meta">
                  <div class="meta-item">
                    <el-icon><Location /></el-icon>
                    <span>{{ subsidiary.address }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Phone /></el-icon>
                    <span>{{ subsidiary.phone }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>
                      {{
                        t('organization.memberCount', {
                          count: subsidiary.memberCount,
                        })
                      }}
                    </span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Folder /></el-icon>
                    <span>
                      {{
                        t('organization.projectCount', {
                          count: subsidiary.projectCount,
                        })
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="subsidiary-actions">
                <el-dropdown trigger="click">
                  <el-button text>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleEdit(subsidiary)">
                        <el-icon><Edit /></el-icon>
                        {{ t('common.edit') }}
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleDelete(subsidiary)">
                        <el-icon><Delete /></el-icon>
                        {{ t('common.delete') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑组织对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('organization.edit') : t('organization.create')"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        label-position="top"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        size="large"
      >
      <el-row :gutter="20">
  <el-col :span="12">
      <el-form-item :label="t('organization.type')" prop="type">
          <el-select
            v-model="formData.type"
            :placeholder="t('organization.typePlaceholder')"
          >
            <el-option label="总公司" value="headquarters" />
            <el-option label="分公司" value="branch" />
            <el-option label="子公司" value="subsidiary" />
          </el-select>
        </el-form-item>
         </el-col>

  <el-col :span="12">
         <el-form-item :label="t('organization.status')" prop="status">
          <el-select
            v-model="formData.status"
            :placeholder="t('organization.statusPlaceholder')"
            style="width: 100%"
          >
            <el-option :label="t('organization.active')" value="active" />
            <el-option :label="t('organization.inactive')" value="inactive" />
            <el-option :label="t('organization.pending')" value="pending" />
          </el-select>
        </el-form-item>
          </el-col>
</el-row>
        <el-form-item :label="t('organization.name')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('organization.namePlaceholder')"
          />
        </el-form-item>



        <el-form-item
          :label="t('organization.contactPerson')"
          prop="contactPerson"
        >
          <el-input
            v-model="formData.contactPerson"
            :placeholder="t('organization.contactPersonPlaceholder')"
          />
        </el-form-item>

        <el-form-item
          :label="t('organization.contactPhone')"
          prop="contactPhone"
        >
          <el-input
            v-model="formData.contactPhone"
            :placeholder="t('organization.contactPhonePlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="t('organization.email')" prop="email">
          <el-input
            v-model="formData.email"
            :placeholder="t('organization.emailPlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="t('organization.address')" prop="address">
          <el-input
            v-model="formData.address"
            type="textarea"
            :rows="3"
            :placeholder="t('organization.addressPlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="t('organization.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="t('organization.descriptionPlaceholder')"
          />
        </el-form-item>


      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ t('common.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  Search,
  Plus,
  ArrowDown,
  ArrowUp,
  MoreFilled,
  Edit,
  OfficeBuilding,
  Delete,
  Location,
  Phone,
  Message,
  User,
  Folder,
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

defineOptions({
  name: 'OrganizationManagement',
})

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('all')

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  type: 'headquarters',
  contactPerson: '',
  contactPhone: '',
  email: '',
  address: '',
  description: '',
  status: 'active',
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    {
      required: true,
      message: t('organization.nameRequired'),
      trigger: 'blur',
    },
    { min: 2, max: 50, message: t('organization.nameLength'), trigger: 'blur' },
  ],
  type: [
    {
      required: true,
      message: t('organization.typeRequired'),
      trigger: 'change',
    },
  ],
  contactPerson: [
    {
      required: true,
      message: t('organization.contactPersonRequired'),
      trigger: 'blur',
    },
  ],
  contactPhone: [
    {
      required: true,
      message: t('organization.contactPhoneRequired'),
      trigger: 'blur',
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: t('organization.contactPhoneInvalid'),
      trigger: 'blur',
    },
  ],
  email: [
    { type: 'email', message: t('organization.emailInvalid'), trigger: 'blur' },
  ],
  status: [
    {
      required: true,
      message: t('organization.statusRequired'),
      trigger: 'change',
    },
  ],
}

// 模拟公司数据（层级结构）
const companies = ref([
  {
    id: 1,
    name: '中建八局',
    type: 'headquarters',
    status: 'active',
    description:
      '中国建筑第八工程局有限公司，是世界500强企业——中国建筑股份有限公司的全资子公司',
    address: '上海市浦东新区源深路269号',
    phone: '021-58689999',
    email: 'cscec8b@cscec.com',
    memberCount: 1500,
    projectCount: 86,
    logo: 'https://via.placeholder.com/60x60/409eff/ffffff?text=中建',
    expanded: false,
    subsidiaries: [
      {
        id: 11,
        type: 'branch',
        name: '中建八局第一建设有限公司',
        description: '承担房屋建筑、市政公用工程、公路工程等施工业务',
        address: '山东省济南市历下区经十路9999号',
        phone: '0531-87996666',
        memberCount: 320,
        projectCount: 24,
      },
      {
        id: 12,
        type: 'branch',
        name: '中建八局第二建设有限公司',
        description: '主营房屋建筑工程、机电安装工程、钢结构工程等',
        address: '江苏省南京市建邺区庐山路168号',
        phone: '025-87798888',
        memberCount: 280,
        projectCount: 18,
      },
      {
        id: 13,
        type: 'branch',
        name: '中建八局第三建设有限公司',
        description: '以房屋建筑、基础设施建设为主的综合性建筑企业',
        address: '四川省成都市高新区天府大道中段666号',
        phone: '028-66668888',
        memberCount: 350,
        projectCount: 22,
      },
      {
        id: 14,
        type: 'branch',
        name: '中建八局第四建设有限公司',
        description: '专注基础设施建设和市政工程',
        address: '广东省深圳市南山区科技园南区',
        phone: '0755-86758888',
        memberCount: 290,
        projectCount: 20,
      },
      {
        id: 15,
        type: 'branch',
        name: '中建八局装饰工程有限公司',
        description: '专业从事建筑装修装饰工程设计与施工',
        address: '上海市闵行区申滨南路1228号',
        phone: '021-54859999',
        memberCount: 180,
        projectCount: 15,
      },
    ],
  },
  {
    id: 2,
    name: '中建八局上海公司',

    type: 'headquarters',
    status: 'active',
    description: '负责华东地区业务发展，重点发展超高层建筑、大型公共建筑等',
    address: '上海市浦东新区福山路33号',
    phone: '021-58887777',
    email: 'shanghai@cscec8b.com',
    memberCount: 680,
    projectCount: 32,
    logo: 'https://via.placeholder.com/60x60/67c23a/ffffff?text=上海',
    expanded: false,
    subsidiaries: [
      {
        id: 21,
        type: 'branch',
        name: '中建八局上海公司浦东分公司',
        description: '负责浦东新区及临港新片区业务',
        address: '上海市浦东新区张江高科技园区',
        phone: '021-58996666',
        memberCount: 150,
        projectCount: 8,
      },
      {
        id: 22,
        type: 'branch',
        name: '中建八局上海公司虹桥分公司',
        description: '服务虹桥商务区及周边区域项目',
        address: '上海市闵行区申长路988弄',
        phone: '021-62288888',
        memberCount: 120,
        projectCount: 6,
      },
      {
        id: 23,
        type: 'branch',
        name: '中建八局上海公司徐汇分公司',
        description: '专注徐汇区城市更新和历史建筑保护项目',
        address: '上海市徐汇区淮海中路999号',
        phone: '021-64477777',
        memberCount: 95,
        projectCount: 5,
      },
      {
        id: 24,
        type: 'branch',
        name: '中建八局上海公司青浦分公司',
        description: '服务长三角一体化示范区建设',
        address: '上海市青浦区徐泾镇诸光路1118号',
        phone: '021-59258888',
        memberCount: 110,
        projectCount: 7,
      },
    ],
  },
  {
    id: 3,
    name: '中建八局华北公司',
    type: 'headquarters',
    status: 'active',
    description: '覆盖京津冀区域，专注于超高层、大型综合体建设',
    address: '北京市朝阳区建国路88号',
    phone: '010-85559999',
    email: 'north@cscec8b.com',
    memberCount: 520,
    projectCount: 28,
    logo: 'https://via.placeholder.com/60x60/e6a23c/ffffff?text=华北',
    expanded: false,
    subsidiaries: [
      {
        id: 31,
        type: 'branch',
        name: '中建八局华北公司天津分公司',
        description: '服务天津及河北地区建筑市场',
        address: '天津市河西区南京路58号',
        phone: '022-23396666',
        memberCount: 180,
        projectCount: 12,
      },
    ],
  },
  {
    id: 4,
    name: '中建八局海外事业部',
    type: 'headquarters',
    status: 'pending',
    description: '负责海外市场开拓和国际工程项目管理',
    address: '上海市浦东新区源深路269号',
    phone: '021-58685555',
    email: 'overseas@cscec8b.com',
    memberCount: 85,
    projectCount: 5,
    logo: 'https://via.placeholder.com/60x60/f56c6c/ffffff?text=海外',
    expanded: false,
    subsidiaries: [],
  },
])

// 动态计算统计数据
const headquartersCount = computed(() => {
  return companies.value.filter((company) => company.type === 'headquarters')
    .length
})

const subsidiariesCount = computed(() => {
  return companies.value.reduce((total, company) => {
    return total + (company.subsidiaries ? company.subsidiaries.length : 0)
  }, 0)
})

const totalMembersCount = computed(() => {
  return companies.value.reduce((total, company) => {
    let companyMembers = company.memberCount || 0
    let subsidiaryMembers = company.subsidiaries
      ? company.subsidiaries.reduce(
          (sum, subsidiary) => sum + (subsidiary.memberCount || 0),
          0,
        )
      : 0
    return total + companyMembers + subsidiaryMembers
  }, 0)
})

// 过滤后的公司列表
const filteredCompanies = computed(() => {
  let filtered = companies.value

  // 按状态筛选
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(
      (company) => company.status === statusFilter.value,
    )
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (company) =>
        company.name.toLowerCase().includes(keyword) ||
        company.description.toLowerCase().includes(keyword) ||
        company.address.toLowerCase().includes(keyword) ||
        company.phone.includes(keyword),
    )
  }

  return filtered
})

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning',
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: t('organization.active'),
    inactive: t('organization.inactive'),
    pending: t('organization.pending'),
  }
  return statusMap[status] || status
}

// 获取标签类型
const getTagType = (type: string) => {
  const tagMap: Record<string, string> = {
    headquarters: '',
    branch: 'info',
    subsidiary: 'warning',
  }
  return tagMap[type] || ''
}

// 获取标签文本
const getTagText = (type: string) => {
  const tagMap: Record<string, string> = {
    headquarters: t('organization.headquarters'),
    branch: t('organization.branch'),
    subsidiary: t('organization.subsidiary'),
  }
  return tagMap[type] || type
}

// 展开/收起子公司
const toggleExpand = (companyId: number) => {
  const company = companies.value.find((c) => c.id === companyId)
  if (company) {
    company.expanded = !company.expanded
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

// 筛选变化处理
const handleFilterChange = () => {
  // 筛选逻辑已在computed中实现
}

// 新建组织
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑组织
const handleEdit = (company: any) => {
  isEdit.value = true
  Object.assign(formData, {
    id: company.id,
    name: company.name,
    type: company.type || 'branch',
    contactPerson: company.contactPerson || '',
    contactPhone: company.phone || '',
    email: company.email || '',
    address: company.address || '',
    description: company.description || '',
    status: company.status,
  })
  dialogVisible.value = true
}

// 删除组织
const handleDelete = async (company: any) => {
  try {
    await ElMessageBox.confirm(
      t('organization.deleteConfirm', { name: company.name }),
      t('organization.deleteTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      },
    )

    const index = companies.value.findIndex((c) => c.id === company.id)
    if (index > -1) {
      companies.value.splice(index, 1)
      ElMessage.success(t('organization.deleteSuccess'))
    }
  } catch {
    // 用户取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (isEdit.value) {
      // 编辑
      const index = companies.value.findIndex((c) => c.id === formData.id)
      if (index > -1) {
        companies.value[index] = {
          ...companies.value[index],
          name: formData.name,
          type: formData.type,
          contactPerson: formData.contactPerson,
          phone: formData.contactPhone,
          email: formData.email,
          address: formData.address,
          description: formData.description,
          status: formData.status,
        }
        ElMessage.success(t('organization.editSuccess'))
      }
    } else {
      // 新建
      const newCompany = {
        id: Date.now(),
        name: formData.name,
        type: formData.type,
        status: formData.status,
        description: formData.description,
        address: formData.address,
        phone: formData.contactPhone,
        email: formData.email,
        contactPerson: formData.contactPerson,
        memberCount: 0,
        projectCount: 0,
        logo: `https://via.placeholder.com/60x60/409eff/ffffff?text=${formData.name.slice(0, 2)}`,
        expanded: false,
        subsidiaries: [],
      }
      companies.value.unshift(newCompany)
      ElMessage.success(t('organization.createSuccess'))
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    id: '',
    name: '',
    type: 'headquarters',
    contactPerson: '',
    contactPhone: '',
    email: '',
    address: '',
    description: '',
    status: 'active',
  })
}
</script>

<style lang="scss" scoped>
.organization-container {
  height: 100%;
  background-color: #fff;
  padding: 24px;
  overflow-y: auto;
  margin-bottom: 100px;

  // 暗黑模式适配
  html.dark & {
    background-color: #1a1a1a;
    color: #ffffff;
  }

  .page-header {
    text-align: left;
    margin-bottom: 32px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.5px;

      html.dark & {
        color: #ffffff;
      }
    }

    .page-description {
      margin: 0;
      font-size: 16px;
      color: #6b7280;
      font-weight: 400;

      html.dark & {
        color: #a0a0a0;
      }
    }
  }

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    gap: 24px;
    flex-wrap: wrap;

    .search-section {
      flex: 1;
      min-width: 320px;
      max-width: 480px;

      .search-input {
        :deep(.el-input__wrapper) {
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;

          &:hover {
            border-color: #d1d5db;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          &.is-focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }

        :deep(.el-input__inner) {
          font-size: 16px;
          padding: 12px 16px;
        }
      }
    }

    .filter-section {
      flex-shrink: 0;

      :deep(.el-radio-group) {
        .el-radio-button {
          &:first-child .el-radio-button__inner {
            border-radius: 8px 0 0 8px;
          }

          &:last-child .el-radio-button__inner {
            border-radius: 0 8px 8px 0;
          }

          .el-radio-button__inner {
            border: 1px solid #e5e7eb;
            background-color: #ffffff;
            color: #6b7280;
            padding: 8px 16px;
            font-size: 14px;
            transition: all 0.3s ease;

            &:hover {
              background-color: #f9fafb;
              border-color: #d1d5db;
            }
          }

          &.is-active .el-radio-button__inner {
            background-color: #3b82f6;
            border-color: #3b82f6;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
          }
        }
      }
    }

    .action-section {
      flex-shrink: 0;

      .el-button {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      }
    }
  }
  .company-list {
    display: flex;
    justify-content: space-between;
    .even {
      width: 32.5%;
      border: 1px solid #e5e7eb;
      height: 130px;
      margin-bottom: 32px;
      border-radius: 16px;
      padding: 24px;
      justify-content: space-between;
      align-items: center;
      display: flex;
      background-color: #ffffff;
      transition: all 0.3s ease;

      html.dark & {
        background-color: #2a2a2a;
        border-color: #3a3a3a;
      }

      .count {
        display: flex;
        flex-direction: column;
        .desc {
          font-size: 18px;
          color: #626266;
          margin-bottom: 13px;

          html.dark & {
            color: #a0a0a0;
          }
        }
        .num {
          font-size: 28px;
          color: #1a1a1a;

          html.dark & {
            color: #ffffff;
          }
        }
      }
      .icon {
        font-size: 50px;
      }
    }
    .even:nth-child(1) .icon {
      color: #3b82f6;

      html.dark & {
        color: #60a5fa;
      }
    }
    .even:nth-child(2) .icon {
      color: #2c9b33;

      html.dark & {
        color: #4ade80;
      }
    }
    .even:nth-child(3) .icon {
      color: #832c9b;

      html.dark & {
        color: #c084fc;
      }
    }
  }
  .organization-list {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .company-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease;
      overflow: hidden;

      html.dark & {
        background: #2a2a2a;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        border: 1px solid #3a3a3a;

        &:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.9);
        }
      }

      &:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .main-company {
        padding: 24px;

        .company-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;

          .company-info {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            flex: 1;

            .company-logo {
              width: 64px;
              height: 64px;
              border-radius: 32px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              flex-shrink: 0;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            .company-details {
              flex: 1;

              .company-name {
                margin: 0 0 8px 0;
                font-size: 20px;
                font-weight: 600;
                color: #1a1a1a;
                line-height: 1.3;

                html.dark & {
                  color: #ffffff;
                }
              }

              .company-badges {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;

                .type-tag {
                  font-weight: 500;
                  height: 25px;
                  border-radius: 10px;
                  width: 60px;
                  background-color: #000;
                  color: #fff;

                  html.dark & {
                    background-color: #3a3a3a;
                    color: #ffffff;
                  }
                }

                .status-tag {
                  font-weight: 500;
                  height: 25px;
                  border-radius: 10px;
                  width: 60px;
                }
              }

              .company-description {
                margin: 0;
                font-size: 16px;
                color: #3f4248;
                line-height: 1.5;

                html.dark & {
                  color: #a0a0a0;
                }
              }
            }
          }

          .company-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;

            .el-button {
              border-radius: 6px;
              font-size: 14px;
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-1px);
              }
            }

            .el-dropdown {
              .el-button {
                padding: 8px;
                border-radius: 6px;
              }
            }
          }
        }

        .company-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;

          html.dark & {
            border-top-color: #3a3a3a;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            color: #3f4248;

            html.dark & {
              color: #a0a0a0;
            }

            .el-icon {
              color: #9ca3af;
              font-size: 16px;

              html.dark & {
                color: #6b7280;
              }
            }

            span {
              line-height: 1.4;
            }

            &.subsidiary-item {
              .subsidiary-icon {
                font-size: 16px;
              }
            }
          }
        }
      }

      .subsidiaries {
        background-color: #fff;
        border-top: 1px solid #e5e7eb;
        padding: 20px 24px;

        html.dark & {
          background-color: #252525;
          border-top-color: #3a3a3a;
        }

        .subsidiary-card {
          background-color: #f4f5f7;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;

          html.dark & {
            background-color: #1f1f1f;
            border-color: #3a3a3a;

            &:hover {
              border-color: #4a4a4a;
            }
          }

          &:last-child {
            margin-bottom: 0;
          }

          &:hover {
            border-color: #d1d5db;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transform: translateX(4px);

            html.dark & {
              box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
            }
          }

          .subsidiary-content {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            .subsidiary-info {
              flex: 1;
              .subsidiary-title {
                display: flex;
                .subsidiary-name {
                  margin: 0 0 8px 0;
                  font-size: 18px;
                  font-weight: 600;
                  color: #3c4149;

                  html.dark & {
                    color: #ffffff;
                  }
                }
                .type-tag1 {
                  margin-left: 20px;
                  font-weight: 500;
                  height: 25px;
                  border-radius: 10px;
                  width: 60px;
                  background-color: #edeff2;
                  color: #1b1b1b;

                  html.dark & {
                    background-color: #3a3a3a;
                    color: #ffffff;
                  }
                }
              }

              .subsidiary-description {
                margin: 0 0 12px 0;
                font-size: 16px;
                color: #3f4248;
                line-height: 1.4;

                html.dark & {
                  color: #a0a0a0;
                }
              }

              .subsidiary-meta {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 8px;

                .meta-item {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 16px;
                  color: #55585e;

                  html.dark & {
                    color: #6b7280;
                  }

                  .el-icon {
                    color: #55585e;
                    font-size: 14px;

                    html.dark & {
                      color: #4b5563;
                    }
                  }
                }
              }
            }

            .subsidiary-actions {
              flex-shrink: 0;
              margin-left: 16px;

              .el-dropdown {
                .el-button {
                  padding: 6px;
                  border-radius: 6px;
                  color: #9ca3af;

                  &:hover {
                    color: #6b7280;
                    background-color: #f3f4f6;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // 对话框样式
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;

    html.dark & {
      background-color: #2a2a2a;
      border: 1px solid #3a3a3a;
    }

    .el-dialog__header {
      padding: 24px 24px 10px;

      html.dark & {
        background-color: #2a2a2a;
        border-bottom: 1px solid #3a3a3a;
      }

      .el-dialog__title {
        font-size: 22px;
        font-weight: 600;
        color: #1a1a1a;

        html.dark & {
          color: #ffffff;
        }
      }
    }

    .el-dialog__body {
      padding: 24px;

      html.dark & {
        background-color: #2a2a2a;
      }
    }

    .el-dialog__footer {
      padding: 16px 24px 24px;
      border-top: 1px solid #e5e7eb;

      html.dark & {
        background-color: #2a2a2a;
        border-top-color: #3a3a3a;
      }
    }
  }

  // 表单样式
  :deep(.el-form) {
    .el-form-item__label {
      color: #0f0f0f;
      font-weight: 500;
      font-size: 16px;

      html.dark & {
        color: #ffffff;
      }
    }
    .el-select__wrapper {
      font-size: 16px;
    }
    .el-input__wrapper,
    .el-textarea__inner,
    .el-select .el-input__wrapper {
      font-size: 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
      &:hover {
        border-color: #d1d5db;
      }

      &.is-focus {
        border-color: #3b82f6;
      }

      html.dark & {
        background-color: #1a1a1a;
        border-color: #3a3a3a;

        &:hover {
          border-color: #4a4a4a;
        }

        &.is-focus {
          border-color: #60a5fa;
        }

        .el-input__inner {
          color: #ffffff;
        }

        .el-textarea__inner {
          color: #ffffff;
        }
      }
    }

    .el-textarea__inner {
      resize: vertical;

      html.dark & {
        background-color: #1a1a1a;
        color: #ffffff;
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  .organization-container {
    padding: 16px;

    .action-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;

      .search-section {
        max-width: none;
      }

      .filter-section {
        display: flex;
        justify-content: center;
      }

      .action-section {
        display: flex;
        justify-content: center;
      }
    }

    .organization-list {
      .company-card {
        .main-company {
          padding: 20px;

          .company-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;

            .company-info {
              .company-logo {
                width: 56px;
                height: 56px;
              }

              .company-details {
                .company-name {
                  font-size: 18px;
                }
              }
            }

            .company-actions {
              justify-content: flex-end;
            }
          }

          .company-meta {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }

        .subsidiaries {
          padding: 16px 20px;

          .subsidiary-card {
            .subsidiary-content {
              flex-direction: column;
              align-items: stretch;
              gap: 12px;

              .subsidiary-actions {
                margin-left: 0;
                align-self: flex-end;
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 640px) {
  .organization-container {
    padding: 12px;

    .page-header {
      margin-bottom: 24px;

      .page-title {
        font-size: 24px;
      }

      .page-description {
        font-size: 14px;
      }
    }

    .organization-list {
      .company-card {
        border-radius: 12px;

        .main-company {
          padding: 16px;

          .company-header {
            .company-info {
              gap: 12px;

              .company-logo {
                width: 48px;
                height: 48px;
                border-radius: 8px;
              }

              .company-details {
                .company-name {
                  font-size: 16px;
                }

                .company-badges {
                  .el-tag {
                    font-size: 12px;
                  }
                }

                .company-description {
                  font-size: 13px;
                }
              }
            }
          }

          .company-meta {
            grid-template-columns: 1fr;
            gap: 8px;

            .meta-item {
              font-size: 12px;
            }
          }
        }

        .subsidiaries {
          padding: 12px 16px;

          .subsidiary-card {
            padding: 12px;
            border-radius: 8px;

            .subsidiary-content {
              .subsidiary-info {
                .subsidiary-name {
                  font-size: 14px;
                  .type-tag1 {
                    font-weight: 500;
                    height: 25px;
                    border-radius: 10px;
                    width: 60px;
                    background-color: #f4f4f5;
                    color: #626161;
                  }
                }

                .subsidiary-description {
                  font-size: 12px;
                }

                .subsidiary-meta {
                  grid-template-columns: 1fr;
                  gap: 6px;

                  .meta-item {
                    font-size: 11px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
