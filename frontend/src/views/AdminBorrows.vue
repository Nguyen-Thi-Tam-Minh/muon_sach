<template>
  <section>
    <h2 class="text-xl font-semibold mb-3">Quản lý Mượn/Trả</h2>
    <p class="text-sm text-gray-500 mb-4">Theo dõi và quản lý tất cả các hoạt động mượn trả sách trong hệ thống.</p>

    <div class="bg-white border rounded-xl p-4 shadow-sm">
      <div class="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
        <div class="flex gap-2 items-center flex-wrap">

          <div class="flex bg-gray-100 p-1 rounded-lg">
            <button v-for="s in ['all', 'pending', 'borrowed', 'returned']" :key="s"
              @click="status = (s === 'all' ? '' : s); reload()"
              class="px-3 py-1 text-xs font-medium rounded-md transition-all"
              :class="(status === s || (s === 'all' && !status)) ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
              {{ statusLabel(s) }}
            </button>
          </div>

          <button class="px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50 flex items-center gap-1"
            @click="reload">
            <span>↻</span> Làm mới
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">Hiển thị</span>
          <select v-model.number="pageSize"
            class="border rounded-lg p-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
            <option :value="5">5 trang</option>
            <option :value="10">10 trang</option>
            <option :value="20">20 trang</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border text-sm text-left">
          <thead>
            <tr class="bg-slate-50 text-slate-600">
              <th class="border p-3 font-semibold">Tên sách</th>
              <th class="border p-3 font-semibold">Người mượn</th>
              <th class="border p-3 font-semibold text-center cursor-pointer" @click="setSort('ngayMuon')">
                Ngày mượn <span v-if="sortKey === 'ngayMuon'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th class="border p-3 font-semibold text-center">Ngày hẹn trả</th>
              <th class="border p-3 font-semibold text-center">Trạng thái</th>
              <th class="border p-3 font-semibold text-center w-32">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginatedRows" :key="r._id" class="hover:bg-slate-50 transition-colors">
              <td class="border p-3 font-medium text-slate-800 align-middle">
                {{ r.book?.title || 'Sách không tồn tại' }}
                <div class="text-[10px] text-gray-400 mt-1">ID Phiếu: ...{{ r._id.slice(-6) }}</div>
              </td>

              <td class="border p-3 align-middle">
                <div class="font-medium text-indigo-600">{{ getReaderName(r) }}</div>
                <div class="text-[10px] text-gray-400 font-mono hidden group-hover:block">{{ r.maDocGia }}</div>
              </td>

              <td class="border p-3 text-center text-xs align-middle">
                {{ fmt(r.ngayMuon) || '---' }}
              </td>

              <td class="border p-3 text-center text-xs align-middle">
                <div v-if="r.dueDate">
                  {{ fmt(r.dueDate) }}
                  <div v-if="isOverdue(r)"
                    class="text-[10px] text-rose-600 font-bold mt-1 bg-rose-50 inline-block px-1 rounded">
                    Quá hạn
                  </div>
                </div>
                <span v-else class="text-gray-400">---</span>
              </td>

              <td class="border p-3 text-center align-middle">
                <div class="flex flex-col items-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap"
                    :class="statusClass(r)">
                    {{ formatStatus(r) }}
                  </span>
                </div>
              </td>

              <td class="border p-3 text-center align-middle">
                <div class="flex items-center justify-center gap-2">

                  <button v-if="['pending', 'approved'].includes(r.status)" @click="borrowed(r)"
                    class="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition shadow-sm whitespace-nowrap font-medium">
                    Duyệt
                  </button>

                  <button v-if="r.status === 'borrowed'" @click="returned(r)"
                    class="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition whitespace-nowrap">
                    Đã trả
                  </button>

                  <button @click="remove(r)"
                    class="text-xs w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-full transition"
                    title="Xóa phiếu">
                    ✕
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!paginatedRows.length">
              <td colspan="6" class="border p-8 text-center text-slate-500 italic">
                Không tìm thấy dữ liệu phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 text-xs text-slate-600">
        <div>Trang {{ currentPage }} / {{ totalPages }} ({{ rows.length }} phiếu)</div>
        <div class="flex gap-1">
          <button class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" :disabled="currentPage === 1"
            @click="currentPage--">Trước</button>
          <button class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            :disabled="currentPage === totalPages" @click="currentPage++">Sau</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BorrowService from "@/services/borrow.service";
import createApiClient from "@/services/api.service";
import { showToast } from "@/stores/toast";

const status = ref("");
const rows = ref([]);
const sortKey = ref("ngayMuon");
const sortDir = ref("desc");
const currentPage = ref(1);
const pageSize = ref(5);

const api = createApiClient("/api/borrows");

function statusLabel(s) {
  const map = { all: 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt', borrowed: 'Đang mượn', returned: 'Đã trả' };
  return map[s] || s;
}

// === LOGIC MỚI ĐỂ HIỂN THỊ TRẠNG THÁI ===
function formatStatus(r) {
  // 1. Ưu tiên: Nếu DB đã có cờ lateReturn (Bạn set tay trong DB hoặc do trả trễ) -> Hiện "Trả trễ"
  if (r.lateReturn) {
    return "Trả trễ";
  }

  // 2. Nếu đang mượn nhưng đã quá ngày -> Hiện "Trả trễ"
  if (isOverdue(r)) {
    return "Trả trễ";
  }

  const map = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    borrowed: "Đang mượn",
    returned: "Đã trả",
    rejected: "Từ chối"
  };
  return map[r.status] || r.status;
}

function statusClass(r) {
  // Nếu bị trễ (do DB hoặc do quá hạn) -> Màu Đỏ
  if (r.lateReturn || isOverdue(r)) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  switch (r.status) {
    case "pending": return "bg-gray-100 text-gray-600 border-gray-200";
    case "approved": return "bg-amber-50 text-amber-700 border-amber-200";
    case "borrowed": return "bg-blue-50 text-blue-700 border-blue-200";
    case "returned": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default: return "bg-gray-50 text-gray-500 border-gray-200";
  }
}

function isOverdue(r) {
  // Logic: Đang mượn VÀ có hạn trả VÀ (Hạn trả < Hiện tại)
  return r.status === "borrowed" && r.dueDate && new Date(r.dueDate).getTime() < Date.now();
}
// ===========================================

function getReaderName(r) {
  if (r.reader) {
    const fullName = `${r.reader.hoLot || ''} ${r.reader.ten || ''}`.trim();
    return fullName || "Độc giả không tên";
  }
  return "Không xác định";
}

function fmt(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("vi-VN");
}

async function reload() {
  try {
    const params = {};
    if (status.value) params.status = status.value;
    rows.value = await BorrowService.list(params);
    currentPage.value = 1;
  } catch (e) {
    console.error(e);
    showToast("Không tải được danh sách", "error");
  }
}

onMounted(reload);

const sortedRows = computed(() => {
  const arr = [...rows.value];
  arr.sort((a, b) => {
    let va = a[sortKey.value];
    let vb = b[sortKey.value];
    if (["ngayMuon", "dueDate", "createdAt"].includes(sortKey.value)) {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
    }
    if (va < vb) return sortDir.value === "asc" ? -1 : 1;
    if (va > vb) return sortDir.value === "asc" ? 1 : -1;
    return 0;
  });
  return arr;
});

const totalPages = computed(() => Math.ceil(sortedRows.value.length / pageSize.value) || 1);
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedRows.value.slice(start, start + pageSize.value);
});

function setSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  else { sortKey.value = key; sortDir.value = "desc"; }
}

// ACTIONS
async function borrowed(r) {
  try {
    await BorrowService.markBorrowed(r._id);
    showToast("Đã duyệt và xác nhận mượn", "success");
    await reload();
  } catch (e) { showToast(e.response?.data?.message || "Lỗi", "error"); }
}

async function returned(r) {
  if (!confirm("Xác nhận độc giả đã trả sách?")) return;
  try {
    await BorrowService.markReturned(r._id);
    showToast("Đã trả sách", "success");
    await reload();
  } catch (e) { showToast("Lỗi trả sách", "error"); }
}

async function remove(r) {
  if (!confirm("Bạn có chắc chắn muốn xóa phiếu mượn này không?")) return;
  try {
    await api.delete(`/${r._id}`);
    showToast("Đã xóa phiếu", "success");
    rows.value = rows.value.filter(item => item._id !== r._id);
  } catch (e) {
    showToast("Không thể xóa phiếu", "error");
  }
}
</script>