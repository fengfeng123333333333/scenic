<!--
  紧急救援页 — 一键拨打 110/119/120
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：makePhoneCall → makeCall
-->
<template>
  <view class="rescue-page" :style="$themeStyle">
    <view class="rescue-page__body">
      <text class="rescue-page__title">紧急电话一键拨打</text>

      <view class="rescue-page__buttons">
        <!-- 110 警察 -->
        <view class="rescue-btn rescue-btn--police" @click="makeCall('110')">
          <image
            class="rescue-btn__icon"
            src="https://saas888.huibaitech.com/images/upload/applets/J1.png"
            mode="aspectFit"
          />
          <text class="rescue-btn__num">110</text>
        </view>

        <!-- 119 火警 -->
        <view class="rescue-btn rescue-btn--fire" @click="makeCall('119')">
          <image
            class="rescue-btn__icon"
            src="https://saas888.huibaitech.com/images/upload/applets/J2.png"
            mode="aspectFit"
          />
          <text class="rescue-btn__num">119</text>
        </view>

        <!-- 120 急救 -->
        <view class="rescue-btn rescue-btn--medical" @click="makeCall('120')">
          <image
            class="rescue-btn__icon"
            src="https://saas888.huibaitech.com/images/upload/applets/J3.png"
            mode="aspectFit"
          />
          <text class="rescue-btn__num">120</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// ==================== 业务方法 ====================

function makeCall(phoneNumber) {
  uni.makePhoneCall({
    phoneNumber,
    fail: (err) => {
      console.error("[rescue] 拨打失败:", err);
    },
  });
}
</script>

<style lang="scss" scoped>
/* ============================================================
   紧急救援页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.rescue-page__xxx / .rescue-btn__xxx
   ============================================================ */

.rescue-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.rescue-page__body {
  padding: 40rpx 32rpx;
}

.rescue-page__title {
  display: block;
  font-size: var(--font-size-subtitle, 32rpx);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 40rpx;
}

// ==================== 按钮组 ====================
.rescue-page__buttons {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: var(--color-bg-card);
  padding: 48rpx 20rpx;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

// ==================== 圆形按钮 ====================
.rescue-btn {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition:
    transform 160ms ease,
    opacity 160ms ease;

  &:active {
    transform: scale(0.93);
    opacity: 0.85;
  }

  &--police {
    background: linear-gradient(
      135deg,
      var(--color-primary),
      var(--color-primary-dark)
    );
  }

  &--fire {
    background: linear-gradient(
      135deg,
      var(--color-danger),
      var(--color-danger-dark, var(--color-danger))
    );
  }

  &--medical {
    background: linear-gradient(
      135deg,
      var(--color-accent),
      var(--color-accent-dark, var(--color-accent))
    );
  }
}

.rescue-btn__icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 8rpx;
}

.rescue-btn__num {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 700;
  color: var(--color-text-on-primary);
}
</style>
