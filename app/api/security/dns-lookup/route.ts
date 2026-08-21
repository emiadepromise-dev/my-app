import { NextRequest, NextResponse } from "next/server";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);
const resolveSoa = promisify(dns.resolveSoa);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveSrv = promisify(dns.resolveSrv);
const resolvePtr = promisify(dns.resolvePtr);

type DNSType = "A" | "AAAA" | "MX" | "NS" | "TXT" | "CNAME" | "SOA" | "SRV" | "PTR";

interface DNSResult {
  type: DNSType;
  records: unknown[];
}

export async function POST(request: NextRequest) {
  try {
    const { domain, type } = await request.json();

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required." }, { status: 400 });
    }

    const trimmed = domain.trim().toLowerCase();
    const validTypes: DNSType[] = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "SRV", "PTR"];
    const queryType: DNSType = validTypes.includes(type) ? type : "A";

    let records: unknown[] = [];

    try {
      switch (queryType) {
        case "A":
          records = await resolve4(trimmed);
          break;
        case "AAAA":
          records = await resolve6(trimmed);
          break;
        case "MX":
          records = await resolveMx(trimmed);
          break;
        case "NS":
          records = await resolveNs(trimmed);
          break;
        case "TXT":
          records = (await resolveTxt(trimmed)).map((r) => r.join(""));
          break;
        case "CNAME":
          records = await resolveCname(trimmed);
          break;
        case "SOA":
          records = [await resolveSoa(trimmed)];
          break;
        case "SRV":
          records = await resolveSrv(trimmed);
          break;
        case "PTR":
          records = await resolvePtr(trimmed);
          break;
      }
    } catch {
      return NextResponse.json(
        { error: "DNS query failed for this record type.", type: queryType, records: [] },
        { status: 200 }
      );
    }

    const result: DNSResult = { type: queryType, records };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "DNS lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
