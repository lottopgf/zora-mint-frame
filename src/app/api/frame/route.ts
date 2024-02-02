import { Zora1155ABI } from '@/abi/Zora1155';
import { CHAIN, CONTRACT_ADDRESS, SITE_URL, TOKEN_ID } from '@/config';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import {
  Address,
  Hex,
  createPublicClient,
  createWalletClient,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY as Hex | undefined;
const HAS_KV = !!process.env.KV_URL;

const transport = http(process.env.RPC_URL);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport,
});

const walletClient = createWalletClient({
  chain: CHAIN,
  transport,
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    if (!MINTER_PRIVATE_KEY) throw new Error('MINTER_PRIVATE_KEY is not set');

    const body = await req.json(); // This will parse the JSON body of the request

    // Access untrustedData from the body
    const untrustedData = body.untrustedData;
    
    // Now, extract the buttonIndex from untrustedData
    const buttonIndex = untrustedData ? untrustedData.buttonIndex : null;
    
    // Use buttonIndex to determine the response
    if (buttonIndex === 1) {
      // If buttonIndex is 1, perform the redirect
      return NextResponse.redirect(`${SITE_URL}/redirect`, { status: 302 });
    } else {

    // Check if frame request is valid
    const status = await validateFrameRequest(body.trustedData?.messageBytes);

    if (!status?.valid) {
      console.error(status);
      throw new Error('Invalid frame request');
    }


    // Check if user has an address connected
    const address: Address | undefined =
      status?.action?.interactor?.verifications?.[0];

    if (!address) {
      return getResponse(ResponseType.NO_ADDRESS);
    }

    // Check if user has minted before
    if (HAS_KV) {
      const prevMintHash = await kv.get<Hex>(`mint:${address}`);

      if (prevMintHash) {
        return getResponse(ResponseType.ALREADY_MINTED);
      }
    }

    // Check if user has a balance
    const first_balance = await publicClient.readContract({
      abi: Zora1155ABI,
      address: CONTRACT_ADDRESS,
      functionName: 'balanceOf',
      args: [address, TOKEN_ID],
    });

    if (first_balance < 1n) {
      return getResponse(ResponseType.NFT_NOT_FOUND);
    }

    const second_balance = await publicClient.readContract({
      abi: Zora1155ABI,
      address: CONTRACT_ADDRESS,
      functionName: 'balanceOf',
      args: [address, 2n],
    });

    if (second_balance > 0n) {
    return getResponse(ResponseType.ALREADY_MINTED);
    }

    // Try minting a new token
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: Zora1155ABI,
      functionName: 'adminMint',
      args: [address, 2n, 1n, '0x'],
      account: privateKeyToAccount(MINTER_PRIVATE_KEY),
    });

    if (!request) {
      throw new Error('Could not simulate contract');
    }

    const hash = await walletClient.writeContract(request);

    if (HAS_KV) {
      await kv.set(`mint:${address}`, hash);
    }

    return getResponse(ResponseType.SUCCESS);
  } catch (error) {
    console.error(error);
    return getResponse(ResponseType.ERROR);
  }
}

enum ResponseType {
  SUCCESS,
  NFT_NOT_FOUND,
  ALREADY_MINTED,
  NO_ADDRESS,
  ERROR,
}

function getResponse(type: ResponseType) {
  const IMAGE = {
    [ResponseType.SUCCESS]: 'status/success.png',
    [ResponseType.NFT_NOT_FOUND]: 'status/missing-nft.png',
    [ResponseType.ALREADY_MINTED]: 'status/already-minted.png',
    [ResponseType.NO_ADDRESS]: 'status/no-address.png',
    [ResponseType.ERROR]: 'status/error.png',
  }[type];
  const shouldRetry =
    type === ResponseType.ERROR || type === ResponseType.NFT_NOT_FOUND;
  return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${SITE_URL}/${IMAGE}" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />
    ${
      shouldRetry
        ? `<meta property="fc:frame:button:1" content="Try again" /><meta property="fc:frame:button:2" content="Mint on Zora" /><meta property="fc:frame:button:2:action" content="post_redirect" />`
        : ''
    }
  </head></html>`);
}

async function validateFrameRequest(data: string | undefined) {
  if (!NEYNAR_API_KEY) throw new Error('NEYNAR_API_KEY is not set');
  if (!data) throw new Error('No data provided');

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      api_key: NEYNAR_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ message_bytes_in_hex: data }),
  };

  return await fetch(
    'https://api.neynar.com/v2/farcaster/frame/validate',
    options,
  )
    .then((response) => response.json())
    .catch((err) => console.error(err));
}
