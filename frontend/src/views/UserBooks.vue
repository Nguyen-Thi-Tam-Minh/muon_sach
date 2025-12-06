<template>
  <div class="pb-10">
    <div class="flex justify-center mb-8 mt-4">
      <div class="relative w-full max-w-2xl group">
        <input v-model="q"
          class="w-full pl-6 pr-14 py-3.5 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all text-gray-700 bg-white"
          placeholder="Tìm sách theo tiêu đề hoặc tác giả..." @keyup.enter="currentPage = 1" />
        <button
          class="absolute right-2 top-2 h-10 w-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition shadow-sm">
          <span>🔍</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 text-gray-500 animate-pulse">Đang tải dữ liệu sách...</div>
    <div v-else-if="filteredBooks.length === 0" class="text-center py-20 text-gray-500">
      Không tìm thấy cuốn sách nào phù hợp.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">

      <div v-for="book in paginatedBooks" :key="book._id"
        class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full flex flex-col">
        <div class="h-64 w-full bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden cursor-pointer"
          @click="goToDetail(book._id)">
          <img v-if="book.image" :src="book.image"
            class="h-full w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
            alt="Bìa sách" @error="e => e.target.style.display = 'none'" />
          <div v-if="!book.image" class="text-gray-300 flex flex-col items-center">
            <span class="text-5xl mb-2">📖</span>
            <span class="text-xs">No Image</span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col text-left">
          <h3 class="font-bold text-slate-800 text-lg mb-1 truncate cursor-pointer hover:text-indigo-700"
            :title="book.title" @click="goToDetail(book._id)">
            {{ book.title }}
          </h3>

          <p class="text-sm text-slate-500 mb-2 truncate" :title="book.author">
            Tác giả: <span class="text-slate-700 font-medium">{{ book.author || 'Chưa rõ' }}</span>
          </p>

          <p class="text-base font-bold text-slate-800 mb-4">
            Giá: {{ formatPrice(book.price) }}đ
          </p>

          <div class="mt-auto">
            <button
              class="w-full py-2.5 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              @click="goToDetail(book._id)">
              Xem chi tiết <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center mt-10 gap-2">
      <button class="h-9 w-9 rounded border hover:bg-gray-100" :disabled="currentPage === 1"
        @click="currentPage--">‹</button>
      <span class="px-3 py-1.5 text-sm font-medium">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button class="h-9 w-9 rounded border hover:bg-gray-100" :disabled="currentPage === totalPages"
        @click="currentPage++">›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import BookService from "@/services/book.service";

const router = useRouter();
const books = ref([]);
const q = ref("");
const currentPage = ref(1);
const pageSize = ref(8);
const loading = ref(false);

function formatPrice(price) {
  if (!price) return "0";
  return new Intl.NumberFormat('vi-VN').format(price);
}

function goToDetail(id) {
  router.push({ name: 'book.detail', params: { id: id } });
}

async function load() {
  loading.value = true;
  try {
    books.value = await BookService.getAll();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

const filteredBooks = computed(() => {
  if (!q.value) return books.value;
  const key = q.value.toLowerCase();
  return books.value.filter((b) =>
    b.title?.toLowerCase().includes(key) || b.author?.toLowerCase().includes(key)
  );
});

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / pageSize.value) || 1);
const paginatedBooks = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = 1;
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBooks.value.slice(start, start + pageSize.value);
});
</script>