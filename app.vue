<template>
  <div class="bg-stationery-light dark:bg-stationery-dark min-h-screen text-ink dark:text-washi-light transition-colors duration-300">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Global Stationery Styles */
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar hiding for clean look */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
