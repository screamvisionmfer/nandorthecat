import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

const CONTRACT = "0x2ea48005c3525de3cdf56b6658156f9fcb890636";
const CHAIN = "base";

function fmtUsd(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const x = Number(n);
  if (x >= 1e9) return `$${(x / 1e9).toFixed(2)}B`;
  if (x >= 1e6) return `$${(x / 1e6).toFixed(2)}M`;
  if (x >= 1e3) return `$${(x / 1e3).toFixed(2)}K`;
  return `$${x.toFixed(2)}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70 ring-1 ring-black/10">
      {children}
    </span>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-sm md:text-base text-black/60 max-w-2xl">{subtitle}</p>
      ) : null}
    </div>
  );
}

function StoryCard({ title, text }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
      <div className="text-lg font-extrabold">{title}</div>
      <p className="mt-2 text-sm md:text-base text-black/65 leading-relaxed">{text}</p>
    </div>
  );
}

function MiniStat({ label, children }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-black/5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-black/45">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-black">{children}</div>
    </div>
  );
}

function CopyCA() {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const ok = await copyText(CONTRACT);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <div className="mt-5">
      <button
        onClick={onCopy}
        className="w-full rounded-3xl bg-white px-5 py-4 text-left shadow-soft ring-1 ring-black/10 hover:bg-black/5"
        aria-label="Copy contract address"
        title="Click to copy"
      >
        <div className="text-[11px] font-bold uppercase tracking-wider text-black/45">
          Contract Address (click to copy)
        </div>
        <div className="mt-1 text-base md:text-lg font-extrabold tracking-tight break-all">
          {CONTRACT}
        </div>
        <div className="mt-2 text-xs font-semibold text-black/55">{copied ? "Copied." : "Tap to copy."}</div>
      </button>
    </div>
  );
}

function MarqueeCA() {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const ok = await copyText(CONTRACT);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  const text = `CA: ${CONTRACT} • CLICK TO COPY • CA: ${CONTRACT} • CLICK TO COPY •`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <button onClick={onCopy} className="relative w-full bg-[#f6c945] text-black overflow-hidden ring-1 ring-black/10">
        <div className="flex whitespace-nowrap">
          <div className="marquee px-4 py-2 font-extrabold text-sm tracking-wide">{text} {text} {text}</div>
          <div className="marquee px-4 py-2 font-extrabold text-sm tracking-wide">{text} {text} {text}</div>
        </div>

        {copied ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold bg-black/10">
            COPIED
          </div>
        ) : null}

        <style jsx>{`
          .marquee {
            animation: marquee 18s linear infinite;
          }
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </button>
    </div>
  );
}

export default function Home({ photos }) {
  const links = useMemo(() => {
    const scan = `https://basescan.org/token/${CONTRACT}`;
    const dex = `https://dexscreener.com/${CHAIN}/${CONTRACT}`;
    const buy = dex;
    return { scan, dex, buy };
  }, []);

  const [pair, setPair] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT}`);
        const j = await r.json();
        const pairs = j?.pairs || [];
        const best =
          pairs.sort((a, b) => (b?.liquidity?.usd || 0) - (a?.liquidity?.usd || 0))[0] || null;
        if (mounted) setPair(best);
      } catch {
        if (mounted) setPair(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const t = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const price = pair?.priceUsd ? Number(pair.priceUsd) : null;
  const liq = pair?.liquidity?.usd ? Number(pair.liquidity.usd) : null;
  const vol24 = pair?.volume?.h24 ? Number(pair.volume.h24) : null;

  return (
    <>
      <Head>
        <title>$NANDOR — The Cat</title>
        <meta name="description" content="Cute Nandor site: photos, stories, and $NANDOR links." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="NANDOR — The Cat" />
        <meta property="og:description" content="Cute Nandor site: photos, stories, and $NANDOR links." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body { font-family: 'Quicksand', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
        `}</style>
      </Head>

      <main className="min-h-screen">
        <MarqueeCA />
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 md:pt-20 md:pb-14">
          {/* HERO */}
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Base</Pill>
                <Pill>Cat token</Pill>
                <Pill>Vampire vibes</Pill>
              </div>

              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">NANDOR</h1>
              <p className="mt-3 text-base md:text-lg text-black/65 max-w-xl leading-relaxed">
                I was vam - purr long long ago… I fink.maybe.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#story"
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white shadow-soft hover:opacity-90"
                >
                  Meet Nandor
                </a>
                <a
                  href="#gallery"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black shadow-soft ring-1 ring-black/10 hover:bg-black/5"
                >
                  View Gallery
                </a>
                <a
                  href={links.buy}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-[#f6c945] px-5 py-3 text-sm font-extrabold text-black shadow-soft hover:brightness-95"
                >
                  Buy $NANDOR
                </a>
              </div>

              <CopyCA />

              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniStat label="Price">
                  {price != null ? `$${price.toFixed(price < 0.01 ? 6 : 4)}` : loading ? "…" : "—"}
                </MiniStat>
                <MiniStat label="Liquidity">{liq != null ? fmtUsd(liq) : loading ? "…" : "—"}</MiniStat>
                <MiniStat label="Vol 24h">{vol24 != null ? fmtUsd(vol24) : loading ? "…" : "—"}</MiniStat>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-[#f6c945]/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-soft ring-1 ring-black/5">
                <img src="/photos/nandor-1.gif" alt="Nandor" className="h-[420px] w-full object-cover" />
              </div>
            </div>
          </div>

          {/* STORY */}
          <div id="story" className="mt-14 md:mt-20">
            < SectionTitle
            title = "The Nandor Lore"
            subtitle = "Fragments from a very small but very ancient life." /
              >
            <div className="grid gap-5 md:grid-cols-3">
               < StoryCard
               title = "Ancient Origins"
               text = "I was born 500 years ago in the body of a great conqueror and mighty vampire. At least that is how I remember it. My parents insist I was born in 2021, somewhere in a field. History is… confusing." /
                 >
             < StoryCard
             title = "Brave, But Slightly Stressy"
             text = "I watch birds from the window, but only if they are smaller than me. Once I was attacked by a gigantic crow. It was clearly the size of a gryphon. I may be a vampire, but I am also a sensitive boy." /
               >
              < StoryCard
              title = "Survivor of the Night"
              text = "Since kittenhood I battled illness. A year ago I nearly joined my vampire ancestors, but I survived surgery and returned stronger. I steal buns from the table, fail at using the litter box with dignity, and prefer to sleep under blankets. I love warmth. Eternal darkness… but cozy." /
                >
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Pill>Likes: buns, cozy warm place</Pill>
              <Pill>Hates: veterenars, gigantic crows</Pill>
              <Pill>Superpower: vimpire teeth</Pill>
            </div>
          </div>

          {/* GALLERY */}
          <div id="gallery" className="mt-14 md:mt-20">
            <SectionTitle
              title="Gallery"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(photos || []).map((src) => (
                <div key={src} className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5">
                  <img src={src} alt="Nandor photo" className="h-72 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* TOKEN (quiet) */}
          <div className="mt-14 md:mt-20">
            <div className="rounded-[2.5rem] bg-white p-8 shadow-soft ring-1 ring-black/5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xl font-extrabold">$NANDOR on Base</div>
                  <div className="mt-1 text-sm text-black/60">Links for grown-ups. The cat stays adorable.</div>
                  <div className="mt-3 text-xs text-black/55">
                    Contract: <span className="font-semibold">{CONTRACT}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a className="rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white hover:opacity-90" href={links.buy} target="_blank" rel="noreferrer">
                    Buy
                  </a>
                  <a className="rounded-2xl bg-black/5 px-5 py-3 text-sm font-bold text-black ring-1 ring-black/10 hover:bg-black/10" href={links.dex} target="_blank" rel="noreferrer">
                    Chart
                  </a>
                  <a className="rounded-2xl bg-black/5 px-5 py-3 text-sm font-bold text-black ring-1 ring-black/10 hover:bg-black/10" href={links.scan} target="_blank" rel="noreferrer">
                    BaseScan
                  </a>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-10 text-center text-xs text-black/45">
            NANDOR © {new Date().getFullYear()} • Built for memes, not advice.
          </footer>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const fs = require("fs");
  const path = require("path");

  const dir = path.join(process.cwd(), "public", "photos");
  let files = [];
  if (fs.existsSync(dir)) {
    files = fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, "en"));
  }

  return {
    props: {
      photos: files.map((f) => `/photos/${f}`),
    },
  };
}
