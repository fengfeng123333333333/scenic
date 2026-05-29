<!--
  添加/编辑常用人员页（addTourist.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换
-->

<template>
  <view class="add-tourist-page" :style="$themeStyle">
    <!-- 表单区 -->
    <view class="add-tourist-form">
      <view class="form-field">
        <text class="form-field__label">姓名</text>
        <input
          class="form-field__input"
          type="text"
          v-model="formData.TouristName"
          placeholder="请输入姓名"
          placeholder-style="color: var(--color-disabled)"
        />
      </view>
      <view class="form-field">
        <text class="form-field__label">身份证</text>
        <input
          class="form-field__input"
          type="text"
          maxlength="18"
          v-model="formData.TouristIDCard"
          placeholder="请输入身份证号码"
          placeholder-style="color: var(--color-disabled)"
        />
      </view>
      <view class="form-field">
        <text class="form-field__label">手机号</text>
        <input
          class="form-field__input"
          type="number"
          maxlength="11"
          v-model="formData.TouristPhone"
          placeholder="请输入手机号"
          placeholder-style="color: var(--color-disabled)"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="add-tourist-submit">
      <button
        class="submit-btn"
        :class="{ 'submit-btn--loading': submitting }"
        :disabled="submitting"
        @click="handleSubmit"
      >
        <text v-if="!submitting">确认</text>
        <text v-else>提交中…</text>
      </button>
    </view>

    <!-- Toast -->
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useToast } from "@/util/toast.js";

// ==================== 表单数据 ====================
const formData = reactive({
  ID: "",
  TouristName: "",
  TouristPhone: "",
  TouristIDCard: "",
  IdType: 0,
});

// ==================== 页面级 Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 页面状态 ====================
const submitting = ref(false);

// ==================== 生命周期 ====================
onLoad((options) => {
  formData.ID = options?.ID || 0;
  if (formData.ID > 0) {
    fetchDetail();
  }
});

// ==================== 数据请求 ====================
async function fetchDetail() {
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetTouristsById",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        TouristsID: formData.ID,
      },
    });
    const info = res?.data?.Data || {};
    Object.keys(formData).forEach((key) => {
      if (info[key] !== undefined) {
        formData[key] = info[key];
      }
    });
    formData.IdType = 0;
  } catch (err) {
    console.error("[addTourist] 获取详情失败:", err);
  }
}

// ==================== 表单校验 ====================
function validate() {
  if (!formData.TouristName || !formData.TouristName.trim()) {
    showToast("姓名不能为空");
    return false;
  }
  if (!formData.TouristIDCard || !formData.TouristIDCard.trim()) {
    showToast("身份证不能为空");
    return false;
  }
  if (!formData.TouristPhone || !formData.TouristPhone.trim()) {
    showToast("手机号不能为空");
    return false;
  }
  return true;
}

// ==================== 业务方法 ====================
async function handleSubmit() {
  if (submitting.value) return;
  if (!validate()) return;

  submitting.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsAddTourists",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        tourists: {
          id: formData.ID || 0,
          touristName: formData.TouristName,
          touristPhone: formData.TouristPhone,
          touristIDCard: formData.TouristIDCard,
          idType: formData.IdType || 0,
        },
      },
    });
    showToast(res?.data?.Message || "保存成功", "success");
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (err) {
    console.error("[addTourist] 提交失败:", err);
    showToast("提交失败，请重试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   添加/编辑常用人员页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.add-tourist-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 24rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

// ==================== 表单 ====================
.add-tourist-form {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 16rpx 24rpx;
  box-shadow: var(--shadow-soft);
}

.form-field {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--color-border-light);
}

.form-field:last-child {
  border-bottom: none;
}

.form-field__label {
  width: 120rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  flex-shrink: 0;
}

.form-field__input {
  flex: 1;
  height: 64rpx;
  font-size: 28rpx;
  color: var(--color-text);
}

// ==================== 提交按钮 ====================
.add-tourist-submit {
  margin-top: 48rpx;
  padding: 0 24rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text-on-primary);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-soft);
  transition: all 0.12s ease;
}

.submit-btn:active {
  opacity: 0.88;
  transform: scale(0.96);
  box-shadow: none;
}

.submit-btn--loading,
.submit-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}
</style>
