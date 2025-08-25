'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface ImportedMatch {
  date: string
  wrestler1_name: string
  wrestler1_team: string
  wrestler1_score: number
  wrestler2_name: string
  wrestler2_team: string
  wrestler2_score: number
  weight_class: number
  match_type: string
  winner: string
  win_type: string
  period: number
  final_time: string
}

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [parsedData, setParsedData] = useState<ImportedMatch[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const parseCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    
    const matches: ImportedMatch[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim())
        const match: any = {}
        
        headers.forEach((header, index) => {
          const value = values[index]
          
          // Parse numeric fields
          if (header.includes('score') || header.includes('weight') || header === 'period') {
            match[header] = parseInt(value) || 0
          } else {
            match[header] = value
          }
        })
        
        // Ensure required fields
        if (match.wrestler1_name && match.wrestler2_name && match.weight_class) {
          matches.push(match as ImportedMatch)
        } else {
          errors.push(`Row ${i + 1}: Missing required fields`)
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: Parse error`)
      }
    }
    
    setParsedData(matches)
    if (errors.length > 0) {
      setImportResults({
        success: 0,
        failed: errors.length,
        errors: errors.slice(0, 5) // Show first 5 errors
      })
    }
    setShowPreview(true)
  }

  const handleImport = async () => {
    if (!parsedData.length) return
    
    setImporting(true)
    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (const match of parsedData) {
      try {
        const response = await fetch('/api/matches/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(match)
        })
        
        if (response.ok) {
          successCount++
        } else {
          failedCount++
          const error = await response.text()
          errors.push(`${match.wrestler1_name} vs ${match.wrestler2_name}: ${error}`)
        }
      } catch (error) {
        failedCount++
        errors.push(`${match.wrestler1_name} vs ${match.wrestler2_name}: Network error`)
      }
    }
    
    setImportResults({
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 5)
    })
    setImporting(false)
    setShowPreview(false)
  }

  const downloadTemplate = () => {
    const template = `Date,Wrestler1 Name,Wrestler1 Team,Wrestler1 Score,Wrestler2 Name,Wrestler2 Team,Wrestler2 Score,Weight Class,Match Type,Winner,Win Type,Period,Final Time
2025-01-15,Smith John,Eagles,8,Johnson Mike,Hawks,6,125,Dual,Smith John,Decision,3,6:00
2025-01-15,Davis Tom,Eagles,0,Wilson Bob,Hawks,15,132,Dual,Wilson Bob,Tech Fall,2,3:45
2025-01-16,Anderson Jim,Lions,7,Brown Steve,Tigers,7,138,Tournament,Tie,SV-1,4,8:00`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wrestling_matches_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-black/80 backdrop-blur-sm border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import Historical Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Template Download */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-white mb-2">Need a template? Download our CSV format guide:</p>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="bg-gold/10 text-gold hover:bg-gold/20 border-gold/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gold/30 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <Upload className="w-12 h-12 text-gold" />
              <span className="text-white font-semibold">
                {file ? file.name : 'Click to upload CSV file'}
              </span>
              <span className="text-gray-400 text-sm">
                Supported format: CSV with match data
              </span>
            </label>
          </div>

          {/* Preview */}
          {showPreview && parsedData.length > 0 && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">
                Preview: {parsedData.length} matches found
              </h3>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-1">Date</th>
                      <th className="text-left py-1">Match</th>
                      <th className="text-left py-1">Weight</th>
                      <th className="text-left py-1">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((match, idx) => (
                      <tr key={idx} className="text-white border-b border-gray-800">
                        <td className="py-1">{match.date}</td>
                        <td className="py-1">
                          {match.wrestler1_name} vs {match.wrestler2_name}
                        </td>
                        <td className="py-1">{match.weight_class}</td>
                        <td className="py-1">
                          {match.wrestler1_score}-{match.wrestler2_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <p className="text-gray-400 text-sm mt-2">
                    ...and {parsedData.length - 5} more matches
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleImport}
                disabled={importing}
                className="mt-4 bg-gold hover:bg-gold/90 text-black font-bold w-full"
              >
                {importing ? 'Importing...' : `Import ${parsedData.length} Matches`}
              </Button>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <Alert className={importResults.failed > 0 ? 'border-red-500' : 'border-green-500'}>
              {importResults.failed > 0 ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-white">
                    Import Complete: {importResults.success} successful, {importResults.failed} failed
                  </p>
                  {importResults.errors.length > 0 && (
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold mb-1">Errors:</p>
                      <ul className="list-disc list-inside">
                        {importResults.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}