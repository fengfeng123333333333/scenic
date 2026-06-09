<!--
  我的资料页 — 查看/编辑基本信息 + 收款资料
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
  <view class="profile-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="保存中..." />

    <!-- 基本信息 -->
    <view class="profile-page__section">
      <view class="profile-page__section-title">基本信息</view>
      <view class="profile-page__card">
        <u-cell-group>
          <u-cell size="large" title="编码" :value="data.Code" />
          <u-cell size="large" title="姓名" :value="data.Name" />
          <u-cell size="large" title="手机号" :value="data.Phone" />
        </u-cell-group>
      </view>
    </view>

    <!-- 收款资料 -->
    <view class="profile-page__section">
      <view class="profile-page__section-title">收款资料</view>
      <view class="profile-page__card">
        <u-cell-group>
          <u-cell size="large" isLink @click="onUploadQr">
            <template #title>
              <text>微信或支付宝收款码</text>
              <text class="profile-page__required">*</text>
            </template>
            <template #value>
              <text class="profile-page__hint">点击上传收款码</text>
            </template>
          </u-cell>
          <u-cell size="large" title="开户姓名">
            <template #value>
              <u-input
                border="none"
                placeholder="选填"
                v-model="data.AccountName"
                inputAlign="right"
              />
            </template>
          </u-cell>
          <u-cell size="large" title="开户银行">
            <template #value>
              <u-input
                border="none"
                placeholder="选填"
                v-model="data.Bank"
                inputAlign="right"
              />
            </template>
          </u-cell>
          <u-cell size="large" title="银行卡号">
            <template #value>
              <u-input
                border="none"
                placeholder="选填"
                v-model="data.BankCard"
                inputAlign="right"
              />
            </template>
          </u-cell>
        </u-cell-group>
      </view>
    </view>

    <!-- 保存 -->
    <view class="profile-page__btn" @click="onSave">保存</view>

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";

const { uToastRef, showToast } = useToast();

const data = reactive({
  Code: "",
  Name: "",
  Phone: "",
  AccountName: "",
  Bank: "",
  BankCard: "",
  PaymentImgUrl: "",
  PersonDistributionUserID: 0,
});
const requestLoading = ref(false);
let backTimer = null;
onBeforeUnmount(() => {
  if (backTimer) clearTimeout(backTimer);
});
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
    console.error("[myDist] err:", err);
  } finally {
    requestLoading.value = false;
  }
}

function onUploadQr() {
  uni.chooseImage({
    count: 1,
    sizeType: ["original", "compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      uni.uploadFile({
        url: "https://saasapp.huibaitech.com/api/Applets/UploadFile",
        filePath: res.tempFilePaths[0],
        name: "file",
        header: { AppID: uni.getAccountInfoSync().miniProgram.appId },
        success: (uploadRes) => {
          try {
            const obj = JSON.parse(uploadRes.data);
            if (obj.Code === 200) {
              data.PaymentImgUrl = obj.Data.ImgUrl;
              showToast("上传成功", "success");
            } else showToast("图片太大，请重新选择！");
          } catch {
            showToast("上传失败，请重试");
          }
        },
        fail: () => {
          showToast("上传失败，请检查网络");
        },
      });
    },
  });
}

async function onSave() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsUpdatePersonDis",
      method: "POST",
      data: {
        OpenId: openid?.openid || "",
        PersonDistributionUserID: data.PersonDistributionUserID,
        PaymentImgUrl: data.PaymentImgUrl,
        AccountName: data.AccountName,
        Bank: data.Bank,
        BankCard: data.BankCard,
      },
    });
    if (res.data?.Code === 200) {
      showToast("保存成功", "success");
      backTimer = setTimeout(() => {
        uni.navigateBack();
      }, 1200);
    }
  } catch (err) {
    console.error("[myDist] save err:", err);
  } finally {
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: 40rpx;
}
.profile-page__section {
}
.profile-page__section-title {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  padding: 20rpx 0 20rpx 32rpx;
}
.profile-page__card {
  background: var(--color-bg-card);
}
.profile-page__required {
  color: var(--color-danger);
  margin-left: 8rpx;
}
.profile-page__hint {
  color: var(--color-disabled);
  font-size: var(--font-size-caption, 24rpx);
}
.profile-page__btn {
  width: 580rpx;
  margin: 50rpx auto 0;
  padding: 20rpx 0;
  border-radius: var(--radius-button);
  text-align: center;
  font-size: var(--font-size-subtitle, 32rpx);
  font-weight: 600;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.profile-page__btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}
</style>
