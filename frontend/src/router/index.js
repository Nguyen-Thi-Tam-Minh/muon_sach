import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/stores/auth";

import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import UserBooks from "@/views/UserBooks.vue";
import BookDetail from "@/views/BookDetail.vue";
import BorrowHistory from "@/views/BorrowHistory.vue";
import UserProfile from "@/views/UserProfile.vue";

import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminBooks from "@/views/AdminBooks.vue";
import AdminBorrows from "@/views/AdminBorrows.vue";
import AdminUsers from "@/views/AdminUsers.vue";
import AdminDashboard from "@/views/AdminDashboard.vue";
import AdminPublishers from "@/views/AdminPublishers.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/register", component: Register },

  // USER routes
  {
    path: "/",
    name: "home",
    component: UserBooks,
    // Đã xóa meta: { role: "user" } để ai cũng xem được
  },
  {
    path: "/books/:id",
    name: "book.detail",
    component: BookDetail,
    // Đã xóa meta: { role: "user" } để khách có thể xem chi tiết sách
  },
  {
    path: "/history",
    component: BorrowHistory,
    meta: { role: "user" }, // Trang này vẫn cần đăng nhập
  },
  {
    path: "/profile",
    component: UserProfile,
    meta: { role: "user" }, // Trang này vẫn cần đăng nhập
  },

  // ADMIN routes
  {
    path: "/admin",
    component: AdminLayout,
    meta: { role: "admin" },
    children: [
      { path: "dashboard", component: AdminDashboard },
      { path: "books", component: AdminBooks },
      { path: "publishers", component: AdminPublishers },
      { path: "borrows", component: AdminBorrows },
      { path: "users", component: AdminUsers },
      { path: "", redirect: "/admin/books" },
    ],
  },
  // Catch all (404)
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiredRole = to.matched.reduce(
    (role, record) => record.meta.role || role,
    null
  );

  // Các trang công khai (Login, Register)
  if (to.path === "/login" || to.path === "/register") {
    return next();
  }

  // Nếu route không yêu cầu role (requiredRole là null), cho phép truy cập luôn
  if (!requiredRole) {
    return next();
  }

  // Nếu route CÓ yêu cầu role mà chưa có token => Chuyển về login
  if (!auth.token) return next("/login");

  // Nếu là trang admin mà không phải role admin => Về trang chủ
  if (requiredRole === "admin" && !auth.isAdmin()) {
    return next("/");
  }

  // Nếu đã login mà cố vào trang login/register => Về trang chủ
  if ((to.path === "/login" || to.path === "/register") && auth.user) {
    return next("/");
  }

  next();
});

export default router;
