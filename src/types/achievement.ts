// 成就类型定义
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  type: AchievementType
  requirement: AchievementRequirement
  reward: AchievementReward
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  isHidden?: boolean
}

export enum AchievementCategory {
  GAMEPLAY = 'gameplay',    // 游戏玩法相关
  COLLECTION = 'collection', // 收集相关
  SCORE = 'score',         // 分数相关
  COMBO = 'combo',         // 连击相关
  LEVEL = 'level',         // 关卡相关
  STORY = 'story',         // 剧情相关
  SPECIAL = 'special'      // 特殊成就
}

export enum AchievementType {
  SINGLE = 'single',       // 一次性成就
  PROGRESSIVE = 'progressive', // 进度型成就
  CUMULATIVE = 'cumulative'   // 累计型成就
}

export interface AchievementRequirement {
  type: 'score' | 'level' | 'combo' | 'moves' | 'elements' | 'games' | 'chapters' | 'special'
  target: number
  condition?: string       // 额外条件
}

export interface AchievementReward {
  type: 'stars' | 'items' | 'titles' | 'nothing'
  value: number | string
  description: string
}

export interface AchievementProgress {
  achievementId: string
  currentProgress: number
  isUnlocked: boolean
  unlockedAt?: Date
}

export interface PlayerAchievements {
  unlockedAchievements: string[]
  achievementProgress: Record<string, AchievementProgress>
  totalAchievements: number
  unlockedCount: number
  lastUnlocked?: string
  unlockedAt?: Date
}

// 成就定义
export const ACHIEVEMENTS: Achievement[] = [
  // 游戏玩法成就
  {
    id: 'first_game',
    title: '初次体验',
    description: '完成第一局游戏',
    icon: '🎮',
    category: AchievementCategory.GAMEPLAY,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'games',
      target: 1
    },
    reward: {
      type: 'items',
      value: 3,
      description: '获得3个锤子'
    },
    isUnlocked: false
  },
  {
    id: 'win_10_games',
    title: '小有成就',
    description: '累计赢得10局游戏',
    icon: '🏆',
    category: AchievementCategory.GAMEPLAY,
    type: AchievementType.CUMULATIVE,
    requirement: {
      type: 'games',
      target: 10
    },
    reward: {
      type: 'items',
      value: 5,
      description: '获得5个交换器'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'win_50_games',
    title: '游戏达人',
    description: '累计赢得50局游戏',
    icon: '👑',
    category: AchievementCategory.GAMEPLAY,
    type: AchievementType.CUMULATIVE,
    requirement: {
      type: 'games',
      target: 50
    },
    reward: {
      type: 'titles',
      value: '消除大师',
      description: '获得"消除大师"称号'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 50
  },
  
  // 分数成就
  {
    id: 'score_1000',
    title: '初露锋芒',
    description: '单局得分达到1000分',
    icon: '⭐',
    category: AchievementCategory.SCORE,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'score',
      target: 1000
    },
    reward: {
      type: 'stars',
      value: 1,
      description: '获得1颗星'
    },
    isUnlocked: false
  },
  {
    id: 'score_10000',
    title: '得分高手',
    description: '单局得分达到10000分',
    icon: '🌟',
    category: AchievementCategory.SCORE,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'score',
      target: 10000
    },
    reward: {
      type: 'items',
      value: 2,
      description: '获得2个彩虹球'
    },
    isUnlocked: false
  },
  {
    id: 'score_50000',
    title: '分数传奇',
    description: '单局得分达到50000分',
    icon: '💫',
    category: AchievementCategory.SCORE,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'score',
      target: 50000
    },
    reward: {
      type: 'titles',
      value: '分数传奇',
      description: '获得"分数传奇"称号'
    },
    isUnlocked: false
  },
  
  // 连击成就
  {
    id: 'combo_5',
    title: '连击新手',
    description: '达到5连击',
    icon: '🔥',
    category: AchievementCategory.COMBO,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'combo',
      target: 5
    },
    reward: {
      type: 'items',
      value: 2,
      description: '获得2个锤子'
    },
    isUnlocked: false
  },
  {
    id: 'combo_10',
    title: '连击高手',
    description: '达到10连击',
    icon: '💥',
    category: AchievementCategory.COMBO,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'combo',
      target: 10
    },
    reward: {
      type: 'items',
      value: 3,
      description: '获得3个交换器'
    },
    isUnlocked: false
  },
  {
    id: 'combo_20',
    title: '连击大师',
    description: '达到20连击',
    icon: '⚡',
    category: AchievementCategory.COMBO,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'combo',
      target: 20
    },
    reward: {
      type: 'titles',
      value: '连击大师',
      description: '获得"连击大师"称号'
    },
    isUnlocked: false
  },
  
  // 关卡成就
  {
    id: 'level_5',
    title: '初级冒险者',
    description: '达到第5关',
    icon: '🗺️',
    category: AchievementCategory.LEVEL,
    type: AchievementType.PROGRESSIVE,
    requirement: {
      type: 'level',
      target: 5
    },
    reward: {
      type: 'items',
      value: 3,
      description: '获得3个锤子'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'level_10',
    title: '中级冒险者',
    description: '达到第10关',
    icon: '🧭',
    category: AchievementCategory.LEVEL,
    type: AchievementType.PROGRESSIVE,
    requirement: {
      type: 'level',
      target: 10
    },
    reward: {
      type: 'items',
      value: 5,
      description: '获得5个彩虹球'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'level_20',
    title: '高级冒险者',
    description: '达到第20关',
    icon: '🏔️',
    category: AchievementCategory.LEVEL,
    type: AchievementType.PROGRESSIVE,
    requirement: {
      type: 'level',
      target: 20
    },
    reward: {
      type: 'titles',
      value: '冒险大师',
      description: '获得"冒险大师"称号'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 20
  },
  
  // 收集成就
  {
    id: 'collect_100_elements',
    title: '收集新手',
    description: '累计消除100个水果',
    icon: '🍓',
    category: AchievementCategory.COLLECTION,
    type: AchievementType.CUMULATIVE,
    requirement: {
      type: 'elements',
      target: 100
    },
    reward: {
      type: 'items',
      value: 2,
      description: '获得2个锤子'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'collect_1000_elements',
    title: '收集达人',
    description: '累计消除1000个水果',
    icon: '🍎',
    category: AchievementCategory.COLLECTION,
    type: AchievementType.CUMULATIVE,
    requirement: {
      type: 'elements',
      target: 1000
    },
    reward: {
      type: 'items',
      value: 5,
      description: '获得5个交换器'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000
  },
  {
    id: 'collect_5000_elements',
    title: '收集大师',
    description: '累计消除5000个水果',
    icon: '🍇',
    category: AchievementCategory.COLLECTION,
    type: AchievementType.CUMULATIVE,
    requirement: {
      type: 'elements',
      target: 5000
    },
    reward: {
      type: 'titles',
      value: '收集大师',
      description: '获得"收集大师"称号'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 5000
  },
  
  // 剧情成就
  {
    id: 'read_first_chapter',
    title: '故事开始',
    description: '阅读第一个章节',
    icon: '📖',
    category: AchievementCategory.STORY,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'chapters',
      target: 1
    },
    reward: {
      type: 'items',
      value: 2,
      description: '获得2个锤子'
    },
    isUnlocked: false
  },
  {
    id: 'read_all_chapters',
    title: '故事大师',
    description: '阅读所有章节',
    icon: '📚',
    category: AchievementCategory.STORY,
    type: AchievementType.PROGRESSIVE,
    requirement: {
      type: 'chapters',
      target: 10
    },
    reward: {
      type: 'titles',
      value: '故事大师',
      description: '获得"故事大师"称号'
    },
    isUnlocked: false,
    progress: 0,
    maxProgress: 10
  },
  
  // 特殊成就
  {
    id: 'perfect_game',
    title: '完美游戏',
    description: '在不使用任何道具的情况下完成一局游戏',
    icon: '💎',
    category: AchievementCategory.SPECIAL,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'special',
      target: 1,
      condition: 'no_tools'
    },
    reward: {
      type: 'items',
      value: 3,
      description: '获得3个彩虹球'
    },
    isUnlocked: false
  },
  {
    id: 'speed_demon',
    title: '极速通关',
    description: '在30秒内完成一局游戏',
    icon: '⚡',
    category: AchievementCategory.SPECIAL,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'special',
      target: 1,
      condition: 'under_30s'
    },
    reward: {
      type: 'titles',
      value: '极速玩家',
      description: '获得"极速玩家"称号'
    },
    isUnlocked: false
  },
  {
    id: 'lucky_player',
    title: '幸运玩家',
    description: '在一局游戏中触发3次自动完成',
    icon: '🍀',
    category: AchievementCategory.SPECIAL,
    type: AchievementType.SINGLE,
    requirement: {
      type: 'special',
      target: 3,
      condition: 'auto_complete'
    },
    reward: {
      type: 'items',
      value: 5,
      description: '获得5个彩虹球'
    },
    isUnlocked: false
  }
]

// 成就通知类型
export interface AchievementNotification {
  achievement: Achievement
  isNew: boolean
  showTime: number
}