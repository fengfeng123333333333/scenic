<!--
  个人资料编辑页 — 修改头像、昵称、电话
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  UX 交互：骨架屏 → 表单淡入 → 按压反馈 → Toast 提示
  旧函数映射：onChooseavatar → onChooseAvatar / bindblur → onNickBlur
              bindinput → onNickInput / bindblue → onPhoneInput
              onSubmit → onSubmit
-->
<template>
  <view class="profile-page" :style="$themeStyle">
    <!-- ==================== 骨架屏 ==================== -->
    <view v-if="!pageReady" class="profile-page__skeleton">
      <!-- 头像占位 -->
      <view class="sk-avatar">
        <view class="sk-avatar__circle shimmer-bg" />
        <view class="sk-avatar__text shimmer-bg" />
      </view>
      <!-- 字段占位（×2） -->
      <view class="sk-field" v-for="i in 2" :key="i">
        <view class="sk-field__label shimmer-bg" />
        <view class="sk-field__input shimmer-bg" />
      </view>
      <!-- 按钮占位 -->
      <view class="sk-btn shimmer-bg" />
    </view>

    <!-- ==================== 表单内容 ==================== -->
    <view
      v-else
      class="profile-page__body"
      :class="{ 'profile-page__body--visible': pageReady }"
    >
      <!-- 头像 -->
      <view class="profile-page__avatar">
        <button
          class="profile-page__avatar-btn"
          type="balanced"
          open-type="chooseAvatar"
          @chooseavatar="onChooseAvatar"
        >
          <image
            :src="avatarUrl"
            class="profile-page__avatar-img"
            mode="aspectFill"
          />
          <view v-if="avatarUploading" class="profile-page__avatar-mask">
            <u-loading-icon
              mode="circle"
              size="28"
              color="var(--color-text-on-primary)"
            />
          </view>
        </button>
        <text class="profile-page__avatar-tip">点击更换头像</text>
      </view>

      <!-- 昵称 -->
      <view class="profile-page__field">
        <text class="profile-page__field-label">昵称</text>
        <input
          class="profile-page__field-input"
          type="nickname"
          :value="nickName"
          placeholder="请输入昵称"
          @blur="onNickBlur"
          @input="onNickInput"
        />
      </view>

      <!-- 电话 -->
      <view class="profile-page__field">
        <text class="profile-page__field-label">电话</text>
        <input
          class="profile-page__field-input"
          :value="phone"
          placeholder="请输入电话"
          @input="onPhoneInput"
        />
      </view>

      <!-- 保存按钮 -->
      <view class="profile-page__footer">
        <view class="profile-page__btn" @click="onSubmit">
          <text>保存</text>
        </view>
      </view>
    </view>

    <!-- 保存请求 Loading -->
    <RequestLoading v-if="requestLoading" text="保存中..." />

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useToast } from "@/util/toast.js";
import RequestLoading from "@/components/loading/request-loading.vue";

// ==================== Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 常量 ====================
const UPLOAD_URL = "https://saasapp.huibaitech.com/api/Applets/UploadFile";

// ==================== 数据 ====================
const pageReady = ref(false);
const avatarUrl = ref(
  "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
);
const nickName = ref("");
const phone = ref("");
const memberInfo = ref({});
const requestLoading = ref(false);
const avatarUploading = ref(false);

// ==================== 生命周期 ====================
onShow(() => {
  loadMemberInfo();
});

// ==================== 数据请求 ====================

/** 从本地缓存加载会员信息 */
function loadMemberInfo() {
  try {
    const info = uni.getStorageSync("menberInfo");
    if (info) {
      memberInfo.value = info;
      avatarUrl.value = info.FaceImgUrl || avatarUrl.value;
      nickName.value = info.MemberName || "";
      phone.value = info.Phone || "";
    }
  } catch (err) {
    console.error("[headPortrait] 读取会员信息失败:", err);
  } finally {
    pageReady.value = true;
  }
}

// ==================== 输入事件 ====================

function onNickBlur(e) {
  nickName.value = e.detail.value;
}

function onNickInput(e) {
  nickName.value = e.detail.value;
}

function onPhoneInput(e) {
  phone.value = e.detail.value;
}

// ==================== 头像上传 ====================

function onChooseAvatar(e) {
  const tempUrl = e.detail.avatarUrl;
  avatarUrl.value = tempUrl;
  avatarUploading.value = true;

  uni.uploadFile({
    url: UPLOAD_URL,
    filePath: tempUrl,
    name: "file",
    header: {
      AppID: uni.getAccountInfoSync().miniProgram.appId,
    },
    success: (res) => {
      try {
        const obj = JSON.parse(res.data);
        if (obj.Code === 200) {
          avatarUrl.value = obj.Data.ImgUrl;
        } else {
          showToast("图片太大，请重新选择！");
        }
      } catch {
        showToast("上传失败，请重试");
      }
    },
    fail: () => {
      showToast("上传失败，请检查网络");
    },
    complete: () => {
      avatarUploading.value = false;
    },
  });
}

// ==================== 提交保存 ====================

async function onSubmit() {
  if (!nickName.value.trim()) {
    showToast("请输入昵称");
    return;
  }
  if (requestLoading.value) return;
  requestLoading.value = true;

  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsUpdatePersonal",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        memberID: memberInfo.value.MemberID || 0,
        imgUrl: avatarUrl.value,
        name: nickName.value,
        phone: phone.value,
      },
    });

    if (res.data?.Code === 200) {
      // 更新本地缓存中的头像和昵称
      const info = uni.getStorageSync("menberInfo");
      if (info) {
        info.FaceImgUrl = avatarUrl.value;
        info.MemberName = nickName.value;
        info.Phone = phone.value;
        uni.setStorageSync("menberInfo", info);
      }
      // 通知 my-content 刷新数据
      uni.$emit("profileUpdated");
      showToast("保存成功", "success");
      setTimeout(() => {
        uni.navigateBack({ delta: 1 });
      }, 800);
    } else {
      showToast(res.data?.Msg || "保存失败");
    }
  } catch (err) {
    console.error("[headPortrait] 保存失败:", err);
    showToast("保存失败，请重试");
  } finally {
    requestLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   个人资料编辑页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   骨架屏：shimmer-bg 动画 + 布局占位
   BEM 命名：.profile-page__xxx / .sk-xxx
   ============================================================ */

// ==================== 骨架屏 shimmer 动画 ====================
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer-bg {
  background: linear-gradient(
    90deg,
    var(--color-skeleton-base) 25%,
    var(--color-skeleton-highlight) 50%,
    var(--color-skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

// ==================== 页面容器 ====================
.profile-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

// ==================== 骨架屏布局 ====================
.profile-page__skeleton {
  padding-top: 40rpx;
}

.sk-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 0 40rpx;
  background: var(--color-bg-card);
}

.sk-avatar__circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.sk-avatar__text {
  width: 160rpx;
  height: 28rpx;
  border-radius: var(--skeleton-radius);
  margin-top: 24rpx;
}

.sk-field {
  display: flex;
  align-items: center;
  background: var(--color-bg-card);
  padding: 32rpx 30rpx;
  margin-top: 2rpx;
}

.sk-field__label {
  width: 80rpx;
  height: 32rpx;
  border-radius: var(--skeleton-radius);
  flex-shrink: 0;
}

.sk-field__input {
  flex: 1;
  height: 32rpx;
  border-radius: var(--skeleton-radius);
  margin-left: 60rpx;
}

.sk-btn {
  width: 670rpx;
  height: 90rpx;
  border-radius: 45rpx;
  margin: 80rpx auto 0;
}

// ==================== 表单内容 — 淡入动画 ====================
.profile-page__body {
  opacity: 0;
  transform: translateY(12rpx);
  transition:
    opacity 320ms ease-out,
    transform 320ms ease-out;
}

.profile-page__body--visible {
  opacity: 1;
  transform: translateY(0);
}

// ==================== 头像区 ====================
.profile-page__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 0 40rpx;
  background: var(--color-bg-card);
}

.profile-page__avatar-btn {
  position: relative;
  background: var(--color-bg-card);
  line-height: 80rpx;
  height: auto;
  width: auto;
  padding: 20rpx 30rpx;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 去除 button 默认边框 */
  &::after {
    border: none;
  }
}

.profile-page__avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: var(--color-border-light);
}

/* 头像上传中遮罩 */
.profile-page__avatar-mask {
  position: absolute;
  top: 20rpx;
  left: 30rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-page__avatar-tip {
  margin-top: 24rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

// ==================== 表单字段 ====================
.profile-page__field {
  display: flex;
  align-items: center;
  background: var(--color-bg-card);
  padding: 32rpx 30rpx;
  margin-top: 2rpx;
}

.profile-page__field-label {
  flex-shrink: 0;
  width: 100rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
}

.profile-page__field-input {
  flex: 1;
  padding-left: 40rpx;
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
}

// ==================== 底部按钮 ====================
.profile-page__footer {
  width: 100%;
  padding: 80rpx 32rpx;
  box-sizing: border-box;
}

.profile-page__btn {
  width: 100%;
  max-width: 670rpx;
  margin: 0 auto;
  height: 90rpx;
  background: var(--color-primary);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text-on-primary);
  transition:
    opacity 160ms ease,
    transform 160ms ease;

  &:active {
    opacity: 0.85;
    transform: scale(0.97);
  }
}
</style>
