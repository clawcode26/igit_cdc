import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deptportal.app',
  appName: 'Departmental',
  webDir: 'public',
  server: {
    url: 'https://departmental-mu.vercel.app/',
    cleartext: true
  }
};

export default config;
