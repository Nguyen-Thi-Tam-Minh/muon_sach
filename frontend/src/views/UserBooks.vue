<template>
  <section>
    <div class="flex gap-2 mb-3 flex-wrap">
      <input
        class="border rounded-lg p-2 flex-1 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        v-model="q"
        placeholder="Tìm theo tên sách, tác giả, NXB, tags..."
        @keyup.enter="currentPage = 1"
      />
      <select
        v-model.number="pageSize"
        class="border rounded-lg p-2 text-sm"
      >
        <option :value="5">5 / trang</option>
        <option :value="10">10 / trang</option>
        <option :value="20">20 / trang</option>
      </select>
    </div>

    <div class="overflow-x-auto bg-white border rounded-xl shadow-sm">
      <table class="w-full text-sm">
      <thead>
        <tr class="bg-slate-50">
          <th
            class="p-2 border text-left cursor-pointer"
            @click="setSort('title')"
          >
            Tên sách
            <span
              v-if="sortKey === 'title'"
              class="inline-block ml-1 text-[10px]"
            >
              {{ sortDir === "asc" ? "▲" : "▼" }}
            </span>
          </th>
          <th
            class="p-2 border text-left cursor-pointer"
            @click="setSort('author')"
          >
            Tác giả
            <span
              v-if="sortKey === 'author'"
              class="inline-block ml-1 text-[10px]"
            >
              {{ sortDir === "asc" ? "▲" : "▼" }}
            </span>
          </th>
          <th
            class="p-2 border text-center cursor-pointer w-24"
            @click="setSort('copies')"
          >
            Còn
            <span
              v-if="sortKey === 'copies'"
              class="inline-block ml-1 text-[10px]"
            >
              {{ sortDir === "asc" ? "▲" : "▼" }}
            </span>
          </th>
          <th class="p-2 border text-center w-40">Hành động</th>
        </tr>
      </thead>

        <tbody>
          <tr v-for="b in paginatedBooks" :key="b._id">
            <td class="p-2 border align-top">
              <div class="font-semibold">{{ b.title }}</div>
              <div class="text-xs text-slate-500" v-if="b.publisher">
                NXB: {{ b.publisher }}
              </div>
              <div class="text-[11px] text-slate-400" v-if="b.tags?.length">
                Tags: {{ b.tags.join(", ") }}
              </div>
            </td>
            <td class="p-2 border align-top">
              {{ b.author || "-" }}
            </td>
            <td class="p-2 border text-center align-top">
              {{ b.copies ?? 0 }}
            </td>
            <td class="p-2 border text-center align-top">
              <button
                class="px-3 py-1 rounded-lg border text-xs hover:bg-slate-50"
                :disabled="!canBorrow(b)"
                @click="borrow(b)"
              >
                Mượn
              </button>
              <div v-if="!auth.readerId()" class="mt-1 text-[11px] text-rose-500">
                Hãy nhập readerId ở trên.
              </div>
              <div
                v-else-if="(b.copies ?? 0) <= 0"
                class="mt-1 text-[11px] text-slate-500"
              >
                Hết sách.
              </div>
            </td>
          </tr>
          <tr v-if="!paginatedBooks.length">
            <td colspan="4" class="p-3 border text-center text-slate-500">
              Không có sách phù hợp.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination info -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between mt-3 text-xs text-slate-600"
    >
      <div>
        Trang {{ currentPage }} / {{ totalPages }}
        <span class="text-slate-400">
          ({{ filteredBooks.length }} sách)
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
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BookService from "@/services/book.service";
import BorrowService from "@/services/borrow.service";
import { auth } from "@/stores/auth";
import { showToast } from "@/stores/toast";

const books = ref([]);
const q = ref("");
const sortKey = ref("title");
const sortDir = ref("asc");
const currentPage = ref(1);
const pageSize = ref(5);
const loading = ref(false);

function canBorrow(b) {
  return auth.readerId() && (b.copies ?? 0) > 0;
}

async function load() {
  loading.value = true;
  try {
    books.value = await BookService.getAll();
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// FILTER + SORT + PAGINATION giống bản trước (giữ nguyên)
const filteredBooks = computed(() => {
  if (!q.value) return books.value;
  const key = q.value.toLowerCase();
  return books.value.filter((b) => {
    const fields = [
      b.title,
      b.author,
      b.publisher,
      Array.isArray(b.tags) ? b.tags.join(" ") : "",
    ].filter(Boolean);
    return fields.some((s) => s.toLowerCase().includes(key));
  });
});

const sortedBooks = computed(() => {
  const arr = [...filteredBooks.value];
  arr.sort((a, b) => {
    const ka = a[sortKey.value];
    const kb = b[sortKey.value];
    if (ka == null && kb == null) return 0;
    if (ka == null) return sortDir.value === "asc" ? 1 : -1;
    if (kb == null) return sortDir.value === "asc" ? -1 : 1;
    if (typeof ka === "number" && typeof kb === "number") {
      return sortDir.value === "asc" ? ka - kb : kb - ka;
    }
    const sa = String(ka).toLowerCase();
    const sb = String(kb).toLowerCase();
    if (sa < sb) return sortDir.value === "asc" ? -1 : 1;
    if (sa > sb) return sortDir.value === "asc" ? 1 : -1;
    return 0;
  });
  return arr;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedBooks.value.length / pageSize.value))
);

const paginatedBooks = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedBooks.value.slice(start, start + pageSize.value);
});

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

async function borrow(b) {
  if (!auth.readerId()) {
    showToast("Bạn cần đăng nhập user để mượn sách.", "error");
    return;
  }
  try {
    await BorrowService.create({ maSach: b._id });
    showToast("Đã gửi yêu cầu mượn (pending).", "success");
  } catch (e) {
    showToast("Không mượn được sách: " + (e.response?.data?.message || "Lỗi"), "error");
  }
}

</script>