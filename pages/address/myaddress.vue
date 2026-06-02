<!--
  地址编辑页（myaddress.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad(options)      → onLoad((option) => { initPage(option) })
    _initData()          → loadAddressDetail()
    openPicker()         → openRegionPicker()
    choseValue(res)      → handleRegionSelect(res)
    handleSubmit()       → submitForm()
-->

<template>
  <view class="address-edit-page" :style="$themeStyle">
    <view v-if="!pageReady" class="address-edit-page__skeleton">
      <view class="skeleton-card" v-for="i in 4" :key="i">
        <view class="skeleton-line skeleton-line--label" />
        <view class="skeleton-line skeleton-line--input" />
      </view>
    </view>

    <template v-else>
      <view class="address-edit-page__form">
        <view class="form-item">
          <text class="form-item__label">收货人</text>
          <view class="form-item__content">
            <input
              class="form-item__input"
              type="text"
              v-model="form.Consignee"
              placeholder="姓名"
            />
          </view>
        </view>
        <view class="form-item">
          <text class="form-item__label">手机号</text>
          <view class="form-item__content">
            <input
              class="form-item__input"
              maxlength="18"
              v-model="form.Phone"
              placeholder="手机号"
            />
          </view>
        </view>
        <view class="form-item form-item--clickable" @click="openRegionPicker">
          <text class="form-item__label">所在地区</text>
          <view class="form-item__content">
            <text
              class="form-item__value"
              :class="{ 'form-item__value--placeholder': !form.Area }"
              >{{ form.Area || "请选择所在地区" }}</text
            >
          </view>
        </view>
        <view class="form-item">
          <text class="form-item__label">详细地址</text>
          <view class="form-item__content">
            <input
              class="form-item__input"
              type="text"
              v-model="form.Address"
              placeholder="详细地址"
            />
          </view>
        </view>
        <view class="form-item form-item--switch">
          <text class="form-item__label">设为默认地址</text>
          <view class="form-item__content"
            ><u-switch v-model="form.Status" :activeColor="switchActiveColor"
          /></view>
        </view>
      </view>
      <view class="address-edit-page__footer">
        <view class="submit-btn" @click="submitForm">
          <text v-if="!submitting">确认</text>
          <u-loading-icon v-else mode="circle" size="18" color="#fff" />
        </view>
      </view>
    </template>
    <LotusAddress
      ref="addressPickerRef"
      v-on:choseVal="handleRegionSelect"
      :lotusAddressData="addressPickerData"
    />
    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";
import { useToast } from "@/util/toast.js";
import LotusAddress from "@/components/lotusAddress/lotusAddress.vue";

const { state: store } = useStore();
const { uToastRef, showToast } = useToast();

const pageReady = ref(false);
const submitting = ref(false);
const addressID = ref(0);
const addressPickerRef = ref(null);
const form = reactive({
  Consignee: "",
  Phone: "",
  Area: "",
  Address: "",
  Status: false,
});
const addressPickerData = reactive({
  visible: false,
  provinceName: "广东省",
  cityName: "深圳市",
  townName: "龙华区",
});

const switchActiveColor = computed(
  () => store.themeVars?.["--color-primary"] ?? "",
);

onLoad((option) => {
  addressID.value = Number(option?.ID) || 0;
  if (addressID.value > 0) {
    loadAddressDetail();
  } else {
    pageReady.value = true;
  }
});

async function loadAddressDetail() {
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetAddressById",
      method: "POST",
      data: { openId: openid?.openid || "", addressID: addressID.value },
    });
    const info = res?.data?.Data || {};
    form.Consignee = info.Consignee || "";
    form.Phone = info.Phone || "";
    form.Area = info.Area || "";
    form.Address = info.Address || "";
    form.Status = info.Status == 1;
  } catch (err) {
    console.error("[myaddress] 加载失败:", err);
  } finally {
    pageReady.value = true;
  }
}

function openRegionPicker() {
  addressPickerData.visible = true;
}

function handleRegionSelect(res) {
  addressPickerData.visible = false;
  if (res.isChose) {
    addressPickerData.provinceName = res.province;
    addressPickerData.cityName = res.city;
    addressPickerData.townName = res.town;
    form.Area = res.province + " " + res.city + " " + res.town;
  }
}

async function submitForm() {
  if (!form.Consignee.trim()) {
    showToast("姓名不能为空", "error");
    return;
  }
  if (!form.Phone.trim()) {
    showToast("手机号不能为空", "error");
    return;
  }
  submitting.value = true;
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsAddAddress",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        address: {
          id: addressID.value,
          consignee: form.Consignee,
          phone: form.Phone,
          area: form.Area,
          address: form.Address,
          status: form.Status ? 1 : 0,
        },
      },
    });
    showToast(res?.data?.Message || "保存成功", "success");
    uni.$emit("addressSaved");
    setTimeout(() => {
      uni.navigateBack();
    }, 800);
  } catch (err) {
    console.error("[myaddress] 保存失败:", err);
    showToast("保存失败", "error");
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   地址编辑页 — 样式，所有颜色通过 CSS 变量驱动
   ============================================================ */

.address-edit-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}

.address-edit-page__skeleton {
  padding: 30rpx;
}

.skeleton-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.skeleton-line--label {
  width: 100rpx;
  height: 24rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  flex-shrink: 0;
}

.skeleton-line--input {
  flex: 1;
  height: 24rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
}

.address-edit-page__form {
  margin: 30rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid var(--color-border-light);
}
.form-item:last-child {
  border-bottom: none;
}

.form-item__label {
  width: 140rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  flex-shrink: 0;
}

.form-item__content {
  flex: 1;
  min-width: 0;
}
.form-item__input {
  width: 100%;
  font-size: 28rpx;
  color: var(--color-text);
}
.form-item__value {
  font-size: 28rpx;
  color: var(--color-text);
}
.form-item__value--placeholder {
  color: var(--color-disabled);
}
.form-item--clickable:active {
  background-color: var(--color-primary-bg-light);
}
.form-item--switch .form-item__content {
  display: flex;
  justify-content: flex-end;
}

.address-edit-page__footer {
  padding: 32rpx 30rpx;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 96rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text-on-primary);
  background-color: var(--color-primary);
  border-radius: var(--radius-button);
}
.submit-btn:active {
  opacity: 0.88;
  transform: scale(0.96);
}
</style>
