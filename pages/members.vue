<template>
  <div class="min-h-screen pb-36">
    <!-- 頂部 Hero 區域 -->
    <div class="px-5 pt-8 pb-6">
      <!-- 標題 -->
      <header class="stagger-item" style="--delay: 0">
        <div class="flex items-center gap-3 mb-6">
          <!-- 品牌小花 -->
          <div class="w-8 h-8 relative">
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
          <div>
            <h1 class="text-2xl font-bold text-[#1B4588] tracking-tight">成員零用金</h1>
            <p class="text-[10px] text-[#a09888] font-medium tracking-widest uppercase">Member Petty Cash</p>
          </div>
        </div>
      </header>

      <!-- 總覽統計 Hero -->
      <div class="stagger-item bg-[#1B4588] text-white p-6 rounded-[28px] shadow-xl shadow-[#1B4588]/20 relative overflow-hidden" style="--delay: 1">
        <!-- 花形裝飾 -->
        <div class="absolute -right-10 -top-10 w-32 h-32 opacity-10">
          <svg viewBox="0 0 200 200" class="w-full h-full">
            <circle cx="100" cy="52" r="56" fill="white"/>
            <circle cx="142" cy="76" r="56" fill="white"/>
            <circle cx="142" cy="124" r="56" fill="white"/>
            <circle cx="100" cy="148" r="56" fill="white"/>
            <circle cx="58" cy="124" r="56" fill="white"/>
            <circle cx="58" cy="76" r="56" fill="white"/>
          </svg>
        </div>
        
        <div class="relative z-10">
          <div class="flex items-baseline justify-between mb-4">
            <div>
              <div class="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60 mb-1">代墊總額</div>
              <div class="text-3xl font-mono font-bold tracking-tighter">
                ${{ formatNumber(totalOwed) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60 mb-1">成員數</div>
              <div class="text-3xl font-mono font-bold tracking-tighter">{{ store.users.length }}</div>
            </div>
          </div>
          
          <!-- 迷你長條圖 -->
          <div class="flex gap-1 h-2 rounded-full overflow-hidden bg-white/10">
            <div v-for="user in sortedUsers" :key="user.name"
              class="h-full rounded-full transition-all duration-700"
              :style="{ flex: Math.abs(user.pettyCash) / Math.max(maxAbsBalance, 1) }"
              :class="user.pettyCash >= 0 ? 'bg-emerald-400' : 'bg-white/40'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成員列表 -->
    <div class="px-5 space-y-3">
      <div v-for="(user, idx) in sortedUsers" :key="user.name"
        @click="openHistory(user)"
        class="stagger-item group cursor-pointer"
        :style="{ '--delay': idx + 2 }">
        
        <div class="bg-white rounded-[20px] p-4 border border-[#E8E2D8] hover:border-[#1B4588]/20 hover:shadow-lg hover:shadow-[#1B4588]/5 transition-all duration-300">
          <div class="flex items-center gap-3">
            <!-- 頭像（漸層色彩圓） -->
            <div class="relative shrink-0">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md"
                   :style="{ background: avatarColor(idx) }">
                {{ user.name.charAt(0) }}
              </div>
              <!-- 小狀態點 -->
              <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                   :class="user.pettyCash >= 0 ? 'bg-emerald-400' : 'bg-amber-400'">
              </div>
            </div>

            <!-- 名字 + 說明 -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-[15px] text-[#1B4588] truncate">{{ user.name }}</h3>
              <div class="text-[11px] text-[#a09888] flex items-center gap-1.5 mt-0.5">
                <span v-if="user.pettyCash < 0" class="text-amber-500 font-semibold">公司欠款</span>
                <span v-else class="text-emerald-500 font-semibold">已結清</span>
                <span class="text-[#D4CEC3]">·</span>
                <span>{{ getUserTransactionCount(user) }} 筆交易</span>
              </div>
            </div>

            <!-- 金額 -->
            <div class="text-right shrink-0">
              <div class="text-lg font-mono font-bold tracking-tight"
                :class="user.pettyCash >= 0 ? 'text-emerald-500' : 'text-[#1B4588]'">
                {{ user.pettyCash < 0 ? '-' : '' }}${{ formatNumber(Math.abs(user.pettyCash)) }}
              </div>
              <!-- 佔比條 -->
              <div class="w-20 h-1 bg-[#F0ECE6] rounded-full overflow-hidden mt-1.5 ml-auto">
                <div class="h-full rounded-full transition-all duration-700"
                  :class="user.pettyCash >= 0 ? 'bg-emerald-400' : 'bg-[#1B4588]'"
                  :style="{ width: (Math.abs(user.pettyCash) / Math.max(maxAbsBalance, 1)) * 100 + '%' }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 歷史紀錄 Modal -->
    <Teleport to="body">
       <Transition name="slide-up">
         <div v-if="selectedUser" class="fixed inset-0 z-50 flex flex-col bg-[#F0ECE6]">
            
            <!-- 標題列 -->
            <div class="px-5 py-5 bg-white/90 backdrop-blur-xl shadow-sm z-10 flex items-center gap-4 border-b border-[#E8E2D8]">
               <button @click="selectedUser = null" class="w-9 h-9 rounded-xl bg-[#F0ECE6] border border-[#E8E2D8] flex items-center justify-center text-[#a09888] hover:text-[#1B4588] hover:border-[#1B4588]/30 transition-colors">
                  <PhCaretLeft weight="bold" />
               </button>
               <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                       :style="{ background: avatarColor(sortedUsers.indexOf(selectedUser)) }">
                    {{ selectedUser.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <h2 class="text-base font-bold text-[#1B4588] truncate">{{ selectedUser.name }}</h2>
                    <div class="text-[10px] text-[#a09888]">
                      餘額 <span class="font-mono font-bold" :class="selectedUser.pettyCash >= 0 ? 'text-emerald-500' : 'text-rose-500'">
                        {{ selectedUser.pettyCash >= 0 ? '' : '-' }}${{ formatNumber(Math.abs(selectedUser.pettyCash)) }}
                      </span>
                    </div>
                  </div>
               </div>
            </div>

            <!-- 內容 -->
            <div class="flex-1 overflow-y-auto p-4">
               <TransactionList :transactions="userHistory" @click-item="openDetail" />
               <div v-if="userHistory.length === 0" class="text-center py-16">
                  <div class="text-4xl mb-3 opacity-30">📋</div>
                  <p class="text-sm text-[#a09888]">尚無交易紀錄</p>
               </div>
            </div>

            <!-- 交易詳情 -->
            <TransactionDetail 
              :is-open="!!selectedTransaction" 
              :transaction="selectedTransaction" 
              @close="selectedTransaction = null" 
              @updated="store.loadData"
              @deleted="store.loadData"
            />
         </div>
       </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { PhCaretLeft } from '@phosphor-icons/vue';

const store = useBudgetStore();
const selectedUser = ref(null);
const selectedTransaction = ref(null);

definePageMeta({ layout: 'default' });

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);

// 漸層色系 - 品牌風的柔和配色
const avatarColors = [
  'linear-gradient(135deg, #1B4588, #2D5FA0)',
  'linear-gradient(135deg, #6B8E7B, #8FADA0)',
  'linear-gradient(135deg, #A07850, #C09870)',
  'linear-gradient(135deg, #7B6B8E, #9F8FB5)',
  'linear-gradient(135deg, #8E7B6B, #B5A08F)',
  'linear-gradient(135deg, #5B7B8E, #7FA0B5)',
];

const avatarColor = (idx) => avatarColors[idx % avatarColors.length];

// 按代墊金額排序（絕對值大的在前）
const sortedUsers = computed(() => {
  return [...store.users].sort((a, b) => Math.abs(b.pettyCash) - Math.abs(a.pettyCash));
});

// 最大絕對值（用於比例條計算）
const maxAbsBalance = computed(() => {
  return Math.max(...store.users.map(u => Math.abs(u.pettyCash)), 1);
});

// 公司代墊總額
const totalOwed = computed(() => {
  return store.users.reduce((sum, u) => sum + (u.pettyCash < 0 ? Math.abs(u.pettyCash) : 0), 0);
});

// 取得使用者交易筆數
const getUserTransactionCount = (user) => {
  return store.transactions.filter(
    t => t.userId === user.id || t.relatedUser === user.name
  ).length;
};

const openHistory = (user) => {
   selectedUser.value = user;
};

const userHistory = computed(() => {
   if (!selectedUser.value) return [];
   return store.transactions
      .filter(t => t.userId === selectedUser.value.id || t.relatedUser === selectedUser.value.name)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const openDetail = (tx) => {
    selectedTransaction.value = tx;
};
</script>

<style scoped>
/* 進場交錯動畫 */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  animation: staggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(var(--delay, 0) * 0.08s + 0.1s);
}

@keyframes staggerIn {
  0% { opacity: 0; transform: translateY(20px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Modal 滑入動畫 */
.slide-up-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.7, 0, 0.84, 0);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px);
}
</style>
