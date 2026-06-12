<template>
	<!-- 商户筛选下拉组件 -->
	<view class="ren-dropdown">
		<view class="ren-dropdown__trigger" @click="showMenu = !showMenu">
			<text class="ren-dropdown__label">{{ selectedText }}</text>
			<u-icon
				:name="showMenu ? 'arrow-up' : 'arrow-down'"
				size="12"
				color="var(--color-text-secondary)"
			/>
		</view>
		<view v-if="showMenu" class="ren-dropdown__mask" @click="showMenu = false" />
		<view v-if="showMenu" class="ren-dropdown__menu">
			<view
				v-for="(item, index) in flatList"
				:key="index"
				class="ren-dropdown__item"
				:class="{ 'ren-dropdown__item--active': currentIndex === index }"
				@click="selectItem(item, index)"
			>
				<text>{{ item.text }}</text>
				<u-icon v-if="currentIndex === index" name="checkmark" size="16" color="var(--color-primary)" />
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, watch } from 'vue'

	const props = defineProps({
		filterData: { type: Array, default: () => [[]] },
		defaultIndex: { type: Array, default: () => [0] },
	})

	const emit = defineEmits(['onSelected'])

	const showMenu = ref(false)
	const currentIndex = ref(props.defaultIndex[0] || 0)

	const flatList = computed(() => {
		return (props.filterData[0] || []).map((item, idx) => ({
			...item,
			_index: idx,
		}))
	})

	const selectedText = computed(() => {
		const item = flatList.value[currentIndex.value]
		return item ? item.text : '请选择商户'
	})

	function selectItem(item, index) {
		currentIndex.value = index
		showMenu.value = false
		emit('onSelected', [[{ value: item.value, text: item.text, CompanyID: item.CompanyID, ScenicID: item.ScenicID }]])
	}
</script>

<style lang="scss" scoped>
	.ren-dropdown {
		position: relative;
		z-index: 20;
	}

	.ren-dropdown__trigger {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 24rpx;
		background-color: var(--color-bg);
		border-radius: var(--radius-sm);
		border: 1rpx solid var(--color-border-light);

		&:active {
			opacity: 0.8;
		}
	}

	.ren-dropdown__label {
		font-size: 14px;
		color: var(--color-text);
	}

	.ren-dropdown__mask {
		position: fixed;
		inset: 0;
		z-index: 10;
		background-color: rgba(0, 0, 0, 0.15);
	}

	.ren-dropdown__menu {
		position: absolute;
		top: calc(100% + 8rpx);
		left: 0;
		right: 0;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-modal);
		overflow: hidden;
		z-index: 21;
		max-height: 400rpx;
		overflow-y: auto;
	}

	.ren-dropdown__item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 24rpx;
		font-size: 14px;
		color: var(--color-text);
		border-bottom: 1rpx solid var(--color-border-light);

		&:last-child {
			border-bottom: none;
		}

		&:active {
			background-color: var(--color-primary-bg-light);
		}

		&--active {
			color: var(--color-primary);
		}
	}
</style>
