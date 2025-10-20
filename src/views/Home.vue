<template>
  <div class="home">
    <!-- P5.js Canvas -->
    <P5Canvas 
      :mode="mode"
      :colorMode="colorMode"
      :speed="speed"
      :particleDensity="particleDensity"
    />
    
    <!-- Control Panel -->
    <ControlPanel 
      :mode="mode"
      :colorMode="colorMode"
      :speed="speed"
      :particleDensity="particleDensity"
      @update:mode="mode = $event"
      @update:colorMode="colorMode = $event"
      @update:speed="speed = $event"
      @update:particleDensity="particleDensity = $event"
    />
    
    <!-- Info Text -->
    <div class="info-text">
      <p><strong>⌨️ Keys 1-3:</strong> Switch modes</p>
      <p><strong>🖱️ Hover right:</strong> Open controls</p>
      <p><strong>🌊 Flow:</strong> Trigonometric waves</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import P5Canvas from '../components/P5Canvas.vue'
import ControlPanel from '../components/ControlPanel.vue'

const mode = ref('calm')
const colorMode = ref('calm')
const speed = ref(1)
const particleDensity = ref(1000)
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
</style>
