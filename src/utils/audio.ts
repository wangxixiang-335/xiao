export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private musicVolume: number = 1.0
  private soundVolume: number = 0.8
  private isMuted: boolean = false
  private backgroundMusic: HTMLAudioElement | null = null
  private audioContext: AudioContext | null = null
  private isInitialized: boolean = false

  constructor() {
    // 延迟初始化，等待用户交互
    this.setupUserInteractionListener()
  }

  private setupUserInteractionListener(): void {
    const initAudio = () => {
      if (!this.isInitialized) {
        this.initializeSounds()
        this.isInitialized = true
        // 移除监听器，只需要第一次交互
        document.removeEventListener('click', initAudio)
        document.removeEventListener('touchstart', initAudio)
        document.removeEventListener('keydown', initAudio)
      }
    }

    document.addEventListener('click', initAudio)
    document.addEventListener('touchstart', initAudio)
    document.addEventListener('keydown', initAudio)
  }

  private initializeSounds(): void {
    // 创建音频元素（使用Web Audio API或简单的音频元素）
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      // 确保AudioContext已启动
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(error => {
          console.warn('Failed to resume AudioContext:', error)
        })
      }
      
      const soundEffects = {
        match: this.createSound('match', 0.3),
        combo: this.createSound('combo', 0.4),
        swap: this.createSound('swap', 0.2),
        fall: this.createSound('fall', 0.15),
        gameOver: this.createSound('gameOver', 0.5),
        victory: this.createSound('victory', 0.6),
        toolUse: this.createSound('toolUse', 0.3),
        click: this.createSound('click', 0.2)
      }

      Object.entries(soundEffects).forEach(([name, audio]) => {
        if (audio) this.sounds.set(name, audio)
      })
    } catch (error) {
      console.warn('Failed to initialize sounds:', error)
    }
  }

  private createSound(type: string, volume: number): HTMLAudioElement | null {
    try {
      const audio = new Audio()
      audio.volume = volume * this.soundVolume
      
      // 使用简单的音效生成（实际项目中应该使用真实的音频文件）
      // 注意：这里不调用 generateSound，而是在播放时生成
      
      return audio
    } catch (error) {
      console.warn('Failed to create audio element:', error)
      return null
    }
  }

  

  playSound(soundName: string): void {
    if (this.isMuted) return
    
    try {
      // 直接生成音效，而不是使用预创建的音频元素
      this.generateSoundEffect(soundName)
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  private generateSoundEffect(type: string): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // 确保AudioContext已启动
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(error => {
        console.warn('Failed to resume AudioContext:', error)
      })
    }
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    switch (type) {
      case 'match':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
        break
        
      case 'combo':
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.15)
        oscillator.frequency.exponentialRampToValueAtTime(1400, this.audioContext.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.4 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4)
        break
        
      case 'swap':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
        oscillator.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.2 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15)
        break
        
      case 'fall':
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.15 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25)
        break
        
      case 'gameOver':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5)
        gainNode.gain.setValueAtTime(0.5 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6)
        break
        
      case 'victory':
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2) // E5
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.4) // G5
        oscillator.frequency.setValueAtTime(1047, this.audioContext.currentTime + 0.6) // C6
        gainNode.gain.setValueAtTime(0.6 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8)
        break
        
      case 'toolUse':
        oscillator.frequency.setValueAtTime(700, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15)
        break
        
      case 'click':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.2 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05)
        break
        
      default:
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1 * this.soundVolume, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    }
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.8)
  }

  playBackgroundMusic(): void {
    if (this.isMuted) return
    
    try {
      // 创建背景音乐（简单的循环旋律）
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      // 确保AudioContext已启动
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(error => {
          console.warn('Failed to resume AudioContext:', error)
        })
      }
      
      if (this.backgroundMusic) {
        this.backgroundMusic.remove()
      }
      
      // 这里应该加载真实的背景音乐文件
      // 现在使用简单的生成音乐作为占位符
      this.generateBackgroundMusic(this.audioContext)
      
    } catch (error) {
      console.warn('Failed to play background music:', error)
    }
  }

  private generateBackgroundMusic(audioContext: AudioContext): void {
    // 简单的背景音乐生成器
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] // C4-C5
    let noteIndex = 0
    
    const playNextNote = () => {
      if (this.isMuted) return
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(notes[noteIndex % notes.length], audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.05 * this.musicVolume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.8)
      
      noteIndex++
      
      if (!this.isMuted) {
        setTimeout(playNextNote, 1000) // 每分钟60拍
      }
    }
    
    playNextNote()
  }

  stopBackgroundMusic(): void {
    this.isMuted = true
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.remove()
      this.backgroundMusic = null
    }
  }

  setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1, volume))
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
  }

  setVolume(type: 'sound' | 'music', volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume))
    if (type === 'sound') {
      this.soundVolume = normalizedVolume
    } else if (type === 'music') {
      this.musicVolume = normalizedVolume
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.stopBackgroundMusic()
    } else {
      this.playBackgroundMusic()
    }
  }

  // 特殊的音效组合
  playComboSound(comboCount: number): void {
    if (this.isMuted) return
    
    if (comboCount >= 5) {
      this.playSound('combo')
    } else {
      this.playSound('match')
    }
  }

  // 播放胜利序列
  playVictorySequence(): void {
    if (this.isMuted) return
    
    this.playSound('victory')
    
    // 播放额外的庆祝音效
    setTimeout(() => {
      this.playSound('combo')
    }, 300)
    
    setTimeout(() => {
      this.playSound('match')
    }, 600)
  }

  // 初始化方法（兼容性方法）
  initialize(): void {
    // 这个方法只是为了兼容性，实际的初始化在构造函数中已经完成
    console.log('AudioManager initialized')
  }
}

// 创建全局音频管理器实例
export const audioManager = new AudioManager()