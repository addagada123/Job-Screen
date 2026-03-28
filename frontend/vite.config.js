import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Default Vite config for React
export default defineConfig({
	plugins: [react()],
	server: {},
});
