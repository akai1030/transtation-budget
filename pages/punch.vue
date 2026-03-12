<template>
  <div class="min-h-screen bg-[#F0ECE6] flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <div class="absolute -top-[20%] -right-[10%] w-[60%] aspect-square bg-gradient-to-br from-white/60 to-transparent rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-sm relative z-10">
      <Transition name="fade" mode="out-in">

        <!-- Step 1: 輸入名字 -->
        <div v-if="step === 'name'" key="name">
          <div class="text-center mb-10">
            <h1 class="text-3xl font-bold tracking-tight text-[#1B4588] mb-2">工時自助登記</h1>
            <p class="text-[#8c8273]">請先告訴我們你是誰</p>
          </div>
          <div class="bg-white rounded-[32px] p-8 shadow-sm border border-[#E8E2D8]">
            <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-3 pl-1">你的名字</label>
            <input
              v-model="nameInput"
              list="name-list"
              type="text"
              placeholder="例如：王大明"
              autofocus
              @keyup.enter="proceedFromName"
              class="w-full border border-[#E8E2D8] focus:border-[#1B4588]/30 bg-[#F0ECE6] rounded-2xl px-5 py-4 text-lg font-bold text-[#1B4588] transition-colors outline-none placeholder:text-[#c4baa8] mb-4"
            >
            <datalist id="name-list">
              <option v-for="n in customTargets" :key="n" :value="n"></option>
            </datalist>
            <button
              @click="proceedFromName"
              :disabled="!nameInput.trim() || isChecking"
              class="w-full bg-[#1B4588] hover:bg-[#153a70] text-white font-bold py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-[#1B4588]/20 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <PhSpinner v-if="isChecking" class="animate-spin" />
              <span>下一步</span>
            </button>
          </div>
        </div>

        <!-- Step 2: 設定 PIN（新用戶） -->
        <div v-else-if="step === 'set-pin'" key="set-pin">
          <div class="text-center mb-8">
            <p class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">首次登記</p>
            <h2 class="text-2xl font-bold text-[#1B4588] tracking-tight">設定你的 PIN 碼</h2>
            <p class="text-sm text-[#8c8273] mt-2">設定 4 位數字，之後登入會需要輸入</p>
          </div>
          <PinPad
            :title="pinSetStage === 'first' ? '輸入新 PIN 碼' : '再輸入一次確認'"
            :error="pinError"
            @complete="handleSetPin"
            @back="step = 'name'"
          />
        </div>

        <!-- Step 3: 驗證 PIN（舊用戶） -->
        <div v-else-if="step === 'verify-pin'" key="verify-pin">
          <div class="text-center mb-8">
            <p class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-1">歡迎回來</p>
            <h2 class="text-2xl font-bold text-[#1B4588] tracking-tight">{{ myName }}</h2>
          </div>
          <PinPad
            title="輸入 PIN 碼"
            :error="pinError"
            @complete="handleVerifyPin"
            @back="step = 'name'"
          />
        </div>

        <!-- Step 4: 主畫面 -->
        <div v-else-if="step === 'main'" key="main">
          <div class="flex justify-between items-center mb-8">
            <div>
              <p class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em]">登入身份</p>
              <h2 class="text-xl font-bold text-[#1B4588] tracking-tight">{{ myName }}</h2>
            </div>
            <button @click="switchIdentity" class="text-xs font-bold text-[#a09888] hover:text-[#1B4588] bg-white border border-[#E8E2D8] px-3 py-2 rounded-full transition-colors">
              切換身份
            </button>
          </div>

          <!-- 登記表單 -->
          <div class="bg-white rounded-[32px] p-8 shadow-sm border border-[#E8E2D8] mb-6">
            <div v-if="isSuccess" class="text-center py-8">
              <div class="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhCheckCircle weight="fill" class="text-4xl" />
              </div>
              <h3 class="font-bold text-xl text-[#6b6050] mb-2">登記成功！</h3>
              <p class="text-sm text-[#a09888] mb-8">管理員已收到您的工時紀錄。</p>
              <button @click="resetForm" class="bg-[#F0ECE6] hover:bg-[#E8E2D8] text-[#1B4588] font-bold py-3 px-6 rounded-full transition-colors w-full text-sm">
                再登記一筆
              </button>
            </div>

            <form v-else @submit.prevent="submitPunch" class="flex flex-col gap-6">
              <div>
                <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">執行時數 (必填)</label>
                <div class="relative flex items-center">
                  <input v-model="form.hours" type="number" step="0.5" min="0.5" required placeholder="0"
                    class="w-full border border-[#E8E2D8] focus:border-[#1B4588]/30 bg-[#F0ECE6] rounded-2xl pl-5 pr-16 py-4 text-2xl font-mono font-bold text-[#1B4588] text-center transition-colors outline-none placeholder:text-[#c4baa8]">
                  <span class="absolute right-5 text-[#a09888] font-bold pointer-events-none">小時</span>
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">執行日期</label>
                <input v-model="form.date" type="date" required class="w-full border border-[#E8E2D8] focus:border-[#1B4588]/30 bg-[#F0ECE6] rounded-2xl px-5 py-4 text-center font-bold text-[#1B4588] transition-colors outline-none">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-2 pl-2">工作內容簡述</label>
                <input v-model="form.description" type="text" placeholder="進場佈置 / 拍攝紀錄 等"
                  class="w-full border border-transparent border-b-[#E8E2D8] focus:border-b-[#1B4588]/30 bg-transparent rounded-none px-2 py-3 text-sm font-bold text-[#6b6050] transition-colors outline-none placeholder:text-[#c4baa8]">
              </div>
              <button type="submit" :disabled="isLoading || !form.hours"
                class="w-full bg-[#1B4588] hover:bg-[#153a70] text-white font-bold py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-[#1B4588]/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                <PhPaperPlaneRight v-if="!isLoading" weight="fill" />
                <PhSpinner v-else class="animate-spin" />
                <span>送出工時紀錄</span>
              </button>
            </form>
          </div>

          <!-- 我的紀錄 -->
          <div v-if="isLoadingLogs" class="flex justify-center py-6 text-[#a09888]">
            <PhSpinner class="animate-spin text-2xl" />
          </div>
          <div v-else-if="myLogs.pending.length > 0 || myLogs.settled.length > 0">
            <div v-if="myLogs.pending.length > 0" class="mb-4">
              <h3 class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-3 text-center">待結算紀錄</h3>
              <div class="space-y-2">
                <div v-for="log in myLogs.pending" :key="log.id" class="bg-white border border-[#E8E2D8] rounded-2xl p-4 flex justify-between items-center">
                  <div class="flex-1 min-w-0 pr-3">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[10px] font-mono font-bold text-[#a09888]">{{ formatDate(log.date) }}</span>
                      <span class="font-bold text-[#6b6050] text-sm truncate">{{ log.description || '一般執行' }}</span>
                    </div>
                    <span class="text-xs text-[#b5aa9a] font-bold">{{ log.hours }} 小時</span>
                  </div>
                  <button @click="deleteLog(log.id)" class="bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 p-2 rounded-xl transition-colors">
                    <PhTrash weight="bold" />
                  </button>
                </div>
              </div>
            </div>
            <div v-if="myLogs.settled.length > 0">
              <h3 class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-3 text-center">已結算紀錄</h3>
              <div class="space-y-2">
                <div v-for="log in myLogs.settled" :key="log.id" class="bg-white/60 border border-[#E8E2D8] rounded-2xl p-4 flex justify-between items-center opacity-60">
                  <div class="flex-1 min-w-0 pr-3">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[10px] font-mono font-bold text-[#a09888]">{{ formatDate(log.date) }}</span>
                      <span class="font-bold text-[#6b6050] text-sm truncate">{{ log.description || '一般執行' }}</span>
                    </div>
                    <span class="text-xs text-[#b5aa9a] font-bold">{{ log.hours }} 小時</span>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-mono font-bold text-emerald-600">${{ log.amount.toLocaleString() }}</span>
                    <div class="text-[10px] text-[#b5aa9a] mt-0.5">已結算</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { PhPaperPlaneRight, PhSpinner, PhCheckCircle, PhTrash } from '@phosphor-icons/vue';

const DEFAULT_HOURLY_RATE = 200;

const step = ref('name'); // 'name' | 'set-pin' | 'verify-pin' | 'main'
const nameInput = ref('');
const myName = ref('');
const pinError = ref('');
const pinSetStage = ref('first'); // 'first' | 'confirm'
const firstPin = ref('');
const isChecking = ref(false);
const isLoading = ref(false);
const isLoadingLogs = ref(false);
const isSuccess = ref(false);
const customTargets = ref([]);
const myLogs = ref({ pending: [], settled: [] });

const form = reactive({
    hours: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
});

const formatDate = (d) => new Date(d).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });

const fetchCustomTargets = async () => {
    try {
        const data = await $fetch('/api/hr/get-custom-targets');
        customTargets.value = data || [];
    } catch (e) { console.error(e); }
};

const fetchMyLogs = async () => {
    if (!myName.value) return;
    isLoadingLogs.value = true;
    try {
        const data = await $fetch('/api/hr/get-my-logs', { query: { name: myName.value } });
        myLogs.value = data || { pending: [], settled: [] };
    } catch (e) { console.error(e); }
    finally { isLoadingLogs.value = false; }
};

const proceedFromName = async () => {
    const name = nameInput.value.trim();
    if (!name) return;
    isChecking.value = true;
    try {
        const { exists } = await $fetch('/api/hr/punch-check', { query: { name } });
        myName.value = name;
        pinError.value = '';
        if (exists) {
            step.value = 'verify-pin';
        } else {
            pinSetStage.value = 'first';
            firstPin.value = '';
            step.value = 'set-pin';
        }
    } catch (e) {
        console.error(e);
    } finally {
        isChecking.value = false;
    }
};

const handleSetPin = async (pin) => {
    if (pinSetStage.value === 'first') {
        firstPin.value = pin;
        pinSetStage.value = 'confirm';
        pinError.value = '';
    } else {
        if (pin !== firstPin.value) {
            pinError.value = 'PIN 碼不一致，請重新輸入';
            pinSetStage.value = 'first';
            firstPin.value = '';
            return;
        }
        try {
            await $fetch('/api/hr/punch-register', {
                method: 'POST',
                body: { name: myName.value, pin }
            });
            sessionStorage.setItem('punch_verified', myName.value);
            localStorage.setItem('punch_name', myName.value);
            await fetchMyLogs();
            step.value = 'main';
        } catch (e) {
            pinError.value = '設定失敗，請重試';
        }
    }
};

const handleVerifyPin = async (pin) => {
    try {
        await $fetch('/api/hr/punch-verify', {
            method: 'POST',
            body: { name: myName.value, pin }
        });
        pinError.value = '';
        sessionStorage.setItem('punch_verified', myName.value);
        localStorage.setItem('punch_name', myName.value);
        await fetchMyLogs();
        step.value = 'main';
    } catch (e) {
        pinError.value = 'PIN 碼錯誤，請重試';
    }
};

const switchIdentity = () => {
    myName.value = '';
    nameInput.value = '';
    myLogs.value = { pending: [], settled: [] };
    localStorage.removeItem('punch_name');
    sessionStorage.removeItem('punch_verified');
    step.value = 'name';
};

const submitPunch = async () => {
    if (!form.hours) return;
    isLoading.value = true;
    try {
        await $fetch('/api/hr/post-logs', {
            method: 'POST',
            body: {
                targetName: myName.value,
                hours: Number(form.hours),
                hourlyRate: DEFAULT_HOURLY_RATE,
                date: new Date(form.date).toISOString(),
                description: form.description.trim()
            }
        });
        isSuccess.value = true;
        await fetchMyLogs();
        await fetchCustomTargets();
    } catch (e) {
        alert("登記失敗，請檢查網路連線或聯絡管理員。");
    } finally {
        isLoading.value = false;
    }
};

const deleteLog = async (id) => {
    if (!confirm('確定要刪除這筆尚未結算的紀錄嗎？')) return;
    try {
        await $fetch('/api/hr/delete-log', { method: 'POST', body: { id, name: myName.value } });
        await fetchMyLogs();
    } catch (e) {
        alert("刪除失敗");
    }
};

const resetForm = () => {
    form.hours = '';
    form.description = '';
    form.date = new Date().toISOString().split('T')[0];
    isSuccess.value = false;
};

onMounted(async () => {
    await fetchCustomTargets();
    const savedName = localStorage.getItem('punch_name');
    const verified = sessionStorage.getItem('punch_verified');
    if (savedName) {
        nameInput.value = savedName;
        myName.value = savedName;
        if (verified === savedName) {
            await fetchMyLogs();
            step.value = 'main';
        } else {
            step.value = 'verify-pin';
        }
    }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
