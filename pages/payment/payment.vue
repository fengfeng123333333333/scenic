<!--
  支付页（payment.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换
  功能：展示订单金额与支付方式，处理微信支付 / 会员支付
-->

<template>
  <view class="payment-page" :style="$themeStyle">
    <!-- ==================== 页面初始加载 ==================== -->
    <PageLoading v-if="!pageReady" />

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 金额区 -->
      <view class="payment-page__amount">
        <view class="payment-page__amount-sum">
          <text class="payment-page__amount-symbol">￥</text>
          <text class="payment-page__amount-value">{{
            tickinfo.TotalMoney
          }}</text>
        </view>
        <view class="payment-page__amount-desc">
          {{ tickinfo.ProductInfo }}
          <text v-if="tickinfo.time != undefined"> ({{ tickinfo.time }})</text>
        </view>
      </view>

      <!-- 支付方式列表 -->
      <view class="payment-page__methods">
        <!-- 微信支付 -->
        <view
          class="payment-page__method"
          :class="{ 'payment-page__method--active': payType === 0 }"
          @click="payType = 0"
        >
          <view class="payment-page__method-left">
            <u-icon name="weixin-fill" color="#07C160" size="22" />
            <text class="payment-page__method-text">微信支付</text>
          </view>
          <view
            class="payment-page__method-radio"
            :class="{ 'payment-page__method-radio--checked': payType === 0 }"
          >
            <view v-if="payType === 0" class="payment-page__method-radio-dot" />
          </view>
        </view>

        <!-- 会员支付 -->
        <view
          v-if="tickinfo.isMember == true"
          class="payment-page__method"
          :class="{ 'payment-page__method--active': payType === 1 }"
          @click="payType = 1"
        >
          <view class="payment-page__method-left">
            <u-icon
              name="account-fill"
              color="var(--color-secondary)"
              size="22"
            />
            <text class="payment-page__method-text">会员支付</text>
          </view>
          <view
            class="payment-page__method-radio"
            :class="{ 'payment-page__method-radio--checked': payType === 1 }"
          >
            <view v-if="payType === 1" class="payment-page__method-radio-dot" />
          </view>
        </view>
      </view>

      <!-- 支付按钮 -->
      <view class="payment-page__footer">
        <button
          class="payment-page__btn"
          :class="{ 'payment-page__btn--loading': payLoading }"
          :disabled="payLoading"
          @tap="handlePay"
        >
          <template v-if="payLoading">
            <u-loading-icon
              mode="circle"
              size="18"
              color="var(--color-text-on-primary)"
            />
            <text>支付中...</text>
          </template>
          <text v-else>立即支付</text>
        </button>
      </view>
    </template>

    <!-- ==================== 支付中遮罩 ==================== -->
    <RequestLoading v-if="payLoading" text="正在支付..." />

    <!-- ==================== Toast ==================== -->
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import store from "../../store/index.js";
import PageLoading from "../../components/loading/page-loading.vue";
import RequestLoading from "../../components/loading/request-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  /** 订单列表页 */
  order: "/pages/order/order",
};

/** 支付 API 路由表：根据 tickinfo.name 映射对应后端接口 */
const PAY_API_MAP = {
  orderProde: "/api/Applets/AppletsPayGoodsOrder",
  cartime: "/api/Applets/AppletsPayTimeTicketOrder",
};

/** 默认支付 API */
const DEFAULT_PAY_API = "/api/Applets/AppletsPayTicketOrder";

// ==================== 数据 ====================
const tickinfo = ref({});
const payType = ref(0); // 0=微信支付, 1=会员支付
const pageReady = ref(false);
const payLoading = ref(false);

// ==================== Refs ====================
const uToastRef = ref(null);

// ==================== 生命周期 ====================
onLoad(() => {
  initPageData();
});

// ==================== 数据初始化 ====================
function initPageData() {
  tickinfo.value = store.state.tickinfo || {};
  pageReady.value = true;
}

// ==================== 数据请求 ====================

/**
 * 根据 tickinfo.name 构建支付 API 路径
 * @returns {string}
 */
function buildPayUrl() {
  return PAY_API_MAP[tickinfo.value.name] || DEFAULT_PAY_API;
}

/**
 * 调用后端支付下单接口
 * @returns {Promise<object>} API 响应
 */
async function requestPayOrder() {
  return await uni.$myRequest({
    url: buildPayUrl(),
    method: "POST",
    data: {
      openId: tickinfo.value.openId,
      orderID: tickinfo.value.OrderID,
      payType: String(payType.value),
    },
  });
}

// ==================== 导航辅助 ====================

/** 构建订单页 URL */
function buildOrderUrl() {
  return `${PAGE_ROUTES.order}?active=0`;
}

/** 写入订单 ID 到 store */
function setOrderStore() {
  store.state.order = tickinfo.value.OrderID;
}

/** 跳转到订单列表页 */
function goToOrder() {
  setOrderStore();
  uni.reLaunch({ url: buildOrderUrl() });
}

// ==================== 支付处理子流程 ====================

/**
 * 处理微信小程序支付（跳转支付小程序）
 */
function handleMiniProgramPay(payData) {
  const { appId, path, envVersion } = payData;
  wx.navigateToMiniProgram({
    appId,
    path,
    envVersion,
    success(res) {
      console.log("[支付] 跳转支付小程序成功", res);
      payLoading.value = false;
    },
    fail(err) {
      console.error("[支付] 跳转支付小程序失败", err);
      payLoading.value = false;
      showToast("跳转支付失败，请重试");
    },
  });
}

/**
 * 处理 JSAPI 微信支付（调起收银台）
 */
function handleJsapiPay(payData) {
  const payInfo = payData || {};

  const payParams = {
    paySign: payInfo.paySign,
    timeStamp: payInfo.timeStamp,
    nonceStr: payInfo.nonceStr,
    package: payInfo.package_str,
    signType: payInfo.signType,
    success() {
      goToOrder();
    },
    fail(err) {
      console.error("[支付] 调起支付失败", err);
      payLoading.value = false;
      showToast("支付取消或失败");
    },
  };

  setOrderStore();
  uni.requestPayment(payParams);
}

/**
 * 处理支付成功后的分支导航
 * @param {object} resData - API 返回的 Data 字段
 */
function handlePaySuccess(resData) {
  const data = resData || {};

  // 微信支付分支
  if (payType.value === 0) {
    // 0 元订单 → 直接跳转订单页
    if (tickinfo.value.TotalMoney == 0) {
      goToOrder();
      return;
    }

    // 有金额 → 判断支付方式
    if (data.pay_type === "030") {
      // 跳转微信支付小程序
      handleMiniProgramPay(data);
    } else {
      // JSAPI 微信支付（调起收银台）
      handleJsapiPay(data);
    }
    return;
  }

  // 会员支付 → 直接跳转订单页
  if (payType.value === 1 && tickinfo.value.isMember == true) {
    goToOrder();
    return;
  }
}

// ==================== 业务方法 ====================

/** 点击"立即支付" */
async function handlePay() {
  // 防重复提交
  if (payLoading.value) return;

  payLoading.value = true;

  try {
    const res = await requestPayOrder();

    if (res.data.Code == 200) {
      handlePaySuccess(res.data.Data);
    } else {
      payLoading.value = false;
      showToast(res.data.Message || "支付失败，请重试");
    }
  } catch (err) {
    console.error("[支付] 请求异常", err);
    payLoading.value = false;
    showToast("网络异常，请重试");
  }
}

// ==================== 工具方法 ====================

function showToast(msg, type = "error") {
  if (uToastRef.value) {
    uToastRef.value.show({ type, icon: false, message: msg, duration: 2000 });
  } else {
    uni.showToast({ title: msg, icon: "none" });
  }
}
</script>

<script>
export default {
  onShareAppMessage() {
    return {
      title: "景区支付",
      path: "/pages/payment/payment",
    };
  },
};
</script>

<style>
page {
  background-color: var(--color-bg);
  min-height: 100vh;
}
</style>

<style lang="scss" scoped>
/* ============================================================
   支付页样式 — 遵循 page-refactor-standard.md
   - 全量主题变量：var(--color-*)、var(--radius-*)、var(--shadow-*)
   - BEM 命名规范
   - 安全区适配 + 按压反馈
   ============================================================ */

.payment-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  font-family:
    "PingFang SC",
    Roboto,
    system-ui,
    -apple-system,
    "Helvetica Neue",
    Arial,
    sans-serif;
}

/* ==================== 金额区 ==================== */
.payment-page__amount {
  padding: 48rpx 32rpx 36rpx;
  margin: 24rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  text-align: center;
}

.payment-page__amount-sum {
  margin-bottom: 16rpx;
}

.payment-page__amount-symbol {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-primary);
}

.payment-page__amount-value {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}

.payment-page__amount-desc {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* ==================== 支付方式列表 ==================== */
.payment-page__methods {
  margin: 0 24rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.payment-page__method {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border-light);
  transition: background-color 0.15s ease;
  min-height: 100rpx;
  box-sizing: border-box;
}

.payment-page__method:last-child {
  border-bottom: none;
}

.payment-page__method:active {
  background-color: var(--color-primary-bg-light);
}

.payment-page__method-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.payment-page__method-text {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--color-text);
}

/* ==================== 自定义 Radio ==================== */
.payment-page__method-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.2s ease;
}

.payment-page__method-radio--checked {
  border-color: var(--color-primary);
}

.payment-page__method-radio-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background-color: var(--color-primary);
}

/* ==================== 底部支付按钮 ==================== */
.payment-page__footer {
  padding: 32rpx 48rpx 0;
  margin-top: auto;
}

.payment-page__btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-text-on-primary);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-button);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.06);
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.payment-page__btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}

.payment-page__btn[disabled],
.payment-page__btn--loading {
  opacity: 0.85;
  transform: none;
}
</style>
