<template>
  <div class="px-5 py-8">
    <h1 class="text-3xl font-bold text-[#1B4588] mb-6">測試頁面 (防錯驗證)</h1>
    
    <div class="space-y-6">
      <!-- 測試用：建立交易 -->
      <div class="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm">
         <h2 class="font-bold text-lg mb-4 text-[#1B4588]">1. 測試：記帳扣款邏輯</h2>
         <div class="flex flex-col gap-3 max-w-sm">
            <div>
              <label class="block text-xs font-bold text-[#a09888] mb-1">選擇付款人</label>
              <select v-model="testForm.payer" class="w-full bg-[#F5F5F0] border border-[#E8E2D8] rounded-xl px-4 py-2 font-bold mb-2 text-[#1B4588]">
                <option v-for="u in store.users" :key="u.id" :value="u.name">{{u.name}} (餘額: {{ u.pettyCash }})</option>
              </select>
            </div>
            
            <div>
               <label class="block text-xs font-bold text-[#a09888] mb-1">扣款金額 (花費)</label>
               <input v-model="testForm.amount" type="number" class="w-full bg-[#F5F5F0] border border-[#E8E2D8] rounded-xl px-4 py-2 font-bold" />
            </div>
            
            <button @click="testSubmit" class="bg-[#1B4588] text-white py-3 rounded-xl font-bold">送出測試支出</button>
            <p class="text-xs text-[#a09888] mt-2">
              這會觸發 `handleExpense`。正確邏輯是：此人的「餘額」會減少。如果之前是 0，花 500 就會變 -500 (代表公司欠他 500)。
            </p>
         </div>
      </div>

       <!-- 歷史清單（包含還原測試） -->
       <div class="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm">
         <h2 class="font-bold text-lg mb-4 text-[#1B4588]">2. 測試：刪除/還原邏輯</h2>
         <p class="text-xs text-[#a09888] mb-4 text-[#1B4588]">當刪除以下交易時，人員的零用金應正確反向加回（或扣除）。</p>
         
         <div class="space-y-3">
            <div v-for="tx in store.sortedTransactions.slice(0, 5)" :key="tx.id" class="flex items-center justify-between p-3 border rounded-lg bg-[#F5F5F0]">
               <div>
                 <div class="text-sm font-bold">{{ tx.item || tx.subject }}</div>
                 <div class="text-xs text-[#a09888]">{{ tx.relatedUser }} | {{ tx.isIncome ? '收入/轉帳' : '支出' }} </div>
               </div>
               <div class="flex items-center gap-4">
                  <span class="font-mono font-bold" :class="tx.isIncome ? 'text-emerald-500' : 'text-rose-500'">
                     {{ tx.isIncome ? '+' : '-' }}{{ tx.amount }}
                  </span>
                  <button @click="testDelete(tx.id)" class="text-xs bg-rose-100 text-rose-600 px-3 py-1.5 rounded-md font-bold hover:bg-rose-200 transition">刪除並驗證</button>
               </div>
            </div>
         </div>
       </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const store = useBudgetStore()
const testForm = ref({ amount: 500, payer: '' })

// 預設選擇第一個人
if(store.users.length > 0) testForm.value.payer = store.users[0].name;

const testSubmit = async () => {
    if(!testForm.value.payer || !testForm.value.amount) return;
    try {
        await store.addTransaction({
            date: new Date().toISOString().split('T')[0],
            payer: testForm.value.payer,
            items: [{
                projectId: null,
                branch: '測試',
                subject: '防錯測試記帳',
                description: '驗證餘額扣除邏輯',
                amount: testForm.value.amount,
                currency: 'TWD'
            }]
        })
        alert("測試新增成功！請觀察該成員餘額變化");
    } catch(e) {
        alert("失敗: " + e)
    }
}

const testDelete = async (id) => {
    if(!confirm("確定要刪除這筆紀錄以驗證「還原功能」嗎？")) return;
    try {
        await $fetch(`/api/transaction/${id}`, { method: 'DELETE' })
        await store.loadData(true)
        alert("刪除成功！請確認餘額是否正確被加回去。")
    } catch(e) {
        alert("刪除失敗: " + e)
    }
}
</script>
