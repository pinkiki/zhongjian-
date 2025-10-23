/**
 * 数据管理路由模块
 * 包含数据总览、一致性校验、历史模型等功能
 */

const Layout = () => import('@/layout/index.vue')

export default {
  path: '/data',
  name: 'DataManage',
  component: Layout,
  redirect: '/data/overview',
  meta: {
    // 页面标题
    title: 'menus.pureDataOverview',
    // 图标
    icon: 'ep/data-line',
    // 菜单排序，值越高排的越后（只针对顶级路由）
    rank: 1,
  },
  children: [
    {
      path: '/data/overview',
      name: 'DataOverview',
      component: () => import('@/views/data/overview/index.vue'),
      meta: {
        // 页面标题
        title: 'menus.pureDataOverview',
        // 图标
        icon: 'ep/data-line',
        // 是否显示在菜单中
        showLink: true,
      },
    },
    {
      path: '/data/consistency-check',
      name: 'ConsistencyCheck',
      component: () => import('@/views/data/consistency-check/index.vue'),
      meta: {
        // 页面标题
        title: 'menus.pureConsistencyCheck',
        // 图标
        icon: 'ep/aim',
        // 是否显示在菜单中
        showLink: true,
      },
    },
    {
      path: '/data/history-model',
      name: 'HistoryModel',
      component: () => import('@/views/data/history-model/index.vue'),
      meta: {
        // 页面标题
        title: 'menus.pureHistoryModel',
        // 图标
        icon: 'ep/clock',
        // 是否显示在菜单中
        showLink: true,
      },
    },
  ],
}
