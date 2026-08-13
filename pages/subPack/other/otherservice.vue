<!--
  协议/服务条款展示页 — 通过 u-parse 渲染后台富文本协议内容
  遵循 改造标准.md & 设计稿规范.md
  跟随全局主题动态切换（:style="$themeStyle"）

  旧函数映射：
    data().list   → content (ref)        存储协议富文本
    data().strName→ strName (ref)         存储导航标题
    onLoad(option)→ onLoad + fetchProtocol 解析参数 + 请求
    this.$myRequest → uni.$myRequest（封装在 fetchProtocol）
-->
<template>
	<view class="protocol-page" :style="$themeStyle">
		<!-- 加载中遮罩 -->
		<RequestLoading v-if="requestLoading" text="加载中..." />

		<!-- 导航栏 -->
		<u-navbar :title="strName" :placeholder="true" :autoBack="true" />

		<!-- 协议内容区 -->
		<view class="protocol-page__body">
			<u-parse :content="content" />
		</view>
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

	// ==================== 数据 ====================
	const strName = ref("");
	const content = ref("");
	const requestLoading = ref(false);

	// ==================== 数据请求 ====================
	async function fetchProtocol() {
		requestLoading.value = true;
		try {
			const appId = uni.getAccountInfoSync().miniProgram.appId;
			const res = await uni.$myRequest({
				url: `/api/Applets/AppletsProtocolInfo?AppID=${appId}&Type=3`,
				method: "POST",
			});
			content.value = res.data?.Data?.ProtocolContent || "";
		} catch (err) {
			console.error("[otherservice] fetch err:", err);
		} finally {
			requestLoading.value = false;
		}
	}

	// ==================== 生命周期 ====================
	onLoad((options) => {
		strName.value = options?.str || "";
		fetchProtocol();
	});
</script>

<style lang="scss" scoped>
	.protocol-page {
		min-height: 100vh;
		background-color: var(--color-bg);
	}

	.protocol-page__body {
		padding: 24rpx;
	}
</style>