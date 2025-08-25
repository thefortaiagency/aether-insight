'use client'

import { usePathname } from 'next/navigation'
import Navigation from './navigation'

export default function ConditionalNav() {
  const pathname = usePathname()
  
  // Don't show navigation on landing page or contact page
  if (pathname === '/' || pathname === '/contact') {
    return null
  }
  
  return <Navigation />
}