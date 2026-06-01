<!--
  语音导览列表页（voice.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad(option)    → onLoad((option) => { parseRouteParams + fetchGuideList })
    guide(id)         → goToGuide(id)
    onPageScroll(e)   → 已移除（未使用的调试代码）
-->

<template>
  <view class="voice-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="voice-page__skeleton">
      <view class="skeleton-card" v-for="i in 4" :key="i">
        <view class="skeleton-line skeleton-line--img" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- <u-navbar :title="pageTitle" :placeholder="true" :autoBack="true" /> -->

      <!-- 空态 -->
      <Kong v-if="guideList.length === 0" text="暂无语音导览" />

      <!-- 导览列表 -->
      <view class="voice-page__grid" v-else>
        <view
          class="guide-card"
          v-for="item in guideList"
          :key="item.VoiceGuideID"
          @click="goToGuide(item.VoiceGuideID)"
        >
          <image
            class="guide-card__cover"
            :src="item.DefaultsImgUrl"
            mode="aspectFill"
          />
          <view class="guide-card__info">
            <text class="guide-card__name">{{ item.ScenicName }}</text>
            <!-- <image
              class="guide-card__icon"
              src="../../static/horn.png"
              mode="aspectFit"
            /> -->
            <u-icon name="volume" color="white" size="18"></u-icon>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  guide: "/pages/voice/guide",
};

// ==================== 数据 ====================
const guideList = ref([]);
const pageTitle = ref("");
const pageReady = ref(false);

// ==================== 生命周期 ====================
onLoad((option) => {
  pageTitle.value = option?.str || "语音导览";
  fetchGuideList();
});

// ==================== 数据请求 ====================
async function fetchGuideList() {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/GetVoiceGuideList",
      method: "POST",
    });
    guideList.value = res?.data?.Data || [];
  } catch (err) {
    console.error("[voice] 获取导览列表失败:", err);
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================
function goToGuide(id) {
  uni.navigateTo({ url: `${PAGE_ROUTES.guide}?id=${id}` });
}
</script>

<style lang="scss" scoped>
/* ============================================================
   语音导览列表页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.voice-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}

// ==================== 骨架屏 ====================
.voice-page__skeleton {
  padding: 24rpx 32rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.skeleton-card {
  width: calc(50% - 10rpx);
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.skeleton-line--img {
  width: 100%;
  height: 220rpx;
  background: var(--color-skeleton-base);
}

.skeleton-line--text {
  height: 28rpx;
  margin: 20rpx 24rpx 24rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  width: 60%;
}

// ==================== 导览网格 ====================
.voice-page__grid {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx 32rpx;
  gap: 20rpx;
}

// ==================== 导览卡片 ====================
.guide-card {
  width: calc(50% - 10rpx);
  border-radius: var(--radius-card);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-soft);
}

.guide-card:active {
  transform: scale(0.97);
  box-shadow: none;
}

.guide-card__cover {
  width: 100%;
  height: 270rpx;
  display: block;
}

.guide-card__info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 20rpx;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  border-radius: 0 0 var(--radius-card) var(--radius-card);
}

.guide-card__name {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.guide-card__icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
  margin-left: 12rpx;
}
</style>
