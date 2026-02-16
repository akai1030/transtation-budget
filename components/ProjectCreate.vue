<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-[#1B4588]/20 backdrop-blur-sm" @click="close"></div>
      
      <div class="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl relative">
         <h2 class="text-xl font-bold text-[#1B4588] mb-6 text-center">新增專案</h2>
         
         <div class="space-y-4">
            <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">專案名稱</label>
               <input v-model="form.name" type="text" placeholder="例如：2026年度活動" class="w-full bg-[#F0ECE6] border border-[#E8E2D8] rounded-2xl px-4 py-3 text-[#1B4588] font-bold focus:ring-2 focus:ring-[#1B4588]/20 outline-none placeholder:text-[#c4baa8]">
            </div>

            <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">總預算</label>
               <div class="relative">
                   <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4CEC3] font-mono font-bold">$</div>
                   <input v-model="form.totalBudget" type="number" placeholder="0" class="w-full bg-[#F0ECE6] border border-[#E8E2D8] rounded-2xl pl-8 pr-4 py-3 text-[#1B4588] font-mono font-bold focus:ring-2 focus:ring-[#1B4588]/20 outline-none placeholder:text-[#c4baa8]">
               </div>
            </div>

             <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">公司提撥率 (%)</label>
               <div class="relative">
                   <input v-model="form.retention" type="number" placeholder="10" class="w-full bg-[#F0ECE6] border border-[#E8E2D8] rounded-2xl px-4 py-3 text-[#1B4588] font-mono font-bold focus:ring-2 focus:ring-[#1B4588]/20 outline-none placeholder:text-[#c4baa8]">
                   <div class="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4CEC3] font-bold">%</div>
               </div>
            </div>
         </div>

         <div class="grid grid-cols-2 gap-3 mt-8">
            <button @click="submit" :disabled="!isValid || isLoading" class="bg-[#1B4588] hover:bg-[#153a70] text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1B4588]/20">
               <PhPlus weight="bold" /> 新增
            </button>
            <button @click="close" class="bg-[#F0ECE6] hover:bg-[#E8E2D8] text-[#a09888] font-bold py-3 rounded-full transition-colors border border-[#E8E2D8]">
               取消
            </button>
         </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { PhPlus } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const store = useBudgetStore();
const isLoading = ref(false);

const form = reactive({
    name: '',
    totalBudget: '',
    retention: 10
});

const isValid = computed(() => form.name && form.totalBudget > 0);

const close = () => {
    emit('close');
};

const submit = async () => {
    if (!isValid.value) return;
    isLoading.value = true;
    try {
        await store.createProject({
            name: form.name,
            totalBudget: Number(form.totalBudget),
            retention: Number(form.retention)
        });
        form.name = '';
        form.totalBudget = '';
        form.retention = 10;
        close();
    } catch (e) {
        alert(e.message);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
