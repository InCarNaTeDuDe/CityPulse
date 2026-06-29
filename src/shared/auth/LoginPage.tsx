import React, { useState, useTransition } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  User,
  Mail,
  ShieldCheck,
  Sparkles,
  MapPin,
  Zap,
} from "lucide-react";
import { toast } from "@/src/shared/components/Toast";

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithGoogleCredential } = useAuth();
  const navigate = useNavigate();

  const [isPending, startTransition] = useTransition();

  // Info explanations tab state
  const [infoTab, setInfoTab] = useState<"daymates" | "ticketswap" | "problem">(
    "daymates",
  );

  React.useEffect(() => {
    const clientID =
      (import.meta as any).env.VITE_GOOGLE_CLIENT_ID ||
      "822363715206-m0c2scghksic6nke9ep8e91i2a6g3s98.apps.googleusercontent.com";

    const handleCredentialResponse = async (response: any) => {
      startTransition(async () => {
        try {
          await loginWithGoogleCredential(response.credential);
          toast("Successfully authenticated with Google One Tap!");
          navigate("/app");
        } catch (err: any) {
          toast(err.message || "Google One Tap Sign-In failed", "error");
        }
      });
    };

    const initializeGoogle = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        try {
          google.accounts.id.initialize({
            client_id: clientID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Show One Tap prompt
          google.accounts.id.prompt();

          // Render the standard Sign In button in the container
          const container = document.getElementById(
            "google-one-tap-button-container",
          );
          if (container) {
            google.accounts.id.renderButton(container, {
              theme: "filled_black",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 320,
            });
          }
        } catch (err) {
          console.error("Google Sign In SDK Initialization Error:", err);
        }
      }
    };

    // Retry initialization if SDK script loads slightly after component mounts
    let timer = setTimeout(initializeGoogle, 500);
    let retryTimer = setTimeout(initializeGoogle, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
    };
  }, [navigate]);

  return (
    <div className="flex-1 min-h-screen flex flex-col md:flex-row bg-[#faf9f6] dark:bg-neutral-950 font-sans select-none overflow-hidden">
      {/* LEFT SIDE: Visual Showcase for Desktop */}
      <div className="hidden md:flex md:w-1/2 bg-neutral-900 dark:bg-neutral-900 relative p-6 lg:p-12 xl:p-16 flex-col justify-between text-white overflow-hidden border-r border-neutral-800">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neutral-100/5 blur-[120px]" />

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 lg:gap-3.5 z-10">
          <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white dark:bg-neutral-950 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-neutral-900 dark:text-white text-lg lg:text-xl font-black italic tracking-tighter">
              D
            </span>
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-black tracking-tight text-white leading-none">
              DayMates
            </h1>
            <p className="text-[9px] lg:text-[10px] text-emerald-400 font-bold tracking-wider mt-1 uppercase">
              HYPER-LOCAL OPPORTUNITY HUB
            </p>
          </div>
        </div>

        {/* Feature Highlights Pitch */}
        <div className="my-auto space-y-6 lg:space-y-8 xl:space-y-10 max-w-md z-10 py-6">
          <div className="space-y-3 lg:space-y-4">
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Meet real people.
              <br />
              <span className="text-emerald-400">Trade tickets securely.</span>
            </h2>
            <p className="text-neutral-400 text-xs lg:text-sm leading-relaxed">
              We bridge neighborhood companionship with verified ticket resale.
              Meet like-minded buddies or recover value on unused bookings
              instantly.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div className="flex gap-3 lg:gap-4 items-start">
              <div className="p-2 lg:p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/50 text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h3 className="text-xs lg:text-sm font-bold text-neutral-100">
                  Hyper-Local Circle
                </h3>
                <p className="text-[11px] lg:text-xs text-neutral-400 mt-1 leading-relaxed">
                  Discover active listings within your immediate neighborhood.
                  Cricket matches, dining companions, coffee hangouts.
                </p>
              </div>
            </div>

            <div className="flex gap-3 lg:gap-4 items-start">
              <div className="p-2 lg:p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/50 text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h3 className="text-xs lg:text-sm font-bold text-neutral-100">
                  Secure Escrow Protection
                </h3>
                <p className="text-[11px] lg:text-xs text-neutral-400 mt-1 leading-relaxed">
                  No direct wire transfers. Funds are held safely in
                  double-ledger escrow and released only after verified checkout
                  validation.
                </p>
              </div>
            </div>

            <div className="flex gap-3 lg:gap-4 items-start">
              <div className="p-2 lg:p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/50 text-emerald-400 shrink-0">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h3 className="text-xs lg:text-sm font-bold text-neutral-100">
                  Zero Trust Framework
                </h3>
                <p className="text-[11px] lg:text-xs text-neutral-400 mt-1 leading-relaxed">
                  Every user is validated. Experience complete transparency with
                  instant verified profile metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] lg:text-[11px] text-neutral-500 font-semibold z-10">
          DayMates Technology Platform • Trusted by Local Communities
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Container */}
      <div className="flex-1 flex flex-col justify-between px-6 py-12 md:p-16 lg:p-24 bg-white dark:bg-neutral-950 transition-colors duration-200">
        {/* Mobile Logo Brand Area */}
        <div className="flex flex-col items-center mt-4 md:hidden">
          <div className="relative mb-4">
            <div className="w-14 h-14 bg-neutral-900 dark:bg-white rounded-[1.4rem] flex items-center justify-center shadow-lg">
              <span className="text-white dark:text-neutral-950 text-xl font-black italic tracking-tighter">
                D
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-neutral-950 p-1.5 rounded-full shadow border-2 border-white dark:border-neutral-950">
              <Ticket className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight text-center">
            DayMates
          </h1>
          <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mt-0.5 text-center uppercase tracking-wider">
            Companions & Tickets
          </p>
        </div>

        {/* Centerpiece Form Content */}
        <div className="my-auto max-w-sm w-full mx-auto">
          {/* Main Title & Subtitle for Desktop */}
          <div className="hidden md:block mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Verified Google Auth</span>
            </div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Access the Platform
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold mt-1">
              Sign in with your Google account to explore secured activities and
              events.
            </p>
          </div>

          {/* Interactive Information Tabs Panel */}
          <div className="mb-6 bg-neutral-50 dark:bg-neutral-900/40 p-1.5 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setInfoTab("daymates")}
                className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  infoTab === "daymates"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Daymates</span>
              </button>
              <button
                type="button"
                onClick={() => setInfoTab("ticketswap")}
                className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  infoTab === "ticketswap"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>TicketSwap</span>
              </button>
              <button
                type="button"
                onClick={() => setInfoTab("problem")}
                className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  infoTab === "problem"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Solved</span>
              </button>
            </div>

            <div className="mt-2.5 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800/50 min-h-[96px] flex flex-col justify-center">
              {infoTab === "daymates" && (
                <div className="space-y-1 animate-fade-in">
                  <h4 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    👥 Meet Local Companions
                  </h4>
                  <p className="text-[10.5px] font-bold text-neutral-600 dark:text-neutral-300 leading-normal">
                    No more doing things alone. Instantly match with verified
                    companions ("daymates") to head out for cricket matches,
                    movie screenings, turf games, or casual weekend coffee.
                  </p>
                </div>
              )}

              {infoTab === "ticketswap" && (
                <div className="space-y-1 animate-fade-in">
                  <h4 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    🎟 Secure Last-Minute Trades
                  </h4>
                  <p className="text-[10.5px] font-bold text-neutral-600 dark:text-neutral-300 leading-normal">
                    Recover value on unused event bookings or grab sold-out
                    entry slots safely from other local users. Our escrow ledger
                    secures funds until you verify successful entry at the
                    gates.
                  </p>
                </div>
              )}

              {infoTab === "problem" && (
                <div className="space-y-1 animate-fade-in">
                  <h4 className="text-[11px] font-black text-rose-500 flex items-center gap-1.5 uppercase tracking-wider">
                    🛡 The Ticket Scam Solution
                  </h4>
                  <p className="text-[10.5px] font-bold text-neutral-600 dark:text-neutral-300 leading-normal">
                    Tired of wire transfer scams, over-priced scalpers, and
                    shady marketplace accounts? DayMates eliminates risk with
                    peer-to-peer verification and double-ledger escrow safety
                    checks.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form container card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none space-y-5">
            <div className="space-y-4">
              <div className="text-center font-bold text-neutral-700 dark:text-neutral-300 text-xs uppercase tracking-wider mb-2">
                Google Single Sign-On
              </div>

              {/* Real Google Identity Services Button Container */}
              <div className="flex justify-center py-2">
                <div
                  id="google-one-tap-button-container"
                  className="w-full min-h-[44px] flex justify-center items-center"
                />
              </div>

              <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500 leading-normal px-2">
                Google One Tap dialog will slide down from the top right of your
                screen automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal Notice */}
        <div className="text-center px-4 mt-8 md:mt-0">
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-normal font-semibold max-w-xs mx-auto">
            By continuing, you agree to the DayMates Terms of Service and
            Privacy Policy. Escrow payments and transactions are fully secured
            with automated double-ledger checks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
