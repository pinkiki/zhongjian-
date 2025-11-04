<template>
  <div class="view-grid" :class="gridClass">
    <!-- 实景全景 -->
    <div v-if="toolbarState.showReality" class="grid-item">
      <PanoramaView :location="location" />
    </div>

    <!-- 三维模型 -->
    <div v-if="toolbarState.showModel" class="grid-item">
      <ModelView :location="location" />
    </div>

    <!-- 点云数据 -->
    <div v-if="toolbarState.showPointCloud" class="grid-item">
      <PointCloudView :location="location" />
    </div>

    <!-- 热力分布（实模结果） -->
    <div v-if="toolbarState.showResult" class="grid-item">
      <HeatmapView :location="location" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import PanoramaView from './PanoramaView.vue'
import ModelView from './ModelView.vue'
import PointCloudView from './PointCloudView.vue'
import HeatmapView from './HeatmapView.vue'
import type { LocationInfo, ToolbarState } from '../types'

// Props
interface Props {
  location?: LocationInfo
  toolbarState: ToolbarState
}

const props = defineProps<Props>()

// 计算网格布局类名
const gridClass = computed(() => {
  const visibleCount = [
    props.toolbarState.showReality,
    props.toolbarState.showModel,
    props.toolbarState.showPointCloud,
    props.toolbarState.showResult,
  ].filter(Boolean).length


  if (visibleCount === 1) {
    return 'single-view'
  } else if (visibleCount === 2) {
    return 'dual-view'
  } else if (visibleCount === 3) {
    return 'triple-view'
  } else if (visibleCount === 4) {
    return 'quad-view'
  }
  return 'quad-view'
})

// 监听工具栏状态变化
watch(
  () => props.toolbarState,
  (newState) => {
    console.log('📡 ViewGrid 接收到新的工具栏状态:', newState)
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.view-grid {
  display: grid;
  gap: 12px;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  // 单视图：全屏显示
  &.single-view {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  // 双视图：左右或上下分屏
  &.dual-view {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }

  // 三视图：一个占一半，两个各占四分之一
  &.triple-view {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;

    .grid-item:first-child {
      grid-row: 1 / 3;
    }
  }

  // 四视图：四宫格
  &.quad-view {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .grid-item {
    min-height: 0;
    min-width: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

// 暗黑模式适配
.dark {
  .view-grid {
    background: #0a0a0a;

    .grid-item {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>
