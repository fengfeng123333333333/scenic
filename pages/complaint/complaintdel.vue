<!--
  投诉/留言提交页 — 填写投诉内容、上传图片并提交
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：chooseAndUploadImage → chooseAndUpload / compressImage → compressImage
              uploadImageToServer → uploadImage / deleteImage → onDeleteImage
              handleCancel → goBack / handleSubmit → onSubmit
-->
<template>
  <view class="complaint-form-page" :style="$themeStyle">
    <!-- 请求 Loading -->
    <RequestLoading v-if="requestLoading" text="提交中..." />

    <!-- 表单 -->
    <view class="complaint-form-page__body">
      <view class="form-card">
        <text class="form-card__title">投诉内容</text>

        <!-- 联系人 -->
        <view class="form-card__item">
          <text class="form-card__label">联系人</text>
          <input
            class="form-card__input"
            type="text"
            placeholder="请输入您的姓名"
            v-model="formData.contactName"
          />
        </view>

        <!-- 联系手机 -->
        <view class="form-card__item">
          <text class="form-card__label">联系手机</text>
          <input
            class="form-card__input"
            type="number"
            placeholder="请输入您的电话"
            v-model="formData.contactPhone"
          />
        </view>

        <!-- 描述 -->
        <view class="form-card__item">
          <text class="form-card__label">描述</text>
          <textarea
            class="form-card__textarea"
            placeholder="请输入投诉描述"
            v-model="formData.description"
          />
        </view>

        <!-- 上传照片 -->
        <view class="form-card__item">
          <text class="form-card__label">上传照片</text>
          <view class="upload-row">
            <!-- 已上传预览 -->
            <view
              class="upload-row__preview"
              v-for="(img, index) in formData.images"
              :key="index"
            >
              <image class="upload-row__img" :src="img.url" mode="aspectFill" />
              <view class="upload-row__delete" @click="onDeleteImage(index)"
                >×</view
              >
            </view>

            <!-- 上传按钮 -->
            <view
              class="upload-row__btn"
              @click="chooseAndUpload"
              v-if="formData.images.length < 3 && !isUploading"
            >
              <text class="upload-row__plus">+</text>
            </view>
          </view>
          <text class="form-card__tip">最多可上传3张图片</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="complaint-form-page__footer">
      <view
        class="complaint-form-page__btn complaint-form-page__btn--cancel"
        @click="goBack"
        >取消</view
      >
      <view
        class="complaint-form-page__btn complaint-form-page__btn--submit"
        :class="{ 'complaint-form-page__btn--disabled': isSubmitting }"
        @click="onSubmit"
      >
        <text>{{ isSubmitting ? "提交中..." : "提交" }}</text>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <u-modal
      :show="showDeleteModal"
      title="提示"
      content="确定要删除这张图片吗？"
      showCancelButton
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import RequestLoading from "@/components/loading/request-loading.vue";
import { useToast } from "@/util/toast.js";

// ==================== Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 常量 ====================
const UPLOAD_URL =
  "https://saasapp.huibaitech.com/api/Applets/UploadTicketFaceImg";

// ==================== 数据 ====================
const formData = reactive({
  contactName: "",
  contactPhone: "",
  description: "",
  images: [],
});
const isUploading = ref(false);
const isSubmitting = ref(false);
const requestLoading = ref(false);
const showDeleteModal = ref(false);
const pendingDeleteIndex = ref(-1);

// ==================== 图片上传 ====================

/** 选择并上传图片 */
function chooseAndUpload() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      compressImage(tempFilePath)
        .then((compressedPath) => {
          uploadImage(compressedPath);
        })
        .catch(() => {
          uploadImage(tempFilePath);
        });
    },
    fail: (err) => {
      console.error("[complaintdel] 选图失败:", err);
    },
  });
}

/** 压缩图片 */
function compressImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: tempFilePath,
      quality: 0.6,
      success: (res) => {
        if (res.tempFilePath) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error("压缩后无有效路径"));
        }
      },
      fail: reject,
    });
  });
}

/** 上传图片到服务器 */
function uploadImage(tempFilePath) {
  isUploading.value = true;

  uni.uploadFile({
    url: UPLOAD_URL,
    filePath: tempFilePath,
    name: "file",
    header: {
      AppID: uni.getAccountInfoSync().miniProgram.appId,
    },
    success: (uploadRes) => {
      try {
        const resData = JSON.parse(uploadRes.data);
        if (resData.Code === 200 && resData.Data?.ImgUrl) {
          formData.images.push({
            id: resData.Data.ImgUrl,
            url: resData.Data.ImgUrl,
          });
          showToast("图片上传成功", "success");
        } else {
          showToast(resData.Msg || "图片上传失败");
        }
      } catch {
        showToast("接口返回格式错误");
      }
    },
    fail: (err) => {
      console.error("[complaintdel] 上传失败:", err);
      showToast("网络错误，上传失败");
    },
    complete: () => {
      isUploading.value = false;
    },
  });
}

// ==================== 图片删除 ====================

function onDeleteImage(index) {
  pendingDeleteIndex.value = index;
  showDeleteModal.value = true;
}

function confirmDelete() {
  if (pendingDeleteIndex.value >= 0) {
    formData.images.splice(pendingDeleteIndex.value, 1);
  }
  pendingDeleteIndex.value = -1;
  showDeleteModal.value = false;
}

// ==================== 导航 ====================

function goBack() {
  uni.navigateBack({ delta: 1 });
}

// ==================== 提交 ====================

async function onSubmit() {
  if (!formData.contactName.trim()) {
    showToast("请输入联系人");
    return;
  }
  if (!formData.contactPhone.trim()) {
    showToast("请输入正确的手机号");
    return;
  }
  if (!formData.description.trim()) {
    showToast("请填写投诉描述");
    return;
  }
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  requestLoading.value = true;

  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/ConfirmAppletsComplaintD",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        companyID: 0,
        scenicID: 0,
        contact: formData.contactName,
        phone: formData.contactPhone,
        complaintContent: formData.description,
        ImgUrlList: formData.images.map((img) => img.url),
      },
    });

    if (res.data?.Code === 200) {
      showToast("提交成功", "success");
      setTimeout(() => {
        uni.$emit("refreshComplaintList");
        uni.navigateBack({ delta: 1 });
      }, 1200);
    } else {
      showToast(res.data?.Msg || "提交失败");
    }
  } catch (err) {
    console.error("[complaintdel] 提交失败:", err);
    showToast("网络错误，提交失败");
  } finally {
    isSubmitting.value = false;
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   投诉提交页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.complaint-form-page__xxx / .form-card__xxx / .upload-row__xxx
   ============================================================ */

.complaint-form-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

// ==================== 表单主体 ====================
.complaint-form-page__body {
  padding: 24rpx 32rpx;
}

// ==================== 表单卡片 ====================
.form-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  padding: 32rpx;
}

.form-card__title {
  display: block;
  font-size: var(--font-size-subtitle, 32rpx);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 32rpx;
}

.form-card__item {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-card__label {
  display: block;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text-secondary);
  margin-bottom: 20rpx;
}

.form-card__input {
  width: 100%;
  height: 80rpx;
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  padding: 0;
}

.form-card__textarea {
  width: 100%;
  height: 200rpx;
  border: 1px solid var(--color-border-light);
  border-radius: 8rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  padding: 20rpx;
  box-sizing: border-box;
  background: var(--color-bg);
}

.form-card__tip {
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-disabled);
}

// ==================== 图片上传区 ====================
.upload-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 10rpx;
}

.upload-row__preview {
  width: 120rpx;
  height: 120rpx;
  position: relative;
  border-radius: 8rpx;
  overflow: hidden;
}

.upload-row__img {
  width: 100%;
  height: 100%;
}

.upload-row__delete {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 32rpx;
  height: 32rpx;
  background-color: var(--color-danger);
  color: var(--color-text-on-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  z-index: 10;
}

.upload-row__btn {
  width: 120rpx;
  height: 120rpx;
  border: 1px dashed var(--color-border-light);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  transition: opacity 160ms ease;

  &:active {
    opacity: 0.6;
  }
}

.upload-row__plus {
  font-size: 48rpx;
  color: var(--color-disabled);
}

// ==================== 底部按钮 ====================
.complaint-form-page__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: var(--color-bg-card);
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.complaint-form-page__btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
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

  &--cancel {
    background-color: var(--color-bg-card);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
  }

  &--submit {
    background: linear-gradient(
      135deg,
      var(--color-primary),
      var(--color-primary-dark)
    );
    color: var(--color-text-on-primary);
  }

  &--disabled {
    opacity: 0.6;
    transform: none;

    &:active {
      transform: none;
    }
  }
}
</style>
