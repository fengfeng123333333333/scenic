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
		description: "天蓝主色 + 橙色点缀，旅游行业安全色。清新、通用、适用于绝大多数景区。",
		vars: {
			// 主色系（天蓝主色）
			"--color-primary": "#2DA8F6",
			"--color-primary-dark": "#1B8BE0",
			"--color-primary-hover": "#1B8BE0",
			"--color-primary-bg-light": "rgba(45, 168, 246, 0.06)",
			"--color-primary-border-light": "rgba(45, 168, 246, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀
			"--color-secondary": "#FF944A",
			"--color-accent": "#7ECF9A",
			"--color-warning": "#FF944A",
			"--color-danger": "#E5534B",
			// 会员金（卡金/尊贵标识）
			"--color-member-gold": "#D9A63A",

			// 中性色
			"--color-bg": "#FBFEFB",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#24392F",
			"--color-text-secondary": "#59665F",
			"--color-border-light": "#98A79E",
			"--color-disabled": "#C9D9D0",

			// 骨架屏
			"--color-skeleton-base": "#E8F3EC",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.7)",

			// 圆角
			"--radius-card": "28rpx",
			"--radius-button": "24rpx",
			"--radius-sm": "16rpx",
			"--skeleton-radius": "16rpx",

			// 阴影
			"--shadow-soft": "0 12rpx 32rpx rgba(45, 168, 246, 0.06)",
			"--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
		},
	},
	// ---------------------------------------
	// 国庆华诞（红金配色）
	// ---------------------------------------
	"national-day": {
		name: "国庆华诞（红金）",
		description: "中国红主色 + 金色点缀，国庆节日氛围。庄重热烈，适用于国庆黄金周。",
		vars: {
			// 主色系（中国红）
			"--color-primary": "#D4302F",
			"--color-primary-dark": "#B71C1C",
			"--color-primary-hover": "#B71C1C",
			"--color-primary-bg-light": "rgba(212, 48, 47, 0.06)",
			"--color-primary-border-light": "rgba(212, 48, 47, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀（金色系）
			"--color-secondary": "#E6B422",
			"--color-accent": "#C9A84C",
			"--color-warning": "#E6B422",
			"--color-danger": "#D4302F",
			// 会员金
			"--color-member-gold": "#E6B422",

			// 中性色
			"--color-bg": "#FEFAF6",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#3C1E1E",
			"--color-text-secondary": "#8C6E6E",
			"--color-border-light": "#F5E6D3",
			"--color-disabled": "#E8D5C4",

			// 骨架屏
			"--color-skeleton-base": "#FEF0E8",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.75)",

			// 圆角
			"--radius-card": "28rpx",
			"--radius-button": "24rpx",
			"--radius-sm": "16rpx",
			"--skeleton-radius": "16rpx",

			// 阴影（暖红调）
			"--shadow-soft": "0 12rpx 32rpx rgba(212, 48, 47, 0.06)",
			"--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
		},
	},

	// ---------------------------------------
	// 端午佳节（竹叶绿 + 龙舟金）
	// ---------------------------------------
	"dragon-boat": {
		name: "端午佳节（翠绿）",
		description: "竹叶绿主色 + 龙舟金点缀，端午节日氛围。清新雅致，适用于端午小长假。",
		vars: {
			// 主色系（竹叶绿）
			"--color-primary": "#5B8C3E",
			"--color-primary-dark": "#3D6B24",
			"--color-primary-hover": "#3D6B24",
			"--color-primary-bg-light": "rgba(91, 140, 62, 0.06)",
			"--color-primary-border-light": "rgba(91, 140, 62, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀（龙舟金）
			"--color-secondary": "#D4A843",
			"--color-accent": "#B8D98A",
			"--color-warning": "#D4A843",
			"--color-danger": "#D4302F",
			// 会员金
			"--color-member-gold": "#D4A843",

			// 中性色
			"--color-bg": "#F6FAF2",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#2D3A1F",
			"--color-text-secondary": "#6B7D5E",
			"--color-border-light": "#E6EFD8",
			"--color-disabled": "#D5E3C4",

			// 骨架屏
			"--color-skeleton-base": "#EDF5E2",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.75)",

			// 圆角
			"--radius-card": "28rpx",
			"--radius-button": "24rpx",
			"--radius-sm": "16rpx",
			"--skeleton-radius": "16rpx",

			// 阴影（竹绿调）
			"--shadow-soft": "0 12rpx 32rpx rgba(91, 140, 62, 0.06)",
			"--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
		},
	},
	// ---------------------------------------
	// 自然生态类（原版保留，新增自然亚金）
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
			// 会员金（自然亚金，温润不刺眼）
			"--color-member-gold": "#D4A843",

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

			// 阴影
			"--shadow-soft": "0 12rpx 32rpx rgba(46, 139, 87, 0.06)",
			"--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
		},
	},
	// ---------------------------------------
	// 亲水休闲（湖水蓝绿主色 + 暖黄点缀）
	// ---------------------------------------
	"water-relax": {
		name: "亲水休闲（water）",
		description: "湖水蓝绿主色 + 暖黄点缀，清凉沉浸，适合水世界、海滨景区、湖泊乐园等场景。",
		vars: {
			// 主色系：湖水蓝绿
			"--color-primary": "#009DA5",
			"--color-primary-dark": "#007A80",
			"--color-primary-hover": "#007A80",
			"--color-primary-bg-light": "rgba(0, 157, 165, 0.06)",
			"--color-primary-border-light": "rgba(0, 157, 165, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀
			"--color-secondary": "#FFC85C",
			"--color-accent": "#74D0E8",
			"--color-warning": "#FFC85C",
			"--color-danger": "#E94B3C",
			// 会员金（水岸金沙质感）
			"--color-member-gold": "#E5C687",

			// 中性色
			"--color-bg": "#F5FCFE",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#1C3A3D",
			"--color-text-secondary": "#4A6B6E",
			"--color-border-light": "#BFE3E8",
			"--color-disabled": "#C9D9D0",

			// 骨架屏
			"--color-skeleton-base": "#E2F4F6",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.75)",

			// 圆角
			"--radius-card": "28rpx",
			"--radius-button": "24rpx",
			"--radius-sm": "16rpx",
			"--skeleton-radius": "16rpx",

			// 阴影
			"--shadow-soft": "0 12rpx 32rpx rgba(0, 157, 165, 0.06)",
			"--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
		},
	},

	// ---------------------------------------
	// 活力乐园（乐园粉红主色 + 亮黄/电光紫点缀）
	// ---------------------------------------
	"fun-play": {
		name: "活力乐园（fun）",
		description: "乐园粉红主色 + 亮黄/电光紫点缀，梦幻童趣，适用于游乐园、亲子乐园、嘉年华等场景。",
		vars: {
			// 主色系：乐园粉红
			"--color-primary": "#FF3D6F",
			"--color-primary-dark": "#E0325E",
			"--color-primary-hover": "#E0325E",
			"--color-primary-bg-light": "rgba(255, 61, 111, 0.06)",
			"--color-primary-border-light": "rgba(255, 61, 111, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀
			"--color-secondary": "#FFD24A",
			"--color-accent": "#B56FF5",
			"--color-warning": "#FFD24A",
			"--color-danger": "#FF4B4B",
			"--color-accent-pink": "#FF6BC1",
			"--color-accent-green": "#6CE67A",
			"--color-accent-purple": "#B56FF5",
			// 会员金（乐园梦幻金，比亮黄厚重）
			"--color-member-gold": "#F5D76A",

			// 中性色
			"--color-bg": "#FFFAFB",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#2E1F24",
			"--color-text-secondary": "#7A6269",
			"--color-border-light": "#FFE5EB",
			"--color-disabled": "#E8D9DF",

			// 骨架屏
			"--color-skeleton-base": "#FFF0F3",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.7)",

			// 圆角
			"--radius-card": "28rpx",
			"--radius-button": "24rpx",
			"--radius-sm": "16rpx",
			"--skeleton-radius": "16rpx",

			// 阴影
			"--shadow-soft": "0 12rpx 32rpx rgba(255, 61, 111, 0.08)",
			"--shadow-modal": "0 24rpx 60rpx rgba(0, 0, 0, 0.12)",
			"--shadow-accent": "0 8rpx 24rpx rgba(181, 111, 245, 0.08)",
		},
	},

	// ---------------------------------------
	// 文化古韵（原版保留，直接复用原有金色）
	// ---------------------------------------
	"culture-classic": {
		name: "文化古韵（culture）",
		description: "古典典雅，适合古镇、历史遗迹、寺庙、文化街区。古铜朱砂墨灰基调，米色纸本质感，营造沉静历史氛围。",
		vars: {
			// 主色系（古铜褐）
			"--color-primary": "#9C6B3A",
			"--color-primary-dark": "#7F532C",
			"--color-primary-hover": "#7F532C",
			"--color-primary-bg-light": "rgba(156, 107, 58, 0.06)",
			"--color-primary-border-light": "rgba(156, 107, 58, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀
			"--color-secondary": "#C24B3D",
			"--color-accent": "#D9B46A",
			"--color-warning": "#C24B3D",
			"--color-danger": "#E5534B",
			"--color-ink": "#2B2B2B",
			"--color-gold": "#D9B46A",
			// 会员金（直接复用文化古韵原有的金色）
			"--color-member-gold": "#D9B46A",

			// 中性色
			"--color-bg": "#FBF8F2",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#33302B",
			"--color-text-secondary": "#6F6459",
			"--color-border-light": "#EEE6DB",
			"--color-disabled": "#CFC6BC",

			// 骨架屏
			"--color-skeleton-base": "#EFE8DD",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.6)",

			// 圆角
			"--radius-card": "24rpx",
			"--radius-button": "20rpx",
			"--radius-sm": "12rpx",
			"--skeleton-radius": "12rpx",

			// 阴影
			"--shadow-soft": "0 12rpx 28rpx rgba(0, 0, 0, 0.06)",
			"--shadow-modal": "0 24rpx 56rpx rgba(0, 0, 0, 0.12)",
			"--shadow-soft-warm": "0 10rpx 26rpx rgba(156, 107, 58, 0.04)",
		},
	},

	// ---------------------------------------
	// 山地禅意（原版保留，以温润暗金匹配禅意）
	// ---------------------------------------
	"mountain-zen": {
		name: "山地禅意（mountain）",
		description: "静谧质朴，适合山岳景区、禅修基地、徒步线路等。松石绿、岩石灰与土褐，呈现沉稳、自然与禅意的视觉语境。",
		vars: {
			// 主色系（松石/苔绿色系）
			"--color-primary": "#2F6B57",
			"--color-primary-dark": "#23503F",
			"--color-primary-hover": "#23503F",
			"--color-primary-bg-light": "rgba(47, 107, 87, 0.06)",
			"--color-primary-border-light": "rgba(47, 107, 87, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀
			"--color-secondary": "#A57C4A",
			"--color-accent": "#C9B89A",
			"--color-warning": "#A57C4A",
			"--color-danger": "#B35A3A",
			"--color-ink": "#2B2B28",
			"--color-terracotta": "#B35A3A",
			// 会员金（低调禅金，大地温润）
			"--color-member-gold": "#B6954A",

			// 中性色
			"--color-bg": "#FBFBF8",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#2E2C28",
			"--color-text-secondary": "#726962",
			"--color-border-light": "#ECE6DF",
			"--color-disabled": "#CFC6BC",

			// 骨架屏
			"--color-skeleton-base": "#ECE6DF",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.6)",

			// 圆角
			"--radius-card": "24rpx",
			"--radius-button": "20rpx",
			"--radius-sm": "12rpx",
			"--skeleton-radius": "12rpx",

			// 阴影
			"--shadow-soft": "0 10rpx 28rpx rgba(0, 0, 0, 0.06)",
			"--shadow-modal": "0 22rpx 52rpx rgba(0, 0, 0, 0.12)",
			"--shadow-soft-earth": "0 10rpx 26rpx rgba(165, 124, 74, 0.04)",
		},
	},

	// ---------------------------------------
	// 精致花展（原版保留，新增花瓣暖金）
	// ---------------------------------------
	"flower-bloom": {
		name: "精致花展（flower）",
		description: "浪漫清新，适合花海、植物园与花展主题公园。柔粉、薄荷与淡紫为主，花蕊黄点缀，营造浪漫、轻盈且高雅的氛围。",
		vars: {
			// 主色系（柔粉 / 桃粉）
			"--color-primary": "#F39AB9",
			"--color-primary-dark": "#E06A97",
			"--color-primary-hover": "#E06A97",
			"--color-primary-bg-light": "rgba(243, 154, 185, 0.06)",
			"--color-primary-border-light": "rgba(243, 154, 185, 0.12)",
			"--color-text-on-primary": "#FFFFFF",

			// 辅色与点缀
			"--color-secondary": "#FFD16B",
			"--color-accent": "#7FE3C7",
			"--color-warning": "#FFD16B",
			"--color-danger": "#E94B3C",
			"--color-accent-mint": "#7FE3C7",
			"--color-accent-lilac": "#C7A8F0",
			"--color-accent-stamen": "#FFD16B",
			// 会员金（花蕊暖金，柔和尊贵）
			"--color-member-gold": "#E0B354",

			// 中性色
			"--color-bg": "#FFFDFB",
			"--color-bg-card": "#FFFFFF",
			"--color-text": "#2F2D2B",
			"--color-text-secondary": "#7A6F6E",
			"--color-border-light": "#F3ECEB",
			"--color-disabled": "#DCD3CF",

			// 骨架屏
			"--color-skeleton-base": "#F5EEF0",
			"--color-skeleton-highlight": "rgba(255, 255, 255, 0.6)",

			// 圆角
			"--radius-card": "24rpx",
			"--radius-button": "20rpx",
			"--radius-sm": "12rpx",
			"--skeleton-radius": "12rpx",

			// 阴影
			"--shadow-soft": "0 12rpx 32rpx rgba(243, 154, 185, 0.06)",
			"--shadow-modal": "0 24rpx 56rpx rgba(0, 0, 0, 0.12)",
			"--shadow-mint": "0 10rpx 28rpx rgba(127, 227, 199, 0.05)",
		},
	},


};
// ============================================================================
// 常量
// ============================================================================

/** 默认主题key */
const DEFAULT_THEME = "natural-ecology";

/** localStorage 存储 key */
const STORAGE_KEY = "app-theme";

// ============================================================================
// 导出：主题数据
// ============================================================================

export {
	themes,
	DEFAULT_THEME,
	STORAGE_KEY
};

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