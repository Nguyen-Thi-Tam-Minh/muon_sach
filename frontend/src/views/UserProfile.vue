<template>
  <section>
    <h2 class="text-xl font-semibold mb-4">Thông tin cá nhân</h2>

    <div v-if="loading" class="text-sm text-slate-500">Đang tải...</div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <!-- Thông tin Reader -->
      <div class="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <h3 class="font-semibold mb-2">Thông tin độc giả</h3>

        <div class="text-xs text-slate-500 mb-2">
          Tài khoản:
          <b>{{ profile.user?.username }}</b> ({{ profile.user?.role }})
        </div>

        <form @submit.prevent="saveProfile" class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm mb-1">Họ lót</label>
              <input
                v-model="reader.hoLot"
                class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Tên</label>
              <input
                v-model="reader.ten"
                class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm mb-1">Giới tính</label>
            <input
              v-model="reader.phai"
              class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nam/Nữ/Khác..."
            />
          </div>

          <div>
            <label class="block text-sm mb-1">Địa chỉ</label>
            <input
              v-model="reader.diaChi"
              class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm mb-1">Điện thoại</label>
            <input
              v-model="reader.dienThoai"
              class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            type="submit"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>

      <!-- Đổi mật khẩu -->
      <div class="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <h3 class="font-semibold mb-2">Đổi mật khẩu</h3>

        <form @submit.prevent="changePwd" class="space-y-3">
          <div>
            <label class="block text-sm mb-1">Mật khẩu hiện tại</label>
            <input
              v-model="oldPassword"
              type="password"
              class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Mật khẩu mới</label>
            <input
              v-model="newPassword"
              type="password"
              class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Nhập lại mật khẩu mới</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="border rounded-lg p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
            type="submit"
          >
            Đổi mật khẩu
          </button>
        </form>

        <p v-if="pwdError" class="text-xs text-rose-600 mt-1">{{ pwdError }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import MeService from "@/services/me.service";
import { showToast } from "@/stores/toast";

const loading = ref(true);
const profile = reactive({ user: null, reader: null });
const reader = reactive({
  hoLot: "",
  ten: "",
  phai: "",
  diaChi: "",
  dienThoai: "",
});

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const pwdError = ref("");

onMounted(async () => {
  try {
    const data = await MeService.getProfile();
    profile.user = data.user;
    profile.reader = data.reader || {};
    reader.hoLot = data.reader?.hoLot || "";
    reader.ten = data.reader?.ten || "";
    reader.phai = data.reader?.phai || "";
    reader.diaChi = data.reader?.diaChi || "";
    reader.dienThoai = data.reader?.dienThoai || "";
  } catch (e) {
    showToast("Không tải được thông tin cá nhân", "error");
  } finally {
    loading.value = false;
  }
});

async function saveProfile() {
  try {
    const updated = await MeService.updateProfile(reader);
    reader.hoLot = updated.hoLot || "";
    reader.ten = updated.ten || "";
    reader.phai = updated.phai || "";
    reader.diaChi = updated.diaChi || "";
    reader.dienThoai = updated.dienThoai || "";
    showToast("Đã lưu thông tin độc giả", "success");
  } catch (e) {
    showToast("Lưu thông tin thất bại", "error");
  }
}

async function changePwd() {
  pwdError.value = "";
  if (newPassword.value !== confirmPassword.value) {
    pwdError.value = "Mật khẩu nhập lại không khớp";
    return;
  }
  try {
    await MeService.changePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });
    showToast("Đổi mật khẩu thành công", "success");
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (e) {
    const msg = e?.response?.data?.message || "Đổi mật khẩu thất bại";
    pwdError.value = msg;
    showToast(msg, "error");
  }
}
</script>
