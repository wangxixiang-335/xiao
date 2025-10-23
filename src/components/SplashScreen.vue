<template>
  <div class="splash-screen" :class="{ 'fade-out': isFadingOut }">
    <!-- 背景动画 -->
    <div class="splash-background">
      <div class="floating-fruit" v-for="fruit in floatingFruits" :key="fruit.id" 
           :style="fruit.style" :class="fruit.class">
        {{ fruit.emoji }}
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="splash-content">
      <div class="logo-container">
        <div class="logo-animation">
          <span class="logo-icon">🍓</span>
          <h1 class="logo-title">消消来解压</h1>
          <p class="logo-subtitle">治愈系休闲三消游戏</p>
        </div>
      </div>
      
      <!-- 加载进度 -->
      <div class="loading-container">
        <div class="loading-bar">
          <div class="loading-progress" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <div class="loading-text">加载中... {{ loadingProgress }}%</div>
      </div>
      
      <!-- 开始按钮 -->
      <button class="start-button" @click="startGame" v-if="loadingComplete">
        <span class="button-icon">🎮</span>
        <span class="button-text">开始游戏</span>
        <span class="button-arrow">→</span>
      </button>
    </div>
    
    <!-- 版权信息 -->
    <div class="copyright">
      © 2025 消消来解压 - 让游戏治愈你的心情
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loadingProgress = ref(0)
const loadingComplete = ref(false)
const isFadingOut = ref(false)

// 浮动水果数据
const floatingFruits = ref([
  { id: 1, emoji: '🍓', class: 'fruit-1', style: { animationDelay: '0s' } },
  { id: 2, emoji: '🍊', class: 'fruit-2', style: { animationDelay: '1s' } },
  { id: 3, emoji: '🍋', class: 'fruit-3', style: { animationDelay: '2s' } },
  { id: 4, emoji: '🍎', class: 'fruit-4', style: { animationDelay: '0.5s' } },
  { id: 5, emoji: '🍇', class: 'fruit-5', style: { animationDelay: '1.5s' } },
  { id: 6, emoji: '🫐', class: 'fruit-6', style: { animationDelay: '2.5s' } },
  { id: 7, emoji: '🍑', class: 'fruit-7', style: { animationDelay: '0.8s' } },
  { id: 8, emoji: '🍒', class: 'fruit-8', style: { animationDelay: '1.8s' } }
])

// 模拟加载进度
const simulateLoading = () => {
  const interval = setInterval(() => {
    loadingProgress.value += Math.random() * 10
    
    if (loadingProgress.value >= 100) {
      loadingProgress.value = 100
      loadingComplete.value = true
      clearInterval(interval)
    }
  }, 200)
}

// 开始游戏
const startGame = () => {
  isFadingOut.value = true
  
  setTimeout(() => {
    // 触发自定义事件，通知主页切换页面
    window.dispatchEvent(new CustomEvent('splash-complete'))
  }, 800)
}

onMounted(() => {
  simulateLoading()
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.8s ease-out;
}

.splash-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.splash-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.floating-fruit {
  position: absolute;
  font-size: 40px;
  animation: floatFruit 8s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

@keyframes floatFruit {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(-40px) rotate(180deg);
  }
  75% {
    transform: translateY(-20px) rotate(270deg);
  }
}

.fruit-1 { top: 10%; left: 5%; }
.fruit-2 { top: 20%; right: 10%; }
.fruit-3 { top: 40%; left: 15%; }
.fruit-4 { top: 60%; right: 5%; }
.fruit-5 { bottom: 20%; left: 10%; }
.fruit-6 { bottom: 10%; right: 15%; }
.fruit-7 { top: 30%; left: 80%; }
.fruit-8 { bottom: 30%; right: 80%; }

.splash-content {
  text-align: center;
  z-index: 1;
  animation: contentSlideUp 1s ease-out;
}

@keyframes contentSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-container {
  margin-bottom: 40px;
}

.logo-animation {
  animation: logoBounce 2s ease-in-out infinite;
}

@keyframes logoBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 10px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.logo-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.logo-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.loading-container {
  margin-bottom: 30px;
}

.loading-bar {
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.start-button {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  border: none;
  border-radius: 50px;
  padding: 15px 40px;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
}

.start-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 1.4rem;
}

.button-arrow {
  font-size: 1.4rem;
  transition: transform 0.3s ease;
}

.start-button:hover .button-arrow {
  transform: translateX(5px);
}

.copyright {
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}
</style>