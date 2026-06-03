<!--
  线路详情页 — 展示线路轮播图与介绍
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(option) + fetchRouteDetail
-->
<template>
  <view class="delte-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- Banner 轮播 -->
      <view class="delte-page__banner">
        <swiper
          class="delte-page__swiper"
          circular
          :indicator-dots="banList.length > 1"
          :autoplay="autoplay"
          :interval="interval"
          :duration="duration"
        >
          <swiper-item v-for="(item, index) in banList" :key="index">
            <image
              class="delte-page__banner-img"
              :src="item"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 线路介绍 -->
      <view class="delte-page__content">
        <view v-html="detail.Intro" />
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";

// ==================== 页面路由常量 ====================
// （当前页无跳转需求）

// ==================== 数据 ====================
const banList = ref([]);
const detail = ref({});
const pageReady = ref(false);

// 轮播配置
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  fetchRouteDetail(option);
});

// ==================== 数据请求 ====================

async function fetchRouteDetail(option) {
  try {
    const res = await uni.$myRequest({
      url: `/api/Applets/AppletsGetAppletsRouteInfo?RouteID=${Number(option.ID)}`,
      method: "POST",
    });
    const data = res.data.Data || {};
    banList.value = data.LoopImgUrlList || [];
    detail.value = data;
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================
// （当前页无导航需求）

// ==================== 业务方法 ====================
// （当前页无交互方法）
</script>

<style lang="scss" scoped>
/* ============================================================
   线路详情页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.delte-page__xxx
   ============================================================ */

.delte-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* Banner */
.delte-page__banner {
  width: 100%;
}

.delte-page__swiper {
  height: 400rpx;
  overflow: hidden;
}

.delte-page__banner-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* 内容区 */
.delte-page__content {
  padding: 32rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  line-height: 1.75;

  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16rpx 0;
    border-radius: var(--radius-sm, 16rpx);
  }
}
</style>
