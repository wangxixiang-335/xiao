import { ref, computed, nextTick } from 'vue'
import { defineStore } from 'pinia'
import type { 
  GameState, 
  GameGrid, 
  GameElement, 
  PlayerData, 
  PlayerInventory,
  GameSettings,
  PlayerProgress,
  LevelConfig,
  GameTarget
} from '../types/game'
import { GameMode, ElementType } from '../types/game'
import { STORY_CHAPTERS, type StoryProgress } from '../types/story'
import { ACHIEVEMENTS, type Achievement, type AchievementProgress, type PlayerAchievements, type AchievementNotification, AchievementCategory } from '../types/achievement'
import { audioManager } from '../utils/audio'
import { getParticleSystem } from '../utils/particles'
import { responsiveManager, performanceOptimizer } from '../utils/responsive'

export const useGameStore = defineStore('game', () => {
  // 游戏状态
  const gameState = ref<GameState>({
    score: 0,
    moves: 25,
    level: 1,
    mode: GameMode.CLASSIC,
    isGameActive: true, // 默认为 true，避免初始化时显示游戏结束
    selectedCell: null,
    isAnimating: false,
    combo: 0,
    isAutoCompleting: false
  })

  // 游戏是否已经开始过（用于控制游戏结束界面的显示）
  const gameStarted = ref(false)

  // 游戏网格
  const gameGrid = ref<GameGrid>({
    rows: 8,
    cols: 8,
    cells: []
  })

  // 玩家数据
  const playerData = ref<PlayerData>({
    playerId: generatePlayerId(),
    settings: {
      soundVolume: 0.8,
      musicVolume: 1.0,
      vibration: true
    },
    inventory: {
      hammers: 5,
      swappers: 3,
      rainbowBalls: 1
    },
    progress: {
      currentLevel: 1,
      levelStars: {},
      infiniteModeHighScore: 0
    }
  })

  // 剧情进度
  const storyProgress = ref<StoryProgress>({
    currentChapter: 1,
    unlockedChapters: [1],
    lastReadChapter: null
  })

  // 成就系统
  const achievements = ref<Achievement[]>(ACHIEVEMENTS.map(achievement => ({ ...achievement })))
  const playerAchievements = ref<PlayerAchievements>({
    unlockedAchievements: [],
    achievementProgress: {},
    totalAchievements: ACHIEVEMENTS.length,
    unlockedCount: 0
  })
  
  // 成就通知
  const achievementNotifications = ref<AchievementNotification[]>([])
  const showAchievementNotification = ref(false)

  // 计算属性
  const currentScore = computed(() => gameState.value.score)
  const remainingMoves = computed(() => gameState.value.moves)
  const currentLevel = computed(() => gameState.value.level)
  const gameMode = computed(() => gameState.value.mode)
  const isGameActive = computed(() => gameState.value.isGameActive)
  const targetProgress = computed(() => {
    if (gameState.value.target) {
      return `${gameState.value.target.current}/${gameState.value.target.required}`
    }
    return ''
  })

  const targetCompleted = computed(() => {
    if (!gameState.value.target) return false
    const completed = gameState.value.target.current >= gameState.value.target.required
    console.log('Target completion check:', gameState.value.target.current, '>=', gameState.value.target.required, '=', completed)
    return completed
  })

  // 生成玩家ID
  function generatePlayerId(): string {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 初始化游戏网格
  function initializeGrid(rows?: number, cols?: number): void {
    // 根据设备类型调整网格大小
    const deviceType = responsiveManager.getCurrentDevice()
    const gridConfig = responsiveManager.getCurrentGridConfig()
    
    const finalRows = rows || gridConfig.rows || 8
    const finalCols = cols || gridConfig.cols || 8
    
    gameGrid.value.rows = finalRows
    gameGrid.value.cols = finalCols
    gameGrid.value.cells = []

    for (let row = 0; row < finalRows; row++) {
      gameGrid.value.cells[row] = []
      for (let col = 0; col < finalCols; col++) {
        gameGrid.value.cells[row][col] = createRandomElement(row, col)
      }
    }

    // 确保初始状态没有匹配
    while (hasInitialMatches()) {
      reshuffleGrid()
    }
    
    console.log('Grid initialized:', finalRows, 'x', finalCols)
  }

  // 创建随机元素
  function createRandomElement(row: number, col: number): GameElement {
    const types = Object.values(ElementType)
    const randomType = types[Math.floor(Math.random() * types.length)]
    
    console.log('Creating element:', randomType, 'at', row, col)
    
    return {
      id: `element_${row}_${col}_${Date.now()}`,
      type: randomType,
      row,
      col,
      isMatched: false,
      isSelected: false,
      isAnimating: false,
      isSpecialPower: false
    }
  }

  // 检查初始匹配
  function hasInitialMatches(): boolean {
    const { cells, rows, cols } = gameGrid.value
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const element = cells[row][col]
        if (!element) continue

        // 检查水平匹配
        if (col <= cols - 3) {
          const type = element.type
          if (cells[row][col + 1]?.type === type && cells[row][col + 2]?.type === type) {
            return true
          }
        }

        // 检查垂直匹配
        if (row <= rows - 3) {
          const type = element.type
          if (cells[row + 1][col]?.type === type && cells[row + 2][col]?.type === type) {
            return true
          }
        }
      }
    }
    return false
  }

  // 重新洗牌网格
  function reshuffleGrid(): void {
    const { rows, cols } = gameGrid.value
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        gameGrid.value.cells[row][col] = createRandomElement(row, col)
      }
    }
  }

  // 选择单元格
  function selectCell(row: number, col: number): boolean {
    console.log('Selecting cell at:', row, col)
    
    if (gameState.value.isAnimating) {
      console.log('Cannot select: game is animating')
      return false
    }
    
    if (!gameGrid.value.cells[row][col]) {
      console.log('Cannot select: no element at', row, col)
      return false
    }

    // 如果已选中一个单元格，尝试交换
    if (gameState.value.selectedCell) {
      const { row: selectedRow, col: selectedCol } = gameState.value.selectedCell
      
      console.log('Already selected:', selectedRow, selectedCol)
      
      // 如果是同一个单元格，取消选择
      if (selectedRow === row && selectedCol === col) {
        console.log('Deselecting same cell')
        clearSelection()
        return false
      }

      // 检查是否相邻
      if (isAdjacent(selectedRow, selectedCol, row, col)) {
        console.log('Cells are adjacent, swapping')
        return swapElements(selectedRow, selectedCol, row, col)
      } else {
        // 选择新的单元格
        console.log('Cells not adjacent, selecting new cell')
        clearSelection()
        gameState.value.selectedCell = { row, col }
        gameGrid.value.cells[row][col]!.isSelected = true
        return false
      }
    } else {
      // 选择单元格
      console.log('First cell selection')
      gameState.value.selectedCell = { row, col }
      gameGrid.value.cells[row][col]!.isSelected = true
      return false
    }
  }

  // 清除选择
  function clearSelection(): void {
    if (gameState.value.selectedCell) {
      const { row, col } = gameState.value.selectedCell
      if (gameGrid.value.cells[row][col]) {
        gameGrid.value.cells[row][col]!.isSelected = false
      }
    }
    gameState.value.selectedCell = null
  }

  // 检查是否相邻
  function isAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    const rowDiff = Math.abs(row1 - row2)
    const colDiff = Math.abs(col1 - col2)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  // 交换元素
  function swapElements(row1: number, col1: number, row2: number, col2: number): boolean {
    const element1 = gameGrid.value.cells[row1][col1]
    const element2 = gameGrid.value.cells[row2][col2]
    
    if (!element1 || !element2) return false

    console.log('Swapping elements:', element1.type, 'at', row1, col1, 'with', element2.type, 'at', row2, col2)

    // 执行交换
    gameGrid.value.cells[row1][col1] = element2
    gameGrid.value.cells[row2][col2] = element1
    
    element1.row = row2
    element1.col = col2
    element2.row = row1
    element2.col = col1

    clearSelection()

    // 检查是否形成匹配
    const matches = findMatches()
    console.log('Found matches:', matches.length)
    
    if (matches.length > 0) {
      // 播放交换音效
      audioManager.playSound('swap')
      console.log('Processing matches...')
      processMatches(matches, true) // 玩家主动交换
      return true
    } else {
      // 无效交换，回溯
      console.log('No matches found, swapping back')
      setTimeout(() => {
        gameGrid.value.cells[row1][col1] = element1
        gameGrid.value.cells[row2][col2] = element2
        element1.row = row1
        element1.col = col1
        element2.row = row2
        element2.col = col2
      }, 300)
      return false
    }
  }

  // 查找匹配
  function findMatches(): GameElement[] {
    const matches: GameElement[] = []
    const { cells, rows, cols } = gameGrid.value
    const visited = new Set<string>()

    console.log('Finding matches in grid:', rows, 'x', cols)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const element = cells[row][col]
        if (!element || visited.has(element.id)) continue

        // 查找水平匹配
        const horizontalMatches = findHorizontalMatches(row, col, element.type)
        // 查找垂直匹配
        const verticalMatches = findVerticalMatches(row, col, element.type)

        if (horizontalMatches.length >= 3) {
          console.log('Found horizontal match of type', element.type, 'at', row, col, 'length:', horizontalMatches.length)
          horizontalMatches.forEach(match => {
            if (!visited.has(match.id)) {
              matches.push(match)
              visited.add(match.id)
            }
          })
        }

        if (verticalMatches.length >= 3) {
          console.log('Found vertical match of type', element.type, 'at', row, col, 'length:', verticalMatches.length)
          verticalMatches.forEach(match => {
            if (!visited.has(match.id)) {
              matches.push(match)
              visited.add(match.id)
            }
          })
        }
      }
    }

    console.log('Total matches found:', matches.length)
    return matches
  }

  // 查找水平匹配
  function findHorizontalMatches(row: number, col: number, type: ElementType): GameElement[] {
    const matches: GameElement[] = []
    const { cells, cols } = gameGrid.value
    
    // 向左查找
    let leftCol = col
    while (leftCol >= 0 && cells[row][leftCol]?.type === type) {
      matches.unshift(cells[row][leftCol]!)
      leftCol--
    }
    
    // 向右查找
    let rightCol = col + 1
    while (rightCol < cols && cells[row][rightCol]?.type === type) {
      matches.push(cells[row][rightCol]!)
      rightCol++
    }
    
    return matches
  }

  // 查找垂直匹配
  function findVerticalMatches(row: number, col: number, type: ElementType): GameElement[] {
    const matches: GameElement[] = []
    const { cells, rows } = gameGrid.value
    
    // 向上查找
    let topRow = row
    while (topRow >= 0 && cells[topRow][col]?.type === type) {
      matches.unshift(cells[topRow][col]!)
      topRow--
    }
    
    // 向下查找
    let bottomRow = row + 1
    while (bottomRow < rows && cells[bottomRow][col]?.type === type) {
      matches.push(cells[bottomRow][col]!)
      bottomRow++
    }
    
    return matches
  }

  // 处理匹配
  function processMatches(matches: GameElement[], isPlayerMove: boolean = true): void {
    gameState.value.isAnimating = true
    
    // 记录最大连击
    const currentCombo = gameState.value.combo
    const maxCombo = parseInt(localStorage.getItem('maxCombo') || '0')
    if (currentCombo > maxCombo) {
      localStorage.setItem('maxCombo', currentCombo.toString())
    }
    
    // 播放音效
    if (gameState.value.combo > 0) {
      audioManager.playComboSound(gameState.value.combo)
    } else {
      audioManager.playSound('match')
    }
    
    // 创建粒子效果（仅在非低性能模式下）
    if (!performanceOptimizer.isLowPerformance()) {
      const particleSystem = getParticleSystem()
      if (particleSystem) {
        matches.forEach(match => {
          const element = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`)
          if (element) {
            const rect = element.getBoundingClientRect()
            const containerRect = document.querySelector('.game-board')?.getBoundingClientRect()
            if (containerRect) {
              const x = rect.left - containerRect.left + rect.width / 2
              const y = rect.top - containerRect.top + rect.height / 2
              const color = getElementColor(match.type)
              
              if (gameState.value.combo > 2) {
                particleSystem.createComboEffect(x, y, gameState.value.combo)
              } else {
                particleSystem.createMatchEffect(x, y, color)
              }
            }
          }
        })
      }
    }
    
    // 标记匹配的元素
    matches.forEach(match => {
      match.isMatched = true
    })

    // 更新分数
    const baseScore = matches.length * 10
    const comboMultiplier = Math.max(1, gameState.value.combo)
    const scoreGain = baseScore * comboMultiplier
    gameState.value.score += scoreGain
    gameState.value.combo++

    console.log('Score updated:', gameState.value.score, 'Moves:', gameState.value.moves, 'Is player move:', isPlayerMove)
    
    // 检查元素消除成就
    checkElementAchievements(matches.length)

    // 更新收集目标
    if (gameState.value.target && gameMode.value === GameMode.COLLECT) {
      matches.forEach(match => {
        if (match.type === gameState.value.target!.type) {
          gameState.value.target!.current = Math.min(
            gameState.value.target!.required,
            gameState.value.target!.current + 1
          )
          console.log('Collected target item:', match.type, 'Progress:', gameState.value.target!.current, '/', gameState.value.target!.required)
        }
      })
    }

    // 只有玩家主动交换才减少步数（除了无限模式）
    if (isPlayerMove && gameMode.value !== GameMode.INFINITE) {
      gameState.value.moves--
      console.log('Moves decreased to:', gameState.value.moves)
    }

    // 强制触发响应式更新
    nextTick(() => {
      console.log('Next tick - Score:', gameState.value.score, 'Moves:', gameState.value.moves)
    })

    // 延迟后移除匹配的元素并下落
    setTimeout(() => {
      removeMatches(matches)
      dropElements()
      fillEmptySpaces()
      
      // 播放下落音效
      audioManager.playSound('fall')
      
      // 检查是否有新的匹配（连锁反应）
      setTimeout(() => {
        const newMatches = findMatches()
        if (newMatches.length > 0) {
          // 连锁反应，不减少步数
          processMatches(newMatches, false)
        } else {
          gameState.value.isAnimating = false
          gameState.value.combo = 0
          checkGameEnd()
        }
      }, 500)
    }, 600)
  }

  // 移除匹配的元素
  function removeMatches(matches: GameElement[]): void {
    matches.forEach(match => {
      gameGrid.value.cells[match.row][match.col] = null
    })
  }

  // 元素下落
  function dropElements(): void {
    const { cells, rows, cols } = gameGrid.value
    
    for (let col = 0; col < cols; col++) {
      let writeRow = rows - 1
      
      for (let row = rows - 1; row >= 0; row--) {
        if (cells[row][col]) {
          if (writeRow !== row) {
            cells[writeRow][col] = cells[row][col]
            cells[writeRow][col]!.row = writeRow
            cells[row][col] = null
          }
          writeRow--
        }
      }
    }
  }

  // 填充空位
  function fillEmptySpaces(): void {
    const { cells, rows, cols } = gameGrid.value
    
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        if (!cells[row][col]) {
          cells[row][col] = createRandomElement(row, col)
        }
      }
    }
  }

  // 检查游戏结束
  function checkGameEnd(): void {
    if (gameMode.value === GameMode.INFINITE) {
      return // 无限模式不结束
    }

    // 经典模式：检查是否达到目标分数
    if (gameMode.value === GameMode.CLASSIC && gameState.value.score >= 500) {
      console.log('达到目标分数，触发自动完成')
      // 触发自动完成功能
      startAutoComplete()
      return
    }

    // 检查步数是否用完
    if (gameState.value.moves <= 0) {
      // 步数用完，游戏结束
      if (gameMode.value === GameMode.COLLECT) {
        // 收集模式：检查是否完成目标
        endGame(targetCompleted.value)
      } else {
        // 经典模式：步数用完就结束，根据分数判断输赢
        endGame(gameState.value.score >= 500)
      }
    } else if (gameMode.value === GameMode.COLLECT && targetCompleted.value) {
      // 收集模式：提前完成目标
      endGame(true)
    }
  }

  // 结束游戏
  function endGame(won: boolean): void {
    console.log('=== 游戏结束 ===', won ? '胜利' : '失败', '当前关卡:', gameState.value.level)
    
    // 立即设置游戏状态
    gameState.value.isGameActive = false
    console.log('设置 isGameActive = false，当前值:', gameState.value.isGameActive)
    
    // 确保游戏已经开始过，这样弹窗才会显示
    if (!gameStarted.value) {
      gameStarted.value = true
      console.log('设置 gameStarted = true，确保弹窗显示')
    }
    
    if (won) {
      // 播放胜利音效
      audioManager.playVictorySequence()
      
      // 更新玩家进度
      const currentLevel = gameState.value.level
      const stars = calculateStars()
      
      // 解锁下一关
      if (currentLevel + 1 > playerData.value.progress.currentLevel) {
        playerData.value.progress.currentLevel = currentLevel + 1
        console.log(`解锁第${currentLevel + 1}关`)
      }
      
      // 处理剧情进度
      onLevelComplete(currentLevel)
      
      // 检查成就
      checkGameAchievements(won)
      
      // 保存玩家数据
      savePlayerData()
    }
    
    console.log('游戏结束处理完成，弹窗应该显示')
    console.log('最终状态检查:', {
      isGameActive: gameState.value.isGameActive,
      gameStarted: gameStarted.value
    })
  }

  // 计算星级
  function calculateStars(): number {
    const score = gameState.value.score
    if (score >= 20000) return 3
    if (score >= 15000) return 2
    if (score >= 10000) return 1
    return 0
  }

  // 开始新游戏
  function startNewGame(mode: GameMode, level: number = null): void {
    console.log('开始新游戏:', '模式=', mode, '关卡=', level)
    
    // 如果没有指定关卡，使用保存的进度
    if (level === null) {
      level = playerData.value.progress.currentLevel
    }
    
    // 确保关卡不超过当前进度
    level = Math.min(level, playerData.value.progress.currentLevel)
    
    console.log('最终关卡设置:', level, '当前进度:', playerData.value.progress.currentLevel)
    
    // 先清除目标
    const previousTarget = gameState.value.target
    
    gameState.value = {
      score: 0,
      moves: mode === GameMode.INFINITE ? -1 : 25,
      level,
      mode,
      isGameActive: true,
      selectedCell: null,
      isAnimating: false,
      combo: 0,
      isAutoCompleting: false
    }
    
    // 标记游戏已经开始
    gameStarted.value = true

    // 播放开始音效
    audioManager.playSound('click')

    // 设置收集目标
    if (mode === GameMode.COLLECT) {
      const types = Object.values(ElementType)
      let randomType = types[Math.floor(Math.random() * types.length)]
      
      // 确保新目标与之前不同
      if (previousTarget && randomType === previousTarget.type) {
        // 如果随机到相同类型，选择下一个不同的类型
        const currentIndex = types.indexOf(randomType)
        randomType = types[(currentIndex + 1) % types.length]
      }
      
      // 根据关卡递增难度
      const requiredCount = Math.min(10 + Math.floor((level - 1) * 2), 25)
      
      gameState.value.target = {
        type: randomType,
        current: 0,
        required: requiredCount
      }
      
      console.log('New collect target:', randomType, 'required:', requiredCount)
      
      // 强制触发响应式更新
      nextTick(() => {
        console.log('Target after nextTick:', gameState.value.target)
      })
    }

    initializeGrid()
    
    // 确保游戏开始时有可用的移动
    resolveDeadlock()
    
    // 保存当前游戏状态
    saveCurrentGameState()
  }

  // 使用道具
  function useTool(toolType: 'hammer' | 'swapper' | 'rainbowBall', row?: number, col?: number): boolean {
    const inventory = playerData.value.inventory
    
    // 播放道具使用音效
    audioManager.playSound('toolUse')
    
    switch (toolType) {
      case 'hammer':
        if (inventory.hammers > 0 && row !== undefined && col !== undefined) {
          inventory.hammers--
          
          // 创建道具粒子效果
          const particleSystem = getParticleSystem()
          if (particleSystem) {
            const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
            if (element) {
              const rect = element.getBoundingClientRect()
              const containerRect = document.querySelector('.game-board')?.getBoundingClientRect()
              if (containerRect) {
                const x = rect.left - containerRect.left + rect.width / 2
                const y = rect.top - containerRect.top + rect.height / 2
                particleSystem.createToolEffect(x, y, 'hammer')
              }
            }
          }
          
          gameGrid.value.cells[row][col] = null
          dropElements()
          fillEmptySpaces()
          
          setTimeout(() => {
            const matches = findMatches()
            if (matches.length > 0) {
              processMatches(matches)
            }
          }, 300)
          return true
        }
        break
      
      case 'swapper':
        if (inventory.swappers > 0) {
          inventory.swappers--
          // 实现交换逻辑
          return true
        }
        break
      
      case 'rainbowBall':
        if (inventory.rainbowBalls > 0 && row !== undefined && col !== undefined) {
          inventory.rainbowBalls--
          
          // 创建彩虹球粒子效果
          const particleSystem = getParticleSystem()
          if (particleSystem) {
            const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
            if (element) {
              const rect = element.getBoundingClientRect()
              const containerRect = document.querySelector('.game-board')?.getBoundingClientRect()
              if (containerRect) {
                const x = rect.left - containerRect.left + rect.width / 2
                const y = rect.top - containerRect.top + rect.height / 2
                particleSystem.createToolEffect(x, y, 'rainbowBall')
              }
            }
          }
          
          const targetType = gameGrid.value.cells[row][col]?.type
          if (targetType) {
            removeAllOfType(targetType)
          }
          return true
        }
        break
    }
    
    return false
  }

  // 移除所有同类元素
  function removeAllOfType(type: ElementType): void {
    const { cells, rows, cols } = gameGrid.value
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (cells[row][col]?.type === type) {
          cells[row][col] = null
        }
      }
    }
    
    dropElements()
    fillEmptySpaces()
    
    setTimeout(() => {
      const matches = findMatches()
      if (matches.length > 0) {
        processMatches(matches)
      }
    }, 300)
  }

  // 保存玩家数据
  function savePlayerData(): void {
    const dataToSave = JSON.stringify(playerData.value)
    localStorage.setItem('playerData', dataToSave)
    console.log('保存玩家数据到localStorage')
    
    // 立即验证保存是否成功
    const saved = localStorage.getItem('playerData')
    if (saved) {
      console.log('验证localStorage中的数据')
    }
  }

  // 加载玩家数据
  function loadPlayerData(): void {
    const saved = localStorage.getItem('playerData')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        playerData.value = { ...playerData.value, ...data }
      } catch (error) {
        console.warn('Failed to load player data:', error)
      }
    }
    
    // 初始化剧情系统
    initializeStorySystem()
    
    // 初始化成就系统
    initializeAchievements()
  }

  // 保存当前游戏状态
  function saveCurrentGameState(): void {
    const currentGameState = {
      gameState: gameState.value,
      gameGrid: gameGrid.value,
      timestamp: Date.now()
    }
    localStorage.setItem('currentGameState', JSON.stringify(currentGameState))
  }

  // 加载当前游戏状态
  function loadCurrentGameState(): boolean {
    const saved = localStorage.getItem('currentGameState')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // 检查保存时间是否在24小时内
        const now = Date.now()
        const savedTime = data.timestamp || 0
        if (now - savedTime < 24 * 60 * 60 * 1000) { // 24小时
          gameState.value = data.gameState
          gameGrid.value = data.gameGrid
          gameStarted.value = true
          return true
        }
      } catch (error) {
        console.warn('Failed to load current game state:', error)
      }
    }
    return false
  }

  // 清除当前游戏状态
  function clearCurrentGameState(): void {
    localStorage.removeItem('currentGameState')
  }

  // 刷新玩家数据（从localStorage重新加载）
  function refreshPlayerData(): void {
    const saved = localStorage.getItem('playerData')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        playerData.value = { ...playerData.value, ...data }
        console.log('玩家数据已刷新')
      } catch (error) {
        console.warn('Failed to refresh player data:', error)
      }
    }
  }

  // 检查死局
  function checkDeadlock(): boolean {
    const { cells, rows, cols } = gameGrid.value
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 检查所有可能的交换
        const adjacent = [
          { row: row - 1, col },
          { row: row + 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 }
        ]
        
        for (const adj of adjacent) {
          if (adj.row >= 0 && adj.row < rows && adj.col >= 0 && adj.col < cols) {
            // 模拟交换
            const temp = cells[row][col]
            cells[row][col] = cells[adj.row][adj.col]
            cells[adj.row][adj.col] = temp
            
            const hasMatches = findMatches().length > 0
            
            // 恢复
            cells[adj.row][adj.col] = cells[row][col]
            cells[row][col] = temp
            
            if (hasMatches) {
              return false // 有可用的移动
            }
          }
        }
      }
    }
    
    return true // 死局
  }

  // 自动解决死局
  function resolveDeadlock(): void {
    if (checkDeadlock()) {
      reshuffleGrid()
      // 确保重新洗牌后没有立即的匹配
      while (findMatches().length > 0) {
        reshuffleGrid()
      }
    }
  }

  // 获取元素颜色
  function getElementColor(type: ElementType): string {
    const colors = {
      '🍓': '#FF6B6B',
      '🍋': '#FFD93D',
      '🍊': '#FF9F40',
      '🍎': '#FF4757',
      '🍇': '#A55EEA',
      '🫐': '#3742FA'
    }
    return colors[type] || '#A4B0BE'
  }

  // 剧情系统方法
  function getStoryProgress(): StoryProgress {
    const saved = localStorage.getItem('storyProgress')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.warn('Failed to load story progress:', error)
      }
    }
    return storyProgress.value
  }

  function saveStoryProgress(): void {
    localStorage.setItem('storyProgress', JSON.stringify(storyProgress.value))
  }

  function unlockStoryChapter(chapterId: number): void {
    if (!storyProgress.value.unlockedChapters.includes(chapterId)) {
      storyProgress.value.unlockedChapters.push(chapterId)
      storyProgress.value.unlockedChapters.sort((a, b) => a - b)
      saveStoryProgress()
    }
  }

  function markChapterAsRead(chapterId: number): void {
    const chapter = STORY_CHAPTERS.find(ch => ch.id === chapterId)
    if (chapter) {
      chapter.isRead = true
      storyProgress.value.lastReadChapter = chapterId
      
      // 保存所有已读章节的状态
      const readChapters = STORY_CHAPTERS.filter(ch => ch.isRead).map(ch => ch.id)
      localStorage.setItem('storyChaptersRead', JSON.stringify(readChapters))
      
      // 检查剧情成就
      checkStoryAchievements()
      
      saveStoryProgress()
    }
  }

  function getUnlockedChapters(): number[] {
    return storyProgress.value.unlockedChapters
  }

  function getUnreadChapters(): number[] {
    return storyProgress.value.unlockedChapters.filter(chapterId => {
      const chapter = STORY_CHAPTERS.find(ch => ch.id === chapterId)
      return chapter && !chapter.isRead
    })
  }

  function shouldShowStoryForLevel(level: number): boolean {
    const unreadChapters = getUnreadChapters()
    return unreadChapters.some(chapterId => {
      const chapter = STORY_CHAPTERS.find(ch => ch.id === chapterId)
      return chapter && chapter.unlockedAt <= level
    })
  }

  function getNextAvailableChapter(level: number): number | null {
    const availableChapter = STORY_CHAPTERS.find(chapter => 
      chapter.unlockedAt <= level && !chapter.isRead
    )
    return availableChapter ? availableChapter.id : null
  }

  function getUnlockedChapters(): number[] {
    return storyProgress.value.unlockedChapters
  }

  function getUnreadChapters(): number[] {
    return storyProgress.value.unlockedChapters.filter(chapterId => {
      const chapter = STORY_CHAPTERS.find(ch => ch.id === chapterId)
      return chapter && !chapter.isRead
    })
  }

  // 在关卡完成时自动解锁新章节
  function onLevelComplete(level: number): void {
    // 解锁新章节 - 只有当关卡达到章节的解锁要求时才解锁
    STORY_CHAPTERS.forEach(chapter => {
      if (chapter.unlockedAt <= level && !storyProgress.value.unlockedChapters.includes(chapter.id)) {
        unlockStoryChapter(chapter.id)
      }
    })
    
    // 更新当前章节
    const maxUnlockedChapter = Math.max(...storyProgress.value.unlockedChapters)
    if (maxUnlockedChapter > storyProgress.value.currentChapter) {
      storyProgress.value.currentChapter = maxUnlockedChapter
    }
    
    saveStoryProgress()
  }

  // 自动完成功能
  function startAutoComplete(): void {
    if (gameMode.value !== GameMode.CLASSIC || gameState.value.isAutoCompleting) {
      return
    }
    
    console.log('开始自动完成，剩余步数:', gameState.value.moves)
    gameState.value.isAutoCompleting = true
    
    // 播放特殊音效表示开始自动完成
    audioManager.playSound('victory')
    
    // 立即分配特殊能力到方块（传递当前的剩余步数）
    assignSpecialPowers()
    
    // 分配完特殊能力后，再将步数设为0
    gameState.value.moves = 0
    console.log('自动完成开始，步数已设为0')
  }
  
  function assignSpecialPowers(): void {
    const { cells, rows, cols } = gameGrid.value
    
    // 在函数开始时就保存剩余步数，避免被后续修改影响
    const remainingMoves = gameState.value.moves
    console.log('分配特殊能力，使用剩余步数:', remainingMoves)
    
    const availablePositions: { row: number; col: number }[] = []
    
    // 收集所有可用位置
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (cells[row][col] && !cells[row][col]!.isMatched) {
          availablePositions.push({ row, col })
        }
      }
    }
    
    // 随机分配特殊能力
    for (let i = 0; i < remainingMoves && i < availablePositions.length; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length)
      const position = availablePositions.splice(randomIndex, 1)[0]
      const element = cells[position.row][position.col]
      
      if (element) {
        element.isSpecialPower = true
        
        // 随机分配消除类型
        const rand = Math.random()
        if (rand < 0.4) {
          element.powerType = 'row' // 40% 消除行
        } else if (rand < 0.8) {
          element.powerType = 'col' // 40% 消除列
        } else {
          element.powerType = 'both' // 20% 消除全屏
        }
        
        console.log(`分配特殊能力: [${position.row},${position.col}] -> ${element.powerType}`)
      }
    }
    
    console.log(`总共分配了 ${Math.min(remainingMoves, availablePositions.length)} 个特殊能力`)
    
    // 3秒后执行统一消除
    setTimeout(() => {
      executeSpecialElimination()
    }, 3000)
  }
  
  function executeSpecialElimination(): void {
    const { cells, rows, cols } = gameGrid.value
    const elementsToEliminate: Set<string> = new Set()
    
    // 收集所有需要消除的元素
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const element = cells[row][col]
        if (element?.isSpecialPower) {
          switch (element.powerType) {
            case 'row':
              // 消除整行
              for (let c = 0; c < cols; c++) {
                if (cells[row][c]) {
                  elementsToEliminate.add(cells[row][c]!.id)
                }
              }
              break
            case 'col':
              // 消除整列
              for (let r = 0; r < rows; r++) {
                if (cells[r][col]) {
                  elementsToEliminate.add(cells[r][col]!.id)
                }
              }
              break
            case 'both':
              // 消除全屏
              for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  if (cells[r][c]) {
                    elementsToEliminate.add(cells[r][c]!.id)
                  }
                }
              }
              break
          }
        }
      }
    }
    
    // 执行消除
    const matches: GameElement[] = []
    elementsToEliminate.forEach(id => {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (cells[row][col]?.id === id) {
            matches.push(cells[row][col]!)
          }
        }
      }
    })
    
    console.log(`统一消除 ${matches.length} 个方块`)
    
    // 处理匹配
    if (matches.length > 0) {
      processSpecialMatches(matches)
    } else {
      // 没有特殊方块，直接结束游戏
      gameState.value.isAutoCompleting = false
      endGame(true)
    }
  }
  
  function processChainReaction(matches: GameElement[]): void {
    gameState.value.isAnimating = true
    
    // 标记匹配的元素
    matches.forEach(match => {
      match.isMatched = true
    })

    // 更新分数
    const baseScore = matches.length * 10
    const comboMultiplier = Math.max(1, gameState.value.combo)
    const scoreGain = baseScore * comboMultiplier
    gameState.value.score += scoreGain
    gameState.value.combo++

    // 确保步数保持为0
    if (gameState.value.moves !== 0) {
      console.log('连锁反应中步数不为0，强制设为0')
      gameState.value.moves = 0
    }

    console.log('连锁反应得分:', scoreGain, '总分:', gameState.value.score, '步数:', gameState.value.moves)

    // 延迟后移除匹配的元素并下落
    setTimeout(() => {
      removeMatches(matches)
      dropElements()
      fillEmptySpaces()
      
      // 播放下落音效
      audioManager.playSound('fall')
      
      // 递归检查更多连锁反应
      setTimeout(() => {
        const moreMatches = findMatches()
        if (moreMatches.length > 0) {
          // 继续连锁反应
          processChainReaction(moreMatches)
        } else {
          // 自动完成结束
          gameState.value.isAutoCompleting = false
          gameState.value.combo = 0
          gameState.value.isAnimating = false
          console.log('自动完成结束，步数为0，结束游戏')
          
          // 直接结束游戏，因为已经达到了目标分数
          endGame(true)
        }
      }, 500)
    }, 600)
  }

  function processSpecialMatches(matches: GameElement[]): void {
    gameState.value.isAnimating = true
    
    // 播放特殊音效
    audioManager.playComboSound(matches.length / 10) // 基于消除数量的连击音效
    
    // 标记匹配的元素
    matches.forEach(match => {
      match.isMatched = true
    })

    // 更新分数（特殊消除给予额外分数）
    const baseScore = matches.length * 20 // 特殊消除基础分数更高
    const comboMultiplier = Math.max(1, gameState.value.combo)
    const scoreGain = baseScore * comboMultiplier
    gameState.value.score += scoreGain
    gameState.value.combo++

    // 确保步数为0（在startAutoComplete中已经设置，但再次确保）
    if (gameState.value.moves !== 0) {
      console.log('警告：步数不为0，强制设为0')
      gameState.value.moves = 0
    }
    
    console.log('特殊消除得分:', scoreGain, '总分:', gameState.value.score, '步数:', gameState.value.moves)

    // 延迟后移除匹配的元素并下落
    setTimeout(() => {
      removeMatches(matches)
      dropElements()
      fillEmptySpaces()
      
      // 播放下落音效
      audioManager.playSound('fall')
      
      // 检查是否有新的匹配（连锁反应）
      setTimeout(() => {
        const newMatches = findMatches()
        if (newMatches.length > 0) {
          // 连锁反应，使用专门的处理函数
          processChainReaction(newMatches)
        } else {
          // 自动完成结束
          gameState.value.isAutoCompleting = false
          gameState.value.combo = 0
          gameState.value.isAnimating = false
          console.log('=== 自动完成结束，准备调用 endGame ===')
          console.log('调用前状态:', {
            isGameActive: gameState.value.isGameActive,
            gameStarted: gameStarted.value,
            score: gameState.value.score,
            level: gameState.value.level
          })
          
          // 直接结束游戏，因为已经达到了目标分数
          endGame(true)
          
          console.log('调用 endGame 后状态:', {
            isGameActive: gameState.value.isGameActive,
            gameStarted: gameStarted.value
          })
        }
      }, 500)
    }, 1000)
  }

  // 初始化剧情系统
  function initializeStorySystem(): void {
    const savedProgress = getStoryProgress()
    storyProgress.value = savedProgress
    
    // 恢复章节阅读状态 - 从本地存储中恢复
    const savedStoryData = localStorage.getItem('storyChaptersRead')
    if (savedStoryData) {
      try {
        const readChapters = JSON.parse(savedStoryData)
        STORY_CHAPTERS.forEach(chapter => {
          chapter.isRead = readChapters.includes(chapter.id)
        })
      } catch (error) {
        console.warn('Failed to load story chapters read status:', error)
        // 如果加载失败，只恢复最后阅读的章节
        STORY_CHAPTERS.forEach(chapter => {
          chapter.isRead = savedProgress.lastReadChapter === chapter.id
        })
      }
    } else {
      // 如果没有保存的数据，只恢复最后阅读的章节
      STORY_CHAPTERS.forEach(chapter => {
        chapter.isRead = savedProgress.lastReadChapter === chapter.id
      })
    }
  }

  // 成就系统方法
  function initializeAchievements(): void {
    loadAchievements()
    console.log('成就系统已初始化')
  }

  function checkAchievements(type: string, value: number, condition?: string): void {
    achievements.value.forEach(achievement => {
      // 跳过已解锁的成就
      if (achievement.isUnlocked) return
      
      // 检查成就类型是否匹配
      if (achievement.requirement.type !== type) return
      
      // 检查特殊条件
      if (achievement.requirement.condition && condition !== achievement.requirement.condition) return
      
      // 检查是否满足解锁条件
      if (value >= achievement.requirement.target) {
        unlockAchievement(achievement.id)
      } else {
        // 更新进度
        updateAchievementProgress(achievement.id, value)
      }
    })
  }

  function unlockAchievement(achievementId: string): void {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement || achievement.isUnlocked) return
    
    // 标记为已解锁
    achievement.isUnlocked = true
    achievement.unlockedAt = new Date()
    
    // 更新玩家成就数据
    if (!playerAchievements.value.unlockedAchievements.includes(achievementId)) {
      playerAchievements.value.unlockedAchievements.push(achievementId)
      playerAchievements.value.unlockedCount++
      playerAchievements.value.lastUnlocked = achievementId
      playerAchievements.value.unlockedAt = new Date()
    }
    
    // 更新进度
    playerAchievements.value.achievementProgress[achievementId] = {
      achievementId,
      currentProgress: achievement.requirement.target,
      isUnlocked: true,
      unlockedAt: new Date()
    }
    
    // 发放奖励
    grantAchievementReward(achievement)
    
    // 显示成就通知
    showAchievementPopup(achievement)
    
    // 保存成就数据
    saveAchievements()
    
    console.log(`成就已解锁: ${achievement.title}`)
  }

  function updateAchievementProgress(achievementId: string, progress: number): void {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement || achievement.isUnlocked) return
    
    // 只对进度型成就更新进度
    if (achievement.type !== 'progressive' && achievement.type !== 'cumulative') return
    
    // 获取当前进度
    const currentProgress = playerAchievements.value.achievementProgress[achievementId]?.currentProgress || 0
    
    // 更新进度
    const newProgress = Math.max(currentProgress, progress)
    playerAchievements.value.achievementProgress[achievementId] = {
      achievementId,
      currentProgress: newProgress,
      isUnlocked: false
    }
    
    // 更新成就对象的进度
    if (achievement.progress !== undefined && achievement.maxProgress !== undefined) {
      achievement.progress = newProgress
    }
    
    // 检查是否达到目标
    if (newProgress >= achievement.requirement.target) {
      unlockAchievement(achievementId)
    }
  }

  function grantAchievementReward(achievement: Achievement): void {
    switch (achievement.reward.type) {
      case 'items':
        grantItems(achievement.reward.value as number)
        break
      case 'titles':
        // 称号系统可以后续扩展
        console.log(`获得称号: ${achievement.reward.value}`)
        break
      case 'stars':
        // 星星系统可以后续扩展
        console.log(`获得星星: ${achievement.reward.value}`)
        break
      default:
        break
    }
  }

  function grantItems(count: number): void {
    // 随机分配道具
    const items = ['hammers', 'swappers', 'rainbowBalls']
    const randomItem = items[Math.floor(Math.random() * items.length)]
    playerData.value.inventory[randomItem as keyof PlayerInventory] += count
    savePlayerData()
  }

  function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return achievements.value.filter(a => a.category === category)
  }

  function getUnlockedAchievements(): Achievement[] {
    return achievements.value.filter(a => a.isUnlocked)
  }

  function getLockedAchievements(): Achievement[] {
    return achievements.value.filter(a => !a.isUnlocked)
  }

  function getAchievementProgress(achievementId: string): number {
    const progress = playerAchievements.value.achievementProgress[achievementId]
    return progress ? progress.currentProgress : 0
  }

  function saveAchievements(): void {
    const dataToSave = {
      unlockedAchievements: playerAchievements.value.unlockedAchievements,
      achievementProgress: playerAchievements.value.achievementProgress,
      lastUnlocked: playerAchievements.value.lastUnlocked,
      unlockedAt: playerAchievements.value.unlockedAt
    }
    localStorage.setItem('playerAchievements', JSON.stringify(dataToSave))
  }

  function loadAchievements(): void {
    const saved = localStorage.getItem('playerAchievements')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        playerAchievements.value.unlockedAchievements = data.unlockedAchievements || []
        playerAchievements.value.achievementProgress = data.achievementProgress || {}
        playerAchievements.value.lastUnlocked = data.lastUnlocked
        playerAchievements.value.unlockedAt = data.unlockedAt ? new Date(data.unlockedAt) : undefined
        playerAchievements.value.unlockedCount = playerAchievements.value.unlockedAchievements.length
        
        // 更新成就状态
        achievements.value.forEach(achievement => {
          if (playerAchievements.value.unlockedAchievements.includes(achievement.id)) {
            achievement.isUnlocked = true
            achievement.unlockedAt = playerAchievements.value.unlockedAt
          }
          
          // 更新进度
          const progress = playerAchievements.value.achievementProgress[achievement.id]
          if (progress && !achievement.isUnlocked) {
            if (achievement.progress !== undefined && achievement.maxProgress !== undefined) {
              achievement.progress = progress.currentProgress
            }
          }
        })
      } catch (error) {
        console.warn('Failed to load achievements:', error)
      }
    }
  }

  function showAchievementPopup(achievement: Achievement): void {
    const notification: AchievementNotification = {
      achievement,
      isNew: true,
      showTime: Date.now()
    }
    
    achievementNotifications.value.push(notification)
    showAchievementNotification.value = true
    
    // 播放成就音效
    audioManager.playSound('achievement')
    
    // 自动隐藏通知
    setTimeout(() => {
      hideAchievementPopup()
    }, 3000)
  }

  function hideAchievementPopup(): void {
    showAchievementNotification.value = false
  }

  function checkGameAchievements(won: boolean): void {
    if (!won) return
    
    // 检查游戏次数成就
    const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0') + 1
    localStorage.setItem('gamesPlayed', gamesPlayed.toString())
    checkAchievements('games', gamesPlayed)
    
    // 检查分数成就
    checkAchievements('score', gameState.value.score)
    
    // 检查关卡成就
    checkAchievements('level', playerData.value.progress.currentLevel)
    
    // 检查连击成就
    const maxCombo = parseInt(localStorage.getItem('maxCombo') || '0')
    checkAchievements('combo', maxCombo)
  }

  function checkElementAchievements(elementsCount: number): void {
    // 检查收集成就
    const totalElements = parseInt(localStorage.getItem('totalElements') || '0') + elementsCount
    localStorage.setItem('totalElements', totalElements.toString())
    checkAchievements('elements', totalElements)
  }

  function checkStoryAchievements(): void {
    // 检查剧情成就
    const readChapters = storyProgress.value.unlockedChapters.filter(chapterId => {
      const chapter = STORY_CHAPTERS.find(ch => ch.id === chapterId)
      return chapter && chapter.isRead
    })
    checkAchievements('chapters', readChapters.length)
  }

  function checkSpecialAchievements(type: string): void {
    // 检查特殊成就
    checkAchievements('special', 1, type)
  }

  return {
    // 状态
    gameState,
    gameGrid,
    playerData,
    gameStarted,
    storyProgress,
    
    // 计算属性
    currentScore,
    remainingMoves,
    currentLevel,
    gameMode,
    isGameActive,
    targetProgress,
    targetCompleted,
    
    // 方法
    initializeGrid,
    selectCell,
    startNewGame,
    useTool,
    savePlayerData,
    loadPlayerData,
    refreshPlayerData,
    saveCurrentGameState,
    loadCurrentGameState,
    clearCurrentGameState,
    checkDeadlock,
    resolveDeadlock,
    getElementColor,
    
    // 自动完成方法
    startAutoComplete,
    assignSpecialPowers,
    executeSpecialElimination,
    
    // 剧情系统方法
    getStoryProgress,
    saveStoryProgress,
    unlockStoryChapter,
    markChapterAsRead,
    getUnlockedChapters,
    getUnreadChapters,
    shouldShowStoryForLevel,
    getNextAvailableChapter,
    onLevelComplete,
    initializeStorySystem,
    
    // 成就系统状态
    achievements,
    playerAchievements,
    achievementNotifications,
    showAchievementNotification,
    
    // 成就系统方法
    initializeAchievements,
    checkAchievements,
    unlockAchievement,
    updateAchievementProgress,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress,
    saveAchievements,
    loadAchievements,
    showAchievementPopup,
    hideAchievementPopup,
    checkGameAchievements,
    checkElementAchievements,
    checkStoryAchievements,
    checkSpecialAchievements,
    
    // 快捷方法
    startGame: startNewGame,
    restartGame: () => startNewGame(gameState.value.mode, gameState.value.level)
  }
})