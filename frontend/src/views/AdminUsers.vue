<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Quản lý tài khoản</h2>

    <div class="grid md:grid-cols-2 gap-4">
      <!-- Form tạo / sửa -->
      <div class="bg-white rounded-xl shadow p-4 space-y-3 border">
        <h3 class="font-semibold mb-2">
          {{ editing ? "Sửa tài khoản" : "Tạo tài khoản mới" }}
        </h3>

        <form @submit.prevent="submit" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">Username</label>
            <input
              v-model="form.username"
              class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="editing"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ editing ? "Mật khẩu mới (bỏ trống nếu giữ nguyên)" : "Mật khẩu" }}
            </label>
            <input
              v-model="form.password"
              type="password"
              class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :required="!editing"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Vai trò</label>
            <select
              v-model="form.role"
              class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button
              class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              type="submit"
            >
              {{ editing ? "Cập nhật" : "Tạo" }}
            </button>
            <button
              v-if="editing"
              class="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
              type="button"
              @click="reset"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      <!-- Danh sách -->
      <div class="bg-white rounded-xl shadow p-4 border">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold">Danh sách tài khoản</h3>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-500">Sort theo:</span>
            <button
              class="px-2 py-1 border rounded"
              @click="setSort('username')"
            >
              Username
              <span v-if="sortKey === 'username'" class="ml-1 text-[10px]">
                {{ sortDir === "asc" ? "▲" : "▼" }}
              </span>
            </button>
            <button
              class="px-2 py-1 border rounded"
              @click="setSort('role')"
            >
              Role
              <span v-if="sortKey === 'role'" class="ml-1 text-[10px]">
                {{ sortDir === "asc" ? "▲" : "▼" }}
              </span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border text-sm">
            <thead>
              <tr class="bg-slate-50">
                <th class="border p-2 text-left">Username</th>
                <th class="border p-2 text-center">Role</th>
                <th class="border p-2 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in sortedUsers" :key="u._id">
                <td class="border p-2">{{ u.username }}</td>
                <td class="border p-2 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs"
                    :class="u.role === 'admin'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'"
                  >
                    {{ u.role }}
                  </span>
                </td>
                <td class="border p-2 text-center">
                  <button
                    class="text-xs text-indigo-600 mr-2"
                    @click="edit(u)"
                  >
                    Sửa
                  </button>
                  <button
                    class="text-xs text-rose-600"
                    @click="remove(u)"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
              <tr v-if="!sortedUsers.length">
                <td colspan="3" class="border p-2 text-center text-slate-500">
                  Chưa có tài khoản nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-2 text-xs text-slate-500">
          * Admin mặc định được tạo trên server nếu chưa có:
          <code>ADMIN_USERNAME / ADMIN_PASSWORD</code> trong .env,
          hoặc mặc định <code>admin / admin123</code>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import UserService from "@/services/user.service";
import { showToast } from "@/stores/toast";

const users = ref([]);
const editing = ref(false);
const currentId = ref(null);
const form = ref({ username: "", password: "", role: "user" });

const sortKey = ref("username");
const sortDir = ref("asc");

function reset() {
  editing.value = false;
  currentId.value = null;
  form.value = { username: "", password: "", role: "user" };
}

async function load() {
  users.value = await UserService.list();
}

onMounted(load);

const sortedUsers = computed(() => {
  const arr = [...users.value];
  arr.sort((a, b) => {
    const ka = a[sortKey.value] ?? "";
    const kb = b[sortKey.value] ?? "";
    const sa = String(ka).toLowerCase();
    const sb = String(kb).toLowerCase();
    if (sa < sb) return sortDir.value === "asc" ? -1 : 1;
    if (sa > sb) return sortDir.value === "asc" ? 1 : -1;
    return 0;
  });
  return arr;
});

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

function edit(u) {
  editing.value = true;
  currentId.value = u._id;
  form.value = { username: u.username, password: "", role: u.role };
}

async function submit() {
  try {
    if (editing.value && currentId.value) {
      const payload = { role: form.value.role };
      if (form.value.password) payload.password = form.value.password;
      await UserService.update(currentId.value, payload);

      // Cập nhật ngay trong mảng users
      const idx = users.value.findIndex((u) => u._id === currentId.value);
      if (idx !== -1) {
        users.value[idx] = {
          ...users.value[idx],
          role: form.value.role,
        };
      }

      showToast("Đã cập nhật tài khoản", "success");
    } else {
      const created = await UserService.create(form.value);
      users.value.push(created);
      showToast("Đã tạo tài khoản mới", "success");
    }
  } catch (e) {
    showToast("Thao tác với tài khoản thất bại", "error");
  } finally {
    reset();
  }
}

async function remove(u) {
  if (!confirm(`Xóa tài khoản "${u.username}"?`)) return;
  try {
    await UserService.delete(u._id);
    users.value = users.value.filter((x) => x._id !== u._id);
    showToast("Đã xóa tài khoản", "success");
  } catch (e) {
    showToast("Không xóa được tài khoản", "error");
  }
}
</script>
