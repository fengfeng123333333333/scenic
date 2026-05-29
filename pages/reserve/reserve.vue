<!--
  散客票预订页（reserve.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换
-->

<template>
  <view class="reserve-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="reserve-page__skeleton">
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
        <view class="skeleton-line skeleton-line--text" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 票型信息头 -->
      <view class="reserve-header">
        <text class="reserve-header__name">{{ ticketInfo.TicketName }}</text>
        <text class="reserve-header__desc" v-if="ticketInfo.Discription">{{
          ticketInfo.Discription
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
            :class="{ 'date-card--active': index === selectPoint }"
            v-for="(item, index) in dateList"
            :key="index"
            @click="handleDateSelect(index, item)"
          >
            <text class="date-card__week">{{ item.week }}</text>
            <text class="date-card__price">¥{{ item.price }}</text>
          </view>
          <view class="date-card date-card--more" @click="openCalendar">
            <text>更多日期</text>
          </view>
        </view>
        <u-calendar
          ref="calendar"
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
          @confirm="handleCalendarConfirm"
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
            @click="handleTimeSlotSelect(item)"
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

      <!-- 人脸录入 -->
      <view class="face-section" v-if="ticketInfo.NeedFace == 1">
        <view class="section-header">
          <view class="section-header__bar" />
          <text class="section-header__title">入园人脸录入</text>
        </view>
        <view
          class="face-section__grid"
          v-for="(item, index) in formData"
          :key="'face' + index"
        >
          <view
            class="face-img"
            v-for="(imgItem, imgIdx) in item.img"
            :key="imgIdx"
            @click="handleFacePhoto(index, imgIdx)"
          >
            <image
              class="face-img__pic"
              :class="{
                'face-img__pic--default': imgItem.imSrc === defaultFaceUrl,
              }"
              :src="imgItem.imSrc"
              mode="aspectFill"
            />
          </view>
        </view>
      </view>

      <!-- 游客信息 -->
      <view
        class="tourist-section"
        v-if="
          ticketInfo.NeedTouristIDCard == 1 || ticketInfo.NeedTouristPhone == 1
        "
      >
        <view class="section-header">
          <view class="section-header__bar" />
          <text class="section-header__title">游客信息</text>
        </view>
        <u-form
          v-for="(item, index) in formData"
          :key="'tourist' + index"
          :ref="
            (el) => {
              if (el) touristFormRefs[index] = el;
            }
          "
          :rules="touristRules"
          labelPosition="right"
          :model="item"
          labelWidth="80px"
        >
          <view class="form-card">
            <u-form-item label="姓名" prop="name">
              <input
                class="form-card__input"
                type="text"
                v-model="item.name"
                placeholder="请输入姓名"
              />
            </u-form-item>
            <u-form-item
              label="电话"
              prop="phone"
              :required="ticketInfo.NeedTouristPhone == 1"
            >
              <input
                class="form-card__input"
                type="number"
                v-model="item.phone"
                placeholder="请输入电话"
                maxlength="11"
              />
            </u-form-item>
            <u-form-item
              label="身份证"
              prop="identity"
              :required="ticketInfo.NeedTouristIDCard == 1"
            >
              <view class="form-card__id-wrap">
                <input
                  class="form-card__input form-card__input--id"
                  type="text"
                  v-model="item.identity"
                  placeholder="请输入身份证"
                  maxlength="18"
                />
                <view class="form-card__id-icon">
                  <u-icon
                    name="account"
                    color="var(--color-primary)"
                    size="22"
                    @click="goToCommonTourist(index)"
                  />
                </view>
              </view>
            </u-form-item>
          </view>
        </u-form>
      </view>

      <!-- 车牌登记（单人单牌） -->
      <view class="plate-section" v-if="ticketInfo.NeedCarNumber == 1">
        <view class="section-header">
          <view class="section-header__bar" />
          <text class="section-header__title">入场车牌登记</text>
        </view>
        <view
          class="form-card"
          v-for="(item, index) in formData"
          :key="'plate1' + index"
        >
          <view class="form-card__row" @click="handlePlateFocus(index)">
            <text class="form-card__row-label">车牌</text>
            <text
              class="form-card__row-value"
              :class="{ 'form-card__row-value--placeholder': !item.induc }"
            >
              {{ item.induc || "请点击输入车牌" }}
            </text>
          </view>
          <view class="form-card__row">
            <text class="form-card__row-label">电话</text>
            <input
              class="form-card__input form-card__input--inline"
              type="number"
              v-model="item.indPhone"
              placeholder="请输入电话"
            />
          </view>
        </view>
      </view>

      <!-- 车牌登记（多人多牌） -->
      <view
        class="plate-section"
        v-if="ticketInfo.NeedCarNumber == 0 || ticketInfo.NeedCarNumber == 2"
      >
        <view class="section-header">
          <view class="section-header__bar" />
          <text class="section-header__title">入场车牌登记</text>
          <text
            class="section-header__action"
            v-if="showPlateAdd"
            @click="addPlate"
            >新增</text
          >
        </view>
        <view
          class="form-card"
          v-for="(item, index) in plateList"
          :key="'plate2' + index"
        >
          <view class="form-card__row" @click="handlePlateFocus(index)">
            <text class="form-card__row-label">车牌</text>
            <text
              class="form-card__row-value"
              :class="{ 'form-card__row-value--placeholder': !item.induc }"
            >
              {{ item.induc || "请点击输入车牌" }}
            </text>
          </view>
          <view class="form-card__row">
            <text class="form-card__row-label">电话</text>
            <input
              class="form-card__input form-card__input--inline"
              type="number"
              v-model="item.indPhone"
              placeholder="请输入电话"
            />
          </view>
          <view class="form-card__delete" @click="removePlate(index)">
            <u-icon name="trash" color="var(--color-primary)" size="28" />
          </view>
        </view>
      </view>

      <!-- 联系人信息 -->
      <view
        class="contact-section"
        v-if="
          ticketInfo.NeedContactsName == 1 || ticketInfo.NeedContactsPhone == 1
        "
      >
        <view class="section-header">
          <view class="section-header__bar" />
          <text class="section-header__title">联系人信息</text>
        </view>
        <view class="form-card">
          <u-form
            ref="contactFormRef"
            :rules="contactRules"
            labelPosition="right"
            :model="contactForm"
            labelWidth="80px"
          >
            <u-form-item
              label="姓名"
              prop="name"
              :required="ticketInfo.NeedContactsName == 1"
            >
              <input
                class="form-card__input"
                type="text"
                v-model="contactForm.name"
                placeholder="请输入姓名"
              />
            </u-form-item>
            <u-form-item
              label="电话"
              prop="phone"
              :required="ticketInfo.NeedContactsPhone == 1"
            >
              <input
                class="form-card__input"
                type="number"
                v-model="contactForm.phone"
                placeholder="请输入电话"
                maxlength="11"
              />
            </u-form-item>
          </u-form>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="reserve-page__bottom-spacer" />
    </template>

    <!-- ==================== 优惠券快捷栏 ==================== -->
    <view
      class="coupon-bar"
      v-if="pageReady && !couponshow && couponList.length >= 1 && isShow"
      @click="openCoupon"
    >
      <text class="coupon-bar__label">优惠券</text>
      <text class="coupon-bar__discount" v-if="selectedCoupon">
        -¥{{
          selectedCoupon.CouponType == 0
            ? selectedCoupon.Amount
            : couponDiscountAmount
        }}
      </text>
      <text class="coupon-bar__arrow">></text>
    </view>

    <!-- ==================== 底部操作栏 ==================== -->
    <view class="bottom-bar" v-if="pageReady && isShow && !couponshow">
      <view class="bottom-bar__price-wrap">
        <text class="bottom-bar__label">合计</text>
        <view class="bottom-bar__price">
          <text class="bottom-bar__symbol">¥</text>
          <text class="bottom-bar__value">{{ displayPrice }}</text>
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

    <!-- ==================== 优惠券弹窗 ==================== -->
    <view class="coupon-overlay" v-show="couponshow" @click="closeCoupon">
      <view
        class="coupon-popup"
        :class="{ 'coupon-popup--show': couponshow }"
        @click.stop
      >
        <scroll-view class="coupon-popup__scroll" scroll-y>
          <cc-defineCoupon
            colors="var(--color-primary)"
            :couponList="couponList"
            @onReceive="handleCouponSelect"
          />
        </scroll-view>
      </view>
    </view>

    <!-- ==================== 车牌输入弹窗 ==================== -->
    <u-popup
      :show="showPlateInput"
      mode="bottom"
      :closeable="true"
      @close="closePlateInput"
    >
      <view class="plate-popup">
        <view class="plate-popup__title">请输入车牌</view>
        <view class="plate-popup__input">
          <car-number-input
            ref="plateInputRef"
            @numberInputResult="handlePlateInput"
            :defaultStr="defaultPlateNum"
          />
        </view>
      </view>
    </u-popup>

    <!-- ==================== Loading 遮罩 ==================== -->
    <zero-loading v-if="loading" :mask="true" type="circle" />

    <!-- ==================== Toast 提示 ==================== -->
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { onLoad, onShow, onReady } from "@dcloudio/uni-app";
import { useToast } from "@/util/toast.js";
import { useStore } from "@/store/index.js";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  commonTourist: "/pages/tourist/tourist",
  payment: "/pages/payment/payment",
};

// ==================== 常量 ====================
const DEFAULT_FACE_URL =
  "https://cdn.huibaitech.com/qrcode/public/defaultface.png";

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 页面级 Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 页面状态 ====================
const pageReady = ref(false);
const loading = ref(false);
const submitting = ref(false);
const requestLocked = ref(false);
const isShow = ref(true);

// ==================== 票型数据 ====================
const ticketInfo = ref({});
const dateList = ref([]);
const timeList = ref([]);
const endDate = ref("");

// ==================== 选择状态 ====================
const selectPoint = ref(0);
const selectedDate = ref("");
const selectedPrice = ref("");
const timePoint = ref("");
const selectedTimeSlot = ref(null);
const sumNumber = ref(1);

// ==================== 价格 ====================
const totalPrice = ref(0);

// ==================== 优惠券 ====================
const couponshow = ref(false);
const couponList = ref([]);
const selectedCoupon = ref(null);
const couponID = ref(0);
const couponBindIndex = ref(0);
const couponDiscountAmount = ref(0);

// ==================== 游客表单 ====================
const formData = ref([
  { name: "", phone: "", identity: "", img: [], induc: "", indPhone: "" },
]);
const touristFormRefs = []; // 普通数组，避免 ref 解包歧义
const touristRules = reactive({
  name: { rules: [{ required: false, errorMessage: "请输入游客姓名" }] },
  phone: {
    rules: [
      {
        required: false,
        format: "phone",
        errorMessage: "请输入游客电话号码",
      },
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

// ==================== 联系人表单 ====================
const contactForm = reactive({ name: "", phone: "" });
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

// ==================== 车牌 ====================
const plateList = ref([{ induc: "", indPhone: "" }]);
const showPlateAdd = ref(true);
const showPlateInput = ref(false);
const showCalendar = ref(false);
const plateFocusIndex = ref(0);
const defaultPlateNum = ref("");
const defaultFaceUrl = DEFAULT_FACE_URL;

// ==================== 路由参数 ====================
const mindBdi = ref("");

// ==================== 图片上传 ====================
const isUploading = ref(false);

// ==================== Refs ====================
const contactFormRef = ref(null);
const calendar = ref(null);
const plateInputRef = ref(null);

// ==================== 计算属性 ====================
const displayPrice = computed(() => {
  if (selectedCoupon.value) return Number(couponDiscountAmount.value) || 0;
  return totalPrice.value;
});

const availableStartDate = computed(() => {
  const list = ticketInfo.value.TicketStockList || [];
  if (list.length === 0) return selectedDate.value || getTodayStr();
  return list[0].date || selectedDate.value || getTodayStr();
});

const availableEndDate = computed(() => {
  const list = ticketInfo.value.TicketStockList || [];
  if (list.length === 0) return getTodayStr();
  return list[list.length - 1].date || getTodayStr();
});

const calendarColor = computed(() => {
  return store.themeVars?.["--color-primary"] || "#3c9cff";
});

// ==================== 生命周期 ====================
onLoad((option) => {
  parseRouteParams(option);
});

onMounted(() => {
  uni.$on("login", (data) => {
    formData.value[data.index] = {
      identity: data.item.TouristIDCard || "",
      name: data.item.TouristName || "",
      phone: data.item.TouristPhone || "",
      img: [],
      induc: "",
      indPhone: "",
    };
  });
});

onBeforeUnmount(() => {
  uni.$off("login");
});

onReady(() => {
  nextTick(() => {
    calendar.value?.setFormatter(calendarFormatter);
  });
});

onShow(async () => {
  try {
    await fetchAllData();
  } catch (err) {
    console.error("[reserve] 页面初始化失败:", err);
    showToast("加载失败，请重试");
  } finally {
    pageReady.value = true;
  }
});

// ==================== 工具方法 ====================
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ==================== 路由参数解析 ====================
function parseRouteParams(option) {
  if (option && JSON.stringify(option) !== "{}") {
    mindBdi.value = option.minpro || "";
  }
}

// ==================== 数据请求 ====================
async function fetchAllData() {
  const openid = uni.getStorageSync("userinfo");

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
  initTicketData();
  applyDynamicRules();
  await fetchTimeSlots(selectedDate.value);
  fetchCoupons(openid);
}

function initTicketData() {
  const { TicketStockList, NeedFace, NeedFaceNumber, NeedCarNumber } =
    ticketInfo.value;
  const stockList = TicketStockList || [];

  if (NeedCarNumber == 2) showPlateAdd.value = false;

  if (NeedFace == 1 && formData.value[0]) {
    formData.value[0].img = [];
    for (let i = 0; i < (NeedFaceNumber || 0); i++) {
      formData.value[0].img.push({ imSrc: DEFAULT_FACE_URL });
    }
  }

  if (stockList.length > 0) {
    endDate.value = stockList[stockList.length - 1].date || "";
  }

  buildDateQuickList(stockList);
}

function buildDateQuickList(stockList) {
  const now = new Date();
  const maxCount = Math.min(stockList.length, 3);
  const list = [];

  for (let i = 0; i < maxCount; i++) {
    const date = new Date(now.getTime() + i * 24 * 3600 * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    list.push({
      date: month + "-" + day,
      date1: year + "-" + month + "-" + day,
      day,
      week: stockList[i]?.date || "",
      price: stockList[i]?.info || "",
    });
  }

  dateList.value = list;
  if (list.length > 0) {
    selectedDate.value = stockList[0]?.date || "";
    selectedPrice.value = list[0].price;
    calcTotalPrice();
  }
}

function applyDynamicRules() {
  const t = ticketInfo.value;
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

async function fetchTimeSlots(date) {
  if (!date) return;
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetTicketTimeSlot",
    method: "POST",
    data: { ticketID: store.tickId, travelTime: date },
  });
  timeList.value = res?.data?.Data || [];
  if (timeList.value.length >= 1 && !timeList.value[0].IsSelect) {
    timePoint.value = timeList.value[0].TicketStockTime;
    selectedTimeSlot.value = timeList.value[0];
  }
}

async function fetchCoupons(openid) {
  if (!openid?.openid) return;
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetMyCoupon",
    method: "POST",
    data: {
      ChooseCompanyID: ticketInfo.value.CompanyID,
      ChooseScenicID: ticketInfo.value.ScenicID,
      OpenId: openid.openid,
      TotalMoney: totalPrice.value,
      Scope: 1,
      ProductID: store.tickId,
      TotalNumber: 1,
    },
  });
  couponList.value = res?.data?.Data || [];
}

// ==================== 价格计算 ====================
function calcTotalPrice() {
  totalPrice.value = Number(
    ((Number(selectedPrice.value) || 0) * sumNumber.value).toFixed(2),
  );
}

function recalcWithCoupon() {
  if (!selectedCoupon.value) return;
  if (selectedCoupon.value.CouponType == 0) {
    couponDiscountAmount.value = Math.max(
      0,
      totalPrice.value - selectedCoupon.value.Amount,
    ).toFixed(2);
  } else {
    couponDiscountAmount.value = (
      totalPrice.value *
      (selectedCoupon.value.Amount / 100)
    ).toFixed(2);
  }
}

// ==================== 表单校验 ====================
/** 直接 JS 校验（不依赖 u-form ref 捕获，100% 可控） */
function validateTouristForms() {
  const results = formData.value.map((item, idx) => {
    const errs = [];
    // 身份证：required 或 有值时校验格式
    if (touristRules.identity.rules[0].required) {
      if (!item.identity || !item.identity.trim()) {
        errs.push({
          field: "identity",
          msg: touristRules.identity.rules[0].errorMessage,
        });
      }
    }

    // 电话：required 或 有值时校验格式
    if (touristRules.phone.rules[0].required) {
      if (!item.phone || !item.phone.trim()) {
        errs.push({
          field: "phone",
          msg: touristRules.phone.rules[0].errorMessage,
        });
      }
    }
    console.log("reeeeeeeeeeeeee", errs);
    return errs.length === 0 ? null : errs;
  });
  return results;
}

/** 直接 JS 校验联系人信息（与游客信息一致的校验模式） */
function validateContactForm() {
  const errs = [];

  if (contactRules.name.rules[0].required) {
    if (!contactForm.name || !contactForm.name.trim()) {
      errs.push({
        field: "name",
        msg: contactRules.name.rules[0].errorMessage,
      });
    }
  }

  if (contactRules.phone.rules[0].required) {
    if (!contactForm.phone || !contactForm.phone.trim()) {
      errs.push({
        field: "phone",
        msg: contactRules.phone.rules[0].errorMessage,
      });
    }
  }
  return errs.length === 0 ? [] : errs;
}

// ==================== 导航辅助 ====================
function setPaymentStore(orderData, openid) {
  store.tickinfo = {
    time: selectedDate.value,
    OrderCode: orderData.OrderCode,
    OrderID: orderData.OrderID,
    TotalMoney: orderData.TotalMoney,
    ProductInfo: orderData.ProductInfo,
    openId: openid?.openid || "",
    isMember: orderData.IsBindMember,
  };
}

function goToPayment(orderData, openid) {
  setPaymentStore(orderData, openid);
  uni.reLaunch({ url: PAGE_ROUTES.payment });
}

function goToCommonTourist(index) {
  uni.navigateTo({ url: `${PAGE_ROUTES.commonTourist}?key=${index}` });
}

// ==================== 日期相关 ====================
function handleDateSelect(index, item) {
  if (!item) return;
  selectPoint.value = index;
  selectedDate.value = item.week;
  selectedPrice.value = item.price;
  calcTotalPrice();
  recalcWithCoupon();
  fetchTimeSlots(selectedDate.value);
}

function openCalendar() {
  const stockList = ticketInfo.value.TicketStockList || [];
  if (stockList.length === 0) {
    showToast("暂无可用日期", "default");
    return;
  }
  showCalendar.value = true;
  selectPoint.value = 4;
}

function handleCalendarConfirm(dates) {
  try {
    const dateStr = Array.isArray(dates) ? dates[0] : dates;
    if (!dateStr) {
      selectPoint.value = 0;
      return;
    }
    const stockList = ticketInfo.value.TicketStockList || [];
    const found = stockList.find((item) => item.date === dateStr);
    if (found) {
      selectedDate.value = dateStr;
      selectedPrice.value = found.info;
      calcTotalPrice();
      recalcWithCoupon();
      fetchTimeSlots(selectedDate.value);
      showCalendar.value = false;
    } else {
      selectPoint.value = 0;
      showToast("暂无排票!请选其他票", "warning");
    }
  } catch (err) {
    console.error("[reserve] calendar confirm error:", err);
  }
}

function handleCalendarClose() {
  showCalendar.value = false;
  isShow.value = true;
}

function calendarFormatter(day) {
  if (!day) return day;
  const m = String(day.month).padStart(2, "0");
  const d = String(day.day).padStart(2, "0");
  const dateStr = `${day.year}-${m}-${d}`;
  const stockList = ticketInfo.value.TicketStockList || [];
  const found = stockList.find((item) => item.date === dateStr);
  if (found) {
    day.bottomInfo = `¥${found.info}`;
    day.dot = true;
  }
  return day;
}

// ==================== 时段相关 ====================
function handleTimeSlotSelect(item) {
  if (!item || item.IsSelect == 1) return;
  timePoint.value = item.TicketStockTime;
  selectedTimeSlot.value = item;
}

// ==================== 数量相关 ====================
function handleQuantityChange(e) {
  const newVal = e?.value ?? e;
  const oldVal = sumNumber.value;
  sumNumber.value = newVal;
  calcTotalPrice();
  recalcWithCoupon();

  if (newVal > oldVal) {
    for (let i = oldVal; i < newVal; i++) {
      formData.value.push({
        identity: "",
        name: "",
        phone: "",
        img: [],
        indPhone: "",
        induc: "",
      });
      const faceCount = ticketInfo.value.NeedFaceNumber || 0;
      for (let j = 0; j < faceCount; j++) {
        formData.value[i].img.push({ imSrc: DEFAULT_FACE_URL });
      }
    }
  } else if (newVal < oldVal) {
    formData.value.splice(newVal, oldVal - newVal);
  }
}

// ==================== 人脸拍照 ====================
async function handleFacePhoto(index, index1) {
  try {
    isUploading.value = true;
    const tempFilePath = await chooseImage();
    if (!tempFilePath) return;
    const compressedPath = await compressSelectedImage(tempFilePath);
    await uploadCompressedImage(compressedPath, index, index1);
  } catch (error) {
    console.error("[reserve] 人脸上传失败:", error);
    showToast("上传失败");
  } finally {
    isUploading.value = false;
  }
}

function chooseImage() {
  return new Promise((resolve, reject) => {
    const isAndroid = uni.getSystemInfoSync().platform === "android";
    uni.chooseImage({
      count: 1,
      sourceType: ["camera", "album"],
      sizeType: isAndroid ? ["compressed"] : ["original"],
      quality: isAndroid ? 0.8 : 1.0,
      success: (res) => resolve(res.tempFilePaths[0]),
      fail: (err) =>
        reject(
          new Error(err.errMsg?.includes("cancel") ? "已取消选择" : "选图失败"),
        ),
    });
  });
}

function compressSelectedImage(tempPath) {
  return new Promise(async (resolve) => {
    try {
      const isAndroid = uni.getSystemInfoSync().platform === "android";
      if (isAndroid && (!tempPath || !tempPath.includes("tmp"))) {
        resolve(tempPath);
        return;
      }
      let imageInfo = { width: 800, height: 600 };
      try {
        imageInfo = await getImageInfo(tempPath);
      } catch (e) {
        /* 使用默认 */
      }
      const params = { src: tempPath, quality: isAndroid ? 0.6 : 0.4 };
      if (isAndroid) {
        const maxWidth = 800;
        params.width = Math.floor(
          imageInfo.width > maxWidth ? maxWidth : imageInfo.width,
        );
        params.height = Math.floor(
          imageInfo.height * (params.width / imageInfo.width),
        );
      }
      uni.compressImage({
        ...params,
        success: (res) => resolve(res.tempFilePath),
        fail: () => resolve(tempPath),
      });
    } catch (err) {
      resolve(tempPath);
    }
  });
}

function uploadCompressedImage(compressedPath, index, index1) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: "https://saasapp.huibaitech.com/api/Applets/UploadTicketFaceImg",
      filePath: compressedPath,
      header: { AppID: uni.getAccountInfoSync().miniProgram.appId },
      name: "file",
      formData: { user: "test" },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(res.data);
            const imgUrl = result?.Data?.ImgUrl;
            if (imgUrl && formData.value[index]?.img?.[index1]) {
              formData.value[index].img[index1].imSrc = imgUrl;
            }
            resolve();
          } catch (e) {
            reject(new Error("解析上传结果失败"));
          }
        } else {
          reject(new Error("服务器返回异常"));
        }
      },
      fail: (err) => reject(new Error("上传失败" + err.errMsg)),
    });
  });
}

function getImageInfo(tempPath) {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: tempPath,
      timeout: 5000,
      success: resolve,
      fail: reject,
    });
  });
}

// ==================== 车牌相关 ====================
function handlePlateFocus(index) {
  showPlateInput.value = true;
  plateFocusIndex.value = index;
  setTimeout(() => {
    plateInputRef.value?.plateInput?.(0);
  }, 200);

  const needCar = ticketInfo.value.NeedCarNumber;
  let currentPlate =
    needCar == 1
      ? formData.value[index]?.induc || ""
      : plateList.value[index]?.induc || "";
  defaultPlateNum.value = currentPlate;
  if (!currentPlate && plateInputRef.value) {
    plateInputRef.value.inputList = [" ", " ", " ", " ", " ", " ", " ", " "];
  }
}

function handlePlateInput(result) {
  const cleaned = (result || "").replace(/\s+/g, "");
  const idx = plateFocusIndex.value;
  if (ticketInfo.value.NeedCarNumber == 1) {
    if (formData.value[idx]) formData.value[idx].induc = cleaned;
  } else {
    if (plateList.value[idx]) plateList.value[idx].induc = cleaned;
  }
  if (cleaned.length == 7 || cleaned.length == 8) showPlateInput.value = false;
}

function closePlateInput() {
  showPlateInput.value = false;
}

function addPlate() {
  const max = ticketInfo.value.NeedMaxCarNumber || 1;
  if (plateList.value.length < max)
    plateList.value.push({ indPhone: "", induc: "" });
}

function removePlate(index) {
  if (plateList.value.length > 1) {
    plateList.value.splice(index, 1);
  } else {
    showToast("最少要一个车牌", "default");
  }
}

// ==================== 优惠券 ====================
function openCoupon() {
  couponshow.value = true;
}
function closeCoupon() {
  couponshow.value = false;
}

function handleCouponSelect(item, index) {
  couponshow.value = false;
  selectedCoupon.value = item;
  couponID.value = item?.CouponID || 0;
  couponBindIndex.value = index;
  recalcWithCoupon();
}

// ==================== 业务方法 ====================
async function handleSubmit() {
  if (submitting.value || requestLocked.value) {
    console.log("[reserve] 提交已锁定，防止重复提交");
    return;
  }
  submitting.value = true;

  try {
    const validateResults = validateTouristForms();
    const allPassed = validateResults.every((item) => item === null);
    if (!allPassed) {
      showToast(validateResults[0][0].msg || "请完善游客信息");
      submitting.value = false;
      return;
    }

    const contactErr = validateContactForm();

    const allcontactErr = contactErr.every((item) => item === null);
    if (!allcontactErr) {
      showToast(contactErr[0].msg || "请完善联系人信息");
      submitting.value = false;
      return;
    }
    if (!checkPlateRequired()) {
      showToast("请填写车牌号码");
      submitting.value = false;
      return;
    }
    console.log("formData", formData.value);
    await createOrder();
  } catch (err) {
    console.error("[reserve] 提交预定失败:", err);
    showToast("提交失败，请重试");
  } finally {
    loading.value = false;
    submitting.value = false;
    requestLocked.value = false;
  }
}

function checkPlateRequired() {
  const { NeedCarNumber } = ticketInfo.value;
  if (NeedCarNumber == 1) return formData.value.some((item) => item.induc);
  if (NeedCarNumber == 0 || NeedCarNumber == 2)
    return plateList.value.some((item) => item.induc);
  return true;
}

async function createOrder() {
  loading.value = true;
  requestLocked.value = true;
  const openid = uni.getStorageSync("userinfo");
  const money = selectedCoupon.value
    ? Number(couponDiscountAmount.value)
    : totalPrice.value;

  const touristList = formData.value.map((item) => ({
    ticketID: store.tickId,
    touristName: item.name || "",
    touristPhone: item.phone || "",
    idType: 0,
    touristIDCard: item.identity || "",
  }));

  const faceList = [];
  if (ticketInfo.value.NeedFace == 1) {
    formData.value.forEach((item) => {
      (item.img || []).forEach((imgItem) => {
        const url = imgItem.imSrc !== DEFAULT_FACE_URL ? imgItem.imSrc : "";
        faceList.push({
          ticketID: store.tickId,
          ticketName: ticketInfo.value.TicketName || "",
          faceUrlList: [url],
        });
      });
    });
  }

  const PlateNoList = (plateList.value || []).map((item) => ({
    Phone: item.indPhone || "",
    PlateNo: item.induc || "",
    TicketID: store.tickId,
  }));

  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsCreateTicketOrder",
    method: "POST",
    data: {
      openId: openid?.openid || "",
      memberID: 0,
      totalNumber: sumNumber.value,
      totalMoney: Number(money),
      travelTime: selectedDate.value,
      contacts: contactForm.name || "",
      contactPhone: contactForm.phone || "",
      contactIDCard: "",
      couponID: couponID.value,
      couponBindMemberID: couponBindIndex.value,
      origin: "",
      remark: "",
      DistributorID: store.seltck?.DistributorID ?? 0,
      saleticketID: store.seltck?.saleticketID ?? 0,
      shoppingCartList: [
        {
          ticketID: store.tickId,
          ticketStockTimeID: selectedTimeSlot.value.TicketStockTimeID,
          ticketName: ticketInfo.value.TicketName || "",
          number: sumNumber.value,
          unitPrice: Number(selectedPrice.value) || 0,
          discountUnitPrice: Number(selectedPrice.value) || 0,
          totalPrice: totalPrice.value,
        },
      ],
      faceList,
      PersonDistributionUserID: mindBdi.value,
      touristList,
      timeSlotList: selectedTimeSlot.value
        ? [
            {
              TicketStockTimeID: selectedTimeSlot.value.TicketStockTimeID,
              TicketID: selectedTimeSlot.value.TicketID,
              Number: sumNumber.value,
              StockDate: selectedTimeSlot.value.StockDate,
              TicketStockTime: selectedTimeSlot.value.TicketStockTime,
              StartTime: selectedTimeSlot.value.StartTime,
              EndTime: selectedTimeSlot.value.EndTime,
            },
          ]
        : [],
      PlateNoList,
    },
  });

  if (res.data.Code === 200) {
    goToPayment(res.data.Data || {}, openid);
  } else {
    console.log("[reserve] 创建订单失败:", res.data);
    showToast(res.data.message || "订单创建失败");
    loading.value = false;
    requestLocked.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   散客票预订页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.reserve-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
}

// ==================== 骨架屏 ====================
.reserve-page__skeleton {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
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

// ==================== 票型信息头 ====================
.reserve-header {
  background: var(--color-bg-card);
  margin: 20rpx;
  padding: 24rpx;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.reserve-header__name {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}
.reserve-header__desc {
  display: block;
  font-size: 28rpx;
  color: var(--color-text-secondary);
  margin-top: 12rpx;
}

// ==================== 日期选择区 ====================
.date-section {
  background: var(--color-bg-card);
  margin: 0 20rpx 20rpx;
  padding: 24rpx;
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
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}
.date-section__value {
  font-size: 28rpx;
  color: var(--color-primary);
  font-weight: 600;
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

// ==================== 时段选择区 ====================
.time-section {
  background: var(--color-bg-card);
  margin: 0 20rpx 20rpx;
  padding: 24rpx;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.time-section__title {
  font-size: 28rpx;
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
  width: calc(50% - 8rpx);
  height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: 26rpx;
  color: var(--color-text);
  transition: all 0.12s ease;
}

.time-slot--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg-light);
}

.time-slot--disabled {
  background: var(--color-disabled);
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.time-slot:active:not(.time-slot--disabled) {
  opacity: 0.8;
  transform: scale(0.96);
}

.time-slot__stock {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  margin-top: 4rpx;
}

// ==================== 数量选择 ====================
.quantity-section {
  background: var(--color-bg-card);
  margin: 0 20rpx 20rpx;
  padding: 24rpx;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-section__label {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}

.num-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: var(--radius-sm);
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1;
}

.num-btn:active {
  opacity: 0.8;
  transform: scale(0.92);
}

.num-input {
  min-width: 80rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}

// ==================== 通用分区标题 ====================
.section-header {
  display: flex;
  align-items: center;
  padding: 8rpx 8rpx 16rpx;
}
.section-header__bar {
  width: 6rpx;
  height: 32rpx;
  background: var(--color-primary);
  border-radius: 3rpx;
  margin-right: 12rpx;
}
.section-header__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
}
.section-header__action {
  font-size: 26rpx;
  color: var(--color-primary);
  padding: 8rpx 20rpx;
  border-radius: var(--radius-sm);
  background: var(--color-primary-bg-light);
}

.section-header__action:active {
  opacity: 0.7;
}

// ==================== 人脸录入 ====================
.face-section {
  margin: 0 20rpx 20rpx;
}
.face-section__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.face-img {
  width: 330rpx;
  height: 250rpx;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 2rpx solid var(--color-border-light);
}

.face-img:active {
  opacity: 0.8;
}

.face-img__pic {
  width: 100%;
  height: 100%;
}

.face-img__pic--default {
  width: 250rpx;
  height: 250rpx;
  margin: 0 auto;
  display: block;
}

// ==================== 游客 & 联系人表单 ====================
.tourist-section,
.contact-section,
.plate-section {
  margin: 0 20rpx 20rpx;
}

.form-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 8rpx 20rpx 20rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--shadow-soft);
  position: relative;
}

.form-card__input {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  color: var(--color-text);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: 0 24rpx;
  box-sizing: border-box;
}

.form-card__input--id {
  flex: 1;
  padding-right: 80rpx;
}

.form-card__input--inline {
  flex: 1;
  height: 72rpx;
}

.form-card__id-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.form-card__id-icon {
  position: absolute !important;
  right: 16rpx;
  top: 50%;
  transform: translateY(-50%);
}

.form-card__row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid var(--color-border-light);
}

.form-card__row:last-child {
  border-bottom: none;
}

.form-card__row-label {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  width: 80px;
  flex-shrink: 0;
}

.form-card__row-value {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-text);
}

.form-card__row-value--placeholder {
  color: var(--color-disabled);
}

.form-card__delete {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 8rpx;
}

.form-card__delete:active {
  opacity: 0.6;
}

// ==================== 底部占位 ====================
.reserve-page__bottom-spacer {
  height: 180rpx;
}

// ==================== 优惠券快捷栏 ====================
.coupon-bar {
  position: fixed;
  bottom: 140rpx;
  left: 0;
  right: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  height: 90rpx;
  padding: 0 28rpx;
  background: var(--color-bg-card);
  box-shadow: var(--shadow-soft);
}

.coupon-bar:active {
  opacity: 0.8;
}

.coupon-bar__label {
  font-size: 28rpx;
  color: var(--color-text);
}
.coupon-bar__discount {
  font-size: 28rpx;
  color: var(--color-primary);
  font-weight: 600;
  margin-left: 16rpx;
}
.coupon-bar__arrow {
  position: absolute;
  right: 28rpx;
  font-size: 32rpx;
  color: var(--color-text-secondary);
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
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
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

.bottom-bar__btn:active {
  opacity: 0.88;
  transform: scale(0.96);
  box-shadow: none;
}

.bottom-bar__btn--loading,
.bottom-bar__btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

// ==================== 优惠券弹窗 ====================
.coupon-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 990;
}

.coupon-popup {
  position: fixed;
  left: 0;
  bottom: -1000rpx;
  width: 100%;
  z-index: 999;
  background: var(--color-bg-card);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  transition: bottom 0.3s ease;
  &--show {
    bottom: 0;
  }
}

.coupon-popup__scroll {
  width: 100%;
  height: 60vh;
  padding: 20rpx 0;
  padding-bottom: env(safe-area-inset-bottom);
}

// ==================== 车牌输入弹窗 ====================
.plate-popup {
  min-height: 700rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
.plate-popup__title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
  margin: 30rpx 0 0 30rpx;
}
.plate-popup__input {
  margin-top: 30rpx;
}
</style>
