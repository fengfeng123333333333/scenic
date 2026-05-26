<template>
  <cover-view
    class="tabbar"
    :style="[$themeStyle, { 'padding-bottom': paddingBottomHeight + 'rpx' }]"
  >
    <cover-view
      class="tabbar-item"
      v-for="(item, index) in tabNav"
      :key="index"
      @click="tabbarChange(item.pagePath)"
    >
      <cover-image
        class="item-img"
        :src="current == index ? item.selectedIconPath : item.iconPath"
      ></cover-image>
      <cover-view
        class="item-text"
        :class="{ 'item-text--active': current == index }"
        v-if="item.text"
        >{{ item.text }}</cover-view
      >
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  current: String,
});

const emit = defineEmits(["tabbarHeight"]);

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

// Tab 导航配置
tabNav.value = [
  {
    pagePath: "/pages/index/index",
    iconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701Home2.png",
    selectedIconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701Home1.png",
    text: "首页",
  },
  {
    pagePath: "/pages/order/order",
    iconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701Order2.png",
    selectedIconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701Order1.png",
    text: "订单",
  },
  {
    pagePath: "/pages/ticket/ticket",
    iconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701Ticket2.png",
    selectedIconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701Ticket1.png",
    text: "购票",
  },
  {
    pagePath: "/pages/my/my",
    iconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701My2.png",
    selectedIconPath:
      "https://saas888.huibaitech.com/images/upload/applets/0701My1.png",
    text: "我的",
  },
];

function tabbarChange(path) {
  uni.reLaunch({ url: path });
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
  z-index: 1 !important;
}

.item-img {
  margin-bottom: 4rpx;
  width: 46rpx;
  height: 46rpx;
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
