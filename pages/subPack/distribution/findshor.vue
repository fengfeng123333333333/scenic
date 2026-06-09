<!--
  分销商品列表�?�?展示可分销门票，支持分�?
  遵循 page-refactor-standard.md & 设计稿规�?md
-->
<template>
  <view class="share-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="加载中..." />

    <view class="share-page__grid" v-if="productList.length > 0">
      <view
        class="ticket-card"
        v-for="(item, index) in productList"
        :key="index"
      >
        <view class="ticket-card__cover">
          <image :src="item.ImgUrl" mode="aspectFill" />
          <view class="ticket-card__price-tag">
            <text class="ticket-card__symbol">￥</text>
            <text class="ticket-card__price">{{ item.SellPrice }}</text>
          </view>
        </view>
        <view class="ticket-card__body">
          <text class="ticket-card__name">{{ item.TicketName }}</text>
          <view class="ticket-card__actions">
            <button
              class="ticket-card__share"
              open-type="share"
              :data-obj="item"
            >
              <u-icon
                name="share"
                size="16"
                color="var(--color-text-on-primary)"
              />
              <text>分享</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <Kong
      v-if="!requestLoading && productList.length === 0"
      text="暂无分销商品"
    />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import Kong from "@/components/kong/kong.vue";

const productList = ref([]);
const requestLoading = ref(false);
const distUserId = ref(1);

onLoad((option) => {
  if (option.PersonDistributionUserID)
    distUserId.value = Number(option.PersonDistributionUserID);
  fetchProducts();
});

async function fetchProducts() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetPersonDistributorTicket",
      method: "POST",
      data: {
        OpenId: openid?.openid || "",
        PersonDistributionUserID: distUserId.value,
      },
    });
    productList.value = res.data?.Data || [];
  } catch (err) {
    console.error("[findshor] err:", err);
  } finally {
    requestLoading.value = false;
  }
}
</script>

<script>
export default {
  onShareAppMessage(res) {
    const obj = res.target?.dataset?.obj;
    return {
      title: "分销商品",
      path: `/pages/details/details?tId=${obj?.TicketID}&mindt=${this.mindId}`,
    };
  },
};
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 24rpx 24rpx 40rpx;
}
.share-page__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}
.ticket-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.ticket-card:active {
  opacity: 0.88;
  transform: scale(0.96);
}
.ticket-card__cover {
  position: relative;
  width: 100%;
  height: 260rpx;
  overflow: hidden;
  background: var(--color-skeleton-base);
}
.ticket-card__cover image {
  width: 100%;
  height: 100%;
  display: block;
}
.ticket-card__price-tag {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 8rpx 20rpx 8rpx 16rpx;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.55), transparent);
  display: flex;
  align-items: baseline;
}
.ticket-card__symbol {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-on-primary);
}
.ticket-card__price {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 700;
  color: var(--color-text-on-primary);
  margin-left: 4rpx;
}
.ticket-card__body {
  padding: 20rpx 16rpx 16rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.ticket-card__name {
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.ticket-card__actions {
  display: flex;
  justify-content: flex-end;
}
.ticket-card__share {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 24rpx;
  margin: 0;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border: none;
  border-radius: 40rpx;
  font-size: var(--font-size-caption, 24rpx);
  height: 52rpx;
  line-height: 1;
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.ticket-card__share::after {
  border: none;
}
.ticket-card__share:active {
  opacity: 0.88;
  transform: scale(0.96);
}
</style>
