<template>
  <div class="min-h-screen bg-[#F0ECE6] flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- 背景裝飾圓形 -->
    <div class="absolute -top-[20%] -right-[10%] w-[60%] aspect-square bg-gradient-to-br from-white/60 to-transparent rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-sm relative z-10">
      <div class="text-center mb-10">
         <h1 class="text-3xl font-bold tracking-tight text-[#1B4588] mb-2">工時自助登記</h1>
         <p class="text-[#8c8273]">完成工作後，請填寫時數提交</p>
      </div>

      <div class="bg-white rounded-[32px] p-8 shadow-sm border border-[#E8E2D8]">
         <div v-if="isSuccess" class="text-center py-8">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhCheckCircle weight="fill" class="text-4xl" />
            </div>
            <h3 class="font-bold text-xl text-[#6b6050] mb-2">登記成功！</h3>
            <p class="text-sm text-[#a09888] mb-8">管理員已收到您的工時紀錄。</p>
            <button @click="resetForm" class="bg-[#F0ECE6] hover:bg-[#E8E2D8] text-[#1B4588] font-bold py-3 px-6 rounded-full transition-colors w-full text-sm">
                再登記一筆
            </button>
         </div>

         <form v-else @submit.prevent="submitPunch" class="flex flex-col gap-6">
            <!-- 姓名 -->
            <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">您的姓名 (必填)</label>
               <input 
                 v-model="form.name" 
                 type="text" 
                 required
                 @blur="fetchRecentLogs"
                 placeholder="例如：王大明" 
                 class="w-full border border-[#E8E2D8] focus:border-[#1B4588]/30 bg-[#F0ECE6] rounded-2xl px-5 py-4 text-lg font-bold text-[#1B4588] transition-colors outline-none placeholder:text-[#c4baa8]"
               >
            </div>

            <!-- 時數 -->
            <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">執行時數 (必填)</label>
               <div class="flex items-center gap-3">
                   <input 
                     v-model="form.hours" 
                     type="number" 
                     step="0.5"
                     min="0.5"
                     required
                     placeholder="0" 
                     class="flex-1 border border-[#E8E2D8] focus:border-[#1B4588]/30 bg-[#F0ECE6] rounded-2xl px-5 py-4 text-2xl font-mono font-bold text-[#1B4588] text-center transition-colors outline-none placeholder:text-[#c4baa8]"
                   >
                   <span class="text-[#a09888] font-bold">小時</span>
               </div>
            </div>

            <!-- 日期 -->
            <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">執行日期</label>
               <input 
                 v-model="form.date" 
                 type="date" 
                 required
                 class="w-full border border-[#E8E2D8] focus:border-[#1B4588]/30 bg-[#F0ECE6] rounded-2xl px-5 py-4 text-center font-bold text-[#1B4588] transition-colors outline-none"
               >
            </div>

            <!-- 描述 -->
            <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">工作內容簡述</label>
               <input 
                 v-model="form.description" 
                 type="text" 
                 placeholder="進場佈置 / 拍攝紀錄 等" 
                 class="w-full border border-transparent border-b-[#E8E2D8] focus:border-b-[#1B4588]/30 bg-transparent rounded-none px-2 py-3 text-sm font-bold text-[#6b6050] transition-colors outline-none placeholder:text-[#c4baa8]"
               >
            </div>

            <button 
              type="submit" 
              :disabled="isLoading || !form.name || !form.hours"
              class="w-full bg-[#1B4588] hover:bg-[#153a70] text-white font-bold py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-[#1B4588]/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <PhPaperPlaneRight v-if="!isLoading" weight="fill" />
              <PhSpinner v-else class="animate-spin" />
              <span>送出工時紀錄</span>
            </button>
         </form>
      </div>

      <!-- 最近紀錄區塊 -->
      <div v-if="recentLogs.length > 0 && !isSuccess" class="mt-8 w-full animate-fade-in">
        <h3 class="text-xs font-bold text-[#a09888] uppercase tracking-[0.2em] mb-4 text-center">您的近期登記 (未結算)</h3>
        <div class="space-y-3">
          <div v-for="log in recentLogs" :key="log.id" class="bg-white/60 backdrop-blur-sm border border-[#E8E2D8] rounded-2xl p-4 flex justify-between items-center group">
            <div class="flex-1 min-w-0 pr-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-mono font-bold text-[#a09888]">{{ new Date(log.date).toLocaleDateString() }}</span>
                <span class="font-bold text-[#6b6050] text-sm truncate">{{ log.description || '一般執行' }}</span>
              </div>
              <div class="text-xs text-[#b5aa9a] font-bold">{{ log.hours }} 小時</div>
            </div>
            <button @click="deleteLog(log.id)" class="bg-rose-50 text-rose-500 hover:bg-rose-100 p-2 rounded-xl transition-colors">
              <PhTrash weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { PhPaperPlaneRight, PhSpinner, PhCheckCircle, PhTrash } from '@phosphor-icons/vue';

// 隱藏的系統預設時薪
const DEFAULT_HOURLY_RATE = 200;

const isLoading = ref(false);
const isSuccess = ref(false);
const recentLogs = ref([]);

const form = reactive({
    name: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
});

const fetchRecentLogs = async () => {
    if (!form.name.trim()) {
        recentLogs.value = [];
        return;
    }
    try {
        const { data } = await useFetch('/api/hr/get-logs');
        if (data.value) {
            // 只過濾出符合姓名且尚未結算的紀錄
            recentLogs.value = data.value.pending.filter(l => l.targetName === form.name.trim()).slice(0, 5);
        }
    } catch (e) {
        console.error("Failed to fetch logs", e);
    }
};

const submitPunch = async () => {
    if (!form.name || !form.hours) return;
    isLoading.value = true;

    try {
        await $fetch('/api/hr/post-logs', {
            method: 'POST',
            body: {
                targetName: form.name.trim(),
                hours: Number(form.hours),
                hourlyRate: DEFAULT_HOURLY_RATE,
                date: new Date(form.date).toISOString(),
                description: form.description.trim()
            }
        });
        isSuccess.value = true;
        await fetchRecentLogs();
    } catch (e) {
        alert("登記失敗，請檢查網路連線或聯絡管理員。");
    } finally {
        isLoading.value = false;
    }
};

const deleteLog = async (id) => {
    if (!confirm('確定要刪除這筆尚未結算的紀錄嗎？')) return;
    try {
        await $fetch('/api/hr/delete-log', {
            method: 'POST',
            body: { id }
        });
        await fetchRecentLogs();
    } catch (e) {
        alert("刪除失敗");
    }
};

const resetForm = () => {
    form.hours = '';
    form.description = '';
    form.date = new Date().toISOString().split('T')[0];
    isSuccess.value = false;
};
</script>
