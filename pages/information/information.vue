<!--
  授权登录页 — 微信手机号授权 + 用户协议确认
  遵循 page-refactor-standard.md & 设计稿规范.md
  跟随全局主题动态切换

  旧函数映射：
    getPhoneNumber → handleGetPhone
    tickcar        → goAgreement
-->
<template>
  <view class="auth-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="授权中..." />

    <!-- Logo 区 -->
    <view class="auth-page__hero">
      <view class="auth-page__logo">
        <u-icon name="coupon-fill" color="var(--color-primary)" size="64" />
      </view>
      <text class="auth-page__title">saas售票</text>
    </view>

    <!-- 说明文字 -->
    <view class="auth-page__desc">
      <text>
        您暂未授权saas售票小程序获取您的信息，将无法正常使用小程序功能。如需正常使用，请点击下方按钮打开头像，昵称等信息的授权。
      </text>
    </view>

    <!-- 手机号授权按钮 -->
    <view class="auth-page__actions">
      <button
        class="auth-page__btn"
        hover-class="auth-page__btn--pressed"
        open-type="getPhoneNumber"
        @getphonenumber="handleGetPhone"
      >
        手机号快捷登录
      </button>
    </view>

    <!-- 协议 -->
    <view class="auth-page__agree">
      <u-radio-group v-model="agreed">
        <u-radio
          shape="circle"
          name="agree"
          label="我已阅读理解并同意"
          activeColor="var(--color-primary)"
        />
      </u-radio-group>
      <view class="auth-page__links">
        <text class="auth-page__link" @click="goAgreement(0)"
          >《用户服务协议》</text
        >
        <text class="auth-page__link" @click="goAgreement(1)"
          >《隐私政策协议》</text
        >
      </view>
    </view>

    <!-- 授权确认弹窗 -->
    <u-modal
      :show="showModal"
      title="提示"
      content="是否同意获取你的手机号"
      showCancelButton
      @confirm="onModalConfirm"
      @cancel="onModalCancel"
    />

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";

const { uToastRef, showToast } = useToast();

// ==================== 数据 ====================
const agreed = ref("");
const requestLoading = ref(false);
const showModal = ref(false);

// 暂存授权事件对象（供弹窗确认后使用）
let pendingEvent = null;

// ==================== 业务方法 ====================
function goAgreement(val) {
  uni.navigateTo({ url: `/pages/subPack/coinsup/coinsup?car=${val}` });
}

function handleGetPhone(e) {
  if (!agreed.value) {
    showToast("请先阅读并同意用户协议");
    return;
  }
  if (e.detail.errMsg !== "getPhoneNumber:ok") return;
  pendingEvent = e;
  showModal.value = true;
}

function onModalCancel() {
  showModal.value = false;
  pendingEvent = null;
}

async function onModalConfirm() {
  showModal.value = false;
  if (!pendingEvent) return;
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/GetUserPhoneNumber",
      method: "POST",
      data: { code: pendingEvent.detail.code, openid: openid?.openid || "" },
    });
    if (res.data?.Code === 200) {
      uni.setStorageSync({
        key: "phone",
        data: res.data.Data?.phone_info || {},
      });
      uni.reLaunch({ url: "/pages/index/index" });
    }
  } catch (err) {
    console.error("[information] err:", err);
    showToast("授权失败，请重试");
  } finally {
    requestLoading.value = false;
    pendingEvent = null;
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

/* ====== Logo 区 ====== */
.auth-page__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 150rpx;
}

.auth-page__logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: var(--color-primary-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
}

.auth-page__title {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 30rpx;
}

/* ====== 说明文字 ====== */
.auth-page__desc {
  margin-top: 40rpx;

  text {
    font-size: var(--font-size-caption, 25rpx);
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
}

/* ====== 授权按钮 ====== */
.auth-page__actions {
  width: 100%;
  margin-top: 70rpx;
}

.auth-page__btn {
  width: 100%;
  height: 88rpx;
  border-radius: var(--radius-button);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-page__btn::after {
  border: none;
}
.auth-page__btn--pressed {
  opacity: 0.88;
  transform: scale(0.98);
}

/* ====== 协议 ====== */
.auth-page__agree {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.auth-page__links {
  margin-top: 20rpx;
  display: flex;
  gap: 24rpx;
}

.auth-page__link {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-primary);
}
</style>
