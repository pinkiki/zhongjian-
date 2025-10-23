/**
 * 图标展示路由模块
 */

const Layout = () => import('@/layout/index.vue')

export default {
  path: '/icons',
  name: 'Icons',
  component: Layout,
  redirect: '/icons/index',
  meta: {
    // 页面标题
    title: 'menus.pureIcons',
    // 图标
    icon: 'ep/grid',
    // 菜单排序
    rank: 2,
    // 不在侧边栏显示父级路由
    showLink: true,
  },
  children: [
    {
      path: '/icons/index',
      name: 'IconsIndex',
      component: () => import('@/views/icons/index.vue'),
      meta: {
        // 页面标题
        title: 'menus.pureIcons',
        // 图标
        icon: 'ep/grid',
        // 是否显示在菜单中
        showLink: true,
      },
    },
  ],
}
