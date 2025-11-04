<template>
  <div class="consistency-check">
    <!-- 工具栏 -->
    <div class="topView">
      <ToolBar
      :model-value="toolbarState"
      @update:model-value="handleToolbarUpdate"
      @location-change="handleLocationChange"
      @back="handleBack"
    />
    </div>

    <!-- 四宫格视图 -->
    <div class="main-content">
      <ViewGrid :location="currentLocation" :toolbar-state="toolbarState" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'consistencyCheck', // 组件名称
})
</script>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolBar from './components/ToolBar.vue'
import ViewGrid from './components/ViewGrid.vue'
import type { ToolbarState, LocationInfo } from './types'

const router = useRouter()

// 工具栏状态（默认为混合模式，显示所有视图）
const toolbarState = reactive<ToolbarState>({
  showReality: true,
  showModel: true,
  showPointCloud: true,
  showResult: true,
  showMixed: true,
  viewSync: false,
  currentTool: 'none',
  location: {
    building: '',
    floor: '',
    room: '',
  },
  selectedDate: '',
})

// 当前位置
const currentLocation = reactive<LocationInfo>({
  building: '',
  floor: '',
  room: '',
})

// 工具栏状态更新处理
const handleToolbarUpdate = (newState: ToolbarState) => {
  console.log('🔁 index.vue 接收到工具栏状态更新:', newState)
  // 更新 reactive 对象的所有属性
  Object.assign(toolbarState, newState)
  console.log('✅ index.vue 工具栏状态已更新:', toolbarState)
}

// 位置变化处理
const handleLocationChange = (location: LocationInfo) => {
  Object.assign(currentLocation, location)
  console.log('位置变化:', currentLocation)

  // 这里可以根据位置变化加载不同的数据
  ElMessage.success(`已切换到 ${location.building} ${location.floor} ${location.room}`)
}

// 返回项目清单
const handleBack = () => {
  router.push('/data/overview')
}
</script>

<style lang="scss" scoped>
.consistency-check {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
.topView {
  width: 100%;
}
  .main-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    margin-bottom: 130px;
  }
}

// 暗黑模式适配
.dark {
  .consistency-check {
    background: #0a0a0a;
  }
}
</style>
