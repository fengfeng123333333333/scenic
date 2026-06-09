<!--
  分销申请页 — 填写姓名/手机/申请说明提交分销商申请
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
  <view class="dist-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="处理中..." />
    <view class="dist-page__title">申请加入</view>
    <view class="dist-page__card" v-if="status === 200">
      <view class="dist-page__field">
        <text class="dist-page__label">姓名:</text>
        <u-input
          placeholder="请输入姓名"
          placeholderStyle="color: var(--color-text-on-primary)"
          color="var(--color-text-on-primary)"
          border="surround"
          v-model="name"
        />
      </view>
      <view class="dist-page__field">
        <text class="dist-page__label">手机号码:</text>
        <u-input
          placeholder="请输入手机号"
          placeholderStyle="color: var(--color-text-on-primary)"
          color="var(--color-text-on-primary)"
          border="surround"
          v-model="phone"
        />
      </view>
      <view class="dist-page__field">
        <text class="dist-page__label">申请说明:</text>
        <u-input
          placeholder="请输入申请说明"
          placeholderStyle="color: var(--color-text-on-primary)"
          color="var(--color-text-on-primary)"
          border="surround"
          v-model="remark"
        />
      </view>
    </view>
    <view class="dist-page__btn" v-if="status === 200" @click="onSubmit"
      >申请</view
    >
    <view class="dist-page__msg" v-if="status !== 200 && status !== 600">{{
      message
    }}</view>
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";

const { uToastRef, showToast } = useToast();
const name = ref("");
const phone = ref("");
const remark = ref("");
const status = ref(200);
const message = ref("");
const requestLoading = ref(false);

onLoad(() => {
  checkStatus();
});

async function checkStatus() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsApplyIsPersonDist",
      method: "POST",
      data: { OpenId: openid?.openid || "" },
    });
    status.value = res.data?.Code || 200;
    message.value = res.data?.Message || "";
    if (status.value === 600)
      uni.redirectTo({ url: "/pages/subPack/distribution/disbindMy" });
  } catch (err) {
    console.error("[distribution] err:", err);
  } finally {
    requestLoading.value = false;
  }
}

async function onSubmit() {
  if (!name.value) {
    showToast("姓名不能为空!");
    return;
  }
  if (!phone.value) {
    showToast("电话不能为空!");
    return;
  }
  if (!remark.value) {
    showToast("申请说明不能为空!");
    return;
  }
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsApplyPersonDistributor",
      method: "POST",
      data: {
        OpenId: openid?.openid || "",
        Name: name.value,
        Phone: phone.value,
        ApplyDescribe: remark.value,
      },
    });
    if (res.data?.Code === 200) {
      showToast("申请成功", "success");
      checkStatus();
    }
  } catch (err) {
    console.error("[distribution] submit err:", err);
  } finally {
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.dist-page {
  min-height: 100vh;
  background-image: url("https://cdn.huibaitech.com/qrcode/public/indoor/moneypic.jpg");
  background-size: cover;
  background-position: center;
  width: 100%;
  position: absolute;
}
.dist-page__title {
  color: var(--color-text-on-primary);
  font-size: var(--font-size-h1, 36rpx);
  letter-spacing: 10rpx;
  width: 100%;
  text-align: center;
  font-weight: 600;
  margin-top: 300rpx;
}
.dist-page__card {
  background: var(--color-bg-card);
  border-radius: 20rpx;
  margin-top: 100rpx;
  width: 90%;
  margin-left: 40rpx;
  padding: 50rpx 0 30rpx;
}
.dist-page__field {
  margin: 0 20rpx 50rpx;
  display: flex;
  align-items: center;
}
.dist-page__label {
  flex-shrink: 0;
  width: 160rpx;
  text-align: right;
  font-size: var(--font-size-body, 28rpx);
  margin-right: 10rpx;
  color: var(--color-text);
}
.dist-page__field :deep(.u-input) {
  flex: 1;
  background-color: var(--color-primary-dark);
  border-radius: 10rpx;
}
.dist-page__btn {
  font-size: var(--font-size-subtitle, 32rpx);
  font-weight: 600;
  width: 85%;
  margin-left: 40rpx;
  text-align: center;
  background: var(--color-bg-card);
  padding: 20rpx;
  margin-top: 50rpx;
  border-radius: 20rpx;
  color: var(--color-text);
  transition: opacity 160ms ease;
}
.dist-page__btn:active {
  opacity: 0.8;
}
.dist-page__msg {
  font-size: var(--font-size-body, 28rpx);
  width: 85%;
  margin-left: 40rpx;
  text-align: center;
  background: var(--color-bg-card);
  padding: 20rpx;
  margin-top: 500rpx;
  border-radius: 20rpx;
  color: var(--color-text);
}
</style>
