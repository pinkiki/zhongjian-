import { RouteRecordRaw } from "vue-router"

const Layout = () => import("@/layout/index.vue")

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/organization",
  meta: {
    title: "menus.pureSysManagement",
    icon: "ep/setting",
    rank: 10
  },
  children: [
    {
      path: "/system/organization",
      name: "Organization",
      component: () => import("@/views/system/organization/index.vue"),
      meta: {
        title: "menus.pureOrgManagement",
        icon: "ep/office-building",
        showLink: true
      }
    },
    {
      path: "/system/personnel",
      name: "Personnel",
      component: () => import("@/views/system/personnel/index.vue"),
      meta: {
        title: "人员管理",
        icon: "ep/user",
        showLink: true
      }
    }
  ]
} as RouteRecordRaw
