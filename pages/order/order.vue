<template>
  <view class="page-order" :style="$themeStyle">
    <text class="placeholder">订单页面</text>
  </view>
</template>

<style scoped>
.page-order {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}
</style>
