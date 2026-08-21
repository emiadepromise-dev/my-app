import { z } from "zod";

export const urlSchema = z
  .string()
  .min(1, "URL is required")
  .url("Please enter a valid URL");

export const ipSchema = z
  .string()
  .min(1, "IP address is required")
  .regex(
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    "Please enter a valid IP address"
  );

export const domainSchema = z
  .string()
  .min(1, "Domain is required")
  .regex(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    "Please enter a valid domain"
  );

export const portSchema = z
  .string()
  .min(1, "Port is required")
  .regex(/^\d+$/, "Port must be a number")
  .refine(
    (val) => {
      const n = parseInt(val, 10);
      return n >= 1 && n <= 65535;
    },
    "Port must be between 1 and 65535"
  );

export const passwordOptionsSchema = z.object({
  length: z.number().min(8).max(128),
  uppercase: z.boolean(),
  lowercase: z.boolean(),
  numbers: z.boolean(),
  symbols: z.boolean(),
});
