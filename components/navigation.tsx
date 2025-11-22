'use client'

import React, { useState, useEffect } from 'react'
import {
  Menu, X, Users, Home,
  Activity, ChevronDown,
  Calendar, Brain, ClipboardList, LogOut, User, BarChart3
} from 'lucide-react'

// A utility function for combining class names, often found in projects using Tailwind CSS.
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

// A simple Button component to replace the one from a UI library.
const Button = ({ children, className, ...props }: any) => {
  return (
    <button className={cn("px-4 py-2 rounded-md font-semibold transition-colors", className)} {...props}>
      {children}
    </button>
  )
}

interface Session {
  coach: { first_name: string; last_name: string; email: string }
  team: { name: string } | null
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    setPathname(window.location.pathname)
    // Load session
    const stored = localStorage.getItem('aether-session')
    if (stored) {
      try {
        setSession(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse session')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('aether-session')
    setSession(null)
    window.location.href = '/login'
  }

  const handleLogin = () => {
    window.location.href = '/login'
  }


  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { name: 'Roster', href: '/roster', icon: <ClipboardList className="w-4 h-4 text-gold" /> },
    { name: 'Team Stats', href: '/team-stats', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Wrestlers', href: '/wrestlers', icon: <Users className="w-4 h-4" /> },
    { name: 'Calendar', href: '/calendar', icon: <Calendar className="w-4 h-4" /> },
    { name: "Coach's Corner", href: '/coach', icon: <Brain className="w-4 h-4" /> },
    { name: 'Mat Ops AI', href: '/ai', icon: <Activity className="w-4 h-4" /> },
  ]

  return (
    <nav className="relative z-50 bg-black/60 backdrop-blur-lg border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Mat Ops Branding */}
          <a href="/" className="flex items-center gap-3 h-10 flex-shrink-0">
            <div className="relative h-10 flex-shrink-0">
              <img
                src="/matopswhite.png"
                alt="Mat Ops Logo"
                className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,56,0.5)]"
                onError={(e: any) => { e.target.onerror = null; e.target.src='https://placehold.co/200x40/000000/d4af37?text=MAT+OPS'; }}
              />
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                             (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                    isActive 
                      ? "text-gold bg-gold/20 font-semibold" 
                      : "text-gray-300 hover:text-gold hover:bg-gold/10"
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </a>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {/* User Menu */}
            <div className="relative">
              {session ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-gold/20 hover:border-gold/40 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-gold" />
                    </div>
                    <div className="text-left hidden xl:block">
                      <div className="text-sm font-medium text-white">
                        {session.coach.first_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {session.team?.name || 'No Team'}
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      showUserMenu && "rotate-180"
                    )} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-lg border border-gold/20 rounded-lg shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gold/10">
                        <div className="text-sm font-medium text-white">
                          {session.coach.first_name} {session.coach.last_name}
                        </div>
                        <div className="text-xs text-gray-400">{session.coach.email}</div>
                        {session.team && (
                          <div className="text-xs text-gold mt-1">{session.team.name}</div>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 text-red-400 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-gold hover:bg-gold/90 text-black font-bold"
                >
                  Log In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white hover:text-gold transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-gold/20">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                               (item.href !== '/' && pathname.startsWith(item.href))
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
                      isActive 
                        ? "text-gold bg-gold/20 font-semibold" 
                        : "text-gray-300 hover:text-gold hover:bg-gold/10"
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </a>
                )
              })}
              <div className="pt-3 mt-3 border-t border-gold/20 space-y-2">
                {session ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-400">
                      Signed in as <span className="text-gold">{session.coach.first_name}</span>
                      {session.team && <span className="text-gray-500"> • {session.team.name}</span>}
                    </div>
                    <a href="/roster" onClick={() => setIsOpen(false)}>
                      <Button
                        className="w-full bg-gold hover:bg-gold/90 text-black font-bold flex items-center justify-center gap-2"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Roster Spreadsheet
                      </Button>
                    </a>
                    <Button
                      onClick={() => { setIsOpen(false); handleLogout(); }}
                      className="w-full border border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => { setIsOpen(false); handleLogin(); }}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
                  >
                    Log In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
