<template>
  <div class="story-modal" @click="closeStory" ref="storyModalRef">
    <!-- 粒子效果画布 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>
    
    <!-- 水果背景装饰 -->
    <div class="fruit-background">
      <div 
        v-for="(fruit, index) in currentChapter?.fruitIcons || []" 
        :key="index"
        :class="['floating-fruit', `fruit-${index}`]"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        {{ fruit }}
      </div>
    </div>
    
    <div class="story-container" :class="`theme-${currentChapter?.fruitTheme}`" @click.stop>
      <div class="story-header" :class="`theme-${currentChapter?.fruitTheme}`">
        <h2 class="story-title">{{ currentChapter?.title }}</h2>
        <button class="close-btn" @click="closeStory">×</button>
      </div>
      
      <div class="story-content">
        <!-- 故事图片 -->
        <div class="story-image-container" v-if="currentChapter?.storyImage">
          <div class="story-image">{{ currentChapter.storyImage }}</div>
          <div class="image-glow"></div>
        </div>
        
        <div class="character-info" v-if="character">
          <div class="character-avatar-container">
            <div class="character-avatar">{{ character.avatar }}</div>
            <div class="avatar-glow"></div>
            <div class="character-sparkles">
              <div class="sparkle sparkle-1">✨</div>
              <div class="sparkle sparkle-2">✨</div>
              <div class="sparkle sparkle-3">✨</div>
            </div>
          </div>
          <div class="character-details">
            <div class="character-name">
              {{ character.name }}
              <div class="name-underline"></div>
            </div>
            <div class="character-description">{{ character.description }}</div>
          </div>
        </div>
        
        <!-- 角色对话 -->
        <div class="character-dialogue" v-if="currentChapter?.characterDialogue">
          <div class="dialogue-bubble">
            <div class="dialogue-text">{{ currentChapter.characterDialogue }}</div>
            <div class="dialogue-tail"></div>
          </div>
        </div>
        
        <div class="story-text">
          <p v-for="(paragraph, index) in paragraphs" :key="index" class="story-paragraph" :style="{ animationDelay: `${index * 0.2}s` }">
            {{ paragraph }}
          </p>
        </div>
        
        <div class="story-progress">
          <div class="progress-indicator">
            第 {{ currentChapter?.id }} 章 / 共 {{ totalChapters }} 章
          </div>
          <div class="progress-dots">
            <span 
              v-for="i in totalChapters" 
              :key="i"
              :class="['progress-dot', { 
                'current': i === currentChapter?.id,
                'completed': isChapterRead(i),
                'locked': !isChapterUnlocked(i) && i !== currentChapter?.id
              }]"
            ></span>
          </div>
        </div>
      </div>
      
      <div class="story-actions">
        <button 
          v-if="showSkipButton" 
          class="btn btn-secondary" 
          @click="skipStory"
        >
          跳过剧情
        </button>
        <button 
          v-if="hasPreviousChapter" 
          class="btn btn-outline" 
          @click="previousChapter"
        >
          上一章
        </button>
        <button 
          class="btn btn-primary" 
          @click="nextOrContinue"
        >
          {{ isLastChapter ? '继续冒险' : '下一章' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { STORY_CHAPTERS, CHARACTERS, type StoryChapter, type Character } from '../types/story'
import { useGameStore } from '../stores/game'

interface Props {
  chapterId?: number
  showSkip?: boolean
  autoClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSkip: true,
  autoClose: true
})

const emit = defineEmits<{
  close: []
  chapterComplete: [chapterId: number]
  storyComplete: []
}>()

const gameStore = useGameStore()
const { playerData } = gameStore

const currentChapterId = ref(props.chapterId || 1)
const isTyping = ref(false)
const showSkipButton = ref(props.showSkip)
const storyModalRef = ref<HTMLElement>()
const particleCanvas = ref<HTMLCanvasElement>()
let animationId: number | null = null
let particles: StoryParticle[] = []

interface StoryParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  emoji: string
  life: number
  maxLife: number
  rotation: number
  rotationSpeed: number
}

const currentChapter = computed(() => {
  return STORY_CHAPTERS.find(chapter => chapter.id === currentChapterId.value)
})

const character = computed(() => {
  if (!currentChapter.value?.character) return null
  return CHARACTERS.find(char => char.name === currentChapter.value?.character)
})

const paragraphs = computed(() => {
  if (!currentChapter.value?.content) return []
  return currentChapter.value.content.split('\n').filter(p => p.trim())
})

const totalChapters = computed(() => STORY_CHAPTERS.length)

const hasPreviousChapter = computed(() => {
  return currentChapterId.value > 1
})

const isLastChapter = computed(() => {
  return currentChapterId.value >= totalChapters.value
})

const closeStory = () => {
  emit('close')
}

const skipStory = () => {
  emit('close')
}

const previousChapter = () => {
  if (hasPreviousChapter.value) {
    const previousChapterId = currentChapterId.value - 1
    if (isChapterUnlocked(previousChapterId)) {
      currentChapterId.value = previousChapterId
      markChapterAsRead()
      createChapterTransitionEffect()
    }
  }
}

const nextOrContinue = () => {
  markChapterAsRead()
  
  if (isLastChapter.value) {
    emit('storyComplete')
    createVictoryEffect()
    if (props.autoClose) {
      setTimeout(() => {
        emit('close')
      }, 2000)
    }
  } else {
    // 检查下一章是否已解锁
    const nextChapterId = currentChapterId.value + 1
    const nextChapter = STORY_CHAPTERS.find(ch => ch.id === nextChapterId)
    
    if (nextChapter && isChapterUnlocked(nextChapterId)) {
      createChapterTransitionEffect()
      setTimeout(() => {
        currentChapterId.value = nextChapterId
        emit('chapterComplete', currentChapterId.value - 1)
      }, 500)
    } else {
      // 下一章未解锁，直接关闭
      emit('close')
    }
  }
}

const markChapterAsRead = () => {
  if (currentChapter.value) {
    // 使用游戏存储的统一方法标记章节为已读
    gameStore.markChapterAsRead(currentChapter.value.id)
  }
}

const getStoryProgress = () => {
  const saved = localStorage.getItem('storyProgress')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (error) {
      console.warn('Failed to load story progress:', error)
    }
  }
  return {
    currentChapter: 1,
    unlockedChapters: [1],
    readChapters: [],
    lastReadChapter: null
  }
}

const isChapterUnlocked = (chapterId: number): boolean => {
  // 使用游戏存储中的统一进度管理
  const gameStore = useGameStore()
  const unlockedChapters = gameStore.getUnlockedChapters()
  return unlockedChapters.includes(chapterId)
}

const isChapterRead = (chapterId: number): boolean => {
  // 使用游戏存储中的统一进度管理
  const gameStore = useGameStore()
  const unreadChapters = gameStore.getUnreadChapters()
  return !unreadChapters.includes(chapterId)
}

const saveStoryProgress = (progress: any) => {
  localStorage.setItem('storyProgress', JSON.stringify(progress))
}

// 创建水果粒子效果
const createFruitParticle = (emoji: string, x: number, y: number): StoryParticle => {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4 - 2,
    size: Math.random() * 20 + 15,
    emoji,
    life: 1,
    maxLife: 1,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1
  }
}

// 创建章节过渡效果
const createChapterTransitionEffect = () => {
  if (!particleCanvas.value) return
  
  const fruitIcons = currentChapter.value?.fruitIcons || ['🌟']
  const centerX = particleCanvas.value.width / 2
  const centerY = particleCanvas.value.height / 2
  
  for (let i = 0; i < 12; i++) {
    const emoji = fruitIcons[i % fruitIcons.length]
    const angle = (i / 12) * Math.PI * 2
    const distance = 100
    
    particles.push(createFruitParticle(
      emoji,
      centerX + Math.cos(angle) * distance,
      centerY + Math.sin(angle) * distance
    ))
  }
}

// 创建胜利效果
const createVictoryEffect = () => {
  if (!particleCanvas.value) return
  
  const celebrationEmojis = ['🎉', '🎊', '🏆', '👑', '✨', '🌟']
  const centerX = particleCanvas.value.width / 2
  const centerY = particleCanvas.value.height / 2
  
  for (let i = 0; i < 20; i++) {
    const emoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)]
    particles.push(createFruitParticle(emoji, centerX, centerY))
  }
}

// 创建背景粒子效果
const createBackgroundParticles = () => {
  if (!particleCanvas.value || !currentChapter.value?.fruitIcons) return
  
  const fruitIcons = currentChapter.value.fruitIcons
  const canvas = particleCanvas.value
  
  // 随机生成背景粒子
  if (Math.random() < 0.02 && particles.length < 15) {
    const emoji = fruitIcons[Math.floor(Math.random() * fruitIcons.length)]
    particles.push(createFruitParticle(
      emoji,
      Math.random() * canvas.width,
      canvas.height + 30
    ))
  }
}

// 更新粒子
const updateParticles = () => {
  particles = particles.filter(particle => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vy += 0.1 // 重力效果
    particle.life -= 0.01
    particle.rotation += particle.rotationSpeed
    
    return particle.life > 0
  })
  
  createBackgroundParticles()
}

// 渲染粒子
const renderParticles = () => {
  if (!particleCanvas.value) return
  
  const ctx = particleCanvas.value.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, particleCanvas.value.width, particleCanvas.value.height)
  
  particles.forEach(particle => {
    ctx.save()
    ctx.globalAlpha = particle.life
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)
    ctx.font = `${particle.size}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 添加阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    ctx.fillText(particle.emoji, 0, 0)
    ctx.restore()
  })
}

// 动画循环
const animate = () => {
  updateParticles()
  renderParticles()
  animationId = requestAnimationFrame(animate)
}

// 设置画布大小
const setupCanvas = () => {
  if (!particleCanvas.value || !storyModalRef.value) return
  
  const rect = storyModalRef.value.getBoundingClientRect()
  particleCanvas.value.width = rect.width
  particleCanvas.value.height = rect.height
}

// 监听章节ID变化
watch(() => props.chapterId, (newId) => {
  if (newId) {
    currentChapterId.value = newId
    nextTick(() => {
      createChapterTransitionEffect()
    })
  }
})

// 监听当前章节变化
watch(currentChapter, () => {
  nextTick(() => {
    createChapterTransitionEffect()
  })
})

// 初始化
const initStory = () => {
  // 使用游戏存储的统一进度管理
  const gameStore = useGameStore()
  const progress = gameStore.getStoryProgress()
  
  // 确保第一章是未读状态（如果是新游戏）
  const firstChapter = STORY_CHAPTERS.find(ch => ch.id === 1)
  if (firstChapter && !gameStore.getUnreadChapters().includes(1)) {
    firstChapter.isRead = false
  }
  
  if (!props.chapterId) {
    currentChapterId.value = progress.currentChapter
  }
  showSkipButton.value = props.showSkip
  
  nextTick(() => {
    setupCanvas()
    animate()
    createChapterTransitionEffect()
  })
}

onMounted(() => {
  initStory()
  
  // 监听窗口大小变化
  window.addEventListener('resize', setupCanvas)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', setupCanvas)
})
</script>

<style scoped>
.story-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.5s ease-out;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 粒子效果画布 */
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 水果背景装饰 */
.fruit-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-fruit {
  position: absolute;
  font-size: 30px;
  opacity: 0.7;
  animation: float 8s infinite ease-in-out;
  user-select: none;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-30px) rotate(3deg);
  }
}

.fruit-0 { top: 10%; left: 10%; animation-duration: 7s; }
.fruit-1 { top: 20%; right: 15%; animation-duration: 9s; }
.fruit-2 { top: 70%; left: 8%; animation-duration: 8s; }
.fruit-3 { top: 60%; right: 12%; animation-duration: 10s; }
.fruit-4 { top: 40%; left: 5%; animation-duration: 11s; }
.fruit-5 { top: 80%; right: 8%; animation-duration: 6s; }
.fruit-6 { top: 30%; left: 85%; animation-duration: 7.5s; }
.fruit-7 { top: 50%; right: 5%; animation-duration: 8.5s; }
.fruit-8 { top: 15%; left: 45%; animation-duration: 9.5s; }

.story-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 不同水果主题的头部样式 */
.story-header {
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.story-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.theme-mixed-fruits {
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
}

.theme-strawberry {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
}

.theme-lemon {
  background: linear-gradient(135deg, #f7b731 0%, #f5a623 100%);
}

.theme-orange {
  background: linear-gradient(135deg, #ff9f43 0%, #ff6348 100%);
}

.theme-apple {
  background: linear-gradient(135deg, #ff4757 0%, #c44569 100%);
}

.theme-grape {
  background: linear-gradient(135deg, #a55eea 0%, #8854d0 100%);
}

.theme-blueberry {
  background: linear-gradient(135deg, #4834d4 0%, #686de0 100%);
}

.theme-rainbow {
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #ffeaa7 100%);
  animation: rainbowShift 5s ease-in-out infinite;
}

@keyframes rainbowShift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

.theme-celebration {
  background: linear-gradient(135deg, #f9ca24 0%, #f0932b 50%, #eb4d4b 100%);
  animation: celebrationPulse 2s ease-in-out infinite;
}

@keyframes celebrationPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.theme-mystery {
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%);
}

.story-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 28px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1) rotate(90deg);
}

.story-content {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  position: relative;
}

/* 故事图片容器 */
.story-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  overflow: hidden;
}

.story-image {
  font-size: 80px;
  text-align: center;
  animation: imageFloat 4s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  position: relative;
  z-index: 2;
}

.image-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: imageGlowPulse 3s infinite;
  z-index: 1;
}

@keyframes imageFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.05); }
}

@keyframes imageGlowPulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
}

/* 角色对话样式 */
.character-dialogue {
  margin: 20px 0 25px 0;
  display: flex;
  justify-content: center;
  animation: dialogueSlideIn 0.8s ease-out;
}

@keyframes dialogueSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialogue-bubble {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 20px 25px;
  max-width: 80%;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(74, 144, 226, 0.2);
  backdrop-filter: blur(10px);
}

.dialogue-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  font-style: italic;
  position: relative;
  z-index: 2;
}

.dialogue-text::before {
  content: '"';
  font-size: 24px;
  color: #4a90e2;
  opacity: 0.6;
  position: absolute;
  top: -10px;
  left: -15px;
}

.dialogue-text::after {
  content: '"';
  font-size: 24px;
  color: #4a90e2;
  opacity: 0.6;
  position: absolute;
  bottom: -20px;
  right: -15px;
}

.dialogue-tail {
  position: absolute;
  bottom: -10px;
  left: 30px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-right: 2px solid rgba(74, 144, 226, 0.2);
  border-bottom: 2px solid rgba(74, 144, 226, 0.2);
  transform: rotate(45deg);
  z-index: 1;
}

/* 章节特色水果装饰 */
.story-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--theme-color-1, #ff6b6b), 
    var(--theme-color-2, #4ecdc4), 
    var(--theme-color-3, #45b7d1)
  );
  animation: colorFlow 3s ease-in-out infinite;
}

@keyframes colorFlow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* 章节主题色彩变量 */
.theme-strawberry .story-content {
  --theme-color-1: #ff6b9d;
  --theme-color-2: #c44569;
  --theme-color-3: #ff8fab;
}

.theme-lemon .story-content {
  --theme-color-1: #f7b731;
  --theme-color-2: #f5a623;
  --theme-color-3: #feca57;
}

.theme-orange .story-content {
  --theme-color-1: #ff9f43;
  --theme-color-2: #ff6348;
  --theme-color-3: #ffa502;
}

.theme-apple .story-content {
  --theme-color-1: #ff4757;
  --theme-color-2: #c44569;
  --theme-color-3: #ff6b81;
}

.theme-grape .story-content {
  --theme-color-1: #a55eea;
  --theme-color-2: #8854d0;
  --theme-color-3: #c56cf0;
}

.theme-blueberry .story-content {
  --theme-color-1: #4834d4;
  --theme-color-2: #686de0;
  --theme-color-3: #30336b;
}

.theme-rainbow .story-content {
  --theme-color-1: #ff6b6b;
  --theme-color-2: #4ecdc4;
  --theme-color-3: #45b7d1;
}

.theme-celebration .story-content {
  --theme-color-1: #f9ca24;
  --theme-color-2: #f0932b;
  --theme-color-3: #eb4d4b;
}

.theme-mystery .story-content {
  --theme-color-1: #2c3e50;
  --theme-color-2: #3498db;
  --theme-color-3: #9b59b6;
}

.theme-mixed-fruits .story-content {
  --theme-color-1: #ff6b6b;
  --theme-color-2: #4ecdc4;
  --theme-color-3: #45b7d1;
}

.character-info {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 15px;
  border-left: 4px solid #4a90e2;
  position: relative;
  overflow: hidden;
}

.character-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
  transform: translateX(-100%);
  animation: shimmer 4s infinite;
}

.character-avatar-container {
  position: relative;
  margin-right: 20px;
}

.character-avatar {
  font-size: 48px;
  animation: bounce 2s infinite;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s infinite;
  z-index: 1;
}

.character-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 3;
}

.sparkle {
  position: absolute;
  font-size: 12px;
  animation: sparkleFloat 3s infinite ease-in-out;
  opacity: 0;
}

.sparkle-1 {
  top: -10px;
  left: 50%;
  animation-delay: 0s;
}

.sparkle-2 {
  top: 50%;
  right: -15px;
  animation-delay: 1s;
}

.sparkle-3 {
  bottom: -10px;
  left: 50%;
  animation-delay: 2s;
}

@keyframes sparkleFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px) scale(1);
  }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

.character-details {
  flex: 1;
  position: relative;
  z-index: 2;
}

.character-name {
  font-size: 18px;
  font-weight: bold;
  color: #4a90e2;
  margin-bottom: 8px;
  position: relative;
  display: inline-block;
}

.name-underline {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #4a90e2, #357abd);
  animation: underlineGrow 1s ease-out forwards;
  animation-delay: 0.5s;
}

@keyframes underlineGrow {
  to {
    width: 100%;
  }
}

.character-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  animation: fadeInText 1s ease-out both;
  animation-delay: 0.3s;
}

.story-text {
  margin-bottom: 25px;
}

.story-paragraph {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 15px;
  text-align: justify;
  animation: fadeInText 0.8s ease-out both;
  position: relative;
}

.story-paragraph::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #4a90e2, transparent);
  border-radius: 2px;
  opacity: 0;
  animation: slideInLeft 0.8s ease-out both;
  animation-delay: inherit;
}

@keyframes fadeInText {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 0.6;
    transform: translateX(0);
  }
}

.story-progress {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  backdrop-filter: blur(5px);
}

.progress-indicator {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 600;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  transition: all 0.3s ease;
  position: relative;
}

.progress-dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: inherit;
  transition: all 0.3s ease;
}

.progress-dot.completed {
  background: #28a745;
  animation: completedPulse 1s ease-out;
}

.progress-dot.completed::before {
  width: 16px;
  height: 16px;
  opacity: 0.3;
}

@keyframes completedPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.progress-dot.current {
  background: #4a90e2;
  transform: scale(1.3);
  box-shadow: 0 0 15px rgba(74, 144, 226, 0.6);
  animation: currentPulse 2s infinite;
}

@keyframes currentPulse {
  0%, 100% { 
    box-shadow: 0 0 15px rgba(74, 144, 226, 0.6);
  }
  50% { 
    box-shadow: 0 0 25px rgba(74, 144, 226, 0.8);
  }
}

.progress-dot.locked {
  background: #ccc;
  opacity: 0.5;
  cursor: not-allowed;
}

.story-actions {
  padding: 20px 25px;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
  backdrop-filter: blur(5px);
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(45deg, #4a90e2, #357abd);
  color: white;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: 2px solid #ddd;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.btn-outline {
  background: transparent;
  color: #4a90e2;
  border: 2px solid #4a90e2;
}

.btn-outline:hover {
  background: #4a90e2;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .story-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .story-header {
    padding: 20px 25px;
  }
  
  .story-title {
    font-size: 20px;
  }
  
  .story-content {
    padding: 25px;
  }
  
  .story-image {
    font-size: 60px;
  }
  
  .image-glow {
    width: 90px;
    height: 90px;
  }
  
  .dialogue-bubble {
    padding: 15px 20px;
    max-width: 85%;
  }
  
  .dialogue-text {
    font-size: 14px;
  }
  
  .character-avatar {
    font-size: 36px;
    margin-right: 15px;
  }
  
  .avatar-glow {
    width: 45px;
    height: 45px;
  }
  
  .sparkle {
    font-size: 10px;
  }
  
  .story-paragraph {
    font-size: 15px;
  }
  
  .story-actions {
    padding: 15px 20px;
  }
  
  .btn {
    padding: 10px 16px;
    font-size: 13px;
    min-width: 70px;
  }
  
  .floating-fruit {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .story-container {
    width: 98%;
    border-radius: 15px;
  }
  
  .character-info {
    flex-direction: column;
    text-align: center;
    padding: 15px;
  }
  
  .character-avatar-container {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .story-image {
    font-size: 50px;
  }
  
  .image-glow {
    width: 75px;
    height: 75px;
  }
  
  .dialogue-bubble {
    padding: 12px 16px;
    max-width: 90%;
  }
  
  .dialogue-text {
    font-size: 13px;
  }
  
  .character-avatar {
    font-size: 32px;
  }
  
  .avatar-glow {
    width: 40px;
    height: 40px;
  }
  
  .sparkle {
    font-size: 8px;
  }
  
  .story-actions {
    justify-content: center;
    padding: 12px 15px;
  }
  
  .btn {
    flex: 1;
    min-width: 60px;
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .floating-fruit {
    font-size: 20px;
  }
  
  .fruit-0 { top: 5%; left: 5%; }
  .fruit-1 { top: 15%; right: 10%; }
  .fruit-2 { top: 75%; left: 3%; }
  .fruit-3 { top: 65%; right: 8%; }
  .fruit-4 { top: 35%; left: 2%; }
  .fruit-5 { top: 85%; right: 5%; }
  .fruit-6 { top: 25%; left: 90%; }
  .fruit-7 { top: 55%; right: 2%; }
  .fruit-8 { top: 10%; left: 50%; }
}
</style>