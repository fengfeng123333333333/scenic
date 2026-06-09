<!--
  提现页 — 展示待提现佣金 + 申请提现
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
  <view class="cashout-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="处理中..." />

    <view class="cashout-page__label">
      待提现佣金
      <view class="cashout-page__help" @click="goHelp">
        <u-icon
          name="question-circle"
          color="var(--color-text-secondary)"
          size="22"
        />
      </view>
    </view>
    <view class="cashout-page__amount">￥ {{ data.WaitRebateMoney }}</view>
    <view class="cashout-page__btn" @click="onSubmit">申请提现</view>

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";

const { uToastRef, showToast } = useToast();

const data = reactive({ WaitRebateMoney: 0, PersonDistributionUserID: "" });
const requestLoading = ref(false);

onLoad(() => {
  fetchData();
});

async function fetchData() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsPersonDistributorMain",
      method: "POST",
      data: { OpenId: openid?.openid || "" },
    });
    Object.assign(data, res.data?.Data || {});
  } catch (err) {
    console.error("[finticer] err:", err);
  } finally {
    requestLoading.value = false;
  }
}

function goHelp() {
  uni.navigateTo({ url: "/pages/subPack/distribution/finenoti" });
}

async function onSubmit() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsApplyPersonDisSettle",
      method: "POST",
      data: {
        OpenId: openid?.openid || "",
        PersonDistributionUserID: data.PersonDistributionUserID,
      },
    });
    if (res.data?.Code === 200) {
      showToast(res.data.Message, "success");
      setTimeout(() => {
        uni.switchTab({ url: "/pages/index/index" });
      }, 1200);
    }
  } catch (err) {
    console.error("[finticer] submit err:", err);
  } finally {
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.cashout-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}
.cashout-page__label {
  text-align: center;
  font-size: var(--font-size-h2, 30rpx);
  color: var(--color-text);
  height: 100rpx;
  line-height: 100rpx;
  position: relative;
}
.cashout-page__help {
  position: absolute;
  right: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-light);
  border-radius: 50%;
}
.cashout-page__amount {
  text-align: center;
  font-size: var(--font-size-h1, 36rpx);
  font-weight: 700;
  color: var(--color-danger);
}
.cashout-page__btn {
  width: 220rpx;
  margin: 40rpx auto 0;
  padding: 14rpx 0;
  border-radius: 15rpx;
  text-align: center;
  font-size: var(--font-size-subtitle, 32rpx);
  font-weight: 600;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.cashout-page__btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}
</style>
