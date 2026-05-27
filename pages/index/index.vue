<template>
  <view class="page-index" :style="$themeStyle">
    <!-- 4 个 Tab 面板，v-show 保持挂载不销毁 -->
    <HomeContent
      v-show="currentTab === 0"
      :active="currentTab === 0"
      @ready="onHomeReady"
    />
    <OrderContent v-show="currentTab === 1" :active="currentTab === 1" />
    <TicketContent v-show="currentTab === 2" :active="currentTab === 2" />
    <MyContent v-show="currentTab === 3" :active="currentTab === 3" />

    <!-- 底部导航栏 -->
    <tab-bar :current="String(currentTab)" @change="onTabChange" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import HomeContent from "./home-content.vue";
import OrderContent from "./order-content.vue";
import TicketContent from "./ticket-content.vue";
import MyContent from "./my-content.vue";

const currentTab = ref(0);

function onTabChange(index) {
  currentTab.value = index;
  uni.pageScrollTo({ scrollTop: 0, duration: 0 });
}

function onHomeReady() {
  console.log("HomeContent 数据就绪");
}
</script>

<script>
export default {
  onShareAppMessage() {
    return { title: "小程序", path: "/pages/index/index" };
  },
};
</script>

<style>
page {
  min-height: 100vh;
  background-color: var(--color-bg);
}
</style>

<style lang="scss" scoped>
.page-index {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  font-family:
    "PingFang SC",
    Roboto,
    system-ui,
    -apple-system,
    "Helvetica Neue",
    Arial,
    sans-serif;
}
</style>
