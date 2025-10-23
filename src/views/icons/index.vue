<template>
  <div class="icons-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">Element Plus 图标库</span>
          <el-input
            v-model="searchText"
            placeholder="搜索图标名称"
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <div class="icons-grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon.name"
          class="icon-item"
          @click="copyIconName(icon)"
        >
          <div class="icon-wrapper">
            <el-icon :size="32">
              <component :is="icon.component" />
            </el-icon>
          </div>
          <div class="icon-name">{{ icon.displayName }}</div>
          <div class="icon-code">{{ icon.code }}</div>
        </div>
      </div>

      <el-empty v-if="filteredIcons.length === 0" description="未找到匹配的图标" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

defineOptions({
  name: 'Icons',
})

// 搜索文本
const searchText = ref('')

// 将驼峰命名转换为连字符命名
const camelToKebab = (str: string) => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

// 获取所有图标
const allIcons = computed(() => {
  const icons: Array<{
    name: string
    displayName: string
    code: string
    component: any
  }> = []

  Object.keys(ElementPlusIcons).forEach((key) => {
    if (key !== 'Menu') {
      // Menu 是内部组件，不是图标
      const kebabName = camelToKebab(key)
      icons.push({
        name: key,
        displayName: key,
        code: `ep/${kebabName}`,
        component: (ElementPlusIcons as any)[key],
      })
    }
  })

  return icons.sort((a, b) => a.name.localeCompare(b.name))
})

// 过滤图标
const filteredIcons = computed(() => {
  if (!searchText.value) {
    return allIcons.value
  }

  const search = searchText.value.toLowerCase()
  return allIcons.value.filter(
    (icon) =>
      icon.name.toLowerCase().includes(search) ||
      icon.code.toLowerCase().includes(search)
  )
})

// 复制图标名称
const copyIconName = async (icon: any) => {
  try {
    await navigator.clipboard.writeText(icon.code)
    ElMessage.success(`已复制: ${icon.code}`)
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = icon.code
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      ElMessage.success(`已复制: ${icon.code}`)
    } catch (e) {
      ElMessage.error('复制失败，请手动复制')
    }
    document.body.removeChild(textarea)
  }
}
</script>

<style lang="scss" scoped>
.icons-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .icons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 10px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .icon-wrapper {
        color: var(--el-color-primary);
      }
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      margin-bottom: 12px;
      color: var(--el-text-color-regular);
      transition: all 0.3s;
    }

    .icon-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      text-align: center;
      margin-bottom: 4px;
      word-break: break-word;
    }

    .icon-code {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-family: 'Courier New', monospace;
      text-align: center;
      word-break: break-all;
    }
  }
}
</style>
