export interface ResponsiveConfig {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  gridSizes: {
    mobile: { rows: number; cols: number; cellSize: number }
    tablet: { rows: number; cols: number; cellSize: number }
    desktop: { rows: number; cols: number; cellSize: number }
  }
}

export const defaultResponsiveConfig: ResponsiveConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  gridSizes: {
    mobile: { rows: 8, cols: 8, cellSize: 45 },
    tablet: { rows: 8, cols: 8, cellSize: 55 },
    desktop: { rows: 8, cols: 8, cellSize: 60 }
  }
}

export class ResponsiveManager {
  private config: ResponsiveConfig
  private currentDevice: 'mobile' | 'tablet' | 'desktop'
  private resizeObserver: ResizeObserver | null = null
  private callbacks: Map<string, (device: string) => void> = new Map()

  constructor(config: ResponsiveConfig = defaultResponsiveConfig) {
    this.config = config
    this.currentDevice = this.detectDevice()
    this.setupResizeListener()
  }

  private detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth
    
    if (width < this.config.breakpoints.mobile) {
      return 'mobile'
    } else if (width < this.config.breakpoints.tablet) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  private setupResizeListener(): void {
    // 使用 ResizeObserver 如果可用，否则使用 window resize 事件
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize()
      })
      
      // 观察整个文档
      this.resizeObserver.observe(document.body)
    } else {
      window.addEventListener('resize', this.handleResize.bind(this))
    }
  }

  private handleResize(): void {
    const newDevice = this.detectDevice()
    if (newDevice !== this.currentDevice) {
      this.currentDevice = newDevice
      this.notifyCallbacks()
    }
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      callback(this.currentDevice)
    })
  }

  // 获取当前设备类型
  getCurrentDevice(): 'mobile' | 'tablet' | 'desktop' {
    return this.currentDevice
  }

  // 获取当前网格配置
  getCurrentGridConfig() {
    return this.config.gridSizes[this.currentDevice]
  }

  // 添加设备变化回调
  addCallback(id: string, callback: (device: string) => void): void {
    this.callbacks.set(id, callback)
  }

  // 移除回调
  removeCallback(id: string): void {
    this.callbacks.delete(id)
  }

  // 检查是否为触摸设备
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  // 获取视口信息
  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      isTouch: this.isTouchDevice()
    }
  }

  // 销毁
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    } else {
      window.removeEventListener('resize', this.handleResize.bind(this))
    }
    this.callbacks.clear()
  }
}

// 性能优化工具
export class PerformanceOptimizer {
  private frameRate: number = 60
  private lastFrameTime: number = 0
  private frameCount: number = 0
  private fps: number = 60
  private isLowPerformanceMode: boolean = false

  constructor() {
    this.measurePerformance()
  }

  private measurePerformance(): void {
    const measureFrameRate = (timestamp: number) => {
      if (this.lastFrameTime) {
        const deltaTime = timestamp - this.lastFrameTime
        this.fps = 1000 / deltaTime
        
        this.frameCount++
        if (this.frameCount % 60 === 0) { // 每秒检查一次
          this.checkPerformance()
        }
      }
      
      this.lastFrameTime = timestamp
      requestAnimationFrame(measureFrameRate)
    }
    
    requestAnimationFrame(measureFrameRate)
  }

  private checkPerformance(): void {
    if (this.fps < 30) {
      this.isLowPerformanceMode = true
      this.optimizeForLowPerformance()
    } else if (this.fps > 50) {
      this.isLowPerformanceMode = false
      this.restoreHighPerformance()
    }
  }

  private optimizeForLowPerformance(): void {
    // 降低粒子效果质量
    document.body.classList.add('low-performance')
    
    // 减少动画帧率
    this.frameRate = 30
    
    console.log('切换到低保真模式')
  }

  private restoreHighPerformance(): void {
    document.body.classList.remove('low-performance')
    this.frameRate = 60
    
    console.log('恢复到高保真模式')
  }

  // 获取当前帧率
  getCurrentFPS(): number {
    return this.fps
  }

  // 是否处于低性能模式
  isLowPerformance(): boolean {
    return this.isLowPerformanceMode
  }

  // 获取推荐的帧率
  getRecommendedFrameRate(): number {
    return this.frameRate
  }

  // 节流函数
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean
    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    } as T
  }

  // 防抖函数
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout
    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    } as T
  }
}

// 资源加载优化
export class ResourceLoader {
  private loadedAssets: Set<string> = new Set()
  private loadingPromises: Map<string, Promise<any>> = new Map()

  // 预加载图片
  async preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.loadedAssets.has(src)) {
      const img = new Image()
      img.src = src
      return img
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.loadedAssets.add(src)
        resolve(img)
      }
      img.onerror = reject
      img.src = src
    })

    this.loadingPromises.set(src, loadPromise)
    return loadPromise
  }

  // 批量预加载
  async preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(srcs.map(src => this.preloadImage(src)))
  }

  // 清理缓存
  clearCache(): void {
    this.loadedAssets.clear()
    this.loadingPromises.clear()
  }

  // 获取已加载的资源数量
  getLoadedCount(): number {
    return this.loadedAssets.size
  }
}

// 全局实例
export const responsiveManager = new ResponsiveManager()
export const performanceOptimizer = new PerformanceOptimizer()
export const resourceLoader = new ResourceLoader()