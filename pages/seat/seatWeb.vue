<!--
  在线选座页（seatWeb.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  功能：内嵌 web-view 打开第三方选座页面，监听 postMessage 回调
-->

<template>
  <web-view :src="pageUrl" @message="handleMessage" />
</template>

<script setup>
import { ref, toRaw, markRaw } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 数据 ====================
const pageUrl = ref("");

// ==================== 生命周期 222====================
onLoad(() => {
  const params = toRaw(store.pary) || {};
  console.log("paryparypary", params);
  console.log("paryparypary", toRaw(store.pary));
  const baseUrl = "https://saasseat.huibaitech.com?appid=";
  pageUrl.value = baseUrl + encodeURIComponent(JSON.stringify(params));
  console.log("pageUrl", pageUrl.value);
});

// ==================== 业务方法 ====================
function handleMessage(e) {
  const payload = e?.target?.data?.[0];
  if (!payload) return;
  console.log("选座回调数据:", payload);
  store.tickinfo = toRaw({
    openId: store.pary?.openid || "",
    OrderID: payload.action,
    ShowName: store.pary?.ShowName || "",
    time: store.pary?.time || "",
    price: payload.price,
    isMember: payload.ismen,
    menbMoney: payload.menbMoney,
    wechatMonay: payload.wechatMonay,
    CompanyID: store.pary?.CompanyID || "",
    ScenicID: store.pary?.ScenicID || "",
  });
}
</script>

<style>
/* web-view 页面无需样式 */
</style>
