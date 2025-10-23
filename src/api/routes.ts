import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

// 模拟后端返回的路由数据
export const getAsyncRoutes = () => {
  // 返回一个模拟的 Promise，包含路由数据
  return new Promise<Result>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [] // 空数组表示使用前端静态路由
      });
    }, 100);
  });

  // 如果后端接口已实现，可以使用以下代码：
  // return http.request<Result>("get", "/get-async-routes");
};
