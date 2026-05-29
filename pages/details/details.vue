<template>
  <view class="details-page" :style="$themeStyle">
    <!-- 骨架加载 -->
    <DetailsSkeleton v-if="!pageReady" />

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
            <view class="ticket-card__price">
              <text class="ticket-card__symbol">￥</text>
              <text class="ticket-card__price-value">{{
                ticketList.SellPrice
              }}</text>
            </view>
            <text class="ticket-card__original" v-if="ticketList.MarketPrice">
              原价￥{{ ticketList.MarketPrice }}
            </text>
          </view>
        </view>
      </view>

      <!-- 内容 Tab 切换 -->
      <view class="content-section" v-if="navs.length > 0">
        <v-tabs
          v-model="activeTab"
          :tabs="navs"
          field="name"
          @change="changeTab"
          lineColor="var(--color-primary)"
          activeColor="var(--color-primary)"
          :scroll="false"
        />
        <view class="content-section__body">
          <view class="content-section__html" v-show="activeTab == 0">
            <view v-html="ticketList.Intro" />
          </view>
          <view class="content-section__html" v-show="activeTab == 1">
            <view v-html="ticketList.Tips" />
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </template>

    <!-- 底部固定操作栏 -->
    <view class="bottom-bar" v-if="pageReady">
      <view class="bottom-bar__prices">
        <view class="bottom-bar__price">
          <text class="bottom-bar__symbol">￥</text>
          <text class="bottom-bar__value">{{ ticketList.SellPrice }}</text>
        </view>
        <text class="bottom-bar__original" v-if="ticketList.MarketPrice">
          ￥{{ ticketList.MarketPrice }}
        </text>
      </view>
      <view class="bottom-bar__btn" @click="yuDing"> 立即预定 </view>
    </view>

    <!-- 风险提示 / 订票须知弹窗 -->
    <uni-popup ref="popup" mode="center" :mask-click="false">
      <view class="popup-notice">
        <scroll-view class="popup-notice__scroll" scroll-y="true">
          <view class="popup-notice__title">订票须知</view>
          <u-parse :content="notcLit" />
        </scroll-view>
        <view class="popup-notice__footer">
          <button class="popup-notice__confirm" @click="clome">
            同意并继续预定
          </button>
        </view>
      </view>
      <view class="popup-notice__close" @click="closePopup">
        <u-icon
          name="close-circle-fill"
          color="var(--color-text-secondary)"
          size="24"
        />
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import store from "../../store/index.js";
import DetailsSkeleton from "../../components/skeleton/details_skeleton.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  /** 散客预约下单页 */
  reserve: "/pages/reserve/reserve",
  /** 会员预约下单页 */
  resMember: "/pages/reserve/resMenber",
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
const borList = ref({});
const notcLit = ref("");
const mindBdi = ref(0);
const pageReady = ref(false);

// 轮播配置
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);

// ==================== Refs ====================
const popup = ref(null);

// ==================== 生命周期 ====================
onLoad((option) => {
  fetchPageData(option);
});

// ==================== 数据请求 ====================
async function fetchPageData(option) {
  try {
    // 并行请求：轮播图（不依赖参数）
    fetchBanner();

    // 解析参数
    parseRouteParams(option);

    // 写入 store
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

  if (option.mindt != undefined) {
    mindBdi.value = option.mindt;
  }

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
  const imgRes = await uni.$myRequest({
    url: "/api/Applets/AppletsGetScenicImg",
    method: "POST",
  });
  banList.value = imgRes.data.Data || [];
}

async function fetchTicketDetail() {
  const ticket = await uni.$myRequest({
    url: "/api/Applets/AppletsGetTicketById",
    data: {
      ticketID: Number(tickId.value),
      DistributorID: Number(number_people.value),
      saleticketID: Number(saleticketID.value),
      PersonDistributionUserID: mindBdi.value,
    },
    method: "POST",
  });
  ticketList.value = ticket.data.Data || {};
}

// ==================== 方法 ====================
function changeTab(index) {
  activeTab.value = index;
}

function closePopup() {
  popup.value?.close();
}

// ==================== 导航辅助 ====================

/**
 * 根据票型类型构建下单页 URL
 * TicketType == 1 → 散客预约页，否则 → 会员预约页
 */
function buildOrderUrl() {
  const query = `minpro=${mindBdi.value}`;
  const path =
    ticketList.value.TicketType == 1
      ? PAGE_ROUTES.reserve
      : PAGE_ROUTES.resMember;
  return `${path}?${query}`;
}

/** 写入下单所需的 store 状态 */
function setOrderStore(ticket = ticketList.value) {
  store.state.tickId = ticket.TicketID;
  store.state.seltck = {
    DistributorID: 0,
    saleticketID: 0,
  };
}

/** 跳转到下单页 */
function goToOrder() {
  setOrderStore();
  uni.navigateTo({ url: buildOrderUrl() });
}

// ==================== 业务方法 ====================

/** 点击"立即预定" */
function yuDing() {
  // 散客票型 → 检查是否需要弹窗展示订票须知
  if (ticketList.value.TicketType == 1 && ticketList.value.RiskTip == 1) {
    notcLit.value = ticketList.value.Tips;
    borList.value = ticketList.value;
    popup.value?.open("center");
    return;
  }
  goToOrder();
}

/** 弹窗中"同意并继续预定" */
function clome() {
  // 以弹窗中缓存的票型为准写入 store
  store.state.tickId = borList.value.TicketID;
  store.state.seltck = {
    DistributorID: 0,
    saleticketID: 0,
  };

  popup.value?.close();

  // 复用同一套导航逻辑
  uni.navigateTo({ url: buildOrderUrl() });
}
</script>

<script>
export default {
  onShareAppMessage() {
    return {
      title: "saas小程序",
      path: `/pages/details/details?tId=${this.tickId || ""}`,
    };
  },
  onShareTimeline() {
    return {
      title: "你的分享标题",
      query: `id=${this.tickId || ""}`,
    };
  },
};
</script>

<style lang="scss" scoped>
/* ============================================================
   票型详情页 — 遵循自然生态类景区设计规范
   使用 var(--color-*) 主题变量，支持多主题切换
   骨架屏已抽离至 components/skeleton/details_skeleton.vue
   ============================================================ */

.details-page {
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
.ticket-card__original {
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-text-secondary);
  text-decoration: line-through;
  opacity: 0.7;
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
  &__original {
    font-size: var(--font-size-small, 22rpx);
    color: var(--color-text-secondary);
    text-decoration: line-through;
    opacity: 0.7;
  }
  &__btn {
    flex-shrink: 0;
    min-width: 240rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    font-size: var(--font-size-body, 28rpx);
    font-weight: 600;
    color: var(--color-text-on-primary, #fff);
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

/* ====== 弹窗 ====== */
.popup-notice {
  position: relative;
  width: 560rpx;
  max-height: 800rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__scroll {
    flex: 1;
    max-height: 620rpx;
    padding: 32rpx;

    :deep(img) {
      max-width: 100%;
      border-radius: var(--radius-sm, 16rpx);
    }
  }
  &__title {
    font-size: var(--font-size-h1, 36rpx);
    font-weight: 700;
    color: var(--color-text);
    text-align: center;
    margin-bottom: 24rpx;
  }
  &__footer {
    padding: 20rpx 32rpx 32rpx;
    border-top: 1rpx solid var(--color-border-light);
    display: flex;
    justify-content: center;
  }
  &__confirm {
    width: 400rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    font-size: var(--font-size-body, 28rpx);
    font-weight: 600;
    color: var(--color-text-on-primary, #fff);
    background-color: var(--color-primary);
    border-radius: var(--radius-button);
    border: none;

    &::after {
      border: none;
    }
    &:active {
      opacity: 0.85;
      transform: scale(0.96);
    }
  }
  &__close {
    position: absolute;
    top: -56rpx;
    right: 0;
    padding: 10rpx;
    z-index: 10;
  }
}
</style>
