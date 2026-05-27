<template>
  <view class="home-content">
    <IndexSkeleton v-if="!pageReady" />

    <template v-else>
      <u-navbar
        :title="weather.ScenicName"
        leftIcon="home"
        :placeholder="true"
        :autoBack="true"
        :fixed="false"
      />
      <view class="hero">
        <swiper
          class="hero__swiper"
          circular
          :autoplay="autoplay"
          :interval="interval"
          :duration="duration"
        >
          <swiper-item v-for="(item, index) in banList" :key="index">
            <view class="hero__slide">
              <image class="hero__image" :src="item.ImgUrl" mode="aspectFill" />
              <view class="hero__mask" />
            </view>
          </swiper-item>
        </swiper>
        <view class="hero__weather" v-if="weather.Weather">
          <text class="hero__weather-text">{{ weather.Weather }}</text>
        </view>
        <f-notice
          class="hero__notice"
          v-show="card.length != 0"
          :text="card"
          :speed="3000"
          @click="swiperClick"
        />
      </view>

      <view class="passenger-notice" v-if="weather.PassengerFlow != ''">
        <u-notice-bar :text="String(weather.PassengerFlow)" />
      </view>

      <view class="info-card">
        <view class="row">
          <view class="row__icon row__icon--secondary">
            <u-icon name="clock" color="var(--color-primary)" size="28" />
          </view>
          <view class="row__content">
            <text class="label">{{ weather.OpeningHoursTitle }}</text>
            <text class="value">{{ weather.OpeningHours }}</text>
          </view>
        </view>
        <view class="row row--clickable" @click="dizhi">
          <view class="row__icon row__icon--secondary">
            <u-icon name="map" color="var(--color-primary)" size="28" />
          </view>
          <view class="row__content">
            <text class="label">景区地址</text>
            <text class="value">{{ weather.Address }}</text>
          </view>
        </view>
        <view class="row row--clickable" @click="calPhone">
          <view class="row__icon row__icon--secondary">
            <u-icon name="phone" color="var(--color-primary)" size="28" />
          </view>
          <view class="row__content">
            <text class="label">{{ weather.PhoneTitle }}</text>
            <text class="value">{{ weather.Phone }}</text>
          </view>
        </view>
      </view>

      <view class="block" v-if="isShow">
        <view class="icon-grid">
          <view
            class="item"
            v-for="(item, index) in title"
            :key="item.ID"
            @click="menPiao(item.PageUrl, item.Title, item)"
          >
            <view class="icon-bg">
              <image class="item__icon" :src="item.ImageUrl" mode="aspectFit" />
            </view>
            <text class="item__label">{{ item.Title }}</text>
          </view>
        </view>

        <image
          class="seat-banner"
          :src="weather.EnableAppletSeatMainImgUrl"
          v-if="weather.EnableAppletSeatMainImgUrl != ''"
          mode="widthFix"
        />

        <view class="tab-nav tabLis" v-if="classification.length > 0">
          <v-tabs
            v-model="activeTab"
            :tabs="classification"
            field="name"
            @change="changeTab"
            lineColor="transparent"
            :scroll="true"
          />

          <template v-if="isActive == 0">
            <Kong v-if="tickList.length === 0" text="当前暂无可售票项" />
            <view class="product-grid tickList" v-else>
              <view
                class="product-card tick"
                v-for="(item, index) in tickList"
                @click="tickDetails(item.TicketID)"
                :key="index"
              >
                <image
                  class="product-card__image tabListImage"
                  :src="item.ImgUrl"
                  mode="aspectFill"
                />
                <view class="product-card__body">
                  <text class="product-card__name name">{{
                    item.TicketName
                  }}</text>
                  <view class="product-card__price-row">
                    <text class="price"
                      ><text class="price__symbol">￥</text
                      >{{ item.SellPrice }}</text
                    >
                    <text class="discount">￥{{ item.MarketPrice }}</text>
                  </view>
                  <text
                    class="product-tag"
                    v-if="item.LabelList"
                    v-for="(item1, index1) in item.LabelList"
                    :key="index1"
                    >{{ item1 }}</text
                  >
                </view>
              </view>
            </view>
          </template>

          <template v-if="isActive == 1">
            <Kong v-if="tickList.length === 0" text="暂无商品" />
            <view class="product-grid tickList" v-else>
              <view
                class="product-card tick"
                v-for="(item, index) in tickList"
                @click="purchase(item)"
                :key="index"
              >
                <image
                  class="product-card__image tabListImage"
                  :src="item.ImgUrl"
                  mode="aspectFill"
                />
                <view class="product-card__body">
                  <text class="product-card__name name">{{
                    item.GoodsName
                  }}</text>
                  <view class="product-card__price-row">
                    <text class="price">￥{{ item.SellPrice }}</text>
                    <text class="discount">￥{{ item.MarketPrice }}</text>
                  </view>
                  <text
                    class="product-tag"
                    v-if="item.LabelList"
                    v-for="(item1, item) in item.LabelList"
                    :key="index"
                    >{{ item1 }}</text
                  >
                </view>
              </view>
            </view>
          </template>

          <template v-if="isActive == 2">
            <Kong v-if="tickList.length === 0" text="当前暂无会员套餐" />
            <view class="product-grid tickList" v-else>
              <view
                class="product-card tick"
                v-for="(item, index) in tickList"
                @click="menberCard(item)"
                :key="index"
              >
                <image
                  class="product-card__image tabListImage"
                  :src="item.ImgUrl"
                  mode="aspectFill"
                />
                <view class="product-card__body">
                  <text class="product-card__name name">{{
                    item.TicketName
                  }}</text>
                  <view class="product-card__price-row">
                    <text class="price">￥{{ item.SellPrice }}</text>
                    <text class="discount">￥{{ item.MarketPrice }}</text>
                  </view>
                  <text
                    class="product-tag"
                    v-if="item.LabelList"
                    v-for="(item1, item) in item.LabelList"
                    :key="index"
                    >{{ item1 }}</text
                  >
                </view>
              </view>
            </view>
          </template>

          <template v-if="isActive == 3">
            <Kong v-if="tickList.length === 0" text="当前暂无优惠券" />
            <view class="product-grid tickList" v-else>
              <view
                class="product-card tick product-card--coupon"
                v-for="(item, index) in tickList"
                @click="linqu(item)"
                :key="index"
              >
                <image
                  class="product-card__image tabListImage"
                  :src="item.ImgUrl"
                  mode="aspectFill"
                />
                <view class="product-card__body">
                  <text class="product-card__name name">{{ item.Name }}</text>
                  <view
                    class="product-card__price-row product-card__price-row--inline"
                  >
                    <text class="price"
                      ><text class="price__symbol">￥</text
                      >{{ item.Price }}</text
                    >
                    <text class="discount">￥{{ item.MarketPrice }}</text>
                  </view>
                  <text class="disc">截止日期：{{ item.EndTimeDesc }}</text>
                </view>
              </view>
            </view>
          </template>
        </view>
      </view>

      <view
        class="footer-info edition"
        v-if="weather.CompanyName != '' || weather.CompanyName != null"
      >
        <view class="bink">{{ weather.CompanyName }}</view>
        <view class="bink">{{ weather.SupportContent }}</view>
        <view class="bink">{{ weather.AppletVersion }}</view>
      </view>

      <u-popup
        ref="popup"
        :show="false"
        mode="center"
        :overlay="true"
        :mask-click="false"
      >
        <view class="modal scalVie">
          <scroll-view class="warp modal__scroll" scroll-y="true">
            <view class="modal__title title">{{ notbcLit.Title }}</view>
            <u-parse :content="notbcLit.Content" />
          </scroll-view>
          <view class="botme modal__footer">
            <view class="modal__checkbox">
              <u-checkbox-group @change="checkboxChange">
                <u-checkbox
                  v-model="noticShow"
                  shape="shape"
                  label="我已阅读并遵守以上规定"
                />
              </u-checkbox-group>
            </view>
            <view class="modal__action">
              <button
                :class="{ active: deist == false }"
                :disabled="deist"
                class="btn"
                @click="close"
              >
                确定
              </button>
            </view>
          </view>
        </view>
      </u-popup>

      <u-popup
        :show="item.show"
        :zIndex="10077 + index + 1"
        v-for="(item, index) in popList"
        :key="index"
        :overlay="true"
        :safeAreaInsetBottom="false"
        mode="center"
      >
        <view class="popup-ad">
          <image
            class="popup-ad__image"
            :src="item.img"
            @click="inMag()"
            mode="widthFix"
          />
          <view class="guan">
            <u-icon
              name="close-circle"
              color="var(--color-bg-card)"
              @click="mindImga(index)"
              size="35"
              class="mdic"
            />
          </view>
        </view>
      </u-popup>
    </template>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from "vue";
import store from "../../store/index.js";
import IndexSkeleton from "../../components/skeleton/index_skeleton.vue";
import Kong from "../../components/kong/kong.vue";

const proxy = getCurrentInstance().proxy || getCurrentInstance();
const emit = defineEmits(["ready"]);

const indicatorDots = ref(true);
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);
const banList = ref([]);
const activeTab = ref(0);
const tickList = ref([]);
const numberPhone = ref("");
const weather = ref({ CompanyName: "", SupportContent: "", AppletVersion: "" });
const isShow = ref("");
const imgHeight = ref("");
const card = ref([]);
const title = ref([]);
const isActive = ref(0);
const classification = ref([]);
const noticShow = ref(false);
const deist = ref(true);
const infoShow = ref(false);
const popList = ref([]);
const notbcLit = ref({ Title: "", Content: "" });
const popup = ref(null);
const pageReady = ref(false);

const myRequest = (options) => uni.$myRequest(options);

onMounted(() => {
  startPageFun();
});

function startPageFun() {
  pageReady.value = false;
  payLoad();
}

async function payLoad() {
  try {
    titleImg();
    const list = await myRequest({
      url: "/api/Applets/AppletsMainScenicInfo",
      method: "POST",
    });
    const notcLit = list.data.Data.Popup || {};
    weather.value = list.data.Data;
    if (
      notcLit.IsAlways == 0 &&
      notcLit.ImgUrlList != null &&
      weather.value.Popup &&
      weather.value.Popup.IsShow == 1
    ) {
      popList.value = notcLit.ImgUrlList.map((item) => ({
        img: item,
        show: true,
      }));
    }
    store.state.isSow = list.data.Data.UpgradeMode;
    isShow.value = list.data.Data.UpgradeMode != 1;
    if (
      weather.value.Popup &&
      weather.value.Popup.IsShow == 1 &&
      weather.value.Popup.PopType == 0
    ) {
      infoShow.value = true;
    }
    card.value = [];
    const noticeList = weather.value.NoticeList || [];
    for (let i = 0; i < noticeList.length; i++) {
      card.value.push(noticeList[i].Title);
    }
    numberPhone.value = uni.getStorageSync("phone");
    bannar();
    setTimeout(() => {
      if (classification.value.length) changeTab(0);
    }, 200);
    if (noticeList.length > 0 && weather.value.PopNotice == 1) {
      const PopNotice = uni.getStorageSync("PopNotice");
      if (!PopNotice) {
        uni.setStorage({ key: "PopNotice", data: noticeList[0] });
        notciVal(noticeList[0].NoticeID);
        if (!weather.value.Popup || weather.value.Popup.IsShow != 1)
          popup.value.open("center");
      } else if (PopNotice.NoticeID != noticeList[0].NoticeID) {
        uni.setStorage({ key: "PopNotice", data: noticeList[0] });
        notciVal(noticeList[0].NoticeID);
        popup.value.open("center");
      }
    }
  } finally {
    setTimeout(() => {
      pageReady.value = true;
      emit("ready");
    }, 800);
  }
}

function inMag() {
  if (!weather.value.Popup || weather.value.Popup.IsLink != 1) return;
  const p = weather.value.Popup;
  if (p.LinkType == 0)
    uni.navigateTo({ url: `/pages/details/details?tId=${p.ParamID}` });
  else if (p.LinkType == 1)
    uni.navigateTo({
      url: "/pages/subPack/notice/noticList?notic=" + p.ParamID,
    });
  else if (p.LinkType == 2) {
    const mi = uni.getStorageSync("menberInfo");
    if (numberPhone.value || weather.value.EnableAppletNeedGetPhone == 0) {
      if (mi) {
        uni.navigateTo({
          url: "/pages/subPack/menber/recharge?menber=" + mi.MemberID,
        });
        store.state.tickId = p.ParamID;
      } else
        uni.navigateTo({ url: "/pages/subPack/menber/menber?menber=" + 0 });
    } else uni.redirectTo({ url: "/pages/information/information" });
  } else if (p.LinkType == 3)
    uni.navigateTo({ url: "/pages/introduce/introduce" });
  else if (p.LinkType == 4) {
    const cs = JSON.stringify({
      MerchantID: p.MerchantID,
      ShopID: p.ShopID,
      GoodsID: p.ParamID,
    });
    uni.navigateTo({
      url: "/pages/subPack/productList/productDetails?currentSite=" + cs,
    });
  }
}

function checkboxChange(val) {
  deist.value = val.length === 0;
}
function close() {
  popup.value.close();
}

async function notciVal(value) {
  const list = await myRequest({
    url: "/api/Applets/AppletsGetScenicNoticeInfo?NoticeID=" + Number(value),
    method: "POST",
  });
  notbcLit.value = list.data.Data;
}

function swiperClick(val) {
  const nl = weather.value.NoticeList || [];
  if (!nl[val]) return;
  uni.navigateTo({
    url: "/pages/subPack/notice/noticList?notic=" + nl[val].NoticeID,
  });
}

function imageLoad(e) {
  const id = e.currentTarget.id,
    idx = id.substr(3),
    item = banList.value[idx];
  uni
    .createSelectorQuery()
    .in(proxy)
    .select("#" + id)
    .boundingClientRect((data) => {
      item.containerHeight = (data.width * e.detail.height) / e.detail.width;
      imgHeight.value = (data.width * e.detail.height) / e.detail.width;
      proxy.$forceUpdate();
    })
    .exec();
}

function calPhone() {
  uni.makePhoneCall({ phoneNumber: weather.value.Phone });
}
function dizhi() {
  uni.openLocation({
    latitude: Number(weather.value.LocalityY),
    longitude: Number(weather.value.LocalityX),
    name: weather.value.ScenicName,
    address: weather.value.Address,
  });
}
function mindImga(index) {
  popList.value[index].show = false;
}
function infoClose() {
  infoShow.value = false;
}
function linqu(item) {
  uni.navigateTo({
    url: `/pages/subPack/rolldetails/rolldetails?id=${item.ID}`,
  });
}

function menberCard(item) {
  const mi = uni.getStorageSync("menberInfo");
  if (numberPhone.value || weather.value.EnableAppletNeedGetPhone == 0) {
    if (mi) {
      uni.navigateTo({
        url: "/pages/subPack/menber/recharge?menber=" + mi.MemberID,
      });
      store.state.tickId = item.TicketID;
    } else uni.navigateTo({ url: "/pages/subPack/menber/menber?menber=" + 0 });
  } else uni.redirectTo({ url: "/pages/information/information" });
}

function purchase(item) {
  const cs = JSON.stringify({
    MerchantID: item.MerchantID,
    ShopID: item.ShopID,
    GoodsID: item.GoodsID,
  });
  uni.navigateTo({
    url: "/pages/subPack/productList/productDetails?currentSite=" + cs,
  });
}

function changeTab(index) {
  if (!classification.value[index]) return;
  activeTab.value = index;
  const pu = classification.value[index].PageUrl;
  if (pu == "/pages/ticket/ticket") {
    isActive.value = 0;
    tick();
  } else if (pu == "/pages/subPack/productList/productList") {
    product();
    isActive.value = 1;
  } else if (pu == "/pages/subPack/menber/menber") {
    menber();
    isActive.value = 2;
  } else if (pu == "/pages/subPack/rollcenter/rollcenter") {
    rollMen();
    isActive.value = 3;
  }
}

async function rollMen() {
  const oi = uni.getStorageSync("userinfo");
  const list = await myRequest({
    url: "/api/AppletsIndoor/CouponCenterList",
    data: { openId: oi.openid, ChooseCompanyID: 0, ChooseScenicID: 0 },
    method: "POST",
  });
  tickList.value = list.data.Data;
}
async function menber() {
  const list = await myRequest({
    url: "/api/Applets/AppletsRecommendOpenCardTicket",
    method: "POST",
  });
  tickList.value = list.data.Data;
}
async function product() {
  const list = await myRequest({
    url: "/api/Applets/AppletsRecommendGoods",
    method: "POST",
  });
  tickList.value = list.data.Data;
}

function tickDetails(index) {
  if (numberPhone.value || weather.value.EnableAppletNeedGetPhone == 0) {
    uni.navigateTo({ url: `/pages/details/details?tId=${index}` });
    store.state.tickId = index;
  } else uni.redirectTo({ url: "/pages/information/information" });
}

function menPiao(val, str, item) {
  if (item.IsJump === 0) {
    if (val == "/pages/subPack/menber/menber") {
      const mi = uni.getStorageSync("menberInfo");
      if (mi)
        uni.navigateTo({
          url:
            "/pages/subPack/menber/menber?menber=" +
            mi.MemberID +
            "&str=" +
            str,
        });
      else uni.navigateTo({ url: "/pages/subPack/mindTike/mindTike" });
    } else if (val == "/pages/ticket/ticket")
      uni.switchTab({ url: "/pages/ticket/ticket" });
    else if (val == "/pages/contactus/contactus")
      uni.makePhoneCall({ phoneNumber: weather.value.Phone });
    else if (val == "/pages/busline/busline")
      uni.openLocation({
        latitude: Number(weather.value.LocalityY),
        longitude: Number(weather.value.LocalityX),
        name: weather.value.ScenicName,
        address: weather.value.Address,
      });
    else if (val == "/pages/subPack/activitydetail/activitydetail")
      uni.navigateTo({
        url: `/pages/subPack/activitydetail/activitydetail?title=${item.Title}`,
      });
    else if (val.indexOf("https://") === 0)
      uni.navigateTo({ url: `/pages/ar/ar?mind=` + val });
    else if (val == "/pages/Stop/Stop")
      uni.navigateTo({ url: "/pages/stop/stop" });
    else uni.navigateTo({ url: `${val}?str=` + str });
  } else {
    if (item.PageUrl.indexOf("http") != -1)
      uni.navigateTo({
        url: "/pages/webview/webview?url=" + encodeURIComponent(item.PageUrl),
      });
    else {
      const ed = {};
      const jp = item.JumpPara;
      if (jp)
        jp.split("&").forEach((p) => {
          const [k, v] = p.split("=");
          if (k) ed[k] = decodeURIComponent(v || "");
        });
      uni.navigateToMiniProgram({
        appId: item.JumpAppID,
        path: item.PageUrl,
        extraData: ed,
        envVersion: "trial",
      });
    }
  }
}

async function tick() {
  const list = await myRequest({
    url: "/api/Applets/AppletsRecommendTicket",
    method: "POST",
  });
  tickList.value = list.data.Data;
}

async function titleImg() {
  const list = await myRequest({
    url: "/api/Applets/AppletsGetModuleList",
    method: "POST",
  });
  title.value = [];
  classification.value = [];
  list.data.Data.forEach((item) => {
    if (
      item.PageUrl != "/pages/subPack/ballmenber/ballmenber" &&
      item.PageUrl != "/pages/subPack/venue/venue"
    )
      title.value.push(item);
  });
  list.data.Data.forEach((item) => {
    if (
      [
        "/pages/ticket/ticket",
        "/pages/subPack/productList/productList",
        "/pages/subPack/menber/menber",
        "/pages/subPack/rollcenter/rollcenter",
      ].includes(item.PageUrl)
    ) {
      classification.value.push({
        name: item.Title,
        id: item.ID,
        disabled: true,
        PageUrl: item.PageUrl,
      });
    }
  });
}

async function bannar() {
  const list = await myRequest({
    url: "/api/Applets/AppletsGetScenicImg",
    method: "POST",
  });
  banList.value = list.data.Data;
}
</script>

<script>
export default {
  onShareAppMessage() {
    return { title: "小程序", path: "/pages/index/index" };
  },
};
</script>

<style lang="scss" scoped>
.home-content {
  min-height: 100vh;
}

:deep(.u-navbar__content) {
  background-color: transparent !important;
  height: 96rpx !important;
}
:deep(.u-navbar__content__title) {
  font-size: var(--font-size-h2, 30rpx) !important;
  font-weight: 600 !important;
  color: var(--color-text) !important;
}
:deep(.u-navbar__content__left .u-icon) {
  color: var(--color-primary) !important;
}

.hero {
  position: relative;
  width: 100%;
  height: 42vw;
  max-height: 340rpx;
}
.hero__swiper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.hero__slide {
  position: relative;
  width: 100%;
  height: 100%;
}
.hero__image {
  width: 100%;
  height: 100%;
  display: block;
  filter: brightness(1.05) saturate(0.92);
}
.hero__mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 55%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 40%,
    rgba(232, 246, 236, 0.6) 100%
  );
  pointer-events: none;
}
.hero__weather {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  z-index: 4;
  pointer-events: none;
}
.hero__weather-text {
  color: var(--color-bg-card);
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 600;
  line-height: var(--line-height-h2, 40rpx);
  text-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.25);
}

:deep(.hero__swiper .wx-swiper-dot),
:deep(.hero__swiper .uni-swiper-dot) {
  width: 12rpx !important;
  height: 12rpx !important;
  border-radius: 50%;
  margin: 0 6rpx !important;
  border: 1rpx solid var(--color-primary-border-light);
}
:deep(.hero__swiper .wx-swiper-dot-active),
:deep(.hero__swiper .uni-swiper-dot-active) {
  width: 16rpx !important;
  height: 16rpx !important;
  border-color: var(--color-primary);
  background-color: var(--color-primary);
}
.hero__notice {
  width: 80%;
  position: absolute;
  bottom: 32rpx;
  left: 32rpx;
  z-index: 2;
}

.passenger-notice {
  margin: var(--space-6, 48rpx) 32rpx 0;
}
.passenger-notice :deep(.u-notice-bar) {
  background-color: var(--color-bg-card) !important;
  border-radius: var(--radius-card) !important;
  box-shadow: var(--shadow-soft);
  padding: 24rpx 32rpx !important;
}
.passenger-notice :deep(.u-notice-bar__content__text) {
  color: var(--color-text) !important;
  font-size: var(--font-size-caption, 24rpx) !important;
}

.info-card {
  margin: var(--space-6, 48rpx) 32rpx 0;
  padding: 24rpx 32rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}
.row {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  padding: 16rpx 0;
}
.row + .row {
  border-top: 1rpx solid var(--color-border-light);
}
.row__icon {
  flex-shrink: 0;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}
.row__icon--secondary {
  background-color: var(--color-primary-bg-light);
}
.row__content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}
.row .label {
  flex-shrink: 0;
  width: 144rpx;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  font-weight: 400;
  line-height: var(--line-height-caption, 36rpx);
}
.row .value {
  flex: 1;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  font-weight: 600;
  line-height: var(--line-height-body, 40rpx);
  word-break: break-all;
}
.row--clickable:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.block {
  background-color: var(--color-bg);
  padding-bottom: var(--space-6, 48rpx);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  margin: var(--space-6, 48rpx) 32rpx 0;
  padding: 40rpx 24rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  min-height: 128rpx;
}
.item:active {
  transform: scale(0.96);
}
.item:active .icon-bg {
  background-color: var(--color-primary);
}
.item__icon {
  width: 56rpx;
  height: 56rpx;
}
.item__label {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: var(--line-height-caption, 36rpx);
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.icon-bg {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background-color: var(--color-primary-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
}
.seat-banner {
  width: calc(100% - 64rpx);
  margin: var(--space-6, 48rpx) 32rpx 0;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  display: block;
}

.tab-nav {
  margin: var(--space-6, 48rpx) 32rpx 0;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  padding: 24rpx 16rpx 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 32rpx 24rpx 24rpx;
}
.product-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.product-card:active {
  transform: scale(0.97);
  box-shadow: none;
}
.product-card__image {
  width: 100%;
  aspect-ratio: 4/3;
  height: auto;
  display: block;
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}
.product-card__body {
  padding: 24rpx;
}
.product-card__name {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  line-height: var(--line-height-body, 40rpx);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-card__price-row {
  margin-top: 16rpx;
  display: flex;
  align-items: flex-end;
}
.product-card__price-row--inline {
  flex-direction: row;
  align-items: baseline;
  gap: 12rpx;
}
.product-card--coupon {
  padding-bottom: 8rpx;
}
.price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.price__symbol {
  font-size: var(--font-size-caption, 24rpx);
}
.discount {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  text-decoration: line-through;
  opacity: 0.7;
  line-height: var(--line-height-caption, 36rpx);
  margin-left: 10rpx;
}
.disc {
  margin-top: 8rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  display: block;
  line-height: var(--line-height-caption, 36rpx);
}
.product-tag {
  display: inline-block;
  margin-top: 12rpx;
  margin-right: 8rpx;
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-secondary);
  border: 1rpx solid var(--color-secondary);
  padding: 4rpx 12rpx;
  border-radius: var(--radius-sm, 16rpx);
}

.footer-info {
  margin-top: 64rpx;
  padding: 0 32rpx 48rpx;
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.footer-info .bink {
  width: 100%;
  text-align: center;
  font-size: var(--font-size-caption, 24rpx);
  line-height: var(--line-height-caption, 36rpx);
  margin-top: 8rpx;
}

.modal {
  position: relative;
  width: 85vw;
  max-width: 600rpx;
  height: 70vh;
  max-height: 900rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-modal, 0 24rpx 60rpx rgba(0, 0, 0, 0.12));
  overflow: hidden;
  padding: 32rpx 32rpx 0;
  box-sizing: border-box;
}
.modal__scroll {
  width: 100%;
  height: calc(100% - 200rpx);
}
.modal__title {
  font-weight: 600;
  font-size: var(--font-size-h1, 36rpx);
  color: var(--color-text);
  text-align: center;
  margin-bottom: 32rpx;
  line-height: var(--line-height-h1, 44rpx);
}
.modal__footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-card);
  padding: 24rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
  border-radius: 0 0 var(--radius-card) var(--radius-card);
}
.modal__checkbox {
  margin-bottom: 24rpx;
}
.modal__checkbox :deep(.u-checkbox__label-wrap__text) {
  color: var(--color-primary) !important;
  font-size: var(--font-size-body, 28rpx) !important;
}
.modal__action {
  display: flex;
  justify-content: center;
}
.btn {
  width: 100%;
  max-width: 400rpx;
  min-height: 96rpx;
  line-height: 96rpx;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-bg-card);
  background-color: var(--color-disabled);
  border: none;
  border-radius: var(--radius-button);
  opacity: 0.6;
}
.btn::after {
  border: none;
}
.btn.active {
  color: var(--color-bg-card) !important;
  background-color: var(--color-primary) !important;
  opacity: 1;
}
.btn:active:not([disabled]) {
  transform: scale(0.96);
}

.popup-ad {
  position: relative;
  width: 85vw;
  max-width: 650rpx;
}
.popup-ad__image {
  width: 100%;
  display: block;
  border-radius: var(--radius-card);
}
.guan {
  width: 64rpx;
  height: 64rpx;
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
