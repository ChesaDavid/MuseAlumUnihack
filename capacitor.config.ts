import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'musealum',
  // Use Next's static export folder. Run `npx next build && npx next export`
  // which creates the `out/` folder. Capacitor should point to that folder.
  webDir: 'out'
};

export default config;
