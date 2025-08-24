'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, Plus, Edit, Trash2, Shield, User, Mail, Phone, 
  Calendar, Award, Home, Search, Filter, UserPlus, Settings
} from 'lucide-react'
import PageBackground from "@/components/background/page-background"
import Link from 'next/link'
import { toast } from 'sonner'

interface Wrestler {
  id: string
  name: string
  email?: string
  phone?: string
  grade: number
  weight: number
  role: 'wrestler' | 'captain' | 'manager'
  joinedDate: string
  record?: { wins: number; losses: number }
  status: 'active' | 'injured' | 'inactive'
}

interface Team {
  id: string
  name: string
  school: string
  division: string
  coaches: string[]
  wrestlers: Wrestler[]
  createdAt: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterWeight, setFilterWeight] = useState('all')
  const [filterGrade, setFilterGrade] = useState('all')
  const [isAddingWrestler, setIsAddingWrestler] = useState(false)
  const [newWrestler, setNewWrestler] = useState<Partial<Wrestler>>({
    grade: 9,
    weight: 106,
    role: 'wrestler',
    status: 'active'
  })

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = () => {
    // Load teams from localStorage or create default
    const storedTeams = localStorage.getItem('teams')
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams))
    } else {
      // Create default team
      const defaultTeam: Team = {
        id: 'team-1',
        name: 'Fort Wayne North Warriors',
        school: 'Fort Wayne North',
        division: 'Division 1',
        coaches: ['Coach Johnson', 'Assistant Coach Smith'],
        wrestlers: [
          {
            id: 'w1',
            name: 'Jackson Martinez',
            email: 'jackson.m@fwn.edu',
            phone: '555-0101',
            grade: 12,
            weight: 160,
            role: 'captain',
            joinedDate: '2021-09-01',
            record: { wins: 28, losses: 4 },
            status: 'active'
          },
          {
            id: 'w2',
            name: 'Ryan Chen',
            email: 'ryan.c@fwn.edu',
            phone: '555-0102',
            grade: 11,
            weight: 145,
            role: 'wrestler',
            joinedDate: '2022-09-01',
            record: { wins: 22, losses: 8 },
            status: 'active'
          },
          {
            id: 'w3',
            name: 'Alex Thompson',
            email: 'alex.t@fwn.edu',
            phone: '555-0103',
            grade: 10,
            weight: 132,
            role: 'wrestler',
            joinedDate: '2023-09-01',
            record: { wins: 18, losses: 5 },
            status: 'active'
          },
          {
            id: 'w4',
            name: 'Marcus Williams',
            email: 'marcus.w@fwn.edu',
            phone: '555-0104',
            grade: 12,
            weight: 170,
            role: 'captain',
            joinedDate: '2021-09-01',
            record: { wins: 25, losses: 7 },
            status: 'active'
          },
          {
            id: 'w5',
            name: 'David Lee',
            email: 'david.l@fwn.edu',
            phone: '555-0105',
            grade: 11,
            weight: 152,
            role: 'wrestler',
            joinedDate: '2022-09-01',
            record: { wins: 15, losses: 10 },
            status: 'injured'
          }
        ],
        createdAt: new Date().toISOString()
      }
      const teamsArray = [defaultTeam]
      setTeams(teamsArray)
      setSelectedTeam(defaultTeam)
      localStorage.setItem('teams', JSON.stringify(teamsArray))
    }
    
    // Set first team as selected
    const teamsData = storedTeams ? JSON.parse(storedTeams) : []
    if (teamsData.length > 0) {
      setSelectedTeam(teamsData[0])
    }
  }

  const addWrestler = () => {
    if (!selectedTeam || !newWrestler.name) {
      toast.error('Please enter wrestler name')
      return
    }

    const wrestler: Wrestler = {
      id: `w${Date.now()}`,
      name: newWrestler.name,
      email: newWrestler.email,
      phone: newWrestler.phone,
      grade: newWrestler.grade || 9,
      weight: newWrestler.weight || 106,
      role: newWrestler.role || 'wrestler',
      joinedDate: new Date().toISOString().split('T')[0],
      record: { wins: 0, losses: 0 },
      status: newWrestler.status || 'active'
    }

    const updatedTeam = {
      ...selectedTeam,
      wrestlers: [...selectedTeam.wrestlers, wrestler]
    }

    const updatedTeams = teams.map(t => t.id === selectedTeam.id ? updatedTeam : t)
    setTeams(updatedTeams)
    setSelectedTeam(updatedTeam)
    localStorage.setItem('teams', JSON.stringify(updatedTeams))
    
    toast.success(`Added ${wrestler.name} to the team`)
    setIsAddingWrestler(false)
    setNewWrestler({ grade: 9, weight: 106, role: 'wrestler', status: 'active' })
  }

  const removeWrestler = (wrestlerId: string) => {
    if (!selectedTeam) return

    const updatedTeam = {
      ...selectedTeam,
      wrestlers: selectedTeam.wrestlers.filter(w => w.id !== wrestlerId)
    }

    const updatedTeams = teams.map(t => t.id === selectedTeam.id ? updatedTeam : t)
    setTeams(updatedTeams)
    setSelectedTeam(updatedTeam)
    localStorage.setItem('teams', JSON.stringify(updatedTeams))
    
    toast.success('Wrestler removed from team')
  }

  const filteredWrestlers = selectedTeam?.wrestlers.filter(wrestler => {
    const matchesSearch = wrestler.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesWeight = filterWeight === 'all' || wrestler.weight.toString() === filterWeight
    const matchesGrade = filterGrade === 'all' || wrestler.grade.toString() === filterGrade
    return matchesSearch && matchesWeight && matchesGrade
  }) || []

  const weights = ['106', '113', '120', '126', '132', '138', '145', '152', '160', '170', '182', '195', '220', '285']
  const grades = ['9', '10', '11', '12']

  return (
    <>
      <PageBackground />
      <div className="p-4 md:p-6 relative">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF38]">Team Management</h1>
            <p className="text-gray-400">Manage wrestlers and team information</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-600 text-gray-400">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Team Info Cards */}
        {selectedTeam && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Total Wrestlers</p>
                    <p className="text-xl font-bold text-white">{selectedTeam.wrestlers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Team Captains</p>
                    <p className="text-xl font-bold text-white">
                      {selectedTeam.wrestlers.filter(w => w.role === 'captain').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Active Wrestlers</p>
                    <p className="text-xl font-bold text-white">
                      {selectedTeam.wrestlers.filter(w => w.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Division</p>
                    <p className="text-xl font-bold text-white">{selectedTeam.division}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search wrestlers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <Select value={filterWeight} onValueChange={setFilterWeight}>
                <SelectTrigger className="w-full md:w-40 bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Weight Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weights</SelectItem>
                  {weights.map(w => (
                    <SelectItem key={w} value={w}>{w} lbs</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger className="w-full md:w-32 bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map(g => (
                    <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isAddingWrestler} onOpenChange={setIsAddingWrestler}>
                <DialogTrigger asChild>
                  <Button className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Wrestler
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/95 border-[#D4AF38]/30">
                  <DialogHeader>
                    <DialogTitle className="text-[#D4AF38]">Add New Wrestler</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter wrestler information to add them to the team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-gray-400">Name</Label>
                      <Input
                        value={newWrestler.name || ''}
                        onChange={(e) => setNewWrestler({...newWrestler, name: e.target.value})}
                        className="bg-gray-900/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Email</Label>
                        <Input
                          type="email"
                          value={newWrestler.email || ''}
                          onChange={(e) => setNewWrestler({...newWrestler, email: e.target.value})}
                          className="bg-gray-900/50 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">Phone</Label>
                        <Input
                          value={newWrestler.phone || ''}
                          onChange={(e) => setNewWrestler({...newWrestler, phone: e.target.value})}
                          className="bg-gray-900/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-400">Grade</Label>
                        <Select 
                          value={newWrestler.grade?.toString()} 
                          onValueChange={(v) => setNewWrestler({...newWrestler, grade: parseInt(v)})}
                        >
                          <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map(g => (
                              <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-400">Weight</Label>
                        <Select 
                          value={newWrestler.weight?.toString()} 
                          onValueChange={(v) => setNewWrestler({...newWrestler, weight: parseInt(v)})}
                        >
                          <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {weights.map(w => (
                              <SelectItem key={w} value={w}>{w} lbs</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-400">Role</Label>
                        <Select 
                          value={newWrestler.role} 
                          onValueChange={(v: any) => setNewWrestler({...newWrestler, role: v})}
                        >
                          <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wrestler">Wrestler</SelectItem>
                            <SelectItem value="captain">Captain</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={addWrestler}
                      className="w-full bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black"
                    >
                      Add to Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Wrestlers List */}
        <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
          <CardHeader>
            <CardTitle className="text-[#D4AF38]">Team Roster</CardTitle>
            <CardDescription>
              {selectedTeam?.name || 'No team selected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-400">Wrestler</th>
                    <th className="text-center p-3 text-gray-400">Grade</th>
                    <th className="text-center p-3 text-gray-400">Weight</th>
                    <th className="text-center p-3 text-gray-400">Record</th>
                    <th className="text-center p-3 text-gray-400">Status</th>
                    <th className="text-center p-3 text-gray-400">Role</th>
                    <th className="text-right p-3 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWrestlers.map((wrestler) => (
                    <tr key={wrestler.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                      <td className="p-3">
                        <div>
                          <p className="text-white font-medium">{wrestler.name}</p>
                          <p className="text-xs text-gray-500">{wrestler.email}</p>
                        </div>
                      </td>
                      <td className="text-center p-3 text-gray-400">{wrestler.grade}</td>
                      <td className="text-center p-3 text-gray-400">{wrestler.weight} lbs</td>
                      <td className="text-center p-3 text-gray-400">
                        {wrestler.record ? `${wrestler.record.wins}-${wrestler.record.losses}` : '-'}
                      </td>
                      <td className="text-center p-3">
                        <Badge className={
                          wrestler.status === 'active' ? 'bg-green-600' :
                          wrestler.status === 'injured' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }>
                          {wrestler.status}
                        </Badge>
                      </td>
                      <td className="text-center p-3">
                        {wrestler.role === 'captain' && (
                          <Badge className="bg-[#D4AF38] text-black">Captain</Badge>
                        )}
                        {wrestler.role === 'wrestler' && (
                          <Badge className="bg-gray-600">Wrestler</Badge>
                        )}
                        {wrestler.role === 'manager' && (
                          <Badge className="bg-blue-600">Manager</Badge>
                        )}
                      </td>
                      <td className="text-right p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeWrestler(wrestler.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredWrestlers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  {searchQuery || filterWeight !== 'all' || filterGrade !== 'all' 
                    ? 'No wrestlers match your filters' 
                    : 'No wrestlers in team'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/analytics">
            <Button variant="outline" className="border-[#D4AF38] text-[#D4AF38]">
              View Analytics
            </Button>
          </Link>
          <Link href="/wrestling-matches">
            <Button variant="outline" className="border-[#D4AF38] text-[#D4AF38]">
              View Matches
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}