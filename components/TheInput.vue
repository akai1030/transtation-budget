<template>
  <div>
    <!-- FAB 觸發按鈕（品牌深藍） -->
    <button 
      @click="open"
      class="fixed bottom-24 right-6 w-16 h-16 bg-[#1B4588] text-white rounded-full shadow-2xl shadow-[#1B4588]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
    >
      <PhPlus class="text-3xl group-hover:rotate-90 transition-transform duration-300" weight="bold" />
    </button>

    <!-- 彈窗 Modal -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center">
           
           <!-- 背景遮罩（品牌深色） -->
           <div class="absolute inset-0 bg-[#1B4588]/20 backdrop-blur-sm" @click="isOpen = false"></div>

           <!-- 主卡片（品牌暖色） -->
           <div class="relative w-full sm:max-w-md bg-[#F0ECE6] rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh]">
              
              <!-- 拖曳提示列 -->
              <div class="w-full flex justify-center pt-3 pb-1 sm:hidden" @click="isOpen = false">
                  <div class="w-12 h-1.5 bg-[#D4CEC3] rounded-full"></div>
              </div>

              <!-- 可滾動內容區 -->
              <div class="flex-1 overflow-y-auto px-5 pb-3 space-y-3">

                <!-- 金額輸入 -->
                <div class="px-1 pt-3 pb-1">
                  <div class="flex items-baseline gap-2">
                    <span class="text-4xl font-mono font-black text-[#D4CEC3]">$</span>
                    <input type="text" inputmode="decimal" v-model="displayValue"
                      placeholder="0"
                      class="flex-1 text-4xl font-mono font-black tracking-tighter text-[#1B4588] bg-transparent outline-none placeholder:text-[#D4CEC3] text-right" />
                  </div>
                  <div v-if="hasOperator && computedAmount > 0" class="text-right text-xs font-mono text-[#1B4588]/60 mt-0.5">
                    = ${{ formatNumber(computedAmount) }}
                  </div>
                </div>

                <!-- 專案選擇 -->
                <div class="relative">
                  <select v-model="form.projectId" 
                    class="w-full bg-white rounded-2xl py-2.5 px-4 text-sm font-bold appearance-none outline-none text-[#1B4588] border border-[#E8E2D8] focus:border-[#1B4588]/30 transition-colors">
                    <option value="" disabled>選擇專案...</option>
                    <option v-for="p in store.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <PhCaretDown class="absolute right-4 top-1/2 -translate-y-1/2 text-[#a09888] pointer-events-none text-sm" />
                </div>

                <!-- 子專案 pill -->
                <div v-if="form.projectId && budgetLines.length > 0">
                  <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1.5 px-1">預算分支</div>
                  <div class="flex flex-wrap gap-1.5">
                    <button v-for="line in budgetLines" :key="line.category"
                      @click="form.branch = line.category"
                      class="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                      :class="form.branch === line.category 
                        ? 'bg-[#1B4588] text-white border-[#1B4588] shadow-sm shadow-[#1B4588]/15' 
                        : 'bg-white border-[#E8E2D8] text-[#6b6050] hover:border-[#1B4588]/30'">
                      {{ line.category }}
                      <span class="ml-1 opacity-50 font-mono text-[10px]">{{ formatCompact(line.budget - (line.used || 0)) }}</span>
                    </button>
                  </div>
                </div>

                <!-- 會計科目 pill -->
                <div>
                  <div class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1.5 px-1">會計科目</div>
                  <div class="flex flex-wrap gap-1.5">
                    <button v-for="cat in allCategories" :key="cat"
                      @click="form.category = cat"
                      class="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                      :class="form.category === cat 
                        ? 'bg-[#1B4588] text-white border-[#1B4588] shadow-sm shadow-[#1B4588]/15' 
                        : 'bg-white border-[#E8E2D8] text-[#6b6050] hover:border-[#1B4588]/30'">
                      {{ cat }}
                    </button>
                    <button v-if="!showCustomInput" @click="showCustomInput = true"
                      class="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-[#D4CEC3] text-[#b5aa9a] hover:border-[#1B4588] hover:text-[#1B4588] transition-colors flex items-center gap-1">
                      <PhPlus class="text-[10px]" /> 自訂
                    </button>
                  </div>
                  <!-- 自訂科目輸入 -->
                  <div v-if="showCustomInput" class="mt-2 flex gap-1.5">
                    <input type="text" v-model="customCategory" ref="customInputRef"
                      placeholder="新科目名稱"
                      @keyup.enter="addCustomCategory"
                      class="flex-1 bg-white rounded-xl py-2 px-3 text-sm outline-none border border-[#E8E2D8] focus:border-[#1B4588]/30 placeholder:text-[#c4baa8] transition-colors" />
                    <button @click="addCustomCategory" :disabled="!customCategory.trim()"
                      class="px-3 py-2 rounded-xl bg-[#1B4588] text-white text-xs font-bold disabled:opacity-30 active:scale-95 transition-all">
                      加入
                    </button>
                    <button @click="showCustomInput = false; customCategory = ''" 
                      class="px-2 py-2 rounded-xl bg-[#E8E2D8] text-[#a09888] text-xs active:scale-95">
                      <PhX />
                    </button>
                  </div>
                </div>

                <!-- 備註 + 日期 -->
                <div class="flex gap-2">
                  <div class="flex-1">
                    <input type="text" v-model="form.note" 
                      placeholder="備註（例：高鐵到台北）" 
                      class="w-full bg-white rounded-xl py-2.5 px-3 text-sm border border-[#E8E2D8] outline-none focus:border-[#1B4588]/30 placeholder:text-[#c4baa8] transition-colors" />
                  </div>
                  <button class="flex-shrink-0 px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 bg-white border border-[#E8E2D8] text-[#6b6050] relative">
                    <PhCalendarBlank weight="bold" class="text-sm text-[#a09888]" />
                    <span class="font-mono text-xs text-[#1B4588]">{{ shortDate }}</span>
                    <input type="date" v-model="form.date" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </button>
                </div>

              </div>

              <!-- 底部鍵盤 + 送出 -->
              <div class="bg-white rounded-t-[28px] p-4 shadow-inner-lg select-none border-t border-[#E8E2D8]">
                <!-- 計算機開關 -->
                <button @click="showKeypad = !showKeypad" 
                  class="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a09888] hover:text-[#1B4588] transition-colors py-1 mb-2">
                  <PhCalculator class="text-sm" />
                  <span>{{ showKeypad ? '收合計算機' : '展開計算機' }}</span>
                  <PhCaretDown class="text-[10px] transition-transform duration-300" :class="{'rotate-180': showKeypad}" />
                </button>

                <!-- 計算機鍵盤 -->
                <Transition name="expand">
                  <div v-if="showKeypad" class="grid grid-cols-4 gap-2 mb-3">
                    <button v-for="n in ['7','8','9','÷','4','5','6','×','1','2','3','-','C','0','.','+']" :key="n"
                      @click="handleInput(n)"
                      class="h-11 rounded-2xl text-lg font-mono font-bold active:scale-90 transition-all flex items-center justify-center"
                      :class="getKeyClass(n)">
                      {{ n }}
                    </button>
                  </div>
                </Transition>

                <!-- 送出按鈕 -->
                <button @click="startSubmit" 
                  :disabled="!isReady || store.isSyncing"
                  class="w-full py-3.5 rounded-full font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  :class="isReady 
                    ? 'bg-[#1B4588] text-white shadow-[#1B4588]/20 active:scale-95' 
                    : 'bg-[#E8E2D8] text-[#b5aa9a]'">
                  <PhSpinner v-if="store.isSyncing" class="animate-spin text-lg" />
                  <template v-else>
                    <PhCheck weight="bold" />
                    <span>確認送出</span>
                    <span v-if="isReady" class="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
                      {{ form.category }} · ${{ formatNumber(computedAmount) }}
                    </span>
                  </template>
                </button>
              </div>

           </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { 
  PhPlus, PhCalendarBlank, PhCaretDown, PhCheck, PhX, 
  PhCalculator, PhSpinner
} from '@phosphor-icons/vue';

const store = useBudgetStore();
const isOpen = ref(false);
const showKeypad = ref(false);
const showCustomInput = ref(false);
const customCategory = ref('');
const customInputRef = ref(null);
const userCategories = ref([]);

// 表單資料
const displayValue = ref('');
const form = reactive({
    projectId: '',
    branch: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
});

// 是否包含運算符號
const hasOperator = computed(() => /[+\-×÷]/.test(displayValue.value));

// 計算結果
const computedAmount = computed(() => {
  if (!displayValue.value) return 0;
  try {
    const expression = displayValue.value.replace(/×/g, '*').replace(/÷/g, '/');
    if (!/^[\d+\-*/.]+$/.test(expression)) return 0;
    const result = new Function('return ' + expression)();
    return Math.round(result) || 0;
  } catch { return 0; }
});

// 自動選擇唯一未歸檔的專案
const autoProject = computed(() => {
  const active = store.projects.filter(p => !p.isArchived);
  return active.length === 1 ? active[0] : null;
});

// 選中專案的預算線
const budgetLines = computed(() => {
  if (!form.projectId) return [];
  const stats = store.projectStats[form.projectId];
  return stats?.budgetLines || [];
});

// 專案變更時重設子專案
watch(() => form.projectId, () => { form.branch = ''; });

// 科目列表 = 預設 + 使用者自訂
const allCategories = computed(() => {
  const base = store.commonItems?.length > 0 ? store.commonItems : [
    '交通費', '講師費', '餐費', '住宿費', '場地費', '器材租借', '雜支', '專案執行費', '行政管理費', '稅金'
  ];
  const combined = [...base];
  for (const c of userCategories.value) {
    if (!combined.includes(c)) combined.push(c);
  }
  return combined;
});

// 日期簡短顯示
const shortDate = computed(() => {
  if (!form.date) return '今天';
  const d = new Date(form.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return '今天';
  return `${d.getMonth() + 1}/${d.getDate()}`;
});

// 是否可送出
const isReady = computed(() => {
    return computedAmount.value > 0 && !!form.projectId && !!form.category;
});

// ── 新增自訂科目 ──

const addCustomCategory = () => {
  const name = customCategory.value.trim();
  if (!name) return;
  if (!userCategories.value.includes(name)) {
    userCategories.value.push(name);
    localStorage.setItem('userCategories', JSON.stringify(userCategories.value));
  }
  form.category = name;
  customCategory.value = '';
  showCustomInput.value = false;
};

watch(showCustomInput, async (val) => {
  if (val) { await nextTick(); customInputRef.value?.focus(); }
});

// ── 鍵盤處理 ──

const handleInput = (key) => {
    if (navigator.vibrate) navigator.vibrate(10);
    
    if (key === 'C') {
        displayValue.value = '';
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

const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
const formatCompact = (n) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

// ── 開啟 ──

const open = () => {
    isOpen.value = true;
    showKeypad.value = false;
    if (autoProject.value) {
      form.projectId = autoProject.value.id;
    }
};

// ── 送出 ──

const startSubmit = async () => {
    if (!isReady.value || store.isSyncing) return;

    localStorage.setItem('lastUsedDate', form.date);

    try {
        await store.addTransaction({
            date: form.date,
            payer: store.currentUser?.name,
            items: [{
                projectId: form.projectId,
                amount: computedAmount.value,
                description: form.note || '快速記帳',
                branch: form.branch || form.category,
                subject: form.category,
            }]
        });

        // 成功重設
        displayValue.value = '';
        form.note = '';
        isOpen.value = false;
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

    } catch (err) {
        alert('記帳失敗：' + err.message);
    }
};

// ── 初始化 ──
onMounted(() => {
    const saved = localStorage.getItem('lastUsedDate');
    if (saved) form.date = saved;
    const savedCats = localStorage.getItem('userCategories');
    if (savedCats) { try { userCategories.value = JSON.parse(savedCats); } catch {} }
});
watch(() => form.date, (v) => localStorage.setItem('lastUsedDate', v));

</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

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
}
</style>
