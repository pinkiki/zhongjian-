<template>
  <div class="login-wrapper">
    <!-- 主题切换和国际化 -->
    <div class="header-tools">
      <!-- 主题切换 -->
      <el-switch
        v-model="isDark"
        inline-prompt
        active-text="🌙"
        inactive-text="☀️"
        @change="toggleTheme"
      />

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="switchLang">
        <el-button size="small" text>
          <span class="lang-text">{{ currentLang === 'zh' ? '中文' : 'EN' }}</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh" :class="{ 'is-active': currentLang === 'zh' }">
              <span v-if="currentLang === 'zh'">✓ </span>简体中文
            </el-dropdown-item>
            <el-dropdown-item command="en" :class="{ 'is-active': currentLang === 'en' }">
              <span v-if="currentLang === 'en'">✓ </span>English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 左侧背景图 -->
    <div class="login-bg">
      <img :src="bg" alt="背景图" />
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-container">
      <div class="login-box">
        <!-- 标题 -->
        <h1 class="login-title">中建八局实模一致检查平台</h1>

        <!-- 登录表单 -->
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="loginRules"
          class="login-form"
        >
          <!-- 账号输入框 -->
          <el-form-item prop="username">
            <el-input
              v-model="ruleForm.username"
              size="large"
              clearable
              placeholder="请输入账号"
              :prefix-icon="useRenderIcon(User)"
            />
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item prop="password">
            <el-input
              v-model="ruleForm.password"
              size="large"
              type="password"
              show-password
              clearable
              placeholder="请输入密码"
              :prefix-icon="useRenderIcon(Lock)"
            />
          </el-form-item>

          <!-- 记住密码 -->
          <el-form-item>
            <el-checkbox v-model="checked">记住密码</el-checkbox>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              :disabled="disabled"
              @click="onLogin(ruleFormRef)"
            >
              登录
            </el-button>
          </el-form-item>

          <!-- 底部链接 -->
          <el-form-item class="login-footer">
            <div class="footer-links">
              <a href="javascript:void(0)" class="link" @click="handleRegister">
                注册账号<span class="required">*</span>
              </a>
              <a href="javascript:void(0)" class="link" @click="handleForgetPassword">
                忘记密码<span class="required">*</span>
              </a>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import { ArrowDown } from "@element-plus/icons-vue";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const checked = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();

// 主题切换
const isDark = ref(false);

// 语言切换
const currentLang = ref("zh");

const ruleForm = reactive({
  username: "",
  password: ""
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: "请输入账号", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" }
  ]
};

// 初始化主题
onMounted(() => {
  const theme = localStorage.getItem("theme") || "light";
  isDark.value = theme === "dark";
  applyTheme(isDark.value);

  const lang = localStorage.getItem("lang") || "zh";
  currentLang.value = lang;
});

// 应用主题
const applyTheme = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value;
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
  applyTheme(isDark.value);
};

// 切换语言
const switchLang = (lang: string) => {
  currentLang.value = lang;
  localStorage.setItem("lang", lang);
  message(lang === "zh" ? "已切换到简体中文" : "Switched to English", { type: "success" });
};

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message("登录成功", { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message("登录失败", { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

// 回车登录
const handleKeyDown = (e: KeyboardEvent) => {
  if (
    ["Enter", "NumpadEnter"].includes(e.code) &&
    !disabled.value &&
    !loading.value
  ) {
    onLogin(ruleFormRef.value);
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

// 忘记密码
const handleForgetPassword = () => {
  message("请联系管理员重置密码", { type: "info" });
};

// 注册账号
const handleRegister = () => {
  message("请联系管理员注册账号", { type: "info" });
};
</script>



<style scoped>
@import url("@/style/login.css");
</style>
