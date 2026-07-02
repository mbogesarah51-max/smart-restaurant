import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { PageIntro } from "@/components/landing/page-intro";
import { ContactForm } from "@/components/landing/contact-form";
import { FoodieFooter } from "@/components/landing/foodie-footer";

export const metadata = {
  title: "Contact | ChopWise",
  description: "Contact the ChopWise project team for restaurant onboarding, support and partnerships.",
};

export default function ContactPage() {
  const configuredPhone = process.env.NEXT_PUBLIC_CHOPWISE_PHONE;
  const whatsappHref = configuredPhone
    ? `https://wa.me/${configuredPhone.replace(/\D/g, "")}`
    : null;

  return (
    <main className="min-h-screen bg-[#fffaf5]">
      <Navbar />
      <PageIntro
        eyebrow="Contact ChopWise"
        title="Questions, restaurant onboarding or partnership enquiries?"
        description="Use the contact options below to reach the ChopWise project team. The page is linked directly from the main navigation on desktop and mobile."
        image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85"
      />
      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div className="space-y-4">
            <a href="mailto:hello@chopwise.cm" className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Mail className="size-5" /></div>
              <div><p className="font-heading text-lg font-black text-slate-950">Email</p><p className="mt-1 text-sm text-slate-500">hello@chopwise.cm</p></div>
            </a>
            {configuredPhone ? (
              <>
                <a href={`tel:${configuredPhone}`} className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Phone className="size-5" /></div>
                  <div><p className="font-heading text-lg font-black text-slate-950">Call</p><p className="mt-1 text-sm text-slate-500">{configuredPhone}</p></div>
                </a>
                {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MessageCircle className="size-5" /></div><div><p className="font-heading text-lg font-black text-slate-950">WhatsApp</p><p className="mt-1 text-sm text-slate-500">Chat using the configured +237 line</p></div></a>}
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50 p-6 text-sm leading-6 text-orange-900">
                Add <code className="font-bold">NEXT_PUBLIC_CHOPWISE_PHONE</code> in Vercel using a Cameroon number such as <strong>+2376XXXXXXXX</strong> to activate the Call and WhatsApp buttons.
              </div>
            )}
            <div className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><MapPin className="size-5" /></div>
              <div><p className="font-heading text-lg font-black text-slate-950">Coverage</p><p className="mt-1 text-sm leading-6 text-slate-500">Douala, Yaoundé, Limbe and Buea, Cameroon</p></div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
      <FoodieFooter />
    </main>
  );
}
