<!--
  会员票型列表页 — 按分类展示可购买的会员票型，支持订票须知弹窗
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  布局对齐 ticket-content.vue 标准
  旧函数映射：onLoad → onLoad(option) + fetchPageData()
              changeTab → onTabChange / tickList → fetchTicketList
              tickDetails → goToRecharge / yuding → showNotice
-->
<template>
  <view class="menber-page" :style="$themeStyle">
    <!-- 请求加载遮罩 -->
    <RequestLoading v-if="!pageReady" text="正在加载票型..." />

    <template v-else>
      <!-- Banner 轮播 -->
      <view class="menber-page__banner">
        <swiper
          class="menber-page__swiper"
          circular
          :indicator-dots="banList.length > 1"
          :autoplay="autoplay"
          :interval="interval"
          :duration="duration"
        >
          <swiper-item v-for="(item, index) in banList" :key="index">
            <image
              class="menber-page__banner-img"
              :src="item.ImgUrl"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 分类 Tab + 票型列表 -->
      <view class="menber-page__section">
        <f-tabs
          v-model="activeTab"
          :tabs="tabs"
          field="name"
          :scroll="scroll"
          lineColor="var(--color-primary)"
          activeColor="var(--color-primary)"
          @change="onTabChange"
        />

        <Kong
          v-if="pageReady && tablist.length === 0"
          text="当前暂无可售票项"
        />
        <view
          class="menber-page__ticket-card"
          v-for="(item, index) in tablist"
          :key="index"
          v-else
        >
          <view class="menber-page__ticket-thumb">
            <image :src="item.ImgUrl" mode="aspectFill" />
          </view>
          <view class="menber-page__ticket-body">
            <text class="menber-page__ticket-name">{{ item.TicketName }}</text>

            <view class="menber-page__ticket-row">
              <view class="menber-page__ticket-tags">
                <text
                  class="menber-page__ticket-tag"
                  v-for="(label, li) in item.LabelList"
                  :key="li"
                  >{{ label }}</text
                >
              </view>
              <view class="menber-page__ticket-prices">
                <text class="menber-page__ticket-price">
                  <text class="menber-page__ticket-price-symbol">￥</text>
                  {{ item.SellPrice }}
                </text>
                <text
                  class="menber-page__ticket-original"
                  v-if="item.MarketPrice"
                  >原价￥{{ item.MarketPrice }}</text
                >
              </view>
            </view>

            <view class="menber-page__ticket-actions">
              <view
                class="menber-page__ticket-notice"
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
                class="menber-page__ticket-btn"
                @click="goToRecharge(item.TicketID)"
              >
                立即预定
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 订票须知弹窗 -->
    <u-popup
      :show="showPopup"
      :round="10"
      mode="bottom"
      @close="closePopup"
      closeable
      customStyle="width:100%"
    >
      <view class="menber-page__popup">
        <view class="menber-page__popup-header">
          <text class="menber-page__popup-title">订票须知</text>
          <view class="menber-page__popup-close" @click="closePopup">
            <u-icon
              name="close"
              color="var(--color-text-secondary)"
              size="20"
            />
          </view>
        </view>
        <scroll-view class="menber-page__popup-body" scroll-y>
          <f-parse :content="noticeContent" />
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import store from "@/store/index.js";
import Kong from "@/components/kong/kong.vue";
import RequestLoading from "@/components/loading/request-loading.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  recharge: "/pages/menber/recharge",
};

// ==================== 数据 ====================
const pageTitle = ref("会员票型");
const banList = ref([]);
const tabs = ref([]);
const tablist = ref([]);
const activeTab = ref(0);
const scroll = ref(false);
const memberId = ref("");
const showPopup = ref(false);
const noticeIndex = ref(0);
const noticeContent = ref("");
const pageReady = ref(false);

// 轮播配置
const autoplay = ref(true);
const interval = ref(2000);
const duration = ref(500);

// ==================== Refs ====================
// （当前页无 DOM 引用需求）

// ==================== 生命周期 ====================
onLoad((option) => {
  pageTitle.value = option.str || "会员票型";
  memberId.value = option.menber || "";
  fetchPageData();
});

// ==================== 数据请求 ====================

async function fetchPageData() {
  try {
    // 并行请求：轮播图
    fetchBanner();

    // 获取票型分类
    await fetchTicketTypes();
  } finally {
    pageReady.value = true;
  }
}

async function fetchBanner() {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetScenicImg",
    method: "POST",
  });
  banList.value = res.data.Data || [];
}

/** 获取会员票型分类并加载第一个分类的票型列表 */
async function fetchTicketTypes() {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetMemberTicketType",
    method: "POST",
  });
  const typeList = res.data.Data || [];
  tabs.value = typeList.map((item) => ({
    name: item.Name,
    id: item.ID,
    disabled: true,
  }));

  // 超过 5 个分类切换为滚动模式
  if (tabs.value.length > 5) {
    scroll.value = true;
  }

  // 加载第一个分类的票型
  if (tabs.value.length > 0) {
    await fetchTicketList(tabs.value[0].id);
  }
}

/** 根据分类 ID 获取票型列表 */
async function fetchTicketList(typeId) {
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetTicket",
    method: "POST",
    data: {
      typeID: typeId,
    },
  });
  tablist.value = res.data.Data || [];
}

// ==================== 导航辅助 ====================

/** 跳转到会员充值/下单页 */
function goToRecharge(ticketId) {
  store.state.tickId = ticketId;
  uni.navigateTo({
    url: `${PAGE_ROUTES.recharge}?menber=${memberId.value}`,
  });
}

// ==================== 业务方法 ====================

/** Tab 切换 */
function onTabChange(index) {
  if (tabs.value[index]) {
    fetchTicketList(tabs.value[index].id);
  }
}

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
   会员票型列表页 — 对齐 ticket-content.vue 布局标准
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.menber-page__xxx
   ============================================================ */

.menber-page {
  min-height: 100vh;
  width: 100%;
  background-color: var(--color-bg);
  padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
}

/* ====== Banner 轮播 ====== */
.menber-page__banner {
  width: 100%;
}

.menber-page__swiper {
  height: 420rpx;
}

.menber-page__banner-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* ====== 分类 + 票型区域 ====== */
.menber-page__section {
  padding: 0 32rpx;
}

/* ====== 票型卡片 ====== */
.menber-page__ticket-card {
  display: flex;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-top: 24rpx;
  overflow: hidden;
}

.menber-page__ticket-thumb {
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

.menber-page__ticket-body {
  flex: 1;
  min-width: 0;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.menber-page__ticket-name {
  font-size: var(--font-size-body, 28rpx);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.menber-page__ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 12rpx;
}

.menber-page__ticket-tags {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.menber-page__ticket-tag {
  display: inline-block;
  margin-right: 8rpx;
  margin-bottom: 4rpx;
  font-size: var(--font-size-small, 22rpx);
  color: var(--color-secondary);
  border: 1rpx solid var(--color-secondary);
  padding: 4rpx 12rpx;
  border-radius: var(--radius-sm, 16rpx);
}

.menber-page__ticket-prices {
  flex-shrink: 0;
  text-align: right;
  margin-left: 12rpx;
}

.menber-page__ticket-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-primary);
  display: block;
}

.menber-page__ticket-price-symbol {
  font-size: var(--font-size-caption, 24rpx);
}

.menber-page__ticket-original {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
  text-decoration: line-through;
  display: block;
}

.menber-page__ticket-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.menber-page__ticket-notice {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.menber-page__ticket-btn {
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
.menber-page__popup {
  display: flex;
  flex-direction: column;
  height: 70vh;
  box-sizing: border-box;
}

.menber-page__popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 0;
  flex-shrink: 0;
}

.menber-page__popup-title {
  font-size: var(--font-size-h2, 30rpx);
  font-weight: 600;
  color: var(--color-text);
}

.menber-page__popup-close {
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

.menber-page__popup-body {
  flex: 1;
  padding: 24rpx 32rpx 48rpx;
  overflow: auto;
}
</style>
