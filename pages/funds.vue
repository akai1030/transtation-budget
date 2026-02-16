<template>
  <div class="space-y-6 px-5 py-8 pb-32">
    <!-- 標題 -->
    <header class="stagger-item" style="--delay: 0">
      <div class="flex items-center gap-3 mb-1">
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
          <h1 class="text-2xl font-bold text-[#1B4588] tracking-tight">公司財務</h1>
          <p class="text-[10px] text-[#a09888] font-medium tracking-widest uppercase">Company General Ledger</p>
        </div>
      </div>
    </header>

    <!-- 公司資產 Hero -->
    <div class="stagger-item bg-[#1B4588] text-white p-8 rounded-[28px] shadow-xl shadow-[#1B4588]/20 relative overflow-hidden group" style="--delay: 1">
         <!-- 花形裝飾 -->
         <div class="absolute -right-12 -top-12 w-40 h-40 opacity-10">
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
            <div class="flex items-center gap-3 mb-4 opacity-80">
               <PhBank weight="fill" class="text-2xl" />
               <span class="text-[10px] font-bold tracking-[0.2em] uppercase">Company Treasury</span>
            </div>
            <div class="flex flex-col gap-1">
               <h2 class="text-4xl sm:text-5xl font-mono font-bold tracking-tighter" :class="companyNetValue >= 0 ? '' : 'text-rose-300'">
                 {{ companyNetValue < 0 ? '-' : '' }}${{ formatNumber(Math.abs(companyNetValue)) }}
               </h2>
               <div class="text-sm font-medium text-white/70 flex items-center gap-2">
                  目前公司總資產 (淨值)
                  <span class="text-[10px] bg-white/15 px-2 py-0.5 rounded-full">
                    資產 ${{ formatCompact(store.totalCompanyRetention) }} - 代墊 ${{ formatCompact(totalUserLiability) }}
                  </span>
               </div>
            </div>
         </div>
    </div>

    <!-- 收入 / 支出 雙欄 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- 收入 -->
        <div class="stagger-item bg-white p-5 rounded-[28px] border border-[#E8E2D8] relative overflow-hidden" style="--delay: 2">
             <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 opacity-40"></div>
             <div class="relative z-10">
                <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">累積收入</div>
                <div class="text-2xl font-mono font-bold text-emerald-500 tracking-tighter">
                   +${{ formatNumber(totalIncome) }}
                </div>
                
                <div class="mt-3 space-y-1">
                    <div class="flex justify-between text-xs">
                        <span class="text-[#a09888]">專案 10% 提撥</span>
                        <span class="font-bold text-[#6b6050]">${{ formatNumber(retentionIncome) }}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span class="text-[#a09888]">其他/歷史撥款</span>
                        <span class="font-bold text-[#6b6050]">${{ formatNumber(otherIncome) }}</span>
                    </div>
                </div>
             </div>
        </div>

        <!-- 支出 -->
        <div class="stagger-item bg-white p-5 rounded-[28px] border border-[#E8E2D8] relative overflow-hidden" style="--delay: 3">
             <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-400 opacity-40"></div>
             <div class="relative z-10">
                <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">累積支出</div>
                <div class="text-2xl font-mono font-bold text-rose-500 tracking-tighter">
                   -${{ formatNumber(store.companyExpenses) }}
                </div>
                <div class="text-[10px] text-[#b5aa9a] mt-1">公司營運成本</div>
             </div>
        </div>
    </div>

    <!-- 營運支出明細 -->
    <div class="stagger-item bg-white rounded-[28px] p-6 border border-[#E8E2D8]" style="--delay: 4">
        <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-lg text-[#1B4588] flex items-center gap-2">
                <PhReceipt class="text-[#a09888]" />
                <span>營運支出明細</span>
            </h3>
            <span class="text-xs font-bold bg-[#F0ECE6] px-3 py-1 rounded-full text-[#8a7e6e]">
                {{ companyTransactions.length }} 筆
            </span>
        </div>

        <div v-if="companyTransactions.length === 0" class="text-center py-12 text-[#b5aa9a]">
            <PhReceipt class="text-4xl mx-auto mb-2 opacity-30" />
            <p class="text-xs">尚無公司支出紀錄</p>
        </div>

        <div v-else class="space-y-4">
            <div v-for="tx in companyTransactions" :key="tx.id" class="flex justify-between items-center group">
                 <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-2xl bg-[#F0ECE6] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                        <span v-if="tx.isIncome">💰</span>
                        <span v-else>💸</span>
                    </div>
                    <div>
                        <div class="font-bold text-sm text-[#1B4588]">
                            {{ tx.item }}
                        </div>
                        <div class="text-[10px] text-[#a09888] font-mono mt-0.5">
                            {{ tx.date }} · {{ tx.relatedUser }}
                        </div>
                    </div>
                 </div>
                 <div class="font-mono font-bold text-sm" :class="tx.isIncome ? 'text-emerald-500' : 'text-[#6b6050]'">
                     {{ tx.isIncome ? '+' : '-' }}${{ formatNumber(tx.amount) }}
                 </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { PhBank, PhReceipt } from '@phosphor-icons/vue';

const store = useBudgetStore();

definePageMeta({ layout: 'default' });

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);

const totalUserLiability = computed(() => {
    return store.users.reduce((sum, u) => {
        return sum + (u.pettyCash < 0 ? Math.abs(u.pettyCash) : 0);
    }, 0);
});

const companyNetValue = computed(() => {
    return store.totalCompanyRetention - totalUserLiability.value;
});

const formatCompact = (n) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(n);

const totalIncome = computed(() => {
    return store.totalCompanyRetention + store.companyExpenses;
});

const retentionIncome = computed(() => {
    return store.transactions
        .filter(t => t.projectId === null && t.isIncome && (t.subject?.includes('提撥') || t.category === '專案款項'))
        .reduce((sum, t) => sum + t.amount, 0);
});

const otherIncome = computed(() => {
    return totalIncome.value - retentionIncome.value;
});

const companyTransactions = computed(() => {
    return store.transactions
        .filter(t => t.projectId === null)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
});
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
</style>
