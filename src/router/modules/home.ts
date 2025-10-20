/**
 * 示例路由模块 - 首页
 *
 * 这是一个路由配置的示例，展示如何定义路由
 * 你可以参考这个文件创建更多的路由模块
 */

export default {
  path: '/welcome',
  name: 'Welcome',
  component: () => import('@/views/welcome/index.vue'),
  meta: {
    // 页面标题
    title: 'menus.pureHome',
    // 图标
    icon: 'ep/home-filled',
    // 是否显示在菜单中
    showLink: true,
    // 菜单排序，值越高排的越后（只针对顶级路由）
    rank: 0,
  },
}
