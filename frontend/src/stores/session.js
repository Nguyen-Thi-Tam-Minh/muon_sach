import { reactive } from "vue";
const KEY = "readerId";
export const session = reactive({
  readerId: localStorage.getItem(KEY) || "",
  set(id) { this.readerId = id; localStorage.setItem(KEY, id); },
  clear() { this.readerId = ""; localStorage.removeItem(KEY); }
});
