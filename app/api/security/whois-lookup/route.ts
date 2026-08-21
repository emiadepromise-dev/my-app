import { NextRequest, NextResponse } from "next/server";
import net from "net";

function queryWhoisServer(domain: string, server: string, timeout = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(43, server);
    let data = "";
    let resolved = false;

    const done = (err?: Error) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      if (err) reject(err);
      else resolve(data);
    };

    socket.setTimeout(timeout);
    socket.on("timeout", () => done(new Error("WHOIS query timed out")));
    socket.on("error", (err) => done(err));
    socket.on("connect", () => {
      socket.write(domain + "\r\n");
    });
    socket.on("data", (chunk) => {
      data += chunk.toString();
    });
    socket.on("end", () => done());
  });
}

function parseWhois(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = raw.split("\n");

  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (!key || !value || key.startsWith("%") || key.startsWith("#") || key.startsWith("whois")) continue;

    if (result[key]) {
      result[key] += "; " + value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required." }, { status: 400 });
    }

    const trimmed = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(trimmed)) {
      return NextResponse.json({ error: "Invalid domain format." }, { status: 400 });
    }

    const tld = trimmed.split(".").pop() || "com";
    const serverMap: Record<string, string> = {
      com: "whois.verisign-grs.com",
      net: "whois.verisign-grs.com",
      org: "whois.pir.org",
      io: "whois.nic.io",
      dev: "whois.nic.google",
      app: "whois.nic.google",
      co: "whois.nic.co",
      info: "whois.afilias.net",
      biz: "whois.biz",
      us: "whois.nic.us",
      uk: "whois.nic.uk",
      de: "whois.denic.de",
      fr: "whois.nic.fr",
      nl: "whois.sidn.nl",
      ru: "whois.tcinet.ru",
      cn: "whois.cnnic.cn",
      jp: "whois.jprs.jp",
      au: "whois.auda.org.au",
      ca: "whois.cira.ca",
      in: "whois.inregistry.net",
    };

    const server = serverMap[tld] || `whois.nic.${tld}`;

    const raw = await queryWhoisServer(trimmed, server);
    const parsed = parseWhois(raw);

    return NextResponse.json({
      domain: trimmed,
      server,
      registrar: parsed["registrar"] || parsed["sponsoring registrar"] || null,
      creationDate: parsed["creation date"] || parsed["created"] || null,
      expirationDate: parsed["expir"] || parsed["registry expiry date"] || null,
      updatedDate: parsed["updated date"] || parsed["last modified"] || null,
      nameServers: parsed["name server"] || parsed["nserver"] || null,
      status: parsed["domain status"] || parsed["status"] || null,
      registrant: parsed["registrant organization"] || parsed["registrant name"] || null,
      registrantCountry: parsed["registrant country"] || null,
      dnssec: parsed["dnssec"] || null,
      raw,
    });
  } catch {
    return NextResponse.json(
      { error: "WHOIS lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
