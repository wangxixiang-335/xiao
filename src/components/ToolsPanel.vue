<template>
  <div class="tools-panel">
    <button
      class="tool-btn"
      :disabled="inventory.hammers === 0 || isAnimating"
      @click="handleToolUse('hammer')"
      title="锤子 - 消除单个元素"
    >
      🔨
      <span class="tool-count">{{ inventory.hammers }}</span>
    </button>
    
    <button
      class="tool-btn"
      :disabled="inventory.swappers === 0 || isAnimating"
      @click="handleToolUse('swapper')"
      title="交换器 - 交换任意两个元素"
    >
      🔄
      <span class="tool-count">{{ inventory.swappers }}</span>
    </button>
    
    <button
      class="tool-btn"
      :disabled="inventory.rainbowBalls === 0 || isAnimating"
      @click="handleToolUse('rainbowBall')"
      title="彩虹球 - 消除所有同类元素"
    >
      🌈
      <span class="tool-count">{{ inventory.rainbowBalls }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()
const { playerData, gameState } = gameStore

const inventory = computed(() => playerData.inventory)
const isAnimating = computed(() => gameState.isAnimating)

let selectedTool: string | null = null
let firstSelection: { row: number; col: number } | null = null

const handleToolUse = (toolType: 'hammer' | 'swapper' | 'rainbowBall') => {
  if (toolType === 'swapper') {
    // 交换器需要特殊处理 - 选择两个元素
    if (!firstSelection) {
      firstSelection = { row: 0, col: 0 } // 这里应该让用户选择第一个元素
      selectedTool = toolType
      alert('请点击要交换的第一个元素')
    } else {
      // 执行交换逻辑
      // gameStore.useTool(toolType, firstSelection.row, firstSelection.col)
      firstSelection = null
      selectedTool = null
    }
  } else if (toolType === 'hammer' || toolType === 'rainbowBall') {
    // 锤子和彩虹球需要选择目标元素
    selectedTool = toolType
    alert(`请点击要使用${toolType === 'hammer' ? '锤子' : '彩虹球'}的目标元素`)
  }
}

// 监听网格点击事件来处理道具使用
const handleGridClick = (event: CustomEvent) => {
  if (!selectedTool) return
  
  const { row, col } = event.detail
  
  if (selectedTool === 'hammer') {
    gameStore.useTool('hammer', row, col)
  } else if (selectedTool === 'rainbowBall') {
    gameStore.useTool('rainbowBall', row, col)
  }
  
  selectedTool = null
}

// 添加事件监听器
window.addEventListener('gridCellClick', handleGridClick as EventListener)
</script>

<style scoped>
.tools-panel {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: center;
}

.tool-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  backdrop-filter: blur(10px);
}

.tool-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tool-count {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #333;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 工具按钮动画 */
.tool-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.tool-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tool-btn:hover:not(:disabled)::before {
  opacity: 1;
}

/* 特殊效果 */
.tool-btn:nth-child(2) {
  background: linear-gradient(45deg, #4a90e2, #357abd);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.tool-btn:nth-child(2):hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
}

.tool-btn:nth-child(3) {
  background: linear-gradient(45deg, #a55eea, #8b5cf6);
  box-shadow: 0 4px 15px rgba(165, 94, 234, 0.3);
}

.tool-btn:nth-child(3):hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(165, 94, 234, 0.4);
}
</style>