<!--
  会员卡券详情页 — 展示会员套餐中各票券的二维码
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(option) + fetchMemberPackageDetail()
              change → onChange / open → onOpen / close → onClose
-->
<template>
  <view class="members-page" :style="$themeStyle">
    <!-- 骨架屏加载 -->
    <view v-if="!pageReady" class="members-page__skeleton">
      <view class="skeleton-item" v-for="i in 4" :key="i">
        <view class="skeleton-line skeleton-line--title" />
        <view class="skeleton-line skeleton-line--arrow" />
      </view>
    </view>

    <template v-else>
      <Kong v-if="memberLis.length === 0" text="暂无卡包" />
      <view class="members-page__collapse" v-else>
        <u-collapse
          accordion
          @change="onChange"
          @close="onClose"
          @open="onOpen"
        >
          <u-collapse-item
            v-for="(item, index) in memberLis"
            :key="index"
            :title="item.ItemName"
          >
            <view
              class="members-page__qrcode"
              @click="
                showQrcode = true;
                currentQrcode = item.TicketCode;
              "
            >
              <u-qrcode
                v-if="activeIndex == index && collapseStatus === 'open'"
                cid="qrcode"
                :val="item.TicketCode"
                :size="120"
              />
            </view>
          </u-collapse-item>
        </u-collapse>
      </view>
    </template>

    <!-- 二维码放大弹窗 -->
    <u-popup
      :show="showQrcode"
      mode="center"
      round="20"
      closeable
      @close="showQrcode = false"
    >
      <view class="popup-qrcode">
        <u-qrcode
          v-if="showQrcode"
          cid="bigQrcode"
          :val="currentQrcode"
          :size="240"
        />
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
// （当前页无跳转需求，预留扩展）

// ==================== 数据 ====================
const memberLis = ref([]);
const activeIndex = ref("");
const collapseStatus = ref("");
const pageReady = ref(false);
const showQrcode = ref(false);
const currentQrcode = ref("");

// ==================== Refs ====================
// （当前页无 DOM 引用需求，预留扩展）

// ==================== 生命周期 ====================
onLoad((option) => {
  fetchMemberPackageDetail(option);
});

// ==================== 数据请求 ====================

/** 获取会员套餐详情（票券列表） */
async function fetchMemberPackageDetail(option) {
  try {
    const openid = uni.getStorageSync("userinfo");
    const res = await uni.$myRequest({
      url: "/api/Applets/AppletsMemberPackageDetail",
      method: "POST",
      data: {
        openId: openid.openid,
        memberID: option.number,
        type: option.type,
      },
    });
    memberLis.value = res.data.Data || [];
  } catch (err) {
    console.error("[members] 获取套餐详情失败:", err);
  } finally {
    pageReady.value = true;
  }
}

// ==================== 导航辅助 ====================
// （当前页无导航需求，预留扩展）

// ==================== 业务方法 ====================

function onOpen(e) {
  collapseStatus.value = "open";
}

function onClose(e) {
  collapseStatus.value = "close";
}

function onChange(e) {
  (e || []).forEach((item) => {
    if (item.status === "open") {
      activeIndex.value = item.name;
      collapseStatus.value = item.status;
    }
  });
}
</script>

<style lang="scss" scoped>
/* ============================================================
   会员卡券详情页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.members-page__xxx
   ============================================================ */

.members-page {
  min-height: 100vh;
  background-color: var(--color-bg);
}

// ==================== 骨架屏 ====================
.members-page__skeleton {
  padding: 24rpx;
}
.skeleton-item {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
}
.skeleton-line {
  height: 28rpx;
  background: var(--color-skeleton-base);
  border-radius: var(--skeleton-radius);
}
.skeleton-line--title {
  flex: 1;
}
.skeleton-line--arrow {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-left: 16rpx;
}

.members-page__collapse {
  padding: 0;
}

.members-page__qrcode {
  text-align: center;
  margin: 0 auto;
  height: 250rpx;
  width: 340rpx;

  canvas {
    height: 100%;
    width: 100%;
    position: relative !important;
    left: 70rpx !important;
  }
}

// ==================== 二维码放大弹窗 ====================
.popup-qrcode {
  text-align: center;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 48rpx;
}
.popup-qrcode__tip {
  display: block;
  margin-top: 24rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
}
</style>
