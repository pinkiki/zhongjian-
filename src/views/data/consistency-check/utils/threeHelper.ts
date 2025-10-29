/**
 * Three.js 辅助工具类
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { LASLoader } from '@loaders.gl/las'
import { load } from '@loaders.gl/core'

export class ThreeScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  public controls: OrbitControls
  private container: HTMLElement
  private animationId: number | null = null

  constructor(container: HTMLElement) {
    this.container = container

    // 创建场景
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a1a)

    // 创建相机
    const aspect = container.clientWidth / container.clientHeight
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
    this.camera.position.set(5, 5, 5)
    this.camera.lookAt(0, 0, 0)

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    container.appendChild(this.renderer.domElement)

    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 10)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)

    // 添加坐标轴辅助器（可选）
    const axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)

    // 监听窗口大小变化
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
  }

  /**
   * 加载 GLTF 模型
   */
  async loadGLTFModel(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const gltfLoader = new GLTFLoader()

      // 配置 Draco 解码器
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      gltfLoader.setDRACOLoader(dracoLoader)

      gltfLoader.load(
        url,
        (gltf) => {
          this.scene.add(gltf.scene)
          resolve(gltf.scene)
        },
        undefined,
        (error) => {
          console.error('模型加载失败:', error)
          reject(error)
        }
      )
    })
  }

  /**
   * 加载环境贴图
   */
  async loadHDREnvironment(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const rgbeLoader = new RGBELoader()
      rgbeLoader.load(
        url,
        (envMap) => {
          envMap.mapping = THREE.EquirectangularReflectionMapping
          this.scene.environment = envMap
          resolve()
        },
        undefined,
        (error) => {
          console.error('HDR 加载失败:', error)
          reject(error)
        }
      )
    })
  }

  /**
   * 添加网格辅助线
   */
  addGridHelper(size = 10, divisions = 10): void {
    const gridHelper = new THREE.GridHelper(size, divisions)
    this.scene.add(gridHelper)
  }

  /**
   * 开始渲染循环
   */
  startAnimation(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    }
    animate()
  }

  /**
   * 停止渲染循环
   */
  stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * 处理窗口大小变化
   */
  handleResize(): void {
    if (!this.container) return

    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stopAnimation()
    window.removeEventListener('resize', this.handleResize)

    // 清理渲染器
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)

    // 清理场景中的对象
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material?.dispose()
        }
      }
    })
  }
}

/**
 * 创建点云效果
 */
export function createPointCloud(count = 10000): THREE.Points {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // 随机分布在球形区域内
    const radius = Math.random() * 5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // 随机颜色
    colors[i3] = Math.random()
    colors[i3 + 1] = Math.random()
    colors[i3 + 2] = Math.random()
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  })

  return new THREE.Points(geometry, material)
}

/**
 * 创建简单的建筑模型
 */
export function createBuildingModel(): THREE.Group {
  const group = new THREE.Group()

  // 主体建筑
  const buildingGeometry = new THREE.BoxGeometry(3, 4, 3)
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a90e2,
    metalness: 0.3,
    roughness: 0.7,
  })
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
  building.position.y = 2
  building.castShadow = true
  building.receiveShadow = true
  group.add(building)

  // 屋顶
  const roofGeometry = new THREE.ConeGeometry(2.5, 1, 4)
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0xe74c3c,
    metalness: 0.2,
    roughness: 0.8,
  })
  const roof = new THREE.Mesh(roofGeometry, roofMaterial)
  roof.position.y = 4.5
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  group.add(roof)

  // 地面
  const groundGeometry = new THREE.PlaneGeometry(10, 10)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x7f8c8d,
    roughness: 0.9,
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  group.add(ground)

  return group
}

/**
 * 从 LAS 文件加载点云数据
 * @param url LAS 文件路径
 * @param samplingRate 采样率 (0-1)，例如 0.1 表示只加载 10% 的点
 * @param onProgress 加载进度回调
 */
export async function loadLASPointCloud(
  url: string,
  samplingRate = 0.1,
  onProgress?: (progress: number) => void
): Promise<{
  points: THREE.Points
  pointCount: number
  totalPoints: number
  bounds: { min: THREE.Vector3; max: THREE.Vector3 }
}> {
  try {
    // 加载 LAS 文件
    onProgress?.(0.1)
    const data = await load(url, LASLoader)
    onProgress?.(0.3)

    if (!data || !data.attributes || !data.attributes.POSITION) {
      throw new Error('无效的 LAS 文件格式')
    }

    // 提取位置数据
    const allPositions = data.attributes.POSITION.value
    const totalPoints = allPositions.length / 3

    console.log(`LAS 文件总点数: ${totalPoints.toLocaleString()}`)
    console.log(`采样率: ${(samplingRate * 100).toFixed(1)}%`)

    // 计算采样后的点数
    const sampledPointCount = Math.floor(totalPoints * samplingRate)
    const step = Math.floor(1 / samplingRate)

    console.log(`将加载 ${sampledPointCount.toLocaleString()} 个点`)

    onProgress?.(0.4)

    // 采样位置数据
    const positions = new Float32Array(sampledPointCount * 3)
    for (let i = 0, j = 0; i < totalPoints && j < sampledPointCount; i += step, j++) {
      positions[j * 3] = allPositions[i * 3]
      positions[j * 3 + 1] = allPositions[i * 3 + 1]
      positions[j * 3 + 2] = allPositions[i * 3 + 2]
    }

    onProgress?.(0.6)

    // 提取颜色数据（如果存在）
    let colors: Float32Array
    if (data.attributes.COLOR_0) {
      // LAS 文件中的颜色通常是 0-65535 范围，需要归一化到 0-1
      const allColors = data.attributes.COLOR_0.value
      colors = new Float32Array(sampledPointCount * 3)

      for (let i = 0, j = 0; i < totalPoints && j < sampledPointCount; i += step, j++) {
        colors[j * 3] = allColors[i * 3] / 65535
        colors[j * 3 + 1] = allColors[i * 3 + 1] / 65535
        colors[j * 3 + 2] = allColors[i * 3 + 2] / 65535
      }
    } else {
      // 如果没有颜色数据，基于高度生成渐变色
      colors = new Float32Array(sampledPointCount * 3)
      let minZ = Infinity
      let maxZ = -Infinity

      // 找出最小和最大高度
      for (let i = 0; i < sampledPointCount; i++) {
        const z = positions[i * 3 + 2]
        minZ = Math.min(minZ, z)
        maxZ = Math.max(maxZ, z)
      }

      onProgress?.(0.7)

      // 基于高度生成颜色
      for (let i = 0; i < sampledPointCount; i++) {
        const z = positions[i * 3 + 2]
        const t = (z - minZ) / (maxZ - minZ)

        // 蓝色 -> 绿色 -> 黄色 -> 红色 渐变
        if (t < 0.25) {
          colors[i * 3] = 0
          colors[i * 3 + 1] = t * 4
          colors[i * 3 + 2] = 1
        } else if (t < 0.5) {
          colors[i * 3] = (t - 0.25) * 4
          colors[i * 3 + 1] = 1
          colors[i * 3 + 2] = 1 - (t - 0.25) * 4
        } else if (t < 0.75) {
          colors[i * 3] = 1
          colors[i * 3 + 1] = 1 - (t - 0.5) * 4
          colors[i * 3 + 2] = 0
        } else {
          colors[i * 3] = 1
          colors[i * 3 + 1] = (1 - t) * 4
          colors[i * 3 + 2] = 0
        }
      }
    }

    onProgress?.(0.8)

    // 计算边界框
    const bounds = {
      min: new THREE.Vector3(Infinity, Infinity, Infinity),
      max: new THREE.Vector3(-Infinity, -Infinity, -Infinity),
    }

    for (let i = 0; i < sampledPointCount; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]

      bounds.min.x = Math.min(bounds.min.x, x)
      bounds.min.y = Math.min(bounds.min.y, y)
      bounds.min.z = Math.min(bounds.min.z, z)

      bounds.max.x = Math.max(bounds.max.x, x)
      bounds.max.y = Math.max(bounds.max.y, y)
      bounds.max.z = Math.max(bounds.max.z, z)
    }

    onProgress?.(0.9)

    // 创建几何体
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // 计算点的大小（基于点云密度）
    const diagonal = bounds.min.distanceTo(bounds.max)
    const pointSize = Math.max(0.05, diagonal / sampledPointCount ** 0.5)

    // 创建材质
    const material = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })

    // 创建点云对象
    const points = new THREE.Points(geometry, material)

    const center = new THREE.Vector3(
      (bounds.min.x + bounds.max.x) / 2,
      (bounds.min.y + bounds.max.y) / 2,
      (bounds.min.z + bounds.max.z) / 2
    )
    points.position.set(-center.x, -center.y, -center.z)

    onProgress?.(1.0)

    return { points, pointCount: sampledPointCount, totalPoints, bounds }
  } catch (error) {
    console.error('加载 LAS 文件失败:', error)
    throw error
  }
}

