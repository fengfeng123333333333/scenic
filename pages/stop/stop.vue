<!--
  停车缴费页 — 车牌输入 + 查询停车订单 + 微信支付
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  支付流程遵循 §0.3 支付统一规范
  旧函数映射：handleQuery → onQuery / handlePay → onPay
              focusInput / selectProvince / selectChar / deleteChar 保留
-->
<template>
  <view class="stop-page" :style="$themeStyle">
    <!-- 输入区卡片 -->
    <view class="stop-page__input-card">
      <view class="stop-page__input-title">请输入车牌号码</view>
      <view class="stop-page__input-row">
        <!-- 省份简称 -->
        <view
          class="stop-page__input-item stop-page__input-item--province"
          :class="{ 'stop-page__input-item--active': currentIndex === 0 }"
          @click="focusInput(0)"
        >
          <text v-if="carNo[0]">{{ carNo[0] }}</text>
          <view
            v-else
            class="stop-page__cursor"
            :class="{ 'stop-page__cursor--blink': currentIndex === 0 }"
          />
        </view>
        <!-- 分隔点 -->
        <view class="stop-page__input-dot">·</view>
        <!-- 车牌 6 位（索引 1~6） -->
        <view
          v-for="n in 6"
          :key="n"
          class="stop-page__input-item"
          :class="{ 'stop-page__input-item--active': currentIndex === n }"
          @click="focusInput(n)"
        >
          <text v-if="carNo[n]">{{ carNo[n] }}</text>
          <view
            v-else
            class="stop-page__cursor"
            :class="{ 'stop-page__cursor--blink': currentIndex === n }"
          />
        </view>
        <!-- 新能源位 -->
        <view
          class="stop-page__input-item stop-page__input-item--new-energy"
          :class="{
            'stop-page__input-item--active': currentIndex === 7,
            'stop-page__input-item--filled': carNo[7],
          }"
          @click="focusInput(7)"
        >
          <text v-if="carNo[7]">{{ carNo[7] }}</text>
          <text v-else class="stop-page__input-placeholder">新能源</text>
        </view>
      </view>
      <view class="stop-page__input-tip"
        >蓝牌/黄牌输入7位，新能源输入8位111</view
      >
    </view>

    <!-- 查询按钮 -->
    <view class="stop-page__btn-area">
      <view
        class="stop-page__query-btn"
        :class="{ 'stop-page__query-btn--disabled': !isInputComplete }"
        @click="onQuery"
      >
        查询缴费
      </view>
    </view>

    <!-- 动态键盘 -->
    <view class="stop-page__keyboard" v-show="showKeyboard">
      <!-- 省份键盘 -->
      <view
        v-if="currentKeyboardType === 'province'"
        class="stop-page__keyboard-body"
      >
        <view
          class="stop-page__keyboard-row"
          v-for="(row, rowIndex) in provinceList"
          :key="rowIndex"
        >
          <view
            v-for="(item, colIndex) in row"
            :key="colIndex"
            class="stop-page__key"
            :class="{ 'stop-page__key--active': item === carNo[0] }"
            @click="selectProvince(item)"
            >{{ item }}</view
          >
          <view
            v-if="rowIndex === 3"
            class="stop-page__key stop-page__key--delete"
            @click="deleteChar"
            >⌫</view
          >
        </view>
      </view>

      <!-- 字母数字键盘 -->
      <view
        v-else-if="currentKeyboardType === 'alphanumeric'"
        class="stop-page__keyboard-body"
      >
        <view class="stop-page__keyboard-row">
          <view
            v-for="num in keyboardRows.numbers"
            :key="num"
            class="stop-page__key stop-page__key--number"
            @click="selectChar(num)"
            >{{ num }}</view
          >
        </view>
        <view class="stop-page__keyboard-row">
          <view
            v-for="key in keyboardRows.letters[0]"
            :key="key"
            class="stop-page__key"
            @click="selectChar(key)"
            >{{ key }}</view
          >
        </view>
        <view class="stop-page__keyboard-row">
          <view
            v-for="key in keyboardRows.letters[1]"
            :key="key"
            class="stop-page__key"
            @click="selectChar(key)"
            >{{ key }}</view
          >
        </view>
        <view class="stop-page__keyboard-row">
          <view
            v-for="key in keyboardRows.letters[2]"
            :key="key"
            class="stop-page__key"
            @click="selectChar(key)"
            >{{ key }}</view
          >
          <view
            class="stop-page__key stop-page__key--delete"
            @click="deleteChar"
            >⌫</view
          >
        </view>
      </view>
    </view>

    <!-- 缴费弹窗 -->
    <view
      v-if="showPayModal"
      class="stop-page__modal-overlay"
      @click="showPayModal = false"
    />
    <view v-if="showPayModal" class="stop-page__pay-modal">
      <view class="stop-page__modal-header">
        <text class="stop-page__modal-title">请缴费</text>
        <text class="stop-page__modal-close" @click="showPayModal = false"
          >×</text
        >
      </view>
      <view class="stop-page__modal-body">
        <view class="stop-page__info-item">
          <text class="stop-page__info-label">车牌号：</text>
          <text class="stop-page__info-value">{{ stopDetail.plate_no }}</text>
        </view>
        <view class="stop-page__info-item">
          <text class="stop-page__info-label">订单号：</text>
          <text class="stop-page__info-value">{{ stopDetail.order_no }}</text>
        </view>
        <view class="stop-page__info-item">
          <text class="stop-page__info-label">入场时间：</text>
          <text class="stop-page__info-value">{{ stopDetail.enter_time }}</text>
        </view>
        <view class="stop-page__info-item">
          <text class="stop-page__info-label">停车时长：</text>
          <text class="stop-page__info-value">{{
            stopDetail.parking_time
          }}</text>
        </view>
        <view class="stop-page__info-item">
          <text class="stop-page__info-label">应缴费用：</text>
          <text class="stop-page__info-price">¥{{ stopDetail.pay_fee }}元</text>
        </view>
      </view>
      <view class="stop-page__modal-footer">
        <view
          class="stop-page__pay-btn"
          :class="{ 'stop-page__pay-btn--disabled': payLoading }"
          @click="onPay"
        >
          <template v-if="payLoading">
            <u-loading-icon
              mode="circle"
              size="18"
              color="var(--color-text-on-primary)"
            />
            <text>支付中...</text>
          </template>
          <text v-else>确认支付</text>
        </view>
      </view>
    </view>

    <!-- 支付成功弹窗 -->
    <view v-if="showSuccessModal" class="stop-page__success-overlay">
      <view class="stop-page__success-box">
        <view class="stop-page__success-icon">
          <text class="stop-page__success-check">✓</text>
        </view>
        <view class="stop-page__success-title">支付成功</view>
        <view class="stop-page__success-desc">请尽快离场</view>
        <view class="stop-page__success-tip">3秒后自动返回订单列表...</view>
      </view>
    </view>

    <!-- 支付中遮罩 -->
    <RequestLoading v-if="payLoading" text="正在支付..." />

    <!-- Toast -->
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  home: "/pages/index/index",
};

// ==================== 常量数据 ====================
const provinceList = [
  ["京", "津", "沪", "渝", "冀", "豫", "云", "辽", "黑"],
  ["湘", "皖", "鲁", "新", "苏", "浙", "赣", "鄂", "桂"],
  ["甘", "晋", "蒙", "陕", "吉", "闽", "贵", "粤", "青"],
  ["藏", "川", "宁", "琼", "使", "领", "警", "军", "挂", "学", "临", "试"],
];

const keyboardRows = {
  numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  letters: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ],
};

// ==================== 数据 ====================
const carNo = ref(["", "", "", "", "", "", "", ""]);
const currentIndex = ref(0);
const showKeyboard = ref(true);
const currentKeyboardType = ref("province");
const isInputComplete = ref(false);
const showPayModal = ref(false);
const stopDetail = ref({});
const payLoading = ref(false);
const showSuccessModal = ref(false);

// ==================== Refs ====================
const uToastRef = ref(null);

// ==================== 生命周期 ====================
onLoad(() => {
  currentKeyboardType.value = "province";
  showKeyboard.value = true;
});

// ==================== 监听 ====================
watch(
  carNo,
  (newVal) => {
    // 索引 0~6（省份 + 6位车牌）全部非空 → 输入完成
    isInputComplete.value = newVal.slice(0, 7).every((item) => item !== "");
  },
  { deep: true },
);

// ==================== 键盘操作 ====================

function focusInput(index) {
  currentIndex.value = index;
  showKeyboard.value = true;
  currentKeyboardType.value = index === 0 ? "province" : "alphanumeric";
}

function selectProvince(province) {
  carNo.value[0] = province;
  currentIndex.value = 1;
  currentKeyboardType.value = "alphanumeric";
}

function selectChar(char) {
  if (!isValidChar(char)) {
    showToast("请输入合法的车牌字符");
    return;
  }
  carNo.value[currentIndex.value] = char;

  // 输入第 6 位（索引 6）→ 键盘消失，光标不动
  if (currentIndex.value === 6) {
    setTimeout(() => {
      showKeyboard.value = false;
    }, 300);
    return;
  }

  // 前 5 位依次前进
  if (currentIndex.value < 6) {
    currentIndex.value++;
  }
}

function isValidChar(char) {
  const allLetters = [
    ...keyboardRows.letters[0],
    ...keyboardRows.letters[1],
    ...keyboardRows.letters[2],
  ];
  // 第 1 位车牌（索引 1）仅允许字母
  if (currentIndex.value === 1) return allLetters.includes(char);
  return allLetters.includes(char) || keyboardRows.numbers.includes(char);
}

function deleteChar() {
  if (currentIndex.value >= 0) {
    carNo.value[currentIndex.value] = "";
    if (currentIndex.value > 0) {
      currentIndex.value--;
      showKeyboard.value = true;
    }
    currentKeyboardType.value =
      currentIndex.value === 0 ? "province" : "alphanumeric";
  }
}

// ==================== 导航辅助 ====================

function goToHome() {
  uni.reLaunch({ url: PAGE_ROUTES.home });
}

// ==================== 业务方法 ====================

/** 查询停车订单 */
async function onQuery() {
  if (!isInputComplete.value) return;
  const openid = uni.getStorageSync("userinfo");
  const plateNo = carNo.value.join("");
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetParkingOrder",
    data: { OpenId: openid.openid, PlateNo: plateNo },
    method: "POST",
  });
  if (res.data.Code === 200) {
    stopDetail.value = res.data.Data || {};
    showPayModal.value = true;
  } else {
    showToast(res.data.Message || "未查询到停车订单");
  }
}

/** 确认支付 */
async function onPay() {
  if (payLoading.value) return;
  payLoading.value = true;

  try {
    const openid = uni.getStorageSync("userinfo");

    // ① 创建停车支付订单
    const orderRes = await uni.$myRequest({
      url: "/api/Applets/AppletsCreateParkingOrder",
      data: {
        OpenId: openid.openid,
        PlateNo: stopDetail.value.plate_no,
        OrderNo: stopDetail.value.order_no,
        TotalMoney: stopDetail.value.pay_fee,
        Remark: stopDetail.value.parking_time,
        ParkID: stopDetail.value.park_id,
      },
      method: "POST",
    });

    if (orderRes.data.Code !== 200) {
      payLoading.value = false;
      //   showToast(orderRes.data.Message || "创建订单失败");
      return;
    }

    // ② 调用停车支付接口
    const payRes = await uni.$myRequest({
      url: "/api/Applets/AppletsPayParkingOrder",
      data: {
        OpenId: openid.openid,
        OrderID: orderRes.data.Data.OrderID,
        PayType: 0,
      },
      method: "POST",
    });

    if (payRes.data.Code !== 200) {
      payLoading.value = false;
      //   showToast(payRes.data.Message || "支付下单失败");
      return;
    }

    // ③ 调起微信支付
    const payInfo = payRes.data.Data || {};
    uni.requestPayment({
      paySign: payInfo.paySign,
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package_str,
      signType: payInfo.signType,
      success: () => {
        showPayModal.value = false;
        showSuccessModal.value = true;
        setTimeout(() => {
          showSuccessModal.value = false;
          payLoading.value = false;
          goToHome();
        }, 3000);
      },
      fail: () => {
        payLoading.value = false;
        showToast("支付取消或失败");
      },
    });
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
   停车缴费页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.stop-page__xxx
   ============================================================ */

.stop-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 20rpx;
  box-sizing: border-box;
}

/* ====== 输入卡片 ====== */
.stop-page__input-card {
  margin: 40rpx 30rpx;
  padding: 40rpx 30rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-card, 28rpx);
  box-shadow: var(--shadow-soft);
}

.stop-page__input-title {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 30rpx;
}

.stop-page__input-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
  flex-wrap: nowrap;
}

.stop-page__input-item {
  width: 80rpx;
  height: 90rpx;
  border: 2rpx solid var(--color-border-light);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-bg-card);
  position: relative;
  transition: all 0.2s ease;

  &--province {
    width: 90rpx;
  }

  &--new-energy {
    width: 100rpx;
  }

  &--active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg-light);
  }

  &--filled {
    /* 新能源位已填充 */
  }
}

.stop-page__input-placeholder {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  font-weight: 400;
}

.stop-page__cursor {
  width: 2rpx;
  height: 40rpx;
  background: var(--color-primary);
  opacity: 0;
  position: absolute;

  &--blink {
    opacity: 1;
    animation: stopBlink 1s infinite;
  }
}

@keyframes stopBlink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.stop-page__input-dot {
  font-size: 36rpx;
  color: var(--color-text-secondary);
  margin: 0 5rpx;
}

.stop-page__input-tip {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* ====== 查询按钮 ====== */
.stop-page__btn-area {
  padding: 0 30rpx;
  margin-top: 20rpx;
}

.stop-page__query-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: 48rpx;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &--disabled {
    background: var(--color-disabled);
    box-shadow: none;
    color: var(--color-text-secondary);
  }
}

/* ====== 键盘 ====== */
.stop-page__keyboard {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg);
  padding: 20rpx 10rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  z-index: 998;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stop-page__keyboard-body {
  background: var(--color-bg);
}

.stop-page__keyboard-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  gap: 10rpx;
}

.stop-page__key {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: var(--color-bg-card);
  border-radius: 8rpx;
  text-align: center;
  font-size: 32rpx;
  color: var(--color-text);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  transition: all 0.1s ease;

  &:active {
    background: var(--color-primary-bg-light);
    color: var(--color-primary);
    transform: scale(0.96);
  }

  &--active {
    background: var(--color-primary);
    color: var(--color-text-on-primary);
  }

  &--delete {
    flex: 1.5;
    background: var(--color-border-light);
    font-size: 36rpx;
  }

  &--number {
    font-weight: 600;
  }
}

/* ====== 缴费弹窗 ====== */
.stop-page__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.stop-page__pay-modal {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: var(--color-bg-card);
  border-radius: var(--radius-card, 28rpx) var(--radius-card, 28rpx) 0 0;
  z-index: 999;
  animation: stopSlideUp 0.3s ease;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

@keyframes stopSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.stop-page__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid var(--color-border-light);
}

.stop-page__modal-title {
  font-size: var(--font-size-h1, 36rpx);
  font-weight: 600;
  color: var(--color-text);
}

.stop-page__modal-close {
  font-size: 48rpx;
  color: var(--color-text-secondary);
  line-height: 1;
}

.stop-page__modal-body {
  padding: 30rpx;
}

.stop-page__info-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  font-size: var(--font-size-body, 28rpx);
}

.stop-page__info-label {
  width: 180rpx;
  color: var(--color-text-secondary);
}

.stop-page__info-value {
  color: var(--color-text);
  font-weight: 500;
}

.stop-page__info-price {
  color: var(--color-danger);
  font-size: var(--font-size-h1, 36rpx);
  font-weight: 700;
}

.stop-page__modal-footer {
  padding: 20rpx 30rpx 40rpx;
}

.stop-page__pay-btn {
  width: 100%;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: 45rpx;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  transition: opacity 0.12s ease;

  &:active {
    opacity: 0.88;
    transform: scale(0.96);
  }

  &--disabled {
    opacity: 0.85;
    transform: none;
  }
}

/* ====== 成功弹窗 ====== */
.stop-page__success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: stopModalFadeIn 0.3s ease forwards;
}

.stop-page__success-box {
  width: 320rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-card, 28rpx);
  padding: 50rpx 40rpx;
  text-align: center;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.15);
  animation: stopBoxScale 0.3s ease forwards;
}

.stop-page__success-icon {
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 30rpx;
  background: linear-gradient(135deg, #07c160, #09be95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stop-page__success-check {
  font-size: 50rpx;
  color: var(--color-text-on-primary);
  font-weight: bold;
}

.stop-page__success-title {
  font-size: var(--font-size-h1, 36rpx);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16rpx;
}

.stop-page__success-desc {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
  margin-bottom: 20rpx;
}

.stop-page__success-tip {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

@keyframes stopModalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes stopBoxScale {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
