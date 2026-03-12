<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('cancel')"></div>
        <div class="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative z-10 text-center">
          <div v-if="$slots.icon" class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <slot name="icon" />
          </div>
          <h2 class="text-2xl font-bold text-[#1B4588] mb-2 tracking-tight">{{ title }}</h2>
          <p class="text-xs text-[#a09888] mb-8 leading-relaxed" v-html="message"></p>
          <div class="flex gap-3">
            <button @click="$emit('cancel')" class="flex-1 bg-[#F0ECE6] hover:bg-[#E8E2D8] text-[#a09888] font-bold py-3.5 rounded-full transition-colors">
              {{ cancelText }}
            </button>
            <button @click="$emit('confirm')" :disabled="loading" class="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: String,
  message: String,
  confirmText: { type: String, default: '確定' },
  cancelText: { type: String, default: '取消' },
  loading: Boolean,
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
