<template>
  <section>
    <h2 class="text-xl font-semibold mb-4">Tổng quan hệ thống</h2>

    <div v-if="loading" class="text-sm text-slate-500">Đang tải...</div>

    <div v-else class="grid gap-4 md:grid-cols-3">
      <div class="bg-white border rounded-xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 mb-1">Tổng số sách</div>
        <div class="text-2xl font-bold text-indigo-600">
          {{ stats.totalBooks }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">
          Tất cả đầu sách có trong thư viện.
        </div>
      </div>

      <div class="bg-white border rounded-xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 mb-1">Độc giả</div>
        <div class="text-2xl font-bold text-emerald-600">
          {{ stats.totalReaders }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">
          Số lượng độc giả đã đăng ký.
        </div>
      </div>

      <div class="bg-white border rounded-xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 mb-1">Tổng số phiếu mượn</div>
        <div class="text-2xl font-bold text-slate-800">
          {{ stats.totalBorrows }}
        </div>
        <div class="flex gap-2 text-[11px] text-slate-500 mt-1">
          <span class="px-2 py-0.5 rounded-full bg-slate-100">
            Pending: {{ stats.pendingBorrows }}
          </span>
          <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Đang mượn: {{ stats.borrowedBorrows }}
          </span>
          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Đã trả: {{ stats.returnedBorrows }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import StatsService from "@/services/stats.service";

const stats = ref({
  totalBooks: 0,
  totalReaders: 0,
  totalBorrows: 0,
  pendingBorrows: 0,
  borrowedBorrows: 0,
  returnedBorrows: 0,
});
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await StatsService.getOverview();
    stats.value = data;
  } finally {
    loading.value = false;
  }
});
</script>
