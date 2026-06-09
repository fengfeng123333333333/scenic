<!--
  选座支付页（seatpay.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad()              → onLoad(() => { initPage() })
    onReceive(item)       → handleCouponSelect(item)
    opencoupon()          → openCoupon()
    hidecoupon()          → closeCoupon()
    commitWork()          → submitPay()
    minerCar()            → calcCouponDiscount()
    pricInput(val)        → 合并入 calcCouponDiscount
-->

<template>
  <view class="seat-pay-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="seat-pay-page__skeleton">
      <view class="skeleton-amount" />
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 金额区 -->
      <view class="seat-pay-page__amount">
        <view class="amount__sum">
          <text v-if="selectedCoupons.length === 0">￥</text>
          <text class="amount__value">{{ displayPrice }}</text>
        </view>
        <view class="amount__desc">
          {{ seatInfo.ShowName
          }}<text v-if="seatInfo.time"> ({{ seatInfo.time }})</text>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="seat-pay-page__methods">
        <!-- 微信支付 -->
        <view class="method-item" @click="payType = '0'">
          <view class="method-item__left">
            <u-icon name="weixin-fill" color="#07C160" size="22" />
            <text>微信支付</text>
          </view>
          <view
            class="method-item__radio"
            :class="{ 'method-item__radio--checked': payType === '0' }"
          >
            <view v-if="payType === '0'" class="method-item__radio-dot" />
          </view>
        </view>

        <!-- 会员支付 -->
        <view
          class="method-item"
          v-if="seatInfo.isMember == true"
          @click="payType = '1'"
        >
          <view class="method-item__left">
            <u-icon
              name="account-fill"
              color="var(--color-secondary)"
              size="22"
            />
            <text>会员支付</text>
          </view>
          <view
            class="method-item__radio"
            :class="{ 'method-item__radio--checked': payType === '1' }"
          >
            <view v-if="payType === '1'" class="method-item__radio-dot" />
          </view>
        </view>

        <!-- 优惠券 -->
        <view
          class="method-item"
          v-if="!showCoupon && couponList.length > 0"
          @click="openCoupon"
        >
          <view class="method-item__left">
            <u-icon name="coupon" color="var(--color-primary)" size="22" />
            <text class="method-item__label">优惠券:</text>
            <text class="method-item__discount" v-if="totalDiscount > 0"
              >-￥{{ totalDiscount }}</text
            >
          </view>
          <u-icon
            name="arrow-right"
            color="var(--color-text-secondary)"
            size="20"
          />
        </view>
      </view>
    </template>

    <!-- ==================== 支付按钮 ==================== -->
    <view class="seat-pay-page__footer">
      <view class="pay-btn" @click="submitPay">
        <template v-if="payLoading">
          <u-loading-icon
            mode="circle"
            size="18"
            color="var(--color-text-on-primary)"
          />
          <text>支付中...</text>
        </template>
        <text v-else>立即支付</text>
      </view>
    </view>

    <!-- ==================== 优惠券弹窗 ==================== -->
    <view class="coupon-overlay" v-if="showCoupon" @tap="closeCoupon">
      <view
        class="coupon-popup"
        :class="{ 'coupon-popup--show': showCoupon }"
        @tap.stop
      >
        <scroll-view class="coupon-popup__scroll" scroll-y>
          <cc-defineCoupon
            :colors="couponBtnColor"
            :couponList="couponList"
            @onReceive="handleCouponSelect"
          />
        </scroll-view>
      </view>
    </view>

    <!-- ==================== Loading ==================== -->
    <RequestLoading v-if="payLoading" text="正在支付..." />
    <!-- ==================== Toast 提示 ==================== -->
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useToast } from "@/util/toast.js";
import { useStore } from "@/store/index.js";
import RequestLoading from "@/components/loading/request-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  order: "/pages/index/index",
};

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 数据 ====================
const pageReady = ref(false);
const payType = ref("0");
const seatInfo = ref({});
const couponList = ref([]);
const selectedCoupons = ref([]);
const useCouponList = ref([]);
const showCoupon = ref(false);
const payLoading = ref(false);
const submitting = ref(false);
const basePrice = ref(0);
const { uToastRef, showToast } = useToast();
// ==================== 计算属性 ====================
const totalDiscount = computed(() => {
  if (selectedCoupons.value.length === 0) return 0;
  const coupon = selectedCoupons.value[0];
  if (coupon.CouponType == 0) {
    return selectedCoupons.value.reduce((sum, c) => sum + c.Amount, 0);
  }
  return (basePrice.value * (1 - coupon.Amount / 100)).toFixed(2) - 0;
});

const displayPrice = computed(() => {
  if (selectedCoupons.value.length === 0) return basePrice.value;
  const coupon = selectedCoupons.value[0];
  if (coupon.CouponType == 0) {
    const after = basePrice.value - totalDiscount.value;
    return after <= 0 ? 0 : after;
  }
  return (basePrice.value * (coupon.Amount / 100)).toFixed(2);
});

const couponBtnColor = computed(() => {
  return store.themeVars?.["--color-primary"] || "#fa436a";
});

// ==================== 生命周期 ====================
onLoad(async () => {
  seatInfo.value = store.tickinfo || {};
  basePrice.value = seatInfo.value.wechatMonay || 0;

  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetMyCoupon",
      method: "POST",
      data: {
        ChooseCompanyID: seatInfo.value.CompanyID,
        ChooseScenicID: seatInfo.value.ScenicID,
        OpenId: openid?.openid || "",
        TotalMoney: 0,
        Scope: 1,
      },
    });
    couponList.value = res?.data?.Data || [];
  } catch (err) {
    console.error("[seatpay] 获取优惠券失败:", err);
  } finally {
    pageReady.value = true;
  }
});

// ==================== 业务方法 ====================
function handlePayTypeChange() {
  basePrice.value =
    payType.value === "0"
      ? seatInfo.value.wechatMonay || 0
      : seatInfo.value.menbMoney || 0;
  handleCouponSelect(selectedCoupons.value);
}

// watch payType
import { watch } from "vue";
watch(payType, () => handlePayTypeChange());

function handleCouponSelect(items) {
  showCoupon.value = false;

  if (items === 0 || (Array.isArray(items) && items.length === 0)) {
    selectedCoupons.value = [];
    useCouponList.value = [];
    return;
  }

  const list = Array.isArray(items) ? items : [items];
  selectedCoupons.value = list;
  useCouponList.value = list.map((item) => ({
    CouponID: item.CouponID,
    SysCouponCode: item.SysCouponCode,
  }));
}

function openCoupon() {
  showCoupon.value = true;
}
function closeCoupon() {
  showCoupon.value = false;
}

async function submitPay() {
  if (submitting.value) return;
  submitting.value = true;
  payLoading.value = true;

  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsPayCinemaTicketOrder",
      method: "POST",
      data: {
        openId: seatInfo.value.openId,
        orderID: seatInfo.value.OrderID,
        payType: payType.value,
        UseCouponList: useCouponList.value,
      },
    });

    if (res?.data?.Code !== 200) {
      payLoading.value = false;
      submitting.value = false;

      return;
    }

    // 会员支付 → 直接跳转
    if (payType.value === "1" && seatInfo.value.isMember == true) {
      store.order = seatInfo.value.OrderID;
      uni.reLaunch({ url: `${PAGE_ROUTES.order}?tab=1` });
      return;
    }

    // 微信支付 → 0元订单直接跳转
    if (displayPrice.value <= 0) {
      store.order = seatInfo.value.OrderID;
      uni.reLaunch({ url: `${PAGE_ROUTES.order}?tab=1` });
      return;
    }

    // 微信支付 → 调起收银台
    const payData = res.data.Data || {};
    store.order = seatInfo.value.OrderID;
    uni.requestPayment({
      paySign: payData.paySign,
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package_str,
      signType: payData.signType,
      success() {
        uni.reLaunch({ url: `${PAGE_ROUTES.order}?tab=1` });
      },
      fail() {
        showToast("支付取消或失败");
        payLoading.value = false;
        submitting.value = false;
      },
    });
  } catch (err) {
    console.error("[seatpay] 支付失败:", err);
    payLoading.value = false;
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   选座支付页 — 样式，所有颜色通过 CSS 变量驱动
   ============================================================ */

.seat-pay-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: flex;
  flex-direction: column;
}

// ==================== 骨架屏 ====================
.seat-pay-page__skeleton {
  padding: 0 32rpx;
}
.skeleton-amount {
  height: 200rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--radius-card);
  margin: 24rpx 0;
}
.skeleton-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-soft);
}
.skeleton-line {
  height: 28rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-bottom: 16rpx;
}
.skeleton-line--title {
  width: 45%;
}
.skeleton-line--text {
  width: 70%;
}

// ==================== 金额区 ====================
.seat-pay-page__amount {
  padding: 40rpx 32rpx 28rpx;
  background-color: var(--color-bg-card);
  text-align: center;
}
.amount__sum {
  margin-bottom: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}
.amount__value {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.amount__desc {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

// ==================== 支付方式 ====================
.seat-pay-page__methods {
  margin: 20rpx 0;
  background-color: var(--color-bg-card);
}

.method-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border-light);
}
.method-item:active {
  background-color: var(--color-primary-bg-light);
}
.method-item__left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  font-size: 28rpx;
  color: var(--color-text);
}
.method-item__label {
  color: var(--color-text-secondary);
}
.method-item__discount {
  color: var(--color-primary);
  font-weight: 600;
}

.method-item__radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.method-item__radio--checked {
  border-color: var(--color-primary);
}
.method-item__radio-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background-color: var(--color-primary);
}

// ==================== 支付按钮 ====================
.seat-pay-page__footer {
  padding: 32rpx;
  margin-top: auto;
}
.pay-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 96rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text-on-primary);
  background-color: var(--color-primary);
  border-radius: var(--radius-button);
}
.pay-btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}

// ==================== 优惠券弹窗 ====================
.coupon-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
}
.coupon-popup {
  position: fixed;
  left: 0;
  bottom: -1000rpx;
  width: 100%;
  z-index: 999;
  background: var(--color-bg-card);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  transition: bottom 0.3s ease;
}
.coupon-popup--show {
  bottom: 0;
}
.coupon-popup__scroll {
  width: 100%;
  height: 60vh;
  padding: 10rpx 0;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
