<template>
  <!-- 票型详情页骨架屏 —— 匹配 details.vue 各模块布局，遵循设计稿规范 §八 -->
  <view class="skeleton-detail" :style="$themeStyle" aria-hidden="true">
    <!-- Navbar 占位 -->
    <view class="sk-navbar">
      <view class="sk-navbar__back skeleton-bg" />
      <view class="sk-navbar__title skeleton-bg" />
    </view>

    <!-- Banner 占位 -->
    <view class="sk-banner skeleton-bg" />

    <!-- 票型信息卡占位（缩略图 + 3 行文字） -->
    <view class="sk-ticket-card">
      <view class="sk-ticket-card__thumb skeleton-bg" />
      <view class="sk-ticket-card__lines">
        <view class="sk-bar sk-bar--w90 skeleton-bg" />
        <view class="sk-bar sk-bar--w60 skeleton-bg" />
        <view class="sk-bar sk-bar--w35 skeleton-bg" />
      </view>
    </view>

    <!-- Tab 占位 -->
    <view class="sk-tabs">
      <view class="sk-tabs__item skeleton-bg" />
      <view class="sk-tabs__item skeleton-bg" />
    </view>

    <!-- 内容区占位（6 行正文模拟） -->
    <view class="sk-content">
      <view class="sk-bar sk-bar--w95 skeleton-bg" v-for="i in 6" :key="i" />
    </view>

    <!-- 底部操作栏占位 -->
    <view class="sk-footer">
      <view class="sk-footer__price skeleton-bg" />
      <view class="sk-footer__btn skeleton-bg" />
    </view>
  </view>
</template>

<script setup>
// 票型详情页骨架屏 —— 无 props，纯占位组件
// 调用方通过 v-if 控制显示/隐藏
</script>

<style lang="scss" scoped>
/* ============================================================
   票型详情骨架屏 — 遵循设计稿规范 §八 骨架屏（Skeleton）
   - 底色:  var(--color-skeleton-base) = #E6EFE8
   - 高光:  var(--color-skeleton-highlight) = rgba(255,255,255,0.55)
   - 动画:  var(--skeleton-duration) = 1.5s
   - 文本圆角: var(--skeleton-radius) = 8px
   - 卡片圆角: var(--radius-card) = 14px
   ============================================================ */

.skeleton-detail {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* ====== Shimmer 动画（遵循设计稿 §8.2） ====== */
.skeleton-bg {
  background: linear-gradient(
    90deg,
    var(--color-skeleton-base, #e6efe8) 0%,
    var(--color-skeleton-highlight, rgba(255, 255, 255, 0.55)) 50%,
    var(--color-skeleton-base, #e6efe8) 100%
  );
  background-size: 200% 100%;
  animation: shimmer var(--skeleton-duration, 1.5s) ease-in-out infinite;
  border-radius: var(--skeleton-radius, 8px);
  position: relative;
  overflow: hidden;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ====== Navbar 占位 ====== */
.sk-navbar {
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 0 32rpx;
  gap: 24rpx;
}
.sk-navbar__back {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.sk-navbar__title {
  width: 200rpx;
  height: 36rpx;
}

/* ====== Banner 占位 ====== */
.sk-banner {
  width: 100%;
  height: 420rpx;
  border-radius: 0; /* 铺满无边角 */
}

/* ====== 票型信息卡占位 ====== */
.sk-ticket-card {
  display: flex;
  margin: -56rpx 32rpx 0;
  padding: 28rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  position: relative;
  z-index: 2;
  gap: 24rpx;
}
.sk-ticket-card__thumb {
  flex-shrink: 0;
  width: 200rpx;
  height: 156rpx;
  border-radius: var(--radius-card);
}
.sk-ticket-card__lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12rpx;
  padding: 8rpx 0;
}

/* ====== 通用条形占位 ====== */
.sk-bar {
  height: 24rpx;
  border-radius: var(--skeleton-radius, 8px);

  &--w95 {
    width: 95%;
  }
  &--w90 {
    width: 90%;
  }
  &--w60 {
    width: 60%;
  }
  &--w35 {
    width: 35%;
  }
}

/* ====== Tab 占位 ====== */
.sk-tabs {
  display: flex;
  gap: 28rpx;
  margin: 32rpx 32rpx 0;
  padding: 28rpx 32rpx 20rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  box-shadow: var(--shadow-soft);
}
.sk-tabs__item {
  width: 140rpx;
  height: 42rpx;
  border-radius: var(--skeleton-radius, 8px);
}

/* ====== 内容区占位 ====== */
.sk-content {
  margin: 0 32rpx;
  padding: 24rpx 32rpx 40rpx;
  background-color: var(--color-bg-card);
  border-radius: 0 0 var(--radius-card) var(--radius-card);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* ====== 底部操作栏占位 ====== */
.sk-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: var(--color-bg-card);
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}
.sk-footer__price {
  width: 160rpx;
  height: 48rpx;
  border-radius: var(--skeleton-radius, 8px);
}
.sk-footer__btn {
  width: 240rpx;
  height: 88rpx;
  border-radius: var(--radius-button, 12px);
}
</style>
