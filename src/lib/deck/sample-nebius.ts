import type { Deck } from "./schema";
import { nebiusTheme } from "@/lib/themes/nebius";

/**
 * Showpiece demo deck — themed after the Nebius design language verified
 * against nebius.com + github.com/opencolin/nebius-devsite.
 *
 * Narrative: the original "Nebius Builders Network" pitch was a flat PPTX.
 * Superslide ingested it and rebuilt it as this interactive web slideshow.
 */
export const nebiusBuildersDeck: Deck = {
  id: "nebius-builders",
  title: "Nebius Builders Network",
  subtitle: "AI infrastructure, for the people building on top of it.",
  author: "Nebius Developer Relations",
  theme: nebiusTheme,
  slides: [
    {
      id: "s1",
      index: 0,
      kind: "title",
      eyebrow: "Builders Network",
      title: "Built for the next generation of AI builders.",
      subtitle:
        "Compute, credits, mentorship, and a real community of teams shipping on Nebius — from solo hackers to seed-stage startups.",
      by: "Originally a PPTX · upgraded by Superslide on 26 May 2026",
    },
    {
      id: "s2",
      index: 1,
      kind: "stats",
      eyebrow: "By the numbers",
      title: "Builders are already shipping on Nebius.",
      stats: [
        { value: "$1M+", label: "in credits granted", hint: "to early-stage AI teams" },
        { value: "12k", label: "builders onboarded", hint: "across 64 countries" },
        { value: "H200s", label: "available on-demand", hint: "no quota dance" },
        { value: "<3s", label: "to provision a cluster", hint: "via the API" },
      ],
    },
    {
      id: "s3",
      index: 2,
      kind: "bullets",
      eyebrow: "What you get",
      title: "Everything an AI builder needs in one place.",
      bullets: [
        {
          text: "GPU compute when you need it, billed by the second.",
          hint: "H100s, H200s, and Grace Hopper — no minimums, no quota lottery.",
        },
        {
          text: "Credits that scale with your trajectory.",
          hint: "$5k starter → $250k for funded teams. Same form, same week.",
        },
        {
          text: "Mentorship from people who have shipped models.",
          hint: "Office hours with research scientists every Tuesday.",
        },
        {
          text: "A network of builders that ships.",
          hint: "Discord, demo days, and joint launches with our largest customers.",
        },
      ],
    },
    {
      id: "s4",
      index: 3,
      kind: "comparison",
      title: "Builders Network vs. doing this alone.",
      left: {
        label: "On your own",
        tone: "muted",
        points: [
          "Two-week procurement cycle for new GPUs",
          "Pay-as-you-go pricing on retail clouds",
          "Cobble together infra from blog posts",
          "Ship into a vacuum — no early users",
        ],
      },
      right: {
        label: "Builders Network",
        tone: "accent",
        points: [
          "Same-day cluster provisioning, billed by the second",
          "Credit tier that grows with your milestones",
          "Reference architectures + 1:1 office hours",
          "Demo days in front of customers and investors",
        ],
      },
    },
    {
      id: "s5",
      index: 4,
      kind: "hero3d",
      title: "An infrastructure layer that gets out of the way.",
      subtitle:
        "Spin up a cluster from the dashboard, the CLI, or a single REST call — and start training in under a minute.",
      scene: "torus",
      cta: "See the API",
    },
    {
      id: "s6",
      index: 5,
      kind: "code",
      title: "From zero to running cluster in 6 lines.",
      language: "ts",
      code: `import { Nebius } from "@nebius/sdk";

const nb = new Nebius({ apiKey: process.env.NEBIUS_API_KEY });

const cluster = await nb.clusters.create({
  shape: "h200.8x",            // 8x H200, 1.1TB HBM
  region: "eu-north1",
  image: "nebius/llm-train:cu125",
  spot: true,                    // 47% off, preemptible
});

await cluster.run("torchrun train.py");`,
      caption: "Same API powers the dashboard, CLI, Terraform provider, and the MCP server.",
    },
    {
      id: "s7",
      index: 6,
      kind: "chart",
      title: "Cost per H200 hour, May 2026.",
      caption:
        "Spot pricing measured against on-demand list, normalized to 8xH200 nodes. Lower is better.",
      chartKind: "bar",
      series: [
        { label: "Hyperscaler A (on-demand)", value: 96.4 },
        { label: "Hyperscaler B (reserved)", value: 71.2 },
        { label: "Hyperscaler C (spot)", value: 52.0 },
        { label: "Nebius (on-demand)", value: 38.0 },
        { label: "Nebius (spot)", value: 20.1, hint: "Builders Network rate" },
      ],
    },
    {
      id: "s8",
      index: 7,
      kind: "timeline",
      title: "Your first month on the Network.",
      steps: [
        { when: "Day 0", label: "Apply", body: "One short form, decision in 48h." },
        { when: "Day 2", label: "Credits land", body: "$5k–$250k, sized to your traction." },
        { when: "Week 1", label: "Office hours", body: "1:1 with a research scientist." },
        { when: "Week 4", label: "Demo day", body: "Show what you shipped to our network." },
      ],
    },
    {
      id: "s9",
      index: 8,
      kind: "quote",
      quote:
        "We went from a Colab notebook to a 16xH200 training run in nine days. Nobody on our team had managed cluster orchestration before.",
      attribution: "Anya Vassilieva",
      role: "Co-founder & CTO, Vector Origin",
    },
    {
      id: "s10",
      index: 9,
      kind: "closing",
      title: "Ready when you are.",
      subtitle:
        "Apply to the Builders Network and get compute, credits, and a community in the same week.",
      cta: "Apply now",
      ctaHref: "https://nebius.com/builders",
    },
  ],
};
