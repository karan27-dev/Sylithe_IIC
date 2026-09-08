"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Linkedin, Send, Twitter, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import logo from "../assets/treee13.png"

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { to: "/platform", label: "dMRV Platform" },
      { to: "/what-we-offer", label: "What We Offer" },
      { to: "/insights", label: "Insights" },
    ],
  },
  {
    heading: "Methodology",
    links: [
      { to: "/methodology/lulc", label: "LULC Classification" },
      { to: "/methodology/chm", label: "Canopy Height Model" },
      { to: "/methodology/dcab", label: "Dynamic Baseline" },
      { to: "/methodology/agb", label: "AGB Calculation" },
    ],
  },
  {
    heading: "Project Types",
    links: [
      { to: "/project-types/biochar", label: "Biochar Carbon Removal" },
    ],
  },
  {
    heading: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/privacy-policy", label: "Privacy" },
      { to: "/terms-of-service", label: "Terms" },
    ],
  },
]

const SOCIALS = [
  { href: "https://x.com/Sylithe_", label: "X (Twitter)", Icon: Twitter },
  { href: "https://www.linkedin.com/company/sylithe/", label: "LinkedIn", Icon: Linkedin },
  { href: "mailto:info@sylithe.com", label: "Email", Icon: Send },
]

const Heading = ({ children }) => (
  <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{children}</h3>
)

const Footer = () => {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState("")

  React.useEffect(() => { document.documentElement.classList.add("dark") }, [])

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("sending")
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) { setStatus("success"); setEmail("") }
      else { setStatus(data.message === "Already subscribed" ? "exists" : "error") }
    } catch { setStatus("error") }
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#06140F] text-white">
      <div className="relative mx-auto max-w-7xl px-6 pt-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* ── Left: tagline + newsletter ── */}
          <div className="lg:col-span-5">
            <h2 className="text-[28px] font-bold leading-tight tracking-tight md:text-[32px]">
              Digital MRV infrastructure<br className="hidden sm:block" /> for nature-based carbon.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/50">
              High-resolution satellite measurement for ARR, REDD+ and agroforestry, and durable removal MRV for biochar. Built by people who care about data integrity.
            </p>

            <form onSubmit={handleNewsletter} className="mt-8 max-w-sm">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Join our newsletter"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus("") }}
                  required
                  aria-label="Email address"
                  className="h-11 rounded-xl border-white/10 bg-white/[0.04] pr-12 text-white placeholder:text-white/40 focus-visible:ring-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  aria-label="Subscribe"
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-[#06140F] transition-colors duration-200 hover:bg-emerald-400 disabled:opacity-60"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
              <div className="mt-2 h-4 text-[12px]">
                {status === "success" && <span className="text-emerald-400">Subscribed — check your inbox.</span>}
                {status === "exists" && <span className="text-amber-400">You're already subscribed.</span>}
                {status === "error" && <span className="text-red-400">Something went wrong. Try again.</span>}
              </div>
            </form>
          </div>

          {/* ── Right: link columns + connect ── */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <Heading>{col.heading}</Heading>
                <nav className="flex flex-col gap-3.5">
                  {col.links.map((l) => (
                    <Link key={l.to} to={l.to} className="text-[14px] text-white/60 transition-colors duration-200 hover:text-white">
                      {l.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
            <div>
              <Heading>Connect</Heading>
              <div className="flex gap-4">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-white/50 transition-colors duration-200 hover:text-emerald-400"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Copyright ── */}
        <p className="mt-14 text-right text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
          © {new Date().getFullYear()} · Sylithe · All rights reserved
        </p>
      </div>

      {/* logo spins slowly + colourises over time; container sways horizontally; full colour on hover */}
      <style>{`
        @keyframes sylSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sylSway {
          0%, 100% { transform: translateX(-60px); }
          50%      { transform: translateX(60px); }
        }
        @keyframes sylColorize {
          0%   { filter: grayscale(1) brightness(1.05); }
          45%  { filter: grayscale(0) brightness(1); }
          80%  { filter: grayscale(0) brightness(1); }
          100% { filter: grayscale(1) brightness(1.05); }
        }
        .syl-sway { animation: sylSway 6s ease-in-out infinite; }
        .syl-logo { filter: grayscale(1); animation: sylSpin 8s linear infinite, sylColorize 7s steps(6, end) 1.2s infinite; transition: filter .4s ease; }
        .syl-sway:hover { animation-duration: 3s; }
        .syl-sway:hover .syl-logo { animation-duration: 2s, 0s; filter: grayscale(0); animation-delay: 0s, 0s; }
      `}</style>

      {/* ── Giant wordmark with glowing logo tile (colourises over time + on hover) ── */}
      <div className="relative mt-6 select-none">
        <p
          aria-hidden
          className="overflow-hidden bg-gradient-to-b from-emerald-400/35 via-emerald-500/20 to-emerald-600/5 bg-clip-text text-center font-bold leading-[0.82] tracking-tighter text-transparent"
          style={{ fontSize: "min(24vw, 360px)" }}
        >
          Sylithe
        </p>

        {/* Centered logo tile — sways horizontally */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="syl-sway">
          <a
            href="https://www.sylithe.com"
            aria-label="Sylithe home"
            className="syl-tile group"
          >
            <span className="relative flex h-36 w-36 items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.05]">
              <img src={logo} alt="Sylithe" className="syl-logo h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110" />
            </span>
          </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
