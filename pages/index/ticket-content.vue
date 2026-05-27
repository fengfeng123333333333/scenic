<template>
  <view class="ticket-content" :style="$themeStyle">
    <text class="ticket-content__placeholder">购票页面</text>
  </view>
</template>

<style scoped>
.ticket-content {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
}
.ticket-content__placeholder {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
</style>
