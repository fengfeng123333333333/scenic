<!--
  节目详情页 — 节目信息 + 图文详情/预定须知 + 立即购买
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  布局对齐 details.vue 标准
  旧函数映射：onLoad → onLoad + fetchShowDetail
              yuDing → goToSeatOrder
-->
<template>
  <view class="seatcal-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- Banner 轮播 -->
      <view class="banner">
        <swiper
          class="banner__swiper"
          circular
          :indicator-dots="banList.length > 1"
          :autoplay="autoplay"
          :interval="interval"
          :duration="duration"
        >
          <swiper-item v-for="(item, index) in banList" :key="index">
            <image class="banner__img" :src="item" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="banner__mask" />
      </view>

      <!-- 节目信息卡 -->
      <view class="show-card">
        <view class="show-card__body">
          <text class="show-card__name">{{ showInfo.ShowName }}</text>
          <text class="show-card__name-en" v-if="showInfo.ShowNameEn">{{
            showInfo.ShowNameEn
          }}</text>
        </view>
      </view>

      <!-- 内容 Tab 切换 -->
      <view class="content-section" v-if="navs.length > 0">
        <f-tabs
          v-model="activeTab"
          :tabs="navs"
          field="name"
          @change="changeTab"
          lineColor="var(--color-primary)"
          activeColor="var(--color-primary)"
          :scroll="false"
        />
        <view class="content-section__body">
          <view class="content-section__html" v-show="activeTab === 0">
            <f-parse :content="showInfo.ShowDescripe" />
          </view>
          <view class="content-section__html" v-show="activeTab === 1">
            <f-parse :content="showInfo.BuyTips" />
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer" />
    </template>

    <!-- 底部固定操作栏 -->
    <view class="bottom-bar" v-if="pageReady">
      <view class="bottom-bar__info">
        <text class="bottom-bar__name">{{ showInfo.ShowName }}</text>
      </view>
      <view class="bottom-bar__btn" @click="goToSeatOrder"> 立即购买 </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  seat: "/pages/seat/seat",
};

// ==================== 数据 ====================
const banList = ref([]);
const showInfo = ref({});
const navs = ref([
  { name: "图文详情", id: 0, disabled: true },
  { name: "预定须知", id: 1, disabled: true },
]);
const activeTab = ref(0);
const pageReady = ref(false);

// 轮播配置
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  fetchShowDetail(option);
});

// ==================== 数据请求 ====================

async function fetchShowDetail(option) {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetShowsById",
      data: { ShowID: option.id },
      method: "POST",
    });
    const data = res.data.Data || {};
    showInfo.value = data;
    banList.value = data.LoopImgList || [];
  } finally {
    pageReady.value = true;
  }
}

// ==================== 方法 ====================
function changeTab(index) {
  activeTab.value = index;
}

// ==================== 导航辅助 ====================

function goToSeatOrder() {
  uni.navigateTo({
    url: `${PAGE_ROUTES.seat}?id=${showInfo.value.ID}&item=${showInfo.value.ShowNameEn || ""}&scor=${showInfo.value.Score || ""}`,
  });
}

// ==================== 业务方法 ====================
// （当前页无额外交互方法）
</script>

<style lang="scss" scoped>
/* ============================================================
   节目详情页 — 对齐 details.vue 布局标准
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.banner__xxx / .show-card__xxx / .bottom-bar__xxx
   ============================================================ */

.seatcal-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* ====== Banner ====== */
.banner {
  position: relative;
  width: 100%;
}
.banner__swiper {
  height: 420rpx;
}
.banner__img {
  width: 100%;
  height: 100%;
  display: block;
}
.banner__mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 35%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    var(--color-bg) 100%
  );
  pointer-events: none;
}

/* Swiper 指示点 */
:deep(.banner__swiper .wx-swiper-dot),
:deep(.banner__swiper .uni-swiper-dot) {
  width: 10rpx !important;
  height: 10rpx !important;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.55) !important;
}
:deep(.banner__swiper .wx-swiper-dot-active),
:deep(.banner__swiper .uni-swiper-dot-active) {
  width: 24rpx !important;
  border-radius: 5rpx !important;
  background-color: var(--color-bg-card) !important;
}

/* ====== 节目信息卡 ====== */
.show-card {
  margin: -56rpx 32rpx 0;
  padding: 28rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  position: relative;
  z-index: 2;
}
.show-card__body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.show-card__name {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 700;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.show-card__name-en {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

/* ====== 内容区 ====== */
.content-section {
  margin: 32rpx 32rpx 0;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.content-section__body {
  padding: 0 32rpx 32rpx;
}
.content-section__html {
  min-height: 500rpx;
  padding-top: 16rpx;
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

/* ====== 底部占位 ====== */
.bottom-spacer {
  height: 200rpx;
}

/* ====== 底部操作栏 ====== */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: var(--color-bg-card);
  box-shadow: var(--shadow-soft);
  z-index: 100;

  &__info {
    flex: 1;
    min-width: 0;
  }
  &__name {
    font-size: var(--font-size-body, 28rpx);
    font-weight: 600;
    color: var(--color-text);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
  }
  &__btn {
    flex-shrink: 0;
    min-width: 240rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    font-size: var(--font-size-body, 28rpx);
    font-weight: 600;
    color: var(--color-text-on-primary);
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-primary-dark, var(--color-primary)) 100%
    );
    border-radius: var(--radius-button);
    padding: 0 48rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);

    &:active {
      opacity: 0.88;
      transform: scale(0.96);
    }
  }
}
</style>
