<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isOpen" class="fixed inset-0 z-[100] bg-[#F0ECE6] flex flex-col overflow-hidden">
           
           <!-- 上半部：深藍色背景 -->
           <div class="bg-[#1B4588] text-white p-6 sm:p-8 pt-12 sm:pt-16 relative shrink-0">
               <!-- 右上角關閉按鈕 -->
              <button @click="close" class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
              </button>

              <!-- 標題輸入框 (放大) -->
              <div class="mb-6 mr-12 mt-4 max-w-4xl mx-auto w-full">
                 <label class="block text-xs font-bold text-white/60 mb-2 pl-1">專案名稱</label>
                 <input v-model="form.name" type="text" placeholder="例如：2026 青年系列活動" 
                        class="w-full bg-transparent border-b-2 border-white/20 px-1 py-2 text-3xl sm:text-4xl font-bold text-white focus:border-white transition-colors outline-none placeholder:text-white/30">
              </div>

              <!-- 總預算 -->
              <div class="bg-white/10 rounded-[20px] p-6 border border-white/5 relative overflow-hidden max-w-4xl mx-auto w-full">
                  <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <label class="block text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-2 relative z-10">總預算</label>
                  <div class="relative flex items-center relative z-10">
                     <div class="text-white/50 font-mono font-bold text-4xl mr-3">$</div>
                     <input v-model="form.totalBudget" type="number" placeholder="0" 
                            class="w-full bg-transparent py-1 text-4xl sm:text-5xl font-mono font-bold text-white outline-none placeholder:text-white/30">
                 </div>
              </div>
           </div>

           <!-- 下半部：表單與按鈕 -->
           <div class="p-6 sm:p-8 flex-1 overflow-y-auto">
              <div class="space-y-6 max-w-4xl mx-auto w-full">
                  <!-- 公司提撥率 -->
                  <div class="bg-white rounded-[24px] p-8 shadow-sm border border-[#E8E2D8]">
                     <label class="block text-xs font-bold text-[#a09888] uppercase tracking-[0.2em] mb-4">公司提撥率</label>
                     <div class="flex items-center gap-4">
                         <input v-model="form.retention" type="number" placeholder="10" 
                                class="flex-1 bg-[#F0ECE6] border-none rounded-2xl px-6 py-5 text-3xl font-mono font-bold text-[#1B4588] outline-none placeholder:text-[#c4baa8] text-center">
                         <div class="text-[#a09888] font-bold text-2xl">%</div>
                     </div>
                     <p class="text-sm text-[#b5aa9a] mt-4 text-center">
                        結算時會從總預算中扣除此比例做為安全餘額，剩餘資金若未花完可全數入公司帳。
                     </p>
                  </div>
              </div>

              <!-- 按鈕 -->
              <div class="flex gap-4 mt-12 max-w-4xl mx-auto w-full pb-12">
                  <button @click="close" 
                          class="flex-1 bg-white hover:bg-[#F5F5F0] text-[#a09888] font-bold py-5 rounded-2xl transition-colors border border-[#E8E2D8] text-lg">
                     取消
                  </button>
                  <button @click="submit" :disabled="!isValid || isLoading" 
                          class="flex-[2] bg-[#1B4588] hover:bg-[#153a70] text-white font-bold py-5 rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 active:scale-95 shadow-lg shadow-[#1B4588]/20 text-lg">
                     <PhPlus weight="bold" class="text-2xl" /> <span>建立專案</span>
                  </button>
               </div>
           </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { PhPlus } from '@phosphor-icons/vue';
import { useBudgetStore } from '~/stores/budget';

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
