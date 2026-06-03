<!--
  选座首页 — 场馆信息 + 节目列表 + 购票入口
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad + bannar → fetchPageData
              xinXi → goToVenueInfo / tiao → goToSeat
-->
<template>
  <view class="seat-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- Banner 轮播 -->
      <view class="seat-page__banner">
        <swiper
          class="seat-page__swiper"
          circular
          :indicator-dots="banList.length > 1"
          :autoplay="autoplay"
          :interval="interval"
          :duration="duration"
        >
          <swiper-item v-for="(item, index) in banList" :key="index">
            <image
              class="seat-page__banner-img"
              :src="item.ImgUrl"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 内容区 -->
      <view class="seat-page__body">
        <!-- 场馆信息卡 -->
        <view class="seat-page__venue-card">
          <view class="seat-page__venue-name">{{ venueInfo.VenuesName }}</view>
          <view class="seat-page__venue-contact">
            <text class="seat-page__venue-phone"
              >电话: {{ venueInfo.Phone }}</text
            >
            <view class="seat-page__venue-link" @click="goToVenueInfo">
              <text>场馆信息</text>
              <u-icon
                name="arrow-right"
                color="var(--color-text-secondary)"
                size="16"
              />
            </view>
          </view>
        </view>

        <!-- 节目列表 -->
        <Kong v-if="pageReady && showList.length === 0" text="暂无节目排期" />
        <view
          class="seat-page__show-item"
          v-for="(item, index) in showList"
          :key="index"
        >
          <view class="seat-page__show-poster">
            <image
              class="seat-page__show-img"
              :src="item.picPathFirst"
              mode="aspectFill"
            />
          </view>
          <view class="seat-page__show-body">
            <text class="seat-page__show-name">{{ item.ShowName }}</text>
            <text class="seat-page__show-type">{{ item.DType }}</text>
            <text class="seat-page__show-date" v-if="item.FirstDay"
              >上映时间 {{ item.FirstDay }}</text
            >
            <view class="seat-page__show-btn" @click="goToSeat(item.ID)">
              购票
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  venueInfo: "/pages/seat/brief",
  seat: "/pages/seat/seatcal",
};

// ==================== 数据 ====================
const pageTitle = ref("选座");
const banList = ref([]);
const venueInfo = ref({});
const showList = ref([]);
const pageReady = ref(false);

// 轮播配置
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  pageTitle.value = option.str || "选座";
  fetchPageData();
});

// ==================== 数据请求 ====================

async function fetchPageData() {
  try {
    const mainRes = await uni.$myRequest({
      url: "/api/Applets/AppletsGetCinemaAppletsMain",
      method: "POST",
    });
    const data = mainRes.data.Data || {};
    banList.value = data.ScenicImgList || [];
    venueInfo.value = data;

    const arrRes = await uni.$myRequest({
      url: "/api/Applets/AppletsGetCinemaShowsMain",
      method: "POST",
    });
    showList.value = arrRes.data.Data || [];
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================

function goToVenueInfo() {
  uni.navigateTo({ url: PAGE_ROUTES.venueInfo });
}

function goToSeat(id) {
  uni.navigateTo({ url: `${PAGE_ROUTES.seat}?id=${id}` });
}

// ==================== 业务方法 ====================
// （当前页无额外交互方法）
</script>

<style lang="scss" scoped>
/* ============================================================
   选座首页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.seat-page__xxx
   ============================================================ */

.seat-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* Banner */
.seat-page__banner {
  width: 100%;
}

.seat-page__swiper {
  height: 400rpx;
}

.seat-page__banner-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* 内容区 */
.seat-page__body {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card, 28rpx) var(--radius-card, 28rpx) 0 0;
  margin-top: -40rpx;
  position: relative;
  z-index: 2;
  min-height: 800rpx;
  padding-bottom: 40rpx;
}

/* 场馆信息卡 */
.seat-page__venue-card {
  padding: 28rpx 32rpx 20rpx;
  border-radius: var(--radius-card, 28rpx) var(--radius-card, 28rpx) 0 0;
  background-color: var(--color-bg-card);
  border-bottom: 1rpx solid var(--color-border-light);
}

.seat-page__venue-name {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12rpx;
}

.seat-page__venue-contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.seat-page__venue-phone {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.seat-page__venue-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);

  &:active {
    opacity: 0.7;
  }
}

/* 节目列表 */
.seat-page__show-item {
  display: flex;
  margin: 20rpx 24rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card, 28rpx);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.seat-page__show-poster {
  width: 240rpx;
  height: 300rpx;
  flex-shrink: 0;
}

.seat-page__show-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left top;
}

.seat-page__show-body {
  flex: 1;
  min-width: 0;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

.seat-page__show-name {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 260rpx;
}

.seat-page__show-type {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-secondary);
  margin-top: 12rpx;
}

.seat-page__show-date {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  margin-top: 20rpx;
}

.seat-page__show-btn {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  padding: 14rpx 40rpx;
  border-radius: 9999rpx;
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;

  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }
}
</style>
