import { NextRequest, NextResponse } from "next/server";

interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json();

    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "IP address is required." }, { status: 400 });
    }

    const trimmed = ip.trim();

    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const ipv6ShortRegex = /^([0-9a-fA-F]{1,4}:){1,7}$/;

    if (!ipv4Regex.test(trimmed) && !ipv6Regex.test(trimmed) && !ipv6ShortRegex.test(trimmed)) {
      return NextResponse.json(
        { error: "Invalid IP address format." },
        { status: 400 }
      );
    }

    const res = await fetch(`http://ip-api.com/json/${trimmed}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch IP information." },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.status === "fail") {
      return NextResponse.json(
        { error: data.message || "Lookup failed" },
        { status: 404 }
      );
    }

    const info: IPInfo = {
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
      query: data.query,
    };

    return NextResponse.json(info);
  } catch {
    return NextResponse.json(
      { error: "IP lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
