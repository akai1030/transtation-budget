<template>
  <div class="px-6 pt-8 pb-32">
    <!-- 頁首與資訊 -->
    <div class="mb-8 flex justify-between items-end">
      <div>
         <h1 class="text-3xl font-bold tracking-tight text-[#1B4588] mb-2">人資系統</h1>
         <p class="text-[13px] font-medium text-[#b5aa9a]">管理團隊執行工時與結算</p>
      </div>
      <!-- 新增工時按鈕 -->
      <button @click="isCreateModalOpen = true" class="w-12 h-12 bg-[#1B4588] text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-[#1B4588]/20 hover:scale-105 active:scale-95 transition-all">
          <PhPlus weight="bold" class="text-2xl" />
      </button>
    </div>

    <!-- 狀態切換標籤 -->
    <div class="flex gap-2 mb-6 bg-white p-1 rounded-full shadow-sm border border-[#E8E2D8] w-fit">
       <button 
         @click="activeTab = 'pending'"
         :class="['px-6 py-2.5 rounded-full text-sm font-bold transition-all', activeTab === 'pending' ? 'bg-[#1B4588] text-white' : 'text-[#a09888] hover:text-[#6b6050]']"
       >
         待結算工時
       </button>
       <button 
         @click="activeTab = 'settled'"
         :class="['px-6 py-2.5 rounded-full text-sm font-bold transition-all', activeTab === 'settled' ? 'bg-[#1B4588] text-white' : 'text-[#a09888] hover:text-[#6b6050]']"
       >
         已結算歷史
       </button>
    </div>

    <!-- 待結算區塊 -->
    <div v-show="activeTab === 'pending'">
      <div v-if="isLoading" class="py-12 flex justify-center text-[#a09888]">
          <PhSpinner class="animate-spin text-3xl" />
      </div>

      <!-- 分組顯示未結算的工時 (按人員名稱分組) -->
      <div v-else-if="Object.keys(groupedPendingLogs).length === 0" class="bg-white rounded-[28px] border border-[#E8E2D8] p-10 flex flex-col items-center justify-center text-center">
         <div class="w-16 h-16 bg-[#F0ECE6] rounded-full flex items-center justify-center mb-4">
             <PhCoffee class="text-3xl text-[#b5aa9a] opacity-50" weight="duotone" />
         </div>
         <h3 class="font-bold text-[#1B4588] text-lg">目前沒有待結算工時</h3>
         <p class="text-xs text-[#a09888] mt-1">大家的時數都已結清，或是還沒有人登記</p>
      </div>

      <div v-else class="space-y-6">
         <!-- 全域結算控制面板 -->
         <div class="bg-white rounded-[28px] p-6 shadow-sm border-2 border-[#1B4588] flex justify-between items-center top-4 shrink-0">
             <div>
                <p class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">待結總金額</p>
                <p class="text-2xl font-mono font-bold text-rose-500">${{ Math.round(totalPendingAmount).toLocaleString() }}</p>
             </div>
             <button @click="openCheckoutModal" class="bg-[#1B4588] hover:bg-[#153a70] text-white px-6 py-3 rounded-xl font-bold transition-colors text-sm shadow-md">
                統一結算
             </button>
         </div>

         <!-- 個人明細卡片 -->
         <div v-for="(personLogs, personName) in groupedPendingLogs" :key="personName" class="bg-white rounded-[28px] border border-[#E8E2D8] p-5 shadow-sm">
             <div class="flex justify-between items-center mb-4 pb-4 border-b border-[#F0ECE6]">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-[#F0ECE6] rounded-full flex items-center justify-center text-[#1B4588] font-bold">
                        {{ personName.charAt(0) }}
                    </div>
                    <div>
                        <h4 class="font-bold text-[#6b6050] text-lg">{{ personName }}</h4>
                        <p class="text-xs text-[#a09888] font-mono">{{ personLogs.totalHours }} 小時</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">小計</p>
                    <p class="font-mono font-bold text-[#1B4588] text-xl">${{ Math.round(personLogs.totalAmount).toLocaleString() }}</p>
                </div>
             </div>

             <!-- 明細條目 -->
             <div class="space-y-3">
                 <div v-for="log in personLogs.logs" :key="log.id" class="flex justify-between items-start text-sm group/item">
                    <div class="flex-1 min-w-0">
                       <div class="flex items-center gap-2">
                          <span class="text-[#a09888] text-xs font-mono">{{ new Date(log.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) }}</span>
                          <span class="font-bold text-[#6b6050] truncate">{{ log.description || '一般執行' }}</span>
                       </div>
                    </div>
                    <div class="flex items-center gap-3">
                       <div class="text-right">
                          <span class="font-mono font-bold text-[#b5aa9a] mr-2 text-xs">${{ log.hourlyRate }}/hr &times; {{ log.hours }}</span>
                          <span class="font-mono font-bold text-[#6b6050] font-xl">${{ Math.round(log.amount).toLocaleString() }}</span>
                       </div>
                       <button @click="deleteLog(log.id)" class="opacity-0 group-hover/item:opacity-100 p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <PhTrash weight="bold" />
                       </button>
                    </div>
                 </div>
             </div>
         </div>
      </div>
    </div>

    <!-- 已結算歷史區塊 -->
    <div v-show="activeTab === 'settled'">
       <div v-if="isLoading" class="py-12 flex justify-center text-[#a09888]">
          <PhSpinner class="animate-spin text-3xl" />
      </div>
      <div v-else-if="settledLogs.length === 0" class="text-center py-12 text-[#a09888] text-sm font-bold">
          尚無結算紀錄
      </div>
      <div v-else class="space-y-4">
          <div v-for="log in settledLogs" :key="log.id" class="bg-white rounded-2xl p-4 border border-[#E8E2D8] flex justify-between items-center opacity-70">
              <div>
                  <div class="font-bold text-[#6b6050] text-sm">{{ log.targetName || log.user?.name }}</div>
                  <div class="text-xs text-[#a09888] flex gap-2 mt-1">
                      <span>{{ new Date(log.date).toLocaleDateString() }}</span>
                      <span>{{ log.hours }}h @ ${{ log.hourlyRate }}</span>
                  </div>
              </div>
              <div class="text-right flex items-center gap-4">
                  <div>
                      <div class="font-mono font-bold text-[#1B4588]">${{ Math.round(log.amount).toLocaleString() }}</div>
                      <div class="text-[10px] text-[#b5aa9a] mt-1">{{ log.description || '工時' }}</div>
                  </div>
                  <button @click="revertLog(log.id)" class="text-[#a09888] hover:text-[#1B4588] bg-[#F0ECE6] hover:bg-[#E8E2D8] p-2 rounded-xl transition-all shadow-sm" title="退回為未結算狀態">
                      <PhArrowUUpLeft weight="bold" />
                  </button>
              </div>
          </div>
      </div>
    </div>

    <!-- 新增工時 Modal (Teleport to body) -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isCreateModalOpen" class="fixed inset-0 z-[100] bg-[#F0ECE6] flex flex-col overflow-hidden">
           
           <!-- 上半部：藍色區塊 -->
           <div class="bg-[#1B4588] text-white p-6 sm:p-8 pt-12 sm:pt-16 relative shrink-0">
               <button @click="isCreateModalOpen = false" class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
               </button>
               <div class="max-w-4xl mx-auto w-full mb-2">
                   <h2 class="text-3xl font-bold">登記執行工時</h2>
                   <p class="text-white/60 text-sm mt-2">記錄人員的執行時間，稍後可統一結算於專案中</p>
               </div>
               
               <div class="bg-white/10 rounded-[24px] p-6 border border-white/5 relative overflow-hidden max-w-4xl mx-auto w-full flex items-center justify-between mt-8">
                   <div class="absolute -left-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                   <div class="relative z-10 w-full">
                       <label class="block text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-3">人員對象</label>
                       <!-- 選擇既有成員 或 手動輸入 -->
                       <div class="flex flex-col gap-3">
                           <select v-model="formTargetMode" class="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-white outline-none font-bold appearance-none">
                               <option value="system" class="text-black">系統內成員</option>
                               <option value="custom" class="text-black">自訂名字 (如外部支援)</option>
                           </select>
                           
                           <select v-if="formTargetMode === 'system'" v-model="form.userId" class="w-full bg-white border-2 border-transparent focus:border-white/50 rounded-xl px-4 py-3 text-[#1B4588] font-bold outline-none shadow-sm cursor-pointer transition-colors">
                               <option value="" disabled>請選擇人員</option>
                               <option v-for="u in store.users" :key="u.id" :value="u.id">{{ u.name }}</option>
                           </select>
                           
                           <template v-else>
                               <input v-model="form.targetName" list="admin-custom-targets" type="text" placeholder="輸入人員名稱" class="w-full bg-transparent border-b-2 border-white/20 px-1 py-2 text-xl font-bold text-white focus:border-white transition-colors outline-none placeholder:text-white/30">
                               <datalist id="admin-custom-targets">
                                 <option v-for="name in customTargets" :key="name" :value="name"></option>
                               </datalist>
                           </template>
                       </div>
                   </div>
               </div>
           </div>

           <!-- 下半部：詳細輸入 -->
           <div class="p-6 sm:p-8 flex-1 overflow-y-auto">
              <div class="space-y-6 max-w-4xl mx-auto w-full">
                  
                  <div class="grid grid-cols-2 gap-4">
                      <!-- 執行日期 -->
                     <div class="bg-white rounded-[24px] p-6 shadow-sm border border-[#E8E2D8]">
                        <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2">執行日期</label>
                        <input v-model="form.date" type="date" class="w-full bg-transparent border-none text-lg font-bold text-[#1B4588] outline-none placeholder:text-[#c4baa8]">
                     </div>
                     <!-- 時薪 -->
                     <div class="bg-white rounded-[24px] p-6 shadow-sm border border-[#E8E2D8]">
                        <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2">時薪 ($/hr)</label>
                        <input v-model="form.hourlyRate" type="number" placeholder="200" class="w-full bg-transparent border-none text-2xl font-mono font-bold text-[#1B4588] outline-none placeholder:text-[#c4baa8]">
                     </div>
                  </div>

                  <!-- 時數 -->
                  <div class="bg-white rounded-[24px] p-6 shadow-sm border border-[#E8E2D8]">
                     <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2">執行時數</label>
                     <div class="flex items-center gap-3">
                         <input v-model="form.hours" type="number" step="0.5" placeholder="0" class="flex-1 w-full bg-[#F0ECE6] border-none rounded-xl px-4 py-4 text-3xl font-mono font-bold text-[#1B4588] outline-none text-center">
                         <span class="text-[#a09888] font-bold text-xl">Hrs</span>
                     </div>
                  </div>

                  <!-- 工作描述 -->
                  <div class="bg-white rounded-[24px] p-6 shadow-sm border border-[#E8E2D8]">
                     <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2">工作描述 (選填)</label>
                     <input v-model="form.description" type="text" placeholder="例如：進場佈置、網站開發" class="w-full bg-transparent border-b border-[#E8E2D8] py-2 text-sm font-bold text-[#6b6050] outline-none placeholder:text-[#D4CEC3]">
                  </div>

                  <!-- 預計金額預覽 -->
                  <div class="text-center py-4">
                      <p class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">本次實領金額預估</p>
                      <p class="text-4xl font-mono font-bold tracking-tighter" :class="[previewAmount > 0 ? 'text-rose-500' : 'text-[#D4CEC3]']">
                          ${{ Math.round(previewAmount).toLocaleString() }}
                      </p>
                  </div>
              </div>

              <div class="flex gap-4 mt-8 max-w-4xl mx-auto w-full pb-12">
                  <button @click="isCreateModalOpen = false" class="flex-1 bg-white hover:bg-[#F5F5F0] text-[#a09888] font-bold py-5 rounded-2xl transition-colors border border-[#E8E2D8] text-lg">
                     放棄
                  </button>
                  <button @click="submitWorkLog" :disabled="!isCreateValid || submitting" class="flex-[2] bg-[#1B4588] hover:bg-[#153a70] text-white font-bold py-5 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-[#1B4588]/20 text-lg">
                     <PhPlus weight="bold" class="text-xl" /> <span>登記工時</span>
                  </button>
               </div>
           </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 結算 Modal -->
    <Teleport to="body">
       <Transition name="modal">
           <div v-if="isCheckoutModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeCheckoutModal"></div>
              <div class="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
                 <h2 class="text-2xl font-bold text-[#1B4588] mb-2 text-center tracking-tight">工時結算</h2>
                 <p class="text-xs text-[#a09888] text-center mb-6">需輸入管理員密碼以授權付款</p>

                 <div class="bg-rose-50 rounded-2xl p-4 mb-6 border border-rose-100 text-center">
                    <p class="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-1">本次總結算金額</p>
                    <p class="text-3xl font-mono font-bold text-rose-500">${{ Math.round(totalPendingAmount).toLocaleString() }}</p>
                 </div>

                 <div class="space-y-5 overflow-y-auto flex-1 pb-4">
                    <!-- 扣帳專案選擇 -->
                    <div>
                        <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2">扣帳專案 (必填)</label>
                        <select v-model="checkoutForm.projectId" class="w-full bg-[#F0ECE6] border border-[#E8E2D8] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#1B4588] outline-none cursor-pointer">
                            <option value="">(無專案) 以公司營運支出扣帳</option>
                            <option v-for="p in store.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                    </div>

                    <!-- 密碼驗證 -->
                    <div>
                       <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2">管理授權密碼</label>
                       <input v-model="checkoutForm.password" type="password" placeholder="請輸入密碼" class="w-full bg-[#F0ECE6] border border-[#E8E2D8] rounded-2xl px-4 py-3.5 text-center text-lg font-mono font-bold text-[#1B4588] focus:border-[#1B4588]/30 outline-none placeholder:text-[#c4baa8] tracking-widest">
                       <p v-if="checkoutError" class="text-red-500 text-xs font-bold mt-2 text-center">{{ checkoutError }}</p>
                    </div>
                 </div>

                 <div class="flex gap-3 mt-6">
                    <button @click="closeCheckoutModal" class="flex-1 bg-[#F0ECE6] hover:bg-[#E8E2D8] text-[#a09888] font-bold py-4 rounded-full transition-colors">取消</button>
                    <button @click="submitCheckout" :disabled="!checkoutForm.password || submitting" class="flex-[2] bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-rose-500/20">
                       <PhCheckCircle weight="bold" class="text-xl" /> <span>確認結算付帳</span>
                    </button>
                 </div>
              </div>
           </div>
       </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { PhPlus, PhSpinner, PhCoffee, PhPaperPlaneRight, PhTrash, PhCheckCircle, PhArrowUUpLeft } from '@phosphor-icons/vue';
import { useBudgetStore } from '~/stores/budget';
import { useAuthStore } from '~/stores/auth';

const store = useBudgetStore();
const authStore = useAuthStore();
const isLoading = ref(true);
const submitting = ref(false);

// Data
const activeTab = ref('pending'); // 'pending' | 'settled'
const pendingLogs = ref([]);
const settledLogs = ref([]);
const customTargets = ref([]); // 新增自訂象清單狀態

// Modals
const isCreateModalOpen = ref(false);
const isCheckoutModalOpen = ref(false);

const formTargetMode = ref('system'); // 'system' or 'custom'
const form = reactive({
    userId: '',
    targetName: '',
    date: new Date().toISOString().split('T')[0], // yyyy-mm-dd format
    hours: '',
    hourlyRate: 200,
    description: ''
});

const previewAmount = computed(() => {
    return Number(form.hours || 0) * Number(form.hourlyRate || 0);
});

const isCreateValid = computed(() => {
    const hasTarget = formTargetMode.value === 'system' ? form.userId : form.targetName;
    return hasTarget && Number(form.hours) > 0 && Number(form.hourlyRate) > 0 && form.date;
});

const checkoutForm = reactive({
    password: '',
    projectId: ''
});
const checkoutError = ref('');

const loadLogs = async () => {
    isLoading.value = true;
    try {
        const data = await $fetch('/api/hr/get-logs');
        if (data) {
            pendingLogs.value = data.pending || [];
            settledLogs.value = data.settled || [];
        }
    } catch (e) {
        console.error("Failed to load HR logs", e);
    } finally {
        isLoading.value = false;
    }
};

const fetchCustomTargets = async () => {
    try {
        const data = await $fetch('/api/hr/get-custom-targets');
        customTargets.value = data || [];
    } catch (e) {
        console.error("Failed to fetch custom targets", e);
    }
};

onMounted(() => {
    loadLogs();
    fetchCustomTargets();
});

// Group pending logs by person name
const groupedPendingLogs = computed(() => {
    const groups = {};
    pendingLogs.value.forEach(log => {
        // Resolve target name
        let name = log.targetName;
        if (!name && log.userId && store.users.length) {
            const u = store.users.find(u => u.id === log.userId);
            name = u ? u.name : '未知成員';
        }
        if (!name) name = '未知對象';

        if (!groups[name]) {
            groups[name] = { totalHours: 0, totalAmount: 0, logs: [] };
        }
        groups[name].logs.push(log);
        groups[name].totalHours += log.hours;
        groups[name].totalAmount += log.amount;
    });
    return groups;
});

const totalPendingAmount = computed(() => {
    return pendingLogs.value.reduce((sum, log) => sum + log.amount, 0);
});

const submitWorkLog = async () => {
    if (!isCreateValid.value) return;
    submitting.value = true;
    try {
        const payload = {
            date: new Date(form.date).toISOString(),
            hours: Number(form.hours),
            hourlyRate: Number(form.hourlyRate),
            description: form.description
        };
        // resolve target
        if (formTargetMode.value === 'system') {
            payload.userId = form.userId;
        } else {
            payload.targetName = form.targetName;
            // Provide the current user's ID as a fallback owner in the DB if necessary
            payload.userId = store.currentUser?.id; 
        }

        await $fetch('/api/hr/post-logs', {
            method: 'POST',
            body: payload
        });

        // Reset & Close
        form.userId = '';
        form.targetName = '';
        form.hours = '';
        form.description = '';
        isCreateModalOpen.value = false;
        
        await loadLogs();
    } catch (e) {
        alert("新增失敗");
        console.error(e);
    } finally {
        submitting.value = false;
    }
};

const openCheckoutModal = () => {
    checkoutForm.password = '';
    checkoutForm.projectId = '';
    checkoutError.value = '';
    isCheckoutModalOpen.value = true;
};

const closeCheckoutModal = () => {
    isCheckoutModalOpen.value = false;
};

const submitCheckout = async () => {
    // 驗證密碼
    if (checkoutForm.password !== 'nttudpca2022') {
        checkoutError.value = '密碼錯誤，請重新輸入';
        return;
    }
    checkoutError.value = '';
    submitting.value = true;
    
    try {
        await $fetch('/api/hr/post-checkout', {
            method: 'POST',
            body: {
                logIds: pendingLogs.value.map(l => l.id),
                projectId: checkoutForm.projectId || null,
                settledById: store.currentUser?.id // 紀錄是誰操作結算的
            }
        });
        
        // Refresh full global data for transactions/balances
        await store.loadData();
        // Refresh local logs
        await loadLogs();
        
        closeCheckoutModal();
        alert('結算成功！');
    } catch (e) {
        checkoutError.value = e.message || '結算失敗';
    } finally {
        submitting.value = false;
    }
};

const deleteLog = async (id) => {
    if (!confirm('確定要刪除這筆工時紀錄嗎？')) return;
    try {
        await $fetch('/api/hr/delete-log', {
            method: 'POST',
            body: { id }
        });
        await loadLogs();
    } catch (e) {
        alert("刪除失敗");
    }
};

const revertLog = async (id) => {
    if (!confirm('確定要將此紀錄退回「待結算」狀態嗎？\n(將會從已結算專案中移除)')) return;
    try {
        await $fetch('/api/hr/revert-log', {
            method: 'POST',
            body: { id }
        });
        await loadLogs();
    } catch (e) {
        alert("退回失敗");
    }
};

</script>

<style scoped>
.modal-enter-active,
.modal-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
