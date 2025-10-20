<template>
  <div class="welcome-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用 Vue 3 + Pinia 项目</span>
        </div>
      </template>

      <div class="content">
        <h2>示例页面</h2>
        <p>这是一个示例页面，展示如何使用 Pinia store</p>

        <!-- 使用 store 的示例 -->
        <el-space direction="vertical" :size="20" style="width: 100%">
          <el-card>
            <h3>计数器示例 (Pinia Store)</h3>
            <div class="counter-demo">
              <p>当前计数: {{ count }}</p>
              <el-space>
                <el-button type="primary" @click="increment">增加</el-button>
                <el-button type="danger" @click="decrement">减少</el-button>
                <el-button @click="reset">重置</el-button>
              </el-space>
              <p class="hint">计数的两倍: {{ doubleCount }}</p>
            </div>
          </el-card>

          <el-card>
            <h3>用户信息示例</h3>
            <div class="user-demo">
              <el-form :model="userForm" label-width="100px">
                <el-form-item label="用户名">
                  <el-input v-model="userForm.name" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveUser">保存到 Store</el-button>
                </el-form-item>
              </el-form>
              <div v-if="userInfo.name" class="user-info">
                <p><strong>Store 中的用户信息:</strong></p>
                <p>用户名: {{ userInfo.name }}</p>
                <p>邮箱: {{ userInfo.email }}</p>
              </div>
            </div>
          </el-card>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useExampleStore } from '@/store/modules/example'
import { ElMessage } from 'element-plus'

// 使用示例 store
const exampleStore = useExampleStore()

// 使用 storeToRefs 将 store 的 state 转换为响应式引用
const { count, doubleCount, userInfo } = storeToRefs(exampleStore)

// 表单数据
const userForm = ref({
  name: '',
  email: '',
})

// 计数器操作
const increment = () => {
  exampleStore.increment()
  ElMessage.success('计数已增加')
}

const decrement = () => {
  exampleStore.decrement()
}

const reset = () => {
  exampleStore.resetCount()
  ElMessage.info('计数已重置')
}

// 保存用户信息
const saveUser = () => {
  if (!userForm.value.name || !userForm.value.email) {
    ElMessage.warning('请填写完整信息')
    return
  }
  exampleStore.setUserInfo(userForm.value)
  ElMessage.success('用户信息已保存')
}
</script>

<style scoped lang="scss">
.welcome-container {
  padding: 20px;

  .welcome-card {
    max-width: 1200px;
    margin: 0 auto;
  }

  .card-header {
    font-size: 20px;
    font-weight: bold;
  }

  .content {
    h2 {
      margin-bottom: 10px;
      color: #333;
    }

    p {
      margin-bottom: 20px;
      color: #666;
    }
  }

  .counter-demo,
  .user-demo {
    padding: 20px;

    p {
      margin: 10px 0;
      font-size: 16px;
    }

    .hint {
      margin-top: 15px;
      color: #409eff;
      font-weight: bold;
    }
  }

  .user-info {
    margin-top: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;

    p {
      margin: 5px 0;
    }
  }
}
</style>
