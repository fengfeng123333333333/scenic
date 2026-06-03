<!--
  优惠券中心 — 展示可用优惠券列表
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad + fetchCouponList
              linqu → goToDetail
-->
<template>
  <view class="rollcenter-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <view
        class="rollcenter-page__item"
        v-for="(item, index) in tabList"
        :key="index"
        @click="goToDetail(item)"
      >
        <image
          class="rollcenter-page__item-img"
          :src="item.ImgUrl"
          mode="aspectFill"
        />
        <view class="rollcenter-page__item-body">
          <text class="rollcenter-page__item-name">{{ item.Name }}</text>
          <text class="rollcenter-page__item-deadline">截止日期</text>
          <text class="rollcenter-page__item-date">{{ item.EndTimeDesc }}</text>
        </view>
        <view class="rollcenter-page__item-btn">立即领取</view>
      </view>

      <Kong v-if="pageReady && tabList.length === 0" text="暂无优惠券" />
    </template>

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  detail: "/pages/rollcenter/rolldetails",
};

// ==================== 数据 ====================
const pageTitle = ref("优惠券");
const tabList = ref([]);
const pageReady = ref(false);

// ==================== Refs ====================
const uToastRef = ref(null);

// ==================== 生命周期 ====================
onLoad((option) => {
  pageTitle.value = option.str || "优惠券";
  fetchCouponList();
});

// ==================== 数据请求 ====================

async function fetchCouponList() {
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/AppletsIndoor/CouponCenterList",
      data: {
        openId: openid.openid,
        ChooseCompanyID: 0,
        ChooseScenicID: 0,
      },
      method: "POST",
    });
    tabList.value = res.data.Data || [];
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================

function goToDetail(item) {
  uni.navigateTo({ url: `${PAGE_ROUTES.detail}?id=${item.ID}` });
}

// ==================== 业务方法 ====================
// （当前页无额外交互方法）
</script>

<style lang="scss" scoped>
/* ============================================================
   优惠券中心 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.rollcenter-page__xxx
   ============================================================ */

.rollcenter-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

.rollcenter-page__item {
  display: flex;
  align-items: flex-start;
  margin: 20rpx;
  padding: 20rpx;
  border: 1rpx solid var(--color-border-light);
  border-radius: var(--radius-card, 28rpx);
  background-color: var(--color-bg-card);
  position: relative;

  &:active {
    background-color: var(--color-primary-bg-light);
  }
}

.rollcenter-page__item-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: var(--radius-sm, 16rpx);
  flex-shrink: 0;
}

.rollcenter-page__item-body {
  flex: 1;
  margin-left: 20rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  position: relative;
  min-height: 180rpx;
}

.rollcenter-page__item-name {
  font-weight: 600;
  display: block;
  color: var(--color-text);
}

.rollcenter-page__item-deadline {
  display: block;
  margin-top: 24rpx;
  color: var(--color-text-secondary);
}

.rollcenter-page__item-date {
  display: block;
  margin-top: 8rpx;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption, 24rpx);
}

.rollcenter-page__item-btn {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  padding: 14rpx 36rpx;
  border-radius: 9999rpx;
  font-size: var(--font-size-caption, 24rpx);
  font-weight: 600;

  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }
}
</style>
