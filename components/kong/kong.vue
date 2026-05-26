<template>
  <view class="kong" :style="$themeStyle">
    <view class="kong__icon-box">
      <u-icon
        name="coupon"
        color="var(--color-text-secondary)"
        size="64"
      ></u-icon>
    </view>
    <text class="kong__text">{{ text }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: "当前暂无商品",
  },
});
</script>

<style lang="scss" scoped>
.kong {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx 60rpx;
}

.kong__icon-box {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  opacity: 0.7;
}

.kong__text {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--color-text-secondary);
  line-height: 40rpx;
}
</style>
