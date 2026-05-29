<!--
  常用人员页（tourist.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换
-->

<template>
  <view class="tourist-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="tourist-page__skeleton">
      <view class="skeleton-card" v-for="i in 3" :key="i">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 新增按钮 -->
      <view class="tourist-page__header">
        <button class="tourist-add-btn" @click="addContact()">
          <u-icon name="plus" size="20" color="var(--color-primary)" />
          <text>添加常用人员</text>
        </button>
      </view>

      <!-- 人员列表 -->
      <view class="tourist-list">
        <view
          class="tourist-card"
          v-for="(item, index) in touristList"
          :key="index"
        >
          <view class="tourist-card__body" @click="handleSelect(item)">
            <view class="tourist-card__field">
              <text class="tourist-card__label">姓名</text>
              <text class="tourist-card__value">{{ item.TouristName }}</text>
            </view>
            <view class="tourist-card__field">
              <text class="tourist-card__label">身份证</text>
              <text class="tourist-card__value">{{ item.TouristIDCard }}</text>
            </view>
            <view class="tourist-card__field">
              <text class="tourist-card__label">手机号</text>
              <text class="tourist-card__value">{{ item.TouristPhone }}</text>
            </view>
          </view>
          <view class="tourist-card__actions">
            <view class="tourist-card__btn" @click.stop="addContact(item)">
              <u-icon
                name="edit-pen"
                color="var(--color-text-secondary)"
                size="22"
              />
            </view>
            <view
              class="tourist-card__btn"
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

        <!-- 空态 -->
        <view class="tourist-list__empty" v-if="touristList.length === 0">
          <text>暂无常用人员</text>
        </view>
      </view>
    </template>

    <!-- ==================== Toast ==================== -->
    <!-- ==================== 删除确认弹窗 ==================== -->
    <u-modal
      :show="showDeleteModal"
      title="提示"
      :showCancelButton="true"
      :asyncClose="true"
      :zoom="true"
      :confirmColor="calendarColor"
      confirmText="删除"
      cancelText="取消"
      @confirm="handleDeleteConfirm"
      @cancel="showDeleteModal = false"
    >
      <view class="tourist-modal__content">确定要删除该人员信息吗？</view>
    </u-modal>

    <u-toast ref="uToastRef" />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useToast } from "@/util/toast.js";
import { useStore } from "@/store/index.js";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  contactAdd: "/pages/tourist/addTourist",
};

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 页面级 Toast ====================
const { uToastRef, showToast } = useToast();

// ==================== 页面状态 ====================
const pageReady = ref(false);
const isShow = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);

// ==================== 数据 ====================
const touristList = ref([]);
const deleteTarget = ref(null);

// ==================== 路由参数 ====================
const routeKey = ref(0);

// ==================== 计算属性 ====================
const calendarColor = computed(() => {
  return store.themeVars?.["--color-primary"] || "#3c9cff";
});

// ==================== 生命周期 ====================
onLoad((options) => {
  routeKey.value = options?.key || 0;
});

onShow(() => {
  fetchTouristList();
});

// ==================== 数据请求 ====================
async function fetchTouristList() {
  try {
    touristList.value = [];
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetTourists",
      method: "POST",
      data: { openId: openid?.openid || "" },
    });
    touristList.value = res?.data?.Data || [];
  } catch (err) {
    console.error("[tourist] 获取列表失败:", err);
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================
function buildContactAddUrl(item) {
  return `${PAGE_ROUTES.contactAdd}?ID=${item?.ID || 0}`;
}

function goToContactAdd(item) {
  uni.navigateTo({ url: buildContactAddUrl(item) });
}

// ==================== 业务方法 ====================
function addContact(item) {
  goToContactAdd(item);
}

function handleSelect(item) {
  if (!item) return;
  uni.$emit("login", { item, index: routeKey.value });
  uni.navigateBack();
}

function handleDelete(item, index) {
  if (!item) return;
  deleteTarget.value = { item, index };
  showDeleteModal.value = true;
}

async function handleDeleteConfirm() {
  if (!deleteTarget.value) {
    showDeleteModal.value = false;
    return;
  }
  const { item, index } = deleteTarget.value;
  try {
    const openid = uni.getStorageSync("userinfo");
    await uni.$myRequest({
      url: "/api/Applets/AppletsDelTourists",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        touristsID: item.ID,
      },
    });
    touristList.value.splice(index, 1);
    showToast("删除成功", "success");
  } catch (err) {
    console.error("[tourist] 删除失败:", err);
    showToast("删除失败");
  } finally {
    showDeleteModal.value = false;
    deleteTarget.value = null;
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   常用人员页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.tourist-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 24rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

// ==================== 骨架屏 ====================
.tourist-page__skeleton {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.skeleton-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 32rpx 24rpx;
  box-shadow: var(--shadow-soft);
}

.skeleton-line {
  height: 28rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-bottom: 20rpx;
}

.skeleton-line--title {
  width: 40%;
  height: 34rpx;
}

.skeleton-line--text {
  width: 100%;
}

.skeleton-line:last-child {
  width: 60%;
  margin-bottom: 0;
}

// ==================== 新增按钮 ====================
.tourist-page__header {
  margin-bottom: 24rpx;
}

.tourist-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 88rpx;
  background: var(--color-bg-card);
  border: 2rpx dashed var(--color-border-light);
  border-radius: var(--radius-card);
  font-size: 28rpx;
  color: var(--color-primary);
}

.tourist-add-btn:active {
  opacity: 0.7;
  background: var(--color-primary-bg-light);
}

// ==================== 人员列表 ====================
.tourist-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tourist-card {
  display: flex;
  align-items: center;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 24rpx 20rpx;
  box-shadow: var(--shadow-soft);
}

.tourist-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tourist-card__field {
  display: flex;
  align-items: center;
}

.tourist-card__label {
  width: 100rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-text);
  flex-shrink: 0;
}

.tourist-card__value {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.tourist-card__actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-left: 16rpx;
}

.tourist-card__btn {
  padding: 12rpx;
}

.tourist-card__btn:active {
  opacity: 0.5;
}

// ==================== 空态 ====================
.tourist-list__empty {
  text-align: center;
  padding: 120rpx 0;
  font-size: 28rpx;
  color: var(--color-text-secondary);
}

// ==================== 弹窗 ====================
.tourist-modal__content {
  text-align: center;
  font-size: 30rpx;
  color: var(--color-text);
  padding: 16rpx 0;
}
</style>
