<template>
  <div class="panorama-view">
    <div class="view-header">
      <span class="view-title">实景全景</span>
      <div class="view-controls">
        <el-tooltip content="自动旋转" placement="top">
          <el-icon class="control-icon" @click="toggleRotation"><VideoPlay /></el-icon>
        </el-tooltip>
        <el-tooltip content="全屏" placement="top">
          <el-icon class="control-icon" @click="toggleFullscreen"><FullScreen /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div ref="containerRef" class="view-container"></div>
    <div class="view-info">
      <span>360° 全景视图 - 拖拽鼠标查看</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { VideoPlay, FullScreen } from '@element-plus/icons-vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Props
interface Props {
  location?: any
}

defineProps<Props>()

// 状态
const containerRef = ref<HTMLElement>()
const isRotating = ref(false)

// Three.js 变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let sphere: THREE.Mesh
let animationId: number | null = null

// 初始化 Three.js 场景
const initScene = () => {
  if (!containerRef.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 创建场景
  scene = new THREE.Scene()

  // 创建相机（放在球心）
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(0, 0, 0.1) // 相机稍微偏移一点，避免完全在球心

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // 创建球形几何体用于全景图
  const geometry = new THREE.SphereGeometry(500, 60, 40)
  // 翻转几何体，使纹理在内部
  geometry.scale(-1, 1, 1)

  // 先创建程序化纹理
  const defaultTexture = createPanoramaTexture()

  // 创建材质
  const material = new THREE.MeshBasicMaterial({
    map: defaultTexture,
  })

  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)


  // 加载全景图纹理
  const textureLoader = new THREE.TextureLoader()

  textureLoader.load(
    '/images/panorama/hdr.jpg',
    (texture) => {
      // 纹理加载成功
      console.log('✅ 全景图加载成功!', texture)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      material.map = texture
      material.needsUpdate = true
    },
    (progress) => {
      if (progress.total > 0) {
      }
    },
    (error) => {
      console.error('❌ 全景图加载失败:', error)
    }
  )

  // 创建轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25
  controls.enableZoom = true
  controls.enablePan = false
  controls.rotateSpeed = -0.5

  // 开始渲染循环
  animate()
}

// 创建程序化全景纹理（用于演示）
const createPanoramaTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  // 创建渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#1e3a8a')
  gradient.addColorStop(0.5, '#3b82f6')
  gradient.addColorStop(1, '#1e3a8a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制网格
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 2
  const gridSize = 100

  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }

  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  // 添加一些装饰元素（模拟建筑物、窗户等）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2
    const width = Math.random() * 60 + 40
    const height = Math.random() * 80 + 60
    ctx.fillRect(x, y, width, height)

    // 添加窗户
    ctx.fillStyle = 'rgba(64, 158, 255, 0.6)'
    const windowCols = 3
    const windowRows = 4
    const windowWidth = width / (windowCols + 1)
    const windowHeight = height / (windowRows + 1)

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        ctx.fillRect(
          x + (col + 0.5) * windowWidth,
          y + (row + 0.5) * windowHeight,
          windowWidth * 0.6,
          windowHeight * 0.6
        )
      }
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  }

  // 添加地平线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, canvas.height * 0.5)
  ctx.lineTo(canvas.width, canvas.height * 0.5)
  ctx.stroke()

  // 添加文字提示
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('360° 实景全景', canvas.width / 2, canvas.height / 2 - 100)
  ctx.font = '32px Arial'
  ctx.fillText('拖拽鼠标环顾四周', canvas.width / 2, canvas.height / 2 - 40)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  return texture
}

// 动画循环
let frameCount = 0
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 自动旋转
  if (isRotating.value && sphere) {
    sphere.rotation.y += 0.001
  }

  controls.update()
  renderer.render(scene, camera)

  // 每60帧打印一次调试信息
  frameCount++
  if (frameCount === 60) {

    frameCount = 0
  }
}

// 切换自动旋转
const toggleRotation = () => {
  isRotating.value = !isRotating.value
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

// 窗口大小变化
const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// 清理资源
const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (controls) {
    controls.dispose()
  }
  if (renderer) {
    renderer.dispose()
    containerRef.value?.removeChild(renderer.domElement)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
}

// ResizeObserver
let resizeObserver: ResizeObserver | null = null

// 生命周期
onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)

  // 使用 ResizeObserver 监听容器尺寸变化
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 使用 setTimeout 确保 DOM 更新完成
        setTimeout(() => {
          handleResize()
        }, 0)
      }
    })
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  cleanup()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.panorama-view {
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

    .panorama-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .view-info {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 16px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 16px;
    color: #ffffff;
    font-size: 12px;
    backdrop-filter: blur(4px);
  }
}
</style>
