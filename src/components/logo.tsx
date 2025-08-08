import { Archive } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Archive className="h-6 w-6 text-primary" />
      <span className="hidden text-xl font-semibold tracking-tight sm:inline">
        Stashpad
      </span>
    </Link>
  );
}
