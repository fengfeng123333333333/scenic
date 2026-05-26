/**
 * 主题配置文件
 *
 * 所有主题色集中管理于此文件。
 * 新增主题：在 themes 对象中添加新的 key 即可，无需修改任何组件。
 *
 * 使用方式：
 *   import { getTheme, applyTheme } from '@/styles/themes.js'
 *   applyTheme('natural-ecology')  // 切换为自然生态类主题
 *   applyTheme('default')           // 切换为通用默认主题
 */

// ============================================================================
// 主题定义
// ============================================================================
const themes = {
  // ---------------------------------------
  // 通用默认（天蓝主色 + 橙色点缀）—— 默认主题
  // ---------------------------------------
  default: {
    name: "通用默认（天蓝主色 + 橙色点缀）",
    description:
      "天蓝主色 + 橙色点缀，旅游行业安全色。清新、通用、适用于绝大多数景区。",
    vars: {
      // 主色系（天蓝主色）
      "--color-primary": "#2DA8F6",
      "--color-primary-dark": "#1B8BE0",
      "--color-primary-hover": "#1B8BE0",
      "--color-primary-bg-light": "rgba(45, 168, 246, 0.06)",
      "--color-primary-border-light": "rgba(45, 168, 246, 0.12)",
      "--color-text-on-primary": "#FFFFFF",

      // 辅色与点缀（Accent / Highlights）
      // Accent Primary: 促销角标、安全/提示色、辅助 CTA
      "--color-secondary": "#FF944A",
      // Accent Secondary: 成功状态、轻微强调、icon 背景色
      "--color-accent": "#7ECF9A",
      "--color-warning": "#FF944A",
      "--color-danger": "#E5534B",

      // 中性色（Neutral Palette）
      "--color-bg": "#FBFEFB",
      "--color-bg-card": "#FFFFFF",
      "--color-text": "#24392F",
      "--color-text-secondary": "#59665F",
      "--color-border-light": "#98A79E",
      "--color-disabled": "#C9D9D0",

      // 骨架屏（Skeleton）
      "--color-skeleton-base": "#E8F3EC",
      "--color-skeleton-highlight": "rgba(255, 255, 255, 0.7)",

      // 圆角
      "--radius-card": "28rpx",
      "--radius-button": "24rpx",
      "--radius-sm": "16rpx",
      "--skeleton-radius": "16rpx",

      // 阴影（轻柔、以主色为基调的浅影）
      "--shadow-soft": "0 12rpx 32rpx rgba(45, 168, 246, 0.06)",
      "--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
    },
  },

  // ---------------------------------------
  // 亲水休闲
  // ---------------------------------------
  "water-relax": {
    name: "亲水休闲（water）",
    description:
      "海蓝主色 + 暖黄点缀，清凉舒适，适合水世界、海滨景区、湖泊乐园等场景。",
    vars: {
      // 主色系（海蓝主色）
      "--color-primary": "#1EA7F2",
      "--color-primary-dark": "#178FD6",
      "--color-primary-hover": "#178FD6",
      "--color-primary-bg-light": "rgba(30, 167, 242, 0.06)",
      "--color-primary-border-light": "rgba(30, 167, 242, 0.12)",
      "--color-text-on-primary": "#FFFFFF",

      // 辅色与点缀（Accent / Highlights）
      // Accent Primary: 安全提示、促销角标、活动点缀
      "--color-secondary": "#FFC85C",
      // Accent Secondary: 次级强调、icon 背景
      "--color-accent": "#74D0E8",
      "--color-warning": "#FFC85C",
      "--color-danger": "#E94B3C",

      // 中性色（Neutral Palette）
      "--color-bg": "#FBFEFF",
      "--color-bg-card": "#FFFFFF",
      "--color-text": "#1F3640",
      "--color-text-secondary": "#55686D",
      "--color-border-light": "#9FB4B8",
      "--color-disabled": "#C9D9D0",

      // 骨架屏（Skeleton）
      "--color-skeleton-base": "#EAF7FA",
      "--color-skeleton-highlight": "rgba(255, 255, 255, 0.75)",

      // 圆角
      "--radius-card": "28rpx",
      "--radius-button": "24rpx",
      "--radius-sm": "16rpx",
      "--skeleton-radius": "16rpx",

      // 阴影（轻柔、以主色为基调的浅影）
      "--shadow-soft": "0 12rpx 32rpx rgba(30, 167, 242, 0.06)",
      "--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
    },
  },

  // ---------------------------------------
  // 文化古韵
  // ---------------------------------------
  "culture-classic": {
    name: "文化古韵（culture）",
    description:
      "古典典雅，适合古镇、历史遗迹、寺庙、文化街区。古铜朱砂墨灰基调，米色纸本质感，营造沉静历史氛围。",
    vars: {
      // 主色系（古铜褐）
      "--color-primary": "#9C6B3A",
      "--color-primary-dark": "#7F532C",
      "--color-primary-hover": "#7F532C",
      "--color-primary-bg-light": "rgba(156, 107, 58, 0.06)",
      "--color-primary-border-light": "rgba(156, 107, 58, 0.12)",
      "--color-text-on-primary": "#FFFFFF",

      // 辅色与点缀（朱砂 / 墨色 / 金色）
      "--color-secondary": "#C24B3D",
      "--color-accent": "#D9B46A",
      "--color-warning": "#C24B3D",
      "--color-danger": "#E5534B",
      // 扩展变量（文化古韵专属）
      "--color-ink": "#2B2B2B",
      "--color-gold": "#D9B46A",

      // 中性色（米白 / 纸色 / 墨色系）
      "--color-bg": "#FBF8F2",
      "--color-bg-card": "#FFFFFF",
      "--color-text": "#33302B",
      "--color-text-secondary": "#6F6459",
      "--color-border-light": "#EEE6DB",
      "--color-disabled": "#CFC6BC",

      // 骨架屏（Skeleton）
      "--color-skeleton-base": "#EFE8DD",
      "--color-skeleton-highlight": "rgba(255, 255, 255, 0.6)",

      // 圆角（较温和，保留古典端庄感）
      "--radius-card": "24rpx",
      "--radius-button": "20rpx",
      "--radius-sm": "12rpx",
      "--skeleton-radius": "12rpx",

      // 阴影（中性低对比）
      "--shadow-soft": "0 12rpx 28rpx rgba(0, 0, 0, 0.06)",
      "--shadow-modal": "0 24rpx 56rpx rgba(0, 0, 0, 0.12)",
      // 扩展：暖色调微影
      "--shadow-soft-warm": "0 10rpx 26rpx rgba(156, 107, 58, 0.04)",
    },
  },

  // ---------------------------------------
  // 自然生态类
  // ---------------------------------------
  "natural-ecology": {
    name: "自然生态类",
    description: '以"自然、清新、有氧"为核心的绿色生态风格',
    vars: {
      // 主色系（Leaf Green）
      "--color-primary": "#3AA76D",
      "--color-primary-dark": "#2E8B57",
      "--color-primary-hover": "#2E8B57",
      "--color-primary-bg-light": "rgba(58, 167, 109, 0.06)",
      "--color-primary-border-light": "rgba(58, 167, 109, 0.12)",
      "--color-text-on-primary": "#FFFFFF",

      // 辅色系
      "--color-secondary": "#4EA6C8",
      "--color-accent": "#D8B48A",
      "--color-warning": "#F6A623",
      "--color-danger": "#E5534B",

      // 中性色
      "--color-bg": "#F6FBF7",
      "--color-bg-card": "#FFFFFF",
      "--color-text": "#2F3A35",
      "--color-text-secondary": "#6B766F",
      "--color-border-light": "#E6EFE8",
      "--color-disabled": "#C9D9D0",

      // 骨架屏
      "--color-skeleton-base": "#E6EFE8",
      "--color-skeleton-highlight": "rgba(255, 255, 255, 0.55)",

      // 圆角
      "--radius-card": "28rpx",
      "--radius-button": "24rpx",
      "--radius-sm": "16rpx",
      "--skeleton-radius": "16rpx",

      // 阴影（以主色为基调）
      "--shadow-soft": "0 12rpx 32rpx rgba(46, 139, 87, 0.06)",
      "--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
    },
  },
};

// ============================================================================
// 常量
// ============================================================================

/** 默认主题 key */
const DEFAULT_THEME = "culture-classic";

/** localStorage 存储 key */
const STORAGE_KEY = "app-theme";

// ============================================================================
// 导出：主题数据
// ============================================================================

export { themes, DEFAULT_THEME, STORAGE_KEY };

// ============================================================================
// 导出：辅助函数
// ============================================================================

/**
 * 获取所有主题的 key 列表
 * @returns {string[]}
 */
export function getThemeKeys() {
  return Object.keys(themes);
}

/**
 * 获取所有主题的元信息（名称、描述，不含变量）
 * @returns {Array<{ key: string, name: string, description: string }>}
 */
export function getThemeMetaList() {
  return Object.entries(themes).map(([key, theme]) => ({
    key,
    name: theme.name,
    description: theme.description,
  }));
}

/**
 * 根据 key 获取完整主题配置
 * @param {string} key - 主题 key，不传则返回默认主题
 * @returns {{ name: string, description: string, vars: Record<string, string> }}
 */
export function getTheme(key) {
  return themes[key || DEFAULT_THEME] || themes[DEFAULT_THEME];
}

/**
 * 获取当前持久化的主题 key（校验是否存在，不存在则回退默认）
 * @returns {string}
 */
export function getStoredThemeKey() {
  const stored = uni.getStorageSync(STORAGE_KEY);
  // 只有存储的 key 在 themes 中存在时才使用，否则用默认主题
  if (stored && themes[stored]) {
    return stored;
  }
  return DEFAULT_THEME;
}

/**
 * 持久化当前主题 key
 * @param {string} key
 */
export function storeThemeKey(key) {
  uni.setStorageSync(STORAGE_KEY, key || DEFAULT_THEME);
}

/**
 * 获取当前主题的 CSS 变量对象（用于绑定到 :style）
 * 返回格式：{ '--color-primary': '#3AA76D', ... }
 * @param {string} [key] - 主题 key，不传则取已存储的
 * @returns {Record<string, string>}
 */
export function getThemeVars(key) {
  const theme = getTheme(key || getStoredThemeKey());
  return theme.vars || {};
}

/**
 * 应用主题：将 CSS 变量写入全局
 * - H5 端：设置 document.documentElement.style
 * - 小程序端：存入 uni.$themeVars，由页面的 :style 绑定消费
 * @param {string} key - 主题 key
 */
export function applyTheme(key) {
  const resolvedKey = key || getStoredThemeKey();
  const vars = getThemeVars(resolvedKey);

  // 存入全局，供页面组件读取
  uni.$themeVars = vars;
  uni.$themeKey = resolvedKey;

  // H5 端：直接设置 CSS 变量到根元素
  // #ifdef H5
  if (typeof document !== "undefined" && document.documentElement) {
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }
  // #endif

  // 持久化
  storeThemeKey(resolvedKey);

  console.log(`[主题] 已切换为：${themes[resolvedKey]?.name || resolvedKey}`);
}

/**
 * 初始化主题：读取持久化的主题 key 并应用
 * 应在 App.vue onLaunch 中调用
 */
export function initTheme() {
  const stored = getStoredThemeKey();
  applyTheme(stored);
}
