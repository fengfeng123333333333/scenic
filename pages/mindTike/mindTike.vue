<!--
  分销推荐票型页 — 扫码进入展示推荐人专属票型列表，支持订票须知弹窗
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(option) + parseSceneQuery() + fetchTicketList()
              onShow → fetchBanner()（每次显示时刷新轮播图）
              tickList → fetchTicketList / tickDetails → goToDetails
              yuding → showNotice / close → closePopup
  移除死代码：clome / closePopup / changeTab（原代码中无对应 ref 或为空实现）
-->
<template>
  <view class="mindtike-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- Banner 轮播 -->
      <view class="mindtike-page__banner">
        <swiper
          class="mindtike-page__swiper"
          circular
          :indicator-dots="banList.length > 1"
          :autoplay="autoplay"
          :interval="interval"
          :duration="duration"
        >
          <swiper-item v-for="(item, index) in banList" :key="index">
            <image
              class="mindtike-page__banner-img"
              :src="item.ImgUrl"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 票型列表 -->
      <view class="mindtike-page__list">
        <view
          class="mindtike-page__ticket-card"
          v-for="(item, index) in tablist"
          :key="index"
        >
          <view class="mindtike-page__ticket-thumb">
            <image
              class="mindtike-page__ticket-img"
              :src="item.ImgUrl"
              mode="aspectFill"
            />
          </view>
          <view class="mindtike-page__ticket-body">
            <text class="mindtike-page__ticket-name">
              {{ item.TicketName }}
            </text>
            <view class="mindtike-page__ticket-row">
              <view class="mindtike-page__ticket-labels">
                <text
                  class="mindtike-page__ticket-label"
                  v-for="(label, li) in item.LabelList"
                  :key="li"
                  >{{ label }}</text
                >
              </view>
              <view class="mindtike-page__ticket-prices">
                <text class="mindtike-page__ticket-symbol">￥</text>
                <text class="mindtike-page__ticket-price">
                  {{ item.SellPrice }}
                </text>
                <text
                  class="mindtike-page__ticket-original"
                  v-if="item.MarketPrice"
                  >原价￥{{ item.MarketPrice }}</text
                >
              </view>
            </view>
            <view class="mindtike-page__ticket-actions">
              <view
                class="mindtike-page__ticket-notice"
                @click="showNotice(index)"
              >
                <text>订票须知</text>
                <u-icon
                  name="arrow-right"
                  color="var(--color-text-secondary)"
                  size="16"
                />
              </view>
              <view
                class="mindtike-page__ticket-btn"
                @click="goToDetails(item)"
              >
                立即预定
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区占位 -->
      <view class="mindtike-page__spacer" />
    </template>

    <!-- 订票须知弹窗 -->
    <u-popup
      :show="showPopup"
      :round="10"
      mode="bottom"
      @close="closePopup"
      closeable
    >
      <view class="mindtike-page__popup-content">
        <f-parse :content="noticeContent" />
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  details: "/pages/details/details",
};

// ==================== 数据 ====================
const banList = ref([]);
const tablist = ref([]);
const showPopup = ref(false);
const noticeIndex = ref(0);
const noticeContent = ref("");
const mindId = ref(1);
const pageReady = ref(false);

// 轮播配置
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================

/** 每次页面显示时刷新轮播图 */
onShow(async () => {
  fetchBanner();
});

onLoad((query) => {
  parseSceneQuery(query);
  fetchTicketList();
});

// ==================== 数据请求 ====================

/** 获取景区轮播图 */
async function fetchBanner() {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetScenicImg",
    method: "POST",
  });
  banList.value = res.data.Data || [];
}

/** 获取分销推荐票型列表 */
async function fetchTicketList() {
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetPersonDistributorTicket",
      method: "POST",
      data: {
        OpenId: openid.openid,
        PersonDistributionUserID: mindId.value,
      },
    });
    tablist.value = res.data.Data || [];
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================

/** 解析扫码进入的 scene 参数获取分销人 ID */
function parseSceneQuery(query) {
  if (!query || JSON.stringify(query) === "{}") return;

  // scene 参数为 URL 编码的查询字符串
  const scene = decodeURIComponent(query.scene || "");
  if (!scene) return;

  const parts = scene.split("=");
  if (parts.length === 2) {
    const tids = parts[1];
    mindId.value = Number(tids.split("&")[0]) || 1;
  }
}

/** 跳转到票型详情页 */
function goToDetails(item) {
  uni.navigateTo({
    url: `${PAGE_ROUTES.details}?tId=${item.TicketID}&mindt=${mindId.value}`,
  });
}

// ==================== 业务方法 ====================

/** 显示订票须知弹窗 */
function showNotice(index) {
  noticeIndex.value = index;
  noticeContent.value = tablist.value[index]?.Tips || "";
  showPopup.value = true;
}

/** 关闭弹窗 */
function closePopup() {
  showPopup.value = false;
}
</script>

<style lang="scss" scoped>
/* ============================================================
   分销推荐票型页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.mindtike-page__xxx
   ============================================================ */

.mindtike-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: 170rpx;
}

/* Banner */
.mindtike-page__banner {
  width: 100%;
}
.mindtike-page__swiper {
  height: 400rpx;
}
.mindtike-page__banner-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* 票型列表 */
.mindtike-page__list {
  margin-top: 20rpx;
  padding: 0 10rpx;
}

/* 票型卡片 */
.mindtike-page__ticket-card {
  display: flex;
  background-color: var(--color-bg-card);
  margin: 10rpx;
  border-radius: var(--radius-card, 28rpx);
  box-shadow: var(--shadow-soft);
  min-height: 200rpx;
  overflow: hidden;
}

.mindtike-page__ticket-card:first-child {
  border-top: 1px solid var(--color-border-light);
}

.mindtike-page__ticket-thumb {
  width: 300rpx;
  height: 180rpx;
  flex-shrink: 0;
  position: relative;
  margin: 10rpx;
}

.mindtike-page__ticket-img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-card, 28rpx);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  object-fit: cover;
}

.mindtike-page__ticket-body {
  flex: 1;
  padding: 16rpx 16rpx 16rpx 20rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mindtike-page__ticket-name {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 300rpx;
}

.mindtike-page__ticket-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.mindtike-page__ticket-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  overflow: hidden;
}

.mindtike-page__ticket-label {
  font-size: var(--font-size-xs, 20rpx);
  color: var(--color-primary);
  border: 1rpx solid var(--color-primary-border-light);
  padding: 4rpx 12rpx;
  border-radius: var(--radius-sm, 16rpx);
  line-height: 1.4;
  white-space: nowrap;
}

.mindtike-page__ticket-prices {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8rpx;
}

.mindtike-page__ticket-symbol {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-secondary);
}

.mindtike-page__ticket-price {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-secondary);
}

.mindtike-page__ticket-original {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

.mindtike-page__ticket-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4rpx;
}

.mindtike-page__ticket-notice {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.mindtike-page__ticket-btn {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  padding: 12rpx 36rpx;
  border-radius: 40rpx;
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;
}

.mindtike-page__ticket-btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}

/* 底部安全区占位 */
.mindtike-page__spacer {
  height: calc(20rpx + env(safe-area-inset-bottom));
}

/* 弹窗 */
.mindtike-page__popup-content {
  padding: 32rpx;
  height: 500rpx;
  overflow-y: auto;
}
</style>
