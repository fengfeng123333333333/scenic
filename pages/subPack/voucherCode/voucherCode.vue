<!--
  激活票码页 — 三步流程：输入票码 → 选择日期/时段预约 → 预约成功展示二维码
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
-->
<template>
  <view class="voucher-page" :style="$themeStyle">
    <RequestLoading v-if="requestLoading" text="处理中..." />

    <!-- Step 0: 输入票码 -->
    <view class="voucher-page__card" v-show="step === 0">
      <image
        src="https://saas888.huibaitech.com/images/upload/applets/0715AppChectBg2.jpg"
        mode="widthFix"
        class="voucher-page__banner"
      />
      <view class="voucher-page__form">
        <text class="voucher-page__form-title">票码号:</text>
        <input
          type="text"
          v-model="ticketCode"
          placeholder="请粘贴或输入票码号"
          class="voucher-page__input"
        />
        <view class="voucher-page__scan" @click="onScan">扫一扫</view>
      </view>
      <view class="voucher-page__btn-wrap">
        <view
          class="voucher-page__btn"
          :class="{ 'voucher-page__btn--disabled': activating || !ticketCode }"
          @click="onActivate"
        >
          <text>{{ activating ? "验证中..." : "激活票码" }}</text>
        </view>
      </view>
    </view>

    <!-- Step 1: 选择日期/时段 -->
    <view class="voucher-page__card" v-show="step === 1">
      <view class="voucher-page__header">
        <text>票码：{{ ticketCode }}</text>
        <text class="voucher-page__tag">未预约</text>
      </view>
      <view class="voucher-page__label"
        >预约日期：<text class="voucher-page__date">{{
          selectedDate
        }}</text></view
      >
      <view class="voucher-page__date-row">
        <view
          class="voucher-page__date-chip"
          v-for="(item, idx) in showDateList"
          :key="idx"
          :class="{ 'voucher-page__date-chip--active': idx === dateIndex }"
          @click="onPickDate(item, idx)"
          >{{ item.date }}</view
        >
        <view
          class="voucher-page__date-more"
          v-if="dateList.length > 3"
          @click="openCalendar"
        >
          <uni-calendar
            ref="calendarRef"
            :insert="false"
            @confirm="onCalendarConfirm"
            :showMonth="true"
            :startDate="startDate"
            :endDate="endDate"
            :date="selectedDate"
          />
          <text>更多</text>
        </view>
      </view>
      <view
        class="voucher-page__label"
        style="margin-top: 30rpx; margin-bottom: 20rpx"
        >预约时段</view
      >
      <view class="voucher-page__slots" v-if="stockList.length">
        <view
          class="voucher-page__slot"
          :class="{ 'voucher-page__slot--active': stockIdx === idx }"
          v-for="(item, idx) in stockList"
          :key="idx"
          @click="onPickSlot(item, idx)"
        >
          <text class="voucher-page__slot-time"
            >{{ item.StartTime }}-{{ item.EndTime }}</text
          >
          <text class="voucher-page__slot-stock"
            >余票：{{ item.StockNumber }}</text
          >
        </view>
      </view>
      <Kong v-else text="暂无可用时段" />
    </view>

    <!-- Step 2: 已预约 -->
    <view class="voucher-page__card" v-show="step === 2">
      <view class="voucher-page__header">
        <text>票码：{{ doneTicketCode }}</text>
        <text class="voucher-page__tag voucher-page__tag--done">已预约</text>
      </view>
      <view class="voucher-page__label"
        >预约日期：{{ doneAppointmentTime }}</view
      >
      <view class="voucher-page__qrcode">
        <image
          src="https://cdn.huibaitech.com/qrcode/public/applets/yuyuecg.png"
          style="width: 400rpx; height: 400rpx"
        />
      </view>
      <view class="voucher-page__tip">预约成功，门票二维码已激活</view>
      <view class="voucher-page__tip"
        >请您在预约当日前往现场使用门票核销二维码进场</view
      >
    </view>

    <!-- 预约按钮 (Step 1 底部固定) -->
    <view class="voucher-page__bar" v-if="step === 1">
      <view
        class="voucher-page__btn voucher-page__btn--bar"
        :class="{ 'voucher-page__btn--disabled': submitting }"
        @click="onSubmit"
      >
        <text>{{ submitting ? "提交中..." : "立即预约" }}</text>
      </view>
    </view>

    <u-modal
      :show="showModal"
      :content="modalContent"
      showCancelButton
      @confirm="showModal = false"
      @cancel="showModal = false"
    />
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, nextTick } from "vue";
import RequestLoading from "@/components/loading/request-loading.vue";
import Kong from "@/components/kong/kong.vue";
import { useToast } from "@/util/toast.js";

const { uToastRef, showToast } = useToast();

const step = ref(0);
const ticketCode = ref("");
const activating = ref(false);
const requestLoading = ref(false);
const submitting = ref(false);
const selectedDate = ref("");
const dateIndex = ref(0);
const dateList = ref([]);
const showDateList = ref([]);
const startDate = ref("");
const endDate = ref("");
const stockList = ref([]);
const stockIdx = ref(0);
const pickedSlot = ref(null);
const calendarRef = ref(null);
const doneTicketCode = ref("");
const doneAppointmentTime = ref("");
const showModal = ref(false);
const modalContent = ref("");

function onScan() {
  uni.scanCode({
    onlyFromCamera: false,
    success: (res) => {
      ticketCode.value = res.result;
      fetchTimeList();
    },
    fail: (err) => {
      if (err.errMsg !== "scanCode:fail cancel") showToast("扫码失败，请重试");
    },
  });
}

async function onActivate() {
  if (!ticketCode.value.trim()) return;
  await fetchTimeList();
}

async function fetchTimeList() {
  activating.value = true;
  requestLoading.value = true;
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetTicketTempCodeStockTime",
      method: "POST",
      data: { ticketCode: ticketCode.value.trim() },
    });
    if (res.data?.Code !== 200 || !res.data?.Data) {
      //   showToast("票码不存在", "error");
      return;
    }
    const d = res.data.Data;
    if (d.StatusDesc !== "未预约") {
      doneTicketCode.value = d.TicketCode;
      doneAppointmentTime.value = d.AppointmentTime;
      step.value = 2;
      return;
    }
    if (!d.data || d.data.length === 0) {
      showModal.value = true;
      modalContent.value = "未排期，暂不能预约";
      return;
    }
    dateList.value = d.data[0] || [];
    showDateList.value =
      dateList.value.length > 3 ? dateList.value.slice(0, 3) : dateList.value;
    if (dateList.value.length > 3) {
      startDate.value = dateList.value[0].date;
      endDate.value = dateList.value[dateList.value.length - 1].date;
    }
    dateIndex.value = 0;
    selectedDate.value = showDateList.value[0].date;
    await fetchStock(showDateList.value[0].date);
    step.value = 1;
  } catch (err) {
    console.error("[voucherCode] err:", err);
  } finally {
    activating.value = false;
    requestLoading.value = false;
  }
}

async function fetchStock(date) {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetTicketTempCodeStockTimeSlot",
      method: "POST",
      data: { stockDate: date },
    });
    stockList.value = res.data?.Data || [];
    stockIdx.value = 0;
    pickedSlot.value = stockList.value[0] || null;
  } catch (err) {
    console.error("[voucherCode] stock err:", err);
  }
}

function onPickDate(item, idx) {
  if (dateIndex.value === idx) return;
  dateIndex.value = idx;
  selectedDate.value = item.date;
  fetchStock(item.date);
}
function onPickSlot(item, idx) {
  if (stockIdx.value === idx) return;
  stockIdx.value = idx;
  pickedSlot.value = item;
}
function openCalendar() {
  nextTick(() => calendarRef.value?.open());
}

function onCalendarConfirm(e) {
  const info = JSON.parse(JSON.stringify(e.extraInfo || "{}"));
  if (info.date) {
    if (info.date !== selectedDate.value) dateIndex.value = -1;
    selectedDate.value = info.date;
    fetchStock(info.date);
  } else showToast("暂无该预约日期！请选择其他日期", "error");
}

async function onSubmit() {
  if (!pickedSlot.value || submitting.value) return;
  submitting.value = true;
  requestLoading.value = true;
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsConfirmAppointment",
      method: "POST",
      data: {
        ticketCode: ticketCode.value,
        ticketStockTimeID: pickedSlot.value.TicketStockTimeID,
      },
    });
    if (res.data?.Code === 200) {
      doneTicketCode.value = ticketCode.value;
      doneAppointmentTime.value = `${selectedDate.value} ${pickedSlot.value.StartTime}-${pickedSlot.value.EndTime}`;
      step.value = 2;
      showToast("预约成功", "success");
    }
  } catch (err) {
    console.error("[voucherCode] submit err:", err);
    showToast("预约失败，请重试");
  } finally {
    submitting.value = false;
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.voucher-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 20rpx 30rpx;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.voucher-page__card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  padding: 0 20rpx 20rpx 20rpx;
}
.voucher-page__banner {
  width: 100%;
  display: block;
}
.voucher-page__form {
  position: absolute;
  top: 90rpx;
  width: 70%;
  left: 50%;
  margin-left: -35%;
}
.voucher-page__form-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
}
.voucher-page__input {
  width: 100%;
  height: 70rpx;
  border: 1px solid var(--color-border-light);
  padding: 0 20rpx;
  margin-top: 20rpx;
  box-sizing: border-box;
  background: var(--color-bg-card);
}
.voucher-page__scan {
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  border-radius: 30rpx;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  margin-top: 100rpx;
  font-size: var(--font-size-body, 28rpx);
}
.voucher-page__btn-wrap {
  padding: 50rpx 30rpx 40rpx;
}
.voucher-page__btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: 45rpx;
  font-size: 32rpx;
  text-align: center;
  transition: opacity 160ms ease;
}
.voucher-page__btn:active {
  opacity: 0.85;
}
.voucher-page__btn--disabled {
  opacity: 0.5;
  pointer-events: none;
}
.voucher-page__btn--bar {
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 0;
  padding: 0 30rpx;
  width: auto;
}
.voucher-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 10rpx;
  border-bottom: 2rpx solid var(--color-border-light);
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 60rpx;
  color: var(--color-text);
}
.voucher-page__tag {
  color: var(--color-danger);
}
.voucher-page__tag--done {
  color: var(--color-accent);
}
.voucher-page__label {
  font-size: 32rpx;
  color: var(--color-text);
}
.voucher-page__date {
  color: var(--color-danger);
}
.voucher-page__date-row {
  display: flex;
  margin-top: 20rpx;
  align-items: center;
}
.voucher-page__date-chip {
  height: 70rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
  font-size: 25rpx;
  display: flex;
  align-items: center;
  padding: 0 10rpx;
  border: 1px solid var(--color-border-light);
  color: var(--color-text);
}
.voucher-page__date-chip--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.voucher-page__date-more {
  height: 70rpx;
  border: 1px solid var(--color-border-light);
  border-radius: 10rpx;
  font-size: 25rpx;
  display: flex;
  align-items: center;
  padding: 0 10rpx;
  color: var(--color-text);
}
.voucher-page__slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.voucher-page__slot {
  padding: 20rpx 30rpx;
  border: 1px solid var(--color-border-light);
  border-radius: 10rpx;
  color: var(--color-text);
  text-align: center;
  font-size: 25rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.4;
}
.voucher-page__slot--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.voucher-page__slot-time {
  font-size: 36rpx;
  margin-bottom: 12rpx;
}
.voucher-page__slot-stock {
  font-size: 25rpx;
}
.voucher-page__bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 120rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: var(--color-bg-card);
  padding-right: 45rpx;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}
.voucher-page__qrcode {
  width: 400rpx;
  height: 400rpx;
  margin: 100rpx auto 50rpx;
}
.voucher-page__tip {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
  text-align: center;
  color: var(--color-text);
}
</style>
