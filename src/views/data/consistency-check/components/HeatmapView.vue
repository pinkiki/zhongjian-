<template>
  <div class="heatmap-view">
    <div class="view-header">
      <span class="view-title">热力分析</span>
      <div class="view-controls">
        <el-tooltip content="数据刷新" placement="top">
          <el-icon class="control-icon" @click="refreshData"><RefreshRight /></el-icon>
        </el-tooltip>
        <el-tooltip content="全屏" placement="top">
          <el-icon class="control-icon" @click="toggleFullscreen"><FullScreen /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div ref="containerRef" class="view-container">
      <canvas ref="canvasRef" class="heatmap-canvas"></canvas>
    </div>
    <div class="legend">
      <div class="legend-title">温度范围</div>
      <div class="legend-gradient">
        <span class="legend-label">低</span>
        <div class="gradient-bar"></div>
        <span class="legend-label">高</span>
      </div>
      <div class="legend-values">
        <span>15°C</span>
        <span>35°C</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RefreshRight, FullScreen } from '@element-plus/icons-vue'

// 状态
const containerRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
let animationId: number | null = null
let heatData: number[][] = []

// 生成热力数据
const generateHeatData = (width: number, height: number) => {
  const gridWidth = Math.ceil(width / 10)
  const gridHeight = Math.ceil(height / 10)
  const data: number[][] = []

  for (let y = 0; y < gridHeight; y++) {
    data[y] = []
    for (let x = 0; x < gridWidth; x++) {
      // 使用多个热点源生成数据
      let value = 0

      // 热点1
      const dx1 = x - gridWidth * 0.3
      const dy1 = y - gridHeight * 0.4
      const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
      value += Math.exp(-dist1 * 0.3)

      // 热点2
      const dx2 = x - gridWidth * 0.7
      const dy2 = y - gridHeight * 0.6
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      value += Math.exp(-dist2 * 0.4)

      // 热点3
      const dx3 = x - gridWidth * 0.5
      const dy3 = y - gridHeight * 0.2
      const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3)
      value += Math.exp(-dist3 * 0.35)

      data[y][x] = Math.min(value, 1)
    }
  }

  return data
}

// 获取热力颜色
const getHeatColor = (value: number): string => {
  // 蓝色 -> 青色 -> 绿色 -> 黄色 -> 红色
  const colors = [
    { pos: 0, r: 0, g: 0, b: 255 }, // 蓝色
    { pos: 0.25, r: 0, g: 255, b: 255 }, // 青色
    { pos: 0.5, r: 0, g: 255, b: 0 }, // 绿色
    { pos: 0.75, r: 255, g: 255, b: 0 }, // 黄色
    { pos: 1, r: 255, g: 0, b: 0 }, // 红色
  ]

  let startColor = colors[0]
  let endColor = colors[0]

  for (let i = 0; i < colors.length - 1; i++) {
    if (value >= colors[i].pos && value <= colors[i + 1].pos) {
      startColor = colors[i]
      endColor = colors[i + 1]
      break
    }
  }

  const range = endColor.pos - startColor.pos
  const rangePct = range === 0 ? 0 : (value - startColor.pos) / range

  const r = Math.floor(startColor.r + (endColor.r - startColor.r) * rangePct)
  const g = Math.floor(startColor.g + (endColor.g - startColor.g) * rangePct)
  const b = Math.floor(startColor.b + (endColor.b - startColor.b) * rangePct)

  return `rgb(${r}, ${g}, ${b})`
}

// 绘制热力图
const drawHeatmap = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.offsetWidth
  const height = canvas.offsetHeight

  // 检查画布尺寸是否有效
  if (width === 0 || height === 0) {
    console.warn('画布尺寸为 0，跳过绘制')
    return
  }

  // 设置画布大小
  canvas.width = width * window.devicePixelRatio
  canvas.height = height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  // 生成热力数据
  if (heatData.length === 0) {
    heatData = generateHeatData(width, height)
  }

  // 安全检查：确保 heatData 不为空
  if (heatData.length === 0 || !heatData[0] || heatData[0].length === 0) {
    console.warn('热力数据生成失败或为空')
    return
  }

  const cellWidth = width / heatData[0].length
  const cellHeight = height / heatData.length

  // 绘制热力图
  for (let y = 0; y < heatData.length; y++) {
    for (let x = 0; x < heatData[y].length; x++) {
      const value = heatData[y][x]
      const color = getHeatColor(value)

      ctx.fillStyle = color
      ctx.globalAlpha = 0.6
      ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
    }
  }

  // 添加模糊效果
  ctx.globalAlpha = 1
  ctx.filter = 'blur(8px)'
  const imageData = ctx.getImageData(0, 0, width, height)
  ctx.putImageData(imageData, 0, 0)

  // 绘制网格线
  ctx.filter = 'none'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1

  for (let y = 0; y <= heatData.length; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellHeight)
    ctx.lineTo(width, y * cellHeight)
    ctx.stroke()
  }

  for (let x = 0; x <= heatData[0].length; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellWidth, 0)
    ctx.lineTo(x * cellWidth, height)
    ctx.stroke()
  }
}

// 刷新数据
const refreshData = () => {
  heatData = []
  drawHeatmap()
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
  heatData = []
  drawHeatmap()
}

// ResizeObserver
let resizeObserver: ResizeObserver | null = null

// 生命周期
onMounted(() => {
  // 延迟绘制，确保容器已经完全渲染
  setTimeout(() => {
    drawHeatmap()
  }, 100)
  window.addEventListener('resize', handleResize)

  // 使用 ResizeObserver 监听容器尺寸变化
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      setTimeout(() => {
        handleResize()
      }, 0)
    })
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.heatmap-view {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0a0a0a;
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

    .heatmap-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .legend {
    position: absolute;
    bottom: 16px;
    right: 16px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    backdrop-filter: blur(8px);

    .legend-title {
      margin-bottom: 8px;
      color: #ffffff;
      font-size: 12px;
      font-weight: 500;
    }

    .legend-gradient {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .legend-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 11px;
      }

      .gradient-bar {
        width: 100px;
        height: 12px;
        background: linear-gradient(
          to right,
          rgb(0, 0, 255),
          rgb(0, 255, 255),
          rgb(0, 255, 0),
          rgb(255, 255, 0),
          rgb(255, 0, 0)
        );
        border-radius: 2px;
      }
    }

    .legend-values {
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 10px;
      font-family: 'Courier New', monospace;
    }
  }
}
</style>
