<!--
  商品下单页（orderProd.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动，跟随全局主题动态切换

  旧函数 → 新函数映射：
    onLoad()           → onLoad(() => { loadFromStore })
    valChange(e)       → handleQuantityChange(e)
    tiao()             → goToAddress()
    selc(val)          → handleShippingChange(val)
    mai()              → submitOrder()
    uni.$on("login")   → uni.$on("login", ...) + onBeforeUnmount cleanup
-->

<template>
  <view class="order-prod-page" :style="$themeStyle">
    <!-- ==================== 骨架屏加载 ==================== -->
    <view v-if="!pageReady" class="order-prod-page__skeleton">
      <view class="skeleton-row" />
      <view class="skeleton-card">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--text" />
      </view>
      <view class="skeleton-card">
        <view class="skeleton-card__img" />
        <view class="skeleton-card__body">
          <view class="skeleton-line skeleton-line--title" />
          <view class="skeleton-line skeleton-line--price" />
        </view>
      </view>
    </view>

    <!-- ==================== 主内容 ==================== -->
    <template v-else>
      <!-- 收货方式 -->
      <view class="order-prod-page__shipping">
        <text class="shipping__label">收货方式:</text>
        <u-radio-group
          v-model="shippingMethod"
          @change="handleShippingChange"
          placement="row"
        >
          <u-radio :activeColor="radioActiveColor" label="邮寄" name="0" />
          <u-radio :activeColor="radioActiveColor" label="到店自取" name="1" />
        </u-radio-group>
      </view>

      <!-- 收货地址（邮寄时） -->
      <view
        class="order-prod-page__address"
        v-if="shippingMethod == '0'"
        @click="goToAddress"
      >
        <!-- 空态：添加地址 -->
        <view
          class="address-empty"
          v-if="Object.keys(addressForm).length === 0"
        >
          <u-icon name="plus-circle" color="var(--color-primary)" size="24" />
          <text class="address-empty__text">添加收货地址</text>
        </view>

        <!-- 已有地址 -->
        <view class="address-card" v-else>
          <view class="address-card__header">
            <text class="address-card__name">{{ addressForm.Consignee }}</text>
            <text class="address-card__phone">{{ addressForm.Phone }}</text>
          </view>
          <view class="address-card__detail">
            {{ addressForm.Area }}{{ addressForm.Address }}
          </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="order-prod-page__product">
        <view class="product-card__header">
          <image
            class="product-card__thumb"
            :src="product.ImgUrl"
            mode="aspectFill"
          />
          <text class="product-card__name">{{ product.GoodsName }}</text>
        </view>

        <view class="product-card__footer">
          <view class="product-card__prices">
            <text class="product-card__price">￥{{ product.SellPrice }}</text>
            <text class="product-card__original"
              >￥{{ product.MarketPrice }}</text
            >
          </view>
          <u-number-box
            v-model="quantity"
            :min="1"
            :max="product.StockNumber || 999"
            :disabledInput="true"
            @change="handleQuantityChange"
          >
            <template #minus>
              <view class="num-btn">−</view>
            </template>
            <template #input>
              <view class="num-input">{{ quantity }}</view>
            </template>
            <template #plus>
              <view class="num-btn">+</view>
            </template>
          </u-number-box>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="order-prod-page__spacer" />
    </template>

    <!-- ==================== 底部操作栏 ==================== -->
    <view class="bottom-bar" v-if="pageReady">
      <view class="bottom-bar__price">
        <text class="bottom-bar__symbol">￥</text>
        <text class="bottom-bar__value">{{ totalPrice }}</text>
      </view>
      <view class="bottom-bar__btn" @click="submitOrder"> 立即购买 </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store/index.js";

// ==================== 页面路由常量 ====================
const PAGE_ROUTES = {
  address: "/pages/address/address",
  payment: "/pages/payment/payment",
};

// ==================== Store ====================
const { state: store } = useStore();

// ==================== 数据 ====================
const pageReady = ref(false);
const shippingMethod = ref("0");
const addressForm = ref({});
const quantity = ref(1);
const product = ref({});

// ==================== 计算属性 ====================
const totalPrice = computed(() => {
  return Number(
    (Number(product.value.SellPrice || 0) * quantity.value).toFixed(2),
  );
});

const radioActiveColor = computed(() => {
  return store.themeVars?.["--color-primary"] ?? "";
});

// ==================== 生命周期 ====================
onLoad(() => {
  product.value = store.prderProd || {};
  pageReady.value = true;
});

// 监听地址选择回调
const onLogin = (data) => {
  addressForm.value = data?.item || {};
};
uni.$on("login", onLogin);

onBeforeUnmount(() => {
  uni.$off("login", onLogin);
});

// ==================== 业务方法 ====================
function handleShippingChange() {
  addressForm.value = {};
}

function handleQuantityChange(e) {
  const val = e?.value ?? e;
  quantity.value = val;
}

function goToAddress() {
  uni.navigateTo({ url: PAGE_ROUTES.address });
}

async function submitOrder() {
  try {
    const openid = uni.getStorageSync("userinfo");

    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsCreateGoodsOrder",
      method: "POST",
      data: {
        openId: openid?.openid || "",
        merchantID: product.value.MerchantID,
        shopID: product.value.ShopID,
        goodsID: product.value.GoodsID,
        memberID: 0,
        totalNumber: quantity.value,
        receivingMethod: shippingMethod.value,
        totalMoney: totalPrice.value,
        addressID: addressForm.value.ID || 0,
        consignee: addressForm.value.Consignee || "",
        phone: addressForm.value.Phone || "",
        address: addressForm.value.Area
          ? `${addressForm.value.Area}${addressForm.value.Address}`
          : "",
        remark: "",
      },
    });

    if (res?.data?.Code === 200) {
      const data = res.data.Data || {};
      store.tickinfo = {
        name: "orderProde",
        OrderCode: data.OrderCode,
        OrderID: data.OrderID,
        TotalMoney: data.TotalMoney,
        ProductInfo: data.ProductInfo,
        openId: openid?.openid || "",
        isMember: data.IsBindMember,
      };
      uni.navigateTo({ url: PAGE_ROUTES.payment });
    }
  } catch (err) {
    console.error("[orderProd] 提交订单失败:", err);
  }
}
</script>

<style lang="scss" scoped>
/* ============================================================
   商品下单页 — 样式
   所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
   ============================================================ */

.order-prod-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

// ==================== 骨架屏 ====================
.order-prod-page__skeleton {
  padding: 24rpx 32rpx;
}

.skeleton-row {
  height: 80rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-bottom: 24rpx;
}

.skeleton-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-soft);
}

.skeleton-card__img {
  width: 200rpx;
  height: 160rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--radius-sm);
}

.skeleton-card__body {
  margin-top: 20rpx;
}

.skeleton-line {
  height: 24rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
  margin-bottom: 16rpx;
}

.skeleton-line--title {
  width: 60%;
}

.skeleton-line--price {
  width: 35%;
  height: 30rpx;
}

.skeleton-line--text {
  width: 100%;
}

// ==================== 收货方式 ====================
.order-prod-page__shipping {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: var(--color-bg-card);
}

.shipping__label {
  font-size: 28rpx;
  color: var(--color-text);
  margin-right: 24rpx;
  flex-shrink: 0;
}

// ==================== 收货地址 ====================
.order-prod-page__address {
  margin: 20rpx 32rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.address-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160rpx;
  gap: 20rpx;
}

.address-empty__icon {
  width: 48rpx;
  height: 48rpx;
}

.address-empty__text {
  font-size: 30rpx;
  color: var(--color-text-secondary);
}

.address-card {
  padding: 28rpx;
}

.address-card__header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 16rpx;
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
  font-size: 28rpx;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

// ==================== 商品信息 ====================
.order-prod-page__product {
  margin: 0 32rpx;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.product-card__header {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid var(--color-border-light);
  gap: 20rpx;
}

.product-card__thumb {
  width: 180rpx;
  height: 140rpx;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.product-card__name {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.product-card__prices {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.product-card__price {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--color-primary);
}

.product-card__original {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

// ==================== 底部占位 ====================
.order-prod-page__spacer {
  height: 160rpx;
}

// ==================== 底部操作栏 ====================
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: var(--color-bg-card);
  box-shadow: var(--shadow-soft);
  z-index: 100;
}

.bottom-bar__price {
  display: flex;
  align-items: baseline;
  color: var(--color-primary);
}

.bottom-bar__symbol {
  font-size: 24rpx;
  font-weight: 600;
}

.bottom-bar__value {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.bottom-bar__btn {
  flex-shrink: 0;
  min-width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-on-primary);
  background-color: var(--color-primary);
  border-radius: var(--radius-button);

  &:active {
    opacity: 0.88;
    transform: scale(0.96);
  }
}
</style>
