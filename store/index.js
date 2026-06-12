import { reactive } from "vue";
import { getStoredThemeKey, getThemeVars } from "@/styles/themes.js";

// Vue 3 组合式响应 Store（兼容 Pinia 风格，无需额外依赖）
const state = reactive({
  isSow: 0,
  tickId: null,
  // 主题状态
  currentTheme: getStoredThemeKey(),
  themeVars: getThemeVars(),
  // 餐厅订单相关
  paymen: null,
  payDay: [],
  number_people: '',
  order: null,
  orderRemark: '',
});

// 修改方法
function setTickId(id) {
  state.tickId = id;
}
function setIsSow(val) {
  state.isSow = val;
}

/**
 * 切换主题（响应式更新）
 * @param {string} key - 主题 key
 */
function setTheme(key) {
  state.currentTheme = key;
  state.themeVars = getThemeVars(key);
}

// 餐厅订单状态写入
function setPaymen(data) {
  state.paymen = data;
}
function setPayDay(data) {
  state.payDay = data;
}
function setNumberPeople(num) {
  state.number_people = num;
}
function setOrder(id) {
  state.order = id;
}
function setOrderRemark(remark) {
  state.orderRemark = remark;
}

// useStore() 供组件调用
export function useStore() {
  return {
    state,
    setTickId, setIsSow, setTheme,
    setPaymen, setPayDay, setNumberPeople, setOrder, setOrderRemark,
  };
}

// 兼容旧的 this.$store.state.xxx 访问
export default { state };
