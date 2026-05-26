import App from "./App";
import { createSSRApp } from "vue";

import { myRequest } from "./util/api.js";
import uviewPlus, { setConfig } from "uview-plus";
import store from "./store/index.js";

// 提前禁止远程字体加载，避免 uni.loadFontFace 报错导致白屏
setConfig({
  iconUrl: "",
  loadFontOnce: true,
});

uni.$myRequest = myRequest;

export function createApp() {
  const app = createSSRApp(App);
  app.use(uviewPlus);
  app.config.globalProperties.$myRequest = myRequest;
  app.config.globalProperties.$store = store;

  // 全局混入：将主题 CSS 变量注入每个页面的根元素
  // 组件中可直接使用 var(--color-primary) 等 CSS 变量
  app.mixin({
    computed: {
      /** 主题 CSS 变量对象，用于页面根元素的 :style 绑定 */
      $themeStyle() {
        return uni.$themeVars || {};
      },
    },
  });

  return {
    app,
  };
}
