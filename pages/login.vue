<template>
  <div class="min-h-screen bg-[#F0ECE6] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-[#1B4588] selection:text-white">
    <!-- 背景裝飾圓形 -->
    <div class="absolute -top-[20%] -right-[10%] w-[60%] aspect-square bg-gradient-to-br from-white/60 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-[20%] -left-[10%] w-[60%] aspect-square bg-gradient-to-tr from-[#1B4588]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-sm relative z-10">
      <div class="text-center mb-10">
         <div class="inline-flex items-center justify-center w-20 h-20 rounded-[24px] bg-white shadow-sm mb-6 border border-[#E8E2D8]">
             <PhLockKey class="text-4xl text-[#1B4588]" weight="duotone" />
         </div>
         <h1 class="text-3xl font-bold tracking-tight text-[#1B4588] mb-2">專案預算 ERP 系統</h1>
         <p class="text-[#8c8273]">請輸入管理員密碼以進入系統</p>
      </div>

      <div class="bg-white rounded-[32px] p-8 shadow-sm border border-[#E8E2D8]">
         <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
            <div>
               <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">管理員密碼</label>
               <input 
                 v-model="password" 
                 type="password" 
                 required
                 :class="{ 'border-red-400 focus:border-red-500 bg-red-50': error, 'border-[#E8E2D8] focus:border-[#1B4588]/30 bg-[#F0ECE6]': !error }"
                 placeholder="••••••••" 
                 class="w-full border rounded-2xl px-5 py-4 text-center text-xl font-mono text-[#1B4588] transition-colors outline-none tracking-widest placeholder:text-[#c4baa8] placeholder:tracking-normal"
               >
               <div v-if="error" class="text-red-500 text-xs text-center mt-3 font-bold flex items-center justify-center gap-1">
                 <PhWarningCircle weight="bold" />密碼錯誤
               </div>
            </div>
            <button 
              type="submit" 
              class="w-full bg-[#1B4588] hover:bg-[#153a70] text-white font-bold py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-[#1B4588]/20 flex items-center justify-center gap-2 group"
            >
              <span>進入系統</span>
              <PhArrowRight weight="bold" class="group-hover:translate-x-1 transition-transform" />
            </button>
         </form>
      </div>

      <div class="text-center mt-8 text-xs text-[#b5aa9a]">
        版本 2.0.0
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PhLockKey, PhArrowRight, PhWarningCircle } from '@phosphor-icons/vue';

const password = ref('');
const error = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = () => {
    error.value = false;
    if (authStore.login(password.value)) {
        router.push('/');
    } else {
        error.value = true;
        password.value = '';
    }
};
</script>
