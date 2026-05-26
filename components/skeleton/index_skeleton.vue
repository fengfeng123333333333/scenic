<template>
  <!-- 首页全页骨架屏 —— 匹配 index.vue 各模块布局 -->
  <view class="skeleton-page" :style="$themeStyle">
    <!-- Navbar 占位 -->
    <view class="sk-navbar">
      <view class="sk-navbar__back shimmer-bg"></view>
      <view class="sk-navbar__title shimmer-bg"></view>
    </view>

    <!-- Hero 轮播占位 -->
    <view class="sk-hero">
      <view class="sk-hero__img shimmer-bg"></view>
      <view class="sk-hero__notice shimmer-bg"></view>
    </view>

    <!-- 客流提示占位 -->
    <view class="sk-passenger shimmer-bg"></view>

    <!-- 信息卡占位（3 行） -->
    <view class="sk-info-card">
      <view class="sk-row" v-for="i in 3" :key="i">
        <view class="sk-row__icon shimmer-bg"></view>
        <view class="sk-row__lines">
          <view class="sk-line sk-line--w60 shimmer-bg"></view>
          <view class="sk-line sk-line--w80 shimmer-bg"></view>
        </view>
      </view>
    </view>

    <!-- 功能入口网格占位（4×2） -->
    <view class="sk-icon-grid">
      <view class="sk-icon-item" v-for="i in 8" :key="i">
        <view class="sk-icon-item__circle shimmer-bg"></view>
        <view class="sk-icon-item__text shimmer-bg"></view>
      </view>
    </view>

    <!-- Tab 导航占位 -->
    <view class="sk-tab-nav">
      <view class="sk-tab-item shimmer-bg" v-for="i in 3" :key="i"></view>
      <view class="sk-tab-item sk-tab-item--active shimmer-bg"></view>
    </view>

    <!-- 商品卡片网格占位（2×2） -->
    <view class="sk-product-grid">
      <view class="sk-product-card" v-for="i in 4" :key="i">
        <view class="sk-product-card__img shimmer-bg"></view>
        <view class="sk-product-card__body">
          <view class="sk-line sk-line--w90 shimmer-bg"></view>
          <view class="sk-line sk-line--w50 shimmer-bg"></view>
        </view>
      </view>
    </view>

    <!-- 页脚占位 -->
    <view class="sk-footer">
      <view class="sk-line sk-line--w40 sk-line--center shimmer-bg"></view>
    </view>
  </view>
</template>

<script setup>
// 首页骨架屏 —— 无 props，纯占位组件
// 调用方通过 v-if 控制显示/隐藏
</script>

<style lang="scss" scoped>
/* ========== 骨架屏根容器 ========== */
.skeleton-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* ========== 微光扫过动画（复用） ========== */
.shimmer-bg {
  position: relative;
  overflow: hidden;
  background-color: var(--color-border-light);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.45) 35%,
      rgba(255, 255, 255, 0.55) 50%,
      rgba(255, 255, 255, 0.45) 65%,
      transparent 100%
    );
    animation: shimmer-slide 1.5s ease-in-out infinite;
  }
}

@keyframes shimmer-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* ========== Navbar 占位 ========== */
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
  border-radius: 8rpx;
}

/* ========== Hero 占位 ========== */
.sk-hero {
  position: relative;
  width: 100%;
  height: 42vw;
  max-height: 340rpx;
}

.sk-hero__img {
  width: 100%;
  height: 100%;
}

.sk-hero__notice {
  position: absolute;
  bottom: 32rpx;
  left: 32rpx;
  width: 70%;
  height: 76rpx;
  border-radius: 32rpx;
}

/* ========== 客流提示占位 ========== */
.sk-passenger {
  width: calc(100% - 64rpx);
  height: 64rpx;
  margin: 48rpx 32rpx 0;
  border-radius: var(--radius-card);
}

/* ========== 信息卡占位 ========== */
.sk-info-card {
  margin: 48rpx 32rpx 0;
  padding: 24rpx 32rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.sk-row {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  padding: 16rpx 0;
  gap: 24rpx;

  & + & {
    border-top: 1rpx solid var(--color-border-light);
  }
}

.sk-row__icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.sk-row__lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ========== 通用文本线 ========== */
.sk-line {
  height: 24rpx;
  border-radius: 8rpx;

  &--w40 {
    width: 40%;
  }

  &--w50 {
    width: 50%;
  }

  &--w60 {
    width: 60%;
  }

  &--w80 {
    width: 80%;
  }

  &--w90 {
    width: 90%;
  }

  &--center {
    margin: 0 auto;
  }
}

/* ========== 功能入口网格占位 ========== */
.sk-icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  margin: 48rpx 32rpx 0;
  padding: 40rpx 24rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.sk-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.sk-icon-item__circle {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
}

.sk-icon-item__text {
  width: 80rpx;
  height: 22rpx;
  border-radius: 8rpx;
}

/* ========== Tab 导航占位 ========== */
.sk-tab-nav {
  margin: 48rpx 32rpx 0;
  padding: 24rpx 16rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: 16rpx;
}

.sk-tab-item {
  width: 120rpx;
  height: 60rpx;
  border-radius: 9999rpx;

  &--active {
    width: 140rpx;
  }
}

/* ========== 商品卡片网格占位 ========== */
.sk-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin: 32rpx 32rpx 0;
  padding-bottom: 24rpx;
}

.sk-product-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.sk-product-card__img {
  width: 100%;
  height: 200rpx;
}

.sk-product-card__body {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ========== 页脚占位 ========== */
.sk-footer {
  margin-top: 64rpx;
  padding: 0 32rpx 48rpx;
}
</style>
