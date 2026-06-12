<!--
  补录人脸页 — 为票码订单录入人脸照片
  遵循 page-refactor-standard.md & 设计稿规范.md
  跟随全局主题动态切换

  旧函数映射：
    onLoad                    → onLoad + fetchFaceInfo
    tikeFace                  → handleSubmit
    paizhao                   → handleTakePhoto
    chooseImage               → chooseImage (保留)
    compressSelectedImage     → compressImage (保留)
    uploadCompressedImage     → uploadImage (保留)
    getImageInfo              → getImageInfo (保留)
-->
<template>
	<view class="face-page" :style="$themeStyle">
		<RequestLoading v-if="requestLoading" text="加载中..." />

		<!-- 订单信息头 -->
		<view class="face-card" v-if="faceList.length">
			<view class="face-card__header">
				<text class="face-card__name">{{ faceList[0].TicketName }}</text>
				<text class="face-card__count">X {{ faceList[0].OTATickeTcodeFaceList.length }}</text>
			</view>
			<text class="face-card__pending">待录人脸：{{ faceList[0].WaitFaceNumber * faceList.length }}</text>
		</view>

		<!-- 人脸录入列表 -->
		<view class="face-card face-card--entry" v-for="(group, gIdx) in faceList[0].OTATickeTcodeFaceList" :key="gIdx">
			<view class="face-card__section-title">
				<text class="face-card__dot" />
				<text>票码人脸录入 ({{ faceList[0].TicketName }} {{ gIdx + 1 }})</text>
			</view>
			<view class="face-card__photos">
				<view class="face-card__photo" v-for="(face, fIdx) in group.OTATickeTcodeFaceList" :key="fIdx"
					@click="handleTakePhoto(face, fIdx)">
					<image class="face-card__photo-img" :src="face.FaceUrl || face.imSrc || defaultFace"
						mode="aspectFill" />
				</view>
			</view>
		</view>

		<!-- 提交按钮 -->
		<view class="face-page__submit" :class="{ 'face-page__submit--disabled': submitting }" @click="handleSubmit">
			<u-loading-icon v-if="submitting" mode="circle" size="18" color="var(--color-text-on-primary)" />
			<text>{{ submitting ? "提交中..." : "提交" }}</text>
		</view>

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

	const {
		uToastRef,
		showToast
	} = useToast();

	// ==================== 常量 ====================
	const defaultFace = "https://cdn.huibaitech.com/qrcode/public/defaultface.png";

	// ==================== 数据 ====================
	const faceList = ref([]);
	const requestLoading = ref(false);
	const submitting = ref(false);
	const isUploading = ref(false);

	// ==================== 数据请求 ====================
	async function fetchFaceInfo(orderCode) {
		requestLoading.value = true;
		try {
			const openid = uni.getStorageSync("userinfo");
			const res = await uni.$myRequest({
				url: "/api/Applets/GetTicketToFace",
				method: "POST",
				data: {
					openId: openid?.openid || "",
					Code: orderCode
				},
			});
			if (res.data?.Code === 200) {
				faceList.value = res.data.Data || [];
				// 设置默认占位图
				faceList.value[0]?.OTATickeTcodeFaceList?.forEach((group) => {
					group.OTATickeTcodeFaceList?.forEach((face) => {
						face.imSrc = defaultFace;
					});
				});
			}
		} catch (err) {
			console.error("[redBokd] fetch err:", err);
		} finally {
			requestLoading.value = false;
		}
	}

	onLoad((options) => {
		fetchFaceInfo(options?.order || "");
	});

	// ==================== 业务方法 ====================
	async function handleSubmit() {
		if (submitting.value) return;
		submitting.value = true;
		try {
			const res = await uni.$myRequest({
				url: "/api/Applets/UploadTicketToFace",
				method: "POST",
				data: faceList.value[0],
			});
			if (res.data?.Code === 200) {
				showToast("提交成功");
				setTimeout(() => {
					uni.reLaunch({
						url: "/pages/index/index"
					});
				}, 2000);
			} else {
				showToast(res.data.Message);
			}
		} catch (err) {
			console.error("[redBokd] submit err:", err);
			showToast("提交失败，请重试");
		} finally {
			submitting.value = false;
		}
	}

	async function handleTakePhoto(face) {
		if (face.FaceUploadFlag === 1) {
			showToast("已经上传过照片了");
			return;
		}
		if (isUploading.value) return;
		isUploading.value = true;
		try {
			const tempFilePath = await chooseImage();
			if (!tempFilePath) return;
			const compressedPath = await compressImage(tempFilePath);
			await uploadImage(compressedPath, face);
		} catch (err) {
			console.error("[redBokd] upload err:", err);
			showToast(err.message || "上传失败");
		} finally {
			isUploading.value = false;
		}
	}

	// ==================== 图片工具 ====================
	function chooseImage() {
		return new Promise((resolve, reject) => {
			const isAndroid = uni.getSystemInfoSync().platform === "android";
			uni.chooseImage({
				count: 1,
				sourceType: ["camera", "album"],
				sizeType: isAndroid ? ["compressed"] : ["original"],
				quality: isAndroid ? 0.8 : 1.0,
				success: (res) => resolve(res.tempFilePaths[0]),
				fail: (err) => {
					reject(
						new Error(err.errMsg?.includes("cancel") ? "已取消选择" : "选图失败"),
					);
				},
			});
		});
	}

	function compressImage(tempPath) {
		return new Promise(async (resolve, reject) => {
			try {
				const systemInfo = uni.getSystemInfoSync();
				const isAndroid = systemInfo.platform === "android";
				if (isAndroid && (!tempPath || !tempPath.includes("tmp"))) {
					reject(new Error("安卓端图片路径不合法"));
					return;
				}
				let imageInfo = {
					width: 800,
					height: 600
				};
				try {
					imageInfo = await getImageInfo(tempPath);
				} catch (e) {
					console.warn("[redBokd] getImageInfo fallback:", e);
				}
				const compressParams = {
					src: tempPath,
					quality: isAndroid ? 0.6 : 0.4,
				};
				if (isAndroid) {
					const maxWidth = 800;
					const w = Math.floor(
						imageInfo.width > maxWidth ? maxWidth : imageInfo.width,
					);
					const h = Math.floor(imageInfo.height * (w / imageInfo.width));
					compressParams.width = w;
					compressParams.height = h;
				}
				uni.compressImage({
					...compressParams,
					success: (res) => resolve(res.tempFilePath),
					fail: (err) => {
						console.error("[redBokd] compress fail:", err);
						resolve(tempPath);
					},
				});
			} catch (err) {
				resolve(tempPath);
			}
		});
	}

	function uploadImage(filePath, face) {
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: "https://saasapp.huibaitech.com/api/Applets/UploadTicketFaceImg",
				filePath,
				header: {
					AppID: uni.getAccountInfoSync().miniProgram.appId
				},
				name: "file",
				formData: {
					user: "test"
				},
				success: (res) => {
					if (res.statusCode === 200) {
						const result = JSON.parse(res.data);
						face.FaceUrl = result.Data?.ImgUrl || "";
						showToast("上传成功");
						resolve(result);
					} else {
						reject(new Error("服务器返回异常"));
					}
				},
				fail: (err) => {
					reject(new Error("上传失败：" + err.errMsg));
				},
			});
		});
	}

	function getImageInfo(tempPath) {
		return new Promise((resolve, reject) => {
			uni.getImageInfo({
				src: tempPath,
				timeout: 5000,
				success: resolve,
				fail: reject,
			});
		});
	}
</script>

<style lang="scss" scoped>
	.face-page {
		min-height: 100vh;
		background-color: var(--color-bg);
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	}

	/* ====== 卡片 ====== */
	.face-card {
		background: var(--color-bg-card);
		margin: 20rpx;
		padding: 20rpx;
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
	}

	.face-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1px solid var(--color-border-light);
		font-size: var(--font-size-body, 28rpx);
	}

	.face-card__name {
		color: var(--color-text);
	}

	.face-card__count {
		color: var(--color-text-secondary);
	}

	.face-card__pending {
		display: block;
		padding-top: 20rpx;
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-secondary);
	}

	/* ====== 录入条目 ====== */
	.face-card--entry {
		margin-top: 0;
	}

	.face-card__section-title {
		display: flex;
		align-items: center;
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
		margin-bottom: 20rpx;
	}

	.face-card__dot {
		display: inline-block;
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: var(--color-primary);
		margin-right: 10rpx;
		flex-shrink: 0;
	}

	.face-card__photos {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.face-card__photo {
		width: 210rpx;
		height: 200rpx;
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-sm);
		overflow: hidden;
		transition:
			opacity 160ms ease,
			transform 160ms ease;
	}

	.face-card__photo:active {
		opacity: 0.88;
		transform: scale(0.96);
	}

	.face-card__photo-img {
		width: 100%;
		height: 100%;
	}

	/* ====== 提交按钮 ====== */
	.face-page__submit {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		margin: 40rpx;
		height: 80rpx;
		border-radius: var(--radius-button);
		background: var(--color-primary);
		color: var(--color-text-on-primary);
		font-size: var(--font-size-body, 28rpx);
		font-weight: 600;
		transition:
			opacity 160ms ease,
			transform 160ms ease;
	}

	.face-page__submit:active {
		opacity: 0.88;
		transform: scale(0.96);
	}

	.face-page__submit--disabled {
		opacity: 0.6;
		transform: none;
	}
</style>