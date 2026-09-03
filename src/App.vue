<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <NavBar />

  <main>
    <div class="album py-5 bg-body-tertiary">
      <div class="container">
        <RouterView />
      </div>
    </div>
  </main>

  <footer class="text-body-secondary py-5">
    <div class="container">
      <p class="float-end mb-1"><a href="#">Back to top</a></p>
      <p class="mb-1">
        Album example is © Bootstrap, but please download and customize it for yourself!
      </p>
      <p class="mb-0">
        New to Bootstrap? <a href="https://getbootstrap.com/">Visit the homepage</a> or read our
        <a href="https://getbootstrap.com/docs/5.3/getting-started/introduction"
          >getting started guide</a
        >.
      </p>
    </div>
  </footer>
</template>
