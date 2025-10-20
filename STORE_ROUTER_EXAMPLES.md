# Pinia Store 和 Vue Router 使用示例

这个文档提供了 Pinia Store 和 Vue Router 的使用示例，帮助你快速上手。

## 📁 文件结构

```
src/
├── store/
│   ├── index.ts                    # Pinia 主配置
│   └── modules/
│       ├── example.ts              # ✨ 示例 Store (学习参考)
│       ├── multiTags.ts            # 标签页 Store
│       ├── permission.ts           # 权限 Store
│       └── user.ts                 # 用户 Store
├── router/
│   ├── index.ts                    # Router 主配置
│   └── modules/
│       ├── home.ts                 # ✨ 示例路由 (学习参考)
│       └── remaining.ts            # 其他路由
└── views/
    └── welcome/
        └── index.vue               # ✨ 示例页面 (学习参考)
```

## 🎯 Pinia Store 使用指南

### 1. 创建新的 Store 模块

参考 `src/store/modules/example.ts`，创建你自己的 Store：

```typescript
// src/store/modules/yourStore.ts
import { defineStore } from 'pinia'
import pinia from '@/store'

// 定义类型
interface YourState {
  data: string
  count: number
}

export const useYourStore = defineStore({
  id: 'your-store-id',

  // State: 定义状态
  state: (): YourState => ({
    data: '',
    count: 0,
  }),

  // Getters: 计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
  },

  // Actions: 方法
  actions: {
    updateData(newData: string) {
      this.data = newData
    },

    async fetchData() {
      // 异步操作
      const response = await fetch('/api/data')
      this.data = await response.json()
    },
  },
})

// Hook 函数（在非组件中使用）
export function useYourStoreHook() {
  return useYourStore(pinia)
}
```

### 2. 在组件中使用 Store

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useYourStore } from '@/store/modules/yourStore'

// 获取 store 实例
const yourStore = useYourStore()

// 使用 storeToRefs 将 state 和 getters 转为响应式引用
const { count, doubleCount } = storeToRefs(yourStore)

// 调用 actions
const increment = () => {
  yourStore.updateData('new value')
}
</script>
```

### 3. 在非组件中使用 Store（如 router guard）

```typescript
import { useYourStoreHook } from '@/store/modules/yourStore'

router.beforeEach((to, from, next) => {
  const yourStore = useYourStoreHook()
  yourStore.updateData('router data')
  next()
})
```

## 🛣️ Vue Router 使用指南

### 1. 创建新的路由模块

参考 `src/router/modules/home.ts`，创建你自己的路由：

```typescript
// src/router/modules/yourRoute.ts
export default {
  path: '/your-page',
  name: 'YourPage',
  component: () => import('@/views/your-page/index.vue'),
  meta: {
    title: '页面标题',
    icon: 'ep/document',
    showLink: true,
    rank: 10,
  },
}
```

### 2. 带子路由的配置

```typescript
export default {
  path: '/parent',
  name: 'Parent',
  redirect: '/parent/child1',
  meta: {
    title: '父级菜单',
    icon: 'ep/folder',
    showLink: true,
  },
  children: [
    {
      path: '/parent/child1',
      name: 'Child1',
      component: () => import('@/views/parent/child1.vue'),
      meta: {
        title: '子菜单1',
        showLink: true,
      },
    },
    {
      path: '/parent/child2',
      name: 'Child2',
      component: () => import('@/views/parent/child2.vue'),
      meta: {
        title: '子菜单2',
        showLink: true,
      },
    },
  ],
}
```

### 3. 动态路由参数

```typescript
export default {
  path: '/user/:id',
  name: 'UserDetail',
  component: () => import('@/views/user/detail.vue'),
  meta: {
    title: '用户详情',
  },
}
```

在组件中获取参数：

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.params.id
</script>
```

### 4. 编程式导航

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到指定路径
router.push('/welcome')

// 带参数跳转
router.push({
  name: 'UserDetail',
  params: { id: '123' }
})

// 带查询参数
router.push({
  path: '/search',
  query: { keyword: 'vue' }
})

// 后退
router.back()

// 替换当前路由（不会留下历史记录）
router.replace('/login')
```

## 📝 Meta 配置说明

### Router Meta 字段

```typescript
meta: {
  title: string          // 页面标题（会显示在浏览器标签和面包屑中）
  icon: string           // 菜单图标
  showLink: boolean      // 是否在菜单中显示
  rank: number           // 菜单排序（值越大越靠后）
  roles: string[]        // 权限角色
  keepAlive: boolean     // 是否缓存页面
  hiddenTag: boolean     // 是否在标签页中隐藏
}
```

## 🚀 实战示例

查看以下文件获取完整的实战示例：

1. **示例 Store**: `src/store/modules/example.ts`
   - 包含 state、getters、actions 的完整示例
   - 异步操作示例
   - TypeScript 类型定义

2. **示例路由**: `src/router/modules/home.ts`
   - 基础路由配置
   - Meta 字段使用

3. **示例页面**: `src/views/welcome/index.vue`
   - 使用 Store 的完整示例
   - 表单交互
   - Store 数据绑定

## 💡 常见问题

### Q: Store 数据响应式失效？

A: 使用 `storeToRefs` 包装 state 和 getters：

```typescript
// ❌ 错误：会失去响应式
const { count } = useYourStore()

// ✅ 正确：保持响应式
import { storeToRefs } from 'pinia'
const { count } = storeToRefs(useYourStore())
```

### Q: 如何在多个组件间共享状态？

A: Store 是单例的，在任何组件中使用同一个 Store 都会访问相同的状态：

```typescript
// ComponentA.vue
const store = useYourStore()
store.count = 10

// ComponentB.vue
const store = useYourStore()
console.log(store.count) // 10
```

### Q: 如何重置 Store 状态？

A: 使用 `$reset()` 方法：

```typescript
const store = useYourStore()
store.$reset() // 重置到初始状态
```

### Q: 路由懒加载不生效？

A: 确保使用箭头函数和 import：

```typescript
// ✅ 正确
component: () => import('@/views/page.vue')

// ❌ 错误
component: import('@/views/page.vue')
```

## 📚 更多资源

- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [Vue 3 官方文档](https://cn.vuejs.org/)

---

**提示**: 启动项目后访问 http://localhost:8850/welcome 查看示例页面！
