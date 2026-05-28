<template>
  <view class="ticket-content" :style="$themeStyle">
    <!-- 请求加载遮罩 -->
    <RequestLoading v-if="requestLoading" text="正在加载票型..." />

    <!-- Banner 轮播 -->
    <view class="ticket-banner">
      <swiper
        class="ticket-banner__swiper"
        circular
        :indicator-dots="indicatorDots"
        :autoplay="autoplay"
        :interval="interval"
        :duration="duration"
      >
        <swiper-item v-for="(item, index) in banList" :key="index">
          <image
            class="ticket-banner__image"
            :src="item.ImgUrl"
            mode="aspectFill"
          />
        </swiper-item>
      </swiper>
    </view>

    <!-- 票型分类 + 列表 -->
    <view class="ticket-section" v-if="isShow">
      <v-tabs
        v-model="activeTab"
        :tabs="tabs"
        field="name"
        @change="changeTab"
        lineColor="var(--color-primary)"
        :scroll="scroll"
      />

      <Kong
        v-if="!requestLoading && tablist.length === 0"
        text="当前暂无可售票项"
      />
      <view
        class="ticket-card"
        v-for="(item, index) in tablist"
        :key="index"
        v-else
      >
        <view class="ticket-card__thumb">
          <image :src="item.ImgUrl" mode="aspectFill" />
        </view>
        <view class="ticket-card__body">
          <text class="ticket-card__name">{{ item.TicketName }}</text>

          <view class="ticket-card__row">
            <view class="ticket-card__tags">
              <text
                class="ticket-card__tag"
                v-for="(label, li) in item.LabelList"
                :key="li"
                >{{ label }}</text
              >
            </view>
            <view class="ticket-card__prices">
              <text class="ticket-card__price">
                <text class="ticket-card__price-symbol">￥</text>
                {{ item.SellPrice }}
              </text>
              <text class="ticket-card__original"
                >原价￥{{ item.MarketPrice }}</text
              >
            </view>
          </view>

          <view class="ticket-card__footer">
            <view class="ticket-card__notice" @click="yuding(index)">
              <text>订票须知</text>
              <u-icon
                name="arrow-right"
                color="var(--color-text-secondary)"
                size="16"
              />
            </view>
            <view class="ticket-card__btn" @click="tickDetails(item)">
              立即预定
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 订票须知弹窗 -->
    <u-popup
      ref="popupRef"
      :show="show"
      :round="10"
      mode="bottom"
      @close="close"
      closeable
    >
      <view class="ticket-popup">
        <view class="ticket-popup__header">
          <text class="ticket-popup__title">订票须知</text>
          <view class="ticket-popup__close" @click="close">
            <u-icon
              name="close"
              color="var(--color-text-secondary)"
              size="20"
            />
          </view>
        </view>
        <scroll-view class="ticket-popup__body" scroll-y>
          <u-parse :content="tablist[inde]?.Tips || ''" />
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
import store from "../../store/index.js";
import Kong from "../../components/kong/kong.vue";
import RequestLoading from "../../components/loading/request-loading.vue";

const props = defineProps({ active: Boolean });

const hasLoaded = ref(false);
const requestLoading = ref(false);

const isShow = ref("");
const indicatorDots = ref(true);
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);
const banList = ref([]);
const activeTab = ref(0);
const tabs = ref([]);
const scroll = ref(false);
const tablist = ref([]);
const show = ref(false);
const inde = ref(0);
const borList = ref({});
const popupRef = ref(null);

const myRequest = (options) => uni.$myRequest(options);

watch(
  () => props.active,
  (val) => {
    if (val && !hasLoaded.value) {
      hasLoaded.value = true;
      initPage();
    }
  },
  { immediate: true },
);

async function initPage() {
  requestLoading.value = true;

  if (store.state.isSow == 1) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }

  const list = await myRequest({
    url: "/api/Applets/AppletsGetScenicImg",
    method: "POST",
  });
  banList.value = list.data.Data;

  const tabList = await myRequest({
    url: "/api/Applets/AppletsGetTicketType",
    method: "POST",
  });
  tabs.value = [];
  tabList.data.Data.map((item) => {
    tabs.value.push({
      name: item.Name,
      id: item.ID,
      disabled: true,
    });
  });
  tickList(tabs.value[0].id);
  if (tabs.value.length > 5) {
    scroll.value = true;
  }
  requestLoading.value = false;
}

function closePopup() {
  popupRef.value?.close();
}

function clome() {
  store.state.tickId = borList.value.TicketID;
  store.state.seltck = {
    DistributorID: 0,
    saleticketID: 0,
  };
  uni.navigateTo({ url: "/pages/reserve/reserve" });
  popupRef.value?.close();
}

function yuding(index) {
  inde.value = index;
  show.value = true;
}

function close() {
  show.value = false;
}

function tickDetails(item) {
  uni.navigateTo({ url: `/pages/details/details?tId=${item.TicketID}` });
}

async function tickList(typeID) {
  requestLoading.value = true;
  const res = await myRequest({
    url: "/api/Applets/AppletsGetTicket",
    method: "POST",
    data: { typeID },
  });
  tablist.value = res.data.Data;
  requestLoading.value = false;
}

function changeTab(index) {
  tickList(tabs.value[index].id);
}
</script>

<style lang="scss" scoped>
.ticket-content {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
}

/* ====== Banner 轮播 ====== */
.ticket-banner {
  width: 100%;
}

.ticket-banner__swiper {
  height: 420rpx;
}

.ticket-banner__image {
  width: 100%;
  height: 100%;
  display: block;
}

/* ====== 票型分类区域 ====== */
.ticket-section {
  padding: 0 32rpx;
}

/* ====== 票型卡片 ====== */
.ticket-card {
  display: flex;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-top: 24rpx;
  overflow: hidden;
}

.ticket-card__thumb {
  flex-shrink: 0;
  width: 240rpx;
  height: 200rpx;
  position: relative;

  image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.ticket-card__body {
  flex: 1;
  min-width: 0;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.ticket-card__name {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ticket-card__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 12rpx;
}

.ticket-card__tags {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ticket-card__tag {
  display: inline-block;
  margin-right: 8rpx;
  margin-bottom: 4rpx;
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-secondary);
  border: 1rpx solid var(--color-secondary);
  padding: 4rpx 12rpx;
  border-radius: var(--radius-sm, 16rpx);
}

.ticket-card__prices {
  flex-shrink: 0;
  text-align: right;
  margin-left: 12rpx;
}

.ticket-card__price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-primary);
  display: block;
}

.ticket-card__price-symbol {
  font-size: var(--font-size-caption, 24rpx);
}

.ticket-card__original {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  text-decoration: line-through;
  display: block;
}

.ticket-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.ticket-card__notice {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.ticket-card__btn {
  background-color: var(--color-primary);
  color: var(--color-bg-card);
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
  padding: 12rpx 40rpx;
  border-radius: 9999rpx;
  transition: transform 120ms ease-in-out;

  &:active {
    transform: scale(0.96);
  }
}

/* ====== 弹窗 ====== */
.ticket-popup {
  display: flex;
  flex-direction: column;
  height: 70vh;
}

.ticket-popup__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 0;
  flex-shrink: 0;
}

.ticket-popup__title {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 600;
  color: var(--color-text);
}

.ticket-popup__close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-bg);

  &:active {
    opacity: 0.7;
  }
}

.ticket-popup__body {
  flex: 1;
  padding: 24rpx 32rpx 48rpx;
  overflow: hidden;
}
</style>
