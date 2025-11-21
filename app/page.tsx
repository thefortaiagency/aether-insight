'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users, Trophy, BarChart3, Zap, Clock, Shield,
  TrendingUp, CheckCircle, Star, ArrowRight, Smartphone,
  Award, Brain, ClipboardList, Target, X
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleEarlyAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      const emails = JSON.parse(localStorage.getItem('early-access-emails') || '[]')
      emails.push({ email, date: new Date().toISOString() })
      localStorage.setItem('early-access-emails', JSON.stringify(emails))
      setIsSubmitted(true)

      setTimeout(() => {
        setIsSubmitted(false)
        setEmail('')
      }, 3000)
    }
  }

  const KILLER_STATS = [
    { value: '87%', label: 'Faster Than MatBoss', icon: <Zap className="w-6 h-6" /> },
    { value: '100+', label: 'Stats Tracked', icon: <BarChart3 className="w-6 h-6" /> },
    { value: 'AI', label: 'Powered Insights', icon: <Brain className="w-6 h-6" /> },
    { value: '5.0', label: 'Coach Rating', icon: <Star className="w-6 h-6" /> }
  ]

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-gold" />,
      title: 'Stats Management',
      description: 'Import from USABracketing, TrackWrestling, FloWrestling. Season stats with MatBoss Power Index.',
      highlight: 'Auto-sync with Chrome extension'
    },
    {
      icon: <Brain className="w-8 h-8 text-gold" />,
      title: 'Coaching AI',
      description: 'Ask questions about your team. Get personalized recommendations and opponent analysis.',
      highlight: 'Powered by Claude AI'
    },
    {
      icon: <ClipboardList className="w-8 h-8 text-gold" />,
      title: 'Practice Planning',
      description: 'AI-generated practice plans based on team weaknesses and upcoming opponents.',
      highlight: 'Smart drill recommendations'
    },
    {
      icon: <Trophy className="w-8 h-8 text-gold" />,
      title: 'Live Scoring',
      description: 'Real-time match scoring with period-by-period tracking and detailed stats.',
      highlight: 'Works offline'
    },
    {
      icon: <Target className="w-8 h-8 text-gold" />,
      title: 'Wrestler Analytics',
      description: 'Track takedowns, escapes, reversals, nearfalls. Position-specific performance.',
      highlight: 'Identify strengths & weaknesses'
    },
    {
      icon: <Users className="w-8 h-8 text-gold" />,
      title: 'Team Management',
      description: 'Roster management, weight tracking, tournament scheduling, coach collaboration.',
      highlight: 'Multi-coach support'
    }
  ]

  const featureComparison = [
    { feature: 'Live Match Scoring', aether: true, others: true },
    { feature: 'Auto-Import Stats', aether: true, others: false },
    { feature: 'AI Coaching Insights', aether: true, others: false },
    { feature: 'Practice Plan Generator', aether: true, others: false },
    { feature: 'Mobile First Design', aether: true, others: false },
    { feature: 'MatBoss Power Index', aether: true, others: true },
    { feature: 'Opponent Scouting AI', aether: true, others: false },
    { feature: 'Setup Time', aether: '2 min', others: '30+ min' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <WrestlingStatsBackground />

      {/* Navigation Bar */}
      <nav className="relative z-20 bg-black/40 backdrop-blur-md border-b border-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12">
                <Image
                  src="/matopswhite.png"
                  alt="Aether Insights Logo"
                  width={200}
                  height={48}
                  className="object-contain drop-shadow-[0_0_20px_rgba(212,175,56,0.5)]"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-gold"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gold hover:bg-gold/90 text-black font-bold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-5xl mx-auto">
          <Badge className="bg-gold/20 text-gold border-gold px-4 py-2 mb-6">
            Wrestling Analytics + AI Coaching
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Stats. AI. </span>
            <span className="text-gold">Wins.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            The complete wrestling analytics platform with AI-powered coaching insights.
            <br />
            <span className="text-gold">Import stats. Plan practice. Dominate.</span>
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {KILLER_STATS.map((stat, index) => (
              <div key={index} className="bg-black/40 backdrop-blur border border-gold/20 rounded-lg p-4">
                <div className="flex items-center justify-center text-gold mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-black font-bold text-lg px-8"
              >
                <Zap className="w-5 h-5 mr-2" />
                Open Dashboard
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="bg-black/80 border-gold text-gold hover:bg-gold hover:text-black font-bold text-lg px-8"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              See Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="text-white">Everything You Need to </span>
            <span className="text-gold">Win More Matches</span>
          </h2>
          <p className="text-center text-gray-400 mb-12">Built by a coach with 30+ years experience</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/60 backdrop-blur border border-gold/20 hover:border-gold/50 transition-all">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 mb-3">{feature.description}</p>
                  <Badge className="bg-gold/10 text-gold border-gold/30">
                    {feature.highlight}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="text-white">Why Coaches </span>
            <span className="text-gold">Switch to Aether</span>
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="bg-black/60 backdrop-blur rounded-lg border border-gold/20 overflow-hidden">
              <div className="grid grid-cols-3 bg-gold/10 border-b border-gold/20">
                <div className="p-4 font-bold text-white">Feature</div>
                <div className="p-4 font-bold text-gold text-center">Aether Insights</div>
                <div className="p-4 font-bold text-gray-400 text-center">MatBoss & Others</div>
              </div>
              {featureComparison.map((item, index) => (
                <div key={index} className="grid grid-cols-3 border-b border-gold/10 hover:bg-gold/5">
                  <div className="p-4 text-gray-300">{item.feature}</div>
                  <div className="p-4 text-center">
                    {typeof item.aether === 'boolean' ? (
                      item.aether ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-gold font-bold">{item.aether}</span>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    {typeof item.others === 'boolean' ? (
                      item.others ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-gray-400">{item.others}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chrome Extension Section */}
      <section className="relative z-10 py-16 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500 px-4 py-2 mb-6">
              Chrome Extension Included
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-white">Auto-Import from </span>
              <span className="text-gold">USABracketing</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              One click to extract all your wrestlers&apos; stats. No manual data entry.
              <br />
              Works with TrackWrestling and FloWrestling too.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black/60 border border-gold/20 rounded-lg p-6">
                <div className="text-4xl mb-4">1️⃣</div>
                <h3 className="font-bold text-white mb-2">Install Extension</h3>
                <p className="text-sm text-gray-400">Load from Chrome extensions page</p>
              </div>
              <div className="bg-black/60 border border-gold/20 rounded-lg p-6">
                <div className="text-4xl mb-4">2️⃣</div>
                <h3 className="font-bold text-white mb-2">Visit USABracketing</h3>
                <p className="text-sm text-gray-400">Go to your wrestlers page</p>
              </div>
              <div className="bg-black/60 border border-gold/20 rounded-lg p-6">
                <div className="text-4xl mb-4">3️⃣</div>
                <h3 className="font-bold text-white mb-2">Click Sync</h3>
                <p className="text-sm text-gray-400">All stats imported instantly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-white">Ready to </span>
              <span className="text-gold">Win More Matches?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join coaches who are using AI to gain the competitive edge.
            </p>

            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-black font-bold text-lg px-12"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Now - It&apos;s Free
              </Button>
            </Link>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>2-minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/60 backdrop-blur-lg border-t border-gold/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Image
                src="/matopstarget.png"
                alt="Aether Insights"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <p className="text-gold font-bold">Aether Insights</p>
                <p className="text-xs text-gray-400">Built by coaches, for coaches</p>
              </div>
            </div>
            <div className="text-center md:text-right text-sm text-gray-400">
              <p>© 2025 Aether Insights. The Fort Suite.</p>
              <p className="mt-1">
                <Link href="/dashboard" className="hover:text-gold transition-colors">
                  Open Dashboard →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
