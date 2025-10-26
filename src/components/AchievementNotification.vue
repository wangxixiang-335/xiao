<template>
  <div v-if="show" class="achievement-notification" :class="{ 'show': show }">
    <div class="notification-content">
      <div class="achievement-icon">
        <span>{{ achievement.icon }}</span>
        <div class="glow-effect"></div>
      </div>
      
      <div class="notification-info">
        <h3 class="notification-title">成就解锁！</h3>
        <p class="notification-name">{{ achievement.title }}</p>
        <p class="notification-description">{{ achievement.description }}</p>
        <div class="notification-reward">
          <span class="reward-label">奖励:</span>
          <span class="reward-value">{{ getRewardText(achievement.reward) }}</span>
        </div>
      </div>
      
      <button class="notification-close" @click="close">×</button>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" :style="{ animationDuration: duration + 'ms' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type Achievement } from '../types/achievement'

interface Props {
  achievement: Achievement
  show: boolean
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000
})

const emit = defineEmits<{
  close: []
}>()

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

const close = () => {
  emit('close')
}
</script>

<style scoped>
.achievement-notification {
  position: fixed;
  top: 20px;
  right: -400px;
  max-width: 350px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 3000;
  transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  overflow: hidden;
  border: 2px solid #4caf50;
}

.achievement-notification.show {
  right: 20px;
}

.notification-content {
  padding: 20px;
  display: flex;
  gap: 15px;
  position: relative;
}

.achievement-icon {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border-radius: 15px;
  flex-shrink: 0;
  animation: iconBounce 0.6s ease-out;
}

@keyframes iconBounce {
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.5) 0%, transparent 70%);
  border-radius: 15px;
  animation: glowPulse 2s infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.notification-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.notification-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #4caf50;
  animation: titleSlideIn 0.5s ease-out;
}

@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-name {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  animation: nameSlideIn 0.6s ease-out;
}

@keyframes nameSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  animation: descriptionSlideIn 0.7s ease-out;
}

@keyframes descriptionSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-reward {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 10px;
  align-self: flex-start;
  animation: rewardSlideIn 0.8s ease-out;
}

@keyframes rewardSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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

.notification-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  color: #666;
  font-size: 18px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #45a049);
  width: 100%;
  transform: scaleX(1);
  transform-origin: left;
  animation: progressShrink var(--duration) linear;
}

@keyframes progressShrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .achievement-notification {
    top: 10px;
    right: -350px;
    max-width: 320px;
  }
  
  .achievement-notification.show {
    right: 10px;
  }
  
  .notification-content {
    padding: 15px;
    gap: 12px;
  }
  
  .achievement-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .notification-title {
    font-size: 14px;
  }
  
  .notification-name {
    font-size: 16px;
  }
  
  .notification-description {
    font-size: 13px;
  }
  
  .reward-label,
  .reward-value {
    font-size: 11px;
  }
}
</style>