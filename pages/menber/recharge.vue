<!--
  会员充值/下单页 — 票型详情 + 立即预定 + 微信支付
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  布局对齐 details.vue 标准
  旧函数映射：onLoad → onLoad(option) + fetchPageData()
              yuDing → onBooking (含 createOrder + handlePayment)
-->
<template>
	<view class="recharge-page" :style="$themeStyle">
		<!-- 加载态 -->
		<PageLoading v-if="!pageReady" />

		<template v-else>
			<!-- Banner 轮播 -->
			<view class="banner">
				<swiper class="banner__swiper" circular :indicator-dots="banList.length > 1" :autoplay="autoplay"
					:interval="interval" :duration="duration">
					<swiper-item v-for="(item, index) in banList" :key="index">
						<image class="banner__img" :src="item.ImgUrl" mode="aspectFill" />
					</swiper-item>
				</swiper>
				<view class="banner__mask" />
			</view>

			<!-- 票型基础信息卡 -->
			<view class="ticket-card">
				<view class="ticket-card__thumb">
					<image class="ticket-card__thumb-img" :src="ticketList.ImgUrl" mode="aspectFill" />
				</view>
				<view class="ticket-card__body">
					<text class="ticket-card__name">{{ ticketList.TicketName }}</text>
					<text class="ticket-card__desc" v-if="ticketList.Discription">
						{{ ticketList.Discription }}
					</text>
					<view class="ticket-card__prices">
						<view class="ticket-card__price">
							<text class="ticket-card__symbol">￥</text>
							<text class="ticket-card__price-value">{{
                ticketList.SellPrice
              }}</text>
						</view>
						<text class="ticket-card__original" v-if="ticketList.MarketPrice">
							原价￥{{ ticketList.MarketPrice }}
						</text>
					</view>
				</view>
			</view>

			<!-- 内容 Tab 切换 -->
			<view class="content-section" v-if="navs.length > 0">
				<f-tabs v-model="activeTab" :tabs="navs" field="name" @change="changeTab"
					lineColor="var(--color-primary)" activeColor="var(--color-primary)" :scroll="false" />
				<view class="content-section__body">
					<view class="content-section__html" v-show="activeTab === 0">
						<view v-html="ticketList.Intro" />
					</view>
					<view class="content-section__html" v-show="activeTab === 1">
						<view v-html="ticketList.Tips" />
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-spacer" />
		</template>

		<!-- 底部固定操作栏 -->
		<view class="bottom-bar" v-if="pageReady">
			<view class="bottom-bar__prices">
				<view class="bottom-bar__price">
					<text class="bottom-bar__symbol">￥</text>
					<text class="bottom-bar__value">{{ ticketList.SellPrice }}</text>
				</view>
				<text class="bottom-bar__original" v-if="ticketList.MarketPrice">
					￥{{ ticketList.MarketPrice }}
				</text>
			</view>
			<view class="bottom-bar__btn" :class="{ 'bottom-bar__btn--disabled': payLoading }" @click="onBooking">
				<template v-if="payLoading">
					<u-loading-icon mode="circle" size="18" color="var(--color-text-on-primary)" />
					<text>支付中...</text>
				</template>
				<text v-else>立即支付</text>
			</view>
		</view>

		<!-- 支付中遮罩 -->
		<RequestLoading v-if="payLoading" text="正在支付..." />

		<!-- 购买人信息弹窗 -->
		<u-popup :show="showBuyerPopup" mode="center" closeable="true" :round="20" :closeOnClickOverlay="true"
			@close="showBuyerPopup = false">
			<view class="buyer-popup">
				<view class="buyer-popup__title">购买人信息</view>
				<view class="buyer-popup__row">
					<text class="buyer-popup__label"> 姓名 </text>
					<input class="buyer-popup__input" v-model="buyerInfo.name" placeholder="请输入姓名" />
				</view>
				<view class="buyer-popup__row">
					<text class="buyer-popup__label">
						<text class="buyer-popup__required">*</text>电话
					</text>
					<input class="buyer-popup__input" type="number" v-model="buyerInfo.phone" placeholder="请输入电话"
						maxlength="11" />
				</view>
				<view class="buyer-popup__row">
					<text class="buyer-popup__label">
						<text class="buyer-popup__required">*</text>身份证
					</text>
					<input class="buyer-popup__input" v-model="buyerInfo.identity" placeholder="请输入身份证"
						maxlength="18" />
				</view>
				<view class="buyer-popup__btn" @click="confirmPay">
					<text>确认支付</text>
				</view>
			</view>
		</u-popup>

		<!-- Toast -->
		<u-toast ref="uToastRef" />
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import store from "@/store/index.js";
	import PageLoading from "@/components/loading/page-loading.vue";
	import RequestLoading from "@/components/loading/request-loading.vue";

	// ==================== 页面路由常量 ====================
	const PAGE_ROUTES = {
		/** 支付完成后跳转的首页（Tab 页） */
		home: "/pages/index/index",
	};

	// ==================== 数据 ====================
	const banList = ref([]);
	const ticketList = ref({});
	const navs = ref([{
			name: "图文详情",
			id: 0,
			disabled: true
		},
		{
			name: "预定须知",
			id: 1,
			disabled: true
		},
	]);
	const activeTab = ref(0);
	const memberId = ref("");
	const payLoading = ref(false);
	const requestLock = ref(false);
	const pageReady = ref(false);

	// ==================== 购买人信息弹窗 ====================
	const showBuyerPopup = ref(false);
	const needBuyerInfo = ref(false);
	const buyerInfo = ref({
		name: "",
		phone: "",
		identity: ""
	});

	// 轮播配置
	const autoplay = ref(true);
	const interval = ref(2000);
	const duration = ref(500);

	// ==================== Refs ====================
	const uToastRef = ref(null);

	// ==================== 生命周期 ====================
	onLoad((option) => {
		memberId.value = option.menber || "";
		fetchPageData();
	});

	// ==================== 数据请求 ====================

	async function fetchPageData() {
		try {
			// 并行请求：轮播图
			fetchBanner();

			// 获取票型详情
			await fetchTicketDetail();
		} finally {
			pageReady.value = true;
		}
	}

	async function fetchBanner() {
		const res = await uni.$myRequest({
			url: "/api/Applets/AppletsGetScenicImg",
			method: "POST",
		});
		banList.value = res.data.Data || [];
	}

	async function fetchTicketDetail() {
		const res = await uni.$myRequest({
			url: "/api/Applets/AppletsGetTicketById",
			data: {
				ticketID: store.state.tickId,
			},
			method: "POST",
		});
		ticketList.value = res.data.Data || {};

		// 检查是否需要购买人信息
		const t = ticketList.value;
		needBuyerInfo.value = t.NeedTouristPhone === 1 || t.NeedTouristIDCard === 1;
	}

	// ==================== 方法 ====================
	function changeTab(index) {
		activeTab.value = index;
	}

	// ==================== 导航辅助 ====================

	/** 支付成功后跳转到首页 */
	function goToHome() {
		uni.reLaunch({
			url: PAGE_ROUTES.home
		});
	}

	// ==================== 支付处理 ====================

	/** 处理跳转其他小程序支付 */
	function handleMiniProgramPay(payData) {
		const {
			appId,
			path,
			envVersion
		} = payData;
		wx.navigateToMiniProgram({
			appId,
			path,
			envVersion,
			success() {
				payLoading.value = false;
			},
			fail() {
				payLoading.value = false;
				showToast("跳转支付失败，请重试");
			},
		});
	}

	/** 处理 JSAPI 微信支付（调起收银台） */
	function handleJsapiPay(payData) {
		const payInfo = payData || {};

		const payParams = {
			paySign: payInfo.paySign,
			timeStamp: payInfo.timeStamp,
			nonceStr: payInfo.nonceStr,
			package: payInfo.package_str,
			signType: payInfo.signType,
			success() {
				goToHome();
			},
			fail() {
				payLoading.value = false;
				showToast("支付取消或失败");
			},
		};

		uni.requestPayment(payParams);
	}

	// ==================== 业务方法 ====================

	/** 点击"立即支付" */
	async function onBooking() {
		if (requestLock.value || payLoading.value) return;

		// 需要购买人信息 → 弹出表单
		if (needBuyerInfo.value) {
			buyerInfo.value = {
				name: "",
				phone: "",
				identity: ""
			};
			showBuyerPopup.value = true;
			return;
		}

		// 不需要 → 原逻辑
		doPay();
	}

	/** 弹窗中确认支付 */
	function confirmPay() {
		const b = buyerInfo.value;
		const t = ticketList.value;

		// 必填校验
		if (t.NeedTouristIDCard === 1) {
			if (!b.identity || !b.identity.trim()) {
				showToast("请输入身份证号码");
				return;
			}
		}
		if (t.NeedTouristPhone === 1) {
			if (!b.phone || !b.phone.trim()) {
				showToast("请输入电话号码");
				return;
			}
		}

		// 格式校验（无论是否必填，只要填了就校验）
		if (b.identity && b.identity.trim() && !isValidIdCard(b.identity.trim())) {
			showToast("身份证格式不正确");
			return;
		}
		if (b.phone && b.phone.trim() && !isValidPhone(b.phone.trim())) {
			showToast("手机号格式不正确");
			return;
		}

		showBuyerPopup.value = false;
		doPay();
	}

	/** 校验身份证格式（18位） */
	function isValidIdCard(val) {
		return /^\d{17}[\dXx]$/.test(val);
	}

	/** 校验手机号格式（11位，1开头） */
	function isValidPhone(val) {
		return /^1\d{10}$/.test(val);
	}

	/** 执行支付（原 onBooking 逻辑） */
	async function doPay() {
		requestLock.value = true;
		payLoading.value = true;

		try {
			const openid = uni.getStorageSync("userinfo");
			const res = await uni.$myRequest({
				url: "/api/Applets/AppletsCreateMemberTicketOrder",
				data: {
					openId: openid.openid,
					memberID: memberId.value,
					totalNumber: 1,
					totalMoney: ticketList.value.SellPrice,
					ticketID: store.state.tickId,
					Name: (buyerInfo.value.name || "").trim(),
					Phone: (buyerInfo.value.phone || "").trim(),
					IDCard: (buyerInfo.value.identity || "").trim(),
				},
				method: "POST",
			});

			if (res.data.Code !== 200) {
				payLoading.value = false;
				showToast(res.data.Message || "下单失败，请重试");
				return;
			}

			const payData = res.data.Data || {};

			// 跳转其他小程序支付
			if (payData.pay_type === "030") {
				handleMiniProgramPay(payData);
				return;
			}

			// JSAPI 微信支付
			handleJsapiPay(payData);
		} catch (err) {
			payLoading.value = false;
			showToast("网络异常，请重试");
		} finally {
			requestLock.value = false;
		}
	}

	// ==================== 工具方法 ====================

	function showToast(msg, type = "error") {
		if (uToastRef.value) {
			uToastRef.value.show({
				type,
				icon: false,
				message: msg,
				duration: 2000
			});
		} else {
			uni.showToast({
				title: msg,
				icon: "none"
			});
		}
	}
</script>

<style lang="scss" scoped>
	/* ============================================================
   会员充值/下单页 — 对齐 details.vue 布局标准
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.banner__xxx / .ticket-card__xxx / .bottom-bar__xxx
   ============================================================ */

	.recharge-page {
		min-height: 100vh;
		background-color: var(--color-bg);
	}

	/* ====== Banner ====== */
	.banner {
		position: relative;
		width: 100%;
	}

	.banner__swiper {
		height: 420rpx;
	}

	.banner__img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.banner__mask {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 35%;
		background: linear-gradient(180deg,
				rgba(255, 255, 255, 0) 0%,
				var(--color-bg) 100%);
		pointer-events: none;
	}

	/* Swiper 指示点 */
	:deep(.banner__swiper .wx-swiper-dot),
	:deep(.banner__swiper .uni-swiper-dot) {
		width: 10rpx !important;
		height: 10rpx !important;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.55) !important;
	}

	:deep(.banner__swiper .wx-swiper-dot-active),
	:deep(.banner__swiper .uni-swiper-dot-active) {
		width: 24rpx !important;
		border-radius: 5rpx !important;
		background-color: var(--color-bg-card) !important;
	}

	/* ====== 票型信息卡 ====== */
	.ticket-card {
		display: flex;
		margin: -56rpx 32rpx 0;
		padding: 28rpx;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		position: relative;
		z-index: 2;
		gap: 24rpx;
	}

	.ticket-card__thumb {
		flex-shrink: 0;
		width: 200rpx;
		height: 156rpx;
		border-radius: var(--radius-sm, 16rpx);
		overflow: hidden;
	}

	.ticket-card__thumb-img {
		width: 100%;
		height: 100%;
		display: block;
	}

	.ticket-card__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.ticket-card__name {
		font-size: var(--font-size-h2, 30rpx);
		font-weight: 700;
		color: var(--color-text);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-height: 1.4;
	}

	.ticket-card__desc {
		font-size: var(--font-size-caption, 24rpx);
		color: var(--color-text-secondary);
		margin-top: 6rpx;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.ticket-card__prices {
		display: flex;
		align-items: baseline;
		gap: 12rpx;
		margin-top: 10rpx;
	}

	.ticket-card__price {
		display: flex;
		align-items: baseline;
		color: var(--color-primary);
	}

	.ticket-card__symbol {
		font-size: var(--font-size-caption, 24rpx);
		font-weight: 600;
	}

	.ticket-card__price-value {
		font-size: 44rpx;
		font-weight: 700;
		line-height: 1;
	}

	.ticket-card__original {
		font-size: var(--font-size-small, 22rpx);
		color: var(--color-text-secondary);
		text-decoration: line-through;
		opacity: 0.7;
	}

	/* ====== 内容区 ====== */
	.content-section {
		margin: 32rpx 32rpx 0;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		overflow: hidden;
	}

	.content-section__body {
		padding: 0 32rpx 32rpx;
	}

	.content-section__html {
		min-height: 500rpx;
		padding-top: 16rpx;
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
		line-height: 1.75;

		:deep(img) {
			max-width: 100%;
			height: auto;
			display: block;
			margin: 16rpx 0;
			border-radius: var(--radius-sm, 16rpx);
		}

		:deep(p) {
			margin-bottom: 12rpx;
		}
	}

	/* ====== 底部占位 ====== */
	.bottom-spacer {
		height: 200rpx;
	}

	/* ====== 底部操作栏 ====== */
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

		&__prices {
			display: flex;
			align-items: baseline;
			gap: 12rpx;
		}

		&__price {
			display: flex;
			align-items: baseline;
			color: var(--color-primary);
		}

		&__symbol {
			font-size: var(--font-size-caption, 24rpx);
			font-weight: 600;
		}

		&__value {
			font-size: 44rpx;
			font-weight: 700;
			line-height: 1;
		}

		&__original {
			font-size: var(--font-size-small, 22rpx);
			color: var(--color-text-secondary);
			text-decoration: line-through;
			opacity: 0.7;
		}

		&__btn {
			flex-shrink: 0;
			min-width: 240rpx;
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			text-align: center;
			font-size: var(--font-size-body, 28rpx);
			font-weight: 600;
			color: var(--color-text-on-primary);
			background: linear-gradient(135deg,
					var(--color-primary) 0%,
					var(--color-primary-dark, var(--color-primary)) 100%);
			border-radius: var(--radius-button);
			padding: 0 48rpx;
			box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
			transition:
				opacity 0.12s ease,
				transform 0.12s ease;

			&:active {
				opacity: 0.88;
				transform: scale(0.96);
			}

			&--disabled {
				opacity: 0.85;
				transform: none;
				pointer-events: none;
			}
		}
	}

	/* ====== 购买人信息弹窗 ====== */
	.buyer-popup {
		width: 600rpx;
		padding: 40rpx 32rpx 28rpx;
		background: var(--color-bg-card);
		border-radius: var(--radius-card);
	}

	.buyer-popup__title {
		font-size: var(--font-size-body, 28rpx);
		font-weight: 700;
		color: var(--color-text);
		text-align: center;
		margin-bottom: 32rpx;
	}

	.buyer-popup__row {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.buyer-popup__label {
		width: 110rpx;
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text-secondary);
		text-align: right;
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.buyer-popup__required {
		color: var(--color-danger);
	}

	.buyer-popup__input {
		flex: 1;
		height: 72rpx;
		padding: 0 20rpx;
		border: 1rpx solid var(--color-border-light);
		border-radius: var(--radius-sm, 16rpx);
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
		background: var(--color-bg);
	}

	.buyer-popup__btn {
		margin-top: 12rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg,
				var(--color-primary) 0%,
				var(--color-primary-dark) 100%);
		color: var(--color-text-on-primary);
		border-radius: var(--radius-button);
		font-size: var(--font-size-body, 28rpx);
		font-weight: 600;
	}

	.buyer-popup__btn:active {
		opacity: 0.88;
		transform: scale(0.96);
	}
</style>