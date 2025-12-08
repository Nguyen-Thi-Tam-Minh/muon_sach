<template>
    <div class="py-8 flex justify-center bg-gray-50 min-h-[80vh]">
        <div class="w-full max-w-5xl px-4">

            <button @click="$router.back()"
                class="flex items-center text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors">
                <span class="mr-2 text-lg">←</span> Quay lại
            </button>

            <div v-if="loading" class="text-center py-20 text-slate-500">Đang tải thông tin...</div>

            <div v-else-if="book" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-8">

                    <div class="md:col-span-4 flex justify-center items-start">
                        <div class="relative w-full border border-gray-200 rounded p-2">
                            <img v-if="book.image" :src="book.image" class="w-full h-auto object-contain"
                                alt="Book cover" />
                            <div v-else class="h-80 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <span class="text-4xl">📚</span>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-8 flex flex-col text-left pl-0 md:pl-6">

                        <h1 class="text-3xl font-extrabold text-slate-900 mb-4 leading-snug">
                            {{ book.title }}
                        </h1>

                        <div class="space-y-2 text-sm text-slate-600 mb-4">
                            <p>Mã sách: <span class="text-slate-500">{{ book._id }}</span></p>
                            <p>Tác giả: <strong class="text-slate-800 text-base">{{ book.author }}</strong></p>
                            <p>
                                NXB: <span class="text-slate-800 font-medium">{{ publisherName }}</span>
                                <span v-if="book.publishedYear"> (Năm: {{ book.publishedYear }})</span>
                            </p>
                        </div>

                        <div class="text-xl font-bold text-emerald-600 mb-2">
                            Giá: {{ formatPrice(book.price) }}đ
                        </div>

                        <div class="text-sm mb-6">
                            Số quyển còn: <strong :class="book.copies > 0 ? 'text-emerald-600' : 'text-rose-600'">{{
                                book.copies }}</strong>
                        </div>

                        <div class="mb-8 p-4 bg-gray-50 rounded border border-gray-100 relative">
                            <h3 class="font-bold text-slate-700 mb-2 uppercase text-xs">Mô tả nội dung</h3>

                            <p
                                class="text-slate-600 text-sm leading-relaxed whitespace-pre-line transition-all duration-300">
                                {{ displayedDescription }}
                            </p>

                            <button v-if="shouldShowReadMore" @click="isExpanded = !isExpanded"
                                class="w-full flex items-center justify-center gap-1 mt-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none">
                                {{ isExpanded ? 'Thu gọn' : 'Xem thêm' }}
                                <span class="text-[10px]">{{ isExpanded ? '▲' : '▼' }}</span>
                            </button>
                        </div>

                        <div class="mt-auto">
                            <button v-if="book.copies > 0"
                                class="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-3 text-base"
                                @click="handleBorrow">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                    stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                Yêu cầu mượn sách
                            </button>

                            <div v-else
                                class="w-full py-3 bg-slate-400 text-white font-bold rounded-lg shadow-inner text-center flex items-center justify-center gap-2 text-base cursor-not-allowed select-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                    stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                Đã hết sách
                            </div>

                            <p v-if="!auth.readerId()" class="mt-3 text-sm text-center text-rose-500 italic">
                                * Bạn cần đăng nhập tài khoản độc giả để thực hiện chức năng này.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            <div v-else class="text-center py-20 text-rose-500">
                Không tìm thấy thông tin sách hoặc sách đã bị xóa.
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookService from "@/services/book.service";
import BorrowService from "@/services/borrow.service";
import PublisherService from "@/services/publisher.service";
import { auth } from "@/stores/auth";
import { showToast } from "@/stores/toast";

const route = useRoute();
const router = useRouter();
const book = ref(null);
const loading = ref(true);
const publishers = ref([]);

// State cho chức năng Xem thêm
const isExpanded = ref(false);
const DESCRIPTION_LIMIT = 300; // Giới hạn ký tự

// Tính toán xem có cần hiện nút Xem thêm không
const shouldShowReadMore = computed(() => {
    return (book.value?.description?.length || 0) > DESCRIPTION_LIMIT;
});

// Nội dung hiển thị thực tế
const displayedDescription = computed(() => {
    const desc = book.value?.description || 'Chưa có mô tả cho cuốn sách này.';

    // Nếu ngắn hoặc đang mở rộng thì hiện hết
    if (!shouldShowReadMore.value || isExpanded.value) {
        return desc;
    }

    // Nếu dài và đang thu gọn thì cắt bớt + ...
    return desc.substring(0, DESCRIPTION_LIMIT) + '...';
});

const publisherName = computed(() => {
    if (!book.value?.maNXB || publishers.value.length === 0) return "Đang cập nhật";
    const p = publishers.value.find(pub => pub._id === book.value.maNXB);
    return p ? p.name : "Không xác định";
});

function formatPrice(price) {
    if (!price) return "0";
    return new Intl.NumberFormat('vi-VN').format(price);
}

async function loadData() {
    loading.value = true;
    try {
        const bookId = route.params.id;
        const [bookData, pubData] = await Promise.all([
            BookService.get(bookId),
            PublisherService.getAll()
        ]);

        book.value = bookData;
        publishers.value = pubData;
    } catch (error) {
        console.error(error);
        showToast("Lỗi tải thông tin sách", "error");
    } finally {
        loading.value = false;
    }
}

// async function handleBorrow() {
//     if (!auth.readerId()) {
//         if (confirm("Bạn cần đăng nhập để mượn sách. Đến trang đăng nhập ngay?")) {
//             router.push("/login");
//         }
//         return;
//     }

//     if (!confirm(`Xác nhận gửi yêu cầu mượn cuốn: "${book.value.title}"?`)) return;

//     try {
//         await BorrowService.create({ maSach: book.value._id });
//         showToast("Đã gửi yêu cầu mượn thành công!", "success");
//         router.push({ name: 'borrow.history' });
//     } catch (e) {
//         showToast(e.response?.data?.message || "Lỗi khi mượn sách", "error");
//     }
// }
async function handleBorrow() {
    // 1. Kiểm tra đăng nhập
    if (!auth.readerId()) {
        if (confirm("Bạn cần đăng nhập tài khoản Độc giả để mượn sách. Đến trang đăng nhập ngay?")) {
            router.push("/login");
        }
        return;
    }

    // 2. Xác nhận
    if (!confirm(`Xác nhận gửi yêu cầu mượn cuốn: "${book.value.title}"?`)) return;

    try {
        // 3. Gọi API tạo phiếu mượn
        await BorrowService.create({ maSach: book.value._id });

        // 4. Thông báo thành công
        showToast("Đã gửi yêu cầu mượn thành công!", "success");

        // --- DÒNG CẦN XÓA HOẶC COMMENT LẠI ---
        // router.push({ name: 'borrow.history' }); 
        // -------------------------------------

    } catch (e) {
        // Hiển thị lỗi từ backend (ví dụ: Bạn đã mượn sách này rồi)
        const msg = e.response?.data?.message || "Lỗi khi mượn sách";
        showToast(msg, "error");
    }
}
onMounted(loadData);
</script>