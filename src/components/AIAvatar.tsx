// src/components/AIAvatar.tsx
import Image from "next/image";

export const AIAvatar: React.FC = () => (
  <div className="flex flex-col items-center">
    <Image
      src="/ai-avatar.png"
      alt="AI HR Agent"
      width={120}
      height={120}
      className="rounded-full border border-gray-300"
    />
    <span className="mt-2 text-sm font-medium text-gray-700">AI HR Agent</span>
    <span className="text-xs text-green-600">LIVE</span>
  </div>
);
