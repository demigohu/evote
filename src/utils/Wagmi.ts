import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig, 
} from '@rainbow-me/rainbowkit';
import {
  polygon,
  polygonAmoy,
} from 'wagmi/chains';
import { createStorage, cookieStorage } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '34ca282a0bfef88e94723077a5a876dc',
  storage: createStorage({
    storage: cookieStorage,
  }),
  chains: [polygon, polygonAmoy],
  ssr: false, // If your dApp uses server side rendering (SSR)
});