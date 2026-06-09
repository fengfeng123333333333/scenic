<template>
	<u-toast :ref="registerToastRef" />
</template>

<script setup>
	import {
		onLaunch,
		onShow,
		onHide,
		onPageNotFound
	} from "@dcloudio/uni-app";
	import {
		initTheme
	} from "@/styles/themes.js";
	import {
		registerToastRef
	} from "@/util/toast.js";

	// ==================== 应用启动 ====================
	onLaunch((options) => {
		initTheme();

		// 版本更新检测
		const updateManager = uni.getUpdateManager();
		updateManager.onCheckForUpdate((res) => {
			if (res.hasUpdate) {
				uni.showModal({
					content: "新版本已经准备好，是否重启应用？",
					showCancel: false,
					confirmText: "确定",
					success: (res) => {
						if (res.confirm)
							updateManager.onUpdateReady(() => updateManager.applyUpdate());
					},
				});
			}
		});
		updateManager.onUpdateFailed(() => {
			uni.showModal({
				content: "下载失败，请删除当前小程序后重新打开",
				showCancel: false,
				confirmText: "知道了",
			});
		});
	});

	// ==================== 进入前台 ====================
	onShow((options) => {
		// 静默登录
		console.log("optionsoptionsoptions", options)
		if (!uni.getStorageSync("userinfo")) {
			uni.login({
				provider: "weixin",
				success: async (loginRes) => {
					const res = await uni.$myRequest({
						url: "/api/Applets/AppletsLogin",
						method: "POST",
						data: {
							code: loginRes.code
						},
					});
					uni.setStorage({
						key: "userinfo",
						data: res.data?.Data || {}
					});
				},
			});
		}

		// 支付页面返回 → 跳转首页订单 Tab
		if (options?.referrerInfo?.appId) {
			if (uni.getStorageSync("skipAutoJump") === "1") return;
			const paymentPaths = [
				"pages/payment/payment",
				"pages/menber/recharge",
				"pages/reserve/resMenber",
			];
			const target = paymentPaths.includes(options.path) ?
				"/pages/index/index?tab=1" :
				"/pages/index/index";
			uni.reLaunch({
				url: target
			});
		}
	});

	// ==================== 路由兜底 ====================
	onPageNotFound((res) => {
		uni.setStorageSync("skipAutoJump", "1");
		uni.reLaunch({
			url: "/pages/index/index"
		});
	});

	// ==================== 进入后台 ====================
	onHide(() => {
		// 预留
	});
</script>

<style lang="scss">
	@import "uview-plus/index.scss";

	/* #ifdef H5 */
	@font-face {
		font-family: 'uicon-iconfont';
		src: url('https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf') format('truetype');
		font-display: swap;
	}

	/* #endif */

	/* ====== 全局复用的数量选择器按钮样式 ====== */
	.num-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-primary);
		color: var(--color-text-on-primary);
		border-radius: var(--radius-sm);
		font-size: 36rpx;
		font-weight: 600;
		line-height: 1;
	}

	.num-btn:active {
		opacity: 0.8;
		transform: scale(0.92);
	}

	.num-input {
		min-width: 80rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 600;
		color: var(--color-text);
	}
</style>