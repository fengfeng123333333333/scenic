<!--
  优惠券详情页 — 展示券包列表 + 价格/规则 + 领取/购买
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  支付流程遵循 §0.3 支付统一规范
  旧函数映射：onLoad → onLoad + fetchCouponDetail
              valChange → onQuantityChange / commitWork → handleSubmit
-->
<template>
  <view class="rolldetails-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- 券包列表 -->
      <view class="rolldetails-page__section-title"
        >优惠券列表({{ couponCount }}张)</view
      >
      <view
        class="rolldetails-page__coupon-card"
        v-for="(item, index) in tabList"
        :key="index"
      >
        <view class="rolldetails-page__coupon-left">
          <image
            class="rolldetails-page__coupon-img"
            :src="item.CouponImgUrl"
            mode="aspectFill"
          />
          <text class="rolldetails-page__coupon-type">{{
            item.CouponTypeDesc
          }}</text>
        </view>
        <view class="rolldetails-page__coupon-right">
          <text class="rolldetails-page__coupon-name">{{
            item.CouponName
          }}</text>
          <text class="rolldetails-page__coupon-amount">{{
            item.AmountDesc
          }}</text>
          <text class="rolldetails-page__coupon-label">使用期限</text>
          <text class="rolldetails-page__coupon-period">{{
            item.CouponUseTimeDesc
          }}</text>
        </view>
      </view>

      <!-- 领取价格 -->
      <template v-if="peart.Price > 0">
        <view class="rolldetails-page__section-title">领取价格</view>
        <view class="rolldetails-page__price-row">
          <text class="rolldetails-page__price-value"
            >￥{{ displayPrice }}</text
          >
          <u-number-box
            v-model="quantity"
            :min="1"
            :max="100"
            @change="onQuantityChange"
            :disabledInput="true"
          >
            <template #minus>
              <view class="num-btn">−</view>
            </template>
            <template #input>
              <view class="num-input">{{ quantity }}</view>
            </template>
            <template #plus>
              <view class="num-btn">+</view>
            </template>
          </u-number-box>
        </view>
      </template>

      <!-- 规则说明 -->
      <view class="rolldetails-page__section-title">规则说明</view>
      <view class="rolldetails-page__rules">
        <f-parse :content="Description" />
      </view>

      <!-- 操作按钮 -->
      <view class="rolldetails-page__btn-area">
        <view
          class="rolldetails-page__btn"
          :class="{ 'rolldetails-page__btn--disabled': payLoading }"
          @click="handleSubmit"
        >
          <template v-if="payLoading">
            <u-loading-icon
              mode="circle"
              size="18"
              color="var(--color-text-on-primary)"
            />
            <text>处理中...</text>
          </template>
          <text v-else-if="peart.Price > 0">立即购买</text>
          <text v-else>立即领取</text>
        </view>
      </view>
    </template>

    <!-- 支付中遮罩 -->
    <RequestLoading v-if="payLoading" text="正在支付..." />

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";
import RequestLoading from "@/components/loading/request-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  home: "/pages/index/index",
};

// ==================== 数据 ====================
const tabList = ref([]);
const couponCount = ref(0);
const Description = ref("");
const couponId = ref(0);
const quantity = ref(1);
const peart = ref({ Price: 0 });
const bindtik = ref({});
const bindVin = ref(0);
const hidMind = ref(0);
const pageReady = ref(false);
const payLoading = ref(false);

// ==================== Refs ====================
const uToastRef = ref(null);

// ==================== 计算属性 ====================
const displayPrice = computed(() => {
  return bindVin.value === 0 ? peart.value.Price : bindVin.value;
});

// ==================== 生命周期 ====================
onLoad((option) => {
  if (option.PersonDistributionUserID != undefined) {
    hidMind.value = option.PersonDistributionUserID;
  }
  couponId.value = option.id;
  fetchCouponDetail();
});

// ==================== 数据请求 ====================

async function fetchCouponDetail() {
  try {
    const res = await uni.$myRequest({
      url: "/api/AppletsIndoor/CouponCenterCouponDetail",
      data: {
        CouponCenterID: couponId.value,
        PersonDistributionUserID: hidMind.value,
      },
      method: "POST",
    });
    if (res.data.Code === 200) {
      const data = res.data.Data || {};
      tabList.value = data.CouponPackageDetalList || [];
      couponCount.value = tabList.value.length;
      Description.value = data.Intro || "";
      peart.value = data;
      bindtik.value = data;
    }
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================

function goToHome() {
  uni.reLaunch({ url: PAGE_ROUTES.home });
}

// ==================== 业务方法 ====================

function onQuantityChange(e) {
  const val = e.value || e;
  bindVin.value = (bindtik.value.Price * val).toFixed(2);
}

async function handleSubmit() {
  if (payLoading.value) return;
  payLoading.value = true;

  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/AppletsIndoor/ConfirmReceiveCoupon",
      data: {
        CouponCenterID: couponId.value,
        openId: openid.openid,
        ChooseCompanyID: 0,
        ChooseScenicID: 0,
        PersonDistributionUserID: hidMind.value,
        Number: quantity.value,
      },
      method: "POST",
    });

    if (res.data.Code === 300) {
      payLoading.value = false;
      return;
    }

    if (res.data.Code === 200) {
      payLoading.value = false;
      showToast(res.data.Message || "领取成功", "success");
      goToHome();
      return;
    }

    if (res.data.Code === 600) {
      const payData = res.data.Data || {};
      uni.requestPayment({
        paySign: payData.paySign,
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package_str,
        signType: payData.signType,
        success() {
          goToHome();
        },
        fail() {
          payLoading.value = false;
          showToast("支付取消或失败");
        },
      });
      return;
    }

    payLoading.value = false;
  } catch (err) {
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

<style lang="scss" scoped>
/* ============================================================
   优惠券详情页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.rolldetails-page__xxx
   ============================================================ */

.rolldetails-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

/* 区块标题 */
.rolldetails-page__section-title {
  padding: 24rpx 24rpx 12rpx;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
}

/* 券卡片 */
.rolldetails-page__coupon-card {
  display: flex;
  margin: 0 24rpx 20rpx;
  padding: 20rpx;
  border: 1rpx solid var(--color-border-light);
  border-radius: var(--radius-card, 28rpx);
  background-color: var(--color-bg-card);
}

.rolldetails-page__coupon-left {
  position: relative;
  flex-shrink: 0;
}

.rolldetails-page__coupon-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: var(--radius-sm, 16rpx);
}

.rolldetails-page__coupon-type {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-secondary);
  color: var(--color-text-on-primary);
  padding: 8rpx 0;
  text-align: center;
  border-radius: 0 0 var(--radius-sm, 16rpx) var(--radius-sm, 16rpx);
  font-size: var(--font-size-small, 22rpx);
}

.rolldetails-page__coupon-right {
  flex: 1;
  margin-left: 20rpx;
}

.rolldetails-page__coupon-name {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  display: block;
}

.rolldetails-page__coupon-amount {
  display: block;
  margin-top: 8rpx;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption, 24rpx);
}

.rolldetails-page__coupon-label {
  display: block;
  margin-top: 8rpx;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption, 24rpx);
}

.rolldetails-page__coupon-period {
  display: block;
  margin-top: 4rpx;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption, 24rpx);
}

/* 价格行 */
.rolldetails-page__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 24rpx 20rpx;
  padding: 20rpx;
  border-bottom: 1rpx solid var(--color-border-light);
  color: var(--color-danger);
}

.rolldetails-page__price-value {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 700;
  color: var(--color-danger);
}

/* 规则说明 */
.rolldetails-page__rules {
  margin: 0 24rpx 40rpx;
  padding: 20rpx;
  border-top: 1rpx solid var(--color-border-light);
  min-height: 300rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  line-height: 1.75;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}

/* 按钮 */
.rolldetails-page__btn-area {
  padding: 0 24rpx;
}

.rolldetails-page__btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: 9999rpx;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;

  &:active {
    opacity: 0.88;
    transform: scale(0.96);
  }

  &--disabled {
    opacity: 0.85;
    transform: none;
  }
}
</style>
