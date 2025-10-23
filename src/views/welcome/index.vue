<template>
  <div class="welcome-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用中建八局</span>
        </div>
      </template>

      <div class="content">
        <div class="welcome-info">
          <h2>欢迎，{{ username || '用户' }}！</h2>
          <p class="welcome-desc">您已成功登录系统，当前时间：{{ currentTime }}</p>
        </div>

        <el-divider />

        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <el-icon :size="40" color="#409eff">
                  <Operation />
                </el-icon>
                <div class="stat-info">
                  <h3>系统状态</h3>
                  <p class="stat-value">运行正常</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <el-icon :size="40" color="#67c23a">
                  <User />
                </el-icon>
                <div class="stat-info">
                  <h3>用户角色</h3>
                  <p class="stat-value">{{ role }}</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <el-icon :size="40" color="#e6a23c">
                  <Clock />
                </el-icon>
                <div class="stat-info">
                  <h3>登录时间</h3>
                  <p class="stat-value">{{ loginTime }}</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <el-icon :size="40" color="#f56c6c">
                  <Grid />
                </el-icon>
                <div class="stat-info">
                  <h3>快捷功能</h3>
                  <p class="stat-value">待开发</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStoreHook } from '@/store/modules/user'
import { Operation, User, Clock, Grid } from '@element-plus/icons-vue'

const userStore = useUserStoreHook()
const currentTime = ref('')
const loginTime = ref('')
let timer: number | null = null

const username = computed(() => userStore.nickname || userStore.username)
const role = computed(() => {
  const roles = userStore.roles
  if (roles && roles.length > 0) {
    return roles.includes('admin') ? '管理员' : '普通用户'
  }
  return '访客'
})

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  updateTime()
  loginTime.value = currentTime.value
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.welcome-container {
  padding: 20px;

  .welcome-card {
    max-width: 1400px;
    margin: 0 auto;
  }

  .card-header {
    font-size: 24px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .content {
    .welcome-info {
      text-align: center;
      padding: 20px 0;

      h2 {
        font-size: 28px;
        color: #303133;
        margin-bottom: 10px;
      }

      .welcome-desc {
        font-size: 16px;
        color: #909399;
      }
    }

    .stats-row {
      margin-top: 30px;
    }

    .stat-card {
      margin-bottom: 20px;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .stat-info {
          flex: 1;

          h3 {
            font-size: 14px;
            color: #909399;
            margin: 0 0 8px 0;
            font-weight: 500;
          }

          .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #303133;
            margin: 0;
          }
        }
      }
    }
  }
}

// 暗黑模式适配
html.dark {
  .welcome-container {
    .content {
      .welcome-info {
        h2 {
          color: #e5eaf3;
        }
      }

      .stat-card {
        .stat-content {
          .stat-info {
            .stat-value {
              color: #e5eaf3;
            }
          }
        }
      }
    }
  }
}
</style>
