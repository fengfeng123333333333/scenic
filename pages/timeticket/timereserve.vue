<!--
  计时票预约页 — 选日期/时段/数量 + 游客信息 + 创建订单 → 支付
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  支付流程遵循 §0.3 支付统一规范
  布局对齐 reserve.vue 标准
  旧函数映射：onLoad → onLoad + fetchTicketAndInit
              xuan → selectDate / xuanTime → selectTimeSlot
              submit → handleSubmit / tiao → goToTourist
-->
<template>
  <view class="timereserve-page" :style="$themeStyle">
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- 票型信息头 -->
      <view class="timereserve-page__header">
        <text class="timereserve-page__ticket-name">{{
          Ticket.TicketName
        }}</text>
        <text class="timereserve-page__ticket-desc" v-if="Ticket.Discription">{{
          Ticket.Discription
        }}</text>
      </view>

      <!-- 日期选择区 -->
      <view class="date-section">
        <view class="date-section__title">
          <text class="date-section__label">游玩日期</text>
          <text class="date-section__value">{{ selectedDate }}</text>
        </view>
        <view class="date-section__quick">
          <view
            class="date-card"
            :class="{ 'date-card--active': selectPoint === index }"
            v-for="(item, index) in quickDates"
            :key="index"
            @click="selectDate(index, item)"
          >
            <text class="date-card__week">{{ item.week }}</text>
            <text class="date-card__price">¥{{ item.price }}</text>
          </view>
          <view class="date-card date-card--more" @click="openCalendar">
            <text>更多日期</text>
          </view>
        </view>
        <u-calendar
          ref="calendarRef"
          :show="showCalendar"
          mode="single"
          :minDate="availableStartDate"
          :maxDate="availableEndDate"
          :defaultDate="selectedDate"
          :color="calendarColor"
          :formatter="calendarFormatter"
          showTitle
          title="选择游玩日期"
          closeOnClickOverlay
          @confirm="onCalendarConfirm"
          @close="handleCalendarClose"
        />
      </view>

      <!-- 时段选择区 -->
      <view class="time-section" v-if="timeList.length >= 1">
        <view class="time-section__title">请选择游玩时间</view>
        <view class="time-section__grid">
          <view
            class="time-slot"
            :class="{
              'time-slot--active':
                item.TicketStockTime === timePoint && !item.IsSelect,
              'time-slot--disabled': item.IsSelect === 1,
            }"
            v-for="(item, index) in timeList"
            :key="index"
            @click="selectTimeSlot(item)"
          >
            <text>{{ item.TicketStockTime }}</text>
            <text class="time-slot__stock" v-if="!item.IsSelect"
              >余票{{ item.StockNumber }}</text
            >
          </view>
        </view>
      </view>

      <!-- 购买数量 -->
      <view class="quantity-section">
        <text class="quantity-section__label">购买数量</text>
        <u-number-box
          v-model="sumNumber"
          :min="1"
          :max="999"
          @change="handleQuantityChange"
          :disabledInput="true"
        >
          <template #minus>
            <view class="num-btn">−</view>
          </template>
          <template #input>
            <view class="num-input">{{ sumNumber }}</view>
          </template>
          <template #plus>
            <view class="num-btn">+</view>
          </template>
        </u-number-box>
      </view>

      <!-- 游客信息 -->
      <view class="tourist-section">
        <view class="section-header">
          <view class="section-header__bar" />
          <text class="section-header__title">游客信息</text>
        </view>
        <view
          class="form-card"
          v-for="(item, index) in formData"
          :key="'tourist' + index"
        >
          <view class="form-card__row">
            <text class="form-card__row-label">
              <text
                class="form-card__required"
                v-if="touristRules.name.rules[0].required"
                >*</text
              >姓名
            </text>
            <input
              class="form-card__input"
              type="text"
              v-model="item.name"
              placeholder="请输入姓名"
            />
          </view>
          <view class="form-card__row">
            <text class="form-card__row-label">
              <text
                class="form-card__required"
                v-if="touristRules.phone.rules[0].required"
                >*</text
              >电话
            </text>
            <input
              class="form-card__input"
              type="number"
              v-model="item.phone"
              placeholder="请输入电话"
              maxlength="11"
            />
          </view>
          <view class="form-card__row">
            <text class="form-card__row-label">
              <text
                class="form-card__required"
                v-if="touristRules.identity.rules[0].required"
                >*</text
              >身份证
            </text>
            <view class="form-card__id-wrap">
              <input
                class="form-card__input form-card__input--id"
                type="text"
                v-model="item.identity"
                placeholder="请输入身份证"
                maxlength="18"
              />
              <view class="form-card__id-icon" @click="goToTourist(index)">
                <u-icon name="account" color="var(--color-primary)" size="22" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 联系人信息 -->
      <view class="contact-section">
        <view class="section-header">
          <view class="section-header__bar" />
          <text class="section-header__title">联系人信息</text>
        </view>
        <view class="form-card">
          <view class="form-card__row">
            <text class="form-card__row-label">
              <text
                class="form-card__required"
                v-if="contactRules.name.rules[0].required"
                >*</text
              >姓名
            </text>
            <input
              class="form-card__input"
              type="text"
              v-model="formData1.name"
              placeholder="请输入姓名"
            />
          </view>
          <view class="form-card__row">
            <text class="form-card__row-label">
              <text
                class="form-card__required"
                v-if="contactRules.phone.rules[0].required"
                >*</text
              >电话
            </text>
            <input
              class="form-card__input"
              type="number"
              v-model="formData1.phone"
              placeholder="请输入电话"
              maxlength="11"
            />
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="timereserve-page__spacer" />
    </template>

    <!-- 底部固定栏 -->
    <view class="bottom-bar" v-if="pageReady && isShow">
      <view class="bottom-bar__price-wrap">
        <text class="bottom-bar__label">合计</text>
        <view class="bottom-bar__price">
          <text class="bottom-bar__symbol">¥</text>
          <text class="bottom-bar__value">{{ contPrice }}</text>
        </view>
        <text class="bottom-bar__deposit" v-if="depositTotal > 0">
          含押金 ¥{{ depositTotal }}</text
        >
      </view>
      <view
        class="bottom-bar__btn"
        :class="{ 'bottom-bar__btn--disabled': submitting }"
        @click="handleSubmit"
      >
        <template v-if="submitting">
          <u-loading-icon
            mode="circle"
            size="18"
            color="var(--color-text-on-primary)"
          />
          <text>提交中...</text>
        </template>
        <text v-else>立即预定</text>
      </view>
    </view>
    <!-- ==================== Loading 遮罩 ==================== -->
    <RequestLoading v-if="submitting" text="正在跳转支付页面..." />
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { onLoad, onReady } from "@dcloudio/uni-app";
import store from "@/store/index.js";
import PageLoading from "@/components/loading/page-loading.vue";
import RequestLoading from "@/components/loading/request-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  tourist: "/pages/tourist/tourist",
  payment: "/pages/payment/payment",
};

// ==================== 数据 ====================
const Ticket = ref({});
const quickDates = ref([]);
const selectPoint = ref(0);
const timePoint = ref("");
const timeList = ref([]);
const objList = ref(null);
const selectedDate = ref("");
const selectedPrice = ref(0);
const availableStartDate = ref("");
const availableEndDate = ref("");
const sumNumber = ref(1);
const isShow = ref(true);
const showCalendar = ref(false);

const formData = ref([{ identity: "", name: "", phone: "" }]);
const formData1 = ref({ name: "", phone: "" });

// ==================== 游客校验规则 ====================
const touristRules = reactive({
  name: { rules: [{ required: false, errorMessage: "请输入游客姓名" }] },
  phone: {
    rules: [
      { required: false, format: "phone", errorMessage: "请输入游客电话号码" },
    ],
  },
  identity: {
    rules: [
      {
        required: false,
        format: "identity",
        errorMessage: "请输入游客身份证号码",
      },
    ],
  },
});

// ==================== 联系人校验规则 ====================
const contactRules = reactive({
  name: { rules: [{ required: false, errorMessage: "请输入联系人姓名" }] },
  phone: {
    rules: [
      {
        required: false,
        format: "phone",
        errorMessage: "请输入联系人的电话号码",
      },
    ],
  },
});

const pageReady = ref(false);
const submitting = ref(false);

// ==================== Refs ====================
const uToastRef = ref(null);
const calendarRef = ref(null);

// ==================== 计算属性 ====================
const contPrice = computed(() => {
  const total =
    selectedPrice.value * sumNumber.value +
    Ticket.value.TimeTicketDeposit * sumNumber.value;
  return Number(total.toFixed(2));
});

const depositTotal = computed(() => {
  return (Ticket.value.TimeTicketDeposit * sumNumber.value).toFixed(2);
});

const calendarColor = computed(() => {
  return store.themeVars?.["--color-primary"] ?? "";
});

// ==================== 生命周期 ====================
onLoad(() => {
  fetchTicketAndInit();
});

onMounted(() => {
  uni.$on("selectTourist", onTouristSelected);
});

onBeforeUnmount(() => {
  uni.$off("selectTourist", onTouristSelected);
});

onReady(() => {
  nextTick(() => {
    calendarRef.value?.setFormatter(calendarFormatter);
  });
});

// ==================== 数据请求 ====================

async function fetchTicketAndInit() {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetTimeTicketById",
      method: "POST",
      data: {
        ticketID: store.state.tickId,
        DistributorID: store.state.seltck.DistributorID,
        saleticketID: store.state.seltck.saleticketID,
      },
    });
    Ticket.value = res.data.Data || {};

    // 构建快捷日期列表
    const stockList = Ticket.value.TicketStockList || [];
    if (stockList.length > 0) {
      availableEndDate.value = stockList[stockList.length - 1].date;
    }
    availableStartDate.value = stockList.length > 0 ? stockList[0].date : "";

    const maxShow = stockList.length >= 3 ? 3 : stockList.length;
    const arr = [];
    for (let i = 0; i < maxShow; i++) {
      const dateStr = stockList[i].date;
      arr.push({
        date: dateStr,
        week: dateStr,
        price: stockList[i].info,
      });
    }
    quickDates.value = arr;

    if (arr.length > 0) {
      selectedDate.value = arr[0].week;
      selectedPrice.value = arr[0].price;
      fetchTimeSlots(selectedDate.value);
    }

    // 根据票型配置动态设置校验规则 required
    applyDynamicRules();
  } finally {
    pageReady.value = true;
  }
}

async function fetchTimeSlots(date) {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetTicketTimeSlot",
    method: "POST",
    data: { ticketID: store.state.tickId, travelTime: date },
  });
  timeList.value = res.data.Data || [];
  if (timeList.value.length >= 1) {
    timePoint.value = timeList.value[0].TicketStockTime;
    objList.value = timeList.value[0];
  }
}

// ==================== 日期/时段选择 ====================

function selectDate(index, item) {
  selectPoint.value = index;
  selectedDate.value = item.date;
  selectedPrice.value = item.price;
  fetchTimeSlots(item.date);
}

function selectTimeSlot(item) {
  if (item.IsSelect === 1) return;
  timePoint.value = item.TicketStockTime;
  objList.value = item;
}

function openCalendar() {
  showCalendar.value = true;
}

function handleCalendarClose() {
  showCalendar.value = false;
}

function onCalendarConfirm(e) {
  const date = Array.isArray(e) ? e[0] : e;
  selectedDate.value = date;
  // 查找选中日期对应的价格
  const stockList = Ticket.value.TicketStockList || [];
  const matched = stockList.find((s) => s.date === date);
  if (matched) {
    selectedPrice.value = matched.info;
  }
  selectPoint.value = -1;
  showCalendar.value = false;
  fetchTimeSlots(date);
}

function calendarFormatter(day) {
  if (!day) return day;
  const m = String(day.month).padStart(2, "0");
  const d = String(day.day).padStart(2, "0");
  const dateStr = `${day.year}-${m}-${d}`;
  const stockList = Ticket.value.TicketStockList || [];
  const found = stockList.find((s) => s.date === dateStr);
  if (found) {
    day.bottomInfo = `¥${found.info}`;
    day.dot = true;
  }
  return day;
}

// ==================== 数量操作 ====================

function handleQuantityChange(val) {
  const num = Number(val.value || val);
  const diff = num - formData.value.length;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      formData.value.push({ identity: "", name: "", phone: "" });
    }
  } else if (diff < 0) {
    formData.value.splice(num, Math.abs(diff));
  }
}

// ==================== 导航辅助 ====================

function goToTourist(index) {
  uni.navigateTo({ url: `${PAGE_ROUTES.tourist}?key=${index}` });
}

function onTouristSelected(data) {
  formData.value[data.index] = {
    identity: data.item.TouristIDCard,
    name: data.item.TouristName,
    phone: data.item.TouristPhone,
  };
}

function goToPayment(payData) {
  store.state.tickinfo = {
    time: selectedDate.value,
    OrderCode: payData.OrderCode,
    OrderID: payData.OrderID,
    TotalMoney: payData.TotalMoney,
    ProductInfo: payData.ProductInfo,
    openId: payData.openId,
    isMember: payData.IsBindMember,
    name: "cartime",
  };
  uni.reLaunch({ url: PAGE_ROUTES.payment });
}

// ==================== 表单验证 ====================

function applyDynamicRules() {
  const t = Ticket.value;
  if (touristRules.identity?.rules?.[0]) {
    touristRules.identity.rules[0].required = t.NeedTouristIDCard === 1;
  }
  if (touristRules.phone?.rules?.[0]) {
    touristRules.phone.rules[0].required = t.NeedTouristPhone === 1;
  }
  if (contactRules.phone?.rules?.[0]) {
    contactRules.phone.rules[0].required = t.NeedContactsPhone === 1;
  }
  if (contactRules.name?.rules?.[0]) {
    contactRules.name.rules[0].required = t.NeedContactsName === 1;
  }
}

function validateTouristForms() {
  const errs = [];
  formData.value.forEach((item) => {
    if (touristRules.identity.rules[0].required) {
      if (!item.identity || !item.identity.trim()) {
        errs.push({
          field: "identity",
          msg: touristRules.identity.rules[0].errorMessage,
        });
      }
    }
    if (touristRules.phone.rules[0].required) {
      if (!item.phone || !item.phone.trim()) {
        errs.push({
          field: "phone",
          msg: touristRules.phone.rules[0].errorMessage,
        });
      }
    }
  });
  return errs;
}

function validateContactForm() {
  const errs = [];
  if (contactRules.name.rules[0].required) {
    if (!formData1.value.name || !formData1.value.name.trim()) {
      errs.push({
        field: "name",
        msg: contactRules.name.rules[0].errorMessage,
      });
    }
  }
  if (contactRules.phone.rules[0].required) {
    if (!formData1.value.phone || !formData1.value.phone.trim()) {
      errs.push({
        field: "phone",
        msg: contactRules.phone.rules[0].errorMessage,
      });
    }
  }
  return errs;
}

// ==================== 业务方法 ====================

async function handleSubmit() {
  if (submitting.value) return;

  // 游客信息校验
  const touristErrs = validateTouristForms();
  if (touristErrs.length > 0) {
    showToast(touristErrs[0].msg || "请完善游客信息");
    return;
  }

  // 联系人信息校验
  const contactErrs = validateContactForm();
  if (contactErrs.length > 0) {
    showToast(contactErrs[0].msg || "请完善联系人信息");
    return;
  }

  submitting.value = true;

  try {
    const openid = uni.getStorageSync("userinfo");

    const touristList = formData.value.map((item) => ({
      ticketID: store.state.tickId,
      touristName: item.name,
      touristPhone: item.phone,
      idType: 0,
      touristIDCard: item.identity,
    }));

    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsCreateTimeTicketOrder",
      method: "POST",
      data: {
        openId: openid.openid,
        memberID: 0,
        totalNumber: sumNumber.value,
        totalMoney: contPrice.value,
        travelTime: selectedDate.value,
        contacts: formData1.value.name,
        contactPhone: formData1.value.phone,
        contactIDCard: "",
        origin: "",
        remark: "",
        DistributorID: store.state.seltck.DistributorID,
        saleticketID: store.state.seltck.saleticketID,
        shoppingCartList: [
          {
            ticketID: store.state.tickId,
            ticketStockTimeID: objList.value?.TicketStockTimeID,
            ticketName: Ticket.value.TicketName,
            number: sumNumber.value,
            unitPrice: selectedPrice.value,
            discountUnitPrice: selectedPrice.value,
            totalPrice: contPrice.value,
            depositUnitPrice: Ticket.value.TimeTicketDeposit,
          },
        ],
        touristList,
        timeSlotList: [
          {
            TicketStockTimeID: objList.value?.TicketStockTimeID,
            TicketID: objList.value?.TicketID,
            Number: sumNumber.value,
            StockDate: objList.value?.StockDate,
            TicketStockTime: objList.value?.TicketStockTime,
            StartTime: objList.value?.StartTime,
            EndTime: objList.value?.EndTime,
          },
        ],
      },
    });

    if (res.data.Code === 200) {
      goToPayment({ ...res.data.Data, openId: openid.openid });
    } else {
      submitting.value = false;
      showToast(res.data.Message || "下单失败");
    }
  } catch (err) {
    submitting.value = false;
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
   计时票预约页 — 对齐 reserve.vue 布局标准
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.timereserve-page__xxx
   ============================================================ */

.timereserve-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.timereserve-page__spacer {
  height: 200rpx;
}

/* ====== 票型头部 ====== */
.timereserve-page__header {
  padding: 32rpx;
}

.timereserve-page__ticket-name {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 700;
  color: var(--color-text);
}

.timereserve-page__ticket-desc {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  margin-top: 8rpx;
}

/* ====== 日期选择 ====== */
.date-section {
  margin: 0 24rpx;
  padding: 28rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.date-section__title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.date-section__label {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
}

.date-section__value {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-primary);
}

.date-section__quick {
  display: flex;
  gap: 16rpx;
}

.date-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  border: 2rpx solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: 26rpx;
  color: var(--color-text-secondary);
  transition: all 0.12s ease;
}

.date-card--active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg-light);
  color: var(--color-primary);
}

.date-card--more {
  flex: 0 0 120rpx;
  font-size: 24rpx;
}

.date-card:active {
  opacity: 0.8;
  transform: scale(0.96);
}

.date-card__week {
  font-weight: 600;
  margin-bottom: 6rpx;
}
.date-card__price {
  font-size: 24rpx;
}

/* ====== 时段选择 ====== */
.time-section {
  margin: 24rpx 24rpx 0;
  padding: 28rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.time-section__title {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20rpx;
}

.time-section__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.time-slot {
  padding: 12rpx 24rpx;
  border: 2rpx solid var(--color-border-light);
  border-radius: var(--radius-sm, 16rpx);
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text);

  &--active {
    border-color: var(--color-primary);
    background-color: var(--color-primary-bg-light);
    color: var(--color-primary);
    font-weight: 600;
  }

  &--disabled {
    border-color: var(--color-disabled);
    color: var(--color-disabled);
    background-color: var(--color-bg);
  }
}

.time-slot__stock {
  display: block;
  font-size: 20rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}

/* ====== 数量 ====== */
.quantity-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24rpx 24rpx 0;
  padding: 28rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.quantity-section__label {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
}

/* ====== 游客信息 / 联系人 ====== */
.tourist-section,
.contact-section {
  margin: 24rpx 24rpx 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 28rpx;
  margin-bottom: 16rpx;
}

.section-header__bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 3rpx;
  background-color: var(--color-primary);
}

.section-header__title {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
}

.form-card {
  padding: 28rpx;
  margin-bottom: 16rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.form-card__row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-card__row-label {
  width: 125rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  text-align: right;
  padding-right: 20rpx;
}

.form-card__required {
  color: var(--color-danger);
  margin-right: 2rpx;
}

.form-card__input {
  flex: 1;
  height: 72rpx;
  padding: 0 20rpx;
  border: 1rpx solid var(--color-border-light);
  border-radius: var(--radius-sm, 16rpx);
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  background-color: var(--color-bg);

  &--id {
    padding-right: 80rpx;
  }
}

.form-card__id-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.form-card__id-icon {
  width: 56rpx;
  height: 56rpx;
  margin-left: -64rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-bg-light);
  border-radius: 50%;
  z-index: 1;

  &:active {
    opacity: 0.7;
  }
}

/* ====== 底部固定栏 ====== */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: var(--color-bg-card);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
  z-index: 100;
}

.bottom-bar__price-wrap {
  display: flex;
  flex-direction: column;
}

.bottom-bar__label {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.bottom-bar__price {
  display: flex;
  align-items: baseline;
  color: var(--color-primary);
}

.bottom-bar__symbol {
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
}

.bottom-bar__value {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.bottom-bar__deposit {
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}

.bottom-bar__btn {
  flex-shrink: 0;
  min-width: 220rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text-on-primary);
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-dark, var(--color-primary)) 100%
  );
  border-radius: var(--radius-button);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);

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
