import App from "./App";
import { createSSRApp } from "vue";

import { myRequest } from "./util/api.js";
import "./util/toast.js"; // 注册全局 uni.$showToast
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
    methods: {
      /**
       * 全局 Toast（需页面模板中放置 <u-toast ref="uToastRef" />）
       * 若页面无 u-toast，自动降级为 uni.showToast
       */
      $showToast(msg, type = "error") {
        // 先尝试页面内的 u-toast ref
        const ref = this.$refs.uToastRef;
        if (ref) {
          ref.show({ type, icon: false, message: msg, duration: 2000 });
        } else {
          // 降级为系统 toast
          uni.showToast({ title: msg, icon: "none" });
        }
      },
    },
  });

  return {
    app,
  };
}
