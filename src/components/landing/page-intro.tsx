import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  image?: string;
}

export function PageIntro({ eyebrow, title, description, actions, image }: PageIntroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 pb-16 pt-32 text-white sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/55" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-400">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-heading text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
