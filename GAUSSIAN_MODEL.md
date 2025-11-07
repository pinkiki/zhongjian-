# 高斯模型功能说明

## 功能概述

本功能使用 LCC Web SDK 集成了 3D 高斯模型（3D Gaussian Splatting）渲染功能，可以在浏览器中实时渲染和交互大规模点云数据。

## 已完成的工作

### 1. SDK 集成
- ✅ 已将 LCC Web SDK (v0.5.4) 复制到 `src/libs/lcc-0.5.4.js`
- ✅ 创建了 TypeScript 声明文件 `src/libs/lcc-0.5.4.d.ts`

### 2. 路由配置
- ✅ 创建了高斯模型路由模块 `src/router/modules/gaussian.ts`
- ✅ 路由路径: `/gaussian/model`
- ✅ 菜单名称: "高斯模型"
- ✅ 使用图标: `ep/coordinate`

### 3. 页面组件
- ✅ 创建了高斯模型渲染组件 `src/views/gaussian/index.vue`
- ✅ 集成了 Three.js 渲染引擎
- ✅ 添加了 OrbitControls 轨道控制器
- ✅ 实现了加载进度显示
- ✅ 添加了控制面板（环境数据切换、缓存开关等）

### 4. 数据文件
- ✅ 3D 模型数据位于 `public/3Dmodel/` 目录
- ✅ 包含完整的点云数据文件:
  - `meta.lcc` (1.6KB) - 索引文件
  - `data.bin` (934MB) - 核心点云数据
  - `collision.lci` (5MB) - 碰撞检测数据
  - `environment.bin` (139KB) - 环境光照数据
  - `index.bin` (1KB) - 空间索引
  - `attrs.lcp` (592B) - 场景配置
  - `obj_obb.lcb` (29KB) - 物体边界框

## 功能特性

### 渲染功能
- 🎨 高质量 3D 高斯模型渲染
- 📊 实时加载进度显示
- 🎯 轨道控制器支持（旋转、缩放、平移）
- 🌍 环境数据切换
- 💾 IndexDB 本地缓存（提升二次加载速度）
- ✨ 加载特效

### 控制面板
- 🔄 使用环境数据开关（可实时切换）
- 💾 启用数据缓存开关
- ✨ 加载特效开关

### 性能优化
- 使用 requestAnimationFrame 进行渲染循环
- 支持 IndexDB 缓存，提升加载速度
- 响应式窗口大小调整
- 组件卸载时自动清理资源

## 使用说明

### 前置条件

⚠️ **重要**: 项目需要 Node.js 版本 **20.19+** 或 **22.12+**

当前系统使用的是 Node.js 18.19.0，请先升级 Node.js 版本。

### 升级 Node.js

```bash
# 使用 nvm (推荐)
nvm install 20
nvm use 20

# 或者使用 nvm 安装最新的 LTS 版本
nvm install --lts
nvm use --lts

# 验证版本
node --version
```

### 启动项目

```bash
cd zhongjian
npm run dev
```

### 访问页面

启动成功后，在浏览器中访问项目，在左侧菜单中点击 "高斯模型" 即可进入高斯模型渲染页面。

## 技术栈

- **Vue 3** - 前端框架
- **TypeScript** - 类型支持
- **Three.js (v0.180.0)** - 3D 渲染引擎
- **LCC Web SDK (v0.5.4)** - 高斯模型渲染 SDK
- **Element Plus** - UI 组件库
- **Vite** - 构建工具

## 核心代码说明

### 初始化场景
```typescript
const initScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, width/height, 1, 150000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  controls = new OrbitControls(camera, renderer.domElement)
}
```

### 加载 LCC 模型
```typescript
const lccObject = LCCRender.load({
  camera: camera,
  scene: scene,
  dataPath: `${window.location.origin}/3Dmodel/meta.lcc`,
  renderLib: THREE,
  renderer: renderer,
  useEnv: true,
  useIndexDB: true,
  useLoadingEffect: true,
  modelMatrix: modelMatrix,
  appKey: null
}, successCallback, loadingCallback, failureCallback)
```

### 渲染循环
```typescript
const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  LCCRender.update()  // 更新 LCC 渲染
  renderer.render(scene, camera)
}
```

## 可选配置

### 去除水印
如需去除左下角水印，请联系 LCC Web SDK 销售人员获取 `appKey`，然后在组件中设置：

```typescript
appKey: 'your-app-key-here'
```

### 模型矩阵
当前使用的模型矩阵用于调整坐标系：

```typescript
const modelMatrix = new THREE.Matrix4(
  -1, 0, 0, 0,
  0, 0, 1, 0,
  0, 1, 0, 0,
  0, 0, 0, 1
)
```

可根据实际模型调整此矩阵。

## 调试

组件将 `lccObject` 和 `LCCRender` 暴露到 `window` 对象，可在浏览器控制台中调试：

```javascript
// 切换点云显示模式
window.lccObject.togglePointsDisplayMode()

// 切换环境数据
window.lccObject.useEnvironment(true/false)

// 切换球谐渲染
window.lccObject.useShcoef(true/false)
```

## 故障排除

### 问题 1: 模型加载失败
- 检查 `public/3Dmodel/meta.lcc` 文件是否存在
- 检查浏览器控制台网络请求是否成功
- 确认数据文件完整性

### 问题 2: Node.js 版本错误
- 升级到 Node.js 20.19+ 或 22.12+
- 使用 nvm 管理 Node.js 版本

### 问题 3: 渲染性能问题
- 检查显卡驱动是否最新
- 尝试关闭环境数据渲染
- 调整渲染质量设置

## 下一步优化建议

1. 添加更多控制功能（如点云颜色模式切换）
2. 实现多个模型文件的切换
3. 添加模型标注功能
4. 实现测量工具
5. 添加截图和录屏功能
6. 优化移动端适配

## 参考资料

- [LCC Web SDK 官方文档](https://docs.lccweb.com)
- [Three.js 官方文档](https://threejs.org/docs/)
- [LCC-Web-0 官方示例](../LCC-Web-0/)

## 联系方式

如需更多帮助，请联系：
- 项目开发团队
- LCC Web SDK 技术支持
