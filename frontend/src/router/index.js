import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/stores/auth";

import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import UserBooks from "@/views/UserBooks.vue";
import BookDetail from "@/views/BookDetail.vue"; // <-- Import file mới
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
    meta: { role: "user" },
  },
  {
    path: "/books/:id", // <-- Route trang chi tiết
    name: "book.detail",
    component: BookDetail,
    meta: { role: "user" },
  },
  { path: "/history", component: BorrowHistory, meta: { role: "user" } },
  { path: "/profile", component: UserProfile, meta: { role: "user" } },

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

  // Các trang công khai
  if (to.path === "/login" || to.path === "/register") {
    return next();
  }

  // Trang chủ (UserBooks) cho phép xem không cần login,
  // nhưng nếu muốn mượn/xem chi tiết sâu thì tùy logic component
  if (to.path === "/" && !requiredRole) {
    return next();
  }

  if (!requiredRole) return next();

  if (!auth.token) return next("/login");

  if (requiredRole === "admin" && !auth.isAdmin()) {
    return next("/");
  }

  // User login rồi không vào lại trang login/register
  if ((to.path === "/login" || to.path === "/register") && auth.user) {
    return next("/");
  }

  next();
});

export default router;
