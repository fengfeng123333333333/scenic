<!--
  商品列表页（productList.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad(option)        → onLoad((option) => { parseRouteParams + fetchInitData })
    select(index)         → handleFilterSelect(index)
    purchase(item)        → goToProductDetail(item)
    yuding(index)         → openTips(index)
    close()               → closeTips()
-->

<template>
  <view class="product-list-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="product-list-page__skeleton">
      <view class="skeleton-banner" />
      <view class="skeleton-card" v-for="i in 3" :key="i">
        <view class="skeleton-card__img" />
        <view class="skeleton-card__body">
          <view class="skeleton-line skeleton-line--title" />
          <view class="skeleton-line skeleton-line--tag" />
          <view class="skeleton-line skeleton-line--price" />
        </view>
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- Banner 轮播 -->
      <view class="product-list-page__banner">
        <swiper
          class="product-list-page__swiper"
          circular
          :indicator-dots="true"
          :autoplay="true"
          :interval="2000"
          :duration="500"
        >
          <swiper-item v-for="(item, index) in banList" :key="index">
            <image
              class="product-list-page__swiper-img"
              :src="item.ImgUrl"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 分类筛选 -->
      <view class="product-list-page__filter">
        <view class="filter-bar" @click="showPicker = true">
          <text class="filter-bar__label">{{ currentFilterName }}</text>
          <u-icon
            name="arrow-down-fill"
            color="var(--color-text-secondary)"
            size="16"
          />
        </view>
        <u-picker
          :show="showPicker"
          :columns="[filterOptions]"
          keyName="text"
          title="选择分类"
          :defaultIndex="[currentFilterIndex]"
          :confirmColor="pickerConfirmColor"
          @confirm="handleFilterConfirm"
          @close="showPicker = false"
          @cancel="showPicker = false"
        />
      </view>

      <!-- 商品列表 -->
      <Kong v-if="productList.length === 0" text="暂无商品" />
      <view class="product-list-page__list" v-else>
        <view
          class="product-card"
          v-for="item in productList"
          :key="item.GoodsID"
        >
          <view class="product-card__thumb">
            <image :src="item.ImgUrl" mode="aspectFill" />
          </view>

          <view class="product-card__body">
            <text class="product-card__name">{{ item.GoodsName }}</text>

            <view class="product-card__row">
              <view class="product-card__tags">
                <text
                  class="product-card__tag"
                  v-for="(label, li) in item.LabelList"
                  :key="li"
                  >{{ label }}</text
                >
              </view>
              <view class="product-card__prices">
                <text class="product-card__price">
                  <text class="product-card__symbol">￥</text>
                  {{ item.SellPrice }}
                </text>
                <text class="product-card__original"
                  >原价￥{{ item.MarketPrice }}</text
                >
              </view>
            </view>

            <view class="product-card__footer">
              <view class="product-card__tips" @click="openTips(item)">
                <text style="margin-right: 10rpx">购买须知</text>
                <u-icon
                  name="arrow-right"
                  color="var(--color-primary)"
                  size="14"
              /></view>
              <view class="product-card__btn" @click="goToProductDetail(item)">
                立即购买
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- ==================== 购买须知弹窗 ==================== -->
    <u-popup
      :show="showTips"
      :round="10"
      mode="bottom"
      @close="closeTips"
      closeable
    >
      <scroll-view class="product-list-page__popup" y-scroll>
        <f-parse :content="currentTips || ''" />
      </scroll-view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";
import Kong from "@/components/kong/kong.vue";
import text from "uview-plus/components/u-text/text";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  productDetail: "/pages/productList/productDetails",
};

// ==================== 数据 ====================
const pageTitle = ref("");
const pageReady = ref(false);
const banList = ref([]);
const productList = ref([]);

// 筛选
const filterOptions = ref([]);
const currentFilterIndex = ref(0);
const showPicker = ref(false);

const { state: store } = useStore();
const pickerConfirmColor = computed(
  () => store.themeVars?.["--color-primary"] ?? "",
);

const currentFilterName = computed(() => {
  return filterOptions.value[currentFilterIndex.value]?.text || "全部分类";
});

// ==================== 弹窗 ====================
const showTips = ref(false);
const currentTips = ref("");

// ==================== 生命周期 ====================
onLoad((option) => {
  pageTitle.value = option?.str || "商品列表";
  fetchInitData();
});

// ==================== 数据请求 ====================
async function fetchInitData() {
  try {
    // 并行请求
    const [imgRes, typeRes] = await Promise.all([
      uni.$myRequest({
        url: "/api/Applets/AppletsGetScenicImg",
        method: "POST",
      }),
      uni.$myRequest({
        url: "/api/Applets/AppletsGetGoodsType",
        method: "POST",
      }),
    ]);

    banList.value = imgRes?.data?.Data || [];

    // 构建筛选选项（第一项固定为"全部分类"）
    const types = typeRes?.data?.Data || [];
    const options = [];
    types.forEach((item) => {
      options.push({
        text: item.Name,
        value: item.ID,
        CompanyID: item.CompanyID,
        ScenicID: item.ScenicID,
      });
    });
    filterOptions.value = options;

    // 默认加载全部
    currentFilterIndex.value = 0;
    await loadProducts(-1);
  } catch (err) {
    console.error("[productList] 初始化失败:", err);
  } finally {
    pageReady.value = true;
  }
}

async function loadProducts(typeID) {
  try {
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsGetGoods",
      method: "POST",
      data: { typeID },
    });
    productList.value = res?.data?.Data || [];
  } catch (err) {
    console.error("[productList] 加载商品失败:", err);
  }
}

// ==================== 导航辅助 ====================
function goToProductDetail(item) {
  const currentSite = JSON.stringify({
    MerchantID: item.MerchantID,
    ShopID: item.ShopID,
    GoodsID: item.GoodsID,
  });
  uni.navigateTo({
    url: `${PAGE_ROUTES.productDetail}?currentSite=${currentSite}`,
  });
}

// ==================== 业务方法 ====================
function handleFilterConfirm(e) {
  const selected = e.value?.[0];
  if (!selected) return;

  currentFilterIndex.value = e.indexs?.[0] ?? 0;
  showPicker.value = false;

  // 选中"全部分类"(value=-1)或具体分类
  loadProducts(selected.value);
}

function openTips(item) {
  currentTips.value = item?.Tips || "";
  showTips.value = true;
}

function closeTips() {
  showTips.value = false;
}
</script>

<style lang="scss" scoped>
/* ============================================================
   商品列表页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.product-list-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: env(safe-area-inset-bottom);
}

// ==================== 骨架屏 ====================
.product-list-page__skeleton {
  padding: 0 32rpx;
}

.skeleton-banner {
  width: 100%;
  height: 400rpx;
  background: var(--color-skeleton-base);
}

.skeleton-card {
  display: flex;
  margin-top: 20rpx;
  padding: 20rpx;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
}

.skeleton-card__img {
  width: 200rpx;
  height: 160rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.skeleton-card__body {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16rpx;
}

.skeleton-line {
  height: 24rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
}

.skeleton-line--title {
  width: 70%;
  height: 32rpx;
}

.skeleton-line--tag {
  width: 45%;
}

.skeleton-line--price {
  width: 35%;
}

// ==================== Banner ====================
.product-list-page__banner {
  width: 100%;
}

.product-list-page__swiper {
  height: 400rpx;
}

.product-list-page__swiper-img {
  width: 100%;
  height: 100%;
  display: block;
}

// ==================== 筛选区 ====================
.product-list-page__filter {
  padding: 20rpx 32rpx;
  background-color: var(--color-bg-card);
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  border: 1rpx solid var(--color-border-light);
}

.filter-bar:active {
  opacity: 0.7;
}

.filter-bar__label {
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 500;
}

// ==================== 商品列表 ====================
.product-list-page__list {
  padding: 20rpx 32rpx 48rpx;
}

.product-card {
  display: flex;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  margin-top: 20rpx;
  overflow: hidden;
  position: relative;
}

.product-card:active {
  transform: scale(0.98);
}

.product-card__thumb {
  flex-shrink: 0;
  width: 220rpx;
  height: 200rpx;

  image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.product-card__body {
  flex: 1;
  min-width: 0;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
}

.product-card__name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.product-card__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 12rpx;
  flex: 1;
}

.product-card__tags {
  flex: 1;
  min-width: 0;
}

.product-card__tag {
  display: inline-block;
  margin-right: 8rpx;
  margin-bottom: 6rpx;
  font-size: 20rpx;
  color: var(--color-primary);
  border: 1rpx solid var(--color-primary);
  padding: 6rpx 12rpx;
  border-radius: var(--radius-sm);
}

.product-card__prices {
  flex-shrink: 0;
  text-align: right;
  margin-left: 12rpx;
}

.product-card__price {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-primary);
  display: block;
}

.product-card__symbol {
  font-size: 24rpx;
}

.product-card__original {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  text-decoration: line-through;
  display: block;
  margin-top: 4rpx;
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.product-card__tips {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.product-card__btn {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: 24rpx;
  font-weight: 600;
  padding: 12rpx 36rpx;
  border-radius: 32rpx;

  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }
}

// ==================== 购买须知弹窗 ====================
.product-list-page__popup {
  padding: 32rpx;
  min-height: 60vh;
  max-height: 80vh;
  overflow-y: auto;
}
</style>
