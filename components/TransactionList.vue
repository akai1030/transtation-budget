<template>
  <div class="space-y-3">
    <div v-for="tx in transactions" :key="tx.id" 
      @click="$emit('click-item', tx)"
      class="bg-white p-4 rounded-2xl border border-[#E8E2D8] flex justify-between items-center hover:shadow-md transition-all cursor-pointer animate-fade-in group shadow-sm">
       <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-2 h-2 rounded-full flex-shrink-0" :class="getStatusColor(tx)"></div>
          <div class="min-w-0 flex-1">
             <div class="text-sm font-bold text-[#1B4588] line-clamp-1 group-hover:line-clamp-none transition-all truncate">{{ tx.description || tx.subject || '無備註' }}</div>
             <div class="text-[10px] text-[#a09888] font-mono mt-0.5 flex items-center gap-1">
                <span>{{ formatDate(tx.date) }}</span>
                <span>·</span>
                <span class="bg-[#F0ECE6] px-1 rounded text-[#8a7e6e]">{{ tx.project?.name || '專案' }}</span>
                <span v-if="tx.status === 'syncing'" class="text-amber-500 animate-pulse"> (同步中...)</span>
             </div>
          </div>
       </div>
       <div class="text-right flex-shrink-0 pl-2">
          <div class="font-mono font-bold text-sm" :class="tx.isIncome ? 'text-emerald-500' : 'text-[#6b6050]'">
             {{ tx.isIncome ? '+' : '-' }}${{ formatNumber(tx.amount) }}
          </div>
          <div class="text-[9px] text-[#D4CEC3]">{{ tx.payer || tx.user?.name }}</div>
       </div>
    </div>
    <div v-if="transactions.length === 0" class="text-center text-[#b5aa9a] text-xs py-10">尚無交易紀錄</div>
  </div>
</template>

<script setup>
const props = defineProps({
  transactions: { type: Array, default: () => [] }
});

const emit = defineEmits(['click-item']);

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
const formatDate = (d) => new Date(d).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });

const getStatusColor = (tx) => {
  if (tx.status === 'syncing') return 'bg-amber-400 animate-pulse';
  if (tx.isIncome) return 'bg-emerald-400';
  return 'bg-[#1B4588]';
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
