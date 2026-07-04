import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800 shadow-xl shadow-black">
        <WifiOff className="w-12 h-12 text-zinc-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">You are currently offline</h1>
      <p className="text-zinc-400 max-w-sm">
        Connect to the internet to listen to your music library and use the Music PWA.
      </p>
    </div>
  );
}
