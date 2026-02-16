<template>
  <div class="min-h-screen bg-[#F0ECE6] pb-32 text-[#1C1C1E] font-sans relative overflow-x-hidden transition-colors duration-300">
    <!-- 品牌背景裝飾 -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <!-- 右上花形 -->
      <div class="absolute -top-24 -right-24 w-72 h-72 opacity-[0.05]">
        <svg viewBox="0 0 200 200" class="w-full h-full">
          <circle cx="100" cy="52" r="56" fill="#1B4588"/>
          <circle cx="142" cy="76" r="56" fill="#1B4588"/>
          <circle cx="142" cy="124" r="56" fill="#1B4588"/>
          <circle cx="100" cy="148" r="56" fill="#1B4588"/>
          <circle cx="58" cy="124" r="56" fill="#1B4588"/>
          <circle cx="58" cy="76" r="56" fill="#1B4588"/>
        </svg>
      </div>
      <!-- 左下花形 -->
      <div class="absolute -bottom-32 -left-20 w-56 h-56 opacity-[0.04]">
        <svg viewBox="0 0 200 200" class="w-full h-full">
          <circle cx="100" cy="52" r="56" fill="#1B4588"/>
          <circle cx="142" cy="76" r="56" fill="#1B4588"/>
          <circle cx="142" cy="124" r="56" fill="#1B4588"/>
          <circle cx="100" cy="148" r="56" fill="#1B4588"/>
          <circle cx="58" cy="124" r="56" fill="#1B4588"/>
          <circle cx="58" cy="76" r="56" fill="#1B4588"/>
        </svg>
      </div>
    </div>

    <!-- 啟動畫面 -->
    <SplashScreen :show="showSplash" />

    <!-- 登入畫面 -->
    <div v-if="!store.currentUser && !store.loading && !showSplash" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#F0ECE6]/80 backdrop-blur-md animate-fade-in">
      <div class="bg-white/90 backdrop-blur-xl border border-[#E8E2D8] p-8 rounded-[32px] shadow-2xl w-full max-w-sm">
        <!-- 品牌花形 -->
        <div class="w-16 h-16 mx-auto mb-5">
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
        <h2 class="text-xl font-bold text-[#1B4588] mb-6 text-center">歡迎回來</h2>
        
        <div v-if="store.error" class="text-center text-red-500 py-4 bg-red-50 rounded-xl mb-3 px-4 text-sm font-bold">
          {{ store.error }}
          <button @click="store.loadData()" class="block mx-auto mt-2 text-xs underline text-red-400">重試</button>
        </div>
        
        <div v-else-if="!store.users.length" class="text-center text-[#a09888] py-4">
          <PhSpinner class="animate-spin inline-block mr-2" />
          載入使用者中...
          <div class="text-[10px] mt-2 opacity-60">若長時間無回應請檢查網路或重新整理</div>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="u in store.users" :key="u.name" @click="handleLogin(u)" class="p-4 rounded-2xl bg-white border border-[#E8E2D8] hover:border-[#1B4588]/30 hover:shadow-md cursor-pointer flex justify-between items-center group transition-all">
             <span class="font-bold text-[#1B4588]">{{ u.name }}</span>
             <PhCaretRight class="text-[#D4CEC3] group-hover:text-[#1B4588] transition-colors" />
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <main class="relative z-10 pb-24" v-if="store.currentUser">
      <slot />
    </main>
    
    <!-- FAB 快速記帳 -->
    <TheInput v-if="store.currentUser" />

    <!-- 底部導覽列（品牌色） -->
    <div v-if="store.currentUser" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[320px]">
      <nav class="bg-white/90 backdrop-blur-md border border-[#E8E2D8] rounded-full p-1.5 flex justify-between shadow-xl shadow-[#1B4588]/5">
        <NuxtLink to="/" class="nav-item" active-class="active">
          專案
        </NuxtLink>
        <NuxtLink to="/expense" class="nav-item" active-class="active">
          記帳
        </NuxtLink>
        <NuxtLink to="/funds" class="nav-item" active-class="active">
          資金
        </NuxtLink>
        <NuxtLink to="/members" class="nav-item" active-class="active">
          成員
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { PhCaretRight, PhSpinner } from '@phosphor-icons/vue';
const store = useBudgetStore();
const showSplash = ref(true);

const handleLogin = (u) => {
    store.setUser(u);
};

onMounted(async () => {
    const loadPromise = store.loadData();
    await new Promise(resolve => setTimeout(resolve, 1500));
    await loadPromise;
    showSplash.value = false;
});
</script>

<style scoped>
.nav-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #a09888;
  border-radius: 99px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item.active {
  background: #1B4588;
  color: white;
  box-shadow: 0 4px 12px rgba(27, 69, 136, 0.2);
}
</style>
