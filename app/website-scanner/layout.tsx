import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Scanner | CyberYoshi",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
