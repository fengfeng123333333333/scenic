<!--
  投诉详情/回复页 — 查看投诉内容及景区回复
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：getComplaintDetail → fetchDetail
-->
<template>
  <view class="reply-page" :style="$themeStyle">
    <!-- 请求加载遮罩 -->
    <RequestLoading v-if="requestLoading" text="正在加载..." />

    <template v-else>
      <view class="reply-page__body">
        <view class="detail-card">
          <text class="detail-card__title">投诉内容</text>

          <!-- 联系人 -->
          <view class="detail-card__row">
            <text class="detail-card__label">联系人</text>
            <text class="detail-card__value">{{ detail.contactName }}</text>
          </view>

          <!-- 联系手机 -->
          <view class="detail-card__row">
            <text class="detail-card__label">联系手机</text>
            <text class="detail-card__value">{{ detail.contactPhone }}</text>
          </view>

          <!-- 描述 -->
          <view class="detail-card__block">
            <text class="detail-card__label">描述</text>
            <view class="detail-card__box">
              <text class="detail-card__text">{{ detail.description }}</text>
            </view>
          </view>

          <!-- 上传照片 -->
          <view class="detail-card__block">
            <text class="detail-card__label">上传照片</text>
            <view class="detail-card__images">
              <image
                v-for="(img, index) in detail.images"
                :key="index"
                class="detail-card__img"
                :src="img"
                mode="aspectFill"
              />
              <view
                class="detail-card__img-placeholder"
                v-if="detail.images.length === 0"
              >
                <u-icon name="camera" color="var(--color-disabled)" size="36" />
              </view>
            </view>
          </view>

          <!-- 景区回复 -->
          <view class="detail-card__block">
            <text class="detail-card__label">景区回复</text>
            <view class="detail-card__box detail-card__box--reply">
              <text
                class="detail-card__text"
                :class="{ 'detail-card__text--empty': !detail.reply }"
              >
                {{ detail.reply || "暂无回复" }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </template>

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";

// ==================== Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 数据 ====================
const detail = reactive({
  contactName: "",
  contactPhone: "",
  description: "",
  images: [],
  reply: "",
});
const requestLoading = ref(false);

// ==================== 生命周期 ====================
onLoad((option) => {
  fetchDetail(option.id);
});

// ==================== 数据请求 ====================

/** 获取投诉详情 */
async function fetchDetail(id) {
  if (!id) return;
  requestLoading.value = true;

  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/GetAppletsComplaintDetail",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        appletsComplaintID: id,
        companyID: 0,
        scenicID: 0,
      },
    });

    if (res.data?.Code === 200 && res.data?.Data) {
      const data = res.data.Data;
      detail.contactName = data.Contact || "";
      detail.contactPhone = data.Phone || "";
      detail.description = data.ComplaintContent || "";
      detail.images = data.ImgUrlList || [];
      detail.reply = data.ReplyContent || "";
    } else {
      showToast(res.data?.Msg || "获取详情失败");
    }
  } catch (err) {
    console.error("[reply] 获取详情失败:", err);
    showToast("网络错误，获取失败");
  } finally {
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   投诉详情页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.reply-page__xxx / .detail-card__xxx
   ============================================================ */

.reply-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

// ==================== 内容区域 ====================
.reply-page__body {
  padding: 24rpx 32rpx;
}

// ==================== 详情卡片 ====================
.detail-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: 32rpx;
}

.detail-card__title {
  display: block;
  font-size: var(--font-size-subtitle, 32rpx);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 32rpx;
}

// 单行字段
.detail-card__row {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 10rpx;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 0;
}

.detail-card__label {
  width: 140rpx;
  flex-shrink: 0;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
  line-height: 80rpx;
}

.detail-card__value {
  flex: 1;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  line-height: 80rpx;
  padding-left: 10rpx;
}

// 多行块字段
.detail-card__block {
  margin-top: 30rpx;
}

.detail-card__block .detail-card__label {
  display: block;
  line-height: 1.5;
  height: auto;
  margin-bottom: 20rpx;
}

.detail-card__box {
  width: 100%;
  min-height: 200rpx;
  border: 1px solid var(--color-border-light);
  border-radius: 8rpx;
  padding: 20rpx;
  box-sizing: border-box;
  background: var(--color-bg);

  &--reply {
    background: var(--color-primary-bg-light);
    border-color: var(--color-primary-border-light);
  }
}

.detail-card__text {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  line-height: 1.6;

  &--empty {
    color: var(--color-disabled);
  }
}

// ==================== 图片区 ====================
.detail-card__images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.detail-card__img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  background-color: var(--color-skeleton-base);
}

.detail-card__img-placeholder {
  width: 120rpx;
  height: 120rpx;
  border: 1px dashed var(--color-border-light);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
}
</style>
