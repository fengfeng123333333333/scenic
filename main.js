import App from "./App";
import { createSSRApp } from "vue";

import { myRequest } from "./util/api.js";
import uviewPlus, { setConfig } from "uview-plus";
// import store from "./store/index.js";
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
  return {
    app,
  };
}
