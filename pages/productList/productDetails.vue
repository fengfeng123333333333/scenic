<!--
  商品详情页（productDetails.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad(option)    → onLoad((option) => { parseRouteParams + fetchDetail })
    mai()             → goToOrder()
-->

<template>
  <view class="product-detail-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="product-detail-page__skeleton">
      <view class="skeleton-banner" />
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--price" />
        <view class="skeleton-line skeleton-line--title" />
      </view>
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- Banner 轮播 -->
      <view class="product-detail-page__banner">
        <swiper
          class="product-detail-page__swiper"
          circular
          :indicator-dots="true"
          :autoplay="true"
          :interval="3000"
          :duration="500"
        >
          <swiper-item
            v-for="(item, index) in detail.LoopImgUrlList"
            :key="index"
          >
            <image
              class="product-detail-page__swiper-img"
              :src="item"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 商品信息卡 -->
      <view class="product-detail-page__info">
        <view class="info-card__prices">
          <text class="info-card__price">
            <text class="info-card__symbol">￥</text>
            {{ detail.SellPrice }}
          </text>
          <text class="info-card__original">￥{{ detail.MarketPrice }}</text>
        </view>
        <text class="info-card__name">{{ detail.GoodsName }}</text>
      </view>

      <!-- 商家信息 -->
      <view class="product-detail-page__merchant">
        <view class="merchant-card">
          <text class="merchant-card__title">商家信息</text>
          <text class="merchant-card__name">{{
            detail.MerchantInfo?.MerchantName
          }}</text>

          <view class="merchant-card__row">
            <u-icon name="clock" color="var(--color-primary)" size="14" />
            <text class="merchant-card__label">营业时间:</text>
            <text class="merchant-card__value">{{
              detail.MerchantInfo?.OpeningHours
            }}</text>
          </view>

          <view class="merchant-card__row">
            <u-icon name="map" color="var(--color-primary)" size="14" />
            <text class="merchant-card__value">{{
              detail.MerchantInfo?.Address
            }}</text>
          </view>
        </view>
      </view>

      <!-- 内容 Tab -->
      <view class="product-detail-page__tabs">
        <v-tabs
          v-model="activeTab"
          :tabs="navs"
          field="name"
          lineColor="var(--color-primary)"
          activeColor="var(--color-primary)"
          :scroll="false"
        />
        <view class="tab-body" v-show="activeTab == 0">
          <f-parse :content="detail.Intro || ''" />
        </view>
        <view class="tab-body" v-show="activeTab == 1">
          <f-parse :content="detail.Tips || ''" />
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="product-detail-page__spacer" />
    </template>

    <!-- ==================== 底部操作栏 ==================== -->
    <view class="bottom-bar" v-if="pageReady">
      <view class="bottom-bar__prices">
        <view class="bottom-bar__price">
          <text class="bottom-bar__symbol">￥</text>
          <text class="bottom-bar__value">{{ detail.SellPrice }}</text>
        </view>
        <text class="bottom-bar__original">￥{{ detail.MarketPrice }}</text>
      </view>
      <view class="bottom-bar__btn" @click="goToOrder"> 立即预定 </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  orderProd: "/pages/productList/orderProd",
};

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 数据 ====================
const detail = ref({ MerchantInfo: {} });
const activeTab = ref(0);
const navs = ref([{ name: "商品详情" }, { name: "购买须知" }]);
const pageReady = ref(false);

// ==================== 生命周期 ====================
onLoad((option) => {
  const params = parseRouteParams(option);
  fetchDetail(params);
});

// ==================== 路由参数解析 ====================
function parseRouteParams(option) {
  try {
    return JSON.parse(option?.currentSite || "{}");
  } catch {
    return {};
  }
}

// ==================== 数据请求 ====================
async function fetchDetail(site) {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetGoodsById",
      method: "POST",
      data: {
        GoodsID: site.GoodsID,
        MerchantID: site.MerchantID,
        ShopID: site.ShopID,
      },
    });
    detail.value = res?.data?.Data || { MerchantInfo: {} };
  } catch (err) {
    console.error("[productDetails] 获取详情失败:", err);
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================
function goToOrder() {
  store.prderProd = detail.value;
  uni.navigateTo({ url: PAGE_ROUTES.orderProd });
}
</script>

<style lang="scss" scoped>
/* ============================================================
   商品详情页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.product-detail-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

// ==================== 骨架屏 ====================
.product-detail-page__skeleton {
  padding: 0 32rpx;
}

.skeleton-banner {
  width: 100%;
  height: 400rpx;
  background: var(--color-skeleton-base);
}

.skeleton-card {
  margin-top: 24rpx;
  padding: 32rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.skeleton-line {
  height: 24rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-bottom: 20rpx;
}

.skeleton-line--price {
  width: 35%;
  height: 36rpx;
}

.skeleton-line--title {
  width: 65%;
  height: 30rpx;
}

.skeleton-line--text {
  width: 100%;
}

.skeleton-line:last-child {
  width: 50%;
  margin-bottom: 0;
}

// ==================== Banner ====================
.product-detail-page__banner {
  width: 100%;
}

.product-detail-page__swiper {
  height: 400rpx;
}

.product-detail-page__swiper-img {
  width: 100%;
  height: 100%;
  display: block;
}

// ==================== 商品信息卡 ====================
.product-detail-page__info {
  padding: 28rpx 32rpx;
  background-color: var(--color-bg-card);
}

.info-card__prices {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.info-card__price {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--color-primary);
}

.info-card__symbol {
  font-size: 28rpx;
}

.info-card__original {
  font-size: 28rpx;
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

.info-card__name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 20rpx;
}

// ==================== 商家信息 ====================
.product-detail-page__merchant {
  padding: 20rpx 32rpx;
  background-color: var(--color-bg);
}

.merchant-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: 28rpx;
}

.merchant-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16rpx;
}

.merchant-card__name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20rpx;
}

.merchant-card__row {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: var(--color-text);
}

.merchant-card__icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.merchant-card__label {
  color: var(--color-text-secondary);
  margin: 0 8rpx;
}

.merchant-card__value {
  color: var(--color-text-secondary);
}

// ==================== 内容 Tab ====================
.product-detail-page__tabs {
  margin-top: 20rpx;
}

.tab-body {
  min-height: 600rpx;
  padding: 28rpx 32rpx 128rpx;
  background-color: var(--color-bg-card);
}

// ==================== 底部占位 ====================
.product-detail-page__spacer {
  height: 160rpx;
}

// ==================== 底部操作栏 ====================
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
}

.bottom-bar__prices {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.bottom-bar__price {
  display: flex;
  align-items: baseline;
  color: var(--color-primary);
}

.bottom-bar__symbol {
  font-size: 24rpx;
  font-weight: 600;
}

.bottom-bar__value {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.bottom-bar__original {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

.bottom-bar__btn {
  flex-shrink: 0;
  min-width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-on-primary);
  background-color: var(--color-primary);
  border-radius: var(--radius-button);

  &:active {
    opacity: 0.88;
    transform: scale(0.96);
  }
}
</style>
