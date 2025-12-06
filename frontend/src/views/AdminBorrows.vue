<template>
  <section>
    <h2 class="text-xl font-semibold mb-3">Quản lý phiếu mượn</h2>

    <div class="bg-white border rounded-xl p-4 shadow-sm">
      <!-- Filter + page size -->
      <div
        class="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex gap-2 items-center">
          <span class="text-sm text-slate-600">Trạng thái:</span>
          <select
            class="border rounded-lg p-2 text-sm"
            v-model="status"
            @change="reload"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="borrowed">Đang mượn</option>
            <option value="returned">Đã trả</option>
          </select>
          <button
            class="px-3 py-2 text-xs rounded-lg border hover:bg-slate-50"
            @click="reload"
          >
            Làm mới
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">Hiển thị</span>
          <select
            v-model.number="pageSize"
            class="border rounded-lg p-1.5 text-xs"
          >
            <option :value="5">5 / trang</option>
            <option :value="10">10 / trang</option>
            <option :value="20">20 / trang</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full border text-sm">
          <thead>
            <tr class="bg-slate-50">
              <th class="border p-2">Reader</th>
              <th class="border p-2">Sách</th>
              <th
                class="border p-2 cursor-pointer text-center"
                @click="setSort('status')"
              >
                Trạng thái
                <span
                  v-if="sortKey === 'status'"
                  class="inline-block ml-1 text-[10px]"
                >
                  {{ sortDir === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th
                class="border p-2 cursor-pointer text-center"
                @click="setSort('ngayMuon')"
              >
                Ngày mượn
                <span
                  v-if="sortKey === 'ngayMuon'"
                  class="inline-block ml-1 text-[10px]"
                >
                  {{ sortDir === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th
                class="border p-2 cursor-pointer text-center"
                @click="setSort('ngayTra')"
              >
                Ngày trả
                <span
                  v-if="sortKey === 'ngayTra'"
                  class="inline-block ml-1 text-[10px]"
                >
                  {{ sortDir === "asc" ? "▲" : "▼" }}
                </span>
              </th>
              <th class="border p-2 text-center">Hạn trả</th>
              <th class="border p-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginatedRows" :key="r._id">
              <td class="border p-2 text-xs">
                <div class="font-mono">{{ r.maDocGia }}</div>
              </td>
              <td class="border p-2">
                {{ bookName(r.maSach) }}
              </td>
              <td class="border p-2 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusClass(r.status)"
                >
                  {{ r.status }}
                </span>
              </td>
              <td class="border p-2 text-center text-xs">
                {{ fmt(r.ngayMuon) }}
              </td>
              <td class="border p-2 text-center text-xs">
                {{ fmt(r.ngayTra) }}
              </td>
              <td class="border p-2 text-center text-xs">
                {{ fmt(r.dueDate) }}
                <div
                  v-if="isOverdue(r)"
                  class="text-[11px] text-rose-600 mt-1"
                >
                  Quá hạn!
                </div>
              </td>
              <td class="border p-2 text-center">
                <div class="flex flex-wrap gap-1 justify-center text-xs">
                  <button
                    v-if="r.status === 'pending'"
                    class="px-2 py-1 border rounded hover:bg-slate-50"
                    @click="approve(r)"
                  >
                    Duyệt
                  </button>
                  <button
                    v-if="r.status === 'pending' || r.status === 'approved'"
                    class="px-2 py-1 border rounded hover:bg-slate-50"
                    @click="borrowed(r)"
                  >
                    Đã mượn
                  </button>
                  <button
                    v-if="r.status === 'borrowed'"
                    class="px-2 py-1 border rounded hover:bg-slate-50"
                    @click="returned(r)"
                  >
                    Đã trả
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!paginatedRows.length">
              <td colspan="7" class="border p-2 text-center text-slate-500">
                Không có phiếu mượn.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between mt-3 text-xs"
      >
        <div>
          Trang {{ currentPage }} / {{ totalPages }}
          <span class="text-slate-500">
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
import { ref, computed, onMounted } from "vue";
import BorrowService from "@/services/borrow.service";
import BookService from "@/services/book.service";
import { showToast } from "@/stores/toast";

const status = ref("");
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

async function loadBase() {
  books.value = await BookService.getAll();
}

async function reload() {
  const params = {};
  if (status.value) params.status = status.value;
  rows.value = await BorrowService.list(params);
  currentPage.value = 1;
}

onMounted(async () => {
  await loadBase();
  await reload();
});

// SORT + PAGINATION
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

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

// ACTIONS (fix: luôn reload, show toast nếu lỗi)
async function approve(r) {
  try {
    await BorrowService.approve(r._id);
    showToast("Đã duyệt phiếu mượn", "success");
  } catch (e) {
    showToast(
      e?.response?.data?.message || "Không duyệt được phiếu mượn",
      "error"
    );
  } finally {
    await reload();
  }
}
async function borrowed(r) {
  try {
    await BorrowService.markBorrowed(r._id);
    showToast("Đã ghi nhận 'đã mượn'", "success");
  } catch (e) {
    showToast(
      e?.response?.data?.message || "Không thể chuyển sang 'đã mượn'",
      "error"
    );
  } finally {
    await reload();
  }
}
async function returned(r) {
  try {
    await BorrowService.markReturned(r._id);
    showToast("Đã trả sách", "success");
  } catch (e) {
    showToast(
      e?.response?.data?.message || "Không thể ghi nhận 'đã trả'",
      "error"
    );
  } finally {
    await reload();
  }
}
</script>
