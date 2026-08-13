<template>
  <view class="guide-page" :style="$themeStyle">
    <view class="guide-page__card">
      <view class="guide-page__icon">
        <u-icon name="scan" color="var(--color-primary)" size="80" />
      </view>
      <text class="guide-page__title">请扫码进入</text>
      <text class="guide-page__desc">请使用微信扫描景区二维码</text>
      <text class="guide-page__desc">进入小程序体验完整功能</text>
    </view>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.guide-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.guide-page__card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.guide-page__icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: var(--color-primary-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.guide-page__title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 20rpx;
}

.guide-page__desc {
  font-size: 28rpx;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
