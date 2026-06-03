<!--
  地图导览列表页（mapList.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad()    → onLoad(() => { fetchMapList() })
    tike(item)  → goToMap(item)
-->

<template>
  <view class="map-list-page" :style="$themeStyle">
    <view v-if="!pageReady" class="map-list-page__skeleton">
      <view class="skeleton-card" v-for="i in 4" :key="i">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
    </view>

    <template v-else>
      <Kong v-if="mapList.length === 0" text="暂无导览" />
      <view class="map-list-page__list" v-else>
        <view
          class="map-card"
          v-for="(item, index) in mapList"
          :key="index"
          @click="goToMap(item)"
        >
          <text class="map-card__text">{{ item.Address }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";
import Kong from "@/components/kong/kong.vue";

const PAGE_ROUTES = { mapDetail: "/pages/map1/map1" };
const { state: store } = useStore();

const mapList = ref([]);
const pageReady = ref(false);

onLoad(() => {
  fetchMapList();
});

async function fetchMapList() {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/GetMapguideList",
      method: "POST",
    });
    mapList.value = res?.data?.Data || [];
  } catch (err) {
    console.error("[mapList] 获取列表失败:", err);
  } finally {
    pageReady.value = true;
  }
}

function goToMap(item) {
  store.mapLis = item;
  uni.navigateTo({ url: PAGE_ROUTES.mapDetail });
}
</script>

<style lang="scss" scoped>
.map-list-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}

.map-list-page__skeleton {
  padding: 200rpx 10% 0;
}
.skeleton-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: var(--shadow-soft);
}
.skeleton-line {
  height: 28rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
}
.skeleton-line--title {
  width: 55%;
  height: 36rpx;
  margin-bottom: 16rpx;
}
.skeleton-line--text {
  width: 80%;
}

.map-list-page__list {
  padding: 200rpx 10% 0;
}
.map-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150rpx;
  background-color: var(--color-primary-bg-light);
  border: 1rpx solid var(--color-border-light);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-bottom: 40rpx;
}
.map-card:active {
  transform: scale(0.97);
  box-shadow: none;
}
.map-card__text {
  font-size: 36rpx;
  color: var(--color-text);
  font-weight: 500;
}
</style>
