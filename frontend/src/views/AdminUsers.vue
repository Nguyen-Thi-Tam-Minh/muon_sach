<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Quản lý tài khoản</h2>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="md:col-span-1 bg-white rounded-xl shadow p-4 space-y-3 border h-fit">
        <h3 class="font-semibold mb-2 border-b pb-2">
          {{ editing ? "Sửa tài khoản" : "Tạo tài khoản mới" }}
        </h3>

        <form @submit.prevent="submit" class="space-y-3">
          <div>
            <label class="block text-xs font-medium mb-1 text-slate-600">Username</label>
            <input v-model="form.username"
              class="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="editing" placeholder="Nhập tên đăng nhập..." required />
          </div>

          <div>
            <label class="block text-xs font-medium mb-1 text-slate-600">
              {{ editing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu" }}
            </label>
            <input v-model="form.password" type="password"
              class="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :required="!editing" placeholder="******" />
          </div>

          <div>
            <label class="block text-xs font-medium mb-1 text-slate-600">Vai trò</label>
            <select v-model="form.role"
              class="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="user">Độc giả (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              class="flex-1 px-3 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              type="submit">
              {{ editing ? "Cập nhật" : "Tạo mới" }}
            </button>
            <button v-if="editing" class="px-3 py-2 rounded border border-slate-300 text-sm hover:bg-slate-50"
              type="button" @click="reset">
              Hủy
            </button>
          </div>
        </form>
      </div>

      <div class="md:col-span-2 bg-white rounded-xl shadow p-4 border flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-slate-700">Danh sách tài khoản</h3>
          <span class="text-xs text-slate-500">Tổng: {{ users.length }} tài khoản</span>
        </div>

        <div class="overflow-x-auto flex-1">
          <table class="w-full border text-sm text-left">
            <thead class="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th class="border p-3">Username</th>
                <th class="border p-3">Địa chỉ</th>
                <th class="border p-3">Điện thoại</th>
                <th class="border p-3 text-center">Vai trò</th>
                <th class="border p-3 text-center w-24">Hành động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="u in users" :key="u._id" class="hover:bg-slate-50 transition-colors">
                <td class="border p-3 font-medium text-slate-800">
                  {{ u.username }}
                </td>

                <td class="border p-3 text-slate-600 truncate max-w-[150px]" :title="u.diaChi">
                  {{ u.diaChi || '---' }}
                </td>

                <td class="border p-3 text-slate-600">
                  {{ u.dienThoai || '---' }}
                </td>

                <td class="border p-3 text-center">
                  <span class="px-2 py-1 rounded-full text-xs font-bold border" :class="u.role === 'admin'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
                    {{ u.role === 'admin' ? 'ADMIN' : 'USER' }}
                  </span>
                </td>
                <td class="border p-3 text-center">
                  <div class="flex justify-center gap-2">
                    <button class="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition"
                      title="Sửa" @click="edit(u)">
                      ✏️
                    </button>
                    <button class="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
                      title="Xóa" @click="remove(u)">
                      x
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!users.length">
                <td colspan="5" class="border p-8 text-center text-slate-500 italic">
                  Chưa có tài khoản nào trong hệ thống.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-4 text-xs text-slate-400 italic text-center">
          * Mật khẩu được mã hóa an toàn. Admin mặc định: <code>admin / admin123</code>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import UserService from "@/services/user.service";
import { showToast } from "@/stores/toast";

const users = ref([]);
const editing = ref(false);
const currentId = ref(null);
const form = ref({ username: "", password: "", role: "user" });

// Hàm reset form về trạng thái ban đầu
function reset() {
  editing.value = false;
  currentId.value = null;
  form.value = { username: "", password: "", role: "user" };
}

// Tải danh sách user từ backend
async function load() {
  try {
    users.value = await UserService.list();
  } catch (error) {
    showToast("Lỗi tải danh sách tài khoản", "error");
  }
}

onMounted(load);

// Chuyển sang chế độ sửa
function edit(u) {
  editing.value = true;
  currentId.value = u._id;
  form.value = {
    username: u.username,
    password: "", // Không điền lại mật khẩu cũ vì đã mã hóa
    role: u.role
  };
}

// Xử lý submit form (Tạo mới hoặc Cập nhật)
async function submit() {
  try {
    if (editing.value && currentId.value) {
      // Logic Cập nhật
      const payload = { role: form.value.role };
      if (form.value.password) payload.password = form.value.password;

      const updated = await UserService.update(currentId.value, payload);

      // Cập nhật lại danh sách local để không cần gọi lại API
      const idx = users.value.findIndex((u) => u._id === currentId.value);
      if (idx !== -1) {
        // Giữ nguyên các thông tin cũ, chỉ update role (và thông tin khác nếu backend trả về)
        users.value[idx] = { ...users.value[idx], ...updated, role: form.value.role };
      }

      showToast("Cập nhật thành công", "success");
    } else {
      // Logic Tạo mới
      const created = await UserService.create(form.value);
      users.value.push(created); // Thêm vào cuối danh sách
      showToast("Tạo tài khoản thành công", "success");
    }
    reset(); // Reset form sau khi thành công
  } catch (e) {
    showToast(e.response?.data?.message || "Thao tác thất bại", "error");
  }
}

// Xử lý xóa tài khoản
async function remove(u) {
  if (!confirm(`Bạn có chắc muốn xóa tài khoản "${u.username}" không?`)) return;
  try {
    await UserService.delete(u._id);
    users.value = users.value.filter((x) => x._id !== u._id);
    showToast("Đã xóa tài khoản", "success");
  } catch (e) {
    showToast("Không thể xóa tài khoản này", "error");
  }
}
</script>