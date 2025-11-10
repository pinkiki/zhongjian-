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

      <!-- 通知 -->
      <el-popover
        placement="bottom-end"
        :width="380"
        trigger="click"
        :visible="notificationVisible"
        @show="toggleNotifications"
      >
        <template #reference>
          <div class="header-item notification-bell" @click="notificationVisible = !notificationVisible">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
              <el-icon :size="18" class="header-icon">
                <Bell />
              </el-icon>
            </el-badge>
          </div>
        </template>

        <div class="notification-panel">
          <!-- 头部 -->
          <div class="notification-header">
            <span class="notification-title">通知</span>
            <div class="notification-actions">
              <span class="mark-all-read" @click="markAllAsRead">
                全部已读
              </span>
            </div>
          </div>

          <!-- 通知列表 -->
          <div class="notification-list">
            <div
              v-for="notification in displayedNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'is-read': notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-content">
                <div class="notification-header-info">
                  <span class="notification-title-text">{{ notification.title }}</span>
                  <span class="notification-time">{{ notification.time }}</span>
                </div>
                <div class="notification-desc">{{ notification.content }}</div>
              </div>
              <div v-if="!notification.read" class="notification-dot"></div>
            </div>
          </div>

          <!-- 底部折叠按钮 -->
          <div v-if="hasMoreNotifications" class="notification-footer">
            <div class="collapse-btn" @click="showAllNotifications = !showAllNotifications">
              <span>{{ showAllNotifications ? '收起' : '展开更多' }}</span>
              <el-icon :size="12" class="arrow-icon" :class="{ 'expanded': showAllNotifications }">
                <ArrowDown />
              </el-icon>
            </div>
          </div>
        </div>
      </el-popover>

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
  Bell,
  Check,
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
const currentLocale = ref(
  storageLocal().getItem<StorageConfigs>(`${nameSpace}locale`)?.locale ?? 'zh'
)

// 暗黑模式
const isDark = ref(
  (storageLocal().getItem(`${nameSpace}layout`) as any)?.darkMode ?? false
)

// 面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => {
    // 过滤掉根路由（避免所���页面都显示"首页"）
    if (item.path === '/') return false
    // 过滤掉没有title的路由
    if (!item.meta?.title) return false
    // 过滤掉 showLink 为 false 的路由
    if (item.meta?.showLink === false) return false
    return true
  })

  return matched
})

// 通知相关数据
const notifications = ref([
  {
    id: 1,
    title: '系统通知',
    content: '系统将于今晚22:00进行维护升级',
    time: '5分钟前',
    read: false
  },
  {
    id: 2,
    title: '任务提醒',
    content: '您有3个待处理任务需要处理',
    time: '1小时前',
    read: false
  },
  {
    id: 3,
    title: '审核通知',
    content: '小王提交的报表已通过审核',
    time: '2小时前',
    read: true
  },
  {
    id: 4,
    title: '会议提醒',
    content: '下午3点有产品评审会议',
    time: '3小时前',
    read: true
  },
  {
    id: 5,
    title: '公告',
    content: '关于节假日调休的通知安排',
    time: '昨天',
    read: true
  },
  {
    id: 6,
    title: '系统消息',
    content: '您的账号安全等级较高',
    time: '昨天',
    read: true
  },
  {
    id: 7,
    title: '任务完成',
    content: '数据导出任务已完成，请及时下载',
    time: '2天前',
    read: true
  },
  {
    id: 8,
    title: '更新通知',
    content: '系统版本已更新至v2.1.0',
    time: '3天前',
    read: true
  },
  {
    id: 9,
    title: '周报提醒',
    content: '请记得提交本周工作周报',
    time: '一周前',
    read: true
  },
  {
    id: 10,
    title: '安全提醒',
    content: '检测到异常登录，请注意账号安全',
    time: '一周前',
    read: true
  }
])

const notificationVisible = ref(false)
const showAllNotifications = ref(false)

// 计算未读数量
const unreadCount = computed(() => {
  return notifications.value.filter(item => !item.read).length
})

// 显示的通知列表（最多8条）
const displayedNotifications = computed(() => {
  if (showAllNotifications.value) {
    return notifications.value
  }
  return notifications.value.slice(0, 4)
})

// 是否有更多通知
const hasMoreNotifications = computed(() => {
  return notifications.value.length > 4
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
  layoutData.darkMode = !isDark.value
  layoutData.theme = layoutData.darkMode ? 'dark' : 'light'
  storageLocal().setItem(key, layoutData)

  isDark.value = layoutData.darkMode // ✅ 更新响应式状态

  document.documentElement.classList.toggle('dark', layoutData.darkMode)
}


// 切换语言
const handleLangChange = (lang: string) => {
  const localeData =
    storageLocal().getItem<StorageConfigs>(`${nameSpace}locale`) || { locale: 'zh' }
  localeData.locale = lang
  storageLocal().setItem(`${nameSpace}locale`, localeData)

  // 切换 i18n 语言
  if (typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
    (i18n.global.locale as any).value = lang
  } else {
    i18n.global.locale = lang as any
  }

  currentLocale.value = lang // ✅ 更新响应式状态

  message(t('login.pureSwitchLangSuccess'), { type: 'success' })
}

// 通知相关方法
const handleNotificationClick = (notification: any) => {
  notification.read = true
}

const markAllAsRead = () => {
  notifications.value.forEach(item => {
    item.read = true
  })
}

const toggleNotifications = () => {
  showAllNotifications.value = false
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

// 通知相关样式
.notification-bell {
  position: relative;

  .notification-badge {
    :deep(.el-badge__content) {
      transform: translateX(-4px) translateY(-4px);
    }
  }
}

.notification-panel {
  padding: 0;
  max-height: 480px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-light);

    .notification-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .notification-actions {
      .mark-all-read {
        font-size: 13px;
        color: var(--el-color-primary);
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary-light-3);
        }
      }
    }
  }

  .notification-list {
    flex: 1;
    overflow-y: auto;
    max-height: 360px;

    .notification-item {
      position: relative;
      padding: 16px 20px;
      cursor: pointer;
      transition: background-color 0.3s;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:hover {
        background-color: var(--el-fill-color-lighter);
      }

      &.is-read {
        .notification-title-text {
          color: var(--el-text-color-regular);
        }
        .notification-desc {
          color: var(--el-text-color-secondary);
        }
      }

      &:last-child {
        border-bottom: none;
      }

      .notification-content {
        flex: 1;
        margin-right: 8px;

        .notification-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;

          .notification-title-text {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .notification-time {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
          }
        }

        .notification-desc {
          font-size: 13px;
          color: var(--el-text-color-regular);
          line-height: 1.4;
        }
      }

      .notification-dot {
        position: absolute;
        top: 18px;
        right: 16px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
      }
    }
  }

  .notification-footer {
    border-top: 1px solid var(--el-border-color-light);
    padding: 12px 20px;

    .collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      font-size: 13px;
      color: var(--el-color-primary);
      transition: all 0.3s;

      &:hover {
        color: var(--el-color-primary-light-3);
      }

      .arrow-icon {
        transition: transform 0.3s;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }
}

</style>
