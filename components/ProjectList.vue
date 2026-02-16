<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center px-2">
       <h3 class="text-lg font-bold text-[#1B4588] flex items-center gap-2">
           <span>專案概況</span>
           <span class="bg-[#1B4588]/10 text-[#1B4588] text-xs px-2 py-0.5 rounded-full">{{ displayProjects.length }}</span>
           <button @click="showCreateModal = true" class="px-3 py-1 rounded-full bg-[#1B4588] hover:bg-[#153a70] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm ml-2">
              <PhPlus weight="bold" /> 新增專案
           </button>
       </h3>
       
       <button @click="showArchived = !showArchived" class="text-xs font-bold text-[#a09888] hover:text-[#1B4588] transition-colors flex items-center gap-1">
          <PhArchiveBox :weight="showArchived ? 'fill' : 'bold'" />
          {{ showArchived ? '顯示進行中' : '查看已歸檔' }}
       </button>
    </div>

    <div class="grid grid-cols-1 gap-4">
        <div v-for="p in displayProjects" :key="p.id" 
             @click="openDetail(p)"
             class="bg-white rounded-[28px] p-5 border border-[#E8E2D8] shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
             
             <!-- 進度條 -->
             <div class="absolute bottom-0 left-0 h-1.5 bg-[#E8E2D8] w-full">
                <div class="h-full bg-[#1B4588] rounded-r-full transition-all duration-1000" :style="{ width: Math.min((p.totalExpense / p.totalBudget) * 100, 100) + '%' }"></div>
             </div>
             <!-- 裝飾點 -->
             <div class="absolute top-3 right-14 w-2 h-2 rounded-full bg-[#1B4588] opacity-20"></div>

             <div class="flex justify-between items-start mb-3 pr-10 relative z-10">
                <div>
                   <h4 class="font-bold text-[#1B4588] text-lg">{{ p.name }}</h4>
                   <div class="text-[10px] text-[#a09888] font-mono mt-0.5">預算 ${{ formatCompact(p.totalBudget) }}</div>
                </div>
                <div class="text-right">
                   <div class="text-sm font-mono font-bold" :class="p.safeBalance >= 0 ? 'text-[#6b6050]' : 'text-rose-500'">
                      ${{ formatNumber(p.safeBalance) }}
                   </div>
                   <div class="text-[10px] text-[#a09888] font-bold uppercase">剩餘安全額度</div>
                </div>
             </div>

             <!-- 三欄統計 -->
             <div class="grid grid-cols-3 gap-2 text-center py-2 bg-[#F0ECE6] rounded-2xl">
                <div>
                   <div class="text-[10px] text-[#a09888] uppercase font-bold">已支出</div>
                   <div class="font-mono font-bold text-sm text-[#6b6050]">${{ formatCompact(p.totalExpense) }}</div>
                </div>
                 <div>
                   <div class="text-[10px] text-[#a09888] uppercase font-bold">已請款</div>
                   <div class="font-mono font-bold text-sm text-emerald-500">${{ formatCompact(p.revenue) }}</div>
                </div>
                 <div>
                   <div class="text-[10px] text-[#a09888] uppercase font-bold">保留款</div>
                   <div class="font-mono font-bold text-sm text-[#8a7e6e]">{{ p.retention }}%</div>
                </div>
             </div>

             <!-- 子專案預算 -->
             <div v-if="p.budgetLines && p.budgetLines.length > 0" class="mt-3 space-y-2">
               <div class="text-[10px] text-[#a09888] uppercase font-bold tracking-[0.2em] px-1">子專案預算</div>
               <div v-for="line in p.budgetLines" :key="line.id" class="px-1">
                 <div class="flex justify-between items-center mb-0.5">
                   <span class="text-xs font-bold text-[#6b6050]">{{ line.category || line.name }}</span>
                   <span class="text-[10px] font-mono text-[#a09888]">
                     ${{ formatCompact(line.used || 0) }} / ${{ formatCompact(line.budget) }}
                   </span>
                 </div>
                 <div class="h-1 bg-[#E8E2D8] rounded-full overflow-hidden">
                   <div class="h-full rounded-full transition-all duration-700"
                        :class="getLineBarColor(line)"
                        :style="{ width: Math.min(((line.used || 0) / (line.budget || 1)) * 100, 100) + '%' }">
                   </div>
                 </div>
               </div>
             </div>
              
             <!-- 歸檔按鈕 -->
             <div class="absolute top-4 right-4 z-20">
                <button @click.stop="toggleArchive(p)" class="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-[#D4CEC3] hover:text-[#1B4588] transition-colors" :title="p.isArchived ? '還原專案' : '歸檔專案'">
                   <PhArchiveBox weight="duotone" />
                </button>
             </div>

        </div>

        <div v-if="displayProjects.length === 0" class="text-center py-8 text-[#a09888] bg-white rounded-[28px] border border-dashed border-[#E8E2D8]">
           <div class="text-4xl mb-2 opacity-50">🗂️</div>
           <div class="text-xs font-bold">{{ showArchived ? '沒有已歸檔的專案' : '目前沒有進行中的專案' }}</div>
        </div>
     </div>

     <ProjectDetail 
      :is-open="!!selectedProject" 
      :project="selectedProject" 
      @close="selectedProject = null" 
    />
    
    <ProjectCreate 
      :is-open="showCreateModal" 
      @close="showCreateModal = false" 
    />
  </div>
</template>

<script setup>
import { PhArchiveBox, PhPlus } from '@phosphor-icons/vue';
import ProjectDetail from './ProjectDetail.vue';
import ProjectCreate from './ProjectCreate.vue';

const store = useBudgetStore();
const showArchived = ref(false);
const selectedProject = ref(null);
const showCreateModal = ref(false);

const openDetail = (p) => {
    selectedProject.value = p;
};

const displayProjects = computed(() => {
    const all = Object.values(store.projectStats);
    if (showArchived.value) {
        return all.filter(p => p.isArchived);
    }
    return all.filter(p => !p.isArchived);
});

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
const formatCompact = (n) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(n);

// 進度條顏色
const getLineBarColor = (line) => {
    const ratio = (line.used || 0) / (line.budget || 1);
    if (ratio > 0.9) return 'bg-rose-400';
    if (ratio > 0.6) return 'bg-amber-400';
    return 'bg-[#1B4588]';
};

const toggleArchive = async (p) => {
    const action = p.isArchived ? '還原' : '歸檔';
    if (confirm(`確定要${action}專案「${p.name}」嗎？`)) {
        await store.toggleProjectArchive(p.id, !p.isArchived);
    }
};
</script>
