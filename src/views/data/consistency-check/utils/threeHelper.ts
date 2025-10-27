/**
 * Three.js 辅助工具类
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

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
