<!--
  接口请求加载遮罩 — 通用
  用法：<RequestLoading v-if="loading" text="正在加载订单..." />
-->
<template>
  <view class="request-loading" @touchmove.stop.prevent>
    <view class="request-loading__card">
      <u-loading-icon
        mode="circle"
        :size="48"
        color="var(--color-primary)"
        :duration="600"
      />
      <text class="request-loading__text">{{ text }}</text>
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
.request-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.request-loading__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 48rpx 64rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-modal, 0 24rpx 60rpx rgba(0, 0, 0, 0.12));
}

.request-loading__text {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
}
</style>
