<template>
  <view class="my-page" :style="$themeStyle">
    <u-navbar
      title="个人中心"
      :placeholder="true"
      :autoBack="true"
      :fixed="false"
    />
    <!-- 头部 -->
    <view class="my-header">
      <view class="my-header__glow" />

      <view class="my-header__avatar" @click="ziliao">
        <image :src="infoList.FaceImgUrl" mode="aspectFill" />
      </view>
      <view class="my-header__name" @click="ziliao">
        {{ infoList.MemberName }}
        <u-icon name="edit-pen-fill" color="var(--color-bg-card)" size="18" />
      </view>
      <view class="my-header__phone">{{ infoList.Phone }}</view>
      <view class="my-header__bind" @click="bincard">绑卡</view>
    </view>

    <!-- 会员卡 -->
    <view class="my-card">
      <view class="my-card__badge" @click="dian">
        <u-icon name="coupon-fill" color="var(--color-primary)" size="36" />
      </view>
      <view class="my-card__level">
        <u-icon name="star-fill" color="var(--color-secondary)" size="20" />
        {{ infoList.CardLevelName }}
      </view>
      <view class="my-card__stats">
        <view class="my-card__stat">
          <text class="my-card__stat-value">{{
            infoList.CardMoney.toFixed(2)
          }}</text>
          <text class="my-card__stat-label">卡金</text>
        </view>
        <view class="my-card__stat">
          <text class="my-card__stat-value">{{
            infoList.GiveMoney.toFixed(2)
          }}</text>
          <text class="my-card__stat-label">赠金</text>
        </view>
        <view class="my-card__stat">
          <text class="my-card__stat-value">{{ infoList.Point }}</text>
          <text class="my-card__stat-label">积分</text>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="my-body">
      <!-- 我的订单 -->
      <view class="my-section">
        <view class="my-section__title">我的订单</view>
        <view class="my-section__grid">
          <view
            class="my-section__item"
            v-for="(it, idx) in orderItems"
            :key="idx"
            @click="dingdan(idx)"
          >
            <u-icon :name="it.icon" color="var(--color-primary)" size="36" />
            <text>{{ it.label }}</text>
          </view>
        </view>
      </view>

      <!-- 会员中心（已绑卡） -->
      <view class="my-section" v-if="infoList.IsBindMember == true">
        <view class="my-section__title">会员中心</view>
        <view class="my-section__grid">
          <view class="my-section__item" @click="car">
            <u-icon name="grid-fill" color="var(--color-primary)" size="44" />
            <text>会员卡包</text>
          </view>
          <view class="my-section__item" @click="quan">
            <u-icon name="coupon-fill" color="var(--color-primary)" size="44" />
            <text>优惠券</text>
          </view>
          <view class="my-section__item" @click="balance">
            <u-icon
              name="file-text-fill"
              color="var(--color-primary)"
              size="44"
            />
            <text>余额流水</text>
          </view>
          <view class="my-section__item" @click="manber">
            <u-icon
              name="red-packet-fill"
              color="var(--color-primary)"
              size="44"
            />
            <text>充值</text>
          </view>
          <view
            class="my-section__item"
            @click="undMenber"
            v-if="infoList.EnableAppletSelfRefund == 1"
          >
            <u-icon
              name="minus-circle"
              color="var(--color-primary)"
              size="44"
            />
            <text>余额退款</text>
          </view>
        </view>
      </view>

      <!-- 会员注册入口（未绑卡） -->
      <view class="my-register" v-else @click="shenqin">
        <image :src="infoList.MineRegisterUrl" mode="widthFix" />
      </view>

      <!-- 我的服务 -->
      <view class="my-section">
        <view class="my-section__title">我的服务</view>
        <view class="my-section__grid my-section__grid--wrap">
          <view class="my-section__item" @click="ziliao">
            <u-icon
              name="account-fill"
              color="var(--color-primary)"
              size="36"
            />
            <text>个人资料</text>
          </view>
          <view
            class="my-section__item"
            @click="quan"
            v-if="ButtonPermission.CouponButton == 1"
          >
            <u-icon name="coupon-fill" color="var(--color-primary)" size="36" />
            <text>优惠券</text>
          </view>
          <view
            class="my-section__item"
            @click="fenxiao"
            v-if="ButtonPermission.DistributionButton == 1"
          >
            <u-icon name="share-fill" color="var(--color-primary)" size="36" />
            <text>分销中心</text>
          </view>
          <view
            class="my-section__item"
            @click="hexiao"
            v-if="ButtonPermission.OTAFaceCheckButton == 1"
          >
            <u-icon name="scan" color="var(--color-primary)" size="36" />
            <text>自助核销</text>
          </view>
          <view
            class="my-section__item"
            @click="jianyi"
            v-if="ButtonPermission.ReclamoButton == 1"
          >
            <u-icon name="chat-fill" color="var(--color-primary)" size="36" />
            <text>投诉建议</text>
          </view>
          <view
            class="my-section__item"
            @click="jiuyuan"
            v-if="ButtonPermission.SoccorsoButton == 1"
          >
            <u-icon name="phone-fill" color="var(--color-primary)" size="36" />
            <text>一键救援</text>
          </view>
          <view
            class="my-section__item"
            @click="jihuo"
            v-if="ButtonPermission.ActivateTicketButton == 1"
          >
            <u-icon
              name="checkmark-circle-fill"
              color="var(--color-primary)"
              size="36"
            />
            <text>激活票码</text>
          </view>
        </view>
      </view>

      <!-- 底部信息 -->
      <view
        class="my-footer"
        v-if="infoList.CompanyName != '' || infoList.CompanyName != null"
      >
        <text class="my-footer__text">{{ infoList.CompanyName }}</text>
        <text class="my-footer__text">{{ infoList.SupportContent }}</text>
        <text class="my-footer__text">{{ infoList.AppletVersion }}</text>
      </view>
    </view>

    <!-- 会员码弹窗 -->
    <u-popup
      :show="show"
      round="20"
      closeable
      mode="center"
      @close="close"
      @open="open"
    >
      <view class="popup-qrcode">
        <view class="popup-qrcode__title">会员码</view>
        <view class="popup-qrcode__img">
          <uqrcode
            ref="uqrcodeRef"
            v-if="show"
            canvas-id="qrcode"
            :value="infoList.CardID"
            size="120"
            :options="{ margin: 10 }"
          />
        </view>
        <view class="popup-qrcode__code">{{ infoList.CardID }}</view>
      </view>
    </u-popup>

    <u-toast ref="uToastRef" />

    <!-- 绑卡弹窗 -->
    <u-popup :show="show1" closeable mode="center" @close="close">
      <view class="popup-bind">
        <view class="popup-bind__scan">
          <u-button type="primary" text="扫一扫" @click="scan" />
        </view>
        <view class="popup-bind__form">
          <view class="popup-bind__row">
            <text>输入卡号:</text>
            <u-input border="surround" v-model="pass" />
          </view>
          <view class="popup-bind__row">
            <text>验证码:</text>
            <u-input border="surround" v-model="pass1" />
          </view>
        </view>
        <view class="popup-bind__actions">
          <u-button type="primary" :text="contxt" @click="huoqu" />
          <u-button
            :disabled="disabled"
            type="primary"
            text="提交"
            @click="tijiao"
          />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount } from "vue";
import store from "../../store/index.js";

const props = defineProps({
  active: Boolean,
});

const hasLoaded = ref(false);
const myRequest = (options) => uni.$myRequest(options);

// 数据
const infoList = reactive({
  CompanyName: "",
  SupportContent: "",
  AppletVersion: "",
  FaceImgUrl: "",
  MemberName: "",
  Phone: "",
  CardLevelName: "",
  CardMoney: 0,
  GiveMoney: 0,
  Point: 0,
  CardID: "",
  IsBindMember: false,
  EnableAppletSelfRefund: 0,
  EnableAppletNeedGetPhone: 0,
  MineRegisterUrl: "",
});
const phone = ref("********");
const disabled = ref(true);
const show = ref(false);
const show1 = ref(false);
const pass = ref("");
const pass1 = ref("");
const contxt = ref("获取验证码");
const info = ref("");
const ButtonPermission = reactive({
  CouponButton: 0,
  DistributionButton: 0,
  OTAFaceCheckButton: 0,
  ReclamoButton: 0,
  SoccorsoButton: 0,
  ActivateTicketButton: 0,
});

// Refs
const uToastRef = ref(null);
const uqrcodeRef = ref(null);

// 定时器
let countdownTimer = null;
onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});

// 订单入口图标
const orderItems = [
  { icon: "list-dot", label: "全部" },
  { icon: "clock-fill", label: "待使用" },
  { icon: "rmb-circle-fill", label: "未支付" },
  { icon: "checkmark-circle-fill", label: "已完成" },
  { icon: "minus-circle", label: "退款" },
  { icon: "car-fill", label: "待发货" },
];

// 监听激活状态，每次激活都刷新数据
watch(
  () => props.active,
  (val) => {
    if (val) {
      uni.hideTabBar();
      tabData();
      hasLoaded.value = true;
    }
  },
  {
    immediate: true,
  },
);

// ====== 方法 ======
function jihuo() {
  uni.navigateTo({
    url: "/pages/voucherCode/voucherCode",
  });
}

function jiuyuan() {
  uni.navigateTo({
    url: "/pages/subPack/rescue/rescue",
  });
}

function jianyi() {
  uni.navigateTo({
    url: "/pages/subPack/complaint/complaint",
  });
}

function hexiao() {
  uni.navigateTo({
    url: "/pages/subPack/writeMin/writeMin",
  });
}

function undMenber() {
  uni.navigateTo({
    url: "/pages/subPack/returnMenber/returnMenber",
  });
}

function quan() {
  uni.navigateTo({
    url: "/pages/subPack/coinDiscon/coinDiscon",
  });
}

async function tijiao() {
  if (pass1.value !== " ") {
    const res = await myRequest({
      url: "/api/Applets/AppletsConfirmBindCard",
      data: {
        code: pass1.value,
        needBind_OpenId: info.value.NeedBind_OpenId,
        needBind_MemberID: info.value.NeedBind_MemberID,
        needBind_CardID: info.value.NeedBind_CardID,
        needBind_Phone: info.value.NeedBind_Phone,
      },
      method: "POST",
    });
    if (res.data.Code == 200) {
      show1.value = false;
      uni.showToast({
        icon: "none",
        title: res.data.Message,
      });
      tabData();
    } else {
      uni.showToast({
        icon: "none",
        title: res.data.Message,
      });
    }
  } else {
    uni.showToast({
      icon: "none",
      title: "请输入验证码",
    });
  }
}

async function huoqu() {
  if (contxt.value == "获取验证码" || contxt.value == "重新获取") {
    const openid = uni.getStorageSync("userinfo");
    const res1 = await myRequest({
      url: "/api/Applets/AppletsBindCard",
      data: {
        openId: openid.openid,
        cradID: pass.value,
      },
      method: "POST",
    });
    if (res1.data.Code == 200) {
      let n = 60;
      contxt.value = n + "秒后重新获取";
      countdownTimer = setInterval(() => {
        if (n <= 1) {
          contxt.value = "重新获取";
          clearInterval(countdownTimer);
          countdownTimer = null;
          return;
        }
        contxt.value = --n + "秒后重新获取";
      }, 1000);
      info.value = res1.data.Data;
      uni.showToast({
        icon: "none",
        title: "验证码已发送",
      });
      disabled.value = false;
    } else {
      uni.showToast({
        icon: "none",
        title: res1.data.Message,
      });
    }
  }
}

function scan() {
  uni.scanCode({
    onlyFromCamera: true,
    success: (res) => {
      pass.value = res.result;
    },
  });
}

function bincard() {
  if (infoList.IsBindMember == true) {
    uToastRef.value?.show({
      type: "error",
      icon: false,
      title: "失败主题",
      message: "您已经是会员不能绑卡",
    });
  } else {
    pass.value = "";
    pass1.value = "";
    show1.value = true;
  }
}

function ziliao() {
  uni.navigateTo({
    url: "/pages/subPack/my/headPortrait?img=" + infoList.FaceImgUrl,
  });
}

function shenqin() {
  uni.navigateTo({
    url: "/pages/subPack/menber/menber?menber=" + 0,
  });
}

function dingdan(index) {
  uni.reLaunch({
    url: "/pages/order/order?active=" + index,
  });
}

function fenxiao() {
  uni.navigateTo({
    url: "/pages/subPack/distribution/distribution",
  });
}

function dian() {
  if (infoList.CardID == "") {
    uToastRef.value?.show({
      type: "error",
      icon: false,
      title: "失败主题",
      message: "您还不是会员",
    });
  } else {
    show.value = true;
  }
}

function open() {}

function close() {
  show.value = false;
  show1.value = false;
}

async function tabData() {
  const openid = uni.getStorageSync("userinfo");
  const res1 = await myRequest({
    url: "/api/Applets/AppletsMineIndex",
    data: {
      openId: openid.openid,
    },
    method: "POST",
  });
  Object.assign(infoList, res1.data.Data);
  Object.assign(ButtonPermission, res1.data.Data.ButtonPermission || {});
  uni.setStorage({
    key: "menberInfo",
    data: res1.data.Data,
  });

  const car = uni.getStorageSync("phone");
  if (car || infoList.EnableAppletNeedGetPhone == 0) {
    if (infoList.EnableAppletNeedGetPhone == 0) {
      phone.value = "";
    } else {
      phone.value = car.phoneNumber;
    }
  } else {
    uni.redirectTo({
      url: "/pages/information/information",
    });
  }
}

function car() {
  const menberInfo = uni.getStorageSync("menberInfo");
  uni.navigateTo({
    url: "/pages/subPack/menber/car?number=" + menberInfo.MemberID,
  });
}

function balance() {
  const menberInfo = uni.getStorageSync("menberInfo");
  uni.navigateTo({
    url: "/pages/subPack/menber/balance?menber=" + menberInfo.MemberID,
  });
}

function manber() {
  const menberInfo = uni.getStorageSync("menberInfo");
  if (menberInfo) {
    uni.redirectTo({
      url: "/pages/subPack/menber/menber?menber=" + menberInfo.MemberID,
    });
  } else {
    uni.redirectTo({
      url: "/pages/subPack/menber/menber?menber=" + 0,
    });
  }
}
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
}

/* ====== 头部 ====== */
.my-header {
  position: relative;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-dark) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 32rpx 72rpx;
  overflow: hidden;
}

.my-header__glow {
  position: absolute;
  top: -60rpx;
  right: -40rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.my-header__avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  z-index: 1;

  image {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.my-header__name {
  color: var(--color-bg-card);
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 600;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  z-index: 1;
}

.my-header__phone {
  color: var(--color-bg-card);
  font-size: var(--font-size-body, 28rpx);
  opacity: 0.8;
  margin-top: 8rpx;
  z-index: 1;
}

.my-header__bind {
  margin-top: 20rpx;
  color: var(--color-bg-card);
  font-size: var(--font-size-caption, 24rpx);
  padding: 8rpx 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  border-radius: 9999rpx;
  z-index: 1;
}

/* ====== 会员卡 ====== */
.my-card {
  position: relative;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: 32rpx 28rpx 24rpx;
  margin: -36rpx 20rpx 0;
}

.my-card__badge {
  position: absolute;
  top: -20rpx;
  right: 20rpx;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-bg-light);
  border-radius: 50%;
}

.my-card__level {
  color: var(--color-secondary);
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.my-card__stats {
  display: flex;
}

.my-card__stat {
  flex: 1;
  text-align: center;
  color: var(--color-secondary);
  font-weight: 600;
}

.my-card__stat-value {
  font-size: 40rpx;
  display: block;
  margin-bottom: 12rpx;
}

.my-card__stat-label {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text);
  font-weight: 400;
}

/* ====== 内容区 ====== */
.my-body {
  padding: 10rpx 0;
}

.my-section {
  background-color: var(--color-bg-card);
  margin: 20rpx;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: 24rpx 20rpx 8rpx;
  overflow: hidden;
}

.my-section__title {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 700;
  color: var(--color-text);
  padding: 0 0 16rpx;
}

.my-section__grid {
  display: flex;
  text-align: center;
}

.my-section__grid--wrap {
  flex-wrap: wrap;
}

.my-section__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 0;

  image {
    width: 80rpx;
    height: 80rpx;
    display: block;
  }

  text {
    font-size: var(--font-size-caption, 24rpx);
    color: var(--color-text);
  }
}

.my-section__grid--wrap .my-section__item {
  flex: 0 0 25%;
  margin-bottom: 24rpx;

  image {
    width: 70rpx;
    height: 70rpx;
  }
}

/* ====== 会员注册入口 ====== */
.my-register {
  margin: 20rpx;

  image {
    width: 100%;
    height: 170rpx;
    border-radius: var(--radius-card);
  }
}

/* ====== 底部信息 ====== */
.my-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 20rpx 32rpx;
  gap: 8rpx;
}

.my-footer__text {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  text-align: center;
}

/* ====== 会员码弹窗 ====== */
.popup-qrcode {
  width: 500rpx;
  height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30rpx;
}

.popup-qrcode__title {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
}

.popup-qrcode__img {
  margin-top: 80rpx;
  display: flex;
  justify-content: center;
}

.popup-qrcode__code {
  font-size: 28rpx;
  color: var(--color-text);
  text-align: center;
  margin-top: 40rpx;
}

/* ====== 绑卡弹窗 ====== */
.popup-bind {
  width: 700rpx;
  padding: 20rpx;
}

.popup-bind__scan {
  padding: 0 10rpx;
  margin-bottom: 24rpx;
}

.popup-bind__form {
  padding: 0 10rpx;
}

.popup-bind__row {
  display: flex;
  align-items: center;
  margin-top: 32rpx;

  text {
    width: 130rpx;
    font-size: 28rpx;
    color: var(--color-text);
    text-align: right;
    margin-right: 10rpx;
  }

  :deep(.u-input) {
    flex: 1;
  }
}

.popup-bind__actions {
  display: flex;
  justify-content: space-between;
  padding: 40rpx 10rpx 10rpx;
  gap: 20rpx;
}
</style>
