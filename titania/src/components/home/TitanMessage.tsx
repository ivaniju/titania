import { TitanAvatar } from "@/components/ui/TitanAvatar";

export function TitanMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border border-border bg-glass p-4">
      <TitanAvatar />
      <div>
        <div className="mb-1 text-[11px] font-bold tracking-[0.3px] text-accent">
          Titan
        </div>
        <p className="text-[13.5px] leading-[1.55] text-white/88">{text}</p>
      </div>
    </div>
  );
}
