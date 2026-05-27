<template>
  <view class="my-content" :style="$themeStyle">
    <text class="my-content__placeholder">我的页面</text>
  </view>
</template>

<script setup>
defineProps({ active: Boolean });
</script>

<style scoped>
.my-content {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
}
.my-content__placeholder {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
</style>
