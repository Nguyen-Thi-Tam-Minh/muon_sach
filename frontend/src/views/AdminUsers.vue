<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Quản lý tài khoản</h2>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="md:col-span-1 bg-white rounded-xl shadow p-4 space-y-3 border h-fit sticky top-4">
        <h3 class="font-semibold mb-2 border-b pb-2 flex items-center justify-between">
          <span>{{ editing ? "Sửa tài khoản" : "Tạo tài khoản mới" }}</span>
          <span v-if="!editing" class="text-xs font-normal px-2 py-1 rounded bg-slate-100 text-slate-500">
            {{ activeTab === 'reader' ? 'Độc giả' : 'Nội bộ' }}
          </span>
        </h3>

        <form @submit.prevent="submit" class="space-y-3" autocomplete="off">

          <div>
            <label class="block text-xs font-medium mb-1 text-slate-600">
              Tên đăng nhập <span class="text-red-500">*</span>
            </label>
            <input v-model="form.username"
              class="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="editing" placeholder="Nhập tên đăng nhập..." required autocomplete="new-username" />
          </div>

          <div>
            <label class="block text-xs font-medium mb-1 text-slate-600">
              {{ editing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu" }} <span v-if="!editing"
                class="text-red-500">*</span>
            </label>
            <input v-model="form.password" type="password"
              class="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :required="!editing" placeholder="******" autocomplete="new-password" />
          </div>

          <div>
            <label class="block text-xs font-medium mb-1 text-slate-600">Vai trò <span
                class="text-red-500">*</span></label>
            <select v-model="form.role"
              class="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="user">Độc giả (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="nhanvien">Nhân viên (Staff)</option>
            </select>
          </div>

          <div v-if="form.role === 'user'"
            class="p-3 bg-blue-50 rounded border border-blue-100 space-y-2 animate-fade-in">
            <p class="text-xs font-bold text-blue-700 uppercase mb-2">Thông tin độc giả</p>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-medium mb-1">Họ lót</label>
                <input v-model="form.hoLot" class="border rounded px-2 py-2 w-full text-sm" placeholder="Nguyễn Văn" />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Tên</label>
                <input v-model="form.ten" class="border rounded px-2 py-2 w-full text-sm" placeholder="An" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-medium mb-1">Ngày sinh</label>
                <input type="date" v-model="form.ngaySinh" class="border rounded px-2 py-2 w-full text-sm bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium mb-1">Phái</label>
                <select v-model="form.phai" class="border rounded px-2 py-2 w-full text-sm bg-white">
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium mb-1">Số điện thoại</label>
              <input v-model="form.dienThoai" class="border rounded px-3 py-2 w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1">Địa chỉ</label>
              <input v-model="form.diaChi" class="border rounded px-3 py-2 w-full text-sm" />
            </div>
          </div>

          <div v-if="form.role === 'nhanvien' || form.role === 'admin'"
            class="p-3 bg-blue-50 rounded border border-blue-100 space-y-2 animate-fade-in">
            <p class="text-xs font-bold text-blue-700 uppercase mb-2">Thông tin nhân viên</p>
            <div>
              <label class="block text-xs font-medium mb-1">Họ và tên</label>
              <input v-model="form.hoTen" class="border rounded px-3 py-2 w-full text-sm" placeholder="Nguyễn Văn A" />
            </div>
            <div v-if="form.role === 'nhanvien'">
              <label class="block text-xs font-medium mb-1">Chức vụ</label>
              <input v-model="form.chucVu" class="border rounded px-3 py-2 w-full text-sm"
                placeholder="Thủ thư / Quản kho..." />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1">Số điện thoại</label>
              <input v-model="form.dienThoai" class="border rounded px-3 py-2 w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1">Địa chỉ</label>
              <input v-model="form.diaChi" class="border rounded px-3 py-2 w-full text-sm" />
            </div>
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

      <div class="md:col-span-2 bg-white rounded-xl shadow border flex flex-col border-b-4 border-black">

        <div class="flex flex-col border-b">
          <div class="px-4 pt-4 pb-2">
            <h3 class="font-semibold text-slate-700">Danh sách tài khoản</h3>
          </div>

          <div class="flex px-4 gap-6">
            <button @click="activeTab = 'reader'" class="pb-2 text-sm font-medium transition-colors border-b-2"
              :class="activeTab === 'reader' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'">
              Độc giả ({{ readerList.length }})
            </button>

            <button @click="activeTab = 'staff'" class="pb-2 text-sm font-medium transition-colors border-b-2"
              :class="activeTab === 'staff' ? 'border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'">
              Nhân viên & Admin ({{ staffList.length }})
            </button>
          </div>
        </div>

        <div class="overflow-x-auto flex-1 p-2">
          <table class="w-full border text-sm text-left rounded-lg overflow-hidden">
            <thead class="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th class="border p-3">Họ và Tên / Username</th>
                <th class="border p-3">Thông tin liên hệ</th>
                <th class="border p-3 text-center">Vai trò</th>
                <th class="border p-3 text-center w-24">Hành động</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="u in displayList" :key="u._id"
                class="border-b border-slate-200 hover:bg-slate-50 transition-colors">

                <td class="border p-3 align-top">
                  <div class="flex flex-wrap items-baseline gap-2">
                    <span class="font-bold text-base"
                      :class="activeTab === 'reader' ? 'text-emerald-700' : 'text-blue-700'">
                      {{ u.hoTenHienThi && u.hoTenHienThi.trim() !== u.username ? u.hoTenHienThi : u.username }}
                    </span>

                    <span class="text-xs text-slate-500 font-mono">
                      ({{ u.username }})
                    </span>
                  </div>

                  <div class="text-[10px] bg-gray-100 inline-block px-1 rounded mt-1" v-if="u.chucVu">
                    {{ u.chucVu }}
                  </div>
                </td>

                <td class="border p-3 text-slate-600 text-xs align-top">
                  <div v-if="u.dienThoai">📞 {{ u.dienThoai }}</div>
                  <div v-if="u.diaChi" class="truncate max-w-[150px]" :title="u.diaChi">🏠 {{ u.diaChi }}</div>
                  <div v-if="u.readerInfo?.phai" class="mt-1">Giới tính: {{ u.readerInfo.phai }}</div>
                  <span v-if="!u.dienThoai && !u.diaChi" class="text-slate-400">---</span>
                </td>

                <td class="border p-3 text-center align-middle">
                  <span class="px-2 py-1 rounded-full text-[10px] font-bold border uppercase"
                    :class="getRoleBadge(u.role)">
                    {{ u.role }}
                  </span>
                </td>

                <td class="border p-3 text-center align-middle">
                  <div class="flex justify-center gap-2">
                    <button class="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition"
                      title="Sửa" @click="edit(u)">
                      ✏️
                    </button>
                    <button class="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
                      title="Xóa" @click="remove(u)">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!displayList.length">
                <td colspan="4" class="border p-8 text-center text-slate-500 italic">
                  Chưa có tài khoản nào trong mục này.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-2 mb-4 text-[11px] text-slate-400 italic text-center">
          * Mật khẩu hiển thị plain-text. Admin mặc định: <code>admin / admin123</code>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import UserService from "@/services/user.service";
import { showToast } from "@/stores/toast";

const users = ref([]);
const editing = ref(false);
const currentId = ref(null);
const activeTab = ref("reader");

const form = ref({
  username: "",
  password: "",
  role: "user",
  hoTen: "",
  chucVu: "",
  diaChi: "",
  dienThoai: "",
  hoLot: "",
  ten: "",
  ngaySinh: "",
  phai: ""
});

const readerList = computed(() => users.value.filter(u => u.role === 'user'));
const staffList = computed(() => users.value.filter(u => u.role === 'admin' || u.role === 'nhanvien'));

const displayList = computed(() => {
  return activeTab.value === 'reader' ? readerList.value : staffList.value;
});

watch(activeTab, (newTab) => {
  reset();
  if (newTab === 'reader') {
    form.value.role = 'user';
  } else {
    form.value.role = 'nhanvien';
  }
});

function getRoleBadge(role) {
  if (role === 'admin') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (role === 'nhanvien') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

function reset() {
  editing.value = false;
  currentId.value = null;
  form.value = {
    username: "",
    password: "",
    role: activeTab.value === 'reader' ? 'user' : 'nhanvien',
    hoTen: "",
    chucVu: "",
    diaChi: "",
    dienThoai: "",
    hoLot: "",
    ten: "",
    ngaySinh: "",
    phai: ""
  };
}

async function load() {
  try {
    users.value = await UserService.list();
  } catch (error) {
    showToast("Lỗi tải danh sách tài khoản", "error");
  }
}

onMounted(load);

function edit(u) {
  editing.value = true;
  currentId.value = u._id;

  if (u.role === 'user') activeTab.value = 'reader';
  else activeTab.value = 'staff';

  let dob = "";
  if (u.readerInfo?.ngaySinh) {
    dob = new Date(u.readerInfo.ngaySinh).toISOString().split('T')[0];
  }

  form.value = {
    username: u.username,
    password: "",
    role: u.role,
    diaChi: u.diaChi || "",
    dienThoai: u.dienThoai || "",
    hoTen: u.staffInfo?.hoTenNV || "",
    chucVu: u.staffInfo?.chucVu || "",
    hoLot: u.readerInfo?.hoLot || "",
    ten: u.readerInfo?.ten || "",
    ngaySinh: dob,
    phai: u.readerInfo?.phai || ""
  };
}

async function submit() {
  try {
    const payload = { ...form.value };

    if (payload.role === 'user') {
      delete payload.hoTen;
      delete payload.chucVu;
    } else {
      delete payload.hoLot;
      delete payload.ten;
      delete payload.ngaySinh;
      delete payload.phai;
    }

    if (editing.value && currentId.value) {
      if (!payload.password) delete payload.password;
      await UserService.update(currentId.value, payload);
      await load();
      showToast("Cập nhật thành công", "success");
    } else {
      await UserService.create(payload);
      await load();
      showToast("Tạo tài khoản thành công", "success");

      if (payload.role === 'user' && activeTab.value !== 'reader') activeTab.value = 'reader';
      if (payload.role !== 'user' && activeTab.value !== 'staff') activeTab.value = 'staff';
    }
    reset();
  } catch (e) {
    showToast(e.response?.data?.message || "Thao tác thất bại", "error");
  }
}

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

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
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