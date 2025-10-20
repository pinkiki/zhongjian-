import App from './App.vue'
import { createApp, type Directive } from "vue";
import { getPlatformConfig } from "./config";
import { useVxeTable } from "@/plugins/vxeTable";
import { useElementPlus } from "@/plugins/elementPlus";

// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import "./style/tailwind.css";
import "element-plus/dist/index.css";
// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";


const app = createApp(App);
// // 自定义指令
// import * as directives from "@/directives";
// Object.keys(directives).forEach(key => {
//   app.directive(key, (directives as { [key: string]: Directive })[key]);
// });
// 全局注册vue-tippy
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import VueTippy from "vue-tippy";
app.use(VueTippy);


getPlatformConfig(app).then(async config => {
  app
    .use(useElementPlus)
    .use(useVxeTable)
  app.mount("#app");
});
