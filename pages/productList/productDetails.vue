<!--
  商品详情页（productDetails.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  布局参考：pages/details/details.vue
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换
-->

<template>
  <view class="detail-page" :style="$themeStyle">
    <view v-if="!pageReady" class="detail-page__skeleton">
      <view class="skeleton-banner" />
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--price" />
        <view class="skeleton-line skeleton-line--title" />
      </view>
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text skeleton-line--short" />
      </view>
    </view>

    <template v-else>
      <view class="banner">
        <swiper
          class="banner__swiper"
          circular
          :indicator-dots="(detail.LoopImgUrlList || []).length > 1"
          :autoplay="true"
          :interval="3000"
          :duration="500"
        >
          <swiper-item
            v-for="(item, index) in detail.LoopImgUrlList"
            :key="index"
          >
            <image class="banner__img" :src="item" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="banner__mask" />
      </view>

      <view class="info-card">
        <view class="info-card__thumb">
          <image
            class="info-card__thumb-img"
            :src="
              detail.ImgUrl ||
              (detail.LoopImgUrlList && detail.LoopImgUrlList[0])
            "
            mode="aspectFill"
          />
        </view>
        <view class="info-card__body">
          <text class="info-card__name">{{ detail.GoodsName }}</text>
          <view class="info-card__prices">
            <view class="info-card__price">
              <text class="info-card__symbol">￥</text>
              <text class="info-card__price-value">{{ detail.SellPrice }}</text>
            </view>
            <text class="info-card__original" v-if="detail.MarketPrice"
              >原价￥{{ detail.MarketPrice }}</text
            >
          </view>
        </view>
      </view>

      <view class="merchant-section" v-if="detail.MerchantInfo?.MerchantName">
        <view class="merchant-section__title">商家信息</view>
        <view class="merchant-card">
          <text class="merchant-card__name">{{
            detail.MerchantInfo.MerchantName
          }}</text>
          <view
            class="merchant-card__row"
            v-if="detail.MerchantInfo.OpeningHours"
          >
            <u-icon name="clock" color="var(--color-primary)" size="18" />
            <text>营业时间：{{ detail.MerchantInfo.OpeningHours }}</text>
          </view>
          <view class="merchant-card__row" v-if="detail.MerchantInfo.Address">
            <u-icon name="map" color="var(--color-primary)" size="18" />
            <text>{{ detail.MerchantInfo.Address }}</text>
          </view>
        </view>
      </view>

      <view class="content-section">
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
          <view class="content-section__html" v-show="activeTab == 0">
            <f-parse :content="detail.Intro || ''" />
          </view>
          <view class="content-section__html" v-show="activeTab == 1">
            <f-parse :content="detail.Tips || ''" />
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </template>

    <view class="bottom-bar" v-if="pageReady">
      <view class="bottom-bar__prices">
        <view class="bottom-bar__price">
          <text class="bottom-bar__symbol">￥</text>
          <text class="bottom-bar__value">{{ detail.SellPrice }}</text>
        </view>
        <text class="bottom-bar__original" v-if="detail.MarketPrice"
          >￥{{ detail.MarketPrice }}</text
        >
      </view>
      <view class="bottom-bar__btn" @click="goToOrder"> 立即预定 </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";

const PAGE_ROUTES = { orderProd: "/pages/productList/orderProd" };
const { state: store } = useStore();

const detail = ref({ MerchantInfo: {} });
const activeTab = ref(0);
const navs = ref([{ name: "商品详情" }, { name: "购买须知" }]);
const pageReady = ref(false);

onLoad((option) => {
  const params = parseRouteParams(option);
  fetchDetail(params);
});

function parseRouteParams(option) {
  try {
    return JSON.parse(option?.currentSite || "{}");
  } catch {
    return {};
  }
}

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

function changeTab(index) {
  activeTab.value = index;
}
function goToOrder() {
  store.prderProd = detail.value;
  uni.navigateTo({ url: PAGE_ROUTES.orderProd });
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.detail-page__skeleton {
  padding: 0 32rpx;
}
.skeleton-banner {
  width: 100%;
  height: 420rpx;
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
  width: 30%;
  height: 36rpx;
}
.skeleton-line--title {
  width: 60%;
  height: 30rpx;
}
.skeleton-line--text {
  width: 100%;
}
.skeleton-line--short {
  width: 45%;
}
.skeleton-line:last-child {
  margin-bottom: 0;
}

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

.info-card {
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
.info-card__thumb {
  flex-shrink: 0;
  width: 200rpx;
  height: 156rpx;
  border-radius: var(--radius-sm, 16rpx);
  overflow: hidden;
}
.info-card__thumb-img {
  width: 100%;
  height: 100%;
  display: block;
}
.info-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.info-card__name {
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
.info-card__prices {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-top: 10rpx;
}
.info-card__price {
  display: flex;
  align-items: baseline;
  color: var(--color-primary);
}
.info-card__symbol {
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
}
.info-card__price-value {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1;
}
.info-card__original {
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-text-secondary);
  text-decoration: line-through;
  opacity: 0.7;
}

.merchant-section {
  margin: 24rpx 32rpx 0;
  padding: 28rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}
.merchant-section__title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16rpx;
}
.merchant-card__name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16rpx;
}
.merchant-card__row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

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
}
.content-section__html :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16rpx 0;
  border-radius: var(--radius-sm, 16rpx);
}
.content-section__html :deep(p) {
  margin-bottom: 12rpx;
}

.bottom-spacer {
  height: 200rpx;
}
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
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
}
.bottom-bar__value {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1;
}
.bottom-bar__original {
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-text-secondary);
  text-decoration: line-through;
  opacity: 0.7;
}
.bottom-bar__btn {
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
}
.bottom-bar__btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}
</style>
