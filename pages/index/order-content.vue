<template>
  <view class="order-content" :style="$themeStyle">
    <u-navbar
      title="订单列表"
      :placeholder="true"
      :autoBack="true"
      :fixed="false"
    />

    <!-- 订单状态筛选 Tab -->
    <v-tabs
      v-model="activeTab"
      :tabs="statusTabs"
      field="name"
      @change="onStatusChange"
      lineColor="var(--color-primary)"
      :scroll="false"
    />

    <!-- 订单列表 -->
    <scroll-view class="order-list" scroll-y v-if="orderList.length > 0">
      <view
        class="order-card"
        v-for="(item, index) in orderList"
        :key="index"
        @click="goDetail(item)"
      >
        <view class="order-card__header">
          <text class="order-card__date">下单日期：{{ item.CreateTime }}</text>
          <text class="order-card__status">{{ item.StatusDesc }}</text>
        </view>
        <view class="order-card__body">
          <image
            class="order-card__thumb"
            :src="item.ProductImgUrl"
            mode="aspectFill"
          />
          <view class="order-card__info">
            <text class="order-card__name">{{ item.ProductName }}</text>
            <view class="order-card__meta">
              <text class="order-card__label"
                >游玩日期：{{ item.TravelTime }}</text
              >
              <text class="order-card__label"
                >数量：{{ item.TotalNumber }}</text
              >
            </view>
            <text class="order-card__price">￥{{ item.TotalMoney }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="order-empty" v-else>
      <u-icon name="file-text" color="var(--color-disabled)" size="64" />
      <text class="order-empty__text">暂无订单</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

const statusTabs = [
  { name: "全部" },
  { name: "待使用" },
  { name: "未支付" },
  { name: "已完成" },
  { name: "退款" },
  { name: "待发货" },
];

const activeTab = ref(0);
const orderList = ref([]);

const myRequest = (options) => uni.$myRequest(options);

async function queryOrders(status) {
  const openid = uni.getStorageSync("userinfo");
  const res = await myRequest({
    url: "/api/Applets/AppletsGetTicketOrderList",
    method: "POST",
    data: {
      openId: openid.openid,
      memberID: 0,
      status,
    },
  });
  orderList.value = res.data.Data || [];
}

function onStatusChange(index) {
  activeTab.value = index;
  queryOrders(index);
}

function goDetail(item) {
  // TODO: 根据实际路由调整
  uni.navigateTo({ url: `/pages/ticketCode/ticketCode` });
}

onMounted(() => {
  queryOrders(0);
});
</script>

<style lang="scss" scoped>
.order-content {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
}

/* ====== 订单筛选 Tab ====== */

/* ====== 订单列表 ====== */
.order-list {
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.order-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-bottom: 24rpx;
  overflow: hidden;
  transition: transform 160ms ease-in-out;

  &:active {
    transform: scale(0.98);
  }
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid var(--color-border-light);
}

.order-card__date {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.order-card__status {
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
  color: var(--color-primary);
}

.order-card__body {
  display: flex;
  padding: 24rpx;
  gap: 24rpx;
}

.order-card__thumb {
  flex-shrink: 0;
  width: 180rpx;
  height: 132rpx;
  border-radius: var(--radius-sm, 16rpx);
  background-color: var(--color-border-light);
}

.order-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-card__name {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-card__meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.order-card__label {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.order-card__price {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 700;
  color: var(--color-primary);
  align-self: flex-end;
}

/* ====== 空状态 ====== */
.order-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  gap: 24rpx;
}

.order-empty__text {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-disabled);
}
</style>
