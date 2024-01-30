import { SITE_URL, FRAME_METADATA } from '@/config'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: 'Free mint!',
  other: FRAME_METADATA,
}

export default function Home() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex' }}>
      <h1 style={{ margin: 'auto' }}>Free mint!</h1>
    </div>
  )
}
