import { SlideRunner } from "@/components/slides/SlideRunner";
import { nebiusBuildersDeck } from "@/lib/deck/sample-nebius";

export const metadata = {
  title: "Nebius Builders — Superslide demo",
  description:
    "What a flat PPTX looks like after Superslide rebuilds it as an interactive web slideshow.",
};

export default function DemoPage() {
  return <SlideRunner deck={nebiusBuildersDeck} />;
}
