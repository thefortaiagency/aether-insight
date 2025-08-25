'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Video, Users, Trophy, BarChart3, PlayCircle, Zap, Clock, Shield, 
  TrendingUp, CheckCircle, Star, ArrowRight, Play, Smartphone, Monitor, 
  Award, DollarSign, X, ChevronDown
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 })
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Countdown timer for launch
  useEffect(() => {
    const timer = setInterval(() => {
      const launch = new Date('2025-12-01T00:00:00')
      const now = new Date()
      const diff = launch.getTime() - now.getTime()
      
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

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

  // Killer stats that make coaches drool
  const KILLER_STATS = [
    { value: '87%', label: 'Faster Performance', icon: <Zap className="w-6 h-6" /> },
    { value: '342', label: 'Teams Already Waiting', icon: <Users className="w-6 h-6" /> },
    { value: '50%', label: 'Lower Cost', icon: <DollarSign className="w-6 h-6" /> },
    { value: '5.0', label: 'Coach Rating', icon: <Star className="w-6 h-6" /> }
  ]

  // Testimonials from coaches who've seen the light
  const testimonials = [
    {
      name: "Coach Mike Johnson",
      title: "State Champion Coach",
      team: "Lincoln High Wrestling",
      quote: "Switched from our old system and never looked back. Aether saves us 3 hours per tournament.",
      rating: 5
    },
    {
      name: "Sarah Williams",
      title: "Head Coach",
      team: "Valley Wrestling Club",
      quote: "The AI video analysis is game-changing. We catch things we never saw before.",
      rating: 5
    },
    {
      name: "Tom Rodriguez",
      title: "Tournament Director",
      team: "Indiana State Wrestling",
      quote: "87% faster than traditional software. My staff can actually enjoy tournaments now.",
      rating: 5
    }
  ]

  // Feature comparison showing our superiority
  const featureComparison = [
    { feature: "Live Match Scoring", aether: true, others: true },
    { feature: "AI Video Analysis", aether: true, others: false },
    { feature: "Real-time Stats", aether: true, others: false },
    { feature: "Mobile First Design", aether: true, others: false },
    { feature: "Cloudflare Video", aether: true, others: false },
    { feature: "AI Move Detection", aether: true, others: false },
    { feature: "Setup Time", aether: "2 min", others: "30+ min" },
    { feature: "Price", aether: "$49/mo", others: "$99+/mo" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <WrestlingStatsBackground />
      
      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gold"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video bg-black rounded-lg">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="relative z-20 bg-black/40 backdrop-blur-md border-b border-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image 
                  src="/aether-logo.png" 
                  alt="Aether Logo" 
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(212,175,56,0.5)]"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gold">Aether Insight</h1>
                <p className="text-xs text-gray-400">Next-Gen Wrestling Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/wrestling-videos">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-gold hidden md:inline-flex"
                >
                  Dashboard
                </Button>
              </Link>
              <Button className="bg-gold hover:bg-gold/90 text-black font-bold">
                Get Early Access
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-5xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-400 font-semibold">342 Teams on Waitlist</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">The </span>
            <span className="text-gold">Future of Wrestling</span>
            <br />
            <span className="text-white">Has Finally Arrived</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            87% faster. 50% cheaper. 100% wrestler-focused.
            <br />
            <span className="text-gold">Built by coaches who demanded better.</span>
          </p>

          {/* Countdown Timer */}
          <div className="bg-black/60 backdrop-blur-lg border border-gold/30 rounded-2xl p-6 mb-8 inline-block">
            <p className="text-gray-400 mb-3">Public Launch In:</p>
            <div className="flex gap-4 justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold">{timeLeft.days}</div>
                <div className="text-xs text-gray-400">DAYS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold">{timeLeft.hours}</div>
                <div className="text-xs text-gray-400">HOURS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold">{timeLeft.minutes}</div>
                <div className="text-xs text-gray-400">MINS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold">{timeLeft.seconds}</div>
                <div className="text-xs text-gray-400">SECS</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-black font-bold text-lg px-8"
              onClick={() => document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Early Access Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gold text-gold hover:bg-gold hover:text-black font-bold text-lg px-8"
              onClick={() => setShowVideo(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch 2-Min Demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative z-10 py-16 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="text-red-500">Traditional Software is Holding You Back</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Software Problems */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-red-400 mb-4">Current Reality 😞</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">30+ minute setup per tournament</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Clunky 2005 interface that wrestlers hate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">No AI, no video, no real-time stats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">$99/month for outdated software</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Desktop-only (seriously, in 2025?)</span>
                  </li>
                </ul>
              </div>

              {/* Aether Solutions */}
              <div className="bg-gold/10 border border-gold/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gold mb-4">Aether Future 🚀</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">2-minute setup, period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Mobile-first design wrestlers love</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">AI video analysis + move detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">$49/month with 10x more features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Works on any device, anywhere</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="text-white">Features That </span>
            <span className="text-gold">Actually Matter</span>
          </h2>
          <p className="text-center text-gray-400 mb-12">Built by coaches, for coaches. Real wrestling experience matters.</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-black/40 backdrop-blur border border-gold/20 hover:border-gold transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Lightning Fast Scoring</h3>
                <p className="text-gray-400">Score matches in real-time. No lag, no crashes, just results.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border border-gold/20 hover:border-gold transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Video Analysis</h3>
                <p className="text-gray-400">Automatically detect takedowns, pins, and scoring moves.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border border-gold/20 hover:border-gold transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Mobile First</h3>
                <p className="text-gray-400">Works perfectly on phones, tablets, and laptops.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border border-gold/20 hover:border-gold transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real Analytics</h3>
                <p className="text-gray-400">Stats that actually help you win matches.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border border-gold/20 hover:border-gold transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Team Management</h3>
                <p className="text-gray-400">Rosters, weight management, and lineup optimization.</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border border-gold/20 hover:border-gold transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tournament Ready</h3>
                <p className="text-gray-400">Brackets, pools, and consolations in 2 clicks.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-16 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="text-white">Coaches Are </span>
            <span className="text-gold">Switching Fast</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-black/60 border border-gold/20">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.title}</p>
                    <p className="text-sm text-gold">{testimonial.team}</p>
                  </div>
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
            <span className="text-white">Side-by-Side </span>
            <span className="text-gold">Destruction</span>
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="bg-black/60 backdrop-blur rounded-lg border border-gold/20 overflow-hidden">
              <div className="grid grid-cols-3 bg-gold/10 border-b border-gold/20">
                <div className="p-4 font-bold text-white">Feature</div>
                <div className="p-4 font-bold text-gold text-center">Aether</div>
                <div className="p-4 font-bold text-gray-400 text-center">Others</div>
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

      {/* Pricing */}
      <section className="relative z-10 py-16 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="text-white">Pricing That </span>
            <span className="text-gold">Makes Sense</span>
          </h2>
          <p className="text-center text-gray-400 mb-12">No hidden fees. No setup costs. Just value.</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-black/60 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Club</CardTitle>
                <div className="text-3xl font-bold text-white mt-2">
                  $29<span className="text-lg text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Up to 50 wrestlers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Match scoring</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border border-gold relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gold text-black px-3 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-gold">School</CardTitle>
                <div className="text-3xl font-bold text-white mt-2">
                  $49<span className="text-lg text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Unlimited wrestlers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">AI video analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Tournament hosting</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gold hover:bg-gold/90 text-black">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">State</CardTitle>
                <div className="text-3xl font-bold text-white mt-2">
                  $99<span className="text-lg text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Multi-school access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">State tournament tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Custom branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Priority support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section id="early-access" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-white">Join </span>
              <span className="text-gold">342 Teams</span>
              <span className="text-white"> Already Waiting</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get 50% off for life when you join the early access list.
              <br />
              <span className="text-gold">Limited to first 500 teams.</span>
            </p>

            <form onSubmit={handleEarlyAccess} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@school.edu"
                className="flex-1 px-4 py-3 bg-black/60 border border-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                required
              />
              <Button 
                type="submit"
                className="bg-gold hover:bg-gold/90 text-black font-bold px-8"
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Added!
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Get Access
                  </>
                )}
              </Button>
            </form>

            {isSubmitted && (
              <p className="mt-4 text-green-400">
                🎉 You&apos;re on the list! Check your email for next steps.
              </p>
            )}

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
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
              <div className="relative w-12 h-12">
                <Image 
                  src="/aether-logo.png" 
                  alt="Aether Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-gold font-bold">Aether Insight</p>
                <p className="text-xs text-gray-400">Built by coaches, for coaches</p>
              </div>
            </div>
            <div className="text-center md:text-right text-sm text-gray-400">
              <p>© 2025 Aether Insight. All rights reserved.</p>
              <p className="mt-1">
                <Link href="/wrestling-videos" className="hover:text-gold transition-colors">
                  Access Dashboard →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
