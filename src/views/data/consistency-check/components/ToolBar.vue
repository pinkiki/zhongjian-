<template>
  <div class="toolbar">
    <!-- 左侧：视图切换 -->
    <div class="toolbar-left">
      <!-- <div class="view-tabs">
        <div class="view-tab" :class="{ active: activeView === 'plan' }" @click="activeView = 'plan'">
          <el-icon><Grid /></el-icon>
          <span>平面图</span>
        </div>
        <div class="view-tab" :class="{ active: activeView === '3d' }" @click="activeView = '3d'">
          <el-icon><Box /></el-icon>
          <span>3D户型图</span>
        </div>
      </div> -->
    </div>

    <!-- 中间：当前位置 -->
    <div class="toolbar-center">
      <div class="location-section">
        <span class="location-label">当前位置：</span>
        <el-select
          v-model="currentLocation.building"
          placeholder="楼栋"
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
          placeholder="楼层"
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
          placeholder="房间"
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

    <!-- 右侧：工具按钮 -->
    <div class="toolbar-right">
      <!-- 视图模式按钮组 -->
      <div class="view-mode-group">
        <div
          class="view-mode-btn"
          :class="{ active: currentViewMode === 'reality' }"
          @click="setViewMode('reality')"
        >
          <el-icon><Camera /></el-icon>
          <span>实景</span>
        </div>

        <div
          class="view-mode-btn"
          :class="{ active: currentViewMode === 'model' }"
          @click="setViewMode('model')"
        >
          <el-icon><Box /></el-icon>
          <span>三维模型</span>
        </div>

        <div
          class="view-mode-btn"
          :class="{ active: currentViewMode === 'pointCloud' }"
          @click="setViewMode('pointCloud')"
        >
          <el-icon><Sunny /></el-icon>
          <span>点云</span>
        </div>

        <div
          class="view-mode-btn"
          :class="{ active: currentViewMode === 'result' }"
          @click="setViewMode('result')"
        >
          <el-icon><TrendCharts /></el-icon>
          <span>实模结果</span>
        </div>

        <div
          class="view-mode-btn"
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
        <el-tooltip content="批注" placement="bottom">
          <div
            class="tool-btn"
            :class="{ active: toolbarState.currentTool === 'annotation' }"
            @click="setTool('annotation')"
          >
            <el-icon><Edit /></el-icon>
          </div>
        </el-tooltip>

        <el-tooltip content="测量" placement="bottom">
          <div
            class="tool-btn"
            :class="{ active: toolbarState.currentTool === 'measure' }"
            @click="setTool('measure')"
          >
            <el-icon><TrendCharts /></el-icon>
          </div>
        </el-tooltip>

        <el-tooltip content="批注列表" placement="bottom">
          <div class="tool-btn" @click="showAnnotationList">
            <el-icon><List /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <div class="divider"></div>

      <!-- 日期选择 -->
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        size="default"
        class="date-picker"
        @change="handleDateChange"
      />

      <div class="divider"></div>

      <!-- 返回按钮 -->
      <el-button type="primary" size="default" @click="handleBack">
        <el-icon><Back /></el-icon>
        返回项目清单
      </el-button>
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
  'back': []
}>()

// 状态
const activeView = ref<'plan' | '3d'>('plan')
const selectedDate = ref<string>('')
const currentViewMode = ref<'reality' | 'model' | 'pointCloud' | 'result' | 'mixed'>('mixed')

const currentLocation = reactive<LocationInfo>({
  building: '',
  floor: '',
  room: '',
})

// 使用计算属性直接访问 props，避免状态不同步
const toolbarState = computed(() => props.modelValue)

// 设置视图模式
const setViewMode = (mode: 'reality' | 'model' | 'pointCloud' | 'result' | 'mixed') => {
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

// 返回
const handleBack = () => {
  emit('back')
}
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .toolbar-left {
    display: flex;
    align-items: center;

    .view-tabs {
      display: flex;
      gap: 8px;

      .view-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 6px;
        background: #f5f7fa;
        color: #606266;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #e6e8eb;
        }

        &.active {
          background: #409eff;
          color: #ffffff;
        }

        .el-icon {
          font-size: 16px;
        }
      }
    }
  }

  .toolbar-center {
    flex: 1;
    display: flex;
    justify-content: center;

    .location-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .location-label {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }

      .location-select {
        width: 120px;
      }
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .view-mode-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .view-mode-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 6px;
        background: #f5f7fa;
        color: #606266;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        white-space: nowrap;

        &:hover {
          background: #e6e8eb;
          color: #409eff;
        }

        &.active {
          background: #409eff;
          color: #ffffff;
        }

        .el-icon {
          font-size: 16px;
        }

        span {
          font-weight: 500;
        }
      }
    }

    .tool-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .tool-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        background: #f5f7fa;
        color: #606266;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #e6e8eb;
          color: #409eff;
        }

        &.active {
          background: #409eff;
          color: #ffffff;
        }

        .el-icon {
          font-size: 18px;
        }
      }
    }

    .divider {
      width: 1px;
      height: 24px;
      background: #dcdfe6;
    }

    .date-picker {
      width: 160px;
    }
  }
}

// 暗黑模式适配
.dark {
  .toolbar {
    background: #1a1a1a;
    border-bottom-color: #303030;

    .toolbar-left .view-tabs .view-tab {
      background: #2a2a2a;
      color: #d0d0d0;

      &:hover {
        background: #3a3a3a;
      }

      &.active {
        background: #409eff;
        color: #ffffff;
      }
    }

    .toolbar-center .location-label {
      color: #d0d0d0;
    }

    .toolbar-right {
      .view-mode-group .view-mode-btn {
        background: #2a2a2a;
        color: #d0d0d0;

        &:hover {
          background: #3a3a3a;
          color: #409eff;
        }

        &.active {
          background: #409eff;
          color: #ffffff;
        }
      }

      .tool-group .tool-btn {
        background: #2a2a2a;
        color: #d0d0d0;

        &:hover {
          background: #3a3a3a;
          color: #409eff;
        }

        &.active {
          background: #409eff;
          color: #ffffff;
        }
      }

      .divider {
        background: #404040;
      }
    }
  }
}
</style>
