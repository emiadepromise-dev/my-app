import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Port Scanner | CyberYoshi",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
