<template>
  <view class="member-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="member-page__skeleton">
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
        <view class="skeleton-line skeleton-line--text" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 票型名称 -->
      <view class="member-page__header">
        <text class="member-page__ticket-name">{{
          ticketInfo.TicketName
        }}</text>
      </view>

      <!-- 信息填写区 -->
      <view class="member-form">
        <view class="member-form__section-title">
          <view class="member-form__title-bar" />
          <text class="member-form__title-text">信息填写</text>
        </view>

        <uni-forms
          v-for="(item, index) in formData"
          :key="index"
          :ref="(el) => setFormRef(el, index)"
          :rules="rules"
          label-align="right"
          :model="item"
          label-width="80px"
        >
          <view class="member-form__card">
            <!-- 姓名 -->
            <uni-forms-item label="姓名" name="name">
              <input
                class="member-form__input"
                type="text"
                v-model="item.name"
                placeholder="请输入姓名"
                placeholder-style="color: var(--color-disabled)"
              />
            </uni-forms-item>

            <!-- 电话 -->
            <uni-forms-item label="电话" name="phone">
              <input
                class="member-form__input"
                type="number"
                v-model="item.phone"
                placeholder="请输入电话"
                placeholder-style="color: var(--color-disabled)"
                maxlength="11"
              />
            </uni-forms-item>

            <!-- 身份证 -->
            <uni-forms-item label="身份证" name="identity">
              <input
                class="member-form__input"
                type="text"
                v-model="item.identity"
                placeholder="请输入身份证号码"
                placeholder-style="color: var(--color-disabled)"
                maxlength="18"
              />
            </uni-forms-item>
          </view>
        </uni-forms>
      </view>

      <!-- 底部占位（防止内容被底部栏遮挡） -->
      <view class="member-page__bottom-spacer" />
    </template>

    <!-- ==================== 底部操作栏 ==================== -->
    <view class="bottom-bar" v-if="pageReady">
      <view class="bottom-bar__price-wrap">
        <text class="bottom-bar__label">合计</text>
        <view class="bottom-bar__price">
          <text class="bottom-bar__symbol">¥</text>
          <text class="bottom-bar__value">{{ ticketInfo.SellPrice }}</text>
        </view>
      </view>
      <button
        class="bottom-bar__btn"
        :class="{ 'bottom-bar__btn--loading': submitting }"
        :disabled="submitting"
        @click="handleSubmit"
      >
        <text v-if="!submitting">立即预定</text>
        <text v-else>提交中…</text>
      </button>
    </view>

    <!-- ==================== Loading 遮罩 ==================== -->
    <zero-loading v-if="loading" :mask="true" type="circle" />

    <!-- ==================== Toast ==================== -->
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useToast } from "@/util/toast.js";
import { useStore } from "@/store/index.js";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  index: "/pages/index/index",
};

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 页面级 Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 页面状态 ====================
const pageReady = ref(false);
const loading = ref(false);
const submitting = ref(false);

// ==================== 票型数据 ====================
const ticketInfo = ref({});

// ==================== 表单数据 ====================
const formData = ref([{ name: "", phone: "", identity: "" }]);
const formRefs = ref([]);

// ==================== 表单校验规则 ====================
const rules = reactive({
  name: {
    rules: [{ required: false, errorMessage: "请输入姓名" }],
  },
  phone: {
    rules: [
      {
        required: false,
        format: "phone",
        errorMessage: "请输入正确的电话号码",
      },
    ],
  },
  identity: {
    rules: [
      {
        required: false,
        format: "identity",
        errorMessage: "请输入正确的身份证号码",
      },
    ],
  },
});

// ==================== 路由参数 ====================
const mindBdi = ref("");

// ==================== 生命周期 ====================
onLoad(async (option) => {
  try {
    parseRouteParams(option);
    await fetchTicketDetail();
  } catch (err) {
    console.error("[resMenber] 页面初始化失败:", err);
    showToast("加载失败，请重试");
  } finally {
    pageReady.value = true;
  }
});

// ==================== 路由参数解析 ====================
function parseRouteParams(option) {
  if (option && JSON.stringify(option) !== "{}") {
    mindBdi.value = option.minpro || "";
  }
}

// ==================== 数据请求 ====================
async function fetchTicketDetail() {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetTicketById",
    method: "POST",
    data: {
      ticketID: store.tickId,
      DistributorID: store.seltck?.DistributorID ?? 0,
      saleticketID: store.seltck?.saleticketID ?? 0,
      PersonDistributionUserID: mindBdi.value,
    },
  });

  ticketInfo.value = res?.data?.Data || {};
  applyDynamicRules();
}

function applyDynamicRules() {
  const { NeedTouristIDCard, NeedTouristPhone } = ticketInfo.value;

  if (rules.identity?.rules?.[0]) {
    rules.identity.rules[0].required = NeedTouristIDCard === 1;
  }
  if (rules.phone?.rules?.[0]) {
    rules.phone.rules[0].required = NeedTouristPhone === 1;
  }
}

// ==================== 表单 Ref ====================
function setFormRef(el, index) {
  if (el) {
    formRefs.value[index] = el;
  }
}

// ==================== 表单校验 ====================
async function validateAllForms() {
  const promises = formData.value.map((_, index) => {
    return new Promise((resolve) => {
      const formRef = formRefs.value[index];
      if (formRef) {
        formRef.validate((err) => resolve(err || null));
      } else {
        resolve(null);
      }
    });
  });
  return await Promise.all(promises);
}

// ==================== 导航辅助 ====================
function goToHome() {
  uni.reLaunch({ url: PAGE_ROUTES.index });
}

// ==================== 支付辅助 ====================
function invokePayment(payInfo) {
  const payParams = {
    paySign: payInfo.paySign,
    timeStamp: payInfo.timeStamp,
    nonceStr: payInfo.nonceStr,
    package: payInfo.package_str,
    signType: payInfo.signType,
    success: () => {
      loading.value = false;
      submitting.value = false;
      goToHome();
    },
    fail: (err) => {
      console.error("[resMenber] 支付失败:", err);
      loading.value = false;
      submitting.value = false;
      showToast("支付失败，请重试");
    },
  };

  uni.requestPayment(payParams);
}

// ==================== 业务方法 ====================
async function handleSubmit() {
  if (submitting.value) return;
  submitting.value = true;

  try {
    const validateResults = await validateAllForms();
    const allPassed = validateResults.every(
      (item) => item === null || item === undefined,
    );

    if (!allPassed) {
      submitting.value = false;
      return;
    }

    loading.value = true;
    const openid = uni.getStorageSync("userinfo");

    const createRes = await uni.$myRequest({
      url: "/api/Applets/AppletsCreateMemberTicketPersonDisOrder",
      method: "POST",
      data: {
        OpenId: openid?.openid || "",
        MemberID: 0,
        TotalNumber: 1,
        TotalMoney: ticketInfo.value.SellPrice || 0,
        TicketID: ticketInfo.value.TicketID,
        PersonDistributionUserID: mindBdi.value,
        Name: formData.value[0].name,
        Phone: formData.value[0].phone,
        IDCard: formData.value[0].identity,
      },
    });

    if (createRes?.data?.Code === 200) {
      const payInfo = createRes.data.Data || {};
      invokePayment(payInfo);
    } else {
      loading.value = false;
      submitting.value = false;
    }
  } catch (err) {
    console.error("[resMenber] 提交预定失败:", err);
    loading.value = false;
    submitting.value = false;
    showToast("提交失败，请重试");
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   会员票预订页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   切换主题时无需修改本文件任何代码
   ============================================================ */

// ==================== 页面容器 ====================
.member-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

// ==================== 骨架屏 ====================
.member-page__skeleton {
  padding: 32rpx 24rpx;
}

.skeleton-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 32rpx 24rpx;
  box-shadow: var(--shadow-soft);
}

.skeleton-line {
  height: 32rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-bottom: 24rpx;
}

.skeleton-line--title {
  width: 55%;
  height: 40rpx;
}

.skeleton-line--text {
  width: 100%;
}

.skeleton-line:last-child {
  width: 70%;
  margin-bottom: 0;
}

// ==================== 页面头部（票型名称） ====================
.member-page__header {
  padding: 32rpx 28rpx 8rpx;
}

.member-page__ticket-name {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

// ==================== 表单区域 ====================
.member-form {
  margin: 0 20rpx;
}

.member-form__section-title {
  display: flex;
  align-items: center;
  padding: 24rpx 8rpx 20rpx;
}

.member-form__title-bar {
  width: 6rpx;
  height: 32rpx;
  background: var(--color-primary);
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.member-form__title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}

.member-form__card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 8rpx 20rpx 20rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-soft);
}

.member-form__input {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  color: var(--color-text);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: 0 24rpx;
  box-sizing: border-box;
  margin-bottom: 16rpx;
}

// ==================== 底部占位 ====================
.member-page__bottom-spacer {
  height: 40rpx;
}

// ==================== 底部操作栏 ====================
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120rpx;
  padding: 0 28rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-soft);
}

.bottom-bar__price-wrap {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.bottom-bar__label {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.bottom-bar__price {
  display: flex;
  align-items: baseline;
}

.bottom-bar__symbol {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-primary);
}

.bottom-bar__value {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.bottom-bar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 220rpx;
  height: 80rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text-on-primary);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-soft);
  transition: all 0.12s ease;
  padding: 0 36rpx;
  box-sizing: border-box;
}

/* 按压反馈 */
.bottom-bar__btn:active {
  opacity: 0.88;
  transform: scale(0.96);
  box-shadow: none;
}

/* 加载中 / 禁用态 */
.bottom-bar__btn--loading,
.bottom-bar__btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}
</style>
