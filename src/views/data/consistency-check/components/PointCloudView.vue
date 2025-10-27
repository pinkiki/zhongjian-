<template>
  <div class="pointcloud-view">
    <div class="view-header">
      <span class="view-title">点云数据</span>
      <div class="view-controls">
        <el-tooltip content="密度调节" placement="top">
          <el-icon class="control-icon" @click="adjustDensity"><Setting /></el-icon>
        </el-tooltip>
        <el-tooltip content="全屏" placement="top">
          <el-icon class="control-icon" @click="toggleFullscreen"><FullScreen /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div ref="containerRef" class="view-container"></div>
    <div class="view-stats">
      <span>点数: {{ pointCount.toLocaleString() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Setting, FullScreen } from '@element-plus/icons-vue'
import { ThreeScene, createPointCloud } from '../utils/threeHelper'

// 状态
const containerRef = ref<HTMLElement>()
const pointCount = ref(10000)
let threeScene: ThreeScene | null = null

// 初始化场景
const initScene = async () => {
  if (!containerRef.value) return

  try {
    // 创建 Three.js 场景
    threeScene = new ThreeScene(containerRef.value)

    // 设置深色背景
    threeScene.scene.background = null
    threeScene.renderer.setClearColor(0x000000, 0)

    // 创建点云
    const pointCloud = createPointCloud(pointCount.value)
    threeScene.scene.add(pointCloud)

    // 移除坐标轴辅助器（点云场景不需要）
    const axesHelper = threeScene.scene.children.find(
      (child) => child.type === 'AxesHelper'
    )
    if (axesHelper) {
      threeScene.scene.remove(axesHelper)
    }

    // 调整相机位置
    threeScene.camera.position.set(8, 8, 8)

    // 添加自动旋转效果
    const animate = () => {
      pointCloud.rotation.y += 0.003
      pointCloud.rotation.x += 0.001
    }

    // 在渲染循环中添加旋转
    const originalAnimate = () => {
      animate()
      threeScene!.controls.update()
      threeScene!.renderer.render(threeScene!.scene, threeScene!.camera)
      requestAnimationFrame(originalAnimate)
    }

    originalAnimate()
  } catch (error) {
    console.error('点云场景初始化失败:', error)
  }
}

// 调整密度
const adjustDensity = () => {
  // 切换点云密度
  pointCount.value = pointCount.value === 10000 ? 20000 : 10000

  if (threeScene) {
    // 清除旧的点云
    const oldPointCloud = threeScene.scene.children.find(
      (child) => child.type === 'Points'
    )
    if (oldPointCloud) {
      threeScene.scene.remove(oldPointCloud)
    }

    // 创建新的点云
    const pointCloud = createPointCloud(pointCount.value)
    threeScene.scene.add(pointCloud)
  }
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
        console.log('📏 PointCloudView 容器尺寸已调整')
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
</script>

<style lang="scss" scoped>
.pointcloud-view {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
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

  .view-stats {
    position: absolute;
    bottom: 12px;
    right: 16px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 4px;
    color: #ffffff;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    backdrop-filter: blur(4px);
  }
}
</style>
