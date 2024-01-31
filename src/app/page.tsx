import {
  CHAIN,
  CONTRACT_ADDRESS,
  FRAME_METADATA,
  SITE_URL,
  TOKEN_ID,
} from '@/config';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: 'Free mint!',
  other: FRAME_METADATA,
};

export default function Home() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex' }}>
      <h1
        style={{
          margin: 'auto',
          fontFamily: 'Comic Sans MS, Comic Sans, cursive',
        }}
      >
        <a
          href={`https://zora.co/collect/${CHAIN.id}:${CONTRACT_ADDRESS}/${TOKEN_ID}`}
          style={{ color: 'inherit' }}
        >
          Free mint!
        </a>
      </h1>
    </div>
  );
}
