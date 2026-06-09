<!--
  提现说明页 — 展示提现规则富文本
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
  <view class="noti-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="加载中..." />
    <f-parse :content="content" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";

const content = ref("");
const requestLoading = ref(false);

onLoad(() => { fetchData(); });

async function fetchData() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({ url: "/api/Applets/AppletsGetPersonDisSet", method: "POST", data: { OpenId: openid?.openid || "" } });
    content.value = res.data?.Data || "";
  } catch (err) { console.error("[finenoti] err:", err); }
  finally { requestLoading.value = false; }
}
</script>

<style lang="scss" scoped>
.noti-page { min-height:100vh; background-color:var(--color-bg); padding:20rpx; }
</style>