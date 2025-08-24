'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Plus, Edit, Trash2, Shield, User, Mail, Phone, 
  Calendar, Award, Home, Search, Filter, UserPlus, Settings,
  X
} from 'lucide-react'
import Link from 'next/link'

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
      alert('Please enter wrestler name')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF38]">Team Management</h1>
          <p className="text-gray-400">Manage wrestlers and team information</p>
        </div>
        <Link href="/dashboard">
          <button className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </Link>
      </div>

      {/* Team Info Cards */}
      {selectedTeam && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Total Wrestlers</p>
                <p className="text-xl font-bold text-white">{selectedTeam.wrestlers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Team Captains</p>
                <p className="text-xl font-bold text-white">
                  {selectedTeam.wrestlers.filter(w => w.role === 'captain').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Active Wrestlers</p>
                <p className="text-xl font-bold text-white">
                  {selectedTeam.wrestlers.filter(w => w.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Division</p>
                <p className="text-xl font-bold text-white">{selectedTeam.division}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wrestlers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
              />
            </div>
          </div>
          
          <select 
            value={filterWeight} 
            onChange={(e) => setFilterWeight(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
          >
            <option value="all">All Weights</option>
            {weights.map(w => (
              <option key={w} value={w}>{w} lbs</option>
            ))}
          </select>

          <select 
            value={filterGrade} 
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
          >
            <option value="all">All Grades</option>
            {grades.map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAddingWrestler(true)}
            className="px-4 py-2 bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Wrestler
          </button>
        </div>
      </div>

      {/* Add Wrestler Modal */}
      {isAddingWrestler && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black/95 border border-[#D4AF38]/30 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-[#D4AF38] text-xl font-bold">Add New Wrestler</h2>
                <p className="text-gray-400 text-sm">Enter wrestler information to add them to the team</p>
              </div>
              <button
                onClick={() => setIsAddingWrestler(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <input
                  type="text"
                  value={newWrestler.name || ''}
                  onChange={(e) => setNewWrestler({...newWrestler, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <input
                    type="email"
                    value={newWrestler.email || ''}
                    onChange={(e) => setNewWrestler({...newWrestler, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <input
                    type="text"
                    value={newWrestler.phone || ''}
                    onChange={(e) => setNewWrestler({...newWrestler, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Grade</label>
                  <select 
                    value={newWrestler.grade?.toString()} 
                    onChange={(e) => setNewWrestler({...newWrestler, grade: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
                  >
                    {grades.map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Weight</label>
                  <select 
                    value={newWrestler.weight?.toString()} 
                    onChange={(e) => setNewWrestler({...newWrestler, weight: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
                  >
                    {weights.map(w => (
                      <option key={w} value={w}>{w} lbs</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Role</label>
                  <select 
                    value={newWrestler.role} 
                    onChange={(e) => setNewWrestler({...newWrestler, role: e.target.value as any})}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-[#D4AF38]"
                  >
                    <option value="wrestler">Wrestler</option>
                    <option value="captain">Captain</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={addWrestler}
                className="w-full px-4 py-2 bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black rounded-lg transition-colors"
              >
                Add to Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wrestlers List */}
      <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg">
        <div className="p-6 border-b border-[#D4AF38]/30">
          <h2 className="text-[#D4AF38] text-xl font-bold">Team Roster</h2>
          <p className="text-gray-400 text-sm">{selectedTeam?.name || 'No team selected'}</p>
        </div>
        
        <div className="p-6">
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
                      <span className={`px-2 py-1 rounded text-xs ${
                        wrestler.status === 'active' ? 'bg-green-600' :
                        wrestler.status === 'injured' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }`}>
                        {wrestler.status}
                      </span>
                    </td>
                    <td className="text-center p-3">
                      {wrestler.role === 'captain' && (
                        <span className="px-2 py-1 rounded text-xs bg-[#D4AF38] text-black">Captain</span>
                      )}
                      {wrestler.role === 'wrestler' && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-600">Wrestler</span>
                      )}
                      {wrestler.role === 'manager' && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-600">Manager</span>
                      )}
                    </td>
                    <td className="text-right p-3">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeWrestler(wrestler.id)}
                          className="p-2 text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/analytics">
          <button className="px-4 py-2 border border-[#D4AF38] text-[#D4AF38] rounded-lg hover:bg-[#D4AF38]/10 transition-colors">
            View Analytics
          </button>
        </Link>
        <Link href="/wrestling-matches">
          <button className="px-4 py-2 border border-[#D4AF38] text-[#D4AF38] rounded-lg hover:bg-[#D4AF38]/10 transition-colors">
            View Matches
          </button>
        </Link>
      </div>
    </div>
  )
}