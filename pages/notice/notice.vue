<!--
  公告列表页 — 展示景区公告列表，点击跳转详情
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad / mounted → fetchNoticeList
              noticItem → goToDetail
-->
<template>
  <view class="notice-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <view
        class="notice-page__item"
        @click="goToDetail(item.NoticeID)"
        v-for="(item, index) in noticList"
        :key="item.NoticeID"
      >
        <text class="notice-page__item-title">{{ item.Title }}</text>
        <text class="notice-page__item-time">{{ item.CreateTime }}</text>
        <u-icon
          name="arrow-right"
          color="var(--color-text-secondary)"
          size="16"
        />
      </view>

      <Kong v-if="pageReady && noticList.length === 0" text="暂无公告" />
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  detail: "/pages/notice/noticList",
};

// ==================== 数据 ====================
const pageTitle = ref("公告");
const noticList = ref([]);
const pageReady = ref(false);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  pageTitle.value = option.str || "公告";
  fetchNoticeList();
});

// ==================== 数据请求 ====================

async function fetchNoticeList() {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetScenicNoticeList",
      method: "POST",
    });
    noticList.value = res.data.Data || [];
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================

function goToDetail(noticeId) {
  uni.navigateTo({
    url: `${PAGE_ROUTES.detail}?notic=${noticeId}`,
  });
}

// ==================== 业务方法 ====================
// （当前页无额外交互方法）
</script>

<style lang="scss" scoped>
/* ============================================================
   公告列表页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.notice-page__xxx
   ============================================================ */

.notice-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-top: 20rpx;
}

.notice-page__item {
  display: flex;
  align-items: center;
  background-color: var(--color-bg-card);
  min-height: 100rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.notice-page__item:active {
  background-color: var(--color-primary-bg-light);
}

.notice-page__item-title {
  flex: 1;
  min-width: 0;
  font-weight: 700;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-page__item-time {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
</style>
