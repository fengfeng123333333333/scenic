<!--
  woo-swiper — 票码二维码轮播组件
  用于展示多张票码二维码，支持左右切换
  遵循 page-refactor-standard.md & 设计稿规范.md
  跟随全局主题动态切换
-->
<template>
  <view class="woo-swiper" :style="$themeStyle">
    <!-- 左箭头 -->
    <view
      class="woo-swiper__arrow"
      :class="{ 'woo-swiper__arrow--dim': current === 0 }"
      @click="showPre"
    >
      <u-icon
        name="arrow-left"
        color="var(--color-text-on-primary)"
        size="18"
      />
    </view>

    <!-- 轮播区 -->
    <view class="woo-swiper__body" v-if="list.length > 0">
      <swiper
        class="woo-swiper__swiper"
        circular
        :indicator-dots="false"
        :autoplay="false"
        :interval="500000"
        :style="{ height: height + 50 + 'rpx' }"
        :duration="500"
        :current="current"
        :easing-function="easing"
        @change="onChange"
      >
        <swiper-item v-for="(item, idx) in list" :key="idx">
          <view class="woo-swiper__slide">
            <!-- 有效二维码（点击放大） -->
            <view
              v-if="current === idx && item.Status !== 3"
              class="woo-swiper__qrcode"
              @click="openEnlarged(item.text)"
            >
              <u-qrcode
                ref="uqrcodeRef"
                cid="qrcode"
                :val="item.text"
                size="120"
              />
            </view>
            <!-- 已失效占位 -->
            <u-icon
              v-if="item.Status === 3"
              name="error-circle"
              color="var(--color-warning)"
              size="48"
            />
            <text class="woo-swiper__code-text">{{ item.text }}</text>
            <text class="woo-swiper__pager"
              >{{ idx + 1 }}/{{ list.length }}</text
            >
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 空数据占位 -->
    <view class="woo-swiper__body woo-swiper__body--empty" v-else>
      <u-icon name="info-circle" color="var(--color-disabled)" size="48" />
    </view>

    <!-- 右箭头 -->
    <view
      class="woo-swiper__arrow"
      :class="{ 'woo-swiper__arrow--dim': current === list.length - 1 }"
      @click="showNext"
    >
      <u-icon
        name="arrow-right"
        color="var(--color-text-on-primary)"
        size="18"
      />
    </view>

    <!-- 二维码放大遮罩 -->
    <view
      v-if="showEnlarged"
      class="woo-swiper__overlay"
      @click="closeEnlarged"
    >
      <view class="woo-swiper__overlay-card" @click.stop>
        <u-qrcode
          ref="enlargedQrcodeRef"
          cid="qrcode-enlarged"
          :val="enlargedText"
          size="240"
        />
        <text class="woo-swiper__overlay-tip">点击空白处关闭</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  showIndex: { type: Boolean, default: true },
  easing: { type: String, default: "easeInOutCubic" },
  height: { type: Number, default: 400 },
  som: { type: Boolean, default: true },
  width: { type: Number, default: 200 },
  list: {
    type: Array,
    default: () => [
      {
        src: "https://cdn.uviewui.com/uview/demo/transition/fadeUp.png",
        text: "取件码:3HDKF7B4SZ",
      },
      {
        src: "https://cdn.uviewui.com/uview/demo/transition/zoom.png",
        text: "取件码:9KSDDF84BD",
      },
    ],
  },
});

const emit = defineEmits(["tickCar"]);

const current = ref(0);
const uqrcodeRef = ref(null);
const enlargedQrcodeRef = ref(null);

// ==================== 二维码放大 ====================
const showEnlarged = ref(false);
const enlargedText = ref("");

function openEnlarged(text) {
  enlargedText.value = text;
  showEnlarged.value = true;
}

function closeEnlarged() {
  showEnlarged.value = false;
  enlargedText.value = "";
}

function onChange(e) {
  current.value = e.detail.current;
  emit("tickCar", current.value);
}

function showPre() {
  if (current.value > 0) {
    current.value--;
  }
}

function showNext() {
  if (current.value < props.list.length - 1) {
    current.value++;
  }
}
</script>

<style lang="scss" scoped>
.woo-swiper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 400rpx;
  margin-top: 30rpx;
  margin-left: 20rpx;
  margin-right: 20rpx;
  color: var(--color-text);
}

/* ====== 左右箭头 ====== */
.woo-swiper__arrow {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(61, 61, 61, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.woo-swiper__arrow:active {
  opacity: 0.88;
  transform: scale(0.96);
}
.woo-swiper__arrow--dim {
  opacity: 0.5;
}

/* ====== 轮播主体 ====== */
.woo-swiper__body {
  width: 50vw;
  height: 400rpx;
  margin: 0 auto;
}

.woo-swiper__body--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.woo-swiper__swiper {
  width: 50vw;
  height: 400rpx;
}

/* ====== 单张卡片 ====== */
.woo-swiper__slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.woo-swiper__code-text {
  display: block;
  margin: 20rpx 20rpx 20rpx 0;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text);
}

.woo-swiper__pager {
  display: inline-block;
  width: 120rpx;
  padding: 5rpx;
  border-radius: 30rpx;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: var(--font-size-xs, 22rpx);
}

/* ====== 二维码点击区 ====== */
.woo-swiper__qrcode {
  cursor: pointer;
}
.woo-swiper__qrcode:active {
  opacity: 0.88;
  transform: scale(0.96);
}

/* ====== 放大遮罩 ====== */
.woo-swiper__overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
}

.woo-swiper__overlay-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  width: 560rpx;
  height: 616rpx;
  margin-top: 80rpx;
}

.woo-swiper__overlay-tip {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}
</style>
