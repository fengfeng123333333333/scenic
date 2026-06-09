<!--
  退票页 — 展示订单明细 + 退票数量选择 + 申请退款
  遵循 page-refactor-standard.md & 设计稿规范.md
  跟随全局主题动态切换

  旧函数映射：
    onLoad          → onLoad + fetchReturnInfo
    retuenTick      → handleSubmit
    handleMinus     → onCountChange
    handlePlus      → onCountChange (合并)
-->
<template>
  <view class="return-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="加载中..." />

    <!-- 订单明细卡 -->
    <view class="return-card">
      <text class="return-card__title">订单明细</text>

      <view class="return-card__row" v-for="row in detailRows" :key="row.label">
        <text class="return-card__label">{{ row.label }}</text>
        <text
          class="return-card__value"
          :class="{ 'return-card__value--highlight': row.highlight }"
          >{{ row.value }}</text
        >
      </view>
    </view>

    <!-- 退票统计卡 -->
    <view class="return-card">
      <view class="return-card__row" v-for="row in statRows" :key="row.label">
        <text class="return-card__label">{{ row.label }}</text>
        <text
          class="return-card__value"
          :class="{ 'return-card__value--highlight': row.highlight }"
          >{{ row.value }}</text
        >
      </view>

      <!-- 数量选择器 -->
      <view class="return-card__row return-card__row--picker">
        <text class="return-card__label">本次退票:</text>
        <!-- <u-number-box
          :min="1"
          :max="orderList.CanReturnNumber"
          :value="orderList.ThisReturnNumber"
          @plus="onCountChange"
          @minus="onCountChange"
          background="var(--color-primary)"
          color="var(--color-text-on-primary)"
        /> -->
        <u-number-box
          v-model="orderList.ThisReturnNumber"
          :min="1"
          :max="orderList.CanReturnNumber"
          :disabledInput="true"
          @change="onCountChange"
        >
          <template #minus>
            <view class="num-btn">−</view>
          </template>
          <template #input>
            <view class="num-input">{{ orderList.ThisReturnNumber }}</view>
          </template>
          <template #plus>
            <view class="num-btn">+</view>
          </template>
        </u-number-box>
      </view>

      <!-- 退款金额 -->
      <view class="return-card__row return-card__row--total">
        <text class="return-card__label">退款金额:</text>
        <text class="return-card__refund"
          >￥{{ orderList.ThisReturnMoney }}</text
        >
      </view>

      <!-- 申请按钮 -->
      <view
        class="return-card__btn"
        v-if="orderList.CanReturnNumber > 0"
        :class="{ 'return-card__btn--disabled': submitting }"
        @click="handleSubmit"
      >
        <u-loading-icon
          v-if="submitting"
          mode="circle"
          size="18"
          color="var(--color-text-on-primary)"
        />
        <text>{{ submitting ? "提交中..." : "申请退款" }}</text>
      </view>
    </view>

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";

const { uToastRef, showToast } = useToast();

// ==================== 数据 ====================
const orderList = ref({});
const requestLoading = ref(false);
const submitting = ref(false);

// ==================== 订单明细行（第一张卡） ====================
const detailRows = computed(() => {
  const o = orderList.value;
  return [
    { label: "订单号:", value: o.OrderNo || "", highlight: true },
    { label: "票单价:", value: o.DiscountUnitPrice ?? "", highlight: true },
    { label: "购买数:", value: o.TotalNumber ?? "" },
    { label: "订单总额:", value: o.TotalMoney ?? "", highlight: true },
    { label: "购买票种:", value: o.ProductName || "" },
    { label: "下单时间:", value: o.CreateTime || "", highlight: true },
  ];
});

// ==================== 退票统计行（第二张卡） ====================
const statRows = computed(() => {
  const o = orderList.value;
  return [
    { label: "总票数:", value: o.Number ?? "" },
    { label: "已使用:", value: o.UseNumber ?? "" },
    { label: "已退款:", value: o.ReturnNumber ?? "" },
    { label: "已过期:", value: o.PastNumber ?? "" },
    { label: "申请退:", value: o.ApplyForNumber ?? "" },
    { label: "可退数:", value: o.CanReturnNumber ?? "", highlight: true },
  ];
});

// ==================== 数据请求 ====================
async function fetchReturnInfo(orderID) {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetReturnTicketShow",
      method: "POST",
      data: { openId: openid?.openid || "", orderID },
    });
    if (res.data?.Code === 200) {
      orderList.value = res.data.Data || {};
    } else {
      uni.navigateBack({ delta: 1 });
    }
  } catch (err) {
    console.error("[returnticket] fetch err:", err);
    uni.navigateBack({ delta: 1 });
  } finally {
    requestLoading.value = false;
  }
}

onLoad((options) => {
  fetchReturnInfo(options?.order || "");
});

// ==================== 业务方法 ====================
function calcRefundMoney(count) {
  const price = Number(orderList.value.DiscountUnitPrice) || 0;
  const num = Number(count) || 0;
  orderList.value.ThisReturnMoney = Number((price * num).toFixed(2));
}

function onCountChange(val) {
  // u-number-box @change 兼容：可能传对象 {value} 或直接传数字
  const num =
    typeof val === "object" ? Number(val?.value) || 1 : Number(val) || 1;
  orderList.value.ThisReturnNumber = num;
  calcRefundMoney(num);
}

async function handleSubmit() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsConfirmReturnTicket",
      method: "POST",
      data: orderList.value,
    });
    if (res.data?.Code !== 200) {
      showToast(res.data?.Message || "提交失败");
      return;
    } else {
      showToast(res.data?.Message || "操作成功", "success");
      setTimeout(() => {
        uni.reLaunch({ url: "/pages/index/index?tab=1" });
      }, 1500);
    }
  } catch (err) {
    console.error("[returnticket] submit err:", err);
    showToast("提交失败，请重试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.return-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 20rpx;
}

/* ====== 卡片 ====== */
.return-card {
  margin-bottom: 20rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding-bottom: 20rpx;
  overflow: hidden;
}

.return-card__title {
  display: block;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
}

/* ====== 行 ====== */
.return-card__row {
  display: flex;
  align-items: center;
  padding: 14rpx 24rpx;
  font-size: var(--font-size-caption, 26rpx);
}

.return-card__row--picker {
  margin-top: 8rpx;
}

.return-card__row--total {
  margin-bottom: 8rpx;
}

.return-card__label {
  width: 140rpx;
  text-align: right;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-right: 20rpx;
}

.return-card__value {
  margin-left: 12rpx;
  color: var(--color-text);
}

.return-card__value--highlight {
  color: var(--color-secondary);
}

.return-card__refund {
  margin-left: 12rpx;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 700;
  color: var(--color-danger);
}

/* ====== 按钮 ====== */
.return-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin: 20rpx auto 0;
  width: 240rpx;
  height: 80rpx;
  border-radius: var(--radius-button);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.return-card__btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}
.return-card__btn--disabled {
  opacity: 0.6;
  transform: none;
}
</style>
