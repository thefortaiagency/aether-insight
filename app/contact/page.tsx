'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Trophy, Users, Mail, Phone, MapPin, School, 
  CheckCircle, ArrowLeft, Send, User, Building
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    schoolName: '',
    schoolAddress: '',
    schoolCity: '',
    schoolState: '',
    schoolZip: '',
    wrestlerCount: '',
    division: '',
    currentSoftware: '',
    message: '',
    interestedFeatures: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Store in localStorage for now (in production, send to API)
    const submissions = JSON.parse(localStorage.getItem('early-access-submissions') || '[]')
    submissions.push({
      ...formData,
      submittedAt: new Date().toISOString()
    })
    localStorage.setItem('early-access-submissions', JSON.stringify(submissions))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const divisions = [
    'NCAA Division I',
    'NCAA Division II', 
    'NCAA Division III',
    'NAIA',
    'NJCAA',
    'High School Varsity',
    'High School JV',
    'Middle School',
    'Youth/Club',
    'Other'
  ]

  const wrestlerCounts = [
    '1-10',
    '11-20',
    '21-30',
    '31-40',
    '41-50',
    '50+'
  ]

  const currentSoftwareOptions = [
    'MatBoss',
    'TrackWrestling',
    'FloWrestling',
    'WrestlingIQ',
    'Spreadsheets/Manual',
    'None',
    'Other'
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
        <WrestlingStatsBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-[#D4AF38] mb-4">
                Thank You for Your Interest!
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                We've received your early access request and will be in touch soon.
              </p>
              <p className="text-gray-400">
                You're now on the list to be among the first to experience Aether Insight.
                We'll contact you with exclusive early access details and special pricing.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link href="/dashboard">
                <Button className="bg-[#D4AF38] hover:bg-[#B8941C] text-black font-bold">
                  Explore Dashboard Demo
                </Button>
              </Link>
              <br />
              <Link href="/">
                <Button variant="outline" className="border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      {/* Header */}
      <nav className="relative z-20 border-b border-gold/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image 
                    src="/aether-logo.png" 
                    alt="Aether Logo" 
                    fill
                    className="object-contain drop-shadow-[0_0_20px_rgba(212,175,56,0.5)]"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gold">Aether Insight</h1>
                  <p className="text-xs text-gray-400">Early Access Program</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#D4AF38] mb-4">
              Get Early Access to Aether Insight
            </h1>
            <p className="text-xl text-gray-300">
              Join the revolution in wrestling analytics. Be among the first coaches to experience the future.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-black/60 border-[#D4AF38]/30">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-[#D4AF38] mx-auto mb-2" />
                <h3 className="font-bold text-white mb-1">50% Off First Year</h3>
                <p className="text-sm text-gray-400">Exclusive early adopter pricing</p>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-[#D4AF38]/30">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-[#D4AF38] mx-auto mb-2" />
                <h3 className="font-bold text-white mb-1">Priority Support</h3>
                <p className="text-sm text-gray-400">Direct line to our development team</p>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-[#D4AF38]/30">
              <CardContent className="p-4 text-center">
                <School className="w-8 h-8 text-[#D4AF38] mx-auto mb-2" />
                <h3 className="font-bold text-white mb-1">Shape the Future</h3>
                <p className="text-sm text-gray-400">Your feedback drives our features</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#D4AF38]">
                Tell Us About Your Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-[#D4AF38]" />
                    Coach Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-black/60 border-[#D4AF38]/30 text-white"
                        placeholder="Coach John Smith"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role" className="text-white">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleSelectChange('role', value)}
                        required
                      >
                        <SelectTrigger className="bg-black/60 border-[#D4AF38]/30 text-white">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="head-coach">Head Coach</SelectItem>
                          <SelectItem value="assistant-coach">Assistant Coach</SelectItem>
                          <SelectItem value="athletic-director">Athletic Director</SelectItem>
                          <SelectItem value="tournament-director">Tournament Director</SelectItem>
                          <SelectItem value="club-owner">Club Owner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-black/60 border-[#D4AF38]/30 text-white"
                        placeholder="coach@school.edu"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="bg-black/60 border-[#D4AF38]/30 text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* School Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#D4AF38]" />
                    School/Organization Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schoolName" className="text-white">School/Club Name *</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        required
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        className="bg-black/60 border-[#D4AF38]/30 text-white"
                        placeholder="Lincoln High School"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="division" className="text-white">Division/Level *</Label>
                      <Select
                        value={formData.division}
                        onValueChange={(value) => handleSelectChange('division', value)}
                        required
                      >
                        <SelectTrigger className="bg-black/60 border-[#D4AF38]/30 text-white">
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map(div => (
                            <SelectItem key={div} value={div}>{div}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="schoolAddress" className="text-white">Address</Label>
                    <Input
                      id="schoolAddress"
                      name="schoolAddress"
                      value={formData.schoolAddress}
                      onChange={handleInputChange}
                      className="bg-black/60 border-[#D4AF38]/30 text-white"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="schoolCity" className="text-white">City</Label>
                      <Input
                        id="schoolCity"
                        name="schoolCity"
                        value={formData.schoolCity}
                        onChange={handleInputChange}
                        className="bg-black/60 border-[#D4AF38]/30 text-white"
                        placeholder="Springfield"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="schoolState" className="text-white">State</Label>
                      <Input
                        id="schoolState"
                        name="schoolState"
                        value={formData.schoolState}
                        onChange={handleInputChange}
                        className="bg-black/60 border-[#D4AF38]/30 text-white"
                        placeholder="IL"
                        maxLength={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="schoolZip" className="text-white">ZIP</Label>
                      <Input
                        id="schoolZip"
                        name="schoolZip"
                        value={formData.schoolZip}
                        onChange={handleInputChange}
                        className="bg-black/60 border-[#D4AF38]/30 text-white"
                        placeholder="62701"
                      />
                    </div>
                  </div>
                </div>

                {/* Program Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#D4AF38]" />
                    Program Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wrestlerCount" className="text-white">Number of Wrestlers *</Label>
                      <Select
                        value={formData.wrestlerCount}
                        onValueChange={(value) => handleSelectChange('wrestlerCount', value)}
                        required
                      >
                        <SelectTrigger className="bg-black/60 border-[#D4AF38]/30 text-white">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          {wrestlerCounts.map(count => (
                            <SelectItem key={count} value={count}>{count} wrestlers</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="currentSoftware" className="text-white">Current Software</Label>
                      <Select
                        value={formData.currentSoftware}
                        onValueChange={(value) => handleSelectChange('currentSoftware', value)}
                      >
                        <SelectTrigger className="bg-black/60 border-[#D4AF38]/30 text-white">
                          <SelectValue placeholder="What do you use now?" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentSoftwareOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white">Additional Comments</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="bg-black/60 border-[#D4AF38]/30 text-white min-h-[100px]"
                      placeholder="Tell us about your program's needs, challenges, or what features you're most excited about..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Link href="/">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#D4AF38] hover:bg-[#B8941C] text-black font-bold"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Request Early Access
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center text-gray-400">
            <p className="mb-2">🔒 Your information is secure and will never be shared</p>
            <p>Join 300+ programs already on the waitlist</p>
          </div>
        </div>
      </div>
    </div>
  )
}