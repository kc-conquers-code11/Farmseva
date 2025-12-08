'use client'

import { usePathname } from 'next/navigation'
import AccessibilityWidget from './AccessibilityWidget'

const HIDDEN_PATHS = ['/', '/login', '/register']

export default function AccessibilityEntry() {
  const pathname = usePathname()

  // ⬇️ add this null check
  if (!pathname || HIDDEN_PATHS.includes(pathname)) {
  return null
}


  // Show widget on all other routes
  return <AccessibilityWidget />
}
