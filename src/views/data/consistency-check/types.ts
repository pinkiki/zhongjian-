/**
 * 一致性校验页面类型定义
 */

// 视图模式类型
export type ViewMode = 'reality' | 'model' | 'pointCloud' | 'heatmap' | 'mixed'

// 工具类型
export type ToolType = 'annotation' | 'measure' | 'roam' | 'list' | 'none'

// 位置信息
export interface LocationInfo {
  building: string
  floor: string
  room: string
}

// 工具栏状态
export interface ToolbarState {
  // 视图模式
  showReality: boolean
  showModel: boolean
  showPointCloud: boolean
  showResult: boolean
  showMixed: boolean

  // 功能开关
  viewSync: boolean

  // 当前工具
  currentTool: ToolType

  // 当前位置
  location: LocationInfo

  // 选中的日期
  selectedDate: string
}

// 视图配置
export interface ViewConfig {
  title: string
  type: 'panorama' | 'model' | 'pointCloud' | 'heatmap'
  visible: boolean
}
