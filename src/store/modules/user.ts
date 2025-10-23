import { defineStore } from 'pinia'
import { ref } from 'vue'
import pinia from '@/store'
import { setToken, removeToken } from '@/utils/auth'
import type { DataInfo } from '@/utils/auth'

export const useUserStore = defineStore('pure-user', () => {
  // State
  const username = ref<string>('')
  const roles = ref<Array<string>>([])
  const avatar = ref<string>('')
  const nickname = ref<string>('')
  const permissions = ref<Array<string>>([])
  const isRemembered = ref<boolean>(false)
  const loginDay = ref<number>(0)
  const currentPage = ref<number>(0) // 登录页面状态: 0=登录, 1=手机登录, 2=二维码, 3=注册, 4=忘记密码
  const verifyCode = ref<string>('') // 图形验证码

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
    removeToken()
  }

  function handRefreshToken(data: any) {
    // Handle refresh token logic
    return Promise.resolve(data)
  }

  function SET_CURRENTPAGE(value: number) {
    currentPage.value = value
  }

  function SET_VERIFYCODE(value: string) {
    verifyCode.value = value
  }

  // 登录接口
  function loginByUsername(data: { username: string; password: string }) {
    return new Promise<{ success: boolean; data?: any }>((resolve) => {
      setTimeout(() => {
        // 验证账号密码
        if (data.username === 'admin' && data.password === '123456') {
          // 登录成功
          const tokenData: DataInfo<Date> = {
            accessToken: 'mock-admin-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
            username: 'admin',
            nickname: '管理员',
            avatar: '',
            roles: ['admin'],
            permissions: ['*:*:*']
          }

          // 设置 token 和用户信息
          setToken(tokenData)

          // 更新 store
          SET_USERNAME('admin')
          SET_NICKNAME('管理员')
          SET_ROLES(['admin'])
          SET_PERMS(['*:*:*'])

          resolve({ success: true, data: tokenData })
        } else {
          // 登录失败
          resolve({ success: false })
        }
      }, 800)
    })
  }

  return {
    username,
    roles,
    avatar,
    nickname,
    permissions,
    isRemembered,
    loginDay,
    currentPage,
    verifyCode,
    SET_USERNAME,
    SET_ROLES,
    SET_AVATAR,
    SET_NICKNAME,
    SET_PERMS,
    SET_CURRENTPAGE,
    SET_VERIFYCODE,
    logOut,
    handRefreshToken,
    loginByUsername,
  }
})

export function useUserStoreHook() {
  return useUserStore(pinia)
}
