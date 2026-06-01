<!--
  语音导览详情页（guide.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad(option)    → onLoad((option) => { parseRouteParams + fetchGuideDetail })
    onUnload()        → onBeforeUnmount(() => { stopAudio() })
    onPageScroll(e)   → 已移除（未使用的调试代码）
-->

<template>
  <view class="guide-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="guide-page__skeleton">
      <view class="skeleton-banner" />
      <view class="skeleton-line skeleton-line--title" />
      <view class="skeleton-line skeleton-line--text" />
      <view class="skeleton-line skeleton-line--text" />
      <view class="skeleton-line skeleton-line--text skeleton-line--short" />
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 图片轮播（MediaType == 0） -->
      <view v-if="guide.MediaType == 0">
        <swiper
          class="guide-page__swiper"
          circular
          :indicator-dots="true"
          :autoplay="true"
          :interval="2000"
          :duration="500"
        >
          <swiper-item
            v-for="(item, index) in guide.AllImgUrlList"
            :key="index"
          >
            <image
              class="guide-page__swiper-img"
              :src="item"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>

        <!-- 音频播放器 -->
        <luch-audio
          :src="audioSrc"
          :name="audioName"
          :poster="audioPoster"
          :author="audioAuthor"
          :play.sync="audioPlay"
        />
      </view>

      <!-- 视频播放（MediaType == 1） -->
      <view v-if="guide.MediaType == 1">
        <video
          class="guide-page__video"
          :src="guide.VideoFileUrl"
          autoplay
          controls
          :poster="guide.DefaultsImgUrl"
        />
      </view>

      <!-- 文本介绍 -->
      <view class="guide-page__body">
        <f-parse :content="guide.Intro || ''" />
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  voiceList: "/pages/voice/voice",
};

// ==================== 数据 ====================
const guide = ref({});
const audioPoster = ref("");
const audioName = ref("");
const audioAuthor = ref("");
const audioSrc = ref("");
const audioPlay = ref(true);
const pageReady = ref(false);

// ==================== 生命周期 ====================
onLoad((option) => {
  const params = parseRouteParams(option);
  fetchGuideDetail(params.id);
});

onBeforeUnmount(() => {
  audioPlay.value = false;
});

// ==================== 路由参数解析 ====================
function parseRouteParams(option) {
  // 正常 query 参数
  if (option?.id) return { id: option.id };

  // 扫码进入（scene 参数解码）
  if (option?.scene) {
    const decoded = decodeURIComponent(option.scene);
    const parts = decoded.split("=");
    if (parts.length === 2) {
      return { id: parts[1] };
    }
  }

  return { id: "" };
}

// ==================== 数据请求 ====================
async function fetchGuideDetail(id) {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/GetVoiceGuideDetail",
      method: "POST",
      data: { voiceGuideID: id },
    });
    const data = res?.data?.Data || {};
    guide.value = data;

    audioPoster.value = data.DefaultsImgUrl || "";
    audioName.value = data.ScenicName || "";
    audioAuthor.value = "请点击播放语音讲解";
    audioSrc.value = data.VoiceFileUrl || "";
  } catch (err) {
    console.error("[guide] 获取导览详情失败:", err);
  } finally {
    pageReady.value = true;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   语音导览详情页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.guide-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}

// ==================== 骨架屏 ====================
.guide-page__skeleton {
  padding: 0 32rpx;
}

.skeleton-banner {
  width: 100%;
  height: 400rpx;
  background: var(--color-skeleton-base);
  border-radius: 0;
}

.skeleton-line {
  height: 28rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-top: 24rpx;
}

.skeleton-line--title {
  width: 55%;
  height: 36rpx;
  margin-top: 32rpx;
}

.skeleton-line--text {
  width: 100%;
}

.skeleton-line--short {
  width: 40%;
}

// ==================== 轮播 ====================
.guide-page__swiper {
  height: 400rpx;
  overflow: hidden;
}

.guide-page__swiper-img {
  width: 100%;
  height: 100%;
  display: block;
}

// ==================== 视频 ====================
.guide-page__video {
  width: 100%;
}

// ==================== 文本内容 ====================
.guide-page__body {
  padding: 32rpx;
}
</style>
