import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sveltekit(),
        SvelteKitPWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
            },
            manifest: {
                name: 'Inward - Interoception Training',
                short_name: 'Inward',
                description:
                    'A peer-to-peer PWA for interoception training - helping people recognize and describe internal body sensations',
                theme_color: '#4f46e5',
                background_color: '#f5f5f5',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
});
