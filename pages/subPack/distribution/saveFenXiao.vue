<!--
  我的分销码 — 展示分销二维码 + 保存到相册
  遵循 改造标准.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值

  旧函数映射：
    data().qrCodeUrl          → const qrCodeUrl = ref('')
    onLoad(option)            → onLoad((option) => { fetchQrCode(...) })
    methods.fetchQrCode(id)   → async function fetchQrCode(id)  (改造：加 try/catch + requestLoading)
    methods.previewImage()    → function previewImage()  (逻辑不变)
    methods.saveQrCodeToPhone() → async function saveQrCodeToPhone()  (改造：showToast 替换)
    methods.showAuthModal()   → u-modal 声明式组件
-->
<template>
	<view class="savefenxiao-page" :style="$themeStyle">
		<!-- 接口请求遮罩 -->
		<RequestLoading v-if="requestLoading" text="正在生成..." />

		<!-- 二维码卡片 -->
		<view class="savefenxiao__card">
			<view class="savefenxiao__qr" @click="previewImage">
				<image class="savefenxiao__qr-img" :src="qrCodeUrl" mode="aspectFit" show-menu-by-longpress />
			</view>
			<view class="savefenxiao__desc">扫码立即购买</view>
		</view>

		<!-- 保存按钮 -->
		<view class="savefenxiao__btn" @click="saveQrCodeToPhone">
			<u-icon name="download" color="var(--color-text-on-primary)" size="20" />
			<text>保存分享码</text>
		</view>

		<!-- 权限引导弹窗 -->
		<u-modal :show="showAuthModal" title="需要相册权限" content="保存图片到相册需要您的授权，请到设置中开启相册权限。" confirmText="去设置"
			@confirm="openSetting" @cancel="showAuthModal = false" />

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
	import RequestLoading from "@/components/loading/request-loading.vue";
	import {
		useToast
	} from "@/util/toast.js";

	// ==================== 页面路由常量 ====================
	// （本页无跳转，预留结构）

	// ==================== 数据 ====================
	const qrCodeUrl = ref("");
	const requestLoading = ref(false);
	const showAuthModal = ref(false);

	// ==================== Refs ====================
	const {
		uToastRef,
		showToast
	} = useToast();

	// ==================== 生命周期 ====================
	onLoad((option) => {
		fetchQrCode(option.PersonDistributionUserID);
	});

	// ==================== 数据请求 ====================
	async function fetchQrCode(PersonDistributionUserID) {
		requestLoading.value = true;
		try {
			const openid = uni.getStorageSync("userinfo");
			const res = await uni.$myRequest({
				url: "/api/Applets/AppletsTicketPoster",
				method: "POST",
				data: {
					openId: openid?.openid || "",
					personDistributionUserID: PersonDistributionUserID,
				},
			});
			qrCodeUrl.value = res.data?.Data?.SharedCodeUrl || "";
		} catch {
			showToast("生成失败，请重试");
		} finally {
			requestLoading.value = false;
		}
	}

	// ==================== 导航辅助 ====================
	function openSetting() {
		showAuthModal.value = false;
		uni.openSetting();
	}

	// ==================== 业务方法 ====================
	function previewImage() {
		if (!qrCodeUrl.value) return;
		uni.previewImage({
			urls: [qrCodeUrl.value],
			current: qrCodeUrl.value,
		});
	}

	function saveQrCodeToPhone() {
		if (!qrCodeUrl.value) {
			showToast("二维码未生成，请稍后重试");
			return;
		}

		requestLoading.value = true;
		uni.downloadFile({
			url: qrCodeUrl.value,
			success: (res) => {
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => {
						requestLoading.value = false;
						showToast("保存成功", "success");
					},
					fail: (err) => {
						requestLoading.value = false;
						if (err.errMsg && err.errMsg.includes("auth deny")) {
							showAuthModal.value = true;
						} else {
							showToast("保存失败，请稍后重试");
						}
					},
				});
			},
			fail: () => {
				requestLoading.value = false;
				showToast("下载图片失败，请检查网络");
			},
		});
	}
</script>

<style lang="scss" scoped>
	.savefenxiao-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100vh;
		background-color: var(--color-bg);
		padding-top: 40rpx;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
	}

	/* ====== 二维码卡片 ====== */
	.savefenxiao__card {
		width: 92%;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		padding: 60rpx 40rpx 40rpx;
		box-sizing: border-box;
		margin-bottom: 60rpx;
	}

	.savefenxiao__qr {
		width: 480rpx;
		height: 480rpx;
		background-color: var(--color-primary-bg-light);
		border-radius: var(--radius-sm);
		padding: 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 2px solid var(--color-primary-border-light);
	}

	.savefenxiao__qr:active {
		transform: scale(0.97);
	}

	.savefenxiao__qr-img {
		width: 100%;
		height: 100%;
	}

	.savefenxiao__desc {
		margin-top: 36rpx;
		font-size: var(--font-size-body);
		color: var(--color-text);
		font-weight: 500;
	}

	/* ====== 保存按钮 ====== */
	.savefenxiao__btn {
		width: 80%;
		height: 96rpx;
		line-height: 96rpx;
		border-radius: var(--radius-button);
		background: var(--color-primary);
		color: var(--color-text-on-primary);
		font-size: var(--font-size-h2);
		font-weight: 600;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12rpx;
		transition: opacity 160ms ease, transform 160ms ease;
	}

	.savefenxiao__btn:active {
		opacity: 0.88;
		transform: scale(0.96);
	}
</style>