<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400">
    <div class="bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-8 w-full max-w-md">
      <div class="flex items-center justify-center mb-6 gap-2">
        <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl">
          📚
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800">Book Borrow System</h1>
          <p class="text-xs text-slate-500">Đăng nhập để quản lý & mượn sách</p>
        </div>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-slate-700">Username</label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-slate-400 text-sm">👤</span>
            <input
              v-model="username"
              class="border rounded-lg pl-9 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-slate-700">Password</label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔒</span>
            <input
              :type="showPwd ? 'text' : 'password'"
              v-model="password"
              class="border rounded-lg pl-9 pr-9 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Nhập mật khẩu"
              required
            />
            <button
              type="button"
              class="absolute right-3 top-2 text-xs text-slate-500 hover:text-slate-700"
              @click="showPwd = !showPwd"
            >
              {{ showPwd ? "Ẩn" : "Hiện" }}
            </button>
          </div>
        </div>

        <button
          class="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
          type="submit"
        >
          Đăng nhập
        </button>

        <p v-if="error" class="text-xs text-rose-600 text-center">{{ error }}</p>

        <p class="mt-2 text-xs text-center text-slate-500">
          Chưa có tài khoản?
          <RouterLink to="/register" class="text-indigo-100 underline font-medium">
            Đăng ký ngay
          </RouterLink>
        </p>
      </form>

      <div class="mt-6 text-[11px] text-slate-400 text-center">
        <p>Demo: admin / admin123 (nếu bạn chưa đổi trong server).</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import AuthService from "@/services/auth.service";
import { auth } from "@/stores/auth";
import { showToast } from "@/stores/toast";

const username = ref("");
const password = ref("");
const error = ref("");
const showPwd = ref(false);
const router = useRouter();

async function submit() {
  error.value = "";
  try {
    const res = await AuthService.login(username.value, password.value);
    auth.login(res.token, res.user);
    showToast("Đăng nhập thành công!", "success");

    if (auth.isAdmin()) router.push("/admin/dashboard");
    else router.push("/");
  } catch (e) {
    error.value = "Sai tài khoản hoặc mật khẩu";
    showToast(error.value, "error");
  }
}
</script>
