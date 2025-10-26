<template>
  <div class="achievements-modal" @click="closeAchievements" ref="achievementsModalRef">
    <div class="achievements-container" @click.stop>
      <div class="achievements-header">
        <h2 class="achievements-title">成就系统</h2>
        <div class="achievements-stats">
          <div class="stat-item">
            <span class="stat-value">{{ unlockedCount }}</span>
            <span class="stat-label">已解锁</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalCount }}</span>
            <span class="stat-label">总成就</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ completionRate }}%</span>
            <span class="stat-label">完成度</span>
          </div>
        </div>
        <button class="close-btn" @click="closeAchievements">×</button>
      </div>
      
      <div class="achievements-content">
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.id"
            :class="['category-tab', { active: selectedCategory === category.id }]"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ getCategoryCount(category.id) }}</span>
          </button>
        </div>
        
        <div class="achievements-list">
          <div 
            v-for="achievement in filteredAchievements" 
            :key="achievement.id"
            :class="['achievement-item', { 
              unlocked: achievement.isUnlocked,
              hidden: achievement.isHidden && !achievement.isUnlocked
            }]"
          >
            <div class="achievement-icon">
              <span v-if="!achievement.isHidden || achievement.isUnlocked">{{ achievement.icon }}</span>
              <span v-else class="hidden-icon">❓</span>
              <div v-if="achievement.isUnlocked" class="unlocked-glow"></div>
            </div>
            
            <div class="achievement-info">
              <h3 class="achievement-title">
                {{ achievement.isHidden && !achievement.isUnlocked ? '???' : achievement.title }}
              </h3>
              <p class="achievement-description">
                {{ achievement.isHidden && !achievement.isUnlocked ? '完成特定条件后解锁' : achievement.description }}
              </p>
              
              <div v-if="!achievement.isUnlocked && achievement.progress !== undefined" class="achievement-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${getProgressPercentage(achievement)}%` }"
                  ></div>
                </div>
                <span class="progress-text">
                  {{ achievement.progress }} / {{ achievement.maxProgress }}
                </span>
              </div>
              
              <div v-if="achievement.isUnlocked" class="achievement-unlocked">
                <span class="unlocked-date">{{ formatDate(achievement.unlockedAt) }}</span>
              </div>
              
              <div class="achievement-reward">
                <span class="reward-label">奖励:</span>
                <span class="reward-value">{{ getRewardText(achievement.reward) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { AchievementCategory, type Achievement } from '../types/achievement'

interface Props {
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()
const { 
  achievements, 
  playerAchievements, 
  getAchievementsByCategory,
  getUnlockedAchievements,
  getAchievementProgress
} = gameStore

const achievementsModalRef = ref<HTMLElement>()
const selectedCategory = ref<string>('all')

const categories = [
  { id: 'all', name: '全部', icon: '🏆' },
  { id: AchievementCategory.GAMEPLAY, name: '游戏玩法', icon: '🎮' },
  { id: AchievementCategory.COLLECTION, name: '收集', icon: '🍓' },
  { id: AchievementCategory.SCORE, name: '分数', icon: '⭐' },
  { id: AchievementCategory.COMBO, name: '连击', icon: '🔥' },
  { id: AchievementCategory.LEVEL, name: '关卡', icon: '🗺️' },
  { id: AchievementCategory.STORY, name: '剧情', icon: '📖' },
  { id: AchievementCategory.SPECIAL, name: '特殊', icon: '💎' }
]

const totalCount = computed(() => achievements.length)
const unlockedCount = computed(() => getUnlockedAchievements().length)
const completionRate = computed(() => Math.round((unlockedCount.value / totalCount.value) * 100))

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements
  }
  return getAchievementsByCategory(selectedCategory.value as AchievementCategory)
})

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const getCategoryCount = (categoryId: string) => {
  if (categoryId === 'all') {
    return totalCount.value
  }
  return getAchievementsByCategory(categoryId as AchievementCategory).length
}

const getProgressPercentage = (achievement: Achievement) => {
  if (achievement.progress === undefined || achievement.maxProgress === undefined) {
    return 0
  }
  return Math.round((achievement.progress / achievement.maxProgress) * 100)
}

const getRewardText = (reward: any) => {
  switch (reward.type) {
    case 'items':
      return `${reward.value}个道具`
    case 'titles':
      return `称号"${reward.value}"`
    case 'stars':
      return `${reward.value}颗星`
    default:
      return reward.description
  }
}

const formatDate = (date: Date | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const closeAchievements = () => {
  emit('close')
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeAchievements()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.achievements-modal {
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
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.achievements-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
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

.achievements-header {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.achievements-header::before {
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

.achievements-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.achievements-stats {
  display: flex;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
  min-width: 60px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
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

.achievements-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.category-tabs {
  display: flex;
  gap: 10px;
  padding: 20px 25px;
  background: rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  scrollbar-width: thin;
}

.category-tabs::-webkit-scrollbar {
  height: 6px;
}

.category-tabs::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 14px;
  min-width: 100px;
  justify-content: center;
}

.category-tab:hover {
  border-color: #4a90e2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
}

.category-tab.active {
  background: linear-gradient(45deg, #4a90e2, #357abd);
  color: white;
  border-color: #4a90e2;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
}

.category-icon {
  font-size: 16px;
}

.category-name {
  font-weight: 600;
}

.category-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.category-tab.active .category-count {
  background: rgba(255, 255, 255, 0.2);
}

.achievements-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 25px;
  gap: 15px;
  display: flex;
  flex-direction: column;
}

.achievement-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.achievement-item.unlocked {
  border-color: #4caf50;
  background: linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%);
}

.achievement-item.hidden {
  opacity: 0.7;
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
}

.achievement-icon {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 15px;
  flex-shrink: 0;
}

.unlocked-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%);
  border-radius: 15px;
  animation: glowPulse 2s infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.hidden-icon {
  opacity: 0.6;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.achievement-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #357abd);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

.achievement-unlocked {
  display: flex;
  align-items: center;
  gap: 5px;
}

.unlocked-date {
  font-size: 12px;
  color: #4caf50;
  font-weight: 600;
}

.achievement-reward {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 10px;
  align-self: flex-start;
}

.reward-label {
  font-size: 12px;
  color: #666;
}

.reward-value {
  font-size: 12px;
  color: #f57c00;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .achievements-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .achievements-header {
    padding: 20px 25px;
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .achievements-title {
    font-size: 20px;
  }
  
  .achievements-stats {
    justify-content: center;
  }
  
  .category-tabs {
    padding: 15px 20px;
    gap: 8px;
  }
  
  .category-tab {
    padding: 8px 12px;
    font-size: 13px;
    min-width: 90px;
  }
  
  .achievements-list {
    padding: 15px 20px;
    gap: 12px;
  }
  
  .achievement-item {
    padding: 15px;
    gap: 12px;
  }
  
  .achievement-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .achievement-title {
    font-size: 16px;
  }
  
  .achievement-description {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .achievements-header {
    padding: 15px 20px;
  }
  
  .achievements-title {
    font-size: 18px;
  }
  
  .achievements-stats {
    gap: 15px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .category-tabs {
    padding: 10px 15px;
    gap: 6px;
  }
  
  .category-tab {
    padding: 6px 10px;
    font-size: 12px;
    min-width: 80px;
    gap: 6px;
  }
  
  .category-icon {
    font-size: 14px;
  }
  
  .achievements-list {
    padding: 10px 15px;
    gap: 10px;
  }
  
  .achievement-item {
    padding: 12px;
    gap: 10px;
  }
  
  .achievement-icon {
    width: 45px;
    height: 45px;
    font-size: 20px;
  }
  
  .achievement-title {
    font-size: 15px;
  }
  
  .achievement-description {
    font-size: 12px;
  }
  
  .progress-text {
    font-size: 11px;
    min-width: 50px;
  }
  
  .reward-label,
  .reward-value {
    font-size: 11px;
  }
}
</style>