<template>
  <section>
    <h2 class="text-xl font-semibold mb-3">Quản lý Sách</h2>

    <div class="grid md:grid-cols-3 gap-4">
      <form @submit.prevent="submit" class="md:col-span-1 bg-white border rounded-xl p-4 space-y-3 shadow-sm h-fit">
        <h3 class="font-semibold border-b pb-2">
          {{ form._id ? "Sửa sách" : "Thêm sách mới" }}
        </h3>

        <div>
          <label class="block text-xs font-medium mb-1">Tiêu đề</label>
          <input class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            v-model="form.title" required placeholder="Nhập tên sách..." />
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Link ảnh bìa</label>
          <input class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            v-model="form.image" placeholder="https://example.com/anh.jpg" />
          <div v-if="form.image" class="mt-2 flex justify-center">
            <img :src="form.image" class="w-20 h-28 object-cover border rounded shadow-sm" alt="Preview"
              @error="e => e.target.src = 'https://placehold.co/80x110?text=Lỗi+Ảnh'" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Tác giả</label>
          <input class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            v-model="form.author" />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium mb-1">Giá (VNĐ)</label>
            <input type="number" min="0"
              class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              v-model.number="form.price" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Số quyển</label>
            <input type="number" min="0"
              class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              v-model.number="form.copies" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium mb-1">Năm XB</label>
            <input type="number"
              class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              v-model.number="form.publishedYear" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Nhà xuất bản</label>
            <select class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              v-model="form.maNXB">
              <option :value="undefined">-- Chọn --</option>
              <option v-for="p in publishers" :key="p._id" :value="p._id">
                {{ p.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Tags (cách nhau dấu phẩy)</label>
          <input class="border rounded px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            v-model="tags" placeholder="tamly, tieuthuyet..." />
        </div>

        <div class="flex gap-2 pt-2">
          <button
            class="flex-1 px-3 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            type="submit">
            {{ form._id ? "Lưu thay đổi" : "Thêm sách" }}
          </button>
          <button v-if="form._id" type="button" class="px-3 py-2 rounded border text-sm hover:bg-slate-50"
            @click="reset">
            Hủy
          </button>
        </div>
      </form>

      <div class="md:col-span-2 bg-white border rounded-xl p-4 shadow-sm flex flex-col">
        <div class="flex flex-col gap-2 mb-3 md:flex-row md:items-center justify-between">
          <input
            class="border rounded-lg p-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tìm kiếm sách..." v-model="q" />
        </div>

        <div class="overflow-x-auto flex-1">
          <table class="w-full border text-sm">
            <thead>
              <tr class="bg-slate-100 text-slate-600">
                <th class="border p-2 text-left">Thông tin sách</th>
                <th class="border p-2 text-center w-20">Kho</th>
                <th class="border p-2 text-center w-24">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in paginatedBooks" :key="b._id" class="hover:bg-slate-50 transition-colors">
                <td class="border p-2 align-top flex gap-3">
                  <img :src="b.image || 'https://placehold.co/40x60?text=No+Img'"
                    class="w-10 h-14 object-cover rounded border shadow-sm flex-shrink-0 bg-slate-200" alt="Bìa" />
                  <div>
                    <div class="font-bold text-indigo-700">{{ b.title }}</div>
                    <div class="text-xs text-slate-500">{{ b.author }}</div>
                    <div class="text-[10px] text-slate-400 mt-1">
                      {{ formatPrice(b.price) }}đ • {{ b.publishedYear }}
                    </div>
                  </div>
                </td>
                <td class="border p-2 text-center align-middle font-semibold text-slate-700">
                  {{ b.copies ?? 0 }}
                </td>
                <td class="border p-2 text-center align-middle">
                  <div class="flex flex-col gap-1">
                    <button class="text-xs text-blue-600 hover:underline font-medium" @click="edit(b)">Sửa</button>
                    <button class="text-xs text-rose-600 hover:underline font-medium" @click="remove(b)">Xóa</button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedBooks.length === 0">
                <td colspan="3" class="p-4 text-center text-slate-500">Không tìm thấy sách nào.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="mt-4 flex justify-end gap-2 text-xs">
          <button class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" :disabled="currentPage === 1"
            @click="currentPage--">Trước</button>
          <span class="py-1 font-medium text-slate-600">Trang {{ currentPage }} / {{ totalPages }}</span>
          <button class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            :disabled="currentPage === totalPages" @click="currentPage++">Sau</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BookService from "@/services/book.service";
import PublisherService from "@/services/publisher.service";
import { showToast } from "@/stores/toast";

const books = ref([]);
const publishers = ref([]);
const q = ref("");
const form = ref({});
const tags = ref("");
const currentPage = ref(1);
const pageSize = ref(6);

// Load data
async function load() {
  try {
    const [bData, pData] = await Promise.all([
      BookService.getAll(),
      PublisherService.getAll()
    ]);
    books.value = bData;
    publishers.value = pData;
  } catch (e) {
    showToast("Lỗi tải dữ liệu", "error");
  }
}
onMounted(load);

// Reset form
function reset() {
  form.value = {};
  tags.value = "";
}

// Edit handler
function edit(b) {
  form.value = { ...b, maNXB: b.maNXB }; // copy để không ảnh hưởng list
  tags.value = (b.tags || []).join(", ");
}

// Format price
function formatPrice(price) {
  if (!price) return "0";
  return new Intl.NumberFormat('vi-VN').format(price);
}

// Submit handler
async function submit() {
  try {
    const payload = {
      ...form.value,
      tags: tags.value.split(",").map(s => s.trim()).filter(Boolean),
    };

    if (form.value._id) {
      await BookService.update(form.value._id, payload);
      // update local list
      const i = books.value.findIndex(x => x._id === form.value._id);
      if (i !== -1) books.value[i] = { ...books.value[i], ...payload };
      showToast("Cập nhật thành công", "success");
    } else {
      const created = await BookService.create(payload);
      books.value.unshift(created); // Thêm vào đầu danh sách
      showToast("Thêm mới thành công", "success");
    }
    reset();
  } catch (e) {
    showToast("Lỗi: " + e.message, "error");
  }
}

// Delete handler
async function remove(b) {
  if (!confirm(`Xóa sách "${b.title}"?`)) return;
  try {
    await BookService.delete(b._id);
    books.value = books.value.filter(x => x._id !== b._id);
    showToast("Đã xóa sách", "success");
  } catch (e) {
    showToast("Lỗi xóa sách", "error");
  }
}

// Filter & Pagination logic
const filteredBooks = computed(() => {
  if (!q.value) return books.value;
  const k = q.value.toLowerCase();
  return books.value.filter(b => b.title.toLowerCase().includes(k) || b.author?.toLowerCase().includes(k));
});

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / pageSize.value) || 1);
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBooks.value.slice(start, start + pageSize.value);
});
</script>