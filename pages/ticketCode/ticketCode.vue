<!--
  票码凭证页 — 展示订单二维码 + 订单详情 + 操作按钮
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
	<view class="ticket-page" :style="$themeStyle">
		<RequestLoading v-if="requestLoading" text="加载中..." />

		<!-- 票码轮播 -->
		<view class="ticket-page__code">
			<text class="ticket-page__code-title">使用凭证</text>
			<view class="ticket-page__swiper">
				<wooSwiper :list="codeList" :som="som" @tickCar="onSwiperChange"></wooSwiper>
			</view>
		</view>

		<!-- 产品名 + 分割线 -->
		<view class="ticket-page__divider" />
		<text class="ticket-page__product">{{ orderList.ProductName }}</text>

		<!-- 订单详情 -->
		<view class="ticket-page__card">
			<text class="ticket-page__card-title">联系人</text>
			<view class="ticket-page__item" v-for="(row, idx) in infoRows" :key="idx">
				<text class="ticket-page__item-label">{{ row.label }}</text>
				<text class="ticket-page__item-value"
					:class="{ 'ticket-page__item-value--highlight': row.highlight }">{{ row.value }}</text>
			</view>

			<!-- 操作按钮 -->
			<view class="ticket-page__actions" v-if="hasActions">
				<view class="ticket-page__btn" v-if="orderList.AllowRefund" @click="goRefund">退票</view>
				<view class="ticket-page__btn" v-if="orderList.AllowTakeFace" @click="goSupplement">补录</view>
				<view class="ticket-page__btn ticket-page__btn--primary" v-if="orderList.PayStatus == -2"
					@click="handlePay">立即支付</view>
				<view class="ticket-page__btn" v-if="orderList.MiddleStatus == 4 && orderList.Status != 1"
					@click="goInvoice">开发票</view>
				<view class="ticket-page__btn" v-if="orderList.MiddleStatus == 5" @click="goInvoice">查看发票</view>
			</view>
		</view>

		<u-toast ref="uToastRef" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import RequestLoading from "@/components/loading/request-loading.vue";
	import {
		useToast
	} from "@/util/toast.js";
	import wooSwiper from "@/components/woo-swiper/woo-swiper.vue";
	const {
		uToastRef,
		showToast
	} = useToast();

	const codeList = ref([]);
	const orderList = ref({});
	const current = ref(0);
	const som = ref("");
	const requestLoading = ref(false);

	const infoRows = computed(() => {
		const o = orderList.value;
		const rows = [{
				label: "联系人:",
				value: o.Contacts || ""
			},
			{
				label: "手机号:",
				value: o.ContactPhone || ""
			},
			{
				label: "订单号:",
				value: o.OrderNo || ""
			},
			{
				label: "购买数:",
				value: o.TotalNumber || ""
			},
			{
				label: "已用数:",
				value: o.UseNumber || ""
			},
			{
				label: "游玩日期:",
				value: o.TravelTime || "",
				highlight: true
			},
			{
				label: "有效日期:",
				value: o.EffectiveDate || "",
				highlight: true
			},
			{
				label: "下单时间:",
				value: o.CreateTime || ""
			},
			{
				label: "物流单号:",
				value: o.ExpressNumber || ""
			},
		];
		if (o.OrderSubType == 9)
			rows.push({
				label: "排队号:",
				value: o.TakeNumber || ""
			});
		return rows;
	});

	const hasActions = computed(() => {
		const o = orderList.value;
		return (
			o.AllowRefund ||
			o.AllowTakeFace ||
			o.PayStatus == -2 ||
			o.MiddleStatus == 4 ||
			o.MiddleStatus == 5
		);
	});

	async function fetchTicketCode(orderID) {
		requestLoading.value = true;
		try {
			const openid = uni.getStorageSync("userinfo");
			const res = await uni.$myRequest({
				url: "/api/Applets/AppletsGetTicketCode",
				method: "POST",
				data: {
					openId: openid?.openid || "",
					orderID
				},
			});
			const data = res.data?.Data || {};
			orderList.value = data;
			if (data.ShoppingCartList?.length > 0) {
				orderList.value.ProductName =
					data.ShoppingCartList[current.value].TicketName;
			} else {
				orderList.value.ProductName = data.ProductName || "";
			}
			codeList.value = (data.TicketCodeList || []).map((item) => ({
				src: item.CodeUrl,
				text: item.TicketCode,
				id: item.IDCard,
				Status: item.Status,
			}));
		} catch (err) {
			console.error("[ticketCode] err:", err);
		} finally {
			requestLoading.value = false;
		}
	}

	onLoad((options) => {
		fetchTicketCode(options?.orderID || "");
	});

	function onSwiperChange(val) {
		current.value = val;
		if (orderList.value.ShoppingCartList?.length > 0) {
			orderList.value.ProductName =
				orderList.value.ShoppingCartList[current.value].TicketName;
		}
	}

	function goRefund() {
		uni.navigateTo({
			url: `/pages/ticketCode/returnticket?order=${orderList.value.OrderID}`,
		});
	}

	function goSupplement() {
		uni.navigateTo({
			url: `/pages/ticketCode/redBokd?order=${orderList.value.OrderID}`,
		});
	}

	function goInvoice() {
		const encoded = encodeURIComponent(orderList.value.InvoiceUrl || "");
		uni.navigateTo({
			url: `/pages/ticketCode/Invoice?url=${encoded}`
		});
	}

	async function handlePay() {
		requestLoading.value = true;
		try {
			const res = await uni.$myRequest({
				url: "/api/Applets/AppletsPayUnpaidOrder",
				method: "POST",
				data: orderList.value,
			});
			if (res.data?.Code === 200) {
				const pay = res.data.Data || {};
				uni.requestPayment({
					paySign: pay.paySign,
					timeStamp: pay.timeStamp,
					nonceStr: pay.nonceStr,
					package: pay.package_str,
					signType: pay.signType,
					success: () => {
						uni.reLaunch({
							url: "/pages/index/index?tab=1&status=0"
						});
					},
					fail: () => {
						showToast("支付取消或失败");
					},
				});
			} else {
				showToast(res.data.Message);
			}
		} catch (err) {
			console.error("[ticketCode] pay err:", err);
			showToast("支付异常");
		} finally {
			requestLoading.value = false;
		}
	}
</script>

<style lang="scss" scoped>
	.ticket-page {
		min-height: 100vh;
		background-color: var(--color-bg);
		display: flex;
		flex-direction: column;
	}

	.ticket-page__code {
		background: var(--color-bg-card);
		margin: 20rpx 20rpx 0;
		border-radius: var(--radius-card) var(--radius-card) 0 0;
	}

	.ticket-page__code-title {
		display: block;
		padding: 20rpx;
		border-bottom: 1px solid var(--color-border-light);
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
	}

	.ticket-page__swiper {
		padding: 20rpx;
	}

	.ticket-page__divider {
		height: 24rpx;
		margin: 0 20rpx;
		background: var(--color-bg);
		position: relative;
	}

	.ticket-page__divider::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: repeating-linear-gradient(90deg,
				var(--color-border-light) 0,
				var(--color-border-light) 10rpx,
				transparent 10rpx,
				transparent 16rpx);
	}

	.ticket-page__product {
		display: block;
		padding: 20rpx;
		margin: 0 20rpx;
		background: var(--color-bg-card);
		text-align: center;
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
	}

	.ticket-page__card {
		margin: 20rpx;
		background: var(--color-bg-card);
		border-radius: var(--radius-card);
		padding-bottom: 20rpx;
	}

	.ticket-page__card-title {
		display: block;
		padding: 20rpx;
		border-bottom: 1px solid var(--color-border-light);
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
	}

	.ticket-page__item {
		display: flex;
		padding: 12rpx 20rpx;
		font-size: var(--font-size-caption, 24rpx);
	}

	.ticket-page__item-label {
		width: 120rpx;
		text-align: right;
		color: var(--color-text-secondary);
		margin-right: 20rpx;
	}

	.ticket-page__item-value {
		flex: 1;
		color: var(--color-text);
	}

	.ticket-page__item-value--highlight {
		color: var(--color-secondary);
	}

	.ticket-page__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		padding: 20rpx 20rpx 0;
	}

	.ticket-page__btn {
		width: 160rpx;
		padding: 16rpx 0;
		border-radius: var(--radius-button);
		font-size: var(--font-size-caption, 24rpx);
		font-weight: 600;
		background: var(--color-bg);
		color: var(--color-primary);
		border: 1px solid var(--color-primary-border-light);
		text-align: center;
		transition:
			opacity 160ms ease,
			transform 160ms ease;

		&:active {
			opacity: 0.88;
			transform: scale(0.96);
		}
	}

	.ticket-page__btn--primary {
		background: var(--color-primary);
		color: var(--color-text-on-primary);
		border-color: var(--color-primary);
	}
</style>