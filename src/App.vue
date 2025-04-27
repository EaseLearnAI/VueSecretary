<script setup>
import NavBar from './components/layout/NavBar.vue';
</script>

<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <NavBar />
    </div>
</template>

<style>
/* App container style ensuring proper flexbox layout */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 430px;
  margin: 0 auto;
  position: relative;
}

@media (min-width: 768px) {
  #app {
    max-width: 768px;
    padding-left: 80px; /* Space for sidebar */
  }
}

@media (min-width: 1024px) {
  #app {
    max-width: 1024px;
  }
}
</style>
