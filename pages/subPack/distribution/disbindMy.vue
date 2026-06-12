<!--
  分销主页 — 展示返利统计 + 功能入口（分销商品/流水/结账/资料）
  遵循 page-refactor-standard.md & 设计稿规范.md
-->
<template>
	<view class="dist-main" :style="$themeStyle">
		<RequestLoading v-if="requestLoading" text="加载中..." />

		<!-- 头部卡片 -->
		<view class="dist-main__header">
			<view class="dist-main__user">
				<image :src="data.FaceImgUrl" class="dist-main__avatar" mode="aspectFill" />
				<text class="dist-main__phone">{{ data.PrivatePhone }}</text>
				<view class="dist-main__cashout" @click="goCashout">提现</view>
			</view>
			<view class="dist-main__stats">
				<view class="dist-main__stat">
					<text class="dist-main__stat-num">{{ data.AlreadyRebateMoney }}</text>
					<text class="dist-main__stat-label">已结算金额</text>
				</view>
				<view class="dist-main__stat">
					<text class="dist-main__stat-num">{{ data.WaitRebateMoney }}</text>
					<text class="dist-main__stat-label">待结算金额</text>
				</view>
				<view class="dist-main__stat">
					<text class="dist-main__stat-num">{{ data.ApplyRebateMoney }}</text>
					<text class="dist-main__stat-label">结算申请中</text>
				</view>
				<view class="dist-main__stat">
					<text class="dist-main__stat-num">{{ data.MonthlyOrderNumber }}</text>
					<text class="dist-main__stat-label">本月订单数</text>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="dist-main__menu" @click="goProduct">
			<view class="dist-main__menu-icon dist-main__menu-icon--lg">
				<u-icon name="bag-fill" color="var(--color-primary)" size="36" />
			</view>
			<text class="dist-main__menu-text">分销商品</text>
			<u-icon name="arrow-right" size="20" color="var(--color-text-secondary)" />
		</view>
		<view class="dist-main__menu" style="margin-top: 50rpx" @click="goOrder">
			<view class="dist-main__menu-icon">
				<u-icon name="file-text-fill" color="var(--color-primary)" size="32" />
			</view>
			<text class="dist-main__menu-text">流水明细</text>
			<u-icon name="arrow-right" size="20" color="var(--color-text-secondary)" />
		</view>
		<view class="dist-main__menu" style="margin-top: 80rpx" @click="goRecord">
			<view class="dist-main__menu-icon">
				<u-icon name="order" color="var(--color-primary)" size="32" />
			</view>
			<text class="dist-main__menu-text">结账记录</text>
			<u-icon name="arrow-right" size="20" color="var(--color-text-secondary)" />
		</view>
		<view class="dist-main__menu" style="margin-top: 80rpx" @click="goFenxiao">
			<view class="dist-main__menu-icon">
				<u-icon name="moments-circel-fill" color="var(--color-primary)" size="32" />
			</view>
			<text class="dist-main__menu-text">我的分销码</text>
			<u-icon name="arrow-right" size="20" color="var(--color-text-secondary)" />
		</view>
		<view class="dist-main__menu" style="margin-top: 80rpx" @click="goProfile">
			<view class="dist-main__menu-icon">
				<u-icon name="account-fill" color="var(--color-primary)" size="32" />
			</view>
			<text class="dist-main__menu-text">我的资料</text>
			<u-icon name="arrow-right" size="20" color="var(--color-text-secondary)" />
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import RequestLoading from "@/components/loading/request-loading.vue";

	const data = reactive({
		FaceImgUrl: "",
		PrivatePhone: "",
		AlreadyRebateMoney: 0,
		WaitRebateMoney: 0,
		ApplyRebateMoney: 0,
		MonthlyOrderNumber: 0,
		PersonDistributionUserID: "",
	});
	const requestLoading = ref(false);

	onLoad(() => {
		fetchData();
	});

	async function fetchData() {
		requestLoading.value = true;
		try {
			const openid = uni.getStorageSync("userinfo");
			const res = await uni.$myRequest({
				url: "/api/Applets/AppletsPersonDistributorMain",
				method: "POST",
				data: {
					OpenId: openid?.openid || ""
				},
			});
			Object.assign(data, res.data?.Data || {});
		} catch (err) {
			console.error("[disbindMy] err:", err);
		} finally {
			requestLoading.value = false;
		}
	}

	function goCashout() {
		uni.navigateTo({
			url: "/pages/subPack/distribution/finticer"
		});
	}

	function goProduct() {
		uni.navigateTo({
			url: `/pages/subPack/distribution/findshor?PersonDistributionUserID=${data.PersonDistributionUserID}`,
		});
	}

	function goOrder() {
		uni.navigateTo({
			url: `/pages/subPack/distribution/disorde?PersonDistributionUserID=${data.PersonDistributionUserID}`,
		});
	}

	function goRecord() {
		uni.navigateTo({
			url: `/pages/subPack/distribution/finUind?PersonDistributionUserID=${data.PersonDistributionUserID}`,
		});
	}

	function goFenxiao() {
		uni.navigateTo({
			url: `/pages/subPack/distribution/saveFenXiao?PersonDistributionUserID=${data.PersonDistributionUserID}`,
		});
	}

	function goProfile() {
		uni.navigateTo({
			url: "/pages/subPack/distribution/myDist"
		});
	}
</script>

<style lang="scss" scoped>
	.dist-main {
		min-height: 100vh;
		background-color: var(--color-bg);
		padding-bottom: 40rpx;
	}

	// Header
	.dist-main__header {
		width: 95%;
		margin: 0 auto;
		background: var(--color-primary);
		border-radius: 20rpx;
		overflow: hidden;
	}

	.dist-main__user {
		display: flex;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding: 20rpx;
	}

	.dist-main__avatar {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
	}

	.dist-main__phone {
		flex: 1;
		color: var(--color-text-on-primary);
		font-size: var(--font-size-body, 28rpx);
		margin-left: 20rpx;
	}

	.dist-main__cashout {
		border: 1px solid rgba(255, 255, 255, 0.6);
		border-radius: 15rpx;
		padding: 14rpx 30rpx;
		color: var(--color-text-on-primary);
		font-size: 28rpx;
		transition:
			opacity 160ms ease,
			transform 160ms ease;
	}

	.dist-main__cashout:active {
		opacity: 0.88;
		transform: scale(0.96);
	}

	.dist-main__stats {
		display: flex;
		padding: 20rpx 0;
	}

	.dist-main__stat {
		flex: 1;
		text-align: center;
	}

	.dist-main__stat-num {
		display: block;
		font-size: var(--font-size-h2, 30rpx);
		font-weight: 700;
		color: var(--color-text-on-primary);
	}

	.dist-main__stat-label {
		display: block;
		font-size: var(--font-size-caption, 24rpx);
		color: rgba(255, 255, 255, 0.7);
		margin-top: 16rpx;
	}

	// Menu
	.dist-main__menu {
		display: flex;
		align-items: center;
		width: 95%;
		margin: 30rpx auto 0;
		position: relative;
		transition: opacity 160ms ease;
	}

	.dist-main__menu:active {
		opacity: 0.88;
	}

	.dist-main__menu-icon {
		width: 80rpx;
		height: 80rpx;
		margin-left: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-primary-bg-light);
		border-radius: 50%;
	}

	.dist-main__menu-icon--lg {
		width: 100rpx;
		height: 100rpx;
		margin-left: 30rpx;
	}

	.dist-main__menu-text {
		flex: 1;
		font-weight: 600;
		font-size: var(--font-size-h2, 30rpx);
		margin-left: 50rpx;
		color: var(--color-text);
	}
</style>