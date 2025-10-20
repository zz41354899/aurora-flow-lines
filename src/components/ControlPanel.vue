<template>
  <!-- Control Panel -->
  <div class="modern-control-panel">
    <div class="panel-content">
      <div class="panel-header">
        <div class="header-icon">✨</div>
        <h2>Aurora Flow</h2>
      </div>
    
    <!-- Mode Selection -->
    <div class="control-section">
      <div class="section-label">
        <span class="label-icon">🌊</span>
        <span>Flow Mode</span>
      </div>
      <div class="mode-grid">
        <button 
          class="mode-card"
          :class="{ active: currentMode === 'calm' }"
          @click="changeMode('calm')"
        >
          <div class="card-icon">🌙</div>
          <div class="card-title">Calm</div>
          <div class="card-desc">Peaceful flow</div>
        </button>
        <button 
          class="mode-card"
          :class="{ active: currentMode === 'ripple' }"
          @click="changeMode('ripple')"
        >
          <div class="card-icon">💫</div>
          <div class="card-title">Ripple</div>
          <div class="card-desc">Wave effect</div>
        </button>
        <button 
          class="mode-card"
          :class="{ active: currentMode === 'storm' }"
          @click="changeMode('storm')"
        >
          <div class="card-icon">⚡</div>
          <div class="card-title">Storm</div>
          <div class="card-desc">Energy burst</div>
        </button>
      </div>
    </div>

    <!-- Color Mode Selection -->
    <div class="control-section">
      <div class="section-label">
        <span class="label-icon">🎨</span>
        <span>Color Theme</span>
      </div>
      <div class="color-grid">
        <button 
          class="color-card calm-theme"
          :class="{ active: currentColorMode === 'calm' }"
          @click="changeColorMode('calm')"
        >
          <div class="color-preview">
            <div class="color-bar" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"></div>
          </div>
          <div class="color-name">Arctic</div>
        </button>
        <button 
          class="color-card ripple-theme"
          :class="{ active: currentColorMode === 'ripple' }"
          @click="changeColorMode('ripple')"
        >
          <div class="color-preview">
            <div class="color-bar" style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"></div>
          </div>
          <div class="color-name">Dream</div>
        </button>
        <button 
          class="color-card storm-theme"
          :class="{ active: currentColorMode === 'storm' }"
          @click="changeColorMode('storm')"
        >
          <div class="color-preview">
            <div class="color-bar" style="background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)"></div>
          </div>
          <div class="color-name">Energy</div>
        </button>
      </div>
    </div>

    <!-- Speed Control -->
    <div class="control-section">
      <div class="section-label">
        <span class="label-icon">⚡</span>
        <span>Flow Speed</span>
        <span class="speed-value">{{ currentSpeed.toFixed(1) }}x</span>
      </div>
      <div class="modern-slider">
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1" 
          :value="currentSpeed"
          @input="changeSpeed($event.target.value)"
          class="slider-input"
        />
        <div class="slider-track">
          <div class="slider-fill" :style="{ width: ((currentSpeed - 0.1) / 2.9 * 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Particle Density Control -->
    <div class="control-section">
      <div class="section-label">
        <span class="label-icon">✨</span>
        <span>Particle Density</span>
        <span class="speed-value">{{ currentParticleDensity }}</span>
      </div>
      <div class="modern-slider">
        <input 
          type="range" 
          min="200" 
          max="2000" 
          step="100" 
          :value="currentParticleDensity"
          @input="changeParticleDensity($event.target.value)"
          class="slider-input"
        />
        <div class="slider-track">
          <div class="slider-fill" :style="{ width: ((currentParticleDensity - 200) / 1800 * 100) + '%' }"></div>
        </div>
      </div>
    </div>

      <div class="panel-footer">
        <div class="footer-text">Trigonometric Aurora</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'calm'
  },
  colorMode: {
    type: String,
    default: 'calm'
  },
  speed: {
    type: Number,
    default: 1
  },
  particleDensity: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['update:mode', 'update:colorMode', 'update:speed', 'update:particleDensity'])

const currentMode = ref(props.mode)
const currentColorMode = ref(props.colorMode)
const currentSpeed = ref(props.speed)
const currentParticleDensity = ref(props.particleDensity)

// Watch for prop changes to sync internal state
watch(() => props.mode, (newMode) => {
  currentMode.value = newMode
})

watch(() => props.colorMode, (newColorMode) => {
  currentColorMode.value = newColorMode
})

watch(() => props.speed, (newSpeed) => {
  currentSpeed.value = newSpeed
})

watch(() => props.particleDensity, (newDensity) => {
  currentParticleDensity.value = newDensity
})

const changeMode = (mode) => {
  currentMode.value = mode
  emit('update:mode', mode)
}

const changeColorMode = (colorMode) => {
  currentColorMode.value = colorMode
  emit('update:colorMode', colorMode)
}

const changeSpeed = (speed) => {
  currentSpeed.value = parseFloat(speed)
  emit('update:speed', currentSpeed.value)
}

const changeParticleDensity = (density) => {
  currentParticleDensity.value = parseInt(density)
  emit('update:particleDensity', currentParticleDensity.value)
}

// Keyboard shortcuts listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === '1') {
      changeMode('calm')
    } else if (e.key === '2') {
      changeMode('ripple')
    } else if (e.key === '3') {
      changeMode('storm')
    }
  })
}
</script>
