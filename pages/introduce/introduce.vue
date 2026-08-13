<!--
  景区简介页 — 展示景区详细介绍（富文本内容）
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(option) + fetchScenicInfo()
-->
<template>
  <view class="introduce-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- 空状态 -->
      <Kong v-if="!description" text="暂无简介信息" />
      <!-- 简介正文 -->
      <view v-else class="introduce-page__content">
        <f-parse :content="description" />
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
// （当前页无跳转需求，预留扩展）

// ==================== 数据 ====================
const pageTitle = ref("简介");
const description = ref("");
const pageReady = ref(false);

// ==================== Refs ====================
// （当前页无 DOM 引用需求，预留扩展）

// ==================== 生命周期 ====================
onLoad((option) => {
  // 保留旧逻辑：从路由参数获取景区名称
  if (option.str) {
    pageTitle.value = option.str;
  }
  fetchScenicInfo();
});

// ==================== 数据请求 ====================

/** 获取景区简介信息 */
async function fetchScenicInfo() {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetScenicInfo",
      method: "POST",
    });
    const data = res.data.Data || {};
    description.value = data.Description || "";
    // 如接口返回景区名称，同步更新标题
    if (data.Name) {
      pageTitle.value = data.Name;
    }
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================
// （当前页无导航需求，预留扩展）

// ==================== 业务方法 ====================
// （当前页无交互方法，预留扩展）
</script>

<style lang="scss" scoped>
/* ============================================================
   景区简介页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.introduce-page__xxx
   ============================================================ */

.introduce-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.introduce-page__content {
  padding: 32rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  line-height: 1.75;
}

/* f-parse 富文本内部样式穿透 */
:deep(.introduce-page__content image) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-card, 28rpx);
}
</style>
