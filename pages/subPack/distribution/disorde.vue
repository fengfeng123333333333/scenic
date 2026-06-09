<!--
  流水明细页 — 按状态筛选订单 + 按月份过滤
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
  <view class="order-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="加载中..." />

    <!-- 状态 Tab -->
    <f-tabs
      v-model="activeTab"
      :tabs="tabs"
      field="name"
      @change="onTabChange"
      lineColor="var(--color-primary)"
      :scroll="false"
    />

    <!-- 月份选择 -->
    <view class="order-page__month" @click="showPicker = true">
      <text>{{ selectedMonth }}</text>
      <u-icon name="arrow-down" color="var(--color-text-secondary)" size="18" />
      <u-datetime-picker
        :show="showPicker"
        ref="pickerRef"
        :formatter="formatter"
        @confirm="onMonthConfirm"
        @cancel="showPicker = false"
        @close="showPicker = false"
        v-model="pickerValue"
        mode="year-month"
        confirmColor="var(--color-primary)"
      />
    </view>

    <!-- 订单列表 -->
    <view class="order-page__list" v-if="orderList.length > 0">
      <view
        class="order-card"
        v-for="(item, index) in orderList"
        :key="index"
        @click="onTapOrder(item)"
      >
        <view class="order-card__head">
          <text class="order-card__date">下单日期:{{ item.CreateTime }}</text>
          <text class="order-card__status">{{ item.StatusDesc }}</text>
        </view>
        <view class="order-card__body">
          <image
            :src="item.ProductImgUrl"
            class="order-card__img"
            mode="aspectFill"
          />
          <view class="order-card__info">
            <view class="order-card__row">
              <text class="order-card__name">{{ item.ProductName }}</text>
              <text class="order-card__price">￥{{ item.TotalMoney }}</text>
            </view>
            <text class="order-card__meta">游玩日期:{{ item.TravelTime }}</text>
            <text class="order-card__meta">数量:{{ item.TotalNumber }}</text>
          </view>
        </view>
      </view>
    </view>

    <Kong v-if="!requestLoading && orderList.length === 0" text="暂无流水" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onReady } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import Kong from "@/components/kong/kong.vue";

const tabs = [
  { name: "全部" },
  { name: "已结算" },
  { name: "未结算" },
  { name: "已退款" },
];
const activeTab = ref(0);
const orderList = ref([]);
const requestLoading = ref(false);
const showPicker = ref(false);
const pickerValue = ref(Number(new Date()));
const pickerRef = ref(null);
const selectedMonth = ref("");
const distUserId = ref("");

onLoad((option) => {
  if (option?.PersonDistributionUserID)
    distUserId.value = option.PersonDistributionUserID;
  const now = new Date();
  selectedMonth.value = `${now.getFullYear()}-${now.getMonth() + 1}`;
  fetchOrders();
});
onReady(() => {
  pickerRef.value?.setFormatter(formatter);
});

function formatter(type, value) {
  if (type === "year") return `${value}年`;
  if (type === "month") return `${value}月`;
  return value;
}

function onTabChange(index) {
  activeTab.value = index;
  fetchOrders();
}

function onMonthConfirm(e) {
  showPicker.value = false;
  selectedMonth.value = uni.$u.timeFormat(e.value, "yyyy-mm");
  fetchOrders();
}

function onTapOrder(item) {
  /* 保留 store 写入逻辑 */
}

async function fetchOrders() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetPersonDisOrderList",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        Date: selectedMonth.value,
        PersonDistributionUserID: distUserId.value,
        Status: activeTab.value,
      },
    });
    orderList.value = res.data?.Data || [];
  } catch (err) {
    console.error("[disorde] err:", err);
  } finally {
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: 40rpx;
}
.order-page__month {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 40rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  transition: opacity 160ms ease;
}
.order-page__month:active {
  opacity: 0.88;
}
.order-page__list {
  padding: 0 20rpx;
}

.order-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-bottom: 20rpx;
  overflow: hidden;
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.order-card:active {
  opacity: 0.88;
  transform: scale(0.96);
}
.order-card__head {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-caption, 24rpx);
}
.order-card__date {
  color: var(--color-text-secondary);
}
.order-card__status {
  color: var(--color-secondary);
  font-weight: 600;
}
.order-card__body {
  display: flex;
  padding: 20rpx 24rpx;
  gap: 20rpx;
}
.order-card__img {
  width: 240rpx;
  height: 150rpx;
  border-radius: 10rpx;
  background: var(--color-skeleton-base);
}
.order-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.order-card__row {
  display: flex;
  justify-content: space-between;
}
.order-card__name {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 320rpx;
}
.order-card__price {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 700;
  color: var(--color-secondary);
  flex-shrink: 0;
}
.order-card__meta {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-disabled);
}
</style>
