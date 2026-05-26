<template>
  <view class="f-notice" @click="handleClick" :style="{ opacity: opacity }">
    <!-- 左侧图标 -->
    <view class="f-notice__icon">
      <u-icon :name="icon" :color="iconColor" :size="iconSize"></u-icon>
    </view>

    <!-- 纵向滚动：原生 swiper，零 JS 计时器 -->
    <swiper
      v-if="items().length"
      class="f-notice__swiper"
      vertical
      circular
      :autoplay="items().length > 1"
      :interval="speed"
      :duration="400"
      :disable-touch="true"
      @change="onSwiperChange"
    >
      <swiper-item
        v-for="(item, idx) in items()"
        :key="idx"
        class="f-notice__swiper-item"
      >
        <text class="f-notice__text">{{ item }}</text>
      </swiper-item>
    </swiper>

    <!-- 右侧箭头 -->
    <view class="f-notice__arrow" v-if="showArrow">
      <u-icon
        name="arrow-right"
        :color="iconColor"
        :size="Math.max(12, iconSize - 4)"
      ></u-icon>
    </view>
  </view>
</template>

<script>
export default {
  name: "f-notice",
  props: {
    text: { type: [String, Array], default: "" },
    speed: { type: Number, default: 3000 },
    icon: { type: String, default: "volume" },
    iconColor: { type: String, default: "#ffffff" },
    iconSize: { type: Number, default: 18 },
    showArrow: { type: Boolean, default: true },
    opacity: { type: Number, default: 0.7 },
  },
  emits: ["click"],
  data() {
    return {
      currentIndex: 0,
    };
  },
  methods: {
    items() {
      if (!this.text) return [];
      return Array.isArray(this.text)
        ? this.text.filter(Boolean)
        : [String(this.text)];
    },
    onSwiperChange(e) {
      this.currentIndex = e.detail.current;
    },
    handleClick() {
      this.$emit("click", this.currentIndex);
    },
  },
};
</script>

<style lang="scss" scoped>
/* 设计稿：高 38px→76rpx（含 border），内容区 = 76 - 4 = 72rpx */
.f-notice {
  display: flex;
  align-items: center;
  width: 100%;
  height: 76rpx;
  padding: 0 24rpx;

  background: rgba(255, 255, 255, 0.1);
  border-radius: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(24rpx);
  -webkit-backdrop-filter: blur(24rpx);

  overflow: hidden;
}

.f-notice__icon {
  flex-shrink: 0;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  z-index: 1;
}

.f-notice__swiper {
  flex: 1;
  height: 72rpx;
}

.f-notice__swiper-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.f-notice__text {
  font-size: 24rpx;
  color: #ffffff;
  line-height: 72rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.f-notice__arrow {
  flex-shrink: 0;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8rpx;
  z-index: 1;
}
</style>
