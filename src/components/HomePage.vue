<template>
  <div class="home-page">
    <!-- 动态水果背景装饰 -->
    <div class="fruit-decoration fruit-1">🍓</div>
    <div class="fruit-decoration fruit-2">🍊</div>
    <div class="fruit-decoration fruit-3">🍋</div>
    <div class="fruit-decoration fruit-4">🍎</div>
    <div class="fruit-decoration fruit-5">🍇</div>
    <div class="fruit-decoration fruit-6">🫐</div>
    <div class="fruit-decoration fruit-7">🍑</div>
    <div class="fruit-decoration fruit-8">🍒</div>
    <div class="fruit-decoration fruit-9">🥝</div>
    <div class="fruit-decoration fruit-10">🍍</div>
    
    <!-- 粒子效果背景 -->
    <div class="particles-container">
      <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
    </div>
    
    <!-- 头部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🍓</span>
          <h1 class="logo-text">消消来解压</h1>
        </div>
        <nav class="nav-menu">
          <button class="nav-btn" @click="showPage('game')">开始游戏</button>
          <button class="nav-btn" @click="showPage('story')">剧情模式</button>
          <button class="nav-btn" @click="showPage('achievements')">成就</button>
          <button class="nav-btn" @click="showPage('settings')">设置</button>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 欢迎区域 -->
      <section class="welcome-section" v-if="currentPage === 'home'">
        <div class="welcome-content">
          <h2 class="welcome-title">欢迎来到水果王国</h2>
          <p class="welcome-subtitle">治愈系休闲三消游戏，让你在轻松愉快的氛围中放松心情</p>
          
          <div class="feature-cards">
            <div class="feature-card" @click="showPage('game')">
              <div class="feature-icon">🎮</div>
              <h3>多种游戏模式</h3>
              <p>经典模式、收集模式、无限模式，满足不同游戏需求</p>
              <div class="card-action">点击进入 →</div>
            </div>
            <div class="feature-card" @click="showPage('story')">
              <div class="feature-icon">📖</div>
              <h3>精彩剧情</h3>
              <p>10章精彩剧情，跟随水果王国的勇士一起冒险</p>
              <div class="card-action">点击进入 →</div>
            </div>

          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary btn-large" @click="startQuickGame">
              快速开始
            </button>
            <button class="btn btn-secondary btn-large" @click="showPage('story')">
              剧情模式
            </button>
          </div>
        </div>
      </section>

      <!-- 游戏页面 -->
      <section class="game-section" v-if="currentPage === 'game'">
        <div class="game-container">
          <ModeSelector />
          
          <div class="game-header">
            <div class="game-info">
              <div class="info-item">
                <span class="info-label">分数</span>
                <span class="info-value">{{ currentScore }}</span>
              </div>
              <div class="info-item" v-if="gameMode !== GameMode.INFINITE">
                <span class="info-label">步数</span>
                <span class="info-value">{{ remainingMoves }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">关卡</span>
                <span class="info-value">{{ currentLevel }}</span>
              </div>
            </div>
            
            <div class="game-controls">
              <button class="btn btn-secondary" @click="restartGame">重新开始</button>
              <button class="btn btn-primary" @click="showPage('home')">返回主页</button>
            </div>
          </div>

          <TargetPanel v-if="gameMode === 'collect' && gameState.target" />

          <div class="game-board">
            <div v-if="gameState.isAutoCompleting" class="auto-complete-overlay">
              <div class="auto-complete-message">
                <div class="auto-complete-icon">✨</div>
                <div class="auto-complete-text">魔法觉醒中...</div>
                <div class="auto-complete-moves">赋予 {{ remainingMoves }} 个方块特殊能力</div>
                <div class="auto-complete-countdown">1秒后统一消除...</div>
              </div>
            </div>
            <GameGrid />
          </div>

          <ToolsPanel />

          <GameOverModal 
            v-if="!isGameActive && gameStarted" 
            @back-to-menu="showPage('home')"
          />
          
          <!-- 调试面板 -->
          <div v-if="currentPage === 'game'" class="debug-panel" style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.9); color: white; padding: 15px; font-size: 12px; z-index: 9999; border-radius: 8px; max-width: 300px;">
            <h4 style="margin: 0 0 10px 0; color: #4CAF50;">游戏状态调试</h4>
            <div>isGameActive: <span :style="{ color: isGameActive ? '#f44336' : '#4CAF50' }">{{ isGameActive }}</span></div>
            <div>gameStarted: <span :style="{ color: gameStarted ? '#4CAF50' : '#f44336' }">{{ gameStarted }}</span></div>
            <div>显示弹窗: <span :style="{ color: (!isGameActive && gameStarted) ? '#4CAF50' : '#f44336' }">{{ !isGameActive && gameStarted }}</span></div>
            <div>当前关卡: {{ currentLevel }}</div>
            <div>当前分数: {{ currentScore }}</div>
            <div>剩余步数: {{ remainingMoves }}</div>
            <div>游戏模式: {{ gameMode }}</div>
            <hr style="margin: 10px 0; border: 1px solid #555;">
            <div>自动完成中: {{ gameState.isAutoCompleting }}</div>
            <div>动画中: {{ gameState.isAnimating }}</div>
            <div>连击数: {{ gameState.combo }}</div>
            <button @click="forceEndGame" style="margin-top: 10px; padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">强制结束游戏</button>
          </div>
        </div>
      </section>

      <!-- 剧情页面 -->
      <section class="story-section" v-if="currentPage === 'story'">
        <div class="story-container">
          <h2 class="section-title">水果王国传奇</h2>
          <div class="chapter-grid">
            <div 
              v-for="chapter in availableChapters" 
              :key="chapter.id"
              :class="['chapter-card', { 
                'unlocked': chapter.unlocked, 
                'locked': !chapter.unlocked 
              }]"
              @click="openChapter(chapter)"
            >
              <div class="chapter-number">第{{ chapter.id }}章</div>
              <div class="chapter-title">{{ chapter.title }}</div>
              <div class="chapter-status">
                <span v-if="chapter.unlocked && chapter.read">✅ 已读</span>
                <span v-else-if="chapter.unlocked">🔓 未读</span>
                <span v-else>🔒 未解锁</span>
              </div>
            </div>
          </div>
          
          <div class="story-actions">
            <button class="btn btn-secondary" @click="showPage('home')">返回主页</button>
          </div>
        </div>
      </section>



      <!-- 设置页面 -->
      <section class="settings-section" v-if="currentPage === 'settings'">
        <div class="settings-container">
          <h2 class="section-title">游戏设置</h2>
          
          <div class="settings-group">
            <h3>音频设置</h3>
            <div class="setting-item">
              <label>音效音量</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="settings.soundVolume"
                @input="updateSettings"
              >
              <span>{{ settings.soundVolume }}%</span>
            </div>
            <div class="setting-item">
              <label>背景音乐</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="settings.musicVolume"
                @input="updateSettings"
              >
              <span>{{ settings.musicVolume }}%</span>
            </div>
          </div>
          
          <div class="settings-group">
            <h3>游戏设置</h3>
            <div class="setting-item">
              <label>震动反馈</label>
              <input 
                type="checkbox" 
                v-model="settings.vibration"
                @change="updateSettings"
              >
            </div>
          </div>
          
          <div class="settings-actions">
            <button class="btn btn-secondary" @click="resetSettings">重置设置</button>
            <button class="btn btn-primary" @click="showPage('home')">返回主页</button>
          </div>
        </div>
      </section>
    </main>

    <!-- 剧情模态框 -->
    <StoryModal
      v-if="showStoryModal"
      :chapter-id="selectedChapterId"
      :show-skip="true"
      @close="hideStory"
      @chapter-complete="onChapterComplete"
      @story-complete="onStoryComplete"
    />
    
    <!-- 成就模态框 -->
    <AchievementsModal
      v-if="showAchievementsModal"
      @close="hideAchievements"
    />
    
    <!-- 成就通知 -->
    <AchievementNotification
      v-for="notification in achievementNotifications"
      :key="notification.achievement.id"
      :achievement="notification.achievement"
      :show="showAchievementNotification"
      @close="hideAchievementNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'
import { GameMode } from '../types/game'
import { STORY_CHAPTERS } from '../types/story'
import { audioManager } from '../utils/audio'

// 组件导入
import ModeSelector from './ModeSelector.vue'
import GameGrid from './GameGrid.vue'
import TargetPanel from './TargetPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import GameOverModal from './GameOverModal.vue'
import StoryModal from './StoryModal.vue'
import AchievementsModal from './AchievementsModal.vue'
import AchievementNotification from './AchievementNotification.vue'

const gameStore = useGameStore()
const { 
  gameState, 
  gameStarted, 
  currentScore, 
  remainingMoves, 
  currentLevel, 
  gameMode, 
  isGameActive,
  playerData,
  showAchievementNotification,
  achievementNotifications
} = storeToRefs(gameStore)

// 页面状态
const currentPage = ref('home')
const showStoryModal = ref(false)
const selectedChapterId = ref(1)
const showAchievementsModal = ref(false)

// 视觉特效状态
const isMouseMoving = ref(false)
const mousePosition = ref({ x: 0, y: 0 })

// 设置状态
const settings = ref({
  soundVolume: 80,
  musicVolume: 60,
  vibration: true
})



// 章节数据
const availableChapters = computed(() => {
  const unlockedChapters = gameStore.getUnlockedChapters()
  
  // 从 localStorage 获取已读章节状态，确保响应式更新
  const savedStoryData = localStorage.getItem('storyChaptersRead')
  const readChapters = savedStoryData ? JSON.parse(savedStoryData) : []
  
  return STORY_CHAPTERS.map(chapter => ({
    ...chapter,
    unlocked: unlockedChapters.includes(chapter.id),
    read: readChapters.includes(chapter.id)
  }))
})

// 页面导航
const showPage = (page: string) => {
  currentPage.value = page
  
  // 如果是成就页面，显示成就模态框
  if (page === 'achievements') {
    showAchievementsModal.value = true
  }
  
  // 播放页面切换音效
  if (settings.value.soundVolume > 0) {
    audioManager.playSound('click')
  }
}

// 快速开始游戏
const startQuickGame = () => {
  gameStore.startGame(GameMode.CLASSIC)
  showPage('game')
}

// 打开章节
const openChapter = (chapter: any) => {
  if (!chapter.unlocked) return
  
  // 标记章节为已读
  gameStore.markChapterAsRead(chapter.id)
  
  selectedChapterId.value = chapter.id
  showStoryModal.value = true
}

// 隐藏剧情
const hideStory = () => {
  showStoryModal.value = false
}

// 章节完成
const onChapterComplete = (chapterId: number) => {
  console.log(`章节 ${chapterId} 完成`)
}

// 故事完成
const onStoryComplete = () => {
  console.log('故事完成')
}



// 更新设置
const updateSettings = () => {
  audioManager.setVolume('sound', settings.value.soundVolume / 100)
  audioManager.setVolume('music', settings.value.musicVolume / 100)
}

// 重置设置
const resetSettings = () => {
  settings.value = {
    soundVolume: 80,
    musicVolume: 60,
    vibration: true
  }
  updateSettings()
}

// 鼠标移动效果
const handleMouseMove = (event: MouseEvent) => {
  mousePosition.value = { x: event.clientX, y: event.clientY }
  isMouseMoving.value = true
  
  setTimeout(() => {
    isMouseMoving.value = false
  }, 100)
}

// 粒子效果样式
const getParticleStyle = (index: number) => {
  const size = Math.random() * 6 + 2
  const opacity = Math.random() * 0.3 + 0.1
  const duration = Math.random() * 10 + 5
  const delay = Math.random() * 5
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    opacity: opacity,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`
  }
}

// 重新开始游戏
const restartGame = () => {
  gameStore.restartGame()
}

// 强制结束游戏（调试用）
const forceEndGame = () => {
  console.log('强制结束游戏')
  gameStore.gameState.isGameActive = false
  gameStore.gameStarted = true
}

// 显示成就模态框
const showAchievements = () => {
  showAchievementsModal.value = true
}

// 隐藏成就模态框
const hideAchievements = () => {
  showAchievementsModal.value = false
}

// 隐藏成就通知
const hideAchievementNotification = () => {
  gameStore.hideAchievementPopup()
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  
  // 初始化音频系统
  audioManager.initialize()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
/* 主页特定样式 */
.home-page {
  height: 100vh;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.home-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  animation: bounce 2s infinite;
}

.logo-text {
  font-size: var(--font-2xl);
  font-weight: 700;
  color: var(--text-light);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.nav-menu {
  display: flex;
  gap: 15px;
}

.nav-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.35);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg);
  color: var(--text-light);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.7);
}

.main-content {
  padding-top: 100px;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 0 20px;
}

.welcome-content {
  text-align: center;
  max-width: 800px;
  animation: slideUp 1s ease-out;
}

.welcome-title {
  font-size: var(--font-4xl);
  font-weight: 800;
  color: var(--text-light);
  margin-bottom: 20px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.welcome-subtitle {
  font-size: var(--font-lg);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: bounce 3s infinite;
}

.feature-card h3 {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 10px;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 15px;
}

.card-action {
  color: var(--primary-color);
  font-weight: 600;
  font-size: var(--font-sm);
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  padding: 15px 30px;
  font-size: var(--font-lg);
  min-height: 55px;
}

/* 水果装饰动画 */
.fruit-decoration {
  position: absolute;
  font-size: 40px;
  animation: float 6s ease-in-out infinite;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.fruit-1 { top: 10%; left: 5%; animation-delay: 0s; }
.fruit-2 { top: 20%; right: 10%; animation-delay: 1s; }
.fruit-3 { top: 40%; left: 15%; animation-delay: 2s; }
.fruit-4 { top: 60%; right: 5%; animation-delay: 3s; }
.fruit-5 { bottom: 20%; left: 10%; animation-delay: 4s; }
.fruit-6 { bottom: 10%; right: 15%; animation-delay: 5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* 粒子效果样式 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: floatParticle linear infinite;
}

@keyframes floatParticle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.5;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 章节卡片样式 */
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.chapter-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chapter-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.chapter-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.chapter-card.locked:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.1);
}

.chapter-number {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 10px;
}

.chapter-title {
  font-size: var(--font-base);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
}

.chapter-status {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.7);
}

/* 成就卡片样式 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.achievement-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.achievement-card.unlocked {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
}

.achievement-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  font-size: var(--font-base);
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 5px;
}

.achievement-info p {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.achievement-status {
  font-size: 20px;
}

/* 设置页面样式 */
.settings-group {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.settings-group h3 {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 15px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.setting-item label {
  font-size: var(--font-base);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.setting-item input[type="range"] {
  width: 200px;
  margin: 0 15px;
}

.setting-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chapter-grid {
    grid-template-columns: repeat(3, minmax(200px, 1fr));
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .feature-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .chapter-grid {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
    max-width: 400px;
    gap: 15px;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .setting-item input[type="range"] {
    width: 100%;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .chapter-grid {
    grid-template-columns: 1fr;
    max-width: 300px;
    gap: 12px;
  }
  
  .chapter-card {
    padding: 20px;
  }
  
  .chapter-number {
    font-size: var(--font-base);
  }
  
  .chapter-title {
    font-size: var(--font-sm);
  }
}
</style>