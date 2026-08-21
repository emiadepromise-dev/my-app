export const COMMON_SERVICES: Record<
  number,
  { service: string; risk: "low" | "medium" | "high"; reason: string }
> = {
  21: { service: "FTP", risk: "high", reason: "FTP transmits credentials in plaintext." },
  22: { service: "SSH", risk: "low", reason: "SSH is encrypted and generally secure." },
  23: { service: "Telnet", risk: "high", reason: "Telnet transmits data in plaintext." },
  25: { service: "SMTP", risk: "medium", reason: "SMTP can be used for email relay abuse." },
  53: { service: "DNS", risk: "medium", reason: "Exposed DNS can be used for amplification attacks." },
  80: { service: "HTTP", risk: "medium", reason: "HTTP traffic is unencrypted." },
  110: { service: "POP3", risk: "medium", reason: "POP3 transmits credentials in plaintext unless using TLS." },
  143: { service: "IMAP", risk: "medium", reason: "IMAP transmits credentials in plaintext unless using TLS." },
  443: { service: "HTTPS", risk: "low", reason: "HTTPS is encrypted." },
  445: { service: "SMB", risk: "high", reason: "SMB is a common attack vector (e.g., EternalBlue)." },
  993: { service: "IMAPS", risk: "low", reason: "IMAP over SSL/TLS is encrypted." },
  995: { service: "POP3S", risk: "low", reason: "POP3 over SSL/TLS is encrypted." },
  1433: { service: "MSSQL", risk: "high", reason: "Exposed database server is a critical risk." },
  1521: { service: "Oracle", risk: "high", reason: "Exposed database server is a critical risk." },
  3306: { service: "MySQL", risk: "high", reason: "Exposed database server is a critical risk." },
  3389: { service: "RDP", risk: "high", reason: "RDP is a frequent target for brute-force attacks." },
  5432: { service: "PostgreSQL", risk: "high", reason: "Exposed database server is a critical risk." },
  5900: { service: "VNC", risk: "high", reason: "VNC is a frequent target for unauthorized access." },
  6379: { service: "Redis", risk: "high", reason: "Exposed Redis instances are commonly exploited." },
  8080: { service: "HTTP-Alt", risk: "medium", reason: "Common alternative HTTP port, often used for admin interfaces." },
  8443: { service: "HTTPS-Alt", risk: "low", reason: "Common alternative HTTPS port." },
  27017: { service: "MongoDB", risk: "high", reason: "Exposed MongoDB instances are commonly exploited." },
};

export const PORT_PRESETS: { label: string; ports: number[] }[] = [
  {
    label: "Common (20)",
    ports: [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 8080],
  },
  {
    label: "Top 100",
    ports: Array.from({ length: 100 }, (_, i) => i + 1),
  },
  {
    label: "Web",
    ports: [80, 443, 8080, 8443, 8000, 8888, 9000],
  },
  {
    label: "Database",
    ports: [1433, 1521, 3306, 5432, 27017, 6379, 9042, 5984],
  },
];
