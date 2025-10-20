import { defineStore } from 'pinia'
import { ref } from 'vue'
import pinia from '@/store'
import { ascending } from '@/router/utils'
import { cloneDeep } from '@pureadmin/utils'
import { constantMenus } from '@/router'

export interface cacheType {
  mode: string
  name?: string
}

export const usePermissionStore = defineStore('pure-permission', () => {
  // State
  const wholeMenus = ref<RouteComponent[]>([])
  const menusTree = ref<RouteComponent[]>([])
  const cachePageList = ref<string[]>([])
  const flatteningRoutes = ref<RouteComponent[]>([])

  // Helper function
  function flattenRoutes(routes: RouteComponent[]): RouteComponent[] {
    const result: RouteComponent[] = []
    routes.forEach((route) => {
      result.push(route)
      if (route.children && route.children.length > 0) {
        result.push(...flattenRoutes(route.children))
      }
    })
    return result
  }

  // Actions
  function getWholeMenus() {
    return wholeMenus.value
  }

  function setWholeMenus(routes: RouteComponent[]) {
    wholeMenus.value = routes
  }

  function clearAllCachePage() {
    cachePageList.value = []
  }

  function cacheOperate({ mode, name }: cacheType) {
    const delIndex = cachePageList.value.findIndex((v) => v === name)
    switch (mode) {
      case 'refresh':
        cachePageList.value = cachePageList.value.filter((v) => v !== name)
        break
      case 'add':
        if (name) cachePageList.value.push(name)
        break
      case 'delete':
        delIndex !== -1 && cachePageList.value.splice(delIndex, 1)
        break
    }
  }

  function clearPermission() {
    wholeMenus.value = []
    menusTree.value = []
    flatteningRoutes.value = []
    clearAllCachePage()
  }

  function initMenus(routes: RouteComponent[]) {
    wholeMenus.value = ascending(cloneDeep(routes)).concat(constantMenus)
    menusTree.value = cloneDeep(wholeMenus.value)
  }

  function handleWholeMenus(routes: RouteComponent[]) {
    wholeMenus.value = ascending(cloneDeep(routes)).concat(constantMenus)
    menusTree.value = cloneDeep(wholeMenus.value)
    // 扁平化路由
    flatteningRoutes.value = flattenRoutes(routes)
  }

  return {
    wholeMenus,
    menusTree,
    cachePageList,
    flatteningRoutes,
    getWholeMenus,
    setWholeMenus,
    clearAllCachePage,
    cacheOperate,
    clearPermission,
    initMenus,
    handleWholeMenus,
  }
})

export function usePermissionStoreHook() {
  return usePermissionStore(pinia)
}
