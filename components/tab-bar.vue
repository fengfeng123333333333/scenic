<template>
  <view class="tabbar" role="tablist" :style="$themeStyle">
    <view class="tabbar__inner">
      <view
        v-for="(item, idx) in itemsLocal"
        :key="idx"
        class="tabbar__item clickable"
        :aria-selected="current === idx"
        @click="onClick(idx)"
      >
        <view
          class="tabbar__icon-wrap"
          :class="{ 'tabbar__icon-wrap--active': current === idx }"
        >
          <image
            v-if="item.icon"
            :src="current === idx ? item.iconActive || item.icon : item.icon"
            class="tabbar__icon"
            mode="aspectFit"
          />
          <u-icon
            v-else
            :name="item.iconName || 'home'"
            :color="
              current === idx
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)'
            "
            size="28"
          />
        </view>
        <text class="tabbar__label" :class="{ active: current === idx }">{{
          item.label
        }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  current: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:current", "change"]);

const defaultItems = [
  { label: "首页", iconName: "home" },
  { label: "门票", iconName: "ticket" },
  { label: "会员", iconName: "vip" },
  { label: "我的", iconName: "user" },
];

const itemsLocal = computed(() =>
  props.items && props.items.length ? props.items : defaultItems,
);

function onClick(idx) {
  if (props.current === idx) return;
  emit("update:current", idx);
  emit("change", idx);
}
</script>

<style lang="scss" scoped>
/* 设计稿：高 56–64px→112–128rpx，文字 12–13px→24–26rpx */
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-card, #ffffff);
  border-top: 1rpx solid var(--color-border-light, #e6efe8);
  box-shadow: 0 -8rpx 20rpx rgba(46, 139, 87, 0.04);
  z-index: 999;
}

.tabbar__inner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 112rpx;
  padding: 8rpx 0 12rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
}

.tabbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 96rpx;
  min-height: 96rpx;
  padding: 6rpx 8rpx;
  gap: 8rpx;
  color: var(--color-text-secondary, #6b766f);
  transition: transform 120ms ease-in-out;
}

.tabbar__item:active {
  transform: scale(0.96);
}

.tabbar__icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(58, 167, 109, 0.06);
  transition: background-color 160ms ease-in-out;
}

.tabbar__icon-wrap--active {
  background: var(--color-primary, #3aa76d);
}

.tabbar__icon {
  width: 28rpx;
  height: 28rpx;
}

.tabbar__label {
  font-size: 24rpx;
  color: var(--color-text-secondary, #6b766f);
  line-height: 1;
}

.tabbar__label.active {
  color: var(--color-primary, #3aa76d);
  font-weight: 600;
}
</style>
