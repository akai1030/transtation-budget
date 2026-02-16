<template>
  <!-- 全頁背景（品牌米色） -->
  <div class="expense-page min-h-screen bg-[#F0ECE6] relative overflow-hidden">
    
    <!-- 品牌花形裝飾背景 -->
    <div class="absolute -top-20 -right-20 w-64 h-64 opacity-[0.08] pointer-events-none">
      <svg viewBox="0 0 200 200" class="w-full h-full animate-[spin_60s_linear_infinite]">
        <circle cx="100" cy="52" r="56" fill="#1B4588"/>
        <circle cx="142" cy="76" r="56" fill="#1B4588"/>
        <circle cx="142" cy="124" r="56" fill="#1B4588"/>
        <circle cx="100" cy="148" r="56" fill="#1B4588"/>
        <circle cx="58" cy="124" r="56" fill="#1B4588"/>
        <circle cx="58" cy="76" r="56" fill="#1B4588"/>
      </svg>
    </div>

    <!-- 底部裝飾 -->
    <div class="absolute -bottom-32 -left-16 w-48 h-48 opacity-[0.05] pointer-events-none">
      <svg viewBox="0 0 200 200" class="w-full h-full">
        <circle cx="100" cy="52" r="56" fill="#1B4588"/>
        <circle cx="142" cy="76" r="56" fill="#1B4588"/>
        <circle cx="142" cy="124" r="56" fill="#1B4588"/>
        <circle cx="100" cy="148" r="56" fill="#1B4588"/>
        <circle cx="58" cy="124" r="56" fill="#1B4588"/>
        <circle cx="58" cy="76" r="56" fill="#1B4588"/>
      </svg>
    </div>

    <!-- 主內容 -->
    <div class="relative z-10 max-w-lg mx-auto px-5 pt-8 pb-36 space-y-5">

      <!-- 標題 — 進場動畫 #1 -->
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
            <h1 class="text-2xl font-bold text-[#1B4588] tracking-tight">記帳</h1>
            <p class="text-[10px] text-[#a09888] font-medium tracking-widest uppercase">Expense Entry</p>
          </div>
        </div>
      </header>

      <!-- 1. 金額輸入卡片 -->
      <div class="stagger-item bg-white rounded-[28px] p-5 shadow-sm border border-[#E8E2D8] relative overflow-hidden" style="--delay: 1">
        <!-- 卡片裝飾圓點 -->
        <div class="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#1B4588] opacity-40"></div>
        
        <!-- 金額直接輸入 -->
        <div class="flex items-center gap-2 py-2">
          <span class="text-3xl sm:text-4xl font-mono font-black text-[#D4CEC3] shrink-0">$</span>
          <input type="text" inputmode="decimal" v-model="displayValue"
            placeholder="0"
            class="flex-1 min-w-0 text-3xl sm:text-4xl font-mono font-black tracking-tighter text-[#1B4588] bg-transparent outline-none placeholder:text-[#D4CEC3] text-right w-full" />
        </div>
        
        <!-- 計算結果提示 -->
        <div v-if="hasOperator && computedAmount > 0" class="text-right text-xs font-mono text-[#1B4588]/60 mt-1 pr-1">
          = ${{ formatNumber(computedAmount) }}
        </div>

        <!-- 計算機開關 -->
        <button @click="showKeypad = !showKeypad" 
          class="mt-4 w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a09888] hover:text-[#1B4588] transition-colors py-2 border-t border-[#E8E2D8]">
          <PhCalculator class="text-sm" />
          <span>{{ showKeypad ? '收合計算機' : '展開計算機' }}</span>
          <PhCaretDown class="text-[10px] transition-transform duration-300" :class="{'rotate-180': showKeypad}" />
        </button>

        <!-- 計算機鍵盤 -->
        <Transition name="expand">
          <div v-if="showKeypad" class="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#E8E2D8]">
            <button v-for="key in keypad" :key="key"
              @click="handleKey(key)"
              class="h-12 rounded-2xl font-mono text-lg font-bold flex items-center justify-center transition-all active:scale-90 select-none"
              :class="getKeyClass(key)">
              {{ key }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- 2. 專案 & 子專案 -->
      <div class="stagger-item bg-white rounded-[28px] p-5 shadow-sm border border-[#E8E2D8] relative overflow-hidden" style="--delay: 2">
        <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-3">專案 / 子專案</div>
        
        <!-- 專案選擇 -->
        <div class="relative mb-3">
          <select v-model="selectedProjectId" 
            class="w-full bg-[#F0ECE6] rounded-2xl py-3 px-4 text-sm font-bold appearance-none outline-none text-[#1B4588] border border-[#E8E2D8] focus:border-[#1B4588]/30 transition-colors">
            <option value="" disabled>選擇專案...</option>
            <option v-for="p in store.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <PhCaretDown class="absolute right-4 top-1/2 -translate-y-1/2 text-[#a09888] pointer-events-none text-sm" />
        </div>

        <!-- 子專案 pill -->
        <div v-if="selectedProjectId && budgetLines.length > 0">
          <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1.5">預算分支</div>
          <div class="flex flex-wrap gap-2">
            <button v-for="line in budgetLines" :key="line.category"
              @click="selectedBranch = line.category"
              class="px-3.5 py-2 rounded-full text-xs font-bold transition-all border"
              :class="selectedBranch === line.category 
                ? 'bg-[#1B4588] text-white border-[#1B4588] shadow-md shadow-[#1B4588]/15' 
                : 'bg-[#F0ECE6] border-[#E8E2D8] text-[#6b6050] hover:border-[#1B4588]/30'">
              {{ line.category }}
              <span class="ml-1 opacity-50 font-mono text-[10px]">
                {{ formatCompact(line.budget - line.used) }}
              </span>
            </button>
          </div>
          <!-- 剩餘預算 -->
          <div v-if="selectedBranch && selectedBranchInfo" class="mt-2 text-[10px] font-mono px-1 flex justify-between">
            <span class="text-[#a09888]">預算 ${{ formatNumber(selectedBranchInfo.budget) }}</span>
            <span :class="branchRemaining < 0 ? 'text-crimson-alert font-bold' : 'text-[#1B4588]'">
              剩餘 ${{ formatNumber(branchRemaining) }}
            </span>
          </div>
        </div>

        <div v-else-if="!selectedProjectId" class="text-xs text-[#b5aa9a] text-center py-3 font-medium">
          請先選擇專案
        </div>
      </div>

      <!-- 3. 會計科目 -->
      <div class="stagger-item bg-white rounded-[28px] p-5 shadow-sm border border-[#E8E2D8] relative overflow-hidden" style="--delay: 3">
        <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-3">會計科目</div>
        <div class="flex flex-wrap gap-2">
          <button v-for="cat in allCategories" :key="cat"
            @click="selectedCategory = cat"
            class="px-3.5 py-2 rounded-full text-xs font-bold transition-all border"
            :class="selectedCategory === cat 
              ? 'bg-[#1B4588] text-white border-[#1B4588] shadow-md shadow-[#1B4588]/15' 
              : 'bg-[#F0ECE6] border-[#E8E2D8] text-[#6b6050] hover:border-[#1B4588]/30'">
            {{ cat }}
          </button>

          <!-- 新增科目 -->
          <button v-if="!showCustomInput" @click="showCustomInput = true"
            class="px-3.5 py-2 rounded-full text-xs font-bold transition-all border border-dashed !border-[#D4CEC3] text-[#b5aa9a] hover:border-[#1B4588] hover:text-[#1B4588] flex items-center gap-1">
            <PhPlus class="text-[10px]" />
            自訂
          </button>
        </div>

        <!-- 自訂科目輸入 -->
        <div v-if="showCustomInput" class="mt-3 flex gap-2">
          <input type="text" v-model="customCategory" ref="customInput"
            placeholder="輸入新科目名稱"
            @keyup.enter="addCustomCategory"
            class="flex-1 bg-[#F0ECE6] rounded-xl py-2.5 px-3 text-sm outline-none border border-[#E8E2D8] focus:border-[#1B4588]/30 placeholder:text-[#c4baa8] transition-colors" />
          <button @click="addCustomCategory" 
            :disabled="!customCategory.trim()"
            class="px-4 py-2.5 rounded-xl bg-[#1B4588] text-white text-xs font-bold disabled:opacity-30 active:scale-95 transition-all">
            加入
          </button>
          <button @click="showCustomInput = false; customCategory = ''" 
            class="px-3 py-2.5 rounded-xl bg-[#E8E2D8] text-[#a09888] text-xs font-bold active:scale-95 transition-all">
            <PhX />
          </button>
        </div>
      </div>

      <!-- 4. 備註 & 日期 -->
      <div class="stagger-item grid grid-cols-3 gap-3" style="--delay: 4">
        <!-- 備註 -->
        <div class="col-span-2 bg-white rounded-[28px] p-5 !py-3.5 shadow-sm border border-[#E8E2D8] relative overflow-hidden">
          <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1.5">備註</div>
          <input type="text" v-model="note" 
            placeholder="例：高鐵到台北"
            class="w-full bg-transparent text-sm font-medium text-[#1B4588] outline-none placeholder:text-[#c4baa8]" />
        </div>

        <!-- 日期 -->
        <div @click="openDatePicker" class="bg-white rounded-[28px] p-5 !py-3.5 shadow-sm border border-[#E8E2D8] relative overflow-hidden cursor-pointer group hover:border-[#1B4588]/30 transition-colors">
          <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1.5">日期</div>
          <div class="flex items-center gap-1.5">
            <PhCalendarBlank class="text-[#a09888] text-sm flex-shrink-0 group-hover:text-[#1B4588] transition-colors" />
            <span class="text-sm font-bold text-[#1B4588] font-mono">{{ shortDate }}</span>
          </div>
          <!-- Opacity 0.01 確保存在於渲染層但不可見 -->
          <input ref="dateInput" type="date" v-model="selectedDate" 
            class="absolute inset-0 opacity-[0.01] cursor-pointer w-full h-full z-20 appearance-none" />
        </div>
      </div>

      <!-- 5. 送出按鈕 — 進場動畫 #6 -->
      <button @click="submit" 
        :disabled="!isValid || store.isSyncing"
        class="stagger-item w-full py-4 rounded-full font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:scale-100"
        :class="isValid 
          ? 'bg-[#1B4588] text-white shadow-[#1B4588]/20 hover:shadow-[#1B4588]/40 hover:scale-[1.02] active:scale-95' 
          : 'bg-[#E8E2D8] text-[#b5aa9a]'"
        style="--delay: 5">
        <PhSpinner v-if="store.isSyncing" class="animate-spin text-xl" />
        <template v-else>
          <span>確認送出</span>
          <span v-if="isValid" class="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">
            {{ selectedCategory }} · ${{ formatNumber(computedAmount) }}
          </span>
        </template>
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { PhCalendarBlank, PhPlus, PhX, PhSpinner, PhCaretDown, PhCalculator } from '@phosphor-icons/vue';

const store = useBudgetStore();
const router = useRouter();

definePageMeta({ layout: 'default' });

// ── 狀態 ──

// 計算機
const displayValue = ref('');
const equation = ref('');
const showKeypad = ref(false);

// 是否包含運算符號（用來決定是否顯示計算結果）
const hasOperator = computed(() => /[+\-×÷]/.test(displayValue.value));

// 表單
const selectedProjectId = ref('');
const selectedBranch = ref('');
const selectedCategory = ref('');
const note = ref('');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const dateInput = ref(null); // 日期輸入框 Ref

// 強制打開日期選擇器
const openDatePicker = () => {
  if (dateInput.value && typeof dateInput.value.showPicker === 'function') {
    dateInput.value.showPicker();
  } else {
    dateInput.value?.click();
  }
};

// 自訂科目
const showCustomInput = ref(false);
const customCategory = ref('');
const customInput = ref(null);
const userCategories = ref([]); // 使用者自訂的科目

// 科目完整列表 = 預設 + 使用者自訂
const allCategories = computed(() => {
  const base = store.commonItems?.length > 0 ? store.commonItems : [
    '交通費', '講師費', '餐費', '住宿費', '場地費', '器材租借', '雜支', '專案執行費', '行政管理費', '稅金'
  ];
  // 合併使用者自訂的科目（去重）
  const combined = [...base];
  for (const c of userCategories.value) {
    if (!combined.includes(c)) combined.push(c);
  }
  return combined;
});

// 專案變更時重設子專案
watch(selectedProjectId, () => {
  selectedBranch.value = '';
});

// 選中專案的預算線
const budgetLines = computed(() => {
  if (!selectedProjectId.value) return [];
  const stats = store.projectStats[selectedProjectId.value];
  return stats?.budgetLines || [];
});

// 選中分支的詳細資訊
const selectedBranchInfo = computed(() => {
  return budgetLines.value.find(l => l.category === selectedBranch.value);
});

// 分支剩餘預算
const branchRemaining = computed(() => {
  if (!selectedBranchInfo.value) return 0;
  return selectedBranchInfo.value.budget - selectedBranchInfo.value.used - computedAmount.value;
});

// 自動選唯一專案
onMounted(() => {
  const active = store.projects.filter(p => !p.isArchived);
  if (active.length === 1) {
    selectedProjectId.value = active[0].id;
  }
  
  // 載入持久化日期
  const saved = localStorage.getItem('lastUsedDate');
  if (saved) selectedDate.value = saved;
  
  // 載入使用者自訂科目
  const savedCats = localStorage.getItem('userCategories');
  if (savedCats) {
    try { userCategories.value = JSON.parse(savedCats); } catch {}
  }
});

// 持久化日期
watch(selectedDate, (v) => localStorage.setItem('lastUsedDate', v));

// 日期簡短顯示
const shortDate = computed(() => {
  if (!selectedDate.value) return '今天';
  const d = new Date(selectedDate.value + 'T00:00:00');
  const today = new Date();
  // 使用 toDateString 比較，避免時區問題
  if (d.toDateString() === today.toDateString()) return '今天';
  return `${d.getMonth() + 1}/${d.getDate()}`;
});

// ── 自訂科目 ──

const addCustomCategory = async () => {
  const name = customCategory.value.trim();
  if (!name) return;
  if (!userCategories.value.includes(name)) {
    userCategories.value.push(name);
    // 持久化到 localStorage
    localStorage.setItem('userCategories', JSON.stringify(userCategories.value));
  }
  selectedCategory.value = name;
  customCategory.value = '';
  showCustomInput.value = false;
};

// 打開自訂科目輸入時自動聚焦
watch(showCustomInput, async (val) => {
  if (val) {
    await nextTick();
    customInput.value?.focus();
  }
});

// ── 計算機邏輯 ──

const keypad = [
  '7', '8', '9', '÷',
  '4', '5', '6', '×',
  '1', '2', '3', '-',
  'C', '0', '.', '+',
];

const handleKey = (key) => {
  if (navigator.vibrate) navigator.vibrate(10);

  if (key === 'C') {
    displayValue.value = '';
    equation.value = '';
    return;
  }

  const ops = ['+', '-', '×', '÷'];
  if (ops.includes(key)) {
    if (!displayValue.value) return;
    const last = displayValue.value.slice(-1);
    if (ops.includes(last) || last === '.') return;
  }

  if (key === '.') {
    const parts = displayValue.value.split(/[+\-×÷]/);
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes('.')) return;
  }

  displayValue.value += key;
};

const getKeyClass = (key) => {
  if (key === 'C') return 'bg-red-50 text-crimson-alert font-bold';
  if (['÷', '×', '-', '+'].includes(key)) return 'bg-[#E8E2D8] text-[#8a7e6e]';
  return 'bg-[#F0ECE6] text-[#1B4588] hover:bg-[#E8E2D8]';
};

// 計算結果
const computedAmount = computed(() => {
  if (!displayValue.value) return 0;
  try {
    const expression = displayValue.value
      .replace(/×/g, '*')
      .replace(/÷/g, '/');
    if (!/^[\d+\-*/.]+$/.test(expression)) return 0;
    const result = new Function('return ' + expression)();
    return Math.round(result) || 0;
  } catch {
    return 0;
  }
});

// 格式化
const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
const formatCompact = (n) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

// ── 驗證 ──

const isValid = computed(() => {
  return computedAmount.value > 0 && selectedProjectId.value && selectedCategory.value;
});

// ── 送出 ──

const submit = async () => {
  if (!isValid.value || store.isSyncing) return;

  try {
    await store.addTransaction({
      date: selectedDate.value,
      payer: store.currentUser?.name,
      items: [{
        projectId: selectedProjectId.value,
        amount: computedAmount.value,
        branch: selectedBranch.value || selectedCategory.value,
        subject: selectedCategory.value,
        description: note.value || '快速記帳',
      }]
    });

    // 成功：重設金額和備註
    displayValue.value = '';
    equation.value = '';
    note.value = '';

    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    navigateTo('/');
  } catch (e) {
    alert('記帳失敗：' + e.message);
  }
};
</script>

<style scoped>
/* ── 進場交錯動畫 ── */
.stagger-item {
  opacity: 0;
  transform: translateY(24px);
  animation: staggerIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(var(--delay, 0) * 0.12s + 0.1s);
}

@keyframes staggerIn {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── 計算機展開 ── */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  max-height: 300px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}
</style>
