<template>
  <view class="page-my" :style="$themeStyle">
    <text class="placeholder">我的页面</text>
  </view>
</template>

<style scoped>
.page-my {
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
