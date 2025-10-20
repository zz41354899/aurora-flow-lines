<template>
  <div ref="canvasContainer" class="canvas-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import p5 from 'p5'

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

const canvasContainer = ref(null)
let p5Instance = null

// Create reactive references for sketch to use
const currentMode = ref(props.mode)
const currentColorMode = ref(props.colorMode)
const currentSpeed = ref(props.speed)
const currentParticleDensity = ref(props.particleDensity)

// Watch props and update reactive references
watch(() => props.mode, (newMode) => {
  currentMode.value = newMode
  // Flash effect on mode change
  if (p5Instance) {
    // Trigger a brief bright flash
    setTimeout(() => {
      if (p5Instance) {
        const p = p5Instance
        p.push()
        p.blendMode(p.BLEND)
        p.fill(255, 255, 255, 30)
        p.noStroke()
        p.rect(0, 0, p.width, p.height)
        p.pop()
      }
    }, 50)
  }
})

watch(() => props.colorMode, (newColorMode) => {
  currentColorMode.value = newColorMode
  // Flash effect on color change
  if (p5Instance) {
    setTimeout(() => {
      if (p5Instance) {
        const p = p5Instance
        const palette = colorPalettes[newColorMode]
        p.push()
        p.blendMode(p.BLEND)
        p.colorMode(p.HSB, 360, 100, 100, 255)
        p.fill(palette.base, 80, 80, 20)
        p.noStroke()
        p.rect(0, 0, p.width, p.height)
        p.pop()
      }
    }, 50)
  }
})

watch(() => props.speed, (newSpeed) => {
  currentSpeed.value = newSpeed
})

watch(() => props.particleDensity, (newDensity) => {
  currentParticleDensity.value = newDensity
})

// Color palettes based on mode
const colorPalettes = {
  calm: { base: 200, range: 40 },    // Blue-green (180-220)
  ripple: { base: 270, range: 60 },  // Purple-pink (240-300)
  storm: { base: 130, range: 60 }    // Green (100-160)
}

// Particle class for flow lines
class Particle {
  constructor(p, maxSpeed) {
    this.p = p
    this.pos = p.createVector(p.random(p.width), p.random(p.height))
    this.vel = p.createVector(0, 0)
    this.acc = p.createVector(0, 0)
    this.maxSpeed = maxSpeed
    this.prevPos = this.pos.copy()
    this.alpha = p.random(50, 150)
    
    // Life cycle properties - will be set by mode
    this.maxLife = 300
    this.life = p.random(0, this.maxLife)
    this.fadeInDuration = 30
    this.fadeOutDuration = 60
    this.dying = false
    this.birthTime = p.frameCount
  }
  
  // Set life cycle based on mode
  setLifeCycleByMode(mode, p) {
    if (mode === 'calm') {
      // Calm: Long, gentle fade
      this.maxLife = p.random(250, 500)
      this.fadeInDuration = p.random(40, 70)
      this.fadeOutDuration = p.random(80, 120)
    } else if (mode === 'ripple') {
      // Ripple: Medium life with smooth transitions
      this.maxLife = p.random(200, 400)
      this.fadeInDuration = p.random(30, 50)
      this.fadeOutDuration = p.random(60, 90)
    } else if (mode === 'storm') {
      // Storm: Short, sharp life
      this.maxLife = p.random(100, 250)
      this.fadeInDuration = p.random(15, 30)
      this.fadeOutDuration = p.random(30, 50)
    }
  }
  
  // Get opacity based on life cycle with smooth easing
  getLifeAlpha() {
    if (this.dying) {
      // Forced fade out when reducing particle count
      const fadeOutProgress = this.life / this.fadeOutDuration
      const easedProgress = this.easeInQuad(fadeOutProgress)
      return Math.max(0, 1 - easedProgress)
    }
    
    if (this.life < this.fadeInDuration) {
      // Fade in with easing
      const progress = this.life / this.fadeInDuration
      return this.easeOutCubic(progress)
    } else if (this.life > this.maxLife - this.fadeOutDuration) {
      // Fade out with easing
      const progress = (this.maxLife - this.life) / this.fadeOutDuration
      return this.easeInQuad(progress)
    }
    
    // Peak life - slight pulsing
    const peakProgress = (this.life - this.fadeInDuration) / (this.maxLife - this.fadeInDuration - this.fadeOutDuration)
    const pulse = this.p.sin(peakProgress * this.p.TWO_PI * 2) * 0.1
    return 1 + pulse
  }
  
  // Easing functions for smooth transitions
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }
  
  easeInQuad(t) {
    return t * t
  }
  
  // Check if particle is completely faded out
  isDead() {
    return this.dying && this.life >= this.fadeOutDuration
  }
  
  // Mark particle for removal
  kill() {
    this.dying = true
    this.life = 0
  }
  
  // Reset particle to new position
  reset() {
    this.pos.x = this.p.random(this.p.width)
    this.pos.y = this.p.random(this.p.height)
    this.prevPos = this.pos.copy()
    this.vel.mult(0)
    this.life = 0
    this.maxLife = this.p.random(150, 400)
    this.fadeInDuration = this.p.random(20, 40)
    this.fadeOutDuration = this.p.random(40, 70)
    this.alpha = this.p.random(50, 150)
    this.birthTime = this.p.frameCount
  }

  update(flowField, cols, rows, scl, speedMultiplier = 1) {
    // Update life
    this.life++
    
    // If dying, don't reset but continue moving
    if (this.dying) {
      // Continue physics update even when dying
      const x = Math.floor(this.pos.x / scl)
      const y = Math.floor(this.pos.y / scl)
      const index = x + y * cols
      
      if (flowField[index]) {
        const force = flowField[index].copy()
        force.mult(speedMultiplier)
        this.acc.add(force)
      }

      this.vel.add(this.acc)
      this.vel.limit(this.maxSpeed * speedMultiplier)
      this.pos.add(this.vel)
      this.acc.mult(0)

      // Wrap around edges
      if (this.pos.x > this.p.width) {
        this.pos.x = 0
        this.prevPos.x = 0
      }
      if (this.pos.x < 0) {
        this.pos.x = this.p.width
        this.prevPos.x = this.p.width
      }
      if (this.pos.y > this.p.height) {
        this.pos.y = 0
        this.prevPos.y = 0
      }
      if (this.pos.y < 0) {
        this.pos.y = this.p.height
        this.prevPos.y = this.p.height
      }
      return
    }
    
    if (this.life >= this.maxLife) {
      this.reset()
    }
    
    const x = Math.floor(this.pos.x / scl)
    const y = Math.floor(this.pos.y / scl)
    const index = x + y * cols
    
    if (flowField[index]) {
      const force = flowField[index].copy()
      force.mult(speedMultiplier)
      this.acc.add(force)
    }

    this.vel.add(this.acc)
    this.vel.limit(this.maxSpeed * speedMultiplier)
    this.pos.add(this.vel)
    this.acc.mult(0)

    // Wrap around edges
    if (this.pos.x > this.p.width) {
      this.pos.x = 0
      this.prevPos.x = 0
    }
    if (this.pos.x < 0) {
      this.pos.x = this.p.width
      this.prevPos.x = this.p.width
    }
    if (this.pos.y > this.p.height) {
      this.pos.y = 0
      this.prevPos.y = 0
    }
    if (this.pos.y < 0) {
      this.pos.y = this.p.height
      this.prevPos.y = this.p.height
    }
  }

  show(hue, saturation, brightness, mode) {
    const lifeAlpha = this.getLifeAlpha()
    
    // Dynamic stroke weight based on life cycle and mode
    const lifeProgress = this.life / this.maxLife
    let baseWeight = 1.5
    let segments = 1  // Number of gradient segments
    
    // Different stroke weights and gradient segments for different modes
    if (mode === 'calm') {
      baseWeight = 1.2
      segments = 3  // Subtle gradient
    } else if (mode === 'ripple') {
      baseWeight = 2.0
      segments = 3  // Reduced from 5 to 3 for better performance
    } else if (mode === 'storm') {
      baseWeight = 1.0
      segments = 2  // Sharp, quick fade
    }
    
    let strokeWeight = baseWeight
    
    if (this.dying) {
      strokeWeight = baseWeight * (1 - this.life / this.fadeOutDuration) * 0.5 + 0.5
    } else if (this.life < this.fadeInDuration) {
      strokeWeight = baseWeight * 0.5 + (this.life / this.fadeInDuration) * baseWeight * 0.5
    } else if (lifeProgress > 0.5) {
      strokeWeight = baseWeight + this.p.sin(lifeProgress * this.p.PI * 4) * 0.2
    }
    
    // Draw gradient trail from previous to current position
    const dx = this.pos.x - this.prevPos.x
    const dy = this.pos.y - this.prevPos.y
    
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments
      const t2 = (i + 1) / segments
      
      const x1 = this.prevPos.x + dx * t1
      const y1 = this.prevPos.y + dy * t1
      const x2 = this.prevPos.x + dx * t2
      const y2 = this.prevPos.y + dy * t2
      
      // Gradient alpha: fades from back to front
      const segmentAlpha = this.alpha * lifeAlpha * (0.3 + t2 * 0.7)
      
      // Gradient weight: thins from back to front
      const segmentWeight = strokeWeight * (0.5 + t2 * 0.5)
      
      this.p.stroke(hue, saturation, brightness, segmentAlpha)
      this.p.strokeWeight(segmentWeight)
      this.p.line(x1, y1, x2, y2)
    }
    
    this.prevPos = this.pos.copy()
  }
}

onMounted(() => {
  const sketch = (p) => {
    let particles = []
    let flowField = []
    let cols, rows
    let scl = 20
    let zoff = 0
    let noiseScale = 0.1
    
    // Track current mode to detect changes
    let previousMode = currentMode.value
    
    // Function to update particle count
    const updateParticleCount = (targetCount) => {
      const currentCount = particles.filter(p => !p.dying).length
      const maxSpeed = currentMode.value === 'storm' ? 3 : currentMode.value === 'ripple' ? 2 : 1.5
      
      // Check if mode changed
      if (previousMode !== currentMode.value) {
        // Recalculate life cycles for all particles
        particles.forEach(particle => {
          particle.setLifeCycleByMode(currentMode.value, p)
        })
        previousMode = currentMode.value
      }
      
      if (targetCount > currentCount) {
        // Add particles with mode-specific life cycle
        for (let i = 0; i < targetCount - currentCount; i++) {
          const particle = new Particle(p, maxSpeed)
          particle.setLifeCycleByMode(currentMode.value, p)
          particles.push(particle)
        }
      } else if (targetCount < currentCount) {
        // Mark excess particles for removal
        let toRemove = currentCount - targetCount
        for (let i = particles.length - 1; i >= 0 && toRemove > 0; i--) {
          if (!particles[i].dying) {
            particles[i].kill()
            toRemove--
          }
        }
      }
      
      // Clean up completely dead particles
      particles = particles.filter(p => !p.isDead())
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight)
      p.colorMode(p.HSB, 360, 100, 100, 255)
      p.background(0, 0, 5)
      p.blendMode(p.ADD)

      cols = Math.floor(p.width / scl)
      rows = Math.floor(p.height / scl)

      // Initialize particles
      updateParticleCount(currentParticleDensity.value)
    }

    p.draw = () => {
      // Update particle count if changed (count only living particles)
      const livingCount = particles.filter(p => !p.dying).length
      
      // Adjust particle count based on mode for optimal performance
      let targetCount = currentParticleDensity.value
      if (currentMode.value === 'ripple') {
        // Ripple mode is more demanding, limit particles
        targetCount = Math.min(currentParticleDensity.value, 1500)
      }
      
      if (livingCount !== targetCount) {
        updateParticleCount(targetCount)
      }

      // Fade background for trail effect - varies by mode
      p.blendMode(p.BLEND)
      let fadeAmount = 25 + currentSpeed.value * 4
      
      // Different fade rates for different modes
      if (currentMode.value === 'calm') {
        fadeAmount = 20 + currentSpeed.value * 3  // Moderate fade
      } else if (currentMode.value === 'ripple') {
        fadeAmount = 18 + currentSpeed.value * 3  // Slightly slower for flow
      } else if (currentMode.value === 'storm') {
        fadeAmount = 30 + currentSpeed.value * 5  // Fast fade for clean energy
      }
      
      p.fill(0, 0, 5, fadeAmount)
      p.noStroke()
      p.rect(0, 0, p.width, p.height)
      p.blendMode(p.ADD)

      // Update flow field based on Perlin noise and trigonometric functions
      const adjustedSpeed = currentSpeed.value * 0.01
      zoff += adjustedSpeed
      
      // Multi-layered time parameters for rich variation
      const time = p.frameCount * 0.02 * currentSpeed.value
      const slowTime = p.frameCount * 0.005 * currentSpeed.value
      const fastTime = p.frameCount * 0.08 * currentSpeed.value
      
      // Dynamic wave parameters that evolve over time
      const waveFreq = 0.05 * (0.5 + currentSpeed.value * 0.5)
      const waveAmp = 0.3 * currentSpeed.value

      // Generate flow field with multiple layers
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = x + y * cols
          
          const noiseX = x * noiseScale
          const noiseY = y * noiseScale
          
          // Multi-octave Perlin noise for base flow
          let angle = p.noise(noiseX, noiseY, zoff) * p.TWO_PI * 2
          angle += p.noise(noiseX * 2, noiseY * 2, zoff * 0.5) * p.PI
          angle += p.noise(noiseX * 0.5, noiseY * 0.5, zoff * 1.5) * p.PI * 0.5
          
          // Mode-specific flow patterns with enhanced dynamics
          if (currentMode.value === 'calm') {
            // Calm: Layered gentle waves with breathing effect
            const breathe = p.sin(slowTime) * 0.5 + 0.5
            const xWave = p.sin(x * waveFreq + time) * waveAmp * (0.3 + breathe * 0.4)
            const yWave = p.cos(y * waveFreq * 0.5 + time * 0.3) * waveAmp * 0.3
            const diagonalWave = p.sin((x + y) * 0.03 + slowTime) * 0.4
            angle += xWave + yWave + diagonalWave
            
            // Subtle drift zones
            const driftX = p.sin(slowTime * 0.3) * cols * 0.4 + cols / 2
            const driftY = p.cos(slowTime * 0.3) * rows * 0.4 + rows / 2
            const driftDist = p.dist(x, y, driftX, driftY)
            if (driftDist < 15) {
              const driftAngle = Math.atan2(y - driftY, x - driftX)
              angle += p.sin(driftAngle + slowTime) * 0.6
            }
            
          } else if (currentMode.value === 'ripple') {
            // Ripple: Multiple interference patterns
            const centerX = cols / 2
            const centerY = rows / 2
            
            // Primary ripple from center
            const dist = p.dist(x, y, centerX, centerY)
            const ripple1 = p.sin(dist * 0.3 - time * 2) * 1.5
            
            // Secondary ripple sources that move
            const ripple2X = p.sin(slowTime * 0.7) * cols * 0.3 + cols / 2
            const ripple2Y = p.cos(slowTime * 0.7) * rows * 0.3 + rows / 2
            const dist2 = p.dist(x, y, ripple2X, ripple2Y)
            const ripple2 = p.sin(dist2 * 0.4 - time * 1.5 + p.PI) * 1.2
            
            const ripple3X = p.cos(slowTime * 0.5 + p.PI) * cols * 0.25 + cols / 2
            const ripple3Y = p.sin(slowTime * 0.5 + p.PI) * rows * 0.25 + rows / 2
            const dist3 = p.dist(x, y, ripple3X, ripple3Y)
            const ripple3 = p.sin(dist3 * 0.35 - time * 1.8) * 0.8
            
            angle += ripple1 + ripple2 + ripple3
            
            // Rotating spiral effect
            const angleToCenter = Math.atan2(y - centerY, x - centerX)
            const spiralStrength = p.sin(time * 0.5) * 0.5 + 0.5
            angle += p.sin(time + angleToCenter * 2) * (0.8 + spiralStrength * 0.6)
            
            // Radial pulsing
            const pulse = p.sin(dist * 0.1 + fastTime) * 0.4
            angle += pulse
            
          } else if (currentMode.value === 'storm') {
            // Storm: Multi-scale turbulence with dynamic vortices
            const turbulence1 = p.noise(x * 0.1, y * 0.1, zoff * 3) * p.TWO_PI
            const turbulence2 = p.noise(x * 0.05 + 100, y * 0.05 + 100, zoff * 2) * p.PI
            const turbulence3 = p.noise(x * 0.15 + 200, y * 0.15 + 200, zoff * 4) * p.PI * 0.5
            angle += turbulence1 + turbulence2 + turbulence3
            
            // Multiple moving vortices
            const vortex1X = p.sin(time * 0.5) * cols * 0.3 + cols / 2
            const vortex1Y = p.cos(time * 0.5) * rows * 0.3 + rows / 2
            const vortex1Dist = p.dist(x, y, vortex1X, vortex1Y)
            
            const vortex2X = p.cos(time * 0.3 + p.PI) * cols * 0.35 + cols / 2
            const vortex2Y = p.sin(time * 0.3 + p.PI) * rows * 0.35 + rows / 2
            const vortex2Dist = p.dist(x, y, vortex2X, vortex2Y)
            
            // Vortex 1 influence
            if (vortex1Dist < 25) {
              const vortexAngle = Math.atan2(y - vortex1Y, x - vortex1X)
              const strength = (25 - vortex1Dist) / 25
              angle += (vortexAngle + p.PI / 2) * strength * 2
            }
            
            // Vortex 2 influence (counter-rotating)
            if (vortex2Dist < 20) {
              const vortexAngle = Math.atan2(y - vortex2Y, x - vortex2X)
              const strength = (20 - vortex2Dist) / 20
              angle -= (vortexAngle + p.PI / 2) * strength * 1.5
            }
            
            // Chaotic shear zones
            const shear = p.sin(x * 0.08 + fastTime) * p.cos(y * 0.08 + fastTime * 0.7) * 1.2
            angle += shear
            
            // Random turbulent bursts
            const burstNoise = p.noise(x * 0.2, y * 0.2, zoff * 5)
            if (burstNoise > 0.7) {
              angle += (burstNoise - 0.7) * p.TWO_PI * 3
            }
          }

          const v = p5.Vector.fromAngle(angle)
          v.setMag(0.5)
          flowField[index] = v
        }
      }

      // Get color palette
      const palette = colorPalettes[currentColorMode.value]
      const baseHue = palette.base
      const hueRange = palette.range

      // Global color evolution over time
      const globalHueShift = p.sin(slowTime * 0.3) * hueRange * 0.6
      const globalSatShift = p.sin(slowTime * 0.4 + 1) * 15
      const globalBrightShift = p.sin(slowTime * 0.5 + 2) * 10

      // Update and draw particles (with speed multiplier)
      particles.forEach((particle, i) => {
        particle.update(flowField, cols, rows, scl, currentSpeed.value)
        
        // Dynamic color based on time and position
        // 1. Global time-based shift (slow evolution)
        const timeShift = p.sin(p.frameCount * 0.01) * hueRange * 0.5
        
        // 2. Position-based gradient
        const posShift = (particle.pos.x / p.width) * hueRange * 0.3
        const posShiftY = (particle.pos.y / p.height) * hueRange * 0.2
        
        // 3. Particle-specific variation
        const particleShift = p.sin(p.frameCount * 0.02 + i * 0.5) * hueRange * 0.25
        
        // 4. Life cycle color shift (changes as particle ages)
        const lifeProgress = particle.life / particle.maxLife
        const lifeShift = p.sin(lifeProgress * p.TWO_PI) * hueRange * 0.3
        
        // Combine all hue shifts
        const hue = (baseHue + globalHueShift + timeShift + posShift + posShiftY + particleShift + lifeShift) % 360
        
        // Saturation and brightness vary dramatically by mode
        let saturation = 80
        let brightness = 60
        
        if (currentMode.value === 'calm') {
          // Calm: Soft, gentle glow - subtle and peaceful
          saturation = 55
          brightness = 35 + p.sin(p.frameCount * 0.01 + i * 0.1) * 6
          particle.alpha = p.lerp(particle.alpha, 80, 0.1)
          
        } else if (currentMode.value === 'ripple') {
          // Ripple: Wave-like aurora curtains - flowing and ethereal
          saturation = 75
          const pulse = p.sin(p.frameCount * 0.05 + i * 0.05)
          const wave = p.sin(p.frameCount * 0.02 + particle.pos.x * 0.01)
          brightness = 55 + pulse * 20 + wave * 15
          
          // Create aurora curtain effect with varying alpha
          const curtainAlpha = 100 + pulse * 40 + wave * 30
          particle.alpha = p.lerp(particle.alpha, curtainAlpha, 0.15)
          
        } else if (currentMode.value === 'storm') {
          // Storm: Intense, sharp energy - bright and dynamic
          saturation = 90
          const flicker = p.sin(p.frameCount * 0.1 + i * 0.02) * p.sin(p.frameCount * 0.07 + i * 0.03)
          brightness = 75 + flicker * 25
          particle.alpha = p.lerp(particle.alpha, 150 + flicker * 30, 0.1)
        }

        particle.show(hue, saturation, brightness, currentMode.value)
      })
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight)
      cols = Math.floor(p.width / scl)
      rows = Math.floor(p.height / scl)
    }

  }

  p5Instance = new p5(sketch, canvasContainer.value)
})

onBeforeUnmount(() => {
  if (p5Instance) {
    p5Instance.remove()
  }
})

// Watch for prop changes
watch(() => props.mode, () => {
  // Adjust particle speeds when mode changes
  if (p5Instance) {
    // Mode change will be reflected in next draw cycle
  }
})
</script>
