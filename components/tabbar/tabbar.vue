<template>
  <view
    class="tabbar"
    :style="[$themeStyle, { 'padding-bottom': paddingBottomHeight + 'rpx' }]"
  >
    <view
      class="tabbar-item"
      v-for="(item, index) in tabNav"
      :key="index"
      @click="tabbarChange(index)"
    >
      <u-icon
        :name="current == index ? item.selectedIcon : item.icon"
        :color="
          current == index
            ? 'var(--color-primary)'
            : 'var(--color-text-secondary)'
        "
        size="24"
      />
      <text
        class="item-text"
        :class="{ 'item-text--active': current == index }"
        v-if="item.text"
        >{{ item.text }}</text
      >
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  current: String,
});

const emit = defineEmits(["tabbarHeight", "change"]);

const tabNav = ref([]);
const paddingBottomHeight = ref(0);

// 适配 iPhone X 以上底部安全区
uni.getSystemInfo({
  success: (res) => {
    const models = ["X", "XR", "XS", "11", "12", "13", "14", "15"];
    const isIphoneX = models.some(
      (m) => res.model.indexOf(m) !== -1 && res.model.indexOf("iPhone") !== -1,
    );
    paddingBottomHeight.value = isIphoneX ? 50 : 0;
    emit("tabbarHeight", isIphoneX ? 150 : 100);
  },
});

// Tab 导航配置 — 使用 uView 图标，颜色由主题变量控制
tabNav.value = [
  { icon: "home", selectedIcon: "home-fill", text: "首页" },
  { icon: "file-text", selectedIcon: "file-text-fill", text: "订单" },
  { icon: "coupon", selectedIcon: "coupon-fill", text: "购票" },
  { icon: "account", selectedIcon: "account-fill", text: "我的" },
];

function tabbarChange(index) {
  emit("change", index);
}
</script>

<style scoped lang="scss">
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 999 !important;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100rpx;
  background-color: var(--color-bg-card);
  border-top: 1rpx solid var(--color-border-light);
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  padding-bottom: constant(safe-area-inset-bottom) !important;
  padding-bottom: env(safe-area-inset-bottom) !important;
  box-sizing: content-box;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.item-text {
  font-size: 20rpx;
  color: var(--color-text-secondary);
  transition: color 200ms ease-in-out;
}

.item-text--active {
  color: var(--color-primary) !important;
  font-weight: 600;
}
</style>
