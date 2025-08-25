'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Menu, X, Video, Users, Trophy, BarChart3, Home,
  Activity, Award, Settings, ChevronDown, Clock,
  Calendar, FileText, PlusCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: <Home className="w-4 h-4" /> 
    },
    { 
      name: 'Live Scoring', 
      href: '/matches/live-scoring', 
      icon: <Activity className="w-4 h-4" /> 
    },
    { 
      name: 'Live Matches', 
      href: '/matches/live', 
      icon: <Activity className="w-4 h-4 text-red-500" /> 
    },
    { 
      name: 'Matches', 
      href: '/matches', 
      icon: <Trophy className="w-4 h-4" /> 
    },
    { 
      name: 'Teams', 
      href: '/teams', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      name: 'Team Stats', 
      href: '/team-stats', 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
    { 
      name: 'Videos', 
      href: '/wrestling-videos', 
      icon: <Video className="w-4 h-4" /> 
    },
    { 
      name: 'Video Analysis', 
      href: '/matches/video-analysis', 
      icon: <Video className="w-4 h-4 text-gold" /> 
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: <Award className="w-4 h-4" /> 
    },
    { 
      name: 'Wrestlers', 
      href: '/wrestlers', 
      icon: <Users className="w-4 h-4" /> 
    }
  ]

  return (
    <nav className="relative z-50 bg-black/60 backdrop-blur-lg border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image 
                src="/aether-logo.png" 
                alt="Aether Logo" 
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(212,175,56,0.5)]"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gold leading-none">Aether Insight</h1>
              <p className="text-xs text-gray-400 hidden md:block leading-none mt-0.5">Wrestling Analytics Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                             (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link
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
                </Link>
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
                  <Link 
                    href="/matches/live-scoring"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Start Live Scoring</span>
                  </Link>
                  <Link 
                    href="/matches/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Schedule Match</span>
                  </Link>
                  <Link 
                    href="/teams/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Add Team</span>
                  </Link>
                  <Link 
                    href="/wrestlers/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Award className="w-4 h-4" />
                    <span>Add Wrestler</span>
                  </Link>
                  <Link 
                    href="/wrestling-videos/upload"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gold/10 text-gray-300 hover:text-gold transition-all"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Video className="w-4 h-4" />
                    <span>Upload Video</span>
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/matches/live-scoring">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-500 text-white font-semibold"
              >
                <Clock className="w-4 h-4 mr-2" />
                Live Score
              </Button>
            </Link>
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
                  <Link
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
                  </Link>
                )
              })}
              <div className="pt-3 mt-3 border-t border-gold/20 space-y-2">
                <Link href="/matches/live-scoring" onClick={() => setIsOpen(false)}>
                  <Button 
                    className="w-full bg-gold hover:bg-gold/90 text-black font-bold flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Start Live Scoring
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/teams/new" onClick={() => setIsOpen(false)}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full border-gold/50 text-gold hover:bg-gold/10"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Add Team
                    </Button>
                  </Link>
                  <Link href="/wrestlers/new" onClick={() => setIsOpen(false)}>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full border-gold/50 text-gold hover:bg-gold/10"
                    >
                      <Award className="w-4 h-4 mr-1" />
                      Add Wrestler
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}