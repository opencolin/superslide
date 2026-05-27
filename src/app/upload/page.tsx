import { Nav } from "@/components/landing/Nav";
import { UploadFlow } from "@/components/upload/UploadFlow";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Upload your deck — Superslide",
};

export default function UploadPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <UploadFlow />
      </main>
      <Footer />
    </>
  );
}
