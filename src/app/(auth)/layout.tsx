export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-50 via-brand-cream to-amber-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-brand-orange)_0%,_transparent_50%)] opacity-[0.08]" />
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <path d="M9 9h.01M15 9h.01" />
              </svg>
            </div>
            <span className="text-2xl font-bold font-heading text-brand-dark">
              Chop<span className="text-brand-orange">Wise</span>
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold font-heading text-brand-dark leading-tight mb-6">
            Your table is
            <br />
            <span className="text-gradient">waiting for you.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Join thousands of diners discovering and reserving at the best
            restaurants across Cameroon. AI-powered, instant, delightful.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-12">
            <div>
              <div className="text-3xl font-bold text-brand-dark">500+</div>
              <div className="text-sm text-muted-foreground">Restaurants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-dark">10K+</div>
              <div className="text-sm text-muted-foreground">Reservations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-dark">4.8★</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-orange/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
