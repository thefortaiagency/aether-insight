'use client'

import React, { useState, useEffect } from 'react'
import { 
  Menu, X, Video, Users, Trophy, BarChart3, Home,
  Activity, Award, Settings, ChevronDown, Clock,
  Calendar, FileText, PlusCircle, Play
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

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  // Use window.location.pathname for standard React apps instead of Next.js's usePathname
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    // Set the pathname on the client-side
    setPathname(window.location.pathname)
  }, [])


  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { name: 'Calendar', href: '/calendar', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Live Scoring', href: '/matches/live-scoring', icon: <Activity className="w-4 h-4" /> },
    { name: 'Live Matches', href: '/matches/live', icon: <Activity className="w-4 h-4 text-red-500" /> },
    { name: 'Matches', href: '/matches', icon: <Trophy className="w-4 h-4" /> },
    { name: 'Teams', href: '/teams', icon: <Users className="w-4 h-4" /> },
    { name: 'Team Stats', href: '/team-stats', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Videos', href: '/wrestling-videos', icon: <Video className="w-4 h-4" /> },
    { name: 'Video Analysis', href: '/matches/video-analysis', icon: <Video className="w-4 h-4 text-gold" /> },
    { name: 'Video Review', href: '/matches/video-review', icon: <Play className="w-4 h-4 text-green-500" /> },
    { name: 'Analytics', href: '/analytics', icon: <Award className="w-4 h-4" /> },
    { name: 'Wrestlers', href: '/wrestlers', icon: <Users className="w-4 h-4" /> },
    { name: 'Test Recorder', href: '/test/video-recorder', icon: <Settings className="w-4 h-4 text-orange-500" /> }
  ]

  return (
    <nav className="relative z-50 bg-black/60 backdrop-blur-lg border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Mat Ops Branding */}
          <a href="/" className="flex items-center gap-3 h-10 flex-shrink-0">
            <div className="relative h-10 flex-shrink-0">
              <img
                src="/matopslogo.png"
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

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative">
              <Button 
                size="sm" 
                className="bg-gold hover:bg-gold/90 text-black font-bold flex items-center gap-2"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                <PlusCircle className="w-4 h-4" />
                Quick Actions
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  showQuickActions && "rotate-180"
                )} />
              </Button>
              
              {showQuickActions && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-lg border border-gold/20 rounded-lg shadow-xl overflow-hidden">
                  <a 
                    href="/matches/live-scoring"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Start Live Scoring</span>
                  </a>
                  <a 
                    href="/matches/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Schedule Match</span>
                  </a>
                  <a 
                    href="/teams/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Add Team</span>
                  </a>
                  <a 
                    href="/wrestlers/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Award className="w-4 h-4" />
                    <span>Add Wrestler</span>
                  </a>
                  <a 
                    href="/wrestling-videos/upload"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Video className="w-4 h-4" />
                    <span>Upload Video</span>
                  </a>
                </div>
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
                <a href="/matches/live-scoring" onClick={() => setIsOpen(false)}>
                  <Button 
                    className="w-full bg-gold hover:bg-gold/90 text-black font-bold flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Start Live Scoring
                  </Button>
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <a href="/teams/new" onClick={() => setIsOpen(false)}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full border-gold/50 text-gold hover:bg-gold/10"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Add Team
                    </Button>
                  </a>
                  <a href="/wrestlers/new" onClick={() => setIsOpen(false)}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full border-gold/50 text-gold hover:bg-gold/10"
                    >
                      <Award className="w-4 h-4 mr-1" />
                      Add Wrestler
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
