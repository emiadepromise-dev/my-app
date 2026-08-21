import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNS Lookup | CyberYoshi",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
