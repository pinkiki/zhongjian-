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
    }
  ]
} as RouteRecordRaw
