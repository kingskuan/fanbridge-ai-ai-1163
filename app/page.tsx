'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter } from 'next/font/google'
import { ChevronRightIcon, PlayIcon, StarIcon, TrophyIcon, BoltIcon, ShieldCheckIcon, MicrophoneIcon, CpuChipIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const inter = Inter({ subsets: ['latin'] })

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const features = [
    {
      icon: CpuChipIcon,
      title: 'AI自动交易代理',
      description: '智能分析赛事数据，自动执行最优交易策略'
    },
    {
      icon: MicrophoneIcon,
      title: '语音交互界面',
      description: '自然语言交流，降低Web3使用门槛'
    },
    {
      icon: ShieldCheckIcon,
      title: '风险管理算法',
      description: '实时监控投注组合，智能风险控制'
    }
  ]

  const stats = [
    { label: '奖金池', value: '14,000 USDT', icon: TrophyIcon },
    { label: '一等奖', value: '5,000 USDT', icon: StarIcon },
    { label: '区块链', value: 'X Layer', icon: BoltIcon },
    { label: '评分方式', value: 'AI+人工', icon: ChartBarIcon }
  ]

  const slides = [
    {
      title: '数亿球迷的Web3入口',
      subtitle: '让AI成为你的专属链上经纪人',
      gradient: 'from-purple-600 via-indigo-600 to-cyan-500'
    },
    {
      title: '自动交易，智能决策',
      subtitle: '无需学习DeFi，AI帮你完成一切',
      gradient: 'from-indigo-600 via-purple-600 to-pink-500'
    },
    {
      title: '语音交互，简单易用',
      subtitle: '说话即可操作，Web3从未如此简单',
      gradient: 'from-cyan-500 via-blue-600 to-indigo-600'
    }
  ]

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <div className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white overflow-hidden`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-6"
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <CpuChipIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                FanBridge AI
              </h1>
              <p className="text-xs text-gray-400">AI球迷经纪人助手</p>
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">功能特色</a>
            <a href="#hackathon" className="text-gray-300 hover:text-white transition-colors">黑客松详情</a>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              立即体验
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 px-6 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-6">
                    <motion.div 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full border border-purple-500/20"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TrophyIcon className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-sm text-purple-300">OKX Web3 开发者挑战赛参赛项目</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                      <span className={`bg-gradient-to-r ${slides[currentSlide].gradient} bg-clip-text text-transparent`}>
                        {slides[currentSlide].title.split(' ')[0]}
                      </span>
                      <br />
                      <span className="text-white">
                        {slides[currentSlide].title.split(' ').slice(1).join(' ')}
                      </span>
                    </h1>

                    <p className="text-xl text-gray-300 leading-relaxed">
                      {slides[currentSlide].subtitle}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold text-lg flex items-center justify-center group"
                >
                  开始使用 AI 助手
                  <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-lg flex items-center justify-center group hover:bg-white/10 transition-all"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  观看演示
                </motion.button>
              </div>

              {/* Slide Indicators */}
              <div className="flex space-x-3">
                {slides.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full cursor-pointer transition-all ${
                      index === currentSlide ? 'w-8 bg-purple-400' : 'w-2 bg-gray-600'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
                <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-300">AI 助手控制台</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-800/60 rounded-lg p-4">
                        <p className="text-purple-300 text-sm mb-2">🎯 AI 正在分析世界杯数据...</p>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className="h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                            animate={{ width: ["0%", "75%"] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/60 rounded-lg p-4">
                        <p className="text-cyan-300 text-sm mb-2">💎 自动交易执行中</p>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>巴西 vs 阿根廷</span>
                          <span className="text-green-400">+12.5%</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/60 rounded-lg p-4">
                        <p className="text-green-300 text-sm">✅ 风险管理算法已启动</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Row */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center group hover:bg-white/15 transition-all"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="relative z-10 px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                核心功能特色
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              AI Agent降低Web3门槛，真正承接数亿球迷流量转化
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full group-hover:border-purple-500/30 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  <motion.div 
                    className="mt-6 text-purple-400 font-medium flex items-center group-hover:text-cyan-400 transition-colors cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    了解更多 <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Hackathon Info Section */}
      <motion.section 
        id="hackathon"
        className="relative z-10 px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Build X Hackathon
                  </span>
                  <br />
                  <span className="text-white">2026</span>
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  哨声还没吹，链上已经开赛。十天时间，在 X Layer 上构建能把球迷注意力转化为链上真实交易的产品。
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-6 h-6 text-yellow-400" />
                    <span className="text-gray-300">奖金池总计 <span className="text-white font-bold">14,000 USDT</span></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StarIcon className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300">一等奖 <span className="text-white font-bold">5,000 USDT</span> + 官方PR支持</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BoltIcon className="w-6 h-6 text-cyan-400" />
                    <span className="text-gray-300">部署在 <span className="text-white font-bold">X Layer</span> 区块链</span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-lg flex items-center group"
                >
                  参与黑客松
                  <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">评分标准</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">创新性</span>
                      <span className="text-purple-400">差异化程度</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">市场价值</span>
                      <span className="text-cyan-400">流量转化能力</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">完成度</span>
                      <span className="text-green-400">可演示性</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">截止时间</h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">2026年5月28日</div>
                    <div className="text-gray-300">23:59 UTC</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <CpuChipIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              FanBridge AI
            </span>
          </div>
          <p className="text-gray-400">AI球迷经纪人助手 · 数亿球迷的Web3入口</p>
          <p className="text-sm text-gray-500 mt-2">© 2026 FanBridge AI. Build X Hackathon 参赛项目.</p>
        </div>
      </footer>
    </div>
  )
}