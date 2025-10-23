export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  alpha: number
}

export interface ParticleEffect {
  particles: Particle[]
  isActive: boolean
  element: HTMLElement
}

export class ParticleSystem {
  private effects: Map<string, ParticleEffect> = new Map()
  private animationId: number | null = null
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    this.startAnimation()
  }

  // 创建匹配消除粒子效果
  createMatchEffect(x: number, y: number, color: string, count: number = 8): void {
    const effectId = `match_${Date.now()}_${Math.random()}`
    const element = this.createEffectElement(effectId)
    
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 6 + 4,
        alpha: 1
      })
    }

    this.effects.set(effectId, {
      particles,
      isActive: true,
      element
    })

    // 自动清理
    setTimeout(() => {
      this.removeEffect(effectId)
    }, 1500)
  }

  // 创建连击粒子效果
  createComboEffect(x: number, y: number, comboCount: number): void {
    const effectId = `combo_${Date.now()}_${Math.random()}`
    const element = this.createEffectElement(effectId)
    
    const particles: Particle[] = []
    const particleCount = Math.min(comboCount * 3, 20)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = Math.random() * 8 + 4
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color: this.getComboColor(comboCount),
        size: Math.random() * 8 + 6,
        alpha: 1
      })
    }

    this.effects.set(effectId, {
      particles,
      isActive: true,
      element
    })

    // 显示连击文字
    this.showComboText(x, y, comboCount)

    setTimeout(() => {
      this.removeEffect(effectId)
    }, 2000)
  }

  // 创建下落粒子效果
  createFallEffect(x: number, y: number, color: string, count: number = 4): void {
    const effectId = `fall_${Date.now()}_${Math.random()}`
    const element = this.createEffectElement(effectId)
    
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 4 + 2,
        alpha: 0.8
      })
    }

    this.effects.set(effectId, {
      particles,
      isActive: true,
      element
    })

    setTimeout(() => {
      this.removeEffect(effectId)
    }, 800)
  }

  // 创建胜利粒子效果
  createVictoryEffect(x: number, y: number): void {
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#4ECDC4', '#45B7D1', '#96CEB4']
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createFireworkEffect(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 100, colors[i % colors.length])
      }, i * 300)
    }
  }

  // 创建烟花效果
  private createFireworkEffect(x: number, y: number, color: string): void {
    const effectId = `firework_${Date.now()}_${Math.random()}`
    const element = this.createEffectElement(effectId)
    
    const particles: Particle[] = []
    const particleCount = 15
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = Math.random() * 12 + 6
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 6 + 3,
        alpha: 1
      })
    }

    this.effects.set(effectId, {
      particles,
      isActive: true,
      element
    })

    setTimeout(() => {
      this.removeEffect(effectId)
    }, 2000)
  }

  // 创建工具使用粒子效果
  createToolEffect(x: number, y: number, toolType: string): void {
    const effectId = `tool_${toolType}_${Date.now()}_${Math.random()}`
    const element = this.createEffectElement(effectId)
    
    const particles: Particle[] = []
    const colors = {
      hammer: '#FF6B6B',
      swapper: '#4ECDC4',
      rainbowBall: '#A55EEA'
    }
    
    const color = colors[toolType as keyof typeof colors] || '#FFD93D'
    const particleCount = toolType === 'rainbowBall' ? 20 : 12
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const speed = toolType === 'rainbowBall' ? Math.random() * 15 + 8 : Math.random() * 10 + 5
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 8 + 4,
        alpha: 1
      })
    }

    this.effects.set(effectId, {
      particles,
      isActive: true,
      element
    })

    setTimeout(() => {
      this.removeEffect(effectId)
    }, 1500)
  }

  // 显示连击文字
  private showComboText(x: number, y: number, comboCount: number): void {
    const textElement = document.createElement('div')
    textElement.className = 'combo-text'
    textElement.textContent = `${comboCount}连击!`
    textElement.style.left = `${x}px`
    textElement.style.top = `${y}px`
    textElement.style.color = this.getComboColor(comboCount)
    
    this.container.appendChild(textElement)
    
    setTimeout(() => {
      if (textElement.parentNode) {
        textElement.parentNode.removeChild(textElement)
      }
    }, 1500)
  }

  // 获取连击颜色
  private getComboColor(comboCount: number): string {
    if (comboCount >= 10) return '#FF4757'
    if (comboCount >= 7) return '#FFA502'
    if (comboCount >= 5) return '#2ED573'
    if (comboCount >= 3) return '#3742FA'
    return '#A4B0BE'
  }

  // 创建效果元素
  private createEffectElement(effectId: string): HTMLElement {
    const element = document.createElement('div')
    element.className = 'particle-effect'
    element.id = effectId
    element.style.position = 'absolute'
    element.style.top = '0'
    element.style.left = '0'
    element.style.width = '100%'
    element.style.height = '100%'
    element.style.pointerEvents = 'none'
    element.style.zIndex = '1000'
    
    this.container.appendChild(element)
    return element
  }

  // 移除效果
  private removeEffect(effectId: string): void {
    const effect = this.effects.get(effectId)
    if (effect) {
      if (effect.element.parentNode) {
        effect.element.parentNode.removeChild(effect.element)
      }
      this.effects.delete(effectId)
    }
  }

  // 动画循环
  private startAnimation(): void {
    const animate = () => {
      this.updateParticles()
      this.renderParticles()
      this.animationId = requestAnimationFrame(animate)
    }
    animate()
  }

  // 更新粒子
  private updateParticles(): void {
    this.effects.forEach((effect, effectId) => {
      effect.particles.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.vx
        particle.y += particle.vy
        
        // 添加重力
        particle.vy += 0.3
        
        // 减少生命值
        particle.life -= 0.02
        particle.alpha = particle.life
        
        // 移除死亡的粒子
        if (particle.life <= 0) {
          effect.particles.splice(index, 1)
        }
      })
      
      // 如果没有粒子了，移除效果
      if (effect.particles.length === 0) {
        this.removeEffect(effectId)
      }
    })
  }

  // 渲染粒子
  private renderParticles(): void {
    this.effects.forEach((effect) => {
      const canvas = this.getCanvas(effect.element)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制粒子
      effect.particles.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.alpha
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        // 添加发光效果
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.fill()
        
        ctx.restore()
      })
    })
  }

  // 获取或创建画布
  private getCanvas(element: HTMLElement): HTMLCanvasElement {
    let canvas = element.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = element.offsetWidth || 800
      canvas.height = element.offsetHeight || 600
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      element.appendChild(canvas)
    }
    return canvas
  }

  // 清理所有效果
  clearAllEffects(): void {
    this.effects.forEach((effect, effectId) => {
      this.removeEffect(effectId)
    })
  }

  // 销毁粒子系统
  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.clearAllEffects()
  }
}

// 全局粒子系统实例
let particleSystem: ParticleSystem | null = null

export function initializeParticleSystem(container: HTMLElement): ParticleSystem {
  if (particleSystem) {
    particleSystem.destroy()
  }
  particleSystem = new ParticleSystem(container)
  return particleSystem
}

export function getParticleSystem(): ParticleSystem | null {
  return particleSystem
}