<template>
  <div id="app">
    <SplashScreen v-if="showSplash" @splash-complete="handleSplashComplete" />
    <HomePage v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SplashScreen from './components/SplashScreen.vue'
import HomePage from './components/HomePage.vue'

const showSplash = ref(true)

const handleSplashComplete = () => {
  showSplash.value = false
}

// 监听自定义事件
onMounted(() => {
  window.addEventListener('splash-complete', handleSplashComplete)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
  overflow-x: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

#app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 全局滚动条样式优化 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 选择文本样式 */
::selection {
  background: rgba(74, 144, 226, 0.3);
  color: inherit;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 焦点样式优化 */
*:focus {
  outline: 2px solid rgba(74, 144, 226, 0.8);
  outline-offset: 2px;
}

/* 禁用文本选择（游戏元素） */
.no-select {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 高性能动画优化 */
.will-change {
  will-change: transform, opacity;
}

/* 移动端优化 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
  
  /* 禁用长按选择 */
  * {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* 允许文本选择 */
  p, h1, h2, h3, h4, h5, h6, span {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }
}
</style>