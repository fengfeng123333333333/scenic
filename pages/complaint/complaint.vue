<!--
  投诉列表页 — 展示用户投诉/留言记录，支持查看回复和新增留言
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：getComplaintList → fetchComplaintList
              huifu → goReply / bund → goAdd
-->
<template>
  <view class="complaint-page" :style="$themeStyle">
    <!-- 请求加载遮罩 -->
    <RequestLoading v-if="requestLoading" text="正在加载..." />

    <!-- 投诉列表 -->
    <scroll-view
      class="complaint-page__list"
      scroll-y
      v-if="complaintList.length > 0"
    >
      <view
        v-for="(item, index) in complaintList"
        :key="index"
        class="complaint-card"
        @click="goReply(item)"
      >
        <view class="complaint-card__row">
          <text class="complaint-card__label">联系手机</text>
          <text class="complaint-card__value">{{ item.Phone }}</text>
        </view>
        <view class="complaint-card__row">
          <text class="complaint-card__label">投诉时间</text>
          <text class="complaint-card__value">{{ item.CreateOn }}</text>
        </view>
        <view class="complaint-card__row">
          <text class="complaint-card__label">回复状态</text>
          <text class="complaint-card__status">{{ item.StatusDesc }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <Kong v-else-if="!requestLoading" text="暂无留言记录" />

    <!-- 底部按钮 -->
    <view class="complaint-page__footer">
      <view class="complaint-page__btn" @click="goAdd">有问题请留言</view>
    </view>

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import Kong from "@/components/kong/kong.vue";
import { useToast } from "@/util/toast.js";

// ==================== Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  reply: "/pages/complaint/reply",
  add: "/pages/complaint/complaintdel",
};

// ==================== 数据 ====================
const complaintList = ref([]);
const requestLoading = ref(false);

// ==================== 生命周期 ====================
onLoad(() => {
  fetchComplaintList();
  uni.$on("refreshComplaintList", fetchComplaintList);
});

onBeforeUnmount(() => {
  uni.$off("refreshComplaintList", fetchComplaintList);
});

// ==================== 数据请求 ====================

/** 获取投诉列表 */
async function fetchComplaintList() {
  requestLoading.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/GetAppletsComplaint",
      method: "POST",
      data: {
        openId: openid?.openid || "",
      },
    });
    complaintList.value = res.data?.Data || [];
  } catch (err) {
    console.error("[complaint] 获取投诉列表失败:", err);
  } finally {
    requestLoading.value = false;
  }
}

// ==================== 导航辅助 ====================

/** 查看回复详情 */
function goReply(item) {
  uni.navigateTo({
    url: `${PAGE_ROUTES.reply}?id=${item.ID}`,
  });
}

/** 新增留言 */
function goAdd() {
  uni.navigateTo({
    url: PAGE_ROUTES.add,
  });
}
</script>

<style lang="scss" scoped>
/* ============================================================
   投诉列表页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.complaint-page__xxx / .complaint-card__xxx
   ============================================================ */

.complaint-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

// ==================== 列表 ====================
.complaint-page__list {
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

// ==================== 卡片 ====================
.complaint-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: 28rpx 30rpx;
  margin-bottom: 20rpx;
  transition: transform 160ms ease-in-out;

  &:active {
    transform: scale(0.98);
  }
}

.complaint-card__row {
  display: flex;
  margin-bottom: 16rpx;
  font-size: var(--font-size-body, 28rpx);
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
}

.complaint-card__label {
  color: var(--color-text-secondary);
  width: 140rpx;
  flex-shrink: 0;
}

.complaint-card__value {
  color: var(--color-text);
  flex: 1;
}

.complaint-card__status {
  color: var(--color-disabled);
  flex: 1;
}

// ==================== 底部按钮 ====================
.complaint-page__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: var(--color-bg-card);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.complaint-page__btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  color: var(--color-text-on-primary);
  font-size: var(--font-size-subtitle, 32rpx);
  font-weight: 600;
  text-align: center;
  transition:
    opacity 160ms ease,
    transform 160ms ease;

  &:active {
    opacity: 0.85;
    transform: scale(0.97);
  }
}
</style>
