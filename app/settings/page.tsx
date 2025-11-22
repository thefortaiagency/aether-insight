'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User, Settings, Save, ChevronLeft, Target, Brain, MessageSquare,
  Award, Dumbbell, Trophy, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

interface CoachProfile {
  name: string
  background: string
  philosophy: string
  communication_style: string
  favorite_techniques: string[]
  team_goals: string
  season_focus: string
  ai_preferences: {
    tone: 'motivating' | 'analytical' | 'balanced'
    formality: 'casual' | 'professional' | 'coach-like'
    detail_level: 'concise' | 'detailed' | 'comprehensive'
  }
}

interface Session {
  coach?: { first_name?: string; last_name?: string }
  team?: { id: string; name: string }
}

const DEFAULT_PROFILE: CoachProfile = {
  name: '',
  background: '',
  philosophy: '',
  communication_style: '',
  favorite_techniques: [],
  team_goals: '',
  season_focus: '',
  ai_preferences: {
    tone: 'motivating',
    formality: 'coach-like',
    detail_level: 'concise'
  }
}

export default function SettingsPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [profile, setProfile] = useState<CoachProfile>(DEFAULT_PROFILE)
  const [techniqueInput, setTechniqueInput] = useState('')

  // Load session from localStorage
  useEffect(() => {
    const storedSession = localStorage.getItem('aether-session')
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession)
        if (parsed.team?.id) {
          setSession(parsed)
        } else {
          window.location.href = '/login'
        }
      } catch {
        window.location.href = '/login'
      }
    } else {
      window.location.href = '/login'
    }
  }, [])

  // Load existing coach profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.team?.id) return

      try {
        const { data, error } = await supabase
          .from('teams')
          .select('coach_profile, head_coach')
          .eq('id', session.team.id)
          .single()

        if (error) throw error

        if (data?.coach_profile) {
          setProfile({
            ...DEFAULT_PROFILE,
            ...data.coach_profile,
            name: data.coach_profile.name || data.head_coach || ''
          })
        } else if (data?.head_coach) {
          setProfile({
            ...DEFAULT_PROFILE,
            name: data.head_coach
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.team?.id) {
      loadProfile()
    }
  }, [session?.team?.id])

  const saveProfile = async () => {
    if (!session?.team?.id) return

    setSaving(true)
    setSaveStatus('idle')

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          coach_profile: profile,
          head_coach: profile.name
        })
        .eq('id', session.team.id)

      if (error) throw error

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const addTechnique = () => {
    if (techniqueInput.trim() && !profile.favorite_techniques.includes(techniqueInput.trim())) {
      setProfile({
        ...profile,
        favorite_techniques: [...profile.favorite_techniques, techniqueInput.trim()]
      })
      setTechniqueInput('')
    }
  }

  const removeTechnique = (technique: string) => {
    setProfile({
      ...profile,
      favorite_techniques: profile.favorite_techniques.filter(t => t !== technique)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      <WrestlingStatsBackground />

      <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF38] flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Coach Profile & AI Settings
            </h1>
            <p className="text-gray-400">Personalize how Mat Ops AI works with you</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-800">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Save Status Toast */}
        {saveStatus === 'success' && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            Profile saved successfully! The AI will now use your preferences.
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            Error saving profile. Please try again.
          </div>
        )}

        {/* Coach Background Section */}
        <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30 mb-6">
          <CardHeader className="border-b border-[#D4AF38]/20">
            <CardTitle className="text-[#D4AF38] flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Coaching Background
            </CardTitle>
            <p className="text-sm text-gray-400">Help the AI understand your experience and perspective</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Coach Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Coach Andy"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">
                Coaching Background
                <span className="text-gray-500 ml-2">(years experience, achievements, etc.)</span>
              </label>
              <textarea
                value={profile.background}
                onChange={(e) => setProfile({ ...profile, background: e.target.value })}
                placeholder="e.g., 25 years coaching high school wrestling. Former state champion. Indiana Coach of the Year 2019. Started program from scratch, built to perennial state qualifier..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38] resize-none"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">
                Coaching Philosophy
                <span className="text-gray-500 ml-2">(what drives your program)</span>
              </label>
              <textarea
                value={profile.philosophy}
                onChange={(e) => setProfile({ ...profile, philosophy: e.target.value })}
                placeholder="e.g., We build champions through discipline, hard work, and mental toughness. Every wrestler earns their spot through preparation. We compete to dominate, not just to participate..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Goals Section */}
        <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30 mb-6">
          <CardHeader className="border-b border-[#D4AF38]/20">
            <CardTitle className="text-[#D4AF38] flex items-center gap-2">
              <Target className="w-5 h-5" />
              Team Goals & Focus
            </CardTitle>
            <p className="text-sm text-gray-400">What are you working toward this season?</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Team Goals</label>
              <textarea
                value={profile.team_goals}
                onChange={(e) => setProfile({ ...profile, team_goals: e.target.value })}
                placeholder="e.g., Win conference championship, qualify 6+ wrestlers for state, improve team takedown rate to 60%+, develop freshmen for future..."
                rows={2}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38] resize-none"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Current Season Focus</label>
              <textarea
                value={profile.season_focus}
                onChange={(e) => setProfile({ ...profile, season_focus: e.target.value })}
                placeholder="e.g., Pre-season conditioning, building depth at upper weights, implementing new leg attack system..."
                rows={2}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38] resize-none"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Favorite Techniques / Emphasis</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={techniqueInput}
                  onChange={(e) => setTechniqueInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTechnique()}
                  placeholder="e.g., single leg, cradle, front headlock..."
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
                />
                <Button onClick={addTechnique} className="bg-[#D4AF38] text-black hover:bg-[#D4AF38]/90">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.favorite_techniques.map((technique) => (
                  <Badge
                    key={technique}
                    variant="outline"
                    className="border-[#D4AF38]/50 text-[#D4AF38] cursor-pointer hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400"
                    onClick={() => removeTechnique(technique)}
                  >
                    {technique} &times;
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Preferences Section */}
        <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30 mb-6">
          <CardHeader className="border-b border-[#D4AF38]/20">
            <CardTitle className="text-[#D4AF38] flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Communication Preferences
            </CardTitle>
            <p className="text-sm text-gray-400">How should the AI respond to you?</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Response Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {(['motivating', 'analytical', 'balanced'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setProfile({
                      ...profile,
                      ai_preferences: { ...profile.ai_preferences, tone }
                    })}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.ai_preferences.tone === tone
                        ? 'border-[#D4AF38] bg-[#D4AF38]/20 text-[#D4AF38]'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium capitalize">{tone}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {tone === 'motivating' && 'Challenge and encourage'}
                      {tone === 'analytical' && 'Data-driven insights'}
                      {tone === 'balanced' && 'Mix of both'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Communication Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['casual', 'coach-like', 'professional'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setProfile({
                      ...profile,
                      ai_preferences: { ...profile.ai_preferences, formality: style }
                    })}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.ai_preferences.formality === style
                        ? 'border-[#D4AF38] bg-[#D4AF38]/20 text-[#D4AF38]'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium capitalize">{style}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {style === 'casual' && 'Friendly & relaxed'}
                      {style === 'coach-like' && 'Direct & action-oriented'}
                      {style === 'professional' && 'Formal & structured'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Response Detail Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['concise', 'detailed', 'comprehensive'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setProfile({
                      ...profile,
                      ai_preferences: { ...profile.ai_preferences, detail_level: level }
                    })}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.ai_preferences.detail_level === level
                        ? 'border-[#D4AF38] bg-[#D4AF38]/20 text-[#D4AF38]'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium capitalize">{level}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {level === 'concise' && 'Quick answers'}
                      {level === 'detailed' && 'Thorough explanations'}
                      {level === 'comprehensive' && 'Full analysis'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Additional Communication Notes</label>
              <textarea
                value={profile.communication_style}
                onChange={(e) => setProfile({ ...profile, communication_style: e.target.value })}
                placeholder="e.g., I prefer when you challenge my wrestlers' mental game. Don't sugarcoat feedback. Always tie suggestions back to competition..."
                rows={2}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-600 text-gray-400">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={saveProfile}
            disabled={saving}
            className="bg-[#D4AF38] text-black hover:bg-[#D4AF38]/90 min-w-[120px]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>

        {/* Preview */}
        <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30 mt-8">
          <CardHeader className="border-b border-[#D4AF38]/20">
            <CardTitle className="text-[#D4AF38] flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Preview: How the AI Will See You
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300 font-mono">
              <p className="text-[#D4AF38] mb-2">// Coach Context for AI</p>
              {profile.name && <p><span className="text-gray-500">Coach:</span> {profile.name}</p>}
              {profile.background && <p><span className="text-gray-500">Background:</span> {profile.background}</p>}
              {profile.philosophy && <p><span className="text-gray-500">Philosophy:</span> {profile.philosophy}</p>}
              {profile.team_goals && <p><span className="text-gray-500">Goals:</span> {profile.team_goals}</p>}
              {profile.season_focus && <p><span className="text-gray-500">Focus:</span> {profile.season_focus}</p>}
              {profile.favorite_techniques.length > 0 && (
                <p><span className="text-gray-500">Techniques:</span> {profile.favorite_techniques.join(', ')}</p>
              )}
              <p className="mt-2"><span className="text-gray-500">Style:</span> {profile.ai_preferences.tone}, {profile.ai_preferences.formality}, {profile.ai_preferences.detail_level} responses</p>
              {profile.communication_style && <p><span className="text-gray-500">Notes:</span> {profile.communication_style}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
