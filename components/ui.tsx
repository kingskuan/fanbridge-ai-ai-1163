'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '' 
}: ButtonProps) => {
  const baseClasses = 'font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-purple-500/25',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500',
    outline: 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  }
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export const Card = ({ children, className = '', hover = true, gradient = false }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -5 } : {}}
      className={`
        backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl
        ${gradient ? 'bg-gradient-to-br from-purple-900/20 to-cyan-900/20' : ''}
        ${hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div className={`
      backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 
      border border-white/20 rounded-3xl p-8 shadow-2xl
      ${className}
    `}>
      {children}
    </div>
  )
}

interface HeroProps {
  title: string
  subtitle: string
  description: string
  primaryAction: () => void
  secondaryAction?: () => void
}

export const Hero = ({ title, subtitle, description, primaryAction, secondaryAction }: HeroProps) => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`text-6xl md:text-8xl font-bold mb-6 ${inter.className}`}>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl text-gray-300 mb-4 font-semibold"
          >
            {subtitle}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" onClick={primaryAction}>
              开始体验 AI 助手
            </Button>
            {secondaryAction && (
              <Button variant="outline" size="lg" onClick={secondaryAction}>
                了解更多
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

interface NavProps {
  logo: string
  links: Array<{ label: string; href: string }>
  onConnect: () => void
}

export const Nav = ({ logo, links, onConnect }: NavProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'backdrop-blur-lg bg-black/20 border-b border-white/10' : 'bg-transparent'}
      `}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {logo}
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          <Button onClick={onConnect} size="sm">
            连接钱包
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  index: number
}

export const FeatureCard = ({ icon, title, description, index }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <Card className="h-full text-center group-hover:scale-105 transition-transform duration-300">
        <div className="text-6xl mb-6 text-center">{icon}</div>
        <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  )
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <GlassCard>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              {children}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  trend?: number
}

export const StatCard = ({ label, value, icon, trend }: StatCardProps) => {
  return (
    <Card className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      {trend && (
        <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </Card>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingSpinner = ({ size = 'md' }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-2 border-purple-400 border-t-transparent rounded-full`}
    />
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
}

export const ProgressBar = ({ progress, className = '' }: ProgressBarProps) => {
  return (
    <div className={`w-full bg-gray-800 rounded-full h-2 ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full"
      />
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
}

export const Badge = ({ children, variant = 'info' }: BadgeProps) => {
  const variants = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }
  
  return (
    <span className={`
      px-3 py-1 rounded-full text-sm font-semibold border
      ${variants[variant]}
    `}>
      {children}
    </span>
  )
}