import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pinia from '@/store'
import { type RouteConfigs, routerArrays } from '@/layout/types'

export const useMultiTagsStore = defineStore('pure-multiTags', () => {
  // State
  const multiTags = ref<RouteConfigs[]>([...routerArrays])
  const multiTagsCache = ref<boolean>(false)

  // Getters
  const getMultiTagsCache = computed(() => multiTagsCache.value)

  // Actions
  function handleTags(
    mode: string,
    value?: RouteConfigs | RouteConfigs[],
    position?: RouteConfigs,
  ): void {
    switch (mode) {
      case 'push':
        {
          const tagVal = value as RouteConfigs
          // 不添加到标签页
          if (tagVal?.meta?.hiddenTag) return
          // 如果已存在不重复添加
          const tagHasExits = multiTags.value.some(
            (tag) => tag.path === tagVal.path,
          )
          if (!tagHasExits) {
            multiTags.value.push(tagVal)
          }
        }
        break
      case 'equal':
        // 等于操作，直接设置标签页
        if (Array.isArray(value)) {
          multiTags.value = value
        }
        break
      case 'splice':
        if (!position) return
        multiTags.value.forEach((v, i) => {
          if (v.path === position.path) {
            multiTags.value.splice(i, 1)
          }
        })
        break
      case 'slice':
        multiTags.value = [...routerArrays]
        break
    }
  }

  function multiTagsCacheChange(value: boolean): void {
    multiTagsCache.value = value
  }

  return {
    multiTags,
    multiTagsCache,
    getMultiTagsCache,
    handleTags,
    multiTagsCacheChange,
  }
})

export function useMultiTagsStoreHook() {
  return useMultiTagsStore(pinia)
}
