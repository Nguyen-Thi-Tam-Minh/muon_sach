<template>
  <section>
    <h2 class="text-xl font-semibold mb-3">Lịch sử mượn của tôi</h2>

    <div v-if="!auth.readerId()" class="text-sm text-rose-600 mb-3">
      Bạn cần đăng nhập bằng tài khoản user để xem lịch sử.
    </div>

    <div v-else class="bg-white border rounded-xl p-4 shadow-sm">
      <div
        class="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-2 text-sm">
          <span class="text-slate-600">Sắp xếp theo:</span>
          <select
            v-model="sortKey"
            class="border rounded-lg p-1.5 text-xs"
          >
            <option value="ngayMuon">Ngày mượn</option>
            <option value="ngayTra">Ngày trả</option>
            <option value="status">Trạng thái</option>
          </select>
          <button
            class="px-2 py-1 border rounded-lg text-xs"
            @click="toggleDir"
          >
            {{ sortDir === "asc" ? "↑ Tăng dần" : "↓ Giảm dần" }}
          </button>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="text-slate-500">Hiển thị</span>
          <select
            v-model.number="pageSize"
            class="border rounded-lg p-1.5 text-xs"
          >
            <option :value="5">5 / trang</option>
            <option :value="10">10 / trang</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border text-sm">
          <thead>
            <tr class="bg-slate-50">
              <th class="border p-2 text-left">Sách</th>
              <th class="border p-2 text-center">Trạng thái</th>
              <th class="border p-2 text-center">Ngày mượn</th>
              <th class="border p-2 text-center">Hạn trả</th>
              <th class="border p-2 text-center">Ngày trả</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginatedRows" :key="r._id">
              <td class="border p-2">
                <div class="font-semibold">
                  {{ bookName(r.maSach) }}
                </div>
                <div class="text-[11px] text-slate-500">
                  ID phiếu: {{ r._id }}
                </div>
              </td>
              <td class="border p-2 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusClass(r.status)"
                >
                  {{ r.status }}
                </span>
                <div
                  v-if="isOverdue(r)"
                  class="text-[11px] text-rose-600 mt-1"
                >
                  Quá hạn trả!
                </div>
              </td>
              <td class="border p-2 text-center text-xs">
                {{ fmt(r.ngayMuon) }}
              </td>
              <td class="border p-2 text-center text-xs">
                {{ fmt(r.dueDate) }}
              </td>
              <td class="border p-2 text-center text-xs">
                {{ fmt(r.ngayTra) }}
              </td>
            </tr>
            <tr v-if="!paginatedRows.length">
              <td colspan="5" class="border p-2 text-center text-slate-500">
                Bạn chưa có lịch sử mượn sách.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between mt-3 text-xs text-slate-600"
      >
        <div>
          Trang {{ currentPage }} / {{ totalPages }}
          <span class="text-slate-400">
            ({{ rows.length }} phiếu)
          </span>
        </div>
        <div class="flex gap-1">
          <button
            class="px-2 py-1 border rounded disabled:opacity-40"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            ‹
          </button>
          <button
            class="px-2 py-1 border rounded disabled:opacity-40"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import BorrowService from "@/services/borrow.service";
import BookService from "@/services/book.service";
import { auth } from "@/stores/auth";

const rows = ref([]);
const books = ref([]);

const sortKey = ref("ngayMuon");
const sortDir = ref("desc");
const currentPage = ref(1);
const pageSize = ref(5);

const bookMap = computed(() =>
  Object.fromEntries(books.value.map((b) => [b._id, b]))
);

function bookName(id) {
  return bookMap.value[id]?.title || id;
}
function fmt(d) {
  return d ? new Date(d).toLocaleString() : "";
}
function isOverdue(r) {
  return (
    r.status === "borrowed" &&
    r.dueDate &&
    new Date(r.dueDate).getTime() < Date.now()
  );
}
function statusClass(s) {
  switch (s) {
    case "pending":
      return "bg-slate-100 text-slate-700";
    case "approved":
      return "bg-amber-100 text-amber-800";
    case "borrowed":
      return "bg-blue-100 text-blue-800";
    case "returned":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

async function load() {
  const rid = auth.readerId();
  if (!rid) return;
  books.value = await BookService.getAll();
  rows.value = await BorrowService.list({ maDocGia: rid });
  currentPage.value = 1;
}

onMounted(load);

watch(
  () => auth.readerId(),
  () => {
    load();
  }
);

// SORT & PAGINATION
const sortedRows = computed(() => {
  const arr = [...rows.value];
  arr.sort((a, b) => {
    let va = a[sortKey.value];
    let vb = b[sortKey.value];

    if (sortKey.value === "ngayMuon" || sortKey.value === "ngayTra") {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
    }

    if (va == null && vb == null) return 0;
    if (va == null) return sortDir.value === "asc" ? 1 : -1;
    if (vb == null) return sortDir.value === "asc" ? -1 : 1;

    if (typeof va === "number" && typeof vb === "number") {
      return sortDir.value === "asc" ? va - vb : vb - va;
    }

    const sa = String(va).toLowerCase();
    const sb = String(vb).toLowerCase();
    if (sa < sb) return sortDir.value === "asc" ? -1 : 1;
    if (sa > sb) return sortDir.value === "asc" ? 1 : -1;
    return 0;
  });
  return arr;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / pageSize.value))
);

const paginatedRows = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedRows.value.slice(start, start + pageSize.value);
});

function toggleDir() {
  sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
}
</script>
