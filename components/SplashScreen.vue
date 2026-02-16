<template>
  <div class="fixed inset-0 z-[100] bg-[#F0ECE6] flex items-center justify-center transition-opacity duration-700"
       :class="{ 'opacity-0 pointer-events-none': !show }">
       
    <div class="relative text-center">
        <!-- 品牌花形 LOGO -->
        <div class="w-24 h-24 mx-auto mb-6 animate-bounce-gentle">
          <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-lg">
            <circle cx="100" cy="52" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
            <circle cx="142" cy="76" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
            <circle cx="142" cy="124" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
            <circle cx="100" cy="148" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
            <circle cx="58" cy="124" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
            <circle cx="58" cy="76" r="56" fill="#D5D0C5" stroke="white" stroke-width="6"/>
            <circle cx="100" cy="100" r="10" fill="#1B4588"/>
          </svg>
        </div>
        
        <!-- 品牌文字 -->
        <h1 class="text-lg font-bold text-[#1B4588] tracking-[0.3em] uppercase animate-fade-up">
            TranStation
        </h1>
        <p class="text-[10px] text-[#a09888] tracking-[0.2em] uppercase mt-1 animate-fade-up" style="animation-delay: 0.3s">
            Creative Research Lab
        </p>
        <div class="h-1 w-12 bg-[#1B4588] mx-auto mt-4 rounded-full animate-width-expand"></div>
    </div>

  </div>
</template>

<script setup>
defineProps({
    show: { type: Boolean, default: true }
});
</script>

<style scoped>
.animate-bounce-gentle {
    animation: bounceGentle 2s infinite ease-in-out;
}

.animate-fade-up {
    animation: fadeUp 1s ease-out forwards;
    opacity: 0;
    transform: translateY(10px);
    animation-delay: 0.2s;
}

.animate-width-expand {
    animation: widthExpand 1s ease-out forwards;
    width: 0;
    animation-delay: 0.5s;
}

@keyframes bounceGentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
}

@keyframes widthExpand {
    to { width: 3rem; }
}
</style>
