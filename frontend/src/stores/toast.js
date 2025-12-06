import { reactive } from "vue";

const state = reactive({
  visible: false,
  message: "",
  type: "info", // 'info' | 'success' | 'error'
});

let timer = null;

export const toast = state;

export function showToast(message, type = "info", duration = 3000) {
  state.message = message;
  state.type = type;
  state.visible = true;

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    state.visible = false;
  }, duration);
}
