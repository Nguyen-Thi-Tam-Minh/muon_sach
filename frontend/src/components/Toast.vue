<template>
  <transition name="fade">
    <div
      v-if="toast.visible"
      class="fixed bottom-4 right-4 z-50 max-w-xs px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2"
      :class="bgClass"
    >
      <span v-if="toast.type === 'success'">✅</span>
      <span v-else-if="toast.type === 'error'">⚠️</span>
      <span v-else>ℹ️</span>
      <span>{{ toast.message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";
import { toast } from "@/stores/toast";

const bgClass = computed(() => {
  if (toast.type === "success")
    return "bg-emerald-100 text-emerald-800 border border-emerald-200";
  if (toast.type === "error")
    return "bg-rose-100 text-rose-800 border border-rose-200";
  return "bg-slate-100 text-slate-800 border border-slate-200";
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
