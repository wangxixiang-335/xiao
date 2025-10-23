<template>
  <div class="target-panel" v-if="gameState.target">
    <h3 class="target-title">收集目标</h3>
    <div class="target-items">
      <div class="target-item">
        <span class="target-icon">{{ gameState.target.type }}</span>
        <span class="target-text">
          {{ gameState.target.current }} / {{ gameState.target.required }}
        </span>
        <div class="target-progress">
          <div 
            class="target-progress-bar" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { gameState } = storeToRefs(gameStore)

const progressPercentage = computed(() => {
  if (!gameState.value.target) return 0
  return (gameState.value.target.current / gameState.value.target.required) * 100
})

// 添加调试信息
console.log('TargetPanel - Current target:', gameState.value.target)
</script>

<style scoped>
.target-panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.target-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.target-items {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.target-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  min-width: 120px;
}

.target-icon {
  font-size: 32px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.target-text {
  font-weight: bold;
  color: #4a90e2;
  font-size: 14px;
}

.target-progress {
  width: 80px;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 5px;
}

.target-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #357abd);
  border-radius: 3px;
  transition: width 0.5s ease;
  position: relative;
}

.target-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 目标完成动画 */
.target-item.target-completed .target-icon {
  animation: celebration 1s ease-in-out;
}

@keyframes celebration {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-10deg);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
  75% {
    transform: scale(1.2) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>