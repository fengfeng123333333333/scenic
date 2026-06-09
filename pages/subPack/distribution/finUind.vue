<!--
  结账记录页 — 按状态筛选结算记录 + 按月份过滤
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
  <view class="settle-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="加载中..." />

    <f-tabs
      v-model="activeTab"
      :tabs="tabs"
      field="name"
      @change="onTabChange"
      lineColor="var(--color-primary)"
      :scroll="false"
    />

    <view class="settle-page__month" @click="showPicker = true">
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

    <view class="settle-page__list" v-if="orderList.length > 0">
      <view class="settle-card" v-for="(item, index) in orderList" :key="index">
        <view class="settle-card__head">
          <text class="settle-card__date">申请时间:{{ item.CreateTime }}</text>
          <text class="settle-card__status">{{ item.StatusDesc }}</text>
        </view>
        <view class="settle-card__body">
          <text class="settle-card__label">提现金额:</text>
          <text class="settle-card__amount">￥{{ item.RebateMoney }}</text>
        </view>
      </view>
    </view>

    <Kong v-if="!requestLoading && orderList.length === 0" text="暂无记录" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onReady } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import Kong from "@/components/kong/kong.vue";

const tabs = [
  { name: "全部" },
  { name: "待审核" },
  { name: "待打款" },
  { name: "已打款" },
  { name: "审核未通过" },
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

async function fetchOrders() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetPersonDisSettleLis",
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
    console.error("[finUind] err:", err);
  } finally {
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.settle-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: 40rpx;
}
.settle-page__month {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 40rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  transition: opacity 160ms ease;
}
.settle-page__month:active {
  opacity: 0.88;
}
.settle-page__list {
  padding: 0 20rpx;
}

.settle-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-bottom: 20rpx;
  overflow: hidden;
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.settle-card:active {
  opacity: 0.88;
  transform: scale(0.96);
}
.settle-card__head {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-caption, 24rpx);
}
.settle-card__date {
  color: var(--color-text-secondary);
}
.settle-card__status {
  color: var(--color-secondary);
  font-weight: 600;
}
.settle-card__body {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
}
.settle-card__label {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
}
.settle-card__amount {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 700;
  color: var(--color-secondary);
}
</style>
