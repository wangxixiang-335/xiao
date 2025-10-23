<template>
  <div class="game-over-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">{{ gameResult.title }}</h2>
        <p class="modal-subtitle">{{ gameResult.subtitle }}</p>
      </div>
      
      <div class="modal-body">
        <div class="score-display">
          <div class="score-item">
            <span class="score-label">本局得分</span>
            <span class="score-value">{{ currentScore }}</span>
          </div>
          <div class="score-item" v-if="gameMode !== 'infinite'">
            <span class="score-label">获得星级</span>
            <div class="stars-display">
              <span 
                v-for="star in 3" 
                :key="star"
                :class="['star', { 'active': star <= earnedStars }]"
              >
                ⭐
              </span>
            </div>
          </div>
          <div class="score-item" v-if="gameMode === 'infinite'">
            <span class="score-label">历史最高</span>
            <span class="score-value">{{ highScore }}</span>
          </div>
        </div>
        
        <div class="story-section" v-if="gameWon && storyAvailable">
          <div class="story-notice">
            <span class="story-icon">📖</span>
            <span class="story-text">新的剧情章节已解锁！</span>
          </div>
          <button class="btn btn-story" @click="showStory">
            查看剧情
          </button>
        </div>
        
        <div class="achievements" v-if="newAchievements.length > 0">
          <h3>新成就解锁！</h3>
          <div class="achievement-list">
            <div v-for="achievement in newAchievements" :key="achievement" class="achievement-item">
              🏆 {{ achievement }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="goToMenu">
          返回主菜单
        </button>
        <button class="btn btn-primary" @click="playAgain">
          再玩一次
        </button>
        <button 
          v-if="gameWon && gameMode !== 'infinite'"
          class="btn btn-success" 
          @click="nextLevel"
        >
          下一关
        </button>
      </div>
    </div>
    
    <!-- 剧情模态框 -->
    <StoryModal
      v-if="showStoryModal"
      :chapter-id="storyChapterId"
      :show-skip="true"
      @close="hideStory"
      @chapter-complete="onChapterComplete"
      @story-complete="onStoryComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/game'
import { GameMode } from '../types/game'
import { STORY_CHAPTERS } from '../types/story'
import StoryModal from './StoryModal.vue'

const gameStore = useGameStore()
const { gameState, startNewGame } = gameStore

// 定义emit事件
const emit = defineEmits<{
  backToMenu: []
}>()

// 使用计算属性确保响应式更新
const currentScore = computed(() => gameState.score)
const gameMode = computed(() => gameState.mode)
const playerData = computed(() => gameStore.playerData)
const highScore = computed(() => playerData.value.progress.infiniteModeHighScore)

const showStoryModal = ref(false)
const storyChapterId = ref(1)

const gameWon = computed(() => {
  // 只有当游戏真正结束时才判断输赢
  if (!gameState.isGameActive) {
    console.log('游戏已结束，判断输赢:', {
      mode: gameMode.value,
      score: currentScore.value,
      isActive: gameState.isGameActive,
      target: gameState.target
    })
    
    if (gameMode.value === GameMode.INFINITE) return true
    if (gameMode.value === GameMode.COLLECT) {
      return gameState.target && gameState.target.current >= gameState.target.required
    }
    // 经典模式：根据分数判断输赢
    const won = currentScore.value >= 500
    console.log('经典模式判断:', currentScore.value, '>= 500 =', won)
    return won
  }
  console.log('游戏仍在进行中，不判断输赢')
  return false
})

const earnedStars = computed(() => {
  if (gameMode.value === GameMode.INFINITE) return 0
  
  const score = currentScore.value
  if (score >= 1000) return 3
  if (score >= 750) return 2
  if (score >= 500) return 1
  return 0
})

const storyAvailable = computed(() => {
  if (!gameWon.value || gameMode.value === GameMode.INFINITE) return false
  
  const currentLevel = gameState.level
  const storyProgress = gameStore.storyProgress
  
  // 检查是否有未读的已解锁章节
  const availableChapter = STORY_CHAPTERS.find(chapter => 
    chapter.unlockedAt <= currentLevel && 
    storyProgress.unlockedChapters.includes(chapter.id) && 
    !chapter.isRead
  )
  
  return !!availableChapter
})

const newAchievements = computed(() => {
  const achievements = []
  const currentAchievements = playerData.value.progress.achievements
  const currentLevel = gameState.level
  const maxCombo = parseInt(localStorage.getItem('maxCombo') || '0')
  
  // 成就映射
  const achievementMap = {
    'perfect_clear': '完美通关',
    'first_star': '初次通关',
    'high_score': '高分达人',
    'score_master': '得分高手',
    'combo_master': '连击大师',
    'combo_expert': '连击专家',
    'level_10': '十关达人',
    'level_5': '五关新星'
  }
  
  // 检查各种成就条件
  const potentialAchievements = []
  
  // 星级成就
  if (earnedStars.value === 3) potentialAchievements.push('perfect_clear')
  if (earnedStars.value >= 1) potentialAchievements.push('first_star')
  
  // 分数成就
  if (currentScore.value >= 25000) potentialAchievements.push('high_score')
  if (currentScore.value >= 10000) potentialAchievements.push('score_master')
  
  // 连击成就
  if (maxCombo >= 10) potentialAchievements.push('combo_master')
  if (maxCombo >= 5) potentialAchievements.push('combo_expert')
  
  // 关卡成就
  if (currentLevel >= 10) potentialAchievements.push('level_10')
  if (currentLevel >= 5) potentialAchievements.push('level_5')
  
  // 检查哪些是新解锁的成就
  potentialAchievements.forEach(achievementId => {
    if (!currentAchievements.includes(achievementId)) {
      achievements.push(achievementMap[achievementId] || achievementId)
    }
  })
  
  return achievements
})

const gameResult = computed(() => {
  if (gameWon.value) {
    return {
      title: '恭喜通关！',
      subtitle: earnedStars.value === 3 ? '完美表现！' : '做得不错！'
    }
  } else {
    return {
      title: '游戏结束',
      subtitle: '再接再厉！'
    }
  }
})

const showStory = () => {
  const currentLevel = gameState.level
  const storyProgress = gameStore.storyProgress
  
  const availableChapter = STORY_CHAPTERS.find(chapter => 
    chapter.unlockedAt <= currentLevel && 
    storyProgress.unlockedChapters.includes(chapter.id) && 
    !chapter.isRead
  )
  
  if (availableChapter) {
    storyChapterId.value = availableChapter.id
    showStoryModal.value = true
  }
}

const hideStory = () => {
  showStoryModal.value = false
}

const onChapterComplete = (chapterId: number) => {
  console.log('章节完成:', chapterId)
}

const onStoryComplete = () => {
  console.log('故事完成')
  showStoryModal.value = false
}

const playAgain = () => {
  startNewGame(gameMode.value, gameState.level)
}

const nextLevel = () => {
  const nextLevelNumber = gameState.level + 1
  
  // 强制获取最新的玩家数据
  const latestPlayerData = gameStore.playerData
  const currentMaxLevel = latestPlayerData.progress.currentLevel
  
  console.log('=== 尝试进入下一关 ===')
  console.log('游戏状态关卡:', gameState.level)
  console.log('尝试进入关卡:', nextLevelNumber)
  console.log('玩家数据最高关卡:', currentMaxLevel)
  console.log('完整玩家数据:', JSON.stringify(latestPlayerData.progress))
  console.log('比较结果:', nextLevelNumber, '<=', currentMaxLevel, '=', nextLevelNumber <= currentMaxLevel)
  
  // 检查下一关是否已解锁
  if (nextLevelNumber <= currentMaxLevel) {
    console.log('✅ 下一关已解锁，开始游戏')
    startNewGame(gameMode.value, nextLevelNumber)
  } else {
    // 如果下一关未解锁，显示提示信息
    console.log(`❌ 第${nextLevelNumber}关尚未解锁，当前最高关卡：${currentMaxLevel}`)
    // 如果下一关未解锁，直接开始当前最高关卡
    startNewGame(gameMode.value, currentMaxLevel)
  }
}

const goToMenu = () => {
  // 发送返回主菜单事件
  emit('backToMenu')
}
</script>

<style scoped>
.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.5s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  margin-bottom: 25px;
}

.modal-title {
  font-size: 28px;
  color: #4a90e2;
  margin: 0 0 8px 0;
  font-weight: bold;
}

.modal-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.modal-body {
  margin-bottom: 25px;
}

.score-display {
  background: rgba(74, 144, 226, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.score-item:last-child {
  margin-bottom: 0;
}

.score-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
  color: #4a90e2;
}

.stars-display {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 24px;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.star.active {
  opacity: 1;
  animation: starGlow 1s ease-in-out;
}

@keyframes starGlow {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.achievements {
  background: rgba(255, 193, 7, 0.1);
  border-radius: 12px;
  padding: 15px;
  border: 2px solid rgba(255, 193, 7, 0.3);
}

.achievements h3 {
  margin: 0 0 10px 0;
  color: #ff6f00;
  font-size: 16px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  animation: achievementSlide 0.5s ease-out;
}

@keyframes achievementSlide {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 100px;
}

.btn-primary {
  background: linear-gradient(45deg, #4a90e2, #357abd);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: 2px solid #ddd;
}

.btn-secondary:hover {
  background: white;
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

/* 剧情部分 */
.story-section {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  border: 2px solid rgba(147, 51, 234, 0.2);
  text-align: center;
}

.story-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.story-icon {
  font-size: 24px;
  animation: storyIconPulse 2s infinite;
}

@keyframes storyIconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.story-text {
  font-size: 16px;
  font-weight: bold;
  color: #8b5cf6;
}

.btn-story {
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
}

.btn-story:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

/* 庆祝粒子效果 */
.celebration-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #4a90e2;
  border-radius: 50%;
  animation: particleFloat 2s ease-out forwards;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}
</style>