<!--
  选座购票页 — 日期排期 + 场次列表 + 购票入口
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad + fetchSchedules
              changeTab → onTabChange / gouMai → goToSeatWeb
              移除死代码：setimgs / retcolor / onclickimg / ynGallery
-->
<template>
  <view class="seat-schedule-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- 节目信息 -->
      <view class="seat-schedule-page__show-info" v-if="showList.length > 0">
        <view class="seat-schedule-page__show-name">
          <text class="seat-schedule-page__show-title">{{
            showList[0].ShowName
          }}</text>
        </view>
        <view class="seat-schedule-page__show-tags">
          <text class="seat-schedule-page__show-tag"
            >{{ showList[0].TotalMin }}分钟</text
          >
          <text class="seat-schedule-page__show-tag">{{
            showList[0].Type
          }}</text>
        </view>
      </view>

      <!-- 日期选择 -->
      <view class="seat-schedule-page__date-tabs">
        <f-tabs
          v-model="activeTab"
          :tabs="dateTabs"
          :scroll="true"
          lineColor="var(--color-primary)"
          activeColor="var(--color-primary)"
          @change="onTabChange"
        />
      </view>

      <!-- 场次列表 -->
      <view class="seat-schedule-page__list">
        <Kong v-if="pageReady && showList.length === 0" text="暂无排期" />
        <view
          class="seat-schedule-page__item"
          v-for="(item, index) in showList"
          :key="index"
        >
          <view class="seat-schedule-page__time">
            <text class="seat-schedule-page__time-start">{{
              item.ShowTimeBegin
            }}</text>
            <text class="seat-schedule-page__time-end"
              >{{ item.ShowTimeEnd }}散场</text
            >
          </view>
          <view class="seat-schedule-page__venue">
            <text class="seat-schedule-page__venue-name">{{
              item.VenueName
            }}</text>
            <text class="seat-schedule-page__venue-type">{{ item.Type }}</text>
          </view>
          <view class="seat-schedule-page__price">
            <text class="seat-schedule-page__price-value">{{
              item.PriceDescripe
            }}</text>
          </view>
          <view class="seat-schedule-page__action">
            <view class="seat-schedule-page__btn" @click="goToSeatWeb(item)"
              >购票</view
            >
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import store from "@/store/index.js";
import PageLoading from "@/components/loading/page-loading.vue";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  seatWeb: "/pages/seat/seatWeb",
};

// ==================== 数据 ====================
const dateTabs = ref([]);
const showList = ref([]);
const activeTab = ref(0);
const showId = ref("");
const pageReady = ref(false);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  showId.value = option.id;
  fetchScheduleDates(option);
});

// ==================== 数据请求 ====================

async function fetchScheduleDates(option) {
  try {
    const lis = await uni.$myRequest({
      url: "/api/Applets/GetCinemaSchedulingShowdayList",
      data: { ShowId: option.id },
      method: "POST",
    });
    dateTabs.value = (lis.data.Data || []).map((d) => ({
      name: d,
      id: d,
      disabled: true,
    }));

    if (dateTabs.value.length === 0) {
      showList.value = [];
      pageReady.value = true;
      return;
    }

    await fetchScheduleList(dateTabs.value[0].id);
  } finally {
    pageReady.value = true;
  }
}

async function fetchScheduleList(day) {
  const res = await uni.$myRequest({
    url: "/api/Applets/GetCinemaSchedulingList",
    data: { ShowId: showId.value, ShowDay: day },
    method: "POST",
  });
  showList.value = res.data.Data || [];
}

// ==================== 导航辅助 ====================

function goToSeatWeb(item) {
  const openid = uni.getStorageSync("userinfo");
  store.state.pary = {
    appid: uni.getAccountInfoSync().miniProgram.appId,
    openid: openid.openid,
    SchedulingID: item.SchedulingID,
    VenuesID: item.VenueID,
    ShowID: item.ShowID,
    ShowName: showList.value[0]?.ShowName || "",
    time: dateTabs.value[activeTab.value]?.id || "",
    CompanyID: item.CompanyID,
    ScenicID: item.ScenicID,
  };
  uni.navigateTo({ url: PAGE_ROUTES.seatWeb });
}

// ==================== 业务方法 ====================

function onTabChange(index) {
  activeTab.value = index;
  if (dateTabs.value[index]) {
    fetchScheduleList(dateTabs.value[index].id);
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   选座购票页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.seat-schedule-page__xxx
   ============================================================ */

.seat-schedule-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* ====== 节目信息 ====== */
.seat-schedule-page__show-info {
  padding: 28rpx 32rpx;
  text-align: center;
  background-color: var(--color-bg-card);
}

.seat-schedule-page__show-title {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 600;
  color: var(--color-text);
}

.seat-schedule-page__show-tags {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.seat-schedule-page__show-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border: 2rpx solid var(--color-text-secondary);
  border-radius: var(--radius-sm, 16rpx);
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ====== 日期 Tab ====== */
.seat-schedule-page__date-tabs {
  background-color: var(--color-bg-card);
  border-top: 1rpx solid var(--color-border-light);
  border-bottom: 1rpx solid var(--color-border-light);
}

/* ====== 场次列表 ====== */
.seat-schedule-page__list {
  min-height: 60vh;
  background-color: var(--color-bg-card);
}

.seat-schedule-page__item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border-light);
}

.seat-schedule-page__time {
  width: 150rpx;
  text-align: center;
  flex-shrink: 0;
}

.seat-schedule-page__time-start {
  display: block;
  font-size: 44rpx;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.2;
}

.seat-schedule-page__time-end {
  display: block;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  margin-top: 12rpx;
}

.seat-schedule-page__venue {
  flex: 1;
  min-width: 0;
  margin-left: 32rpx;
}

.seat-schedule-page__venue-name {
  display: block;
  font-size: var(--font-size-body, 28rpx);
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.seat-schedule-page__venue-type {
  display: block;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  margin-top: 12rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.seat-schedule-page__price {
  margin-left: 20rpx;
  flex-shrink: 0;
}

.seat-schedule-page__price-value {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-danger);
  font-weight: 500;
}

.seat-schedule-page__action {
  margin-left: 24rpx;
  flex-shrink: 0;
}

.seat-schedule-page__btn {
  border: 1rpx solid var(--color-primary);
  color: var(--color-primary);
  border-radius: var(--radius-sm, 16rpx);
  padding: 12rpx 28rpx;
  font-size: var(--font-size-body, 28rpx);
  text-align: center;
  font-weight: 500;

  &:active {
    background-color: var(--color-primary-bg-light);
    opacity: 0.85;
  }
}
</style>
