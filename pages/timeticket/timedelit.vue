<!--
  计时票详情页 — 票型详情 + 立即预定
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  布局对齐 details.vue 标准
  旧函数映射：onLoad → onLoad(option) + fetchPageData()
              yuDing → goToReserve
-->
<template>
  <view class="timedelit-page" :style="$themeStyle">
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
            <image class="banner__img" :src="item.ImgUrl" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="banner__mask" />
      </view>

      <!-- 票型基础信息卡 -->
      <view class="ticket-card">
        <view class="ticket-card__thumb">
          <image
            class="ticket-card__thumb-img"
            :src="ticketList.ImgUrl"
            mode="aspectFill"
          />
        </view>
        <view class="ticket-card__body">
          <text class="ticket-card__name">{{ ticketList.TicketName }}</text>
          <text class="ticket-card__desc" v-if="ticketList.Discription">
            {{ ticketList.Discription }}
          </text>
          <view class="ticket-card__prices">
            <text class="ticket-card__label">票价</text>
            <view class="ticket-card__price">
              <text class="ticket-card__symbol">￥</text>
              <text class="ticket-card__price-value">{{
                ticketList.SellPrice
              }}</text>
            </view>
            <template v-if="ticketList.TimeTicketDeposit">
              <text class="ticket-card__label ticket-card__label--deposit"
                >押金</text
              >
              <text class="ticket-card__deposit"
                >￥{{ ticketList.TimeTicketDeposit }}</text
              >
            </template>
          </view>
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
            <view v-html="ticketList.Intro" />
          </view>
          <view class="content-section__html" v-show="activeTab === 1">
            <view v-html="ticketList.Tips" />
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer" />
    </template>

    <!-- 底部固定操作栏 -->
    <view class="bottom-bar" v-if="pageReady">
      <view class="bottom-bar__prices">
        <view class="bottom-bar__price">
          <text class="bottom-bar__symbol">￥</text>
          <text class="bottom-bar__value">{{ ticketList.SellPrice }}</text>
        </view>
        <view class="bottom-bar__deposit" v-if="ticketList.TimeTicketDeposit">
          <text class="bottom-bar__deposit-label">押金</text>
          <text class="bottom-bar__deposit-value"
            >￥{{ ticketList.TimeTicketDeposit }}</text
          >
        </view>
      </view>
      <view class="bottom-bar__btn" @click="goToReserve"> 立即预定 </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import store from "@/store/index.js";
import PageLoading from "@/components/loading/page-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  reserve: "/pages/timeticket/timereserve",
};

// ==================== 数据 ====================
const banList = ref([]);
const ticketList = ref({});
const navs = ref([
  { name: "图文详情", id: 0, disabled: true },
  { name: "预定须知", id: 1, disabled: true },
]);
const activeTab = ref(0);
const tickId = ref("");
const number_people = ref(0);
const saleticketID = ref(0);
const pageReady = ref(false);

// 轮播配置
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  fetchPageData(option);
});

// ==================== 数据请求 ====================

async function fetchPageData(option) {
  try {
    // 并行请求：轮播图
    fetchBanner();

    // 解析参数 + 写入 store
    parseRouteParams(option);
    store.state.tickId = tickId.value;
    store.state.seltck = {
      DistributorID: Number(number_people.value),
      saleticketID: Number(saleticketID.value),
    };

    // 获取票型详情
    await fetchTicketDetail();
  } finally {
    pageReady.value = true;
  }
}

function parseRouteParams(option) {
  tickId.value = option.tId;

  // 扫码进入场景解析
  if (tickId.value == undefined) {
    const res = decodeURIComponent(option.scene);
    const strArry = res.split("=");
    number_people.value = strArry[2].split("&")[0];
    tickId.value = strArry[1].split("&")[0];
    saleticketID.value = strArry[3];
  }
}

async function fetchBanner() {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetScenicImg",
    method: "POST",
  });
  banList.value = res.data.Data || [];
}

async function fetchTicketDetail() {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetTimeTicketById",
    data: {
      ticketID: Number(tickId.value),
      DistributorID: Number(number_people.value),
      saleticketID: Number(saleticketID.value),
    },
    method: "POST",
  });
  ticketList.value = res.data.Data || {};
}

// ==================== 方法 ====================
function changeTab(index) {
  activeTab.value = index;
}

// ==================== 导航辅助 ====================

function goToReserve() {
  uni.navigateTo({ url: PAGE_ROUTES.reserve });
}

// ==================== 业务方法 ====================
// （当前页无额外交互方法）
</script>

<script>
export default {
  onShareAppMessage() {
    return {
      title: "saas小程序",
      path: `/pages/timeticket/timedelit?tId=${this.tickId || ""}`,
    };
  },
  onShareTimeline() {
    return {
      title: "计时票详情",
      query: `id=${this.tickId || ""}`,
    };
  },
};
</script>

<style lang="scss" scoped>
/* ============================================================
   计时票详情页 — 对齐 details.vue 布局标准
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.banner__xxx / .ticket-card__xxx / .bottom-bar__xxx
   ============================================================ */

.timedelit-page {
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

/* ====== 票型信息卡 ====== */
.ticket-card {
  display: flex;
  margin: -56rpx 32rpx 0;
  padding: 28rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  position: relative;
  z-index: 2;
  gap: 24rpx;
}
.ticket-card__thumb {
  flex-shrink: 0;
  width: 200rpx;
  height: 156rpx;
  border-radius: var(--radius-sm, 16rpx);
  overflow: hidden;
}
.ticket-card__thumb-img {
  width: 100%;
  height: 100%;
  display: block;
}
.ticket-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.ticket-card__name {
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
.ticket-card__desc {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  margin-top: 6rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ticket-card__prices {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-top: 10rpx;
}
.ticket-card__price {
  display: flex;
  align-items: baseline;
  color: var(--color-primary);
}
.ticket-card__symbol {
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
}
.ticket-card__price-value {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1;
}
.ticket-card__label {
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-text-secondary);

  &--deposit {
    margin-left: 8rpx;
  }
}
.ticket-card__deposit {
  font-size: var(--font-size-small, 22rpx);
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
  :deep(p) {
    margin-bottom: 12rpx;
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

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
  }
  &__price {
    display: flex;
    align-items: baseline;
    color: var(--color-primary);
  }
  &__symbol {
    font-size: var(--font-size-caption, 24rpx);
    font-weight: 600;
  }
  &__value {
    font-size: 44rpx;
    font-weight: 700;
    line-height: 1;
  }
  &__deposit {
    display: flex;
    align-items: baseline;
    gap: 6rpx;
  }
  &__deposit-label {
    font-size: var(--font-size-small, 22rpx);
    color: var(--color-text-secondary);
  }
  &__deposit-value {
    font-size: var(--font-size-small, 22rpx);
    color: var(--color-text-secondary);
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
