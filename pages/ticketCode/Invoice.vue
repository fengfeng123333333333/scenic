<!--
  发票查看页 — 通过 web-view 展示发票 H5 页面
  遵循 page-refactor-standard.md & 设计稿规范.md
  跟随全局主题动态切换

  旧函数映射：
    onLoad → onLoad + decodeInvoiceUrl
-->
<template>
  <view class="invoice-page" :style="$themeStyle">
    <web-view v-if="invoiceUrl" :src="invoiceUrl" />
    <view class="invoice-page__empty" v-else>
      <u-icon name="file-text" color="var(--color-disabled)" size="48" />
      <text class="invoice-page__empty-text">暂无发票链接</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const invoiceUrl = ref("");

onLoad((options) => {
  invoiceUrl.value = decodeURIComponent(options?.url || "");
});
</script>

<style lang="scss" scoped>
.invoice-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.invoice-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  gap: 24rpx;
}

.invoice-page__empty-text {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-disabled);
}
</style>
