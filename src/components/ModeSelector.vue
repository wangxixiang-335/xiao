<template>
  <div class="mode-selector">
    <button
      v-for="mode in gameModes"
      :key="mode.value"
      :class="['mode-btn', { active: gameMode === mode.value }]"
      @click="selectMode(mode.value)"
    >
      {{ mode.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { GameMode } from '../types/game'

const gameStore = useGameStore()
const { gameMode, startNewGame } = gameStore

const gameModes = [
  { value: GameMode.CLASSIC, label: '经典模式' },
  { value: GameMode.COLLECT, label: '收集模式' },
  { value: GameMode.INFINITE, label: '无限模式' }
]

const selectMode = (mode: GameMode) => {
  startNewGame(mode)
}
</script>

<style scoped>
.mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.mode-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  backdrop-filter: blur(10px);
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.mode-btn.active {
  background: #4a90e2;
  color: white;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.mode-btn.active:hover {
  background: #357abd;
}
</style>