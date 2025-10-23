export interface StoryChapter {
  id: number
  title: string
  content: string
  character?: string
  characterDialogue?: string
  background?: string
  storyImage?: string
  fruitTheme?: string
  fruitIcons?: string[]
  unlockedAt: number
  isRead: boolean
}

export interface StoryProgress {
  currentChapter: number
  unlockedChapters: number[]
  lastReadChapter: number | null
}

export interface Character {
  name: string
  avatar: string
  description: string
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: "水果王国的危机",
    content: "在遥远的水果王国里，一场突如其来的魔法风暴席卷了整个大地。邪恶的暗影法师偷走了水果王国的彩虹水晶，王国失去了往日的色彩和活力。作为水果王国的勇士，你必须通过消除魔法水果来收集能量，找回失落的彩虹水晶。",
    character: "水果长老",
    characterDialogue: "孩子，你是我们最后的希望。彩虹水晶是王国的生命之源，没有它，我们的家园将永远失去色彩。记住，每一次水果消除都是在为王国注入新的生命力。去吧，勇敢的战士！",
    background: "fruit-kingdom-crisis",
    storyImage: "🌪️",
    fruitTheme: "mixed-fruits",
    fruitIcons: ["🍎", "🍊", "🍋", "🍇", "🍓", "🍑"],
    unlockedAt: 1,
    isRead: false
  },
  {
    id: 2,
    title: "草莓精灵的指引",
    content: "草莓精灵出现在你面前，她是水果王国的守护者之一。'勇敢的冒险者，'她说，'要找回彩虹水晶，你必须掌握水果消除的古老魔法。每当你成功消除水果，就能收集到纯净的魔法能量。'她递给你一本古老的魔法书，上面记载着水果消除的秘密。",
    character: "草莓精灵",
    characterDialogue: "甜美的力量来自于内心的纯净，就像草莓一样。当你消除水果时，要用心感受它们之间的连接。记住，三个相同的水果连成一线，就能释放出最纯净的魔法能量！",
    background: "strawberry-spirit-guide",
    storyImage: "📖",
    fruitTheme: "strawberry",
    fruitIcons: ["🍓", "🍓", "🍓", "🌸", "✨", "💫"],
    unlockedAt: 2,
    isRead: false
  },
  {
    id: 3,
    title: "柠檬法师的试炼",
    content: "在柠檬森林深处，你遇到了智慧的柠檬法师。他设下了三道试炼：第一道是速度的考验，第二道是智慧的考验，第三道是耐心的考验。只有通过所有试炼，才能获得柠檬法师的祝福，增强你的魔法力量。",
    character: "柠檬法师",
    characterDialogue: "酸涩的智慧往往隐藏在挑战之中。我的试炼将考验你的反应速度、策略思维和坚持不懈的精神。记住，真正的魔法师不仅要有力量，更要有智慧和耐心。准备好接受试炼了吗？",
    background: "lemon-wizard-trial",
    storyImage: "⚡",
    fruitTheme: "lemon",
    fruitIcons: ["🍋", "🍋", "🍋", "⚡", "🔮", "🌟"],
    unlockedAt: 3,
    isRead: false
  },
  {
    id: 4,
    title: "橙子骑士的勇气",
    content: "橙子骑士是水果王国最勇敢的战士。他告诉你，暗影法师的城堡被黑魔法笼罩，需要收集足够的勇气之光才能突破黑暗屏障。每一颗橙子都蕴含着勇气之力，消除它们时你会感受到内心的力量在增长。",
    character: "橙子骑士",
    characterDialogue: "勇气不是不害怕，而是即使害怕也要前进！每一颗橙子都蕴含着太阳的力量，当你消除它们时，勇气之光就会照亮前方的道路。暗影法师的黑暗并不可怕，可怕的是失去前进的勇气！",
    background: "orange-knight-courage",
    storyImage: "🏰",
    fruitTheme: "orange",
    fruitIcons: ["🍊", "🍊", "🍊", "🛡️", "⚔️", "🔥"],
    unlockedAt: 4,
    isRead: false
  },
  {
    id: 5,
    title: "苹果智者的智慧",
    content: "在智慧的苹果树下，苹果智者与你分享古老的预言。'当七色彩虹重新闪耀，水果王国将迎来新的黎明。但要记住，真正的力量不仅在于技巧，更在于内心的纯净。'他教会你如何看透水果组合的本质，找到最佳的消除策略。",
    character: "苹果智者",
    characterDialogue: "智慧如苹果，需要时间沉淀。真正的消除大师不仅要看到眼前的组合，更要预见未来的可能。每一步都要深思熟虑，每一个选择都可能影响整个局面。记住，最简单的水果往往蕴含着最深刻的道理。",
    background: "apple-sage-wisdom",
    storyImage: "🌳",
    fruitTheme: "apple",
    fruitIcons: ["🍎", "🍎", "🍎", "📚", "🧘‍♂️", "🌙"],
    unlockedAt: 5,
    isRead: false
  },
  {
    id: 6,
    title: "葡萄女巫的秘密",
    content: "神秘的葡萄女巫出现在你面前，她曾经是暗影法师的同伴，但现在选择了光明。她揭示了暗影法师的弱点：彩虹水晶的力量来自于水果的和谐共鸣。只有当所有水果种类完美配合时，才能发挥最强大的魔法。",
    character: "葡萄女巫",
    characterDialogue: "我曾经也迷失在黑暗中，但光明终究会找到出路。暗影法师的弱点在于他不懂得和谐的力量。每一种水果都有其独特的能量，只有当它们完美配合时，才能发挥最强大的魔法。记住，团结就是力量！",
    background: "grape-witch-secret",
    storyImage: "🌙",
    fruitTheme: "grape",
    fruitIcons: ["🍇", "🍇", "🍇", "🔮", "🌙", "✨"],
    unlockedAt: 6,
    isRead: false
  },
  {
    id: 7,
    title: "蓝莓守护者的守护",
    content: "蓝莓守护者守护着通往暗影城堡的最后道路。她告诉你，暗影法师之所以变得邪恶，是因为失去了对美好事物的感知。通过水果消除的魔法，你不仅是在拯救王国，也是在帮助暗影法师找回内心的光明。",
    character: "蓝莓守护者",
    characterDialogue: "守护不仅仅是保护，更是理解和包容。暗影法师曾经也是善良的，只是被黑暗蒙蔽了双眼。你每一次消除水果，都是在用美好和纯净来对抗黑暗。记住，最强的力量不是摧毁，而是治愈和救赎。",
    background: "blueberry-guardian-protection",
    storyImage: "🌉",
    fruitTheme: "blueberry",
    fruitIcons: ["🫐", "🫐", "🫐", "🛡️", "💎", "🌟"],
    unlockedAt: 7,
    isRead: false
  },
  {
    id: 8,
    title: "彩虹水晶的觉醒",
    content: "终于，你来到了暗影城堡的核心。彩虹水晶就在眼前，但它被黑暗魔法束缚着。当你将收集到的所有水果魔法能量注入水晶时，七彩光芒冲破黑暗，整个水果王国重新焕发生机。暗影法师在光芒中露出了久违的笑容，他终于从黑暗中解脱。",
    character: "所有角色",
    characterDialogue: "在所有人的努力下，光明终于战胜了黑暗！彩虹水晶重新闪耀，水果王国迎来了新的黎明。感谢你，勇敢的战士，你不仅拯救了王国，也治愈了迷失的灵魂。记住，这份力量将永远与你同在。",
    background: "rainbow-crystal-awakening",
    storyImage: "✨",
    fruitTheme: "rainbow",
    fruitIcons: ["🌈", "💎", "✨", "🍎", "🍊", "🍋", "🍇", "🍓"],
    unlockedAt: 8,
    isRead: false
  },
  {
    id: 9,
    title: "水果王国的重生",
    content: "随着彩虹水晶的复苏，水果王国迎来了前所未有的繁荣。各种水果都散发出更加鲜艳的色彩，空气中弥漫着甜美的香气。水果王国的居民们为你举行了盛大的庆祝仪式，你成为了王国的永恒英雄。但你知道，这只是新冒险的开始...",
    character: "水果长老",
    characterDialogue: "英雄，你做到了！水果王国因你而重生，每一颗水果都在为你歌唱。你的名字将被永远铭记在水果王国的史册中。但是，记住，英雄的旅程永远不会真正结束，新的挑战总在等待着勇敢的人。",
    background: "fruit-kingdom-rebirth",
    storyImage: "🌈",
    fruitTheme: "celebration",
    fruitIcons: ["🎉", "🎊", "🏆", "👑", "🍎", "🍊", "🍋", "🍇", "🍓"],
    unlockedAt: 9,
    isRead: false
  },
  {
    id: 10,
    title: "新的挑战",
    content: "就在和平回归之际，天空中出现了一道神秘的裂缝。另一个世界的水果魔法正在渗透进来，带来了新的挑战和机遇。水果长老交给你新的使命：探索这个神秘的新世界，建立两个水果王国之间的桥梁。冒险永远不会结束...",
    character: "神秘使者",
    characterDialogue: "来自异世界的问候，勇敢的战士。我是另一个水果王国的使者，我们的世界也面临着危机。只有连接两个世界的水果魔法，才能拯救我们两个家园。你愿意接受这个新的使命吗？更大的冒险在等待着...",
    background: "new-challenge",
    storyImage: "🌀",
    fruitTheme: "mystery",
    fruitIcons: ["🌌", "🌠", "🔮", "🚪", "🗝️", "✨"],
    unlockedAt: 10,
    isRead: false
  }
]

export const CHARACTERS: Character[] = [
  {
    name: "水果长老",
    avatar: "👴",
    description: "水果王国的智慧长者，掌握着古老的知识和魔法"
  },
  {
    name: "草莓精灵",
    avatar: "🧚‍♀️",
    description: "勇敢的水果守护者，专门指引冒险者前进的道路"
  },
  {
    name: "柠檬法师",
    avatar: "🧙‍♂️",
    description: "掌握水果魔法的强大法师，设下试炼考验勇者"
  },
  {
    name: "橙子骑士",
    avatar: "🛡️",
    description: "水果王国最勇敢的战士，象征着勇气和力量"
  },
  {
    name: "苹果智者",
    avatar: "🧘‍♂️",
    description: "充满智慧的古老存在，能看透事物的本质"
  },
  {
    name: "葡萄女巫",
    avatar: "🔮",
    description: "神秘的女巫，掌握着光明与黑暗的平衡"
  },
  {
    name: "蓝莓守护者",
    avatar: "🛡️‍♀️",
    description: "守护重要通道的勇敢战士，内心纯净善良"
  },
  {
    name: "神秘使者",
    avatar: "🌟",
    description: "来自异世界的神秘存在，带来新的挑战和机遇"
  }
]