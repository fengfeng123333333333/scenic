import { reactive } from "vue";

// Vue 3 组合式响应 Store（兼容 Pinia 风格，无需额外依赖）
const state = reactive({
  isSow: 0,
  tickId: null,
});

// 修改方法
function setTickId(id) {
  state.tickId = id;
}
function setIsSow(val) {
  state.isSow = val;
}

// useStore() 供组件调用
export function useStore() {
  return { state, setTickId, setIsSow };
}

// 兼容旧的 this.$store.state.xxx 访问
export default { state };
