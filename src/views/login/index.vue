<template>
  <div class="login-wrapper">
    <!-- 主题切换和国际化 -->
    <div class="header-tools">
      <!-- 主题切换 -->
      <el-switch
        :model-value="darkMode"
        inline-prompt
        active-text="🌙"
        inactive-text="☀️"
        @change="handleThemeChange"
      />

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="handleLangChange">
        <el-button size="small" text>
          <span class="lang-text">
            {{ currentLocale === 'zh' ? '中文' : 'EN' }}
          </span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              command="zh"
              :class="{ 'is-active': currentLocale === 'zh' }"
            >
              <span v-if="currentLocale === 'zh'">✓</span>
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              command="en"
              :class="{ 'is-active': currentLocale === 'en' }"
            >
              <span v-if="currentLocale === 'en'">✓</span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 左侧背景图 -->
    <div class="login-bg">
      <img :src="bg" :alt="t('login.purePageTitle')" />
    </div>

    <!-- 右侧登录/注册/忘记密码区域 -->
    <div class="login-container">
      <div class="login-box">
        <!-- 标题 - 始终显示 -->
        <h1 class="login-title">{{ t('login.purePageTitle') }}</h1>

        <!-- 登录表单 -->
        <div v-show="currentPage === 0" class="form-container">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <!-- 账号输入框 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                clearable
                :placeholder="t('login.pureUsernameReg')"
                :prefix-icon="useRenderIcon(User)"
              />
            </el-form-item>

            <!-- 密码输入框 -->
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                show-password
                clearable
                :placeholder="t('login.purePassWordReg')"
                :prefix-icon="useRenderIcon(Lock)"
                @keyup.enter="onLogin(loginFormRef)"
              />
            </el-form-item>

            <!-- 记住密码 -->
            <el-form-item>
              <el-checkbox v-model="checked">
                {{ t('login.pureRememberPassword') }}
              </el-checkbox>
            </el-form-item>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                :loading="loading"
                :disabled="disabled"
                @click="onLogin(loginFormRef)"
              >
                {{ t('login.pureLogin') }}
              </el-button>
            </el-form-item>

            <!-- 底部链接 -->
            <el-form-item class="login-footer">
              <div class="footer-links">
                <a href="javascript:void(0)" class="link" @click="switchToRegister">
                  {{ t('login.pureRegisterAccount') }}
                </a>
                <a href="javascript:void(0)" class="link" @click="switchToForgetPassword">
                  {{ t('login.pureForgetPassword') }}
                </a>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 注册表单 -->
        <div v-show="currentPage === 1" class="form-container">
          <LoginRegist @back="switchToLogin" />
        </div>

        <!-- 忘记密码表单 -->
        <div v-show="currentPage === 2" class="form-container">
          <LoginUpdate @back="switchToLogin" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { i18n } from '@/plugins/i18n'
import { message } from '@/utils/message'
import { storageLocal } from '@pureadmin/utils'
import { responsiveStorageNameSpace } from '@/config'
import type { FormInstance } from 'element-plus'
import { useUserStoreHook } from '@/store/modules/user'
import { initRouter } from '@/router/utils'
import { bg } from './utils/static'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Lock from '~icons/ri/lock-fill'
import User from '~icons/ri/user-3-fill'
import { ArrowDown } from '@element-plus/icons-vue'
import LoginRegist from './components/LoginRegist.vue'
import LoginUpdate from './components/LoginUpdate.vue'

defineOptions({
  name: 'Login',
})

const router = useRouter()
const t = (key: string) => (i18n.global.t as any)(key)
const nameSpace = responsiveStorageNameSpace()
const userStore = useUserStoreHook()

// 表单状态
const loading = ref(false)
const checked = ref(false)
const disabled = ref(false)
const loginFormRef = ref<FormInstance>()

// 当前页面: 0=登录, 1=注册, 2=忘记密码
const currentPage = ref(0)

const loginForm = reactive({
  username: '',
  password: '',
})

// 获取当前语言
const currentLocale = computed({
  get: () => {
    const localeData = storageLocal().getItem<StorageConfigs>(
      `${nameSpace}locale`
    )
    return localeData?.locale ?? 'zh'
  },
  set: (val: string) => {
    const localeData = storageLocal().getItem<StorageConfigs>(
      `${nameSpace}locale`
    ) || { locale: 'zh' }
    localeData.locale = val
    storageLocal().setItem(`${nameSpace}locale`, localeData)
    // i18n.global.locale 是一个 ref，需要通过 .value 设置
    if (typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
      (i18n.global.locale as any).value = val
    } else {
      i18n.global.locale = val as any
    }
  }
})

// 表单验证规则
const loginRules = computed(() => ({
  username: [
    { required: true, message: t('login.pureUsernameReg'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.purePassWordReg'), trigger: 'blur' }
  ]
}))
// 应用主题
const applyTheme = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
const darkMode = ref(
  (storageLocal().getItem(`${nameSpace}layout`) as any)?.darkMode ?? false
)


watch(darkMode, (val) => {
  const key = `${nameSpace}layout`
  const layoutData = (storageLocal().getItem(key) as any) || {}
  layoutData.darkMode = val
  layoutData.theme = val ? 'dark' : 'light'
  storageLocal().setItem(key, layoutData)
  applyTheme(val)
})





// 切换主题
const handleThemeChange = (value: boolean) => {
  darkMode.value = value
}

// 切换语言
const handleLangChange = (lang: string) => {
  currentLocale.value = lang
  message(t('login.pureSwitchLangSuccess'), { type: 'success' })
}

// 切换到注册页面
const switchToRegister = () => {
  currentPage.value = 1
  userStore.SET_CURRENTPAGE(1)
}

// 切换到忘记密码页面
const switchToForgetPassword = () => {
  currentPage.value = 2
  userStore.SET_CURRENTPAGE(2)
}

// 切换到登录页面
const switchToLogin = () => {
  currentPage.value = 0
  userStore.SET_CURRENTPAGE(0)
}

// 监听 store 中的 currentPage
watch(() => userStore.currentPage, (newVal) => {
  currentPage.value = newVal
})

// 登录
const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      loading.value = true
      useUserStoreHook()
        .loginByUsername({
          username: loginForm.username,
          password: loginForm.password
        })
        .then((res) => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true
              // 直接跳转到首页，而不是使用 getTopMenu
              router
                .push('/welcome')
                .then(() => {
                  message(t('login.pureLoginSuccess'), { type: 'success' })
                })
                .finally(() => (disabled.value = false))
            })
          } else {
            message(t('login.pureLoginFail'), { type: 'error' })
          }
        })
        .finally(() => (loading.value = false))
    }
  })
}

// 初始化主题和语言
onMounted(() => {
  // 应用当前主题
  applyTheme(darkMode.value)
  // 应用当前语言
  if (typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
    (i18n.global.locale as any).value = currentLocale.value
  } else {
    i18n.global.locale = currentLocale.value as any
  }
})
</script>

<style scoped>
@import url('@/style/login.css');

.form-container {
  width: 100%;
}
</style>
