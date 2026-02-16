<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-[#1B4588]/20 backdrop-blur-sm transition-opacity" @click="close"></div>

      <!-- 卡片 -->
      <div class="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- 頂部裝飾 -->
        <div class="h-28 bg-[#F0ECE6] relative">
            <div class="absolute inset-0 opacity-[0.06]">
              <svg viewBox="0 0 200 200" class="w-32 h-32 absolute -right-8 -top-8">
                <circle cx="100" cy="52" r="56" fill="#1B4588"/>
                <circle cx="142" cy="76" r="56" fill="#1B4588"/>
                <circle cx="142" cy="124" r="56" fill="#1B4588"/>
                <circle cx="100" cy="148" r="56" fill="#1B4588"/>
                <circle cx="58" cy="124" r="56" fill="#1B4588"/>
                <circle cx="58" cy="76" r="56" fill="#1B4588"/>
              </svg>
            </div>
            <button @click="close" class="absolute top-4 right-4 w-8 h-8 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-[#a09888] hover:text-[#1B4588] transition-colors z-20">
                <PhX weight="bold" />
            </button>
        </div>

        <!-- 內容 -->
        <div class="px-6 pb-6 -mt-12 relative z-10 flex-1 overflow-y-auto">
            <!-- 圖示 -->
            <div class="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center text-4xl mb-4 mx-auto border-4 border-white text-[#1B4588]">
                <PhReceipt />
            </div>

            <!-- 檢視模式 -->
            <div v-if="!isEditing" class="text-center space-y-4">
                <div>
                   <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">金額</div>
                   <div class="text-4xl font-mono font-bold text-[#1B4588] tracking-tighter">
                      ${{ formatNumber(transaction.amount) }}
                   </div>
                </div>

                <div class="bg-[#F0ECE6] rounded-2xl p-4 text-left space-y-3">
                    <div class="flex justify-between items-center text-sm border-b border-[#E8E2D8] pb-2">
                        <span class="text-[#a09888] font-bold">日期</span>
                        <span class="font-mono font-bold text-[#1B4588]">{{ formatDate(transaction.date) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-[#E8E2D8] pb-2">
                        <span class="text-[#a09888] font-bold">專案</span>
                        <span class="font-bold text-[#1B4588] truncate max-w-[150px]">{{ getProjectName(transaction.projectId) }}</span>
                    </div>
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-[#a09888] font-bold">付款人</span>
                        <span class="font-bold text-[#1B4588]">{{ transaction.relatedUser || transaction.user?.name }}</span>
                    </div>
                </div>

                <div class="text-left">
                    <span class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">備註</span>
                    <p class="mt-1 text-sm font-medium text-[#6b6050] leading-relaxed">
                        {{ transaction.description || transaction.subject || '無備註' }}
                    </p>
                </div>

                <!-- 操作按鈕 -->
                <div class="grid grid-cols-2 gap-3 pt-4">
                    <button @click="startEditing" class="py-3 rounded-full bg-[#1B4588] text-white font-bold shadow-lg shadow-[#1B4588]/20 hover:scale-[1.02] transition-transform">
                        編輯
                    </button>
                    <button @click="confirmDelete" class="py-3 rounded-full bg-[#F0ECE6] text-[#a09888] font-bold hover:bg-red-50 hover:text-red-500 transition-colors">
                        刪除
                    </button>
                </div>
            </div>

            <!-- 編輯模式 -->
            <div v-else class="space-y-4">
                 <div class="text-center text-sm font-bold text-[#1B4588] mb-4">編輯交易</div>
                 
                 <label class="block">
                    <span class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">金額</span>
                    <input v-model.number="editForm.amount" type="number" class="w-full mt-1 bg-[#F0ECE6] rounded-xl p-3 font-mono font-bold outline-none ring-2 ring-transparent focus:ring-[#1B4588]/20 text-center text-2xl text-[#1B4588] border border-[#E8E2D8]">
                 </label>

                  <label class="block">
                    <span class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">日期</span>
                    <input v-model="editForm.date" type="date" class="w-full mt-1 bg-[#F0ECE6] rounded-xl p-3 font-bold outline-none border border-[#E8E2D8] text-[#1B4588]">
                 </label>

                  <label class="block">
                    <span class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">專案</span>
                     <select v-model="editForm.projectId" class="w-full mt-1 bg-[#F0ECE6] rounded-xl p-3 font-bold outline-none appearance-none border border-[#E8E2D8] text-[#1B4588]">
                        <option v-for="p in store.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                 </label>

                 <label class="block">
                    <span class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">備註</span>
                    <textarea v-model="editForm.description" rows="3" class="w-full mt-1 bg-[#F0ECE6] rounded-xl p-3 font-medium outline-none resize-none border border-[#E8E2D8] text-[#6b6050]"></textarea>
                 </label>

                 <div class="grid grid-cols-2 gap-3 pt-2">
                    <button @click="saveEdit" :disabled="isLoading" class="py-3 rounded-full bg-[#1B4588] text-white font-bold shadow-lg shadow-[#1B4588]/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                        <PhCheck weight="bold" /> 儲存
                    </button>
                    <button @click="isEditing = false" class="py-3 rounded-full bg-[#F0ECE6] text-[#a09888] font-bold border border-[#E8E2D8]">
                        取消
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { PhX, PhReceipt, PhCheck } from '@phosphor-icons/vue';

const props = defineProps({
    isOpen: Boolean,
    transaction: Object
});

const emit = defineEmits(['close', 'updated', 'deleted']);
const store = useBudgetStore();
const isEditing = ref(false);
const isLoading = ref(false);

const editForm = reactive({
    amount: 0,
    date: '',
    projectId: '',
    description: ''
});

watch(() => props.transaction, (tx) => {
    if (tx) {
        editForm.amount = tx.amount;
        editForm.date = new Date(tx.date).toISOString().split('T')[0];
        editForm.projectId = tx.projectId;
        editForm.description = tx.description;
    }
}, { immediate: true });

const close = () => {
    isEditing.value = false;
    emit('close');
};

const startEditing = () => {
    isEditing.value = true;
       if (props.transaction) {
        editForm.amount = props.transaction.amount;
        editForm.date = new Date(props.transaction.date).toISOString().split('T')[0];
        editForm.projectId = props.transaction.projectId;
        editForm.description = props.transaction.description;
    }
};

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
const formatDate = (d) => new Date(d).toLocaleDateString('zh-TW');
const getProjectName = (pid) => store.projects.find(p => p.id === pid)?.name || 'Unknown';

const confirmDelete = async () => {
    if (confirm('確定要永久刪除這筆交易嗎？此動作無法復原。')) {
        try {
            await $fetch(`/api/transaction/${props.transaction.id}`, { method: 'DELETE' });
            emit('deleted');
            close();
            store.loadData(true);
        } catch (e) {
            alert('刪除失敗: ' + e.message);
        }
    }
};

const saveEdit = async () => {
    if (editForm.amount <= 0) {
        alert('金額必須大於 0');
        return;
    }
    
    isLoading.value = true;
    try {
        await $fetch(`/api/transaction/${props.transaction.id}`, {
            method: 'PUT',
            body: {
                ...editForm,
                category: props.transaction.budgetLineCategory,
                photoUrl: props.transaction.photoUrl
            }
        });
        
        emit('updated');
        isEditing.value = false;
        close();
        store.loadData(true);
        
    } catch (e) {
        alert('更新失敗: ' + e.message);
    } finally {
        isLoading.value = false;
    }
};
</script>
