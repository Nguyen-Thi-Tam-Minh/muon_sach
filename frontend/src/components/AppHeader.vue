<template>
    <header class="bg-[#6D94C5] text-white shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">

            <RouterLink to="/" class="flex items-center gap-3 group shrink-0">
                <div
                    class="bg-white text-[#6D94C5] font-bold rounded px-2 py-1 text-lg shadow-sm group-hover:bg-indigo-50 transition-colors">
                    TV
                </div>
                <h1 class="text-xl font-bold tracking-wide">Thư Viện Online</h1>
            </RouterLink>

            <div class="flex items-center gap-6">

                <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
                    <RouterLink to="/" class="hover:text-indigo-100 transition-colors py-1"
                        active-class="font-bold underline underline-offset-4 decoration-2">
                        Trang chủ
                    </RouterLink>

                    <template v-if="auth.isUser()">
                        <RouterLink to="/history" class="hover:text-indigo-100 transition-colors py-1"
                            active-class="font-bold underline underline-offset-4 decoration-2">
                            Lịch sử mượn
                        </RouterLink>
                    </template>

                    <template v-if="auth.isAdmin()">
                        <RouterLink to="/admin/dashboard" class="hover:text-indigo-100 transition-colors py-1">
                            Trang quản trị
                        </RouterLink>
                    </template>
                </nav>

                <div class="hidden md:block w-px h-6 bg-white/30"></div>

                <div class="flex items-center gap-3">
                    <template v-if="auth.user">
                        <div class="hidden sm:block mr-1 text-right">
                            <span class="text-sm font-bold text-white block leading-tight">{{ auth.user.username
                                }}</span>
                        </div>

                        <div class="relative group h-16 flex items-center">
                            <button
                                class="h-9 w-9 rounded-full bg-white text-[#6D94C5] flex items-center justify-center hover:bg-indigo-50 transition shadow-sm border border-white/50 cursor-pointer">
                                <i class="fa-solid fa-user"></i>
                                <span v-if="!hasIcon">👤</span>
                            </button>

                            <div
                                class="absolute right-0 top-[45px] pt-4 w-48 hidden group-hover:block hover:block animate-fade-in z-50">

                                <div
                                    class="bg-white text-slate-800 rounded-lg shadow-xl py-2 border border-gray-100 overflow-hidden">
                                    <div
                                        class="absolute top-[10px] right-[14px] w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100">
                                    </div>

                                    <div class="px-4 py-2 border-b border-gray-100 md:hidden bg-gray-50">
                                        <span class="text-xs text-gray-500 block">Xin chào,</span>
                                        <span class="font-bold text-[#6D94C5]">{{ auth.user.username }}</span>
                                    </div>

                                    <RouterLink to="/profile"
                                        class="block px-4 py-2.5 hover:bg-indigo-50 text-sm transition-colors flex items-center gap-2">
                                        <span></span> Thông tin cá nhân
                                    </RouterLink>

                                    <button @click="handleLogout"
                                        class="block w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors flex items-center gap-2">
                                        <span></span> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <RouterLink to="/login" class="text-sm font-medium hover:text-indigo-100 transition-colors">
                            Đăng nhập
                        </RouterLink>
                        <RouterLink to="/register"
                            class="px-4 py-2 bg-white text-[#6D94C5] rounded-lg text-sm font-bold hover:bg-indigo-50 transition shadow-sm">
                            Đăng ký
                        </RouterLink>
                    </template>
                </div>

            </div>
        </div>
    </header>
</template>

<script setup>
import { RouterLink, useRouter } from "vue-router";
import { auth } from "@/stores/auth";

const router = useRouter();
const hasIcon = false;

function handleLogout() {
    auth.logout();
    router.push("/login");
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>