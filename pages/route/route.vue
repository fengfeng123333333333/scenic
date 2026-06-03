<!--
  线路列表页 — 按分类展示景区游览线路
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad + fetchRouteTypes
              changeTab → onTabChange / roust → fetchRouteList
              rott → goToDetail
-->
<template>
  <view class="route-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <f-tabs
        v-model="activeTab"
        :tabs="classification"
        field="Name"
        :scroll="false"
        lineColor="var(--color-primary)"
        activeColor="var(--color-primary)"
        @change="onTabChange"
      />

      <Kong v-if="pageReady && lisMon.length === 0" text="暂无线路" />
      <view
        class="route-page__item"
        v-for="(item, index) in lisMon"
        @click="goToDetail(item)"
        :key="index"
      >
        <image
          class="route-page__item-img"
          :src="item.LoopImgUrl"
          mode="aspectFill"
        />
        <text class="route-page__item-title">{{ item.Title }}</text>
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
const PAGE_ROUTES = {
  detail: "/pages/route/delte",
};

// ==================== 数据 ====================
const pageTitle = ref("线路");
const classification = ref([]);
const activeTab = ref(0);
const lisMon = ref([]);
const pageReady = ref(false);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  pageTitle.value = option.str || "线路";
  fetchRouteTypes();
});

// ==================== 数据请求 ====================

async function fetchRouteTypes() {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/GetAppletsRouteType",
      method: "POST",
    });
    classification.value = res.data.Data || [];

    if (classification.value.length > 0) {
      await fetchRouteList(classification.value[0].ID);
    }
  } finally {
    pageReady.value = true;
  }
}

async function fetchRouteList(typeId) {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetAppletsRouteList",
    data: { RouteTypeID: typeId },
    method: "POST",
  });
  lisMon.value = res.data.Data || [];
}

// ==================== 导航辅助 ====================

function goToDetail(item) {
  uni.navigateTo({ url: `${PAGE_ROUTES.detail}?ID=${item.ID}` });
}

// ==================== 业务方法 ====================

function onTabChange(index) {
  if (classification.value[index]) {
    fetchRouteList(classification.value[index].ID);
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   线路列表页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.route-page__xxx
   ============================================================ */

.route-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.route-page__item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid var(--color-border-light);
  padding: 20rpx 30rpx;
  background-color: var(--color-bg-card);

  &:active {
    background-color: var(--color-primary-bg-light);
  }
}

.route-page__item-img {
  width: 300rpx;
  height: 160rpx;
  border-radius: var(--radius-sm, 16rpx);
  flex-shrink: 0;
}

.route-page__item-title {
  margin-left: 20rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
