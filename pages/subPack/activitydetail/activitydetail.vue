<!--
  活动详情展示页 — 通过 u-parse 渲染后台富文本文章详情
  遵循 改造标准.md & 设计稿规范.md
  跟随全局主题动态切换（:style="$themeStyle"）

  旧函数映射：
    data().detail        → detail (ref)            存储文章富文本
    onLoad(option)        → onLoad + fetchDetail     设置标题 + 请求
    activityDetailFun()   → fetchDetail()            this.$myRequest → uni.$myRequest
-->
<template>
  <view class="article-page" :style="$themeStyle">
    <!-- 加载中遮罩 -->
    <RequestLoading v-if="requestLoading" text="加载中..." />

    <!-- 文章内容区 -->
    <view class="article-page__body">
      <u-parse :content="detail" />
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";

// ==================== 数据 ====================
const detail = ref("");
const requestLoading = ref(false);

// ==================== 数据请求 ====================
async function fetchDetail() {
  requestLoading.value = true;
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetArticleDetail",
      method: "POST",
    });
    detail.value = res.data?.Data || "";
  } catch (err) {
    console.error("[activitydetail] fetch err:", err);
  } finally {
    requestLoading.value = false;
  }
}

// ==================== 生命周期 ====================
onLoad((options) => {
  uni.setNavigationBarTitle({ title: options?.title || "" });
  fetchDetail();
});
</script>

<style lang="scss" scoped>
.article-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.article-page__body {
  padding: 24rpx;
}
</style>
