<template>
  <div class="layout-header">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon :size="20">
          <Expand v-if="isCollapse" />
          <Fold v-else />
        </el-icon>
      </div>

      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="index"
          :to="item.path"
        >
          {{ t(item.meta?.title || '') }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 搜索 -->
      <div class="header-item">
        <el-icon :size="18" class="header-icon">
          <Search />
        </el-icon>
      </div>

      <!-- 全屏 -->
      <div class="header-item" @click="toggleFullscreen">
        <el-icon :size="18" class="header-icon">
          <FullScreen v-if="!isFullscreen" />
          <Aim v-else />
        </el-icon>
      </div>

      <!-- 语言切换 -->
      <el-dropdown class="header-item" trigger="click" @command="handleLangChange">
        <div class="dropdown-trigger">
          <span class="lang-text">{{ currentLocale === 'zh' ? '中文' : 'EN' }}</span>
          <el-icon :size="14" class="arrow-icon-small">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              command="zh"
              :class="{ 'is-active': currentLocale === 'zh' }"
            >
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              command="en"
              :class="{ 'is-active': currentLocale === 'en' }"
            >
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换 -->
      <div class="header-item" @click="toggleTheme">
        <el-icon :size="18" class="header-icon">
          <Moon v-if="!isDark" />
          <Sunny v-else />
        </el-icon>
      </div>

      <!-- 用户信息 -->
      <el-dropdown class="header-item user-dropdown" trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="username">{{ username }}</span>
          <el-icon class="arrow-icon">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              {{ t('buttons.pureAccountSettings') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              {{ t('buttons.pureLoginOut') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { i18n } from '@/plugins/i18n'
import { useUserStoreHook } from '@/store/modules/user'
import { usePermissionStoreHook } from '@/store/modules/permission'
import { resetRouter } from '@/router'
import { storageLocal } from '@pureadmin/utils'
import { responsiveStorageNameSpace } from '@/config'
import { message } from '@/utils/message'
import {
  Search,
  FullScreen,
  Aim,
  Moon,
  Sunny,
  ArrowDown,
  User,
  SwitchButton,
  Expand,
  Fold,
} from '@element-plus/icons-vue'

const props = defineProps<{
  isCollapse: boolean
}>()

const emit = defineEmits<{
  'update:isCollapse': [value: boolean]
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStoreHook()
const nameSpace = responsiveStorageNameSpace()

const t = (key: string) => (i18n.global.t as any)(key)

// 全屏状态
const isFullscreen = ref(false)

// 用户名
const username = computed(() => userStore.username || '小塔')

// 当前语言
const currentLocale = computed(() => {
  const localeData = storageLocal().getItem<StorageConfigs>(
    `${nameSpace}locale`
  )
  return localeData?.locale ?? 'zh'
})

// 暗黑模式
const isDark = computed(() => {
  const layoutData = storageLocal().getItem(`${nameSpace}layout`) as any
  return layoutData?.darkMode ?? false
})

// 面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => {
    // 过滤掉没有title的路由
    if (!item.meta?.title) return false
    // 过滤掉 showLink 为 false 的路由
    if (item.meta?.showLink === false) return false
    return true
  })

  return matched
})

// 折叠/展开侧边栏
const toggleCollapse = () => {
  emit('update:isCollapse', !props.isCollapse)
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

// 切换主题
const toggleTheme = () => {
  const key = `${nameSpace}layout`
  const layoutData = (storageLocal().getItem(key) as any) || {}
  layoutData.darkMode = !layoutData.darkMode
  layoutData.theme = layoutData.darkMode ? 'dark' : 'light'
  storageLocal().setItem(key, layoutData)

  // 应用主题
  if (layoutData.darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 切换语言
const handleLangChange = (lang: string) => {
  const localeData = storageLocal().getItem<StorageConfigs>(
    `${nameSpace}locale`
  ) || { locale: 'zh' }
  localeData.locale = lang
  storageLocal().setItem(`${nameSpace}locale`, localeData)

  // 切换 i18n 语言
  if (typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
    (i18n.global.locale as any).value = lang
  } else {
    i18n.global.locale = lang as any
  }

  message(t('login.pureSwitchLangSuccess'), { type: 'success' })
}

// 用户菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/account-settings')
      break
    case 'logout':
      userStore.logOut().then(() => {
        // 清空权限和菜单数据
        const permissionStore = usePermissionStoreHook()
        permissionStore.clearPermission()

        // 重置路由
        resetRouter()

        // 跳转到登录页
        router.push('/login')
        message(t('buttons.pureLoginOutSuccess'), { type: 'success' })
      })
      break
  }
}
</script>

<style lang="scss" scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-btn {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .breadcrumb {
      font-size: 14px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;

    .header-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: var(--el-color-primary);
      }

      .header-icon {
        display: flex;
        align-items: center;
      }

      .dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 4px;

        .lang-text {
          font-size: 14px;
          font-weight: 500;
        }

        .arrow-icon-small {
          font-size: 12px;
        }
      }
    }

    .user-dropdown {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .username {
          font-size: 14px;
          font-weight: 500;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .arrow-icon {
          font-size: 12px;
          transition: transform 0.3s;
        }
      }

      &:hover .arrow-icon {
        transform: rotate(180deg);
      }
    }
  }
}

.is-active {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>
