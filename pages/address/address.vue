<!--
  地址列表页（address.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad()               → onLoad(() => { fetchAddressList() })
    onShow()               → 已移除（数据由 onLoad 加载，返回时由 login 事件刷新）
    _initData(is_rest)     → fetchAddressList()
    handleDel(item, index) → handleDelete(item, index)
    handleRedirect(item)   → selectAddress(item)
    addContact(item)       → goToEdit(item)
-->

<template>
  <view class="address-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="address-page__skeleton">
      <view class="skeleton-btn" />
      <view class="skeleton-card" v-for="i in 3" :key="i">
        <view class="skeleton-line skeleton-line--name" />
        <view class="skeleton-line skeleton-line--addr" />
        <view class="skeleton-line skeleton-line--tag" />
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 新增按钮 -->
      <view class="address-page__header">
        <view class="add-btn" @click="goToEdit()">
          <u-icon name="plus" size="20" color="var(--color-primary)" />
          <text>添加常用地址</text>
        </view>
      </view>

      <!-- 空态 -->
      <Kong v-if="addressList.length === 0" text="暂无地址" />

      <!-- 地址列表 -->
      <view class="address-page__list" v-else>
        <view
          class="address-card"
          v-for="(item, index) in addressList"
          :key="index"
        >
          <view class="address-card__body" @click="selectAddress(item)">
            <view class="address-card__row">
              <text class="address-card__name">{{ item.Consignee }}</text>
              <text class="address-card__phone">{{ item.Phone }}</text>
            </view>
            <text class="address-card__detail"
              >{{ item.Area }}{{ item.Address }}</text
            >
            <view class="address-card__default" v-if="item.Status == 1"
              >该地址为默认地址</view
            >
          </view>
          <view class="address-card__actions">
            <view class="address-card__btn" @click.stop="goToEdit(item)">
              <u-icon
                name="edit-pen"
                color="var(--color-text-secondary)"
                size="22"
              />
            </view>
            <view
              class="address-card__btn"
              @click.stop="handleDelete(item, index)"
            >
              <u-icon
                name="trash"
                color="var(--color-text-secondary)"
                size="22"
              />
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- ==================== 删除确认弹窗 ==================== -->
    <u-modal
      :show="showDeleteModal"
      title="提示"
      content="确定要删除该地址吗？"
      :showCancelButton="true"
      :confirmColor="modalConfirmColor"
      confirmText="删除"
      cancelText="取消"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  edit: "/pages/address/myaddress",
};

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 数据 ====================
const addressList = ref([]);
const pageReady = ref(false);
const showDeleteModal = ref(false);
const deleteTarget = ref(null);

// ==================== 计算属性 ====================
const modalConfirmColor = computed(() => {
  return store.themeVars?.["--color-primary"] ?? "";
});

// ==================== 生命周期 ====================
onLoad(() => {
  fetchAddressList();
});

// 监听地址编辑页返回的刷新事件
const onAddressSaved = () => {
  fetchAddressList();
};
onMounted(() => {
  uni.$on("addressSaved", onAddressSaved);
});
onBeforeUnmount(() => {
  uni.$off("addressSaved", onAddressSaved);
});

// ==================== 数据请求 ====================
async function fetchAddressList() {
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetAddress",
      method: "POST",
      data: { openId: openid?.openid || "", invoiceID: 1 },
    });
    addressList.value = res?.data?.Data || [];
  } catch (err) {
    console.error("[address] 获取地址列表失败:", err);
  } finally {
    pageReady.value = true;
  }
}

// ==================== 业务方法 ====================
function handleDelete(item, index) {
  deleteTarget.value = { item, index };
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  const { item, index } = deleteTarget.value;
  try {
    const openid = uni.getStorageSync("userinfo");
    await uni.$myRequest({
      url: "/api/Applets/AppletsDelAddress",
      method: "POST",
      data: { openId: openid?.openid || "", addressID: item.ID },
    });
    addressList.value.splice(index, 1);
  } catch (err) {
    console.error("[address] 删除地址失败:", err);
  } finally {
    showDeleteModal.value = false;
    deleteTarget.value = null;
  }
}

// ==================== 导航辅助 ====================
function goToEdit(item) {
  uni.navigateTo({
    url: `${PAGE_ROUTES.edit}?ID=${item?.ID || 0}`,
  });
}

function selectAddress(item) {
  uni.$emit("selectAddress", { item });
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
/* ============================================================
   地址列表页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.address-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}

// ==================== 骨架屏 ====================
.address-page__skeleton {
  padding: 30rpx;
}

.skeleton-btn {
  height: 88rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--radius-button);
  margin-bottom: 30rpx;
}

.skeleton-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-soft);
}

.skeleton-line {
  height: 24rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-bottom: 16rpx;
}

.skeleton-line--name {
  width: 40%;
  height: 30rpx;
}

.skeleton-line--addr {
  width: 75%;
}

.skeleton-line--tag {
  width: 30%;
  margin-bottom: 0;
}

// ==================== 新增按钮 ====================
.address-page__header {
  padding: 24rpx 30rpx 0;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  height: 88rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-soft);
  font-size: 28rpx;
  color: var(--color-primary);
}

.add-btn:active {
  opacity: 0.75;
  transform: scale(0.97);
}

// ==================== 地址卡片 ====================
.address-page__list {
  padding: 24rpx 30rpx;
}

.address-card {
  display: flex;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-bottom: 24rpx;
  overflow: hidden;
}

.address-card__body {
  flex: 1;
  min-width: 0;
  padding: 28rpx;
}

.address-card__row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 12rpx;
}

.address-card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}

.address-card__phone {
  font-size: 28rpx;
  color: var(--color-text-secondary);
}

.address-card__detail {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.address-card__default {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--color-primary);
}

.address-card__actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16rpx;
  padding: 0 24rpx;
  border-left: 1rpx solid var(--color-border-light);
}

.address-card__btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-primary-bg-light);
}

.address-card__btn:active {
  opacity: 0.7;
}
</style>
