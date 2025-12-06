import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/stores/auth";

import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import UserBooks from "@/views/UserBooks.vue";
import BorrowHistory from "@/views/BorrowHistory.vue";

import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminBooks from "@/views/AdminBooks.vue";
import AdminBorrows from "@/views/AdminBorrows.vue";
import AdminUsers from "@/views/AdminUsers.vue";
import AdminDashboard from "@/views/AdminDashboard.vue";
import UserProfile from "@/views/UserProfile.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/register", component: Register },

  // USER routes
  { path: "/", component: UserBooks, meta: { role: "user" } },
  { path: "/history", component: BorrowHistory, meta: { role: "user" } },
  { path: "/profile", component: UserProfile, meta: { role: "user" } },

  // ADMIN routes with layout
  {
    path: "/admin",
    component: AdminLayout,
    meta: { role: "admin" },
    children: [
      { path: "dashboard", component: AdminDashboard },
      { path: "books", component: AdminBooks },
      { path: "borrows", component: AdminBorrows },
      { path: "users", component: AdminUsers },
      { path: "", redirect: "/admin/books" },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard phân quyền, hỗ trợ nested routes
router.beforeEach((to, from, next) => {
  const requiredRole = to.matched.reduce(
    (role, record) => record.meta.role || role,
    null
  );

  if (!requiredRole) return next();

  if (!auth.token) return next("/login");

  if (requiredRole === "admin" && !auth.isAdmin()) {
    return next("/");
  }
  if (requiredRole === "user" && !auth.isUser()) {
    return next("/admin/books");
  }

  next();
});

export default router;
