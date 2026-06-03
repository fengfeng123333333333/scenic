<!--
  优惠券卡片组件 — 展示单张优惠券信息，支持待使用/已使用/已过期状态
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，继承父级 $themeStyle 注入的主题值
  旧函数映射：liji → emit('liji', item)
-->
<template>
  <view class="cc-coupon" :class="{ 'cc-coupon--inactive': active !== 0 }">
    <!-- 左侧金额区 -->
    <view class="cc-coupon__body">
      <text class="cc-coupon__name" v-if="!types">{{ item.Name }}</text>
      <text class="cc-coupon__amount">{{ item.AmountDesc }}</text>
      <template v-if="!types">
        <text class="cc-coupon__label">使用期限：{{ item.PastTimeDesc }}</text>
        <text class="cc-coupon__label">使用门槛：{{ item.ThresholdDesc }}</text>
      </template>
    </view>

    <!-- 右侧操作按钮 111-->
    <view class="cc-coupon__btn" @click="handleClick">
      {{ active === 0 ? "立即使用" : active === 1 ? "已使用" : "已过期" }}
    </view>
  </view>
</template>

<script setup>
// ==================== Props ====================
const props = defineProps({
  item: { type: Object, default: () => ({}) },
  types: { type: String, default: "" },
  active: { type: Number, default: 0 },
  theme: { type: String, default: "" },
  solid: { type: String, default: "" },
  color: { type: String, default: "" },
});

// ==================== Emits ====================
const emit = defineEmits(["liji"]);

// ==================== 业务方法 ====================
function handleClick() {
  emit("liji", props.item);
}
</script>

<style lang="scss" scoped>
/* ============================================================
   优惠券卡片组件 — 遵循设计稿规范.md1111
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.cc-coupon__xxx
   ============================================================ */

.cc-coupon {
  width: 100%;
  display: table;
  border-radius: 10rpx;
  padding: 0 20rpx;
  margin-top: 22rpx;
  border: 1px solid var(--color-border-light);
  position: relative;

  // 已使用/已过期 — 灰度
  &--inactive {
    filter: grayscale(100%);
  }

  // 锯齿边效果（上）
  &::after {
    width: 40rpx;
    height: 20rpx;
    position: absolute;
    left: 460rpx;
    top: -1px;
    border-radius: 0 0 40rpx 40rpx;
    content: "";
    display: block;
    background: var(--color-bg);
    border: 1px solid var(--color-border-light);
    border-top: 0;
  }

  // 锯齿边效果（下）
  &::before {
    width: 40rpx;
    height: 20rpx;
    position: absolute;
    left: 460rpx;
    bottom: -1px;
    border-radius: 40rpx 40rpx 0 0;
    content: "";
    display: block;
    background: var(--color-bg);
    border: 1px solid var(--color-border-light);
    border-bottom: 0;
  }
}

// ==================== 左侧信息区 ====================
.cc-coupon__body {
  width: 465rpx;
  display: table;
  float: left;
  padding: 26rpx 0;
  border-style: none dotted none none;
  border-color: var(--color-border-light);
}

.cc-coupon__name {
  display: block;
  height: 50rpx;
  line-height: 30rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-primary);
}

.cc-coupon__amount {
  display: block;
  width: 100%;
  height: 30rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text);
  border-bottom: 2px dashed var(--color-border-light);
  padding-bottom: 20rpx;
}

.cc-coupon__label {
  display: block;
  width: 100%;
  height: 50rpx;
  line-height: 50rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);

  &:last-child {
    height: 30rpx;
    line-height: 30rpx;
  }
}

// ==================== 右侧按钮 ====================
.cc-coupon__btn {
  width: 146rpx;
  height: 52rpx;
  line-height: 52rpx;
  position: absolute;
  top: 50%;
  right: 26rpx;
  margin-top: -26rpx;
  text-align: center;
  border-radius: 60rpx;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  font-size: var(--font-size-caption, 24rpx);
  float: right;
}
</style>
