<template>
  <div class="bg-white rounded-[32px] p-8 shadow-sm border border-[#E8E2D8]">
    <p class="text-[10px] font-bold text-[#a09888] uppercase tracking-[0.2em] mb-5 text-center">{{ title }}</p>

    <!-- 4 個圓點 -->
    <div class="flex justify-center gap-4 mb-6">
      <div v-for="i in 4" :key="i"
        class="w-4 h-4 rounded-full transition-all duration-150"
        :class="input.length >= i ? 'bg-[#1B4588] scale-110' : 'bg-[#E8E2D8]'"
      ></div>
    </div>

    <!-- 錯誤訊息 -->
    <p v-if="error" class="text-rose-500 text-xs font-bold text-center mb-4 animate-shake">{{ error }}</p>

    <!-- 數字鍵盤 -->
    <div class="grid grid-cols-3 gap-3">
      <button v-for="btn in PAD" :key="btn"
        @click="pressKey(btn)"
        class="aspect-square rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-90"
        :class="btn === '←'
          ? 'bg-[#F0ECE6] text-[#a09888] hover:bg-[#E8E2D8]'
          : btn === '' ? 'pointer-events-none'
          : 'bg-white border border-[#E8E2D8] text-[#1B4588] hover:border-[#1B4588]/30 hover:shadow-md'"
      >
        {{ btn }}
      </button>
    </div>

    <!-- 返回 -->
    <button @click="$emit('back')" class="w-full mt-5 text-xs font-bold text-[#a09888] hover:text-[#1B4588] transition-colors">
      ← 返回
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  title: String,
  error: String,
})
const emit = defineEmits(['complete', 'back'])

const PAD = ['1','2','3','4','5','6','7','8','9','','0','←']
const input = ref('')

// 重置當 error 變化（代表外層要求重試）
watch(() => props.error, (val) => {
  if (val) input.value = ''
})

const pressKey = (key) => {
  if (key === '←') {
    input.value = input.value.slice(0, -1)
    return
  }
  if (input.value.length >= 4) return
  input.value += key
  if (input.value.length === 4) {
    const pin = input.value
    input.value = ''
    emit('complete', pin)
  }
}
</script>

<style scoped>
.animate-shake {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
