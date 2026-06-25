"use client";

import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`ChopWise enquiry from ${name || "website visitor"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@chopwise.cm?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={submit} className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-black/5 sm:p-8">
      <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Mail className="size-5" /></div><div><h2 className="font-heading text-2xl font-black text-slate-950">Send an enquiry</h2><p className="text-sm text-slate-500">Your email application will open with the message prepared.</p></div></div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">Full name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></label>
        <label className="text-sm font-bold text-slate-700">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></label>
      </div>
      <label className="mt-5 block text-sm font-bold text-slate-700">Message<textarea required value={message} onChange={(event) => setMessage(event.target.value)} rows={6} className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></label>
      <button type="submit" className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 text-sm font-black text-white shadow-lg hover:bg-orange-700">Prepare email <Send className="size-4" /></button>
    </form>
  );
}
