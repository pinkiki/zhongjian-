<template>
  <div class="gaussian-container">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar" :class="{ 'toolbar-hidden': !showToolbar }">
      <div class="toolbar-left">
        <el-button-group>
          <el-tooltip content="重置视角 (R)" placement="bottom">
            <el-button @click="resetCamera" :icon="RefreshLeft" type="primary" />
          </el-tooltip>
          <el-tooltip content="截图保存 (S)" placement="bottom">
            <el-button @click="takeScreenshot" :icon="Camera" />
          </el-tooltip>
          <el-tooltip content="全屏模式 (F)" placement="bottom">
            <el-button @click="toggleFullscreen" :icon="isFullscreen ? FullScreen : ScaleToOriginal" />
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="toolbar-center">
        <el-button-group>
          <el-tooltip content="后视图" placement="bottom">
            <el-button :type="currentView === 'back' ? 'primary' : ''" @click="setView('back')">后</el-button>
          </el-tooltip>
          <el-tooltip content="左视图" placement="bottom">
            <el-button :type="currentView === 'left' ? 'primary' : ''" @click="setView('left')">左</el-button>
          </el-tooltip>
          <el-tooltip content="右视图" placement="bottom">
            <el-button :type="currentView === 'right' ? 'primary' : ''" @click="setView('right')">右</el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-tooltip content="隐藏工具栏" placement="bottom">
          <el-button @click="showToolbar = false" :icon="ArrowUp" circle />
        </el-tooltip>
      </div>
    </div>

    <!-- 工具栏显示按钮 -->
    <transition name="fade">
      <div v-if="!showToolbar" class="toolbar-toggle" @click="showToolbar = true">
        <el-icon><ArrowDown /></el-icon>
      </div>
    </transition>

    <!-- 3D 画布 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 加载覆盖层 -->
    <transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <el-progress
            :percentage="loadingProgress"
            :stroke-width="8"
            :show-text="false"
            color="#409EFF"
          />
          <p class="loading-text">加载高斯模型中...</p>
          <p class="loading-percent">{{ loadingProgress }}%</p>
          <p class="loading-tip">{{ loadingTips[currentTipIndex] }}</p>
        </div>
      </div>
    </transition>

    <!-- 右侧控制面板 -->
    <div class="controls-panel" :class="{ 'panel-collapsed': !showPanel }">
      <div class="panel-toggle" @click="showPanel = !showPanel">
        <el-icon>
          <component :is="showPanel ? ArrowRight : ArrowLeft" />
        </el-icon>
      </div>

      <div v-show="showPanel" class="panel-content">
        <!-- 渲染设置卡片 -->
        <el-card shadow="hover" class="control-card">
          <template #header>
            <div class="card-header" @click="renderSettingsExpanded = !renderSettingsExpanded">
              <div class="header-left">
                <el-icon><Setting /></el-icon>
                <span>渲染设置</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-expanded': renderSettingsExpanded }">
                <ArrowDown />
              </el-icon>
            </div>
          </template>

          <transition name="slide-down">
            <div v-show="renderSettingsExpanded">
              <el-space direction="vertical" :size="16" style="width: 100%">
                <!-- 环境数据 -->
                <div class="control-item">
                  <div class="control-label">
                    <el-icon><Sunny /></el-icon>
                    <span>环境数据</span>
                  </div>
                  <el-switch
                    v-model="useEnv"
                    @change="handleEnvChange"
                    :disabled="!modelLoaded"
                  />
                </div>

                <!-- 球谐渲染 -->
                <div class="control-item">
                  <div class="control-label">
                    <el-icon><MagicStick /></el-icon>
                    <span>球谐渲染</span>
                  </div>
                  <el-switch
                    v-model="useShcoef"
                    @change="handleShcoefChange"
                    :disabled="!modelLoaded"
                  />
                </div>

                <!-- 点云模式 -->
                <div class="control-item">
                  <div class="control-label">
                    <el-icon><More /></el-icon>
                    <span>点云模式</span>
                  </div>
                  <el-switch
                    v-model="pointsMode"
                    @change="handlePointsModeChange"
                    :disabled="!modelLoaded"
                  />
                </div>

                <!-- 背景颜色 -->
                <div class="control-item">
                  <div class="control-label">
                    <el-icon><Picture /></el-icon>
                    <span>背景颜色</span>
                  </div>
                  <el-color-picker
                    v-model="backgroundColor"
                    @change="handleBackgroundChange"
                    size="default"
                  />
                </div>

                <el-divider style="margin: 8px 0" />

                <!-- 控制速度 -->
                <div class="control-item-full">
                  <div class="control-label">
                    <el-icon><Odometer /></el-icon>
                    <span>移动速度</span>
                  </div>
                  <el-slider
                    v-model="controlSpeed"
                    :min="0.1"
                    :max="5"
                    :step="0.1"
                    @input="handleSpeedChange"
                    :format-tooltip="(val: number) => `${val.toFixed(1)}x`"
                  />
                </div>

                <!-- 渲染质量 -->
                <div class="control-item-full">
                  <div class="control-label">
                    <el-icon><Monitor /></el-icon>
                    <span>渲染质量</span>
                  </div>
                  <el-radio-group v-model="renderQuality" @change="handleQualityChange" size="small">
                    <el-radio-button label="low">低</el-radio-button>
                    <el-radio-button label="medium">中</el-radio-button>
                    <el-radio-button label="high">高</el-radio-button>
                  </el-radio-group>
                </div>

                <el-divider style="margin: 8px 0" />

                <!-- 性能模式 -->
                <div class="control-item">
                  <div class="control-label">
                    <el-icon><Promotion /></el-icon>
                    <span>性能模式</span>
                  </div>
                  <el-switch v-model="performanceMode" @change="handlePerformanceModeChange" />
                </div>

                <!-- 数据缓存 -->
                <div class="control-item">
                  <div class="control-label">
                    <el-icon><FolderOpened /></el-icon>
                    <span>数据缓存</span>
                  </div>
                  <el-tag :type="useIndexDB ? 'success' : 'info'" size="small">
                    {{ useIndexDB ? '已启用' : '已禁用' }}
                  </el-tag>
                </div>
              </el-space>
            </div>
          </transition>
        </el-card>

        <!-- 模型信息卡片 -->
        <el-card shadow="hover" class="control-card info-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon><DataAnalysis /></el-icon>
                <span>模型信息</span>
              </div>
            </div>
          </template>

          <div class="info-content">
            <div class="info-item">
              <span class="info-label">点数量:</span>
              <span class="info-value">29,197,426</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据大小:</span>
              <span class="info-value">934 MB</span>
            </div>
            <div class="info-item">
              <span class="info-label">细节层次:</span>
              <span class="info-value">6 级</span>
            </div>
            <div class="info-item">
              <span class="info-label">加载状态:</span>
              <el-tag :type="modelLoaded ? 'success' : 'warning'" size="small">
                {{ modelLoaded ? '已加载' : '加载中' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="bottom-info-bar">
      <div class="info-section">
        <el-icon><Aim /></el-icon>
        <span>相机位置: X:{{ cameraPos.x }} Y:{{ cameraPos.y }} Z:{{ cameraPos.z }}</span>
      </div>
      <div class="info-section">
        <el-icon><Timer /></el-icon>
        <span>FPS: {{ fps }}</span>
        <el-tag
          :type="fps >= 50 ? 'success' : fps >= 30 ? 'warning' : 'danger'"
          size="small"
          effect="dark"
          style="margin-left: 8px"
        >
          {{ fps >= 50 ? '流畅' : fps >= 30 ? '一般' : '卡顿' }}
        </el-tag>
      </div>
      <div class="info-section">
        <el-icon><View /></el-icon>
        <span>当前视图: {{ viewNames[currentView] }}</span>
      </div>
    </div>

    <!-- 快捷键提示 -->
    <transition name="slide-up">
      <div v-if="showHelp" class="help-panel">
        <div class="help-header">
          <span>快捷键帮助</span>
          <el-button text @click="showHelp = false" :icon="Close" size="small" />
        </div>
        <div class="help-content">
          <div class="help-item">
            <kbd>鼠标左键</kbd>
            <span>旋转视角</span>
          </div>
          <div class="help-item">
            <kbd>鼠标右键</kbd>
            <span>平移视角</span>
          </div>
          <div class="help-item">
            <kbd>鼠标滚轮</kbd>
            <span>缩放视角</span>
          </div>
          <div class="help-item">
            <kbd>R</kbd>
            <span>重置相机</span>
          </div>
          <div class="help-item">
            <kbd>S</kbd>
            <span>截图</span>
          </div>
          <div class="help-item">
            <kbd>F</kbd>
            <span>全屏</span>
          </div>
          <div class="help-item">
            <kbd>H</kbd>
            <span>显示/隐藏帮助</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 帮助按钮 -->
    <el-tooltip content="快捷键帮助 (H)" placement="left">
      <div class="help-button" @click="showHelp = !showHelp">
        <el-icon :size="24"><QuestionFilled /></el-icon>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  RefreshLeft,
  Camera,
  FullScreen,
  ScaleToOriginal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Setting,
  Sunny,
  MagicStick,
  More,
  Picture,
  Odometer,
  Monitor,
  Promotion,
  FolderOpened,
  DataAnalysis,
  Aim,
  Timer,
  View,
  QuestionFilled,
  Close
} from '@element-plus/icons-vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// @ts-ignore
import { LCCRender } from '@/libs/lcc-0.5.4.js'

// ==================== 响应式数据 ====================
const canvasContainer = ref<HTMLDivElement>()
const loading = ref(true)
const loadingProgress = ref(0)
const modelLoaded = ref(false)

// 加载提示
const loadingTips = [
  '正在加载点云数据...',
  '准备渲染引擎...',
  '构建空间索引...',
  '优化渲染性能...',
  '即将完成...'
]
const currentTipIndex = ref(0)

// UI 状态
const showToolbar = ref(true)
const showPanel = ref(true)
const showHelp = ref(false)
const isFullscreen = ref(false)
const renderSettingsExpanded = ref(true)
const currentView = ref<'free' | 'back' | 'left' | 'right'>('free')

// 渲染设置
const useEnv = ref(true)
const useShcoef = ref(false)
const pointsMode = ref(false)
const useIndexDB = ref(true) // 暂时禁用IndexDB缓存以便调试
const useLoadingEffect = ref(true)
const backgroundColor = ref('#1a1a2e')
const controlSpeed = ref(1.0)
const renderQuality = ref<'low' | 'medium' | 'high'>('high')
const performanceMode = ref(false)

// 性能监控
const fps = ref(60)
const cameraPos = ref({ x: '0.0', y: '2.0', z: '0.0' })

// 视图名称映射
const viewNames = {
  free: '自由视角',
  back: '后视图',
  left: '左视图',
  right: '右视图'
}

// ==================== Three.js 变量 ====================
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let lccObject: any
let animationId: number

// 性能监控
let lastTime = performance.now()
let frames = 0
let fpsUpdateInterval: number
let tipInterval: number

// 初始相机位置
// 初始相机位置（机位置）
const initialCameraPosition = new THREE.Vector3(-3.5, 2.0, 0.2)

// 初始相机注视点
const initialCameraTarget = new THREE.Vector3(0, 2, 0)

// ==================== 初始化场景 ====================
const initScene = () => {
  if (!canvasContainer.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(backgroundColor.value)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    45,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    1,
    150000
  )
  camera.position.copy(initialCameraPosition)

  // 创建渲染器 - 关键：添加 preserveDrawingBuffer 以支持截图
  const pixelRatio = renderQuality.value === 'high' ? window.devicePixelRatio :
                    renderQuality.value === 'medium' ? Math.min(window.devicePixelRatio, 1.5) : 1

  renderer = new THREE.WebGLRenderer({
    antialias: renderQuality.value !== 'low',
    powerPreference: performanceMode.value ? 'high-performance' : 'default',
    preserveDrawingBuffer: true, // 重要：允许截图
    alpha: false
  })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  renderer.setPixelRatio(pixelRatio)
  canvasContainer.value.appendChild(renderer.domElement)

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(initialCameraTarget)
  controls.update()
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = controlSpeed.value
  controls.panSpeed = controlSpeed.value
  controls.zoomSpeed = controlSpeed.value

  // 模型矩阵
  const modelMatrix = new THREE.Matrix4(
    -1, 0, 0, 0,
    0, 0, 1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1
  )

  // 加载LCC模型
  loadLCCModel(modelMatrix)

  // 启动 FPS 监控
  startFPSMonitor()

  // 启动加载提示切换
  startTipRotation()
}

// ==================== 加载 LCC 模型 ====================
const loadLCCModel = (modelMatrix: THREE.Matrix4) => {
  // 🔥 重要：根据LCC SDK文档，dataPath有两种格式：
  // 方式1：指向meta.lcc文件（推荐）
  // 方式2：指向包含LCC文件的目录
  const dataPath = `${window.location.origin}/3Dmodel/meta.lcc`

  console.log('🔧 LCC 配置信息:')
  console.log('  - dataPath:', dataPath)
  console.log('  - Camera position:', camera.position)
  console.log('  - Camera aspect:', camera.aspect)
  console.log('  - Renderer size:', renderer.getSize(new THREE.Vector2()))
  console.log('  - Scene background:', scene.background)
  console.log('  - useEnv:', useEnv.value)
  console.log('  - useIndexDB:', useIndexDB.value)

  lccObject = LCCRender.load(
    {
      camera: camera,
      scene: scene,
      dataPath: dataPath,
      renderLib: THREE,
      canvas: renderer.domElement,
      renderer: renderer,
      useEnv: useEnv.value,
      useIndexDB: useIndexDB.value,
      useLoadingEffect: useLoadingEffect.value,
      modelMatrix: modelMatrix,
      appKey: null,
    },
    (mesh: any) => {
      console.log('✅ LCC 模型加载成功回调触发')
      console.log('Mesh:', mesh)
      console.log('Scene children count:', scene.children.length)

      loading.value = false
      loadingProgress.value = 100
      modelLoaded.value = true

      // 停止提示轮换
      if (tipInterval) {
        clearInterval(tipInterval)
      }

      ElMessage.success({
        message: '高斯模型加载成功！',
        duration: 2000,
        showClose: true
      })
    },
    (percent: number) => {
      console.log('📊 加载进度:', (percent * 100).toFixed(1) + '%')
      loadingProgress.value = Math.floor(percent * 100)

      // 根据进度更新提示
      if (percent < 0.2) currentTipIndex.value = 0
      else if (percent < 0.4) currentTipIndex.value = 1
      else if (percent < 0.6) currentTipIndex.value = 2
      else if (percent < 0.8) currentTipIndex.value = 3
      else currentTipIndex.value = 4
    },
    () => {
      console.error('❌ 模型加载失败回调触发')
      loading.value = false
      modelLoaded.value = false
      if (tipInterval) {
        clearInterval(tipInterval)
      }
      ElMessage.error({
        message: '高斯模型加载失败，请检查数据文件',
        duration: 3000,
        showClose: true
      })
    }
  )

  console.log('LCC Object created:', lccObject)

  // 暴露到 window 对象方便调试
  ;(window as any).lccObject = lccObject
  ;(window as any).LCCRender = LCCRender
  ;(window as any).camera = camera
  ;(window as any).scene = scene
  ;(window as any).renderer = renderer
}

// ==================== 渲染循环 ====================
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新控制器
  controls.update()

  // 🔥 重要：LCCRender.update() 必须在每一帧都调用，不管模型是否加载完成
  // 因为加载过程也需要update来处理
  LCCRender.update()

  // 渲染场景
  renderer.render(scene, camera)

  // 更新相机位置显示
  updateCameraPosition()

  // 计算 FPS
  frames++
}

// ==================== FPS 监控 ====================
const startFPSMonitor = () => {
  fpsUpdateInterval = window.setInterval(() => {
    const now = performance.now()
    const delta = now - lastTime
    fps.value = Math.round((frames * 1000) / delta)
    frames = 0
    lastTime = now
  }, 1000)
}

// 启动加载提示轮换
const startTipRotation = () => {
  tipInterval = window.setInterval(() => {
    if (!loading.value) {
      clearInterval(tipInterval)
      return
    }
    currentTipIndex.value = (currentTipIndex.value + 1) % loadingTips.length
  }, 3000)
}

// 更新相机位置
const updateCameraPosition = () => {
  cameraPos.value = {
    x: camera.position.x.toFixed(1),
    y: camera.position.y.toFixed(1),
    z: camera.position.z.toFixed(1)
  }
}

// ==================== 窗口大小调整 ====================
const handleResize = () => {
  if (!canvasContainer.value) return

  camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
}

// ==================== 视角控制 ====================
const setView = (view: typeof currentView.value) => {
  currentView.value = view
  const distance = 10

  switch (view) {
    case 'back':
      camera.position.set(0, 2, -distance)
      controls.target.set(0, 2, 0)
      break
    case 'left':
      camera.position.set(-distance, 2, 0)
      controls.target.set(0, 2, 0)
      break
    case 'right':
      camera.position.set(distance, 2, 0)
      controls.target.set(0, 2, 0)
      break
  }

  controls.update()
  ElMessage.success(`已切换到${viewNames[view]}`)
}

// 重置相机
const resetCamera = () => {
  currentView.value = 'free'
  camera.position.copy(initialCameraPosition)
  controls.target.copy(initialCameraTarget)
  controls.update()
  ElMessage.success('相机已重置')
}

// ==================== 功能函数 ====================

// 截图 - 修复版本
const takeScreenshot = () => {
  if (!modelLoaded.value) {
    ElMessage.warning('请等待模型加载完成')
    return
  }

  try {
    // 确保渲染一帧
    renderer.render(scene, camera)

    // 获取截图
    renderer.domElement.toBlob((blob) => {
      if (!blob) {
        throw new Error('截图失败')
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `gaussian-model-${Date.now()}.png`
      link.href = url
      link.click()

      // 清理
      setTimeout(() => URL.revokeObjectURL(url), 100)

      ElMessage.success('截图已保存')
    }, 'image/png')
  } catch (error) {
    ElMessage.error('截图失败，请重试')
    console.error('截图错误:', error)
  }
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    canvasContainer.value?.parentElement?.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 环境数据切换
const handleEnvChange = (value: boolean) => {
  if (!modelLoaded.value) {
    ElMessage.warning('请等待模型加载完成')
    useEnv.value = !value
    return
  }

  if (lccObject && lccObject.useEnvironment) {
    try {
      lccObject.useEnvironment(value)
      ElMessage.success(`环境数据已${value ? '启用' : '禁用'}`)
    } catch (error) {
      console.error('环境数据切换失败:', error)
      ElMessage.error('环境数据切换失败')
    }
  }
}

// 球谐渲染切换
const handleShcoefChange = (value: boolean) => {
  if (!modelLoaded.value) {
    ElMessage.warning('请等待模型加载完成')
    useShcoef.value = !value
    return
  }

  if (lccObject && lccObject.useShcoef) {
    try {
      lccObject.useShcoef(value)
      ElMessage.success(`球谐渲染已${value ? '启用' : '禁用'}`)
    } catch (error) {
      console.error('球谐渲染切换失败:', error)
      ElMessage.error('球谐渲染切换失败')
    }
  }
}

// 点云模式切换
const handlePointsModeChange = (value: boolean) => {
  if (!modelLoaded.value) {
    ElMessage.warning('请等待模型加载完成')
    pointsMode.value = !value
    return
  }

  if (lccObject && lccObject.togglePointsDisplayMode) {
    try {
      lccObject.togglePointsDisplayMode()
      ElMessage.success(`已切换到${value ? '点云' : '高斯'}模式`)
    } catch (error) {
      console.error('点云模式切换失败:', error)
      ElMessage.error('点云模式切换失败')
    }
  }
}

// 背景颜色切换
const handleBackgroundChange = (value: string) => {
  if (value && scene) {
    scene.background = new THREE.Color(value)
    ElMessage.success('背景颜色已更新')
  }
}

// 控制速度调整
const handleSpeedChange = (value: number) => {
  controls.rotateSpeed = value
  controls.panSpeed = value
  controls.zoomSpeed = value
}

// 渲染质量调整
const handleQualityChange = (value: string) => {
  const pixelRatio = value === 'high' ? window.devicePixelRatio :
                    value === 'medium' ? Math.min(window.devicePixelRatio, 1.5) : 1
  renderer.setPixelRatio(pixelRatio)
  ElMessage.success(`渲染质量已设置为${value === 'high' ? '高' : value === 'medium' ? '中' : '低'}`)
}

// 性能模式切换
const handlePerformanceModeChange = (value: boolean) => {
  ElMessage.info(`性能模式已${value ? '启用' : '禁用'}（重新加载后生效）`)
}

// ==================== 键盘快捷键 ====================
const handleKeydown = (event: KeyboardEvent) => {
  // 如果在输入框中，不处理快捷键
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  switch (event.key.toLowerCase()) {
    case 'r':
      event.preventDefault()
      resetCamera()
      break
    case 's':
      event.preventDefault()
      takeScreenshot()
      break
    case 'f':
      event.preventDefault()
      toggleFullscreen()
      break
    case 'h':
      event.preventDefault()
      showHelp.value = !showHelp.value
      break
  }
}

// ==================== 清理函数 ====================
const cleanup = () => {
  // 清理定时器
  if (fpsUpdateInterval) {
    clearInterval(fpsUpdateInterval)
  }
  if (tipInterval) {
    clearInterval(tipInterval)
  }

  // 清理动画
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // 清理 LCC 对象
  if (lccObject && LCCRender) {
    try {
      LCCRender.unload(lccObject)
    } catch (error) {
      console.error('LCC 卸载错误:', error)
    }
  }

  // 清理控制器
  if (controls) {
    controls.dispose()
  }

  // 清理渲染器
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }

  // 清理场景
  if (scene) {
    scene.traverse((object: any) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material: any) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }

  // 清理 window 对象
  if (window) {
    delete (window as any).lccObject
    delete (window as any).LCCRender
    delete (window as any).camera
    delete (window as any).scene
    delete (window as any).renderer
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)

  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)

  // 执行清理
  cleanup()
})
</script>

<style scoped lang="scss">
.gaussian-container {
  width: 100%;
  height: calc(100vh - 120px);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

// ==================== 顶部工具栏 ====================
.top-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &.toolbar-hidden {
    transform: translateY(-100%);
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :deep(.el-button) {
    border-radius: 8px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}

.toolbar-toggle {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 28px;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 0 0 14px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;

  &:hover {
    background: linear-gradient(135deg, rgba(10, 10, 10, 1) 0%, rgba(26, 26, 46, 1) 100%);
    height: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .el-icon {
    color: #409EFF;
    font-size: 18px;
  }
}

// ==================== 3D 画布 ====================
.canvas-container {
  width: 100%;
  height: 100%;
  background: transparent;
}

// ==================== 加载覆盖层 ====================
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%);
  backdrop-filter: blur(30px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-content {
  width: 420px;
  text-align: center;
  padding: 48px 40px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  .loading-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 32px;

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-top-color: #409EFF;
      border-radius: 50%;
      animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;

      &:nth-child(2) {
        width: 70%;
        height: 70%;
        top: 15%;
        left: 15%;
        border-top-color: #67C23A;
        animation-duration: 2s;
        animation-direction: reverse;
      }

      &:nth-child(3) {
        width: 40%;
        height: 40%;
        top: 30%;
        left: 30%;
        border-top-color: #E6A23C;
        animation-duration: 1s;
      }
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    margin-top: 24px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 500;
  }

  .loading-percent {
    margin-top: 8px;
    color: #409EFF;
    font-size: 32px;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  }

  .loading-tip {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    height: 20px;
    transition: opacity 0.3s ease;
  }
}

// ==================== 右侧控制面板 ====================
.controls-panel {
  position: absolute;
  top: 84px;
  right: 0;
  max-height: calc(100% - 164px);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 8;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.panel-collapsed {
    transform: translateX(calc(100% - 48px));
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(64, 158, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(64, 158, 255, 0.5);
    }
  }

  .panel-toggle {
    position: absolute;
    left: -48px;
    top: 24px;
    width: 48px;
    height: 64px;
    background: linear-gradient(90deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
    backdrop-filter: blur(20px);
    border-radius: 12px 0 0 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-right: none;

    &:hover {
      background: linear-gradient(90deg, rgba(10, 10, 10, 1) 0%, rgba(26, 26, 46, 1) 100%);
      left: -50px;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
    }

    .el-icon {
      color: #409EFF;
      font-size: 22px;
    }
  }

  .panel-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.control-card {
  width: 300px;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(64, 158, 255, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  :deep(.el-card__header) {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(103, 194, 58, 0.08) 100%);
    }
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.95);

      .el-icon {
        color: #409EFF;
        font-size: 18px;
      }
    }

    .expand-icon {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      transition: transform 0.3s ease;

      &.is-expanded {
        transform: rotate(180deg);
      }
    }
  }
}

.control-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  transition: all 0.3s ease;

  .control-label {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;

    .el-icon {
      color: #409EFF;
      font-size: 16px;
    }
  }
}

.control-item-full {
  padding: 10px 0;

  .control-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;

    .el-icon {
      color: #409EFF;
      font-size: 16px;
    }
  }
}

// 信息卡片
.info-card {
  .info-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.02) 100%);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(103, 194, 58, 0.04) 100%);
      border-color: rgba(64, 158, 255, 0.2);
      transform: translateX(-2px);
    }

    .info-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
    }

    .info-value {
      color: #409EFF;
      font-weight: 600;
      font-size: 14px;
      text-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
    }
  }
}

// ==================== 底部信息栏 ====================
.bottom-info-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(0deg, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 24px;
  z-index: 10;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .info-section {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(64, 158, 255, 0.2);
    }

    .el-icon {
      color: #409EFF;
      font-size: 16px;
    }
  }
}

// ==================== 帮助面板 ====================
.help-button {
  position: absolute;
  bottom: 76px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 11;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 8px 28px rgba(64, 158, 255, 0.6);
  }

  .el-icon {
    color: #fff;
  }
}

.help-panel {
  position: absolute;
  bottom: 76px;
  right: 92px;
  width: 320px;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%);
  backdrop-filter: blur(40px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  z-index: 11;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);

  .help-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(103, 194, 58, 0.08) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    font-weight: 600;
    font-size: 15px;
  }

  .help-content {
    padding: 20px 24px;
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(64, 158, 255, 0.3);
      border-radius: 3px;
    }
  }

  .help-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-bottom: none;
    }

    kbd {
      padding: 6px 12px;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(103, 194, 58, 0.1) 100%);
      border: 1px solid rgba(64, 158, 255, 0.3);
      border-radius: 6px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      font-weight: 600;
      color: #409EFF;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
}

// ==================== 动画效果 ====================
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
