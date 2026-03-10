<template>
  <div class="px-5 sm:px-6 py-8 space-y-6">
    <!-- 標題列 -->
    <header class="stagger-item flex justify-between items-end relative z-50" style="--delay: 0">
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
      <div class="stagger-item col-span-1 bg-white rounded-[28px] p-6 shadow-sm border border-[#E8E2D8] relative group" style="--delay: 2">
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 opacity-40"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-1.5 mb-1 relative group/tooltip">
            <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">目前結餘 (已含代墊)</div>
            <PhInfo class="text-[#b5aa9a] text-xs cursor-help" />
            <div class="absolute bottom-full left-0 mb-2 w-48 bg-[#1B4588] text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-50">
               = (專案已收保留款 + 公司收入) - (專案與公司實際支出) - (撥款/還款)<br><br>
               代表公司目前實際擁有、未被花掉的現金資產，已計入發給員工的代墊還款。
            </div>
          </div>
          <div class="text-3xl font-mono font-bold tracking-tighter" :class="companyNetValue >= 0 ? 'text-amber-600' : 'text-rose-500'">
            {{ companyNetValue < 0 ? '-' : '' }}${{ formatNumber(Math.abs(companyNetValue)) }}
          </div>
          <div class="mt-2 text-[10px] text-[#b5aa9a] font-medium">
             目前尚欠成員代墊款：${{ formatCompact(totalUserLiability) }}
          </div>
        </div>
      </div>

      <!-- 預期淨值 -->
      <div class="stagger-item col-span-1 bg-white rounded-[28px] p-6 shadow-sm border border-[#E8E2D8] relative group" style="--delay: 3">
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 opacity-40"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-1.5 mb-1 relative group/tooltip">
            <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">預期公司總淨值</div>
            <PhInfo class="text-[#b5aa9a] text-xs cursor-help" />
            <div class="absolute bottom-full left-0 mb-2 w-48 bg-[#1B4588] text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-50">
               = 目前結餘 + (未來預計會收進來的專案保留款)<br><br>
               代表目前現金與未來應收款（屬於公司的利潤部分）的加總。
            </div>
          </div>
          <div class="text-3xl font-mono font-bold text-emerald-600 tracking-tighter">
            {{ expectedNetValue < 0 ? '-' : '' }}${{ formatNumber(Math.abs(expectedNetValue)) }}
          </div>
          <div class="mt-2 text-[10px] text-[#b5aa9a] font-medium">
             目前結餘 ${{ formatCompact(companyNetValue) }} + 待撥保留款 ${{ formatCompact(store.totalPendingRetention) }}
          </div>
        </div>
      </div>

      <!-- 未收帳款 -->
      <div class="stagger-item col-span-1 sm:col-span-2 lg:col-span-3 bg-white rounded-[28px] p-6 shadow-sm border border-[#E8E2D8] relative group" style="--delay: 4">
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#1B4588] opacity-30"></div>
        <div class="relative z-10 flex justify-between items-end">
          <div>
              <div class="flex items-center gap-1.5 mb-1 relative group/tooltip">
                <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">專案未收帳款總額</div>
                <PhInfo class="text-[#b5aa9a] text-xs cursor-help" />
                <div class="absolute bottom-full left-0 mb-2 w-56 bg-[#1B4588] text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-50">
                   = 各個未歸檔專案中，狀態為「Pending (待收款)」的總金額。這筆錢收進來後，將根據專案設定的保留%數，撥入公司資產。
                </div>
              </div>
              <div class="text-3xl font-mono font-bold text-[#1B4588] tracking-tighter">
                ${{ formatNumber(store.totalPendingReceivables) }}
              </div>
          </div>
          <div class="text-right">
              <div class="text-[10px] text-[#b5aa9a] font-medium">
                 其中估計 ${{ formatCompact(store.totalPendingRetention) }} 將成為公司資產
              </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 收入 / 支出 雙欄 (從原資金頁面移入) -->
    <div class="stagger-item grid grid-cols-2 gap-4 mt-6" style="--delay: 4.5">
        <!-- 收入 -->
        <div class="bg-white p-5 pb-4 rounded-[28px] border border-[#E8E2D8] relative group">
             <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 opacity-40"></div>
             <div class="relative z-10 flex flex-col justify-between h-full gap-2">
                <div>
                  <div class="flex items-center gap-1.5 mb-1 relative group/tooltip">
                    <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">累積總收入</div>
                    <PhInfo class="text-[#b5aa9a] text-xs cursor-help" />
                    <div class="absolute bottom-full left-0 mb-2 w-48 bg-[#1B4588] text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-50">
                       = (專案結案提撥的保留款) + (公司外快/其他收入)<br><br>
                       代表公司成立至今，總共收進來過多少錢。
                    </div>
                  </div>
                  <div class="text-2xl font-mono font-bold text-emerald-500 tracking-tighter">
                     +${{ formatNumber(totalIncome) }}
                  </div>
                </div>
                <!-- 拆分明細 -->
                <div class="space-y-1 w-full pt-1 border-t border-[#F0ECE6]/50">
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="text-[#b5aa9a]">專案提撥</span>
                        <span class="font-bold text-[#6b6050]">${{ formatNumber(retentionIncome) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="text-[#b5aa9a]">外快/利息</span>
                        <span class="font-bold text-[#6b6050]">${{ formatNumber(otherIncome) }}</span>
                    </div>
                </div>
             </div>
        </div>

        <!-- 支出 -->
        <div class="bg-white p-5 rounded-[28px] border border-[#E8E2D8] relative group">
             <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-400 opacity-40"></div>
             <div class="relative z-10 flex flex-col gap-4 h-full">
                <div>
                  <div class="flex items-center gap-1.5 mb-1 relative group/tooltip">
                    <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">累積總支出</div>
                    <PhInfo class="text-[#b5aa9a] text-xs cursor-help" />
                    <div class="absolute bottom-full right-0 mb-2 w-48 bg-[#1B4588] text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none z-50">
                       = 所有標記為「公司支出、薪水」或未綁定專案的花費。<br><br>
                       代表公司自己的內部營運成本。
                    </div>
                  </div>
                  <div class="text-2xl font-mono font-bold text-rose-500 tracking-tighter">
                     -${{ formatNumber(store.companyExpenses) }}
                  </div>
                </div>
                <div class="text-[10px] text-[#b5aa9a] mt-auto">
                   公司營運與人事成本
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
import { PhCoffee, PhCheckCircle, PhArrowUUpLeft, PhCaretDown, PhUserSwitch, PhInfo } from '@phosphor-icons/vue';

const store = useBudgetStore();

// === 原資金頁的統計邏輯 (修正版) ===
const retentionIncome = computed(() => {
    // 真實的總專案提撥款 (迴圈加總各專案的 Revenue * retention)
    let total = 0;
    for (const pid in store.projectStats) {
        const stats = store.projectStats[pid];
        total += Math.floor(stats.revenue * ((stats.retention || 10) / 100));
    }
    return total;
});

const otherIncome = computed(() => {
    // 扣除掉內部轉帳後的純公司外快
    return store.transactions
        .filter(t => t.projectId === null && t.isIncome && t.budgetLineCategory !== 'Internal Transfer')
        .reduce((sum, t) => sum + t.amount, 0);
});

const totalIncome = computed(() => {
    return retentionIncome.value + otherIncome.value;
});
// ==========================

const timeRange = ref('all'); // 'month', 'year', 'all'
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
    // 公司的真實留存資產 (後端已經扣除所有的支出與內部還款流出)
    return store.totalCompanyRetention;
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
