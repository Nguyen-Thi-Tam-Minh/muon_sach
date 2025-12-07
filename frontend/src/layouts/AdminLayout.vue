<template>
  <div class="min-h-screen flex bg-slate-100">
    <aside class="bg-white shadow-lg w-64 flex-shrink-0 fixed inset-y-0 left-0 z-20 transform transition-transform duration-200
            md:translate-x-0" :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
      <div class="h-full flex flex-col">
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h1 class="text-lg font-bold text-indigo-700">Admin Panel</h1>
          <button class="md:hidden text-slate-500" @click="toggleSidebar">
            ✕
          </button>
        </div>

        <nav class="flex-1 px-3 py-4 text-sm space-y-1">
          <RouterLink v-for="item in links" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 text-slate-700 transition-colors"
            :class="isActive(item.to) ? 'bg-indigo-100 text-indigo-700 font-semibold' : ''">
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>

          <div class="my-2 border-t border-slate-100"></div>

          <RouterLink to="/"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 text-slate-700 transition-colors">
            <span class="text-base">🏠</span>
            <span>Về trang chủ</span>
          </RouterLink>
        </nav>

        <div class="px-6 py-4 border-t text-xs text-slate-500 bg-slate-50">
          Đang đăng nhập: <br>
          <b class="text-slate-700">{{ auth.user?.username }}</b> ({{ auth.user?.role }})
        </div>
      </div>
    </aside>

    <div class="fixed inset-0 bg-black/30 z-10 md:hidden" v-if="sidebarOpen" @click="toggleSidebar"></div>

    <div class="flex-1 flex flex-col md:ml-64 transition-all duration-200">
      <header class="h-14 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <button class="md:hidden text-slate-600 focus:outline-none" @click="toggleSidebar">
            <i class="fa-solid fa-bars text-xl"></i> ☰
          </button>
          <h2 class="text-sm font-semibold text-slate-700 hidden sm:block">
            Dashboard quản trị
          </h2>
        </div>
        <button
          class="text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
          @click="logout">
          Đăng xuất
        </button>
      </header>

      <main class="p-6 flex-1 overflow-x-hidden">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { auth } from "@/stores/auth";

const sidebarOpen = ref(false);
const route = useRoute();
const router = useRouter();

const links = [
  { to: "/admin/dashboard", label: "Tổng quan", icon: "📊" },
  { to: "/admin/books", label: "Quản lý Sách", icon: "📚" },
  { to: "/admin/publishers", label: "Quản lý NXB", icon: "🏢" },
  // Đã sửa nhãn hiển thị tại đây theo yêu cầu của bạn
  { to: "/admin/borrows", label: "Quản lý mượn và trả sách", icon: "📄" },
  { to: "/admin/users", label: "Quản lý Tài khoản", icon: "👤" },
];

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
function isActive(path) {
  return route.path.startsWith(path);
}
function logout() {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    auth.logout();
    router.push("/login");
  }
}
</script>