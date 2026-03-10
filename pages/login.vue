<template>
  <div class="min-h-screen bg-[#F0ECE6] flex items-center justify-center p-6 relative overflow-hidden">
    <!-- 背景裝飾 -->
    <div class="absolute -top-[20%] -right-[10%] w-[60%] aspect-square bg-[#1B4588]/5 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-[10%] -left-[10%] w-[50%] aspect-square bg-[#1B4588]/5 rounded-full blur-3xl"></div>

    <div class="w-full max-w-sm bg-white/80 backdrop-blur-xl border border-[#E8E2D8] rounded-[40px] p-8 shadow-2xl relative z-10">
      
      <!-- 標題區 -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-sm border border-[#E8E2D8] flex items-center justify-center p-3">
            <svg viewBox="0 0 200 200" class="w-full h-full">
                <circle cx="100" cy="52" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
                <circle cx="142" cy="76" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
                <circle cx="142" cy="124" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
                <circle cx="100" cy="148" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
                <circle cx="58" cy="124" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
                <circle cx="58" cy="76" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
                <circle cx="100" cy="100" r="10" fill="#1B4588"/>
            </svg>
        </div>
        <h1 class="text-2xl font-black text-[#1B4588] tracking-tight mb-1 uppercase">ERP SYSTEM</h1>
        <p class="text-[10px] font-bold text-[#a09888] tracking-widest uppercase">身份驗證序號</p>
      </div>

      <!-- 進度顯示 -->
      <div class="flex justify-center gap-2 mb-8">
          <div 
            v-for="(char, index) in TARGET_SEQUENCE" 
            :key="index"
            class="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300"
            :class="[
                inputSequence.length > index ? 'bg-[#1B4588] border-[#1B4588] text-white' : 'bg-[#F0ECE6] border-[#E8E2D8] text-[#D4CEC3]'
            ]"
          >
            <PhCheck v-if="inputSequence.length > index" weight="bold" />
            <span v-else class="text-xs font-mono font-bold">{{ char.toUpperCase() }}</span>
          </div>
      </div>

      <!-- 隨機按鈕區域 -->
      <div class="grid grid-cols-3 gap-3">
          <button 
            v-for="btn in buttons" 
            :key="btn.id"
            @click="handleButtonClick(btn.char)"
            class="aspect-square bg-white border border-[#E8E2D8] hover:border-[#1B4588]/30 rounded-2xl flex items-center justify-center text-2xl font-mono font-black text-[#1B4588] transition-all active:scale-90 hover:shadow-md hover:-translate-y-0.5"
          >
            {{ btn.char }}
          </button>
      </div>

      <div class="mt-8 text-center">
          <p v-if="error" class="text-rose-500 text-xs font-bold animate-shake">{{ error }}</p>
          <p v-else class="text-[10px] text-[#a09888] font-bold">依序點擊按鈕以進入系統</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PhCheck } from '@phosphor-icons/vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const TARGET_SEQUENCE = ['d', 'p', 'c', 'a'];
const inputSequence = ref([]);
const buttons = ref([]);
const error = ref('');

// 產生包含目標字母與干擾字母的按鈕清單
const generateButtons = () => {
    const chars = ['d', 'p', 'c', 'a', 'x', 'z', 'm', 'k', 'o'];
    const shuffled = chars.sort(() => Math.random() - 0.5);
    buttons.value = shuffled.map((char, index) => ({
        id: index,
        char: char
    }));
};

const handleButtonClick = async (char) => {
    error.value = '';
    const nextExpectedIndex = inputSequence.value.length;
    
    if (char === TARGET_SEQUENCE[nextExpectedIndex]) {
        inputSequence.value.push(char);
        
        if (inputSequence.value.length === TARGET_SEQUENCE.length) {
            // 成功登入
            authStore.loginSuccess();
            await navigateTo('/');
        } else {
            // 正確但還沒完，重新洗牌
            generateButtons();
        }
    } else {
        // 點錯了，重設
        error.value = '順序錯誤，請重新開始';
        inputSequence.value = [];
        generateButtons();
    }
};

onMounted(() => {
    generateButtons();
});
</script>

<style scoped>
.animate-shake {
    animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
