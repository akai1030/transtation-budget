<template>
  <div class="px-5 sm:px-6 py-8 space-y-6">
    <!-- 標題列 -->
    <header class="stagger-item flex justify-between items-end" style="--delay: 0">
      <div>
        <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">{{ todayDate }}</div>
        <h1 class="text-2xl font-bold text-[#1B4588] mt-1 tracking-tight">儀表板</h1>
      </div>
      <div v-if="store.currentUser" class="relative z-50">
        <button @click="showUserMenu = !showUserMenu" 
          class="bg-white px-4 py-2 rounded-full shadow-sm border border-[#E8E2D8] flex items-center gap-2 hover:bg-[#F0ECE6] transition-colors">
          <div class="w-2 h-2 rounded-full bg-[#1B4588] animate-pulse"></div>
          <span class="text-xs font-bold text-[#6b6050]">{{ store.currentUser.name }}</span>
          <PhCaretDown weight="bold" class="text-[10px] text-[#a09888]" />
        </button>

        <!-- 切換選單 -->
        <Transition name="fade">
          <div v-if="showUserMenu" 
            class="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E8E2D8] overflow-hidden py-1">
            <div class="px-3 py-2 text-[10px] font-bold text-[#a09888] uppercase tracking-wider border-b border-[#F0ECE6]">
              切換使用者
            </div>
            <button v-for="u in otherUsers" :key="u.id" 
              @click="switchUser(u)"
              class="w-full text-left px-4 py-2.5 text-sm font-bold text-[#6b6050] hover:bg-[#F0ECE6] hover:text-[#1B4588] transition-colors flex items-center justify-between group">
              <span>{{ u.name }}</span>
              <PhUserSwitch class="opacity-0 group-hover:opacity-100 transition-opacity text-[#1B4588]" />
            </button>
            <div v-if="otherUsers.length === 0" class="px-4 py-2 text-xs text-[#b5aa9a]">
              無其他使用者
            </div>
            <div class="border-t border-[#F0ECE6] mt-1 pt-1">
                 <button @click="logout" class="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors">
                    登出
                 </button>
            </div>
          </div>
        </Transition>
      </div>
    </header>

    <!-- 財務卡片 Bento Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      
      <!-- 我的零用金 -->
      <div class="stagger-item col-span-1 bg-white rounded-[28px] p-6 shadow-sm border border-[#E8E2D8] relative overflow-hidden group" style="--delay: 1">
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#1B4588] opacity-30"></div>
        <div class="relative z-10">
          <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">我的零用金</div>
          <div class="text-3xl font-mono font-bold text-[#1B4588] tracking-tighter">
            ${{ formatNumber(myPettyCash) }}
          </div>
          <div class="mt-2 text-[10px] text-[#b5aa9a] font-medium">
             {{ myPettyCash >= 0 ? '隨時可動支' : '已透支' }}
          </div>
        </div>
      </div>

      <!-- 公司淨值 -->
      <div class="stagger-item col-span-1 bg-white rounded-[28px] p-6 shadow-sm border border-[#E8E2D8] relative overflow-hidden group" style="--delay: 2">
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 opacity-40"></div>
        <div class="relative z-10">
          <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">目前公司淨值 (已扣代墊)</div>
          <div class="text-3xl font-mono font-bold tracking-tighter" :class="companyNetValue >= 0 ? 'text-amber-600' : 'text-rose-500'">
            {{ companyNetValue < 0 ? '-' : '' }}${{ formatNumber(Math.abs(companyNetValue)) }}
          </div>
          <div class="mt-2 text-[10px] text-[#b5aa9a] font-medium">
             資產 ${{ formatCompact(store.totalCompanyRetention) }} - 代墊 ${{ formatCompact(totalUserLiability) }}
          </div>
        </div>
      </div>

      <!-- 預期淨值 -->
      <div class="stagger-item col-span-1 bg-white rounded-[28px] p-6 shadow-sm border border-[#E8E2D8] relative overflow-hidden group" style="--delay: 3">
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 opacity-40"></div>
        <div class="relative z-10">
          <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">預期公司淨值 (含未收款)</div>
          <div class="text-3xl font-mono font-bold text-emerald-600 tracking-tighter">
            {{ expectedNetValue < 0 ? '-' : '' }}${{ formatNumber(Math.abs(expectedNetValue)) }}
          </div>
          <div class="mt-2 text-[10px] text-[#b5aa9a] font-medium">
             目前 ${{ formatCompact(companyNetValue) }} + 待撥 ${{ formatCompact(store.totalPendingRetention) }}
          </div>
        </div>
      </div>

      <!-- 未收帳款 -->
      <div class="stagger-item col-span-1 sm:col-span-2 lg:col-span-3 bg-white rounded-[28px] p-6 shadow-sm border border-[#E8E2D8] relative overflow-hidden group" style="--delay: 4">
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#1B4588] opacity-30"></div>
        <div class="relative z-10 flex justify-between items-end">
          <div>
              <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">專案未收帳款</div>
              <div class="text-3xl font-mono font-bold text-[#1B4588] tracking-tighter">
                ${{ formatNumber(store.totalPendingReceivables) }}
              </div>
          </div>
          <div class="text-right">
              <div class="text-[10px] text-[#b5aa9a] font-medium">
                 其中約 ${{ formatCompact(store.totalPendingRetention) }} 將撥入公司資產
              </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 專案列表 -->
    <div class="stagger-item" style="--delay: 5">
      <ProjectList />
    </div>

    <!-- 無紀錄 / 近期活動 -->
    <div v-if="filteredTransactions.length === 0" class="stagger-item py-12 flex flex-col items-center justify-center text-center opacity-60" style="--delay: 6">
        <div class="bg-white p-6 rounded-full mb-4 border border-[#E8E2D8]">
           <PhCoffee class="text-4xl text-[#D4CEC3]" />
        </div>
        <h3 class="text-lg font-bold text-[#6b6050]">尚未有交易紀錄</h3>
        <p class="text-xs text-[#b5aa9a] mt-1">點擊右下角按鈕開始記帳</p>
    </div>

    <div v-else class="stagger-item space-y-4" style="--delay: 6">
        <h3 class="text-lg font-bold text-[#1B4588] px-2 flex items-center gap-2">
           <span>近期活動</span>
           <span class="bg-[#E8E2D8] text-xs px-2 py-0.5 rounded-full text-[#8a7e6e]">{{ filteredTransactions.length }}</span>
        </h3>
        <TransactionList :transactions="filteredTransactions.slice(0, 10)" @click-item="openDetail" />
    </div>

    <!-- 撤銷提示 -->
    <Transition name="toast">
      <div v-if="store.showUndoToast" class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1B4588] text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform" @click="store.undoLastTransaction">
         <div class="flex items-center gap-2">
            <PhCheckCircle class="text-emerald-300 text-lg" weight="fill" />
             <span class="font-bold text-sm">已儲存!</span>
         </div>
         <div class="h-4 w-px bg-white/20"></div>
         <button class="text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1">
            <PhArrowUUpLeft weight="bold" /> 撤銷
         </button>
      </div>
    </Transition>

    <TransactionDetail 
      :is-open="!!selectedTransaction" 
      :transaction="selectedTransaction" 
      @close="selectedTransaction = null" 
    />

  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { PhCoffee, PhCheckCircle, PhArrowUUpLeft, PhCaretDown, PhUserSwitch } from '@phosphor-icons/vue';

const store = useBudgetStore();
const todayDate = new Date().toLocaleDateString('zh-TW', { weekday: 'long', month: 'long', day: 'numeric' });

const myPettyCash = computed(() => store.currentUser?.pettyCash || 0);
const selectedTransaction = ref(null);
const showUserMenu = ref(false);

const otherUsers = computed(() => {
    if (!store.currentUser) return [];
    return store.users.filter(u => u.name !== store.currentUser.name);
});

const switchUser = async (u) => {
    store.setUser(u);
    showUserMenu.value = false;
    // 重新載入資料以確保權限/顯示正確
    await store.loadData(true);
};

const logout = () => {
    store.logout();
    showUserMenu.value = false;
};

const openDetail = (tx) => {
    selectedTransaction.value = tx;
};

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
const formatCompact = (n) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(n);

const totalUserLiability = computed(() => {
    return store.users.reduce((sum, u) => {
        return sum + (u.pettyCash < 0 ? Math.abs(u.pettyCash) : 0);
    }, 0);
});

const companyNetValue = computed(() => {
    return store.totalCompanyRetention - totalUserLiability.value;
});

const expectedNetValue = computed(() => {
    return companyNetValue.value + store.totalPendingRetention;
});

const filteredTransactions = computed(() => store.sortedTransactions);
</script>

<style scoped>
/* 進場交錯動畫 */
.stagger-item {
  opacity: 0;
  transform: translateY(24px);
  animation: staggerIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(var(--delay, 0) * 0.1s + 0.1s);
}

@keyframes staggerIn {
  0% { opacity: 0; transform: translateY(24px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.toast-enter-active,
.toast-leave-active,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
