import { PillButton } from "@/components/ui/PillButton";

export function TrainingCard({
  title,
  meta,
  imageUrl,
}: {
  title: string;
  meta: string;
  imageUrl: string;
}) {
  return (
    <div
      className="relative flex min-h-[190px] flex-col justify-end overflow-hidden rounded-[28px] bg-cover bg-center p-[22px]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.8) 100%), url(${imageUrl})`,
      }}
    >
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[1.2px] text-accent">
        Entrenamiento de hoy
      </div>
      <div className="text-[20px] font-bold tracking-[-0.2px]">{title}</div>
      <div className="mt-1.5 text-[13px] text-white/70">{meta}</div>
      <PillButton className="mt-4 self-start">Empezar entreno</PillButton>
    </div>
  );
}
