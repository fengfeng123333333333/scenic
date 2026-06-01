# 页面优化改造标准

> 目标：将景区小程序所有页面按此标准统一改造，提升可维护性、可读性和用户体验。

---

# 第〇章：改造前置要求（必读）

> ⚠️ 改造任何旧代码前，必须逐项确认以下要求，缺一不可。

## 0.1 技术栈迁移：uni-app Vue2 → Vue3

| 项目     | 改造前                                 | 改造后                                                                                |
| -------- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| 框架     | uni-app + Vue 2                        | uni-app + Vue 3                                                                       |
| API 风格 | Options API                            | Composition API（`<script setup>`）                                                   |
| 响应式   | `data()` / `computed` / `watch`        | `ref()` / `reactive()` / `computed()` / `watch()`                                     |
| 生命周期 | `created` / `mounted` / `destroyed` 等 | `onLoad` / `onMounted` / `onBeforeUnmount` 等（从 `@dcloudio/uni-app` 或 `vue` 导入） |
| 组件引用 | `this.$refs.xxx`                       | `const xxx = ref(null)`                                                               |
| 全局事件 | `this.$on` / `this.$emit`              | `uni.$on` / `uni.$emit`                                                               |

**强制要求**：

- 所有新改造页面必须使用 `<script setup>` 语法
- 禁止混用 Options API 和 Composition API
- 原有 `this.$store` / `this.$refs` 等 Vue 2 写法必须全部重写

## 0.2 uni-app 原生 API → uview-plus 组件替换

旧项目中常见的 uni-app 原生调用，改造后统一替换为 uview-plus 组件：

| 改造前（uni 原生）                        | 改造后（uview-plus）                                               |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `uni.showToast({ title: 'xxx' })`         | `<u-toast ref="uToastRef" />` + `useToast()` 封装                  |
| `uni.showModal({ ... })`                  | `<u-modal :show="..." />`                                          |
| `<uni-popup>` 或内联弹窗                  | `<u-popup :show="..." mode="bottom/center">`                       |
| `uni.showLoading / uni.hideLoading`       | `<zero-loading>` 或 `<u-loading-icon>`                             |
| `uni.showActionSheet`                     | `<u-action-sheet>`                                                 |
| `uni.navigateTo / redirectTo / switchTab` | 保持不变（路由 API 不受影响），但路径必须提取为 `PAGE_ROUTES` 常量 |
| `uni.getStorageSync / setStorageSync`     | 保持不变                                                           |

**强制要求**：

- 禁止在改造后的代码中使用 `uni.showToast` / `uni.showModal` / `uni.showLoading` 等交互 API
- 弹窗类 UI 必须使用 uview-plus 的声明式组件（`<u-popup>` / `<u-modal>` / `<u-toast>`）
- Toast 封装统一使用 `@/util/toast.js` 中的 `useToast()`

## 0.3 函数逻辑完整继承 + 梳理

**原则**：旧代码的所有业务逻辑必须完整保留，不得遗漏任何分支、条件判断、接口调用、数据处理。

**流程**：

1. 通读旧代码（`<script>` 全部内容），逐行理解每个函数的意图
2. 在改造后的 `<script setup>` 中按"七段式"重新组织（见第二章）
3. 每个旧函数名在改造后应可对应找到（通过注释标注原名）
4. 改造完成后，对照旧代码逐函数核对：输入 → 处理 → 输出是否一致
5. 在文件头部添加业务逻辑梳理注释（数据流向图或关键流程说明）

**强制要求**：

- 改造完成后，在文件头部注释中列出"旧函数 → 新函数"映射表
- 如需合并/拆分函数，必须说明理由

## 0.4 项目结构（改造前必读）

```
项目根目录
├── pages.json              ← 路由注册（新增页面必须在此注册）
├── App.vue                 ← 应用入口
├── main.js                 ← 全局初始化
├── store/index.js          ← 全局状态（Pinia 风格 reactive store）
├── styles/themes.js        ← 主题变量系统
├── util/
│   ├── api.js              ← 请求封装（uni.$myRequest）
│   └── toast.js            ← Toast 封装（useToast）
├── components/             ← 全局组件
│   ├── skeleton/           ← 骨架屏组件
│   ├── loading/            ← 加载组件
│   ├── tabbar/             ← 底部导航
│   ├── uni-popup/          ← 通用弹窗
│   └── v-tabs/             ← Tab 切换
└── pages/                  ← 页面目录
    ├── index/              ← 首页（含 4 个 Tab 子组件）
    ├── details/            ← 门票详情
    ├── reserve/            ← 散客票预订
    ├── tourist/            ← 常用人员
    └── payment/            ← 支付页
```

**强制要求**：

- 新增页面必须在 `pages.json` 中注册路由
- 新增组件放在 `components/` 下对应子目录
- 新增工具函数放在 `util/` 下

## 0.5 改造工作流

```
① 用户将旧代码文件复制到项目目录
        │
② AI 阅读 page-refactor-standard.md + 设计稿规范.md
        │
③ AI 分析旧代码 → 梳理函数逻辑 → 识别需要替换的 API
        │
④ AI 按本规范执行改造（模板 / 脚本 / 样式三层）
        │
⑤ 改造完成后输出"旧函数 → 新函数"对照 + 逻辑校验清单
        │
⑥ 运行硬编码颜色扫描确认合规
```

**强制要求**：

- AI 改造代码前，必须先用 `read_file` 完整阅读本文件和 `设计稿规范.md`
- 改造过程中如遇不确定的业务逻辑，必须向用户确认而非自行猜测
- 当前项目中 **全部是已改造完成的代码**，旧代码由用户从外部复制进来后再改造

## 0.6 改造后校验清单

改造任一页面完成后，必须逐项确认：

- [ ] 无 Vue 2 Options API 残留（`data()` / `methods:` / `computed:` / `this.xxx`）
- [ ] 无 `uni.showToast` / `uni.showModal` / `uni.showLoading` 原生 API 调用
- [ ] 所有旧函数逻辑已迁移，无遗漏分支
- [ ] 文件头有清晰注释（页面用途 + 遵循规范 + 主题说明）
- [ ] 硬编码颜色扫描无输出
- [ ] 样式全量使用 `var(--color-*)` / `var(--radius-*)` / `var(--shadow-*)`
- [ ] `PAGE_ROUTES` 常量集中管理所有跳转路径
- [ ] 骨架屏 + `pageReady` 兜底机制就位
- [ ] 底部适配安全区 `env(safe-area-inset-bottom)`

---

# 上篇：页面优化全面总结

## 一、模板层优化

| 优化项           | 说明                                                               | 示例                                              |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| **骨架屏加载**   | 用独立 Skeleton 组件替代内联 loading，`v-if="!pageReady"` 控制显隐 | `<DetailsSkeleton v-if="!pageReady" />`           |
| **组件化拆分**   | 弹窗/ Tab /富文本/公告等各自抽为独立组件                           | `u-popup`、`v-tabs`、`u-parse`、`f-notice`        |
| **条件渲染优化** | 单图时自动隐藏轮播指示点；可选字段用 `v-if` 避免渲染空节点         | `:indicator-dots="banList.length > 1"`            |
| **语义化注释**   | 每个区块标注用途，便于快速定位                                     | `<!-- Banner 轮播 -->`、`<!-- 票型基础信息卡 -->` |

---

## 二、脚本层优化

### 2.1 代码分区（七段式）

```js
// ==================== 页面路由常量 ====================
// ==================== 数据 ====================
// ==================== Refs ====================
// ==================== 生命周期 ====================
// ==================== 数据请求 ====================
// ==================== 导航辅助 ====================
// ==================== 业务方法 ====================
```

### 2.2 数据请求优化

| 优化项             | 改造前                           | 改造后                                                      |
| ------------------ | -------------------------------- | ----------------------------------------------------------- |
| **并行请求**       | 轮播图和详情串行加载，慢         | `fetchBanner()` 不 await，与 `fetchTicketDetail()` 并行发出 |
| **pageReady 兜底** | 请求失败时骨架屏永不消失         | `try { ... } finally { pageReady = true }` 保证必消除       |
| **空值安全**       | `res.data.Data` 接口异常直接报错 | `res.data.Data \|\| []` / `res.data.Data \|\| {}`           |
| **参数解析独立**   | 路由参数解析混在请求函数中       | 抽离为 `parseRouteParams(option)`                           |

### 2.3 导航跳转优化（详见下篇）

- 路由常量 → `PAGE_ROUTES` 集中管理
- URL 构建 → `buildOrderUrl()` 抽离
- Store 写入 → `setOrderStore()` 统一
- 组合导航 → `goToOrder()` 一步到位
- 早 return → 消除深层嵌套

---

## 三、样式层优化

| 优化项               | 说明                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **主题变量体系**     | 全量颜色 `var(--color-*)`、字号 `var(--font-size-*)`、圆角 `var(--radius-*)`、阴影 `var(--shadow-*)`  |
| **BEM 命名规范**     | `.banner__swiper` / `.ticket-card__body` / `.bottom-bar__btn`，层级清晰无冲突                         |
| **禁用 SCSS & 嵌套** | 所有 `&--modifier` / `&:pseudo` 展开为平级 `.block__elem--modifier` / `.block__elem:pseudo`，方便调试 |
| **渐变遮罩**         | banner 底部 `linear-gradient` 到背景色，视觉自然过渡                                                  |
| **轮播指示点定制**   | `:deep()` 穿透 swiper dot，圆形 → 激活态胶囊形                                                        |
| **底部安全区**       | `padding-bottom: calc(20rpx + env(safe-area-inset-bottom))` 适配刘海屏                                |
| **按压反馈**         | `.xxx-btn:active { opacity: 0.88; transform: scale(0.96); }`（平级写法，禁用 &）                      |
| **文本截断**         | `-webkit-line-clamp` + `line-clamp` 双写兼容                                                          |
| **设计规范注释**     | 文件头注释说明遵循的设计规范                                                                          |

---

## 四、架构分层

```
页面.vue
├── template
│   ├── 骨架屏        ← components/skeleton/xxx_skeleton.vue
│   ├── 导航栏        ← u-navbar
│   ├── 内容区块       ← 业务组件
│   ├── 底部操作栏
│   └── 弹窗层        ← uni-popup
│
├── script setup
│   ├── PAGE_ROUTES   ← 路由常量
│   ├── 响应式数据     ← ref / reactive
│   ├── 数据请求层     ← fetchXxx / parseParams
│   ├── 导航辅助层     ← buildUrl / setStore / goTo
│   └── 业务方法层     ← 用户交互入口
│
├── script (options)   ← 分享配置等（如需）
│
└── style scoped
    ├── 主题变量驱动   ← var(--color-*) 等
    ├── BEM 命名
    └── 安全区适配
```

---

## 五、可复用模式速查（10 条）

```
① 骨架屏    v-if="!pageReady" → <XxxSkeleton /> → try/finally 兜底
② 并行请求  不 await 的先发出，最后 await 关键请求
③ 空值安全  res?.data?.Data || []
④ 路由常量  const PAGE_ROUTES = { key: '/pages/xxx/xxx' }
⑤ URL 构建  buildXxxUrl() → 条件选路径 + 拼 query
⑥ Store 写入 setXxxStore() → 单一职责、可复用
⑦ 组合导航  goToXxx() → setStore() + navigateTo(buildUrl())
⑧ 早 return  if (特殊条件) { 处理; return } 主流程()
⑨ 主题变量  var(--color-*) / var(--font-size-*) / var(--radius-*)
⑩ 安全区    padding-bottom: calc(x + env(safe-area-inset-bottom))
```

---

# 下篇：跳转改造总结 — 六大维度

## 一、改造维度总览

| 维度                  | 问题                                     | 方案                            |
| --------------------- | ---------------------------------------- | ------------------------------- |
| **1. 路由集中管理**   | 页面路径散落在各处，改一个路径要全局搜索 | 页面顶部定义 `PAGE_ROUTES` 常量 |
| **2. URL 构建抽离**   | 模板字符串拼接散落在每个 `navigateTo` 中 | 封装 `buildXxxUrl()` 函数       |
| **3. Store 写入统一** | 跳转前写 store 的逻辑重复出现            | 封装 `setXxxStore()` 函数       |
| **4. 导航一步到位**   | 每个跳转写 3-4 行代码                    | 封装 `goToXxx()` 组合函数       |
| **5. 代码分区清晰**   | 数据/请求/方法混在一起                   | 用分隔注释分区块                |
| **6. 消除嵌套分支**   | 深层 if/else 难以阅读                    | 早 return + 提取条件判断        |

---

## 二、代码分区规范（script setup 内部顺序）

```js
// ==================== 页面路由常量 ====================
const PAGE_ROUTES = { ... };

// ==================== 数据 ====================
const foo = ref(...);

// ==================== Refs ====================
const popup = ref(null);

// ==================== 生命周期 ====================
onLoad(...);

// ==================== 数据请求 ====================
async function fetchXxx() { ... }

// ==================== 导航辅助 ====================
function buildOrderUrl() { ... }   // URL 构建
function setOrderStore() { ... }   // Store 写入
function goToOrder() { ... }       // 组合：store + navigate

// ==================== 业务方法 ====================
function yuDing() { ... }          // 业务入口
```

---

## 三、导航辅助三层模式

```
业务方法 (yuDing / clome)
    │
    ├── goToOrder()           ← 组合入口（一步完成 store + 跳转）
    │     ├── setOrderStore() ← 写入 store 状态
    │     └── navigateTo( buildOrderUrl() )  ← 构建 URL + 跳转
    │
    └── buildOrderUrl()       ← 根据条件选择路径 + 拼接参数
          └── PAGE_ROUTES.xxx ← 从常量取路径
```

### 示例代码

```js
// ① 路由常量 — 页面顶部，一眼看清所有跳转目标
const PAGE_ROUTES = {
  reserve: "/pages/reserve/reserve",
  resMember: "/pages/subPack/resMenber/resMenber",
};

// ② URL 构建 — 条件 → 路径 + query
function buildOrderUrl() {
  const path =
    ticketList.value.TicketType == 1
      ? PAGE_ROUTES.reserve
      : PAGE_ROUTES.resMember;
  return `${path}?minpro=${mindBdi.value}`;
}

// ③ Store 写入 — 单一职责
function setOrderStore(ticket = ticketList.value) {
  store.state.tickId = ticket.TicketID;
  store.state.seltck = { DistributorID: 0, saleticketID: 0 };
}

// ④ 组合入口 — 一行调用搞定
function goToOrder() {
  setOrderStore();
  uni.navigateTo({ url: buildOrderUrl() });
}
```

---

## 四、业务方法简化原则

### Before（深层嵌套）

```js
function yuDing() {
  if (ticketList.value.TicketType == 1) {
    if (ticketList.value.RiskTip == 1) {
      notcLit.value = ...;
      popup.value?.open("center");
    } else {
      uni.navigateTo({ url: `/pages/reserve/reserve?minpro=${mindBdi.value}` });
    }
  } else {
    uni.navigateTo({ url: `/pages/subPack/resMenber/resMenber?minpro=${mindBdi.value}` });
  }
}
```

### After（早 return + 抽取）

```js
function yuDing() {
  // 散客票型 → 检查是否需要弹窗展示订票须知
  if (ticketList.value.TicketType == 1 && ticketList.value.RiskTip == 1) {
    notcLit.value = ticketList.value.Tips;
    borList.value = ticketList.value;
    popup.value?.open("center");
    return; // ← 早 return，避免 else 嵌套
  }
  goToOrder();
}
```

---

## 五、改造前后对比

| 指标                | 改造前             | 改造后                             |
| ------------------- | ------------------ | ---------------------------------- |
| 硬编码路径字符串    | 4 处               | 0 处（统一引用常量）               |
| `navigateTo` 调用   | 4 处（含重复逻辑） | 2 处                               |
| `yuDing()` 嵌套层级 | 3 层               | 1 层                               |
| 可复用的导航单元    | 0 个               | 3 个（buildUrl / setStore / goTo） |

---

## 六、改造检查清单

改造任一页面时，逐项确认：

- [ ] 所有 `uni.navigateTo/redirectTo/switchTab` 中的路径是否提取到 `PAGE_ROUTES`？
- [ ] 动态 URL（模板字符串拼接 query）是否封装为 `buildXxxUrl()`？
- [ ] 跳转前写 `store.state.xxx = ...` 是否封装为 `setXxxStore()`？
- [ ] 是否有两处以上相同的跳转逻辑？→ 提取 `goToXxx()`
- [ ] script 区块是否用分隔注释清晰分区？
- [ ] 深层 if/else 是否用早 return 消除？
- [ ] 是否使用骨架屏替代内联 loading？
- [ ] 并行请求是否不 await 非关键请求？
- [ ] 接口返回值是否做了空值兜底 `|| []` / `|| {}`？
- [ ] 样式是否全部使用主题变量 `var(--color-*)`？
- [ ] 是否使用 BEM 命名规范？
- [ ] 底部是否适配安全区 `env(safe-area-inset-bottom)`？
- [ ] pageReady 是否用 `try/finally` 保证必消除？
