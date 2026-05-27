import { SlideRunner } from "@/components/slides/SlideRunner";
import { cinderBuildersDeck } from "@/lib/deck/sample-cinder";

export const metadata = {
  title: "Cinder Builders — Superslide demo",
  description:
    "What a flat PPTX looks like after Superslide rebuilds it as an interactive web slideshow.",
};

export default function DemoPage() {
  return <SlideRunner deck={cinderBuildersDeck} />;
}
