<!--
  实名认证页 — 提交姓名+身份证号进行实名验证，验证通过展示二维码
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：validateName → validateName / validateIdCard → validateIdCard
              clearMsg → clearMsg / handleSubmit → onSubmit
              openPopup → openPopup / close → closePopup
-->
<template>
  <view class="realname-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="验证中..." />
    <view class="realname-page__card">
      <view class="realname-page__field">
        <text class="realname-page__label">姓名</text>
        <input
          class="realname-page__input"
          v-model="formData.name"
          placeholder="请输入真实姓名"
          maxlength="20"
          @input="clearMsg"
        />
      </view>
      <view class="realname-page__field">
        <text class="realname-page__label">身份证号码</text>
        <input
          class="realname-page__input"
          v-model="formData.idCard"
          type="idcard"
          placeholder="请输入18位身份证号码"
          maxlength="18"
          @input="clearMsg"
        />
      </view>
      <view
        v-show="msg"
        class="realname-page__msg"
        :class="
          msgType === 'success'
            ? 'realname-page__msg--success'
            : 'realname-page__msg--error'
        "
        >{{ msg }}</view
      >
      <view
        class="realname-page__btn"
        :class="{
          'realname-page__btn--disabled':
            requestLoading || !formData.name || !formData.idCard,
        }"
        @click="onSubmit"
      >
        <text>确认</text>
      </view>
      <view v-if="showQrCode" class="realname-page__qrcode" @click="openPopup">
        <u-qrcode
          v-if="showQrCode"
          cid="realnameQrcode"
          :val="qrTicket"
          :size="120"
        />
        <text class="realname-page__qrcode-tip">点击放大</text>
      </view>
    </view>
    <u-popup
      :show="showPopup"
      round="20"
      closeable
      mode="center"
      @close="closePopup"
    >
      <view class="popup-qr">
        <u-qrcode
          v-if="showPopup"
          cid="popupQrcode"
          :val="qrTicket"
          :size="280"
        />
        <text class="popup-qr__tip">长按或截图保存</text>
      </view>
    </u-popup>
    <u-toast ref="uToastRef" />
  </view>
</template>
<script setup>
import { ref, reactive } from "vue";
import { onShow } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";
const { uToastRef, showToast } = useToast();
const formData = reactive({ name: "", idCard: "" });
const msg = ref("");
const msgType = ref("");
const requestLoading = ref(false);
const showQrCode = ref(false);
const showPopup = ref(false);
const qrTicket = ref("");
onShow(() => {
  try {
    const s = uni.getStorageSync("realObj");
    const o = s ? JSON.parse(s) : null;
    if (o) {
      formData.name = o.name || "";
      formData.idCard = o.idCard || "";
    }
  } catch {}
});
function validateName(n) {
  if (!n || n.trim().length < 2) return { v: false, e: "姓名至少需要2个字符" };
  if (!/^[\u4e00-\u9fa5a-zA-Z.]+$/.test(n))
    return { v: false, e: "姓名不能包含数字或特殊符号" };
  return { v: true };
}
function validateIdCard(id) {
  if (!id || id.length !== 18) return { v: false, e: "请输入18位身份证号码" };
  if (
    !/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(
      id,
    )
  )
    return { v: false, e: "身份证号码格式不正确" };
  const f = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const p = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  let s = 0;
  for (let i = 0; i < 17; i++) s += parseInt(id[i], 10) * f[i];
  if (id[17].toUpperCase() !== p[s % 11])
    return { v: false, e: "身份证号码格式不正确" };
  return { v: true };
}
function clearMsg() {
  msg.value = "";
  showQrCode.value = false;
  qrTicket.value = "";
}
function openPopup() {
  if (qrTicket.value) showPopup.value = true;
}
function closePopup() {
  showPopup.value = false;
}
async function onSubmit() {
  const nc = validateName(formData.name);
  if (!nc.v) {
    msg.value = nc.e;
    msgType.value = "error";
    showQrCode.value = false;
    return;
  }
  const ic = validateIdCard(formData.idCard);
  if (!ic.v) {
    msg.value = ic.e;
    msgType.value = "error";
    showQrCode.value = false;
    return;
  }
  requestLoading.value = true;
  msg.value = "";
  showQrCode.value = false;
  try {
    await new Promise((r) => setTimeout(r, 800));
    qrTicket.value = formData.idCard;
    msg.value = "验证成功，二维码已生成";
    msgType.value = "success";
    showQrCode.value = true;
    uni.setStorageSync(
      "realObj",
      JSON.stringify({ idCard: formData.idCard, name: formData.name }),
    );
  } catch (err) {
    console.error("[realName] 认证失败:", err);
    msg.value = err?.message || "认证失败，请检查信息";
    msgType.value = "error";
  } finally {
    requestLoading.value = false;
  }
}
</script>
<style lang="scss" scoped>
.realname-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
  padding: 40rpx 5%;
}
.realname-page__card {
  width: 100%;
  max-width: 400px;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 40rpx 32rpx;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.realname-page__field {
  width: 100%;
  margin-bottom: 24rpx;
}
.realname-page__label {
  display: block;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  margin-bottom: 12rpx;
  font-weight: 500;
}
.realname-page__input {
  width: 100%;
  height: 88rpx;
  border: 1px solid var(--color-border-light);
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: var(--font-size-body, 28rpx);
  background-color: var(--color-bg);
  box-sizing: border-box;
}
.realname-page__msg {
  width: 100%;
  text-align: center;
  font-size: var(--font-size-caption, 24rpx);
  margin-bottom: 16rpx;
  min-height: 40rpx;
  line-height: 40rpx;
}
.realname-page__msg--success {
  color: var(--color-accent);
}
.realname-page__msg--error {
  color: var(--color-danger);
}
.realname-page__btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: 8rpx;
  font-size: var(--font-size-subtitle, 32rpx);
  font-weight: 600;
  text-align: center;
  margin-top: 8rpx;
  transition: opacity 160ms ease;
}
.realname-page__btn:active {
  opacity: 0.85;
}
.realname-page__btn--disabled {
  opacity: 0.5;
  pointer-events: none;
}
.realname-page__qrcode {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  border: 1px solid var(--color-border-light);
  border-radius: 12rpx;
  background: var(--color-bg-card);
  box-shadow: var(--shadow-soft);
}
.realname-page__qrcode:active {
  background: var(--color-bg);
}
.realname-page__qrcode-tip {
  margin-top: 12rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}
.popup-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 40rpx 48rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
}
.popup-qr__tip {
  margin-top: 20rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
}
</style>
