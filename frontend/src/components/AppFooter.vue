<template>
    <footer class="bg-[#6D94C5] text-white py-12 border-t border-white/20">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                <div class="text-left">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="bg-white text-[#6D94C5] font-bold rounded px-2 py-1 text-sm shadow-sm">TV</div>
                        <h2 class="text-white text-lg font-bold">Thư Viện Sách</h2>
                    </div>
                    <p class="text-sm leading-relaxed text-white/90">
                        Nơi tri thức được chia sẻ và lan tỏa. Hệ thống mượn trả sách trực tuyến tiện lợi, nhanh chóng
                        dành cho sinh viên và giảng viên.
                    </p>
                </div>

                <div class="md:text-center">
                    <h3 class="text-white font-bold mb-4 uppercase text-sm tracking-wider opacity-90">Liên kết nhanh
                    </h3>
                    <ul class="space-y-2 text-sm text-white/90 inline-block text-left">
                        <li>
                            <RouterLink to="/"
                                class="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">
                                Trang chủ</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/"
                                class="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">
                                Tất cả sách</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/login"
                                class="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">
                                Đăng nhập</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/register"
                                class="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">
                                Đăng ký thành viên</RouterLink>
                        </li>
                    </ul>
                </div>

                <div class="md:text-center">
                    <h3 class="text-white font-bold mb-4 uppercase text-sm tracking-wider opacity-90">Theo dõi chúng tôi
                    </h3>

                    <div class="flex justify-center gap-4 mb-4">
                        <a href="#"
                            class="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-[#6D94C5] transition-all backdrop-blur-sm">
                            <span class="font-bold">f</span>
                        </a>
                        <a href="#"
                            class="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-[#6D94C5] transition-all backdrop-blur-sm">
                            <span class="font-bold">t</span>
                        </a>
                        <a href="#"
                            class="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-[#6D94C5] transition-all backdrop-blur-sm">
                            <span class="font-bold">i</span>
                        </a>
                    </div>

                    <div class="text-sm text-white/90 leading-6 inline-block text-left">
                        <p>Email: <a href="mailto:hotro@thuviensach.com"
                                class="hover:underline">hotro@thuviensach.com</a></p>
                        <p>Hotline: <strong>1900 1234</strong></p>
                    </div>
                </div>
            </div>

            <div class="border-t border-white/20 pt-6 text-center text-xs text-white/70">
                &copy; 2025 Thư Viện Sách. All Rights Reserved.
            </div>
        </div>
    </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>