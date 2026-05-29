/**
 * 全局 Toast 模块
 * ==========================================
 *
 * 方式一（推荐，页面级）：useToast() composable
 *   import { useToast } from "@/util/toast.js"
 *   const { uToastRef, showToast } = useToast()
 *   模板: <u-toast ref="uToastRef" />
 *   调用: showToast("消息", "success")
 *
 * 方式二（全局降级）：uni.$showToast
 *   调用: uni.$showToast("消息")   → 用 App.vue 的全局 u-toast 或 uni.showToast
 *
 * 注册：在 App.vue 模板中 <u-toast :ref="registerToastRef" />
 */

import { ref } from "vue";

// ==================== 全局（方案 B：App.vue 单例） ====================

let toastRef = null;
const pendingQueue = [];

export function registerToastRef(el) {
  if (el) {
    toastRef = el;
    pendingQueue.forEach(({ msg, type }) => {
      toastRef.show({ type, icon: false, message: msg, duration: 2000 });
    });
    pendingQueue.length = 0;
  }
}

export function showToast(msg, type = "error") {
  const safeMsg = msg || "";
  if (toastRef) {
    toastRef.show({ type, icon: false, message: safeMsg, duration: 2000 });
    return;
  }
  pendingQueue.push({ msg: safeMsg, type });
  setTimeout(() => {
    const idx = pendingQueue.findIndex(
      (item) => item.msg === safeMsg && item.type === type,
    );
    if (idx !== -1) {
      pendingQueue.splice(idx, 1);
      uni.showToast({ title: safeMsg, icon: "none" });
    }
  }, 500);
}

// ==================== 页面级（方案 A：useToast composable） ====================

/**
 * 页面级 Toast composable
 * 每个页面调用 useToast() 获得独立的 u-toast ref 和 showToast 方法
 *
 * @example
 *   const { uToastRef, showToast } = useToast()
 *   // 模板: <u-toast ref="uToastRef" />
 *   showToast("保存成功", "success")
 */
export function useToast() {
  const uToastRef = ref(null);

  function show(msg, type = "error") {
    const safeMsg = msg || "";
    if (uToastRef.value) {
      uToastRef.value.show({
        type,
        icon: false,
        message: safeMsg,
        duration: 2000,
      });
    } else {
      uni.showToast({ title: safeMsg, icon: "none" });
    }
  }

  return { uToastRef, showToast: show };
}

// 挂载到 uni 全局（降级方案）
uni.$showToast = showToast;
