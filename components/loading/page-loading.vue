<!--
  页面首次加载组件 — 通用
  用法：<PageLoading v-if="!pageReady" />
-->
<template>
  <view class="page-loading" :style="$themeStyle">
    <view class="page-loading__inner">
      <u-loading-icon
        mode="flower"
        :size="64"
        color="var(--color-primary)"
        :duration="800"
      />
      <text class="page-loading__text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: "加载中...",
  },
});
</script>

<style lang="scss" scoped>
.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background-color: var(--color-bg);
}

.page-loading__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.page-loading__text {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
}
</style>
