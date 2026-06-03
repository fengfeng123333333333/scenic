<!--
  场馆信息页 — 展示场馆简介（富文本）
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad + fetchVenueInfo
-->
<template>
  <view class="brief-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <view class="brief-page__content">
        <f-parse :content="description" />
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
const description = ref("");
const pageReady = ref(false);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad(() => {
  fetchVenueInfo();
});

// ==================== 数据请求 ====================

async function fetchVenueInfo() {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetCinemaAppletsMain",
      method: "POST",
    });
    const data = res.data.Data || {};
    description.value = data.Descripe || "";
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
   场馆信息页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.brief-page__xxx
   ============================================================ */

.brief-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.brief-page__content {
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
