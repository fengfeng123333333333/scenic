<!--
  停车缴费成功页 — 展示支付成功信息
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(options)
-->
<template>
  <view class="pay-success-page" :style="$themeStyle">
    <!-- 成功图标 -->
    <view class="pay-success-page__icon">
      <text class="pay-success-page__check">✓</text>
    </view>

    <!-- 核心提示 -->
    <text class="pay-success-page__title">支付成功</text>
    <text class="pay-success-page__info">车牌号：{{ plateNumber }}</text>
    <text class="pay-success-page__info">订单号：{{ orderId }}</text>
    <text class="pay-success-page__info">缴费金额：¥{{ amount }}</text>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// ==================== 数据 ====================
const plateNumber = ref("");
const orderId = ref("");
const amount = ref("");

// ==================== 生命周期 ====================
onLoad((options) => {
  plateNumber.value = options.PlateNo || "";
  orderId.value = options.OrderID || "";
  amount.value = options.TotalMoney || "";
});
</script>

<style lang="scss" scoped>
/* ============================================================
   停车缴费成功页 — 遵循设计稿规范.md
   BEM 命名：.pay-success-page__xxx
   ============================================================ */

.pay-success-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg-card);
  padding-top: 230rpx;
}

.pay-success-page__icon {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #07c160, #09be95);
  margin-bottom: 30rpx;
}

.pay-success-page__check {
  font-size: 50rpx;
  color: var(--color-text-on-primary);
  font-weight: bold;
}

.pay-success-page__title {
  font-size: var(--font-size-h1, 36rpx);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20rpx;
}

.pay-success-page__info {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
  margin-bottom: 10rpx;
}
</style>
