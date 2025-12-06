<template>
  <div v-if="isAdminRoute" class="min-h-screen font-sans bg-gray-50">
    <RouterView />
    <Toast />
  </div>

  <div v-else class="flex flex-col min-h-screen font-sans bg-gray-50">

    <AppHeader />

    <main class="flex-1 container mx-auto px-4 py-8">
      <RouterView />
    </main>

    <AppFooter />

    <Toast />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Toast from "@/components/Toast.vue";
import AppHeader from "@/components/AppHeader.vue"; // Import component mới
import AppFooter from "@/components/AppFooter.vue"; // Import component mới

const route = useRoute();

// Kiểm tra xem có phải trang Admin không để ẩn Header/Footer user
const isAdminRoute = computed(() => route.path.startsWith("/admin"));
</script>

<style>
/* CSS Reset cơ bản nếu cần */
body {
  margin: 0;
  padding: 0;
}
</style>