<template>
  <section>
    <h2 class="text-xl font-semibold mb-3">Quản lý Sách</h2>

    <div class="grid md:grid-cols-2 gap-4">
      <!-- FORM -->
      <form
        @submit.prevent="submit"
        class="bg-white border rounded-xl p-4 space-y-3 shadow-sm"
      >
        <h3 class="font-semibold">
          {{ form._id ? "Sửa sách" : "Thêm sách mới" }}
        </h3>

        <div>
          <label class="block text-sm mb-1">Tiêu đề</label>
          <input
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            v-model="form.title"
            required
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Tác giả</label>
          <input
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            v-model="form.author"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm mb-1">Số quyển (copies)</label>
            <input
              type="number"
              min="0"
              class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              v-model.number="form.copies"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Năm XB</label>
            <input
              type="number"
              class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              v-model.number="form.publishedYear"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm mb-1">Nhà xuất bản</label>
          <input
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            v-model="form.publisher"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Tags (cách nhau bởi dấu phẩy)</label>
          <input
            class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            v-model="tags"
          />
        </div>

        <div class="flex gap-2">
          <button
            class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            type="submit"
          >
            {{ form._id ? "Cập nhật" : "Thêm" }}
          </button>
          <button
            v-if="form._id"
            type="button"
            class="px-3 py-2 rounded-lg border text-sm hover:bg-slate-50"
            @click="reset"
          >
            Hủy
          </button>
        </div>
      </form>

      <!-- LIST + PAGINATION + SORT -->
      <div class="bg-white border rounded-xl p-4 shadow-sm">
        <div class="flex flex-col gap-2 mb-3 md:flex-row md:items-center">
          <input
            class="border rounded-lg p-2 flex-1 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tìm theo tiêu đề, tác giả, NXB, tags..."
            v-model="q"
            @keyup.enter="currentPage = 1"
          />
          <select
            v-model.number="pageSize"
            class="border rounded-lg p-2 text-sm w-32"
          >
            <option :value="5">5 / trang</option>
            <option :value="10">10 / trang</option>
            <option :value="20">20 / trang</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border text-sm">
            <thead>
              <tr class="bg-slate-50">
                <th
                  class="border p-2 text-left cursor-pointer"
                  @click="setSort('title')"
                >
                  Tiêu đề
                  <span
                    v-if="sortKey === 'title'"
                    class="inline-block ml-1 text-[10px]"
                  >
                    {{ sortDir === "asc" ? "▲" : "▼" }}
                  </span>
                </th>
                <th
                  class="border p-2 text-left cursor-pointer"
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
                  class="border p-2 text-center cursor-pointer w-20"
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
                <th
                  class="border p-2 text-center cursor-pointer w-24"
                  @click="setSort('publishedYear')"
                >
                  Năm XB
                  <span
                    v-if="sortKey === 'publishedYear'"
                    class="inline-block ml-1 text-[10px]"
                  >
                    {{ sortDir === "asc" ? "▲" : "▼" }}
                  </span>
                </th>
                <th class="border p-2 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in paginatedBooks" :key="b._id">
                <td class="border p-2 align-top">
                  <div class="font-semibold">{{ b.title }}</div>
                  <div class="text-xs text-slate-500" v-if="b.publisher">
                    NXB: {{ b.publisher }}
                  </div>
                  <div class="text-[11px] text-slate-400" v-if="b.tags?.length">
                    Tags: {{ b.tags.join(", ") }}
                  </div>
                </td>
                <td class="border p-2 align-top">
                  {{ b.author || "-" }}
                </td>
                <td class="border p-2 text-center align-top">
                  {{ b.copies ?? 0 }}
                </td>
                <td class="border p-2 text-center align-top">
                  {{ b.publishedYear || "-" }}
                </td>
                <td class="border p-2 text-center align-top">
                  <button
                    class="px-2 py-1 rounded border text-xs mr-1 hover:bg-slate-50"
                    @click="edit(b)"
                  >
                    Sửa
                  </button>
                  <button
                    class="px-2 py-1 rounded border text-xs text-rose-600 hover:bg-rose-50"
                    @click="remove(b)"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
              <tr v-if="!paginatedBooks.length">
                <td colspan="5" class="border p-2 text-center text-slate-500">
                  Không có sách phù hợp.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between mt-3 text-xs"
        >
          <div>
            Trang {{ currentPage }} / {{ totalPages }}
            <span class="text-slate-500">
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
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BookService from "@/services/book.service";
import { showToast } from "@/stores/toast";

const books = ref([]);
const q = ref("");
const form = ref({});
const tags = ref("");
const sortKey = ref("title");
const sortDir = ref("asc");
const currentPage = ref(1);
const pageSize = ref(5);

function reset() {
  form.value = {};
  tags.value = "";
}

async function load() {
  books.value = await BookService.getAll();
}

onMounted(load);

// FILTER
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

// SORT
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

// PAGINATION
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

function edit(b) {
  form.value = { ...b };
  tags.value = (b.tags || []).join(", ");
}

async function submit() {
  try {
    const payload = {
      ...form.value,
      tags: tags.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (form.value._id) {
      await BookService.update(form.value._id, payload);
      // cập nhật tại chỗ
      const idx = books.value.findIndex((x) => x._id === form.value._id);
      if (idx !== -1) {
        books.value[idx] = { ...books.value[idx], ...payload };
      }
      showToast("Đã cập nhật sách", "success");
    } else {
      const created = await BookService.create(payload);
      books.value.push(created);
      showToast("Đã thêm sách mới", "success");
    }

    reset();
  } catch (e) {
    showToast("Thao tác với sách thất bại", "error");
  }
}

async function remove(b) {
  if (!confirm("Xóa sách này?")) return;
  try {
    await BookService.delete(b._id);
    books.value = books.value.filter((x) => x._id !== b._id);
    showToast("Đã xóa sách", "success");
  } catch (e) {
    showToast("Không xóa được sách", "error");
  }
}
</script>
