<!--
  会员卡首页 — 展示会员卡余额/积分/优惠券概览及次数卡/时效卡入口
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(option) + fetchMemberPackage()
              munber → goToMembers
-->
<template>
	<view class="car-page" :style="$themeStyle">
		<!-- 加载态 -->
		<PageLoading v-if="!pageReady" />

		<template v-else>
			<!-- 头部信息卡 -->
			<view class="car-page__header">
				<image class="car-page__header-texture" src="https://cdn.huibaitech.com/qrcode/public/1_94_9.png"
					mode="aspectFill" />
				<image class="car-page__avatar" :src="memberInfo.FaceImgUrl" mode="aspectFill" />
				<text class="car-page__member-name">
					{{ memberInfo.MemberName }}
				</text>
			</view>

			<!-- 数据概览 -->
			<view class="car-page__stats">
				<view class="car-page__stat">
					<text class="car-page__stat-value">{{ memberInfo.CardMoney }}</text>
					<text class="car-page__stat-label">余额</text>
				</view>
				<view class="car-page__stat">
					<text class="car-page__stat-value">{{ memberInfo.Point }}</text>
					<text class="car-page__stat-label">积分</text>
				</view>
				<view class="car-page__stat">
					<text class="car-page__stat-value">{{
            memberInfo.MyCouponNumber
          }}</text>
					<text class="car-page__stat-label">优惠券</text>
				</view>
			</view>

			<!-- 卡券入口 -->
			<view class="car-page__actions">
				<view class="car-page__action" @click="goToMembers(0)">
					<!-- <image
            class="car-page__action-icon"
            src="../../static/资料.png"
            mode="aspectFit"
          /> -->
					<text class="car-page__action-text">次数卡</text>
					<text class="car-page__action-extra">剩余{{ memberInfo.MyCountPackage }}次数卡</text>
				</view>
				<view class="car-page__action" @click="goToMembers(1)">
					<!-- <image
            class="car-page__action-icon"
            src="../../static/资料.png"
            mode="aspectFit"
          /> -->
					<text class="car-page__action-text">时效卡</text>
					<text class="car-page__action-extra">剩余{{ memberInfo.MyTimePackage }}时效卡</text>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import PageLoading from "@/components/loading/page-loading.vue";

	// ==================== 页面路由常量 ====================
	const PAGE_ROUTES = {
		members: "/pages/menber/members",
	};

	// ==================== 数据 ====================
	const memberInfo = ref({});
	const memberNumber = ref("");
	const pageReady = ref(false);

	// ==================== Refs ====================
	// （当前页无 DOM 引用需求，预留扩展）

	// ==================== 生命周期 ====================
	onLoad((option) => {
		memberNumber.value = option.number || "";
		fetchMemberPackage();
	});

	// ==================== 数据请求 ====================

	/** 获取会员卡套餐信息 */
	async function fetchMemberPackage() {
		try {
			const openid = uni.getStorageSync("userinfo");
			const res = await uni.$myRequest({
				url: "/api/Applets/AppletsMemberPackage",
				data: {
					openId: openid.openid,
					memberID: memberNumber.value,
				},
				method: "POST",
			});
			memberInfo.value = res.data.Data || {};
		} catch (err) {
			console.error("[car] 获取会员信息失败:", err);
		} finally {
			pageReady.value = true;
		}
	}

	// ==================== 导航辅助 ====================

	/** 跳转到会员卡券详情页 */
	function goToMembers(type) {
		uni.navigateTo({
			url: `${PAGE_ROUTES.members}?number=${memberNumber.value}&type=${type}`,
		});
	}

	// ==================== 业务方法 ====================
	// （当前页无额外交互方法，预留扩展）
</script>

<style lang="scss" scoped>
	/* ============================================================
   会员卡首页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.car-page__xxx
   ============================================================ */

	.car-page {
		min-height: 100vh;
		background-color: var(--color-bg);
	}

	/* 头部 */
	.car-page__header {
		position: relative;
		height: 300rpx;
		background-image: linear-gradient(135deg,
				var(--color-primary),
				var(--color-primary-dark));
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.car-page__header-texture {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0.5;
		pointer-events: none;
	}

	.car-page__avatar {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.4);
	}

	.car-page__member-name {
		color: var(--color-text-on-primary);
		border: 1rpx solid rgba(255, 255, 255, 0.6);
		padding: 6rpx 24rpx;
		border-radius: var(--radius-sm, 16rpx);
		display: inline-block;
		margin-top: 20rpx;
		font-size: var(--font-size-caption, 24rpx);
	}

	/* 数据概览 */
	.car-page__stats {
		margin: 20rpx;
		display: flex;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card, 28rpx);
		box-shadow: var(--shadow-soft);
		padding: 32rpx 0;
	}

	.car-page__stat {
		flex: 1;
		text-align: center;
	}

	.car-page__stat-value {
		display: block;
		font-size: var(--font-size-h2, 30rpx);
		font-weight: 600;
		color: var(--color-secondary);
	}

	.car-page__stat-label {
		display: block;
		margin-top: 12rpx;
		font-size: var(--font-size-caption, 24rpx);
		color: var(--color-text-secondary);
	}

	/* 卡券入口 */
	.car-page__actions {
		background-color: var(--color-bg-card);
		margin: 0 20rpx;
		border-radius: var(--radius-card, 28rpx);
		box-shadow: var(--shadow-soft);
		overflow: hidden;
	}

	.car-page__action {
		display: flex;
		align-items: center;
		padding: 28rpx 24rpx;
		border-bottom: 1rpx solid var(--color-border-light);
	}

	.car-page__action:last-child {
		border-bottom: none;
	}

	.car-page__action:active {
		background-color: var(--color-primary-bg-light);
	}

	.car-page__action-icon {
		width: 50rpx;
		height: 50rpx;
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.car-page__action-text {
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
		flex-shrink: 0;
	}

	.car-page__action-extra {
		margin-left: auto;
		font-size: var(--font-size-caption, 24rpx);
		color: var(--color-text-secondary);
	}
</style>