<template>
  <!-- Admin routes dùng AdminLayout, đã render riêng -->
  <div v-if="isAdminRoute" class="min-h-screen">
    <RouterView />
    <Toast />
  </div>

  <!-- Layout cho user -->
  <div v-else class="container mx-auto p-4">
    <header
      class="flex items-center justify-between mb-4 bg-white shadow-sm px-4 py-3 rounded-xl"
    >
      <h1 class="text-xl font-bold text-indigo-700">📚 Book Borrow</h1>
      <nav class="flex items-center gap-4 text-sm">
        <!-- Link cho USER -->
        <RouterLink
          v-if="auth.isUser()"
          to="/"
          class="hover:text-indigo-600"
        >
          Trang sách
        </RouterLink>
        <RouterLink
          v-if="auth.isUser()"
          to="/history"
          class="hover:text-indigo-600"
        >
          Lịch sử
        </RouterLink>

        <RouterLink
          v-if="auth.isUser()"
          to="/profile"
          class="hover:text-indigo-600"
        >
          Thông tin cá nhân
        </RouterLink>


        <!-- Link cho ADMIN -->
        <RouterLink
          v-if="auth.isAdmin()"
          to="/admin/dashboard"
          class="hover:text-indigo-600"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          v-if="auth.isAdmin()"
          to="/admin/books"
          class="hover:text-indigo-600"
        >
          QL Sách
        </RouterLink>
        <RouterLink
          v-if="auth.isAdmin()"
          to="/admin/borrows"
          class="hover:text-indigo-600"
        >
          QL Mượn
        </RouterLink>
        <RouterLink
          v-if="auth.isAdmin()"
          to="/admin/users"
          class="hover:text-indigo-600"
        >
          QL Tài khoản
        </RouterLink>

        <!-- Chưa đăng nhập -->
        <RouterLink
          v-if="!auth.user"
          to="/login"
          class="px-3 py-1 rounded-lg border border-indigo-500 text-indigo-600"
        >
          Đăng nhập
        </RouterLink>
        <RouterLink
          v-if="!auth.user"
          to="/register"
          class="px-3 py-1 rounded-lg bg-indigo-500 text-white"
        >
          Đăng ký
        </RouterLink>

        <!-- Đã đăng nhập -->
        <div v-if="auth.user" class="flex items-center gap-2">
          <span class="text-xs text-slate-600">
            {{ auth.user.username }} ({{ auth.user.role }})
          </span>
          <button
            class="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
            @click="logout"
          >
            Đăng xuất
          </button>
        </div>
      </nav>
    </header>

    <!-- Không còn section readerId -->

    <RouterView />
    <Toast />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, RouterView, useRouter, useRoute } from "vue-router";
import { auth } from "@/stores/auth";
import Toast from "@/components/Toast.vue";

const router = useRouter();
const route = useRoute();

const isAdminRoute = computed(() => route.path.startsWith("/admin"));

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<style>
.container {
  max-width: 1000px;
}
</style>
