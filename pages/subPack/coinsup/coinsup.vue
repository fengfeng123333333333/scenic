<!--
  协议/内容展示页 — 通过 u-parse 渲染后台富文本协议内容
  遵循 page-refactor-standard.md & 设计稿规范.md
  跟随全局主题动态切换

  旧函数映射：
    onLoad → onLoad + fetchProtocol
-->
<template>
  <view class="protocol-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="加载中..." />
    <view class="protocol-page__body">
      <u-parse :content="content" />
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";

const content = ref("");
const requestLoading = ref(false);

async function fetchProtocol(type) {
  requestLoading.value = true;
  try {
    const appId = uni.getAccountInfoSync().miniProgram.appId;
    const res = await uni.$myRequest({
      url: `/api/Applets/AppletsProtocolInfo?AppID=${appId}&Type=${type}`,
      method: "POST",
    });
    content.value = res.data?.Data?.ProtocolContent || "";
  } catch (err) {
    console.error("[coinsup] fetch err:", err);
  } finally {
    requestLoading.value = false;
  }
}

onLoad((options) => {
  fetchProtocol(options?.car || "0");
});
</script>

<style lang="scss" scoped>
.protocol-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.protocol-page__body {
  padding: 24rpx;
}
</style>
