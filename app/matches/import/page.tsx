'use client'

import { Button } from '@/components/ui/button'
import { CSVImport } from '@/components/csv-import'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/matches">
            <Button 
              variant="outline" 
              className="bg-black/60 text-gold hover:bg-gold/20 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Matches
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-gold mb-2">Import Match History</h1>
          <p className="text-gray-400">
            Upload CSV files containing your historical match data. Perfect for migrating from other platforms or importing season records.
          </p>
        </div>

        {/* Import Component */}
        <CSVImport />

        {/* Instructions */}
        <div className="mt-8 bg-black/60 backdrop-blur-sm border border-gold/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold mb-4">CSV Format Guide</h2>
          <div className="space-y-3 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-1">Required Fields:</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Wrestler1 Name - First wrestler's full name</li>
                <li>Wrestler2 Name - Second wrestler's full name</li>
                <li>Weight Class - Weight class (106-285)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-1">Optional Fields:</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Date - Match date (YYYY-MM-DD format)</li>
                <li>Wrestler1/2 Team - Team names</li>
                <li>Wrestler1/2 Score - Final scores</li>
                <li>Match Type - Dual, Tournament, or Exhibition</li>
                <li>Winner - Name of winning wrestler</li>
                <li>Win Type - Decision, Major, Tech Fall, Pin, etc.</li>
                <li>Period - Period match ended (1-3, SV, TB)</li>
                <li>Final Time - Match time when ended</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">Tips:</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Use the template download to see the exact format</li>
                <li>Ensure names are consistent across matches</li>
                <li>Weight classes must be valid wrestling weights</li>
                <li>Dates should be in YYYY-MM-DD format</li>
                <li>Large files will be processed in batches</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integration Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Seamlessly integrated with{' '}
            <span className="text-gold font-semibold">AetherVTC</span> for complete team management
          </p>
        </div>
      </div>
    </div>
  )
}