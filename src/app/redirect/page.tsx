'use client';
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function RedirectPage() {
    const router = useRouter();

    useEffect(() => {
        const youtubeUrl = 'https://zora.co/collect/zora:0x1f1f8f9ab11c6d37170c33d3c04317ef447d47c2/1';

        // Perform the redirect
        //window.location.href = youtubeUrl; // For a full page reload redirect
        // Or use Next.js router for client-side redirect (comment out the line above if using this)
        router.push(youtubeUrl);
    }, [router]);

    return (
        <div>
            <p>Redirecting...</p>
        </div>
    );
}