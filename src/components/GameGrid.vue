<template>
  <div class="grid-container" :style="gridStyle">
    <div
      v-for="(cell, index) in flattenedCells"
      :key="cell?.id || `empty_${index}`"
      :class="[
        'grid-cell',
        {
          'selected': cell?.isSelected,
          'matched': cell?.isMatched,
          'falling': cell?.isAnimating
        }
      ]"
      :style="cellStyle(cell)"
      :data-row="getRow(index)"
      :data-col="getCol(index)"
      @click="handleCellClick(cell, index)"
    >
      <span v-if="cell && !cell.isMatched" class="element-icon">
        {{ cell.type }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useGameStore } from '../stores/game'
import { responsiveManager, performanceOptimizer } from '../utils/responsive'
import type { GameElement } from '../types/game'

const gameStore = useGameStore()
const { gameGrid, selectCell } = gameStore

const cellSize = ref(60)
const isLowPerformance = ref(false)

// 响应式调整单元格大小
const updateCellSize = () => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 基于网格容器尺寸计算单元格大小（8×8网格）
  const gridContainerWidth = Math.min(viewportWidth * 0.9, 600) - 20 // 减去padding
  const gridContainerHeight = Math.min(viewportHeight * 0.9, 600) - 20 // 减去padding
  
  // 计算适合8×8网格的单元格尺寸
  const cellWidth = Math.floor(gridContainerWidth / 8)
  const cellHeight = Math.floor(gridContainerHeight / 8)
  
  // 取较小值确保网格完整显示
  cellSize.value = Math.min(cellWidth, cellHeight)
  
  // 确保最小尺寸
  cellSize.value = Math.max(cellSize.value, 35)
}

const updateGridConfig = () => {
  const gridConfig = responsiveManager.getCurrentGridConfig()
  cellSize.value = gridConfig.cellSize
  isLowPerformance.value = performanceOptimizer.isLowPerformance()
  
  // 重新初始化网格
  gameStore.initializeGrid(gridConfig.rows, gridConfig.cols)
}

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gameGrid?.cols || 8}, ${cellSize.value}px)`,
  gridTemplateRows: `repeat(${gameGrid?.rows || 8}, ${cellSize.value}px)`
}))

const flattenedCells = computed(() => {
  const cells = []
  if (!gameGrid.cells || !Array.isArray(gameGrid.cells)) return cells
  
  for (let row = 0; row < gameGrid.rows; row++) {
    if (!gameGrid.cells[row] || !Array.isArray(gameGrid.cells[row])) continue
    
    for (let col = 0; col < gameGrid.cols; col++) {
      cells.push(gameGrid.cells[row][col] || null)
    }
  }
  return cells
})

const cellStyle = (cell: GameElement | null) => {
  if (!cell) return {}
  
  // 精美的水果颜色渐变
  const colors = {
    '🍓': 'linear-gradient(145deg, #ff1744, #d50000, #ff5252)', // 草莓红
    '🍋': 'linear-gradient(145deg, #ffd93d, #ffcd02, #fff176)', // 柠檬黄
    '🍊': 'linear-gradient(145deg, #ff9f40, #ff8c00, #ffb74d)', // 橙子橙
    '🍎': 'linear-gradient(145deg, #4caf50, #388e3c, #81c784)', // 苹果绿
    '🍇': 'linear-gradient(145deg, #a55eea, #8b5cf6, #ba68c8)', // 葡萄紫
    '🫐': 'linear-gradient(145deg, #3742fa, #2f3542, #5c6bc0)'  // 蓝莓蓝
  }
  
  let background = colors[cell.type] || 'linear-gradient(145deg, #ffffff, #e6e6e6, #f5f5f5)'
  
  // 特殊方块的视觉效果
  if (cell.isSpecialPower) {
    switch (cell.powerType) {
      case 'row':
        background = `linear-gradient(145deg, #ff6b6b, #ff4757, #ff8a80), ${background}`
        break
      case 'col':
        background = `linear-gradient(145deg, #4ecdc4, #44a3aa, #80deea), ${background}`
        break
      case 'both':
        background = `linear-gradient(145deg, #ffd93d, #ffb142, #ffd54f), ${background}`
        break
    }
  }
  
  return {
    background,
    width: '100%',
    height: '100%',
    fontSize: isLowPerformance.value ? '22px' : '28px',
    boxShadow: cell.isSpecialPower ? 
      '0 0 25px rgba(255, 215, 0, 0.8), inset 0 2px 8px rgba(255, 255, 255, 0.6)' : 
      '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 4px rgba(255, 255, 255, 0.8)',
    border: cell.isSpecialPower ? '2px solid rgba(255, 255, 255, 0.8)' : '1px solid rgba(255, 255, 255, 0.5)',
    filter: cell.isSpecialPower ? 'brightness(1.2) saturate(1.3)' : 'brightness(1)',
    transform: cell.isSpecialPower ? 'scale(1.1)' : 'scale(1)'
  }
}

const getRow = (index: number): number => {
  return Math.floor(index / (gameGrid?.cols || 8))
}

const getCol = (index: number): number => {
  return index % (gameGrid?.cols || 8)
}

onMounted(() => {
  updateGridConfig()
  updateCellSize()
  responsiveManager.addCallback('gameGrid', updateGridConfig)
  
  // 添加窗口大小变化监听器
  window.addEventListener('resize', updateCellSize)
})

onUnmounted(() => {
  responsiveManager.removeCallback('gameGrid')
  window.removeEventListener('resize', updateCellSize)
})

const handleCellClick = performanceOptimizer.throttle((cell: GameElement | null, index: number) => {
  if (!cell || gameStore.gameState.isAnimating) return
  
  // 如果正在自动完成，禁止手动操作
  if (gameStore.gameState.isAutoCompleting) {
    console.log('自动完成中，禁止手动操作')
    return
  }
  
  const row = getRow(index)
  const col = getCol(index)
  
  // 触发自定义事件供道具系统使用
  const event = new CustomEvent('gridCellClick', {
    detail: { row, col, cell }
  })
  window.dispatchEvent(event)
  
  selectCell(row, col)
}, 100)
</script>

<style scoped>
.grid-container {
  display: grid;
  gap: 2px;
  padding: 10px;
  background: rgba(240, 240, 240, 0.8);
  border-radius: 15px;
  transition: all 0.3s ease;
  width: min(90vw, 600px);
  height: min(90vw, 600px);
  max-width: 100%;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
  overflow: visible;
  box-sizing: border-box;
}

.grid-cell {
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  user-select: none;
  position: relative;
}

.grid-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.grid-cell.selected {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.6);
  border: 3px solid #4a90e2;
}

.grid-cell.matched {
  animation: matchPulse 0.6s ease-in-out;
}

@keyframes matchPulse {
  0% { 
    transform: scale(1); 
    opacity: 1;
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0.7;
  }
  100% { 
    transform: scale(0); 
    opacity: 0;
  }
}

.grid-cell.falling {
  animation: fallDown 0.5s ease-in;
}

@keyframes fallDown {
  from { 
    transform: translateY(-100px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.element-icon {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.grid-cell:hover .element-icon {
  animation: bounce 0.5s infinite;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .grid-container {
    width: min(85vw, 500px) !important;
    height: min(85vw, 500px) !important;
    gap: 1px;
    padding: 8px;
  }
  
  .grid-cell {
    border-radius: 10px;
  }
  
  .element-icon {
    font-size: clamp(16px, 4vw, 22px);
  }
}

@media (max-width: 768px) {
  .grid-container {
    width: min(90vw, 400px) !important;
    height: min(90vw, 400px) !important;
    gap: 1px;
    padding: 6px;
  }
  
  .grid-cell {
    border-radius: 8px;
  }
  
  .element-icon {
    font-size: clamp(14px, 3.5vw, 20px);
  }
}

@media (max-width: 480px) {
  .grid-container {
    width: min(95vw, 350px) !important;
    height: min(95vw, 350px) !important;
    gap: 0.5px;
    padding: 4px;
  }
  
  .grid-cell {
    border-radius: 6px;
  }
  
  .element-icon {
    font-size: clamp(12px, 3vw, 18px);
  }
}

/* 低保真模式 */
:global(.low-performance) {
  .grid-cell {
    transition: none;
  }
  
  .element-icon {
    animation: none;
  }
  
  .grid-cell:hover .element-icon {
    animation: none;
  }
  
  .grid-cell.matched {
    animation: none;
    opacity: 0;
  }
  
  .grid-cell.falling {
    animation: none;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .grid-cell:hover {
    transform: none;
  }
  
  .grid-cell:active {
    transform: scale(0.95);
  }
}
</style>