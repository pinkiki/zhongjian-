<template>
  <div class="toolbar">
    <!-- 左侧：当前位置 -->
    <div class="toolbar-left">
      <div class="location-section">

        <div class="location-content">
          <!-- 轨迹预览区 -->
          <div class="trajectory-preview">
            <div class="trajectoryBox">轨迹预览</div>
          </div>

          <!-- 位置选择器 -->
          <div class="location-selectors">
            <div class="location-header">当前位置</div>
            <el-select
              v-model="currentLocation.building"
              placeholder="选择楼栋"
              size="default"
              class="location-select"
              @change="handleLocationChange"
            >
              <el-option label="1号楼" value="building1" />
              <el-option label="2号楼" value="building2" />
              <el-option label="3号楼" value="building3" />
            </el-select>

            <el-select
              v-model="currentLocation.floor"
              placeholder="选择楼层"
              size="default"
              class="location-select"
              @change="handleLocationChange"
            >
              <el-option label="1层" value="floor1" />
              <el-option label="2层" value="floor2" />
              <el-option label="3层" value="floor3" />
              <el-option label="4层" value="floor4" />
              <el-option label="5层" value="floor5" />
            </el-select>

            <el-select
              v-model="currentLocation.room"
              placeholder="选择房间"
              size="default"
              class="location-select"
              @change="handleLocationChange"
            >
              <el-option label="101室" value="room101" />
              <el-option label="102室" value="room102" />
              <el-option label="103室" value="room103" />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：工具按钮 -->
    <div class="toolbar-right">
      <!-- 视图模式按钮组 -->
      <div class="view-mode-group">
        <div
          class="mode-item"
          :class="{ active: currentViewMode === 'reality' }"
          @click="setViewMode('reality')"
        >
          <el-icon><Camera /></el-icon>
          <span>实景</span>
        </div>

        <div
          class="mode-item"
          :class="{ active: currentViewMode === 'model' }"
          @click="setViewMode('model')"
        >
          <el-icon><Box /></el-icon>
          <span>三维模型</span>
        </div>

        <div
          class="mode-item"
          :class="{ active: currentViewMode === 'pointCloud' }"
          @click="setViewMode('pointCloud')"
        >
          <el-icon><Sunny /></el-icon>
          <span>点云</span>
        </div>

        <div
          class="mode-item"
          :class="{ active: currentViewMode === 'result' }"
          @click="setViewMode('result')"
        >
          <el-icon><TrendCharts /></el-icon>
          <span>实模结果</span>
        </div>

        <div class="mode-item">
          <el-icon><Link /></el-icon>
          <span>视角同步</span>
        </div>

        <div
          class="mode-item"
          :class="{ active: currentViewMode === 'mixed' }"
          @click="setViewMode('mixed')"
        >
          <el-icon><Mic /></el-icon>
          <span>混合</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 工具按钮组 -->
      <div class="tool-group">
        <div
          class="tool-item"
          :class="{ active: toolbarState.currentTool === 'annotation' }"
          @click="setTool('annotation')"
        >
          <el-icon><Edit /></el-icon>
          <span>批注</span>
        </div>

        <div
          class="tool-item"
          :class="{ active: toolbarState.currentTool === 'measure' }"
          @click="setTool('measure')"
        >
          <el-icon><TrendCharts /></el-icon>
          <span>测量</span>
        </div>

        <div
          class="tool-item"
          :class="{ active: toolbarState.currentTool === 'roam' }"
          @click="setTool('roam')"
        >
          <el-icon><Sunny /></el-icon>
          <span>漫游</span>
        </div>

        <div
          class="tool-item"
          :class="{ active: toolbarState.currentTool === 'list' }"
          @click="showAnnotationList"
        >
          <el-icon><List /></el-icon>
          <span>列表</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 日期选择 -->
      <div class="date-section">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          size="default"
          class="date-picker"
          @change="handleDateChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { LocationInfo, ToolbarState, ToolType } from '../types'
import {
  Grid,
  Box,
  Camera,
  Link,
  Sunny,
  Document,
  Mic,
  Edit,
  List,
  Back,
  TrendCharts,
} from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: ToolbarState
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: ToolbarState]
  'location-change': [location: LocationInfo]
  back: []
}>()

// 状态
const activeView = ref<'plan' | '3d'>('plan')
const selectedDate = ref<string>('')
const currentViewMode = ref<
  'reality' | 'model' | 'pointCloud' | 'result' | 'mixed'
>('mixed')

const currentLocation = reactive<LocationInfo>({
  building: '',
  floor: '',
  room: '',
})

// 使用计算属性直接访问 props，避免状态不同步
const toolbarState = computed(() => props.modelValue)

// 设置视图模式
const setViewMode = (
  mode: 'reality' | 'model' | 'pointCloud' | 'result' | 'mixed',
) => {
  currentViewMode.value = mode

  console.log('🔄 切换视图模式:', mode)

  // 创建新的状态对象
  const newState: ToolbarState = {
    ...props.modelValue,
  }

  // 根据模式设置各个视图的显示状态
  switch (mode) {
    case 'reality':
      newState.showReality = true
      newState.showModel = false
      newState.showPointCloud = false
      newState.showResult = false
      newState.showMixed = false
      break
    case 'model':
      newState.showReality = false
      newState.showModel = true
      newState.showPointCloud = false
      newState.showResult = false
      newState.showMixed = false
      break
    case 'pointCloud':
      newState.showReality = false
      newState.showModel = false
      newState.showPointCloud = true
      newState.showResult = false
      newState.showMixed = false
      break
    case 'result':
      newState.showReality = false
      newState.showModel = false
      newState.showPointCloud = false
      newState.showResult = true
      newState.showMixed = false
      break
    case 'mixed':
      newState.showReality = true
      newState.showModel = true
      newState.showPointCloud = true
      newState.showResult = true
      newState.showMixed = true
      break
  }

  emit('update:modelValue', newState)
}

// 切换工具状态
const toggleTool = (key: keyof ToolbarState) => {
  const newState = { ...props.modelValue }
  if (typeof newState[key] === 'boolean') {
    ;(newState[key] as boolean) = !(newState[key] as boolean)
    emit('update:modelValue', newState)
  }
}

// 设置当前工具
const setTool = (tool: ToolType) => {
  const newState = { ...props.modelValue }
  newState.currentTool = newState.currentTool === tool ? 'none' : tool
  emit('update:modelValue', newState)
}

// 位置变化
const handleLocationChange = () => {
  emit('location-change', { ...currentLocation })
}

// 日期变化
const handleDateChange = () => {
  const newState = { ...props.modelValue }
  newState.selectedDate = selectedDate.value
  emit('update:modelValue', newState)
}

// 显示批注列表
const showAnnotationList = () => {
  console.log('显示批注列表')
}
</script>

<style lang="scss" scoped>
.toolbar {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-height: 150px;
  padding-bottom: 5px;
  // padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  gap: 20px;

  .toolbar-left {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    .location-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8f9fb;
      padding-right: 10px;
      border-radius: 8px;
      height: 100%;

      .location-header {
        .location-label {
          font-size: 12px;
          font-weight: 600;
          color: #606266;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .location-content {
        display: flex;
        gap: 14px;
        flex: 1;

        .trajectory-preview {
          flex-shrink: 0;
          display: flex;
          align-items: stretch;

          .trajectoryBox {
            width: 260px;
            border: 2px dashed #dcdfe6;
            border-radius: 6px;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #909399;
            font-size: 13px;
            transition: all 0.3s;
            cursor: pointer;

            &:hover {
              border-color: #409eff;
              color: #409eff;
              background: #f0f7ff;
            }
          }
        }

        .location-selectors {
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
          .location-header{
            text-align: center;
          }
          .location-select {
            width: 180px;
          }
        }
      }
    }
  }

  .toolbar-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    padding: 0 8px;

    .view-mode-group {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;

      .mode-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        min-width: 64px;
        color: #606266;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.25s;
        border-radius: 8px;
        background: transparent;

        &:hover {
          color: #409eff;
          background: #f0f7ff;

          .el-icon {
            transform: scale(1.1);
          }
        }

        &.active {
          color: #409eff;
          background: #ecf5ff;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 3px;
            background: linear-gradient(90deg, transparent, #409eff, transparent);
            border-radius: 2px;
          }
        }

        .el-icon {
          font-size: 20px;
          transition: transform 0.25s;
        }

        span {
          font-weight: 500;
          white-space: nowrap;
          line-height: 1;
        }
      }
    }

    .tool-group {
      display: flex;
      align-items: center;
      gap: 4px;

      .tool-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        min-width: 58px;
        color: #606266;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.25s;
        border-radius: 8px;
        background: transparent;

        &:hover {
          color: #409eff;
          background: #f0f7ff;

          .el-icon {
            transform: scale(1.1);
          }
        }

        &.active {
          color: #409eff;
          background: #ecf5ff;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 3px;
            background: linear-gradient(90deg, transparent, #409eff, transparent);
            border-radius: 2px;
          }
        }

        .el-icon {
          font-size: 20px;
          transition: transform 0.25s;
        }

        span {
          font-weight: 500;
          white-space: nowrap;
          line-height: 1;
        }
      }
    }

    .divider {
      width: 1px;
      height: 80px;
      background: linear-gradient(
        to bottom,
        transparent,
        #dcdfe6 20%,
        #dcdfe6 80%,
        transparent
      );
      flex-shrink: 0;
    }

    .date-section {
      display: flex;
      align-items: center;

      .date-picker {
        width: 160px;
      }
    }
  }

  // 响应式适配
  @media (max-width: 1600px) {
    flex-direction: column;
    align-items: stretch;
    min-height: auto;

    .toolbar-left {
      .location-section .location-content {
        .trajectory-preview .trajectoryBox {
          width: 180px;
        }

        .location-selectors .location-select {
          width: 160px;
        }
      }
    }

    .toolbar-right {
      justify-content: flex-start;
      flex-wrap: wrap;
      padding: 0;
    }
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 12px;

    .toolbar-left {
      .location-section {
        .location-content {
          flex-direction: column;

          .trajectory-preview .trajectoryBox {
            width: 100%;
            min-height: 80px;
          }

          .location-selectors {
            width: 100%;

            .location-select {
              width: 100%;
            }
          }
        }
      }
    }

    .toolbar-right {
      gap: 12px;
      padding: 0;

      .view-mode-group {
        gap: 2px;
        width: 100%;
        justify-content: space-between;

        .mode-item {
          padding: 8px 6px;
          min-width: 50px;
          font-size: 11px;

          .el-icon {
            font-size: 18px;
          }
        }
      }

      .tool-group {
        gap: 2px;

        .tool-item {
          padding: 8px 6px;
          min-width: 50px;
          font-size: 11px;

          .el-icon {
            font-size: 18px;
          }
        }
      }

      .divider {
        height: 60px;
      }

      .date-section .date-picker {
        width: 140px;
      }
    }
  }
}

// 暗黑模式适配
.dark {
  .toolbar {
    background: #1a1a1a;
    border-bottom-color: #303030;

    .toolbar-left {
      .location-section {
        background: #252525;
        border-color: #383838;

        .location-header .location-label {
          color: #c0c0c0;
        }

        .location-content {
          .trajectory-preview .trajectoryBox {
            background: #1a1a1a;
            border-color: #404040;
            color: #909399;

            &:hover {
              border-color: #409eff;
              color: #409eff;
              background: #1a2332;
            }
          }
        }
      }
    }

    .toolbar-right {
      .view-mode-group .mode-item {
        color: #b0b0b0;

        &:hover {
          color: #409eff;
          background: #1a2332;
        }

        &.active {
          color: #409eff;
          background: #1a2840;

          &::after {
            background: linear-gradient(90deg, transparent, #409eff, transparent);
          }
        }
      }

      .tool-group .tool-item {
        color: #b0b0b0;

        &:hover {
          color: #409eff;
          background: #1a2332;
        }

        &.active {
          color: #409eff;
          background: #1a2840;

          &::after {
            background: linear-gradient(90deg, transparent, #409eff, transparent);
          }
        }
      }

      .divider {
        background: linear-gradient(
          to bottom,
          transparent,
          #383838 20%,
          #383838 80%,
          transparent
        );
      }
    }
  }
}
</style>
