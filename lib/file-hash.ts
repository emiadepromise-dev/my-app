import crypto from "crypto";

export interface FileHashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export function computeFileHashes(buffer: Buffer): FileHashResult {
  return {
    md5: crypto.createHash("md5").update(buffer).digest("hex"),
    sha1: crypto.createHash("sha1").update(buffer).digest("hex"),
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
    sha512: crypto.createHash("sha512").update(buffer).digest("hex"),
  };
}

export function compareHashes(
  computed: FileHashResult,
  known: string
): { match: boolean; algorithm: string } | null {
  const normalized = known.trim().toLowerCase();
  const length = normalized.replace(/[^a-f0-9]/g, "").length;

  let algorithm: keyof FileHashResult | null = null;
  if (length === 32) algorithm = "md5";
  else if (length === 40) algorithm = "sha1";
  else if (length === 64) algorithm = "sha256";
  else if (length === 128) algorithm = "sha512";

  if (!algorithm) return null;

  const cleanKnown = normalized.replace(/[^a-f0-9]/g, "");
  return {
    match: computed[algorithm] === cleanKnown,
    algorithm,
  };
}
