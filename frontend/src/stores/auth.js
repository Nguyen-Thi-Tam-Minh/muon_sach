import { reactive } from "vue";

const AUTH_KEY = "auth";

export const auth = reactive({
  token: "",
  user: null,

  init() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      this.token = parsed.token;
      this.user = parsed.user;
    }
  },

  login(token, user) {
    this.token = token;
    this.user = user; // { id, username, role, readerId }
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
  },

  logout() {
    this.token = "";
    this.user = null;
    localStorage.removeItem(AUTH_KEY);
  },

  isAdmin() {
    return this.user?.role === "admin";
  },

  isUser() {
    return this.user?.role === "user";
  },

  readerId() {
    return this.user?.readerId || null;
  },
});

auth.init();
