import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link href="/" className="mark-link" aria-label="Notae Labs">
          <img src="/marks/notae-logomark.svg" alt="" width={28} height={28} />
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
