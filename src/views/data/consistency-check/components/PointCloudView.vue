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

    <!-- 加载进度 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载点云数据中...</div>
        <el-progress :percentage="loadingProgress" :stroke-width="8" />
        <div class="loading-info">{{ loadingInfo }}</div>
      </div>
    </div>

    <!-- 模拟数据提示 -->
    <div v-if="useMockData && pointCount > 0" class="mock-data-notice">
      <el-alert
        title="使用模拟数据"
        type="info"
        :closable="false"
        description="由于原始 LAS 文件太大（15GB），当前显示的是模拟建筑点云数据用于测试界面功能。"
      />
    </div>

    <!-- 采样率控制 -->
    <div v-if="!loading && !useMockData && pointCount > 0" class="sampling-control">
      <div class="sampling-label">
        采样率: {{ (samplingRate * 100).toFixed(0) }}%
      </div>
      <el-slider
        v-model="samplingRate"
        :min="0.01"
        :max="1"
        :step="0.01"
        :format-tooltip="formatTooltip"
        @change="reloadWithNewSampling"
      />
    </div>

    <div ref="containerRef" class="view-container"></div>

    <div class="view-stats">
      <span>显示点数: {{ pointCount.toLocaleString() }}</span>
      <span v-if="totalPoints > 0" class="total-points">
        / 总点数: {{ totalPoints.toLocaleString() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Setting, FullScreen } from '@element-plus/icons-vue'
import * as THREE from 'three'
import { ThreeScene, loadLASPointCloud } from '../utils/threeHelper'
import type { LocationInfo } from '../types'

// Props
interface Props {
  location?: LocationInfo
}

const props = defineProps<Props>()

// 状态
const containerRef = ref<HTMLElement>()
const pointCount = ref(0)
const totalPoints = ref(0)
const loading = ref(false)
const loadingProgress = ref(0)
const loadingInfo = ref('')
const samplingRate = ref(0.05) // 默认 5% 采样率
let threeScene: ThreeScene | null = null
let currentPointCloud: THREE.Points | null = null
let currentBounds: { min: THREE.Vector3; max: THREE.Vector3 } | null = null

// LAS 文件路径
const lasFilePath = ''

// 是否使用模拟数据（用于测试大文件加载问题）
const useMockData = ref(true) // 临时设置为 true 以测试界面

// 格式化 tooltip
const formatTooltip = (val: number) => `${(val * 100).toFixed(0)}%`

// 进度回调
const handleProgress = (progress: number) => {
  loadingProgress.value = Math.round(progress * 100)

  if (progress < 0.3) {
    loadingInfo.value = '正在读取文件...'
  } else if (progress < 0.6) {
    loadingInfo.value = '正在采样点云数据...'
  } else if (progress < 0.9) {
    loadingInfo.value = '正在生成渲染数据...'
  } else {
    loadingInfo.value = '即将完成...'
  }
}

// 创建模拟点云数据（用于测试）
const createMockPointCloud = (count: number = 100000) => {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  // 模拟建筑物点云数据
  const buildingWidth = 50
  const buildingHeight = 30
  const buildingDepth = 40

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 生成建筑物形状的点云
    const x = (Math.random() - 0.5) * buildingWidth
    const y = Math.random() * buildingHeight
    const z = (Math.random() - 0.5) * buildingDepth

    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z

    // 基于高度生成颜色
    const t = y / buildingHeight
    if (t < 0.25) {
      colors[i3] = 0
      colors[i3 + 1] = t * 4
      colors[i3 + 2] = 1
    } else if (t < 0.5) {
      colors[i3] = (t - 0.25) * 4
      colors[i3 + 1] = 1
      colors[i3 + 2] = 1 - (t - 0.25) * 4
    } else if (t < 0.75) {
      colors[i3] = 1
      colors[i3 + 1] = 1 - (t - 0.5) * 4
      colors[i3 + 2] = 0
    } else {
      colors[i3] = 1
      colors[i3 + 1] = (1 - t) * 4
      colors[i3 + 2] = 0
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  })

  const points = new THREE.Points(geometry, material)

  const bounds = {
    min: new THREE.Vector3(-buildingWidth / 2, 0, -buildingDepth / 2),
    max: new THREE.Vector3(buildingWidth / 2, buildingHeight, buildingDepth / 2),
  }

  return { points, pointCount: count, totalPoints: count * 20, bounds } // 假装总点数是显示的 20 倍
}

// 初始化场景
const initScene = async () => {
  if (!containerRef.value) return

  try {
    loading.value = true
    loadingProgress.value = 0

    // 创建 Three.js 场景
    threeScene = new ThreeScene(containerRef.value)

    // 设置深色背景
    threeScene.scene.background = null
    threeScene.renderer.setClearColor(0x000000, 0)

    let points: THREE.Points
    let count: number
    let total: number
    let bounds: { min: THREE.Vector3; max: THREE.Vector3 }

    if (useMockData.value) {
      // 使用模拟数据
      console.log('🎭 使用模拟点云数据进行测试')
      loadingInfo.value = '生成模拟点云数据...'

      // 模拟加载进度
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        loadingProgress.value = i
      }

      const mockData = createMockPointCloud(100000)
      points = mockData.points
      count = mockData.pointCount
      total = mockData.totalPoints
      bounds = mockData.bounds

      console.log('✅ 模拟数据生成成功')
      console.log('显示点数:', count)
      console.log('模拟总点数:', total)
    } else {
      // 加载真实 LAS 点云文件
      console.log('开始加载 LAS 文件:', lasFilePath)
      console.log('采样率:', samplingRate.value)

      const result = await loadLASPointCloud(lasFilePath, samplingRate.value, handleProgress)

      points = result.points
      count = result.pointCount
      total = result.totalPoints
      bounds = result.bounds

      console.log('LAS 文件加载成功')
      console.log('总点数:', total)
      console.log('显示点数:', count)
    }

    console.log('边界:', bounds)

    currentPointCloud = points
    currentBounds = bounds
    pointCount.value = count
    totalPoints.value = total

    // 将点云添加到场景
    threeScene.scene.add(points)

    // 移除坐标轴辅助器（点云场景不需要）
    const axesHelper = threeScene.scene.children.find(
      (child) => child.type === 'AxesHelper'
    )
    if (axesHelper) {
      threeScene.scene.remove(axesHelper)
    }

    // 计算相机位置（基于点云边界）
    const center = {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2,
    }

    const size = Math.max(
      bounds.max.x - bounds.min.x,
      bounds.max.y - bounds.min.y,
      bounds.max.z - bounds.min.z
    )

    // 调整相机位置以查看整个点云
    const distance = size * 2
    threeScene.camera.position.set(distance, distance, distance)
    threeScene.camera.lookAt(center.x, center.y, center.z)

    // 更新控制器目标点
    threeScene.controls.target.set(center.x, center.y, center.z)
    threeScene.controls.update()

    // 添加自动旋转效果（可选）
    const animate = () => {
      points.rotation.y += 0.001
    }

    // 在渲染循环中添加旋转
    const originalAnimate = () => {
      animate()
      threeScene!.controls.update()
      threeScene!.renderer.render(threeScene!.scene, threeScene!.camera)
      requestAnimationFrame(originalAnimate)
    }

    originalAnimate()

    loading.value = false
  } catch (error) {
    console.error('点云场景初始化失败:', error)
    loading.value = false
    loadingInfo.value = '加载失败: ' + (error as Error).message
  }
}

// 重新加载点云（使用新的采样率）
const reloadWithNewSampling = async () => {
  if (!threeScene || !containerRef.value) return

  try {
    loading.value = true
    loadingProgress.value = 0

    // 移除旧的点云
    if (currentPointCloud) {
      threeScene.scene.remove(currentPointCloud)
      currentPointCloud.geometry.dispose()
      ;(currentPointCloud.material as THREE.Material).dispose()
    }

    // 加载新的点云
    console.log('重新加载点云，采样率:', samplingRate.value)

    const { points, pointCount: count, totalPoints: total, bounds } = await loadLASPointCloud(
      lasFilePath,
      samplingRate.value,
      handleProgress
    )

    currentPointCloud = points
    currentBounds = bounds
    pointCount.value = count
    totalPoints.value = total

    // 将新点云添加到场景
    threeScene.scene.add(points)

    console.log('点云重新加载成功，显示点数:', count)

    loading.value = false
  } catch (error) {
    console.error('重新加载点云失败:', error)
    loading.value = false
    loadingInfo.value = '重新加载失败: ' + (error as Error).message
  }
}

// 调整密度
const adjustDensity = () => {
  if (!currentPointCloud) return

  // 调整点的大小和透明度
  const material = currentPointCloud.material as THREE.PointsMaterial

  // 在三种模式之间切换：小/中/大
  if (material.size < 0.05) {
    material.size = 0.1
    material.opacity = 0.9
  } else if (material.size < 0.15) {
    material.size = 0.2
    material.opacity = 0.95
  } else {
    material.size = 0.03
    material.opacity = 0.85
  }

  material.needsUpdate = true
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
  console.log('🚀 PointCloudView mounted')
  console.log('📦 containerRef:', containerRef.value)
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
  } else {
    console.error('❌ containerRef 未找到！')
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

    .total-points {
      margin-left: 4px;
      opacity: 0.7;
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    .loading-content {
      text-align: center;
      width: 300px;
      padding: 30px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);

      .loading-spinner {
        width: 50px;
        height: 50px;
        margin: 0 auto 20px;
        border: 4px solid rgba(64, 158, 255, 0.2);
        border-top-color: #409eff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        color: #ffffff;
        font-size: 16px;
        margin-bottom: 20px;
        font-weight: 500;
      }

      .loading-info {
        color: #909399;
        font-size: 12px;
        margin-top: 12px;
      }
    }
  }

  .mock-data-notice {
    position: absolute;
    top: 60px;
    left: 16px;
    right: 16px;
    z-index: 50;
    max-width: 500px;

    :deep(.el-alert) {
      background-color: rgba(144, 147, 153, 0.15);
      backdrop-filter: blur(8px);
      border-color: rgba(144, 147, 153, 0.3);

      .el-alert__title,
      .el-alert__description {
        color: #ffffff;
      }
    }
  }

  .sampling-control {
    position: absolute;
    top: 60px;
    left: 16px;
    right: 16px;
    max-width: 300px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    z-index: 10;

    .sampling-label {
      color: #ffffff;
      font-size: 13px;
      margin-bottom: 8px;
      font-weight: 500;
    }

    :deep(.el-slider) {
      .el-slider__runway {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .el-slider__bar {
        background-color: #409eff;
      }

      .el-slider__button {
        border-color: #409eff;
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
