*** expose dev url to mobile, `localhost:5173` ***

+   you need a dependency, `ngrok`
    i had it already installed, but claude says you can install with `npm install -g ngrok`

    once, installed..

+   modified `vite.config.ts` to allow ngrok hosts:

    `
    export default defineConfig({
        plugins: [react()],
        server: {
            host: true,
            port: 5173,
            strictPort: true,
            allowedHosts: ['.ngrok-free.app', '.ngrok.io']
        },
    });
    `