<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-[#1B4588]/25 backdrop-blur-sm" @click="close"></div>
      
      <!-- 卡片 — 底部滑出式 -->
      <div class="bg-[#F0ECE6] rounded-t-[32px] sm:rounded-[32px] w-full sm:max-w-lg max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col z-10">
        
        <!-- 拖拉指示條 -->
        <div class="flex justify-center pt-3 pb-1 sm:hidden">
          <div class="w-10 h-1 bg-[#D4CEC3] rounded-full"></div>
        </div>

        <!-- 標題區塊 — 品牌深藍 -->
        <div class="bg-[#1B4588] text-white px-6 py-5 relative overflow-hidden">
          <!-- 花形裝飾 -->
          <div class="absolute -right-8 -top-8 w-28 h-28 opacity-10">
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
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0 pr-4">
                <h2 class="text-xl font-bold truncate">{{ project?.name }}</h2>
                <div class="flex items-center gap-2 mt-1.5">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30"
                        :class="project?.isArchived ? 'bg-white/10' : 'bg-emerald-500/20 border-emerald-300/30'">
                    {{ project?.isArchived ? '已歸檔' : '🟢 進行中' }}
                  </span>
                </div>
              </div>
              <button @click="close" class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors shrink-0">
                <PhX weight="bold" class="text-sm" />
              </button>
            </div>
            
            <!-- 雙欄數據 -->
            <div class="grid grid-cols-2 gap-3 mt-4">
              <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <div class="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 mb-0.5">總預算</div>
                <div class="text-xl font-mono font-bold tracking-tighter">${{ formatNumber(project?.totalBudget || 0) }}</div>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <div class="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 mb-0.5">安全餘額</div>
                <div class="text-xl font-mono font-bold tracking-tighter" :class="(project?.safeBalance || 0) < 0 ? 'text-rose-300' : ''">
                  {{ (project?.safeBalance || 0) < 0 ? '-' : '' }}${{ formatNumber(Math.abs(project?.safeBalance || 0)) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 可滾動內容 -->
        <div class="overflow-y-auto flex-1 custom-scrollbar">
          
          <!-- 收款狀況 -->
          <div class="px-5 pt-5 pb-3">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-[#1B4588] flex items-center gap-1.5">
                <PhHandCoins weight="fill" class="text-[#a09888]" /> 收款狀況
              </h3>
              <button @click="addTerm" class="text-[10px] font-bold text-[#1B4588] bg-[#1B4588]/8 hover:bg-[#1B4588]/15 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1">
                <PhPlus weight="bold" class="text-[8px]" /> 新增
              </button>
            </div>

            <div v-if="project?.incomeTerms?.length" class="space-y-2">
              <div v-for="(term, idx) in project.incomeTerms" :key="idx"
                class="bg-white rounded-2xl p-3.5 border border-[#E8E2D8] group hover:border-[#1B4588]/15 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                         :class="term.status === 'received' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'">
                      {{ term.status === 'received' ? '✓' : idx + 1 }}
                    </div>
                    <div class="min-w-0">
                      <div class="font-bold text-sm text-[#1B4588] truncate flex items-center gap-1.5">
                        {{ term.notes || `第 ${idx + 1} 期` }}
                        <button @click.stop="editIncome(term)" class="opacity-0 group-hover:opacity-100 text-[#D4CEC3] hover:text-[#1B4588] transition-all">
                          <PhPencilSimple weight="bold" class="text-[10px]" />
                        </button>
                      </div>
                      <div class="text-[10px] text-[#a09888] mt-0.5">{{ term.date ? new Date(term.date).toLocaleDateString('zh-TW') : '未定日期' }}</div>
                    </div>
                  </div>

                  <div class="text-right shrink-0 ml-3">
                    <div class="font-mono font-bold text-sm text-[#1B4588]">${{ formatNumber(term.amount) }}</div>
                    <button v-if="term.status !== 'received'" @click.stop="confirmReceipt(term)"
                      class="text-[10px] font-bold mt-0.5 text-amber-500 hover:text-emerald-500 transition-colors">
                      待收款 →
                    </button>
                    <span v-else class="text-[10px] font-bold text-emerald-500">已收款</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-[11px] text-[#b5aa9a]">尚無收款紀錄</div>
          </div>

          <!-- 分隔線 -->
          <div class="mx-5 border-t border-[#E8E2D8]"></div>

          <!-- 子專案預算 -->
          <div class="px-5 pt-4 pb-3">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-[#1B4588] flex items-center gap-1.5">
                <PhChartPieSlice weight="fill" class="text-[#a09888]" /> 子專案預算
              </h3>
              <button @click="addBudgetLine" class="text-[10px] font-bold text-[#1B4588] bg-[#1B4588]/8 hover:bg-[#1B4588]/15 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1">
                <PhPlus weight="bold" class="text-[8px]" /> 新增
              </button>
            </div>

            <div v-if="project?.budgetLines?.length" class="space-y-2">
              <div v-for="line in project.budgetLines" :key="line.id" 
                class="bg-white rounded-2xl p-3.5 border border-[#E8E2D8] group hover:border-[#1B4588]/15 transition-colors">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="font-bold text-sm text-[#1B4588] truncate">{{ line.name || line.category }}</span>
                    <div class="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity shrink-0">
                      <button @click.stop="editBudgetLine(line)" class="text-[#D4CEC3] hover:text-[#1B4588]">
                        <PhPencilSimple weight="bold" class="text-[10px]" />
                      </button>
                      <button @click.stop="deleteBudgetLine(line)" class="text-[#D4CEC3] hover:text-rose-500">
                        <PhTrash weight="bold" class="text-[10px]" />
                      </button>
                    </div>
                  </div>
                  <span class="font-mono text-[11px] text-[#a09888] shrink-0 ml-2">
                    ${{ formatNumber(line.used || 0) }} / ${{ formatNumber(line.budget) }}
                  </span>
                </div>
                <!-- 進度條 -->
                <div class="h-1.5 bg-[#F0ECE6] rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                    :class="(line.used / line.budget) > 1 ? 'bg-rose-400' : 'bg-[#1B4588]'"
                    :style="{ width: Math.min((line.used / line.budget) * 100, 100) + '%' }">
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-[11px] text-[#b5aa9a]">尚無子專案預算</div>
          </div>

          <!-- 分隔線 -->
          <div class="mx-5 border-t border-[#E8E2D8]"></div>

          <!-- 收支紀錄 -->
          <div class="px-5 pt-4 pb-3">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-[#1B4588] flex items-center gap-1.5">
                <PhListBullets weight="fill" class="text-[#a09888]" /> 收支紀錄
              </h3>
              <NuxtLink to="/expense" class="text-[10px] font-bold text-[#1B4588] bg-[#1B4588]/8 hover:bg-[#1B4588]/15 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1">
                <PhPlus weight="bold" class="text-[8px]" /> 新增
              </NuxtLink>
            </div>

            <div v-if="projectHistory.length" class="space-y-1.5">
              <div v-for="tx in projectHistory" :key="tx.id"
                class="flex items-center justify-between py-2.5 px-3 bg-white rounded-xl border border-[#E8E2D8] hover:border-[#1B4588]/15 transition-colors">
                <div class="flex flex-col min-w-0">
                  <span class="font-bold text-[13px] text-[#1B4588] truncate">{{ tx.item || tx.subject }}</span>
                  <span class="text-[10px] text-[#a09888]">{{ tx.date }} · {{ tx.relatedUser }}</span>
                </div>
                <div class="font-mono font-bold text-sm shrink-0 ml-3" :class="tx.isIncome ? 'text-emerald-500' : 'text-[#6b6050]'">
                  {{ tx.isIncome ? '+' : '-' }}${{ formatNumber(tx.amount) }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-[#b5aa9a]">
              <div class="text-2xl mb-1 opacity-30">📋</div>
              <p class="text-[11px]">尚未有交易紀錄</p>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="px-5 pb-6 pt-4">
            <button @click="deleteProject" 
              class="w-full py-3 rounded-2xl text-sm font-bold text-rose-400 hover:text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors flex items-center justify-center gap-2">
              <PhTrash weight="bold" /> 刪除此專案
            </button>
          </div>
          
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';
import { PhX, PhHandCoins, PhChartPieSlice, PhListBullets, PhPencilSimple, PhPlus, PhTrash } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
  project: Object
});

const emit = defineEmits(['close']);
const store = useBudgetStore();

const close = () => emit('close');

const deleteProject = async () => {
    if (!props.project) return;
    if (confirm(`⚠️ 警告：刪除專案「${props.project.name}」將會一併刪除：\n1. 所有關聯的收支紀錄\n2. 預算設定\n3. 收款計畫\n\n刪除後無法復原。確定要刪除嗎？`)) {
        await store.deleteProject(props.project.id);
        close();
    }
};

const confirmReceipt = async (term) => {
    if (confirm(`確認已收到「${term.notes || '此款項'}」$${formatNumber(term.amount)} 嗎？`)) {
        await store.updateIncomeTerm(term.id, { status: 'received' });
    }
};

const editIncome = (term) => {
    const newVal = prompt("修改金額 (僅輸入數字):", term.amount);
    if (newVal !== null) {
        const amount = parseInt(newVal);
        if (!isNaN(amount) && amount >= 0) {
             store.updateIncomeTerm(term.id, { amount });
        }
    }
};

const addTerm = async () => {
    if (!props.project?.id) return;
    const name = prompt("請輸入款項名稱 (例如: 第二期款):", "新收款項");
    if (!name) return;
    
    const amountStr = prompt("請輸入金額:", "0");
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount < 0) return alert("金額格式錯誤");

    await store.addIncomeTerm({
        projectId: props.project.id,
        name,
        amount,
        date: new Date()
    });
};

const addBudgetLine = async () => {
    if (!props.project?.id) return;
    const name = prompt("請輸入子專案名稱 (例如: 工作坊A):");
    if (!name) return;
    
    const amountStr = prompt("請輸入預算金額:", "0");
    const budget = parseInt(amountStr);
    if (isNaN(budget) || budget < 0) return alert("金額格式錯誤");

    await store.addBudgetLine({
        projectId: props.project.id,
        name,
        budget
    });
};

const editBudgetLine = async (line) => {
    const newBudgetStr = prompt(`修改「${line.name}」預算金額:`, line.budget);
    if (newBudgetStr !== null) {
        const budget = parseInt(newBudgetStr);
        if (!isNaN(budget) && budget >= 0) {
             store.updateBudgetLine(line.id, { budget });
        }
    }
};

const deleteBudgetLine = async (line) => {
    if (confirm(`確定要刪除子專案「${line.name}」嗎？`)) {
        await store.deleteBudgetLine(line.id);
    }
};

const projectHistory = computed(() => {
    if (!props.project?.id) return [];
    // 使用寬鬆比對以容許 String/Number 差異
    return store.transactions
        .filter(tx => tx.projectId == props.project.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
</script>

<style scoped>
/* 彈窗動畫 — 底部滑入 */
.modal-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: all 0.2s cubic-bezier(0.7, 0, 0.84, 0);
}
.modal-enter-from {
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: translateY(100%);
}
.modal-leave-to > div:last-child {
  transform: translateY(40px);
}

/* 捲軸樣式 */
.custom-scrollbar::-webkit-scrollbar {
    width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #D4CEC3;
    border-radius: 20px;
}
</style>
