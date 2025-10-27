<template>
  <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <router-link to="/" class="logo-link">
        <span v-if="!isCollapse" class="logo-title">中国建筑第八工程局有限公司</span>
      </router-link>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
        class="sidebar-menu"
        router
      >
        <sidebar-item
          v-for="route in menuRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStoreHook } from '@/store/modules/permission'
import SidebarItem from './SidebarItem.vue'

defineProps<{
  isCollapse: boolean
}>()

const route = useRoute()
const permissionStore = usePermissionStoreHook()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route
  return path
})

// 菜单路由列表
const menuRoutes = computed(() => {
  return permissionStore.wholeMenus
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  position: relative;
  width: 220px;
  height: 100%;
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;
  overflow: hidden;

  &.is-collapse {
    width: 64px;
  }

  /* Logo 区域 */
  .sidebar-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--el-border-color-light);

    .logo-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--el-text-color-primary);

      .logo-img {
        width: 32px;
        height: 32px;
      }

      .logo-img-mini {
        width: 32px;
        height: 32px;
      }

      .logo-title {
        color: #1f41ae;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
      }
    }
  }

  /* 菜单滚动区域 */
  .sidebar-scrollbar {
    height: calc(100% - 60px);

    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }

  /* 菜单样式 */
  .sidebar-menu {
    border: none;
    height: 100%;

    &:not(.el-menu--collapse) {
      width:100%
    }

    // 菜单项激活状态
    :deep(.el-menu-item.is-active) {
      background-color: #4a9dfb !important;
      color: #fff !important;

      .el-icon {
        color: #fff !important;
      }
    }

    // 菜单项 hover 状态
    :deep(.el-menu-item:hover) {
      background-color: rgba(74, 157, 251, 0.1);
    }

    // 子菜单项激活状态
    :deep(.el-sub-menu .el-menu-item.is-active) {
      background-color: #4a9dfb !important;
      color: #fff !important;

      .el-icon {
        color: #fff !important;
      }
    }
  }
}
</style>
