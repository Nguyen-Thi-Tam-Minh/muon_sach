<template>
    <section>
        <h2 class="text-xl font-semibold mb-3">Quản lý Nhà Xuất Bản</h2>
        <div class="grid md:grid-cols-2 gap-4">
            <form @submit.prevent="submit" class="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
                <h3 class="font-semibold">{{ form._id ? "Sửa NXB" : "Thêm NXB Mới" }}</h3>
                <div>
                    <label class="block text-sm mb-1">Tên NXB</label>
                    <input v-model="form.name"
                        class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required />
                </div>
                <div>
                    <label class="block text-sm mb-1">Địa chỉ</label>
                    <input v-model="form.address"
                        class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required />
                </div>
                <div class="flex gap-2">
                    <button type="submit"
                        class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">{{ form._id ?
                            "Cập nhật" : "Thêm" }}</button>
                    <button v-if="form._id" type="button" @click="reset"
                        class="px-3 py-2 rounded-lg border text-sm hover:bg-slate-50">Hủy</button>
                </div>
            </form>

            <div class="bg-white border rounded-xl p-4 shadow-sm">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-slate-50 border-b">
                            <th class="p-2 text-left">Tên</th>
                            <th class="p-2 text-left">Địa chỉ</th>
                            <th class="p-2 w-20"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in publishers" :key="p._id" class="border-b last:border-0">
                            <td class="p-2 font-medium">{{ p.name }}</td>
                            <td class="p-2 text-slate-600">{{ p.address }}</td>
                            <td class="p-2 text-right">
                                <button @click="edit(p)" class="text-indigo-600 mr-2">Sửa</button>
                                <button @click="remove(p)" class="text-rose-600">Xóa</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PublisherService from "@/services/publisher.service";
import { showToast } from "@/stores/toast";

const publishers = ref([]);
const form = ref({ name: "", address: "" });

async function load() { publishers.value = await PublisherService.getAll(); }
onMounted(load);

function reset() { form.value = { name: "", address: "" }; }
function edit(p) { form.value = { ...p }; }

async function submit() {
    try {
        if (form.value._id) await PublisherService.update(form.value._id, form.value);
        else await PublisherService.create(form.value);
        showToast("Thành công", "success");
        await load(); reset();
    } catch (e) { showToast("Lỗi", "error"); }
}

async function remove(p) {
    if (confirm("Xóa NXB này?")) {
        try { await PublisherService.delete(p._id); load(); } catch { showToast("Không thể xóa", "error"); }
    }
}
</script>