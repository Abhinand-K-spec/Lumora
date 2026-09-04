import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBackToSignIn = () => {
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col relative overflow-hidden">
      {/* Outer border */}
      <div className="absolute inset-1 border border-white/10 pointer-events-none" />

      {/* Subtle background glow */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        <div className="h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Logo */}
      <header className="relative z-10 flex justify-center pt-8">
        <div className="text-[13px] tracking-[0.3em] font-medium text-white/85">
          LUMORA
        </div>
      </header>

      {/* Content */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center -mt-10 px-6">
        {/* Error Icon */}
        <div className="relative mb-7 flex h-[92px] w-[92px] items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.01]">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl" />

          {/* X */}
          <div className="relative h-8 w-8">
            <span className="absolute left-1/2 top-1/2 h-[1px] w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-primary" />
            <span className="absolute left-1/2 top-1/2 h-[1px] w-8 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-center font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-2 max-w-[310px] text-center text-[11px] leading-5 text-white/45">
          The moment you're looking for doesn't exist.
          <br />
          Let's find you somewhere else.
        </p>

        {/* Retry / Home button */}
        <button
          onClick={() => navigate("/")}
          className="mt-7 h-8 w-[82px] rounded-[4px] bg-primary text-[8px] font-semibold tracking-[0.2em] text-black transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(255,200,100,0.15)]"
        >
          GO HOME
        </button>

        {/* Back to sign in */}
        <button
          onClick={handleBackToSignIn}
          className="mt-3 border-b border-white/10 pb-1 text-[7px] tracking-[0.2em] text-white/40 transition-colors hover:text-white/70"
        >
          BACK TO SIGN IN
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex justify-center pb-4">
        <p className="text-[6px] tracking-[0.12em] text-white/[0.16]">
          © 2024 LUMORA. WHERE MOMENTS FIND YOU. 0X55E92
        </p>
      </footer>
    </main>
  );
};

export default NotFound;