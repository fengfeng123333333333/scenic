<!--
  f-parse — 富文本渲染组件
  ==========================================
  替代 u-parse，使用 v-html 渲染 HTML 内容。
  统一处理图片、段落、表格等元素的样式。
  
  用法：<f-parse :content="htmlString" />
-->

<template>
  <view class="f-parse" v-html="content"></view>
</template>

<script setup>
defineProps({
  /** HTML 内容字符串 */
  content: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
.f-parse {
  font-size: var(--font-size-body, 28rpx);
  color: var(--color-text);
  line-height: 1.75;
  word-break: break-all;
  overflow-wrap: break-word;

  /* 图片自适应 */
  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16rpx 0;
    border-radius: var(--radius-sm, 16rpx);
  }

  /* 段落间距 */
  :deep(p) {
    margin-bottom: 12rpx;
  }

  /* 表格横向滚动（防止撑破容器） */
  :deep(table) {
    max-width: 100%;
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-collapse: collapse;
  }

  :deep(td),
  :deep(th) {
    padding: 8rpx 16rpx;
    border: 1rpx solid var(--color-border-light);
    word-break: break-all;
  }

  /* 链接 */
  :deep(a) {
    color: var(--color-primary);
    word-break: break-all;
  }

  /* 视频等嵌入元素 */
  :deep(iframe),
  :deep(video),
  :deep(embed) {
    max-width: 100%;
  }
}
</style>
