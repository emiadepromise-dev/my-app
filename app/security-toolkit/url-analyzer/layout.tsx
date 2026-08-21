import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Analyzer | CyberYoshi",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
