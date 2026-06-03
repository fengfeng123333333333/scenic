<!--
  优惠券中心页 — 展示用户优惠券列表，支持状态筛选和券码查看
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad + fetchCouponList
              actiTick → onTabChange / close → closePopup / liji → openCode
-->
<template>
  <view class="coin-page" :style="$themeStyle">
    <!-- 请求加载遮罩 -->
    <RequestLoading v-if="requestLoading" text="正在加载优惠券..." />

    <!-- 状态筛选 Tab -->
    <f-tabs
      v-model="activeTab"
      :tabs="statusTabs"
      field="name"
      @change="onTabChange"
      lineColor="var(--color-primary)"
      :scroll="false"
    />

    <!-- 优惠券列表 -->
    <scroll-view class="coin-page__list" scroll-y v-if="list.length > 0">
      <template v-for="(item, index) in list" :key="index">
        <coupon
          v-if="item.IsUse == activeTab"
          @liji="openCode"
          :active="activeTab"
          :item="item"
          theme="var(--color-primary)"
        />
      </template>
    </scroll-view>

    <!-- 空状态 -->
    <Kong v-else-if="!requestLoading" text="暂无优惠券" />

    <!-- 券码弹窗 -->
    <u-popup
      :show="showCode"
      mode="center"
      round="20"
      closeable
      @close="closePopup"
    >
      <view class="popup-code">
        <text class="popup-code__title">优惠券码</text>
        <image
          v-if="currentCoupon.SysCouponCodeUrl"
          class="popup-code__img"
          :src="currentCoupon.SysCouponCodeUrl"
          mode="aspectFit"
        />
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import coupon from "@/components/coolc-coupon/coolc-coupon";
import RequestLoading from "@/components/loading/request-loading.vue";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
// （当前页无跳转需求，预留扩展）

// ==================== 数据 ====================
const list = ref([]);
const activeTab = ref(0);
const requestLoading = ref(false);
const showCode = ref(false);
const currentCoupon = ref({});

const statusTabs = [{ name: "待使用" }, { name: "已使用" }, { name: "已过期" }];

// ==================== 生命周期 ====================
onLoad(() => {
  fetchCouponList();
});

// ==================== 数据请求 ====================

/** 获取优惠券列表 */
async function fetchCouponList() {
  requestLoading.value = true;
  try {
    const member = uni.getStorageSync("menberInfo");
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/AppletsIndoor/GetCouponInfo",
      method: "POST",
      data: {
        memberID: member?.MemberID || 0,
        openId: openid?.openid || "",
      },
    });
    list.value = res.data?.Data?.AppletsCouponList || [];
  } catch (err) {
    console.error("[coinDiscon] 获取优惠券失败:", err);
  } finally {
    requestLoading.value = false;
  }
}

// ==================== 业务方法 ====================

/** Tab 切换 */
function onTabChange(index) {
  activeTab.value = index;
}

/** 打开券码弹窗 */
function openCode(item) {
  currentCoupon.value = item;
  showCode.value = true;
}

/** 关闭券码弹窗 */
function closePopup() {
  showCode.value = false;
}
</script>

<style lang="scss" scoped>
/* ============================================================
   优惠券中心页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.coin-page__xxx / .coupon-card__xxx
   ============================================================ */

.coin-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

// ==================== 优惠券列表 ====================
.coin-page__list {
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

// ==================== 券码弹窗 ====================
.popup-code {
  text-align: center;
  padding: 40rpx 48rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
}

.popup-code__title {
  display: block;
  font-size: var(--font-size-subtitle, 32rpx);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 24rpx;
}

.popup-code__img {
  width: 400rpx;
  height: 400rpx;
}
</style>
