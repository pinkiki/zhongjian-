import { defineStore } from 'pinia'
import { ref } from 'vue'
import pinia from '@/store'

export const useUserStore = defineStore('pure-user', () => {
  // State
  const username = ref<string>('')
  const roles = ref<Array<string>>([])
  const avatar = ref<string>('')
  const nickname = ref<string>('')
  const permissions = ref<Array<string>>([])
  const isRemembered = ref<boolean>(false)
  const loginDay = ref<number>(0)

  // Actions
  function SET_USERNAME(value: string) {
    username.value = value
  }

  function SET_ROLES(value: Array<string>) {
    roles.value = value
  }

  function SET_AVATAR(value: string) {
    avatar.value = value
  }

  function SET_NICKNAME(value: string) {
    nickname.value = value
  }

  function SET_PERMS(value: Array<string>) {
    permissions.value = value
  }

  function logOut() {
    username.value = ''
    roles.value = []
    avatar.value = ''
    nickname.value = ''
    permissions.value = []
  }

  function handRefreshToken(data: any) {
    // Handle refresh token logic
    return Promise.resolve(data)
  }

  return {
    username,
    roles,
    avatar,
    nickname,
    permissions,
    isRemembered,
    loginDay,
    SET_USERNAME,
    SET_ROLES,
    SET_AVATAR,
    SET_NICKNAME,
    SET_PERMS,
    logOut,
    handRefreshToken,
  }
})

export function useUserStoreHook() {
  return useUserStore(pinia)
}
