<template>
  <div class="model-view">
    <div class="view-header">
      <span class="view-title">建筑模型</span>
      <div class="view-controls">
        <el-tooltip content="重置视角" placement="top">
          <el-icon class="control-icon" @click="resetCamera"><RefreshRight /></el-icon>
        </el-tooltip>
        <el-tooltip content="全屏" placement="top">
          <el-icon class="control-icon" @click="toggleFullscreen"><FullScreen /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div ref="containerRef" class="view-container"></div>
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RefreshRight, FullScreen, Loading } from '@element-plus/icons-vue'
import { ThreeScene, createBuildingModel } from '../utils/threeHelper'

// Props
interface Props {
  location?: {
    building: string
    floor: string
    room: string
  }
}

const props = defineProps<Props>()

// 状态
const containerRef = ref<HTMLElement>()
const loading = ref(true)
let threeScene: ThreeScene | null = null

// 初始化场景
const initScene = async () => {
  if (!containerRef.value) return

  try {
    loading.value = true

    // 创建 Three.js 场景
    threeScene = new ThreeScene(containerRef.value)

    // 添加网格辅助线
    threeScene.addGridHelper(10, 10)

    // 加载环境贴图（如果有）
    // await threeScene.loadHDREnvironment('/src/views/data/consistency-check/images/Alex_Hart-Nature_Lab_Bones_2k.hdr')

    // 添加简单的建筑模型
    const building = createBuildingModel()
    threeScene.scene.add(building)

    // 可以在这里加载 GLTF 模型
    // await threeScene.loadGLTFModel('/model/building.glb')

    // 开始渲染
    threeScene.startAnimation()

    loading.value = false
  } catch (error) {
    console.error('场景初始化失败:', error)
    loading.value = false
  }
}

// 重置相机
const resetCamera = () => {
  if (!threeScene) return
  threeScene.camera.position.set(5, 5, 5)
  threeScene.camera.lookAt(0, 0, 0)
  threeScene.controls.reset()
}

// 全屏切换
const toggleFullscreen = () => {
  if (!containerRef.value) return

  if (!document.fullscreenElement) {
    containerRef.value.parentElement?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// ResizeObserver
let resizeObserver: ResizeObserver | null = null

// 生命周期
onMounted(() => {
  initScene()

  // 使用 ResizeObserver 监听容器尺寸变化
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      setTimeout(() => {
        threeScene?.handleResize()
      }, 0)
    })
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  threeScene?.dispose()
})

// 监听位置变化
// watch(() => props.location, () => {
//   // 根据位置更新模型
//   console.log('位置变化:', props.location)
// }, { deep: true })
</script>

<style lang="scss" scoped>
.model-view {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;

  .view-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
    z-index: 10;

    .view-title {
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .view-controls {
      display: flex;
      gap: 12px;

      .control-icon {
        font-size: 18px;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.3s;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));

        &:hover {
          color: #409eff;
          transform: scale(1.1);
        }
      }
    }
  }

  .view-container {
    width: 100%;
    height: 100%;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    font-size: 14px;

    .el-icon {
      font-size: 32px;
    }
  }
}
</style>
