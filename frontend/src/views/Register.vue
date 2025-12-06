<template>
  <div class="flex items-center justify-center min-h-[70vh] bg-slate-50">
    <div class="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-center">Đăng ký tài khoản</h2>

      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input
            v-model="username"
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium mb-1">Họ lót</label>
            <input
              v-model="hoLot"
              class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Tên</label>
            <input
              v-model="ten"
              class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Điện thoại</label>
          <input
            v-model="dienThoai"
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Nhập lại password</label>
          <input
            v-model="confirm"
            type="password"
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          class="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          type="submit"
        >
          Đăng ký
        </button>

        <p v-if="error" class="text-sm text-red-600 text-center">{{ error }}</p>
        <p v-if="success" class="text-sm text-emerald-600 text-center">
          Đăng ký thành công! Mời bạn
          <RouterLink to="/login" class="underline">đăng nhập</RouterLink>.
        </p>
      </form>

      <p class="mt-4 text-center text-sm">
        Đã có tài khoản?
        <RouterLink to="/login" class="text-indigo-600 underline">Đăng nhập</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthService from "@/services/auth.service";

const username = ref("");
const hoLot = ref("");
const ten = ref("");
const dienThoai = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const success = ref(false);

async function submit() {
  error.value = "";
  success.value = false;

  if (password.value !== confirm.value) {
    error.value = "Mật khẩu nhập lại không khớp.";
    return;
  }

  try {
    await AuthService.register({
      username: username.value.trim(),
      password: password.value,
      hoLot: hoLot.value.trim(),
      ten: ten.value.trim(),
      dienThoai: dienThoai.value.trim(),
    });
    success.value = true;
    username.value = "";
    password.value = "";
    confirm.value = "";
    hoLot.value = "";
    ten.value = "";
    dienThoai.value = "";
  } catch (e) {
    error.value = "Đăng ký thất bại (username có thể đã tồn tại).";
  }
}
</script>
