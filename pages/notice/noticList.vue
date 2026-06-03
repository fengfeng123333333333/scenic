<!--
  公告详情页 — 展示公告标题、时间、正文内容
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(option) + fetchNoticeDetail
-->
<template>
  <view class="notic-detail-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <view class="notic-detail-page__header">
        <text class="notic-detail-page__title">{{ detail.Title }}</text>
        <text class="notic-detail-page__time">{{ detail.CreateTime }}</text>
      </view>
      <view class="notic-detail-page__divider" />
      <view class="notic-detail-page__content">
        <f-parse :content="detail.Content" />
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
const detail = ref({});
const pageReady = ref(false);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  fetchNoticeDetail(option);
});

// ==================== 数据请求 ====================

async function fetchNoticeDetail(option) {
  try {
    const res = await uni.$myRequest({
      url: `/api/Applets/AppletsGetScenicNoticeInfo?NoticeID=${Number(option.notic)}`,
      method: "POST",
    });
    detail.value = res.data.Data || {};
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
   公告详情页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.notic-detail-page__xxx
   ============================================================ */

.notic-detail-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 32rpx;
}

.notic-detail-page__header {
  text-align: center;
}

.notic-detail-page__title {
  font-weight: 700;
  font-size: var(--font-size-h2, 30rpx);
  color: var(--color-text);
  line-height: 1.5;
}

.notic-detail-page__time {
  display: block;
  margin-top: 16rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.notic-detail-page__divider {
  height: 1rpx;
  background-color: var(--color-border-light);
  margin: 24rpx 0;
}

.notic-detail-page__content {
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
