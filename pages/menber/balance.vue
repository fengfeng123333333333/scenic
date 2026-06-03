<!--
  会员流水页 — 展示余额/赠金/积分/扣次流水明细
  遵循 page-refactor-standard.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  旧函数映射：onLoad → onLoad(option) + fetchFlow()
              actiTick → onTabChange / dame → fetchUseTicketFlow / detailed → fetchAccountFlow
-->
<template>
  <view class="balance-page" :style="$themeStyle">
    <!-- 加载态 -->
    <PageLoading v-if="!pageReady" />

    <template v-else>
      <!-- Tab 切换 -->
      <f-tabs
        v-model="activeTab"
        :tabs="tabList"
        :scroll="false"
        lineColor="var(--color-primary)"
        activeColor="var(--color-primary)"
        @change="onTabChange"
      />

      <!-- 账户流水列表（Tab 0/1/2） -->
      <view
        v-for="(item, index) in orderList"
        :key="'a' + index"
        class="balance-page__item"
        v-show="activeTab !== 3"
      >
        <view class="balance-page__row">
          <text class="balance-page__label">
            {{ item.ChangeReason }}({{ item.AccountTypeDesc }})
          </text>
          <text
            class="balance-page__amount"
            :class="getAmountClass(item.ChangeMoneyText)"
          >
            {{ item.ChangeMoneyText }}
          </text>
        </view>
        <view class="balance-page__row balance-page__row--secondary">
          <text class="balance-page__label">
            {{ item.CreateOn }}
          </text>
          <text class="balance-page__amount">
            {{ item.AfterMoney }}
          </text>
        </view>
      </view>

      <!-- 扣次流水列表（Tab 3） -->
      <view
        v-for="(item, index) in orderList"
        :key="'b' + index"
        class="balance-page__item"
        v-show="activeTab === 3"
      >
        <view class="balance-page__row">
          <text class="balance-page__label">
            {{ item.TicketName }}
          </text>
          <text class="balance-page__amount balance-page__amount--highlight">
            消费次数:{{ item.Retractable }}
          </text>
        </view>
        <view class="balance-page__row balance-page__row--secondary">
          <text class="balance-page__label">
            {{ item.CreateOn }}
          </text>
          <text class="balance-page__amount">
            撤销次数:{{ item.ReturnNumber }}
          </text>
        </view>
      </view>

      <!-- 空状态 -->
      <Kong v-if="orderList.length === 0" text="暂无流水记录" />
    </template>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageLoading from "@/components/loading/page-loading.vue";
import Kong from "@/components/kong/kong.vue";

// ==================== 页面路由常量 ====================
// （当前页无跳转需求，预留扩展）

// ==================== 数据 ====================
const tabList = ["余额流水", "赠金流水", "积分流水", "扣次流水"];
const activeTab = ref(0);
const orderList = ref([]);
const memberId = ref(0);
const pageReady = ref(false);

// ==================== Refs ====================
// （当前页无 DOM 引用需求，预留扩展）

// ==================== 生命周期 ====================
onLoad((option) => {
  memberId.value = option.menber || 0;
  fetchFlow();
});

// ==================== 数据请求 ====================

/** 根据当前 Tab 获取流水数据 */
async function fetchFlow() {
  try {
    if (activeTab.value === 3) {
      await fetchUseTicketFlow();
    } else {
      await fetchAccountFlow();
    }
  } finally {
    pageReady.value = true;
  }
}

/** 获取账户流水（余额/赠金/积分） */
async function fetchAccountFlow() {
  const openid = uni.getStorageSync("userinfo");
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetMemberAccountFlow",
    data: {
      openId: openid.openid,
      memberID: memberId.value,
      accountType: activeTab.value,
    },
    method: "POST",
  });
  orderList.value = res.data.Data || [];
}

/** 获取扣次流水 */
async function fetchUseTicketFlow() {
  const openid = uni.getStorageSync("userinfo");
  const res = await uni.$myRequest({
    url: "/api/Applets/AppletsGetMemberUseTicketFlow",
    data: {
      openId: openid.openid,
      memberID: memberId.value,
      accountType: activeTab.value,
    },
    method: "POST",
  });
  orderList.value = res.data.Data || [];
}

// ==================== 导航辅助 ====================
// （当前页无导航需求，预留扩展）

// ==================== 业务方法 ====================

/** Tab 切换 */
function onTabChange(index) {
  activeTab.value = index;
  orderList.value = [];
  fetchFlow();
}

/** 根据金额正负返回颜色类名 */
function getAmountClass(val) {
  if (val == null) return "";
  const str = String(val);
  if (str.startsWith("+")) return "balance-page__amount--income";
  if (str.startsWith("-")) return "balance-page__amount--expense";
  const num = Number(val);
  if (!isNaN(num)) {
    if (num > 0) return "balance-page__amount--income";
    if (num < 0) return "balance-page__amount--expense";
  }
  return "";
}
</script>

<style lang="scss" scoped>
/* ============================================================
   会员流水页 — 遵循设计稿规范.md
   使用 var(--color-*) 主题变量，支持多主题切换
   BEM 命名：.balance-page__xxx
   ============================================================ */

.balance-page {
  min-height: 100vh;
  background-color: var(--color-bg-card);
}

.balance-page__item {
  border-bottom: 1px solid var(--color-border-light);
  padding: 20rpx 30rpx;
}

.balance-page__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-body, 28rpx);
  line-height: 1.6;
}

.balance-page__row--secondary {
  padding-top: 6rpx;
  font-size: var(--font-size-caption, 24rpx);
  color: var(--color-text-secondary);
}

.balance-page__label {
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.balance-page__amount {
  color: var(--color-text);
  flex-shrink: 0;
  margin-left: 20rpx;
}

.balance-page__amount--highlight {
  color: var(--color-secondary);
  font-weight: 600;
}

.balance-page__amount--income {
  color: var(--color-accent);
  font-weight: 600;
}

.balance-page__amount--expense {
  color: var(--color-danger);
  font-weight: 600;
}
</style>
