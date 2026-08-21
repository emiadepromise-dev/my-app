export type ActivityType = "website-scan" | "port-scan" | "file-hash";

export interface BaseActivity {
  id: string;
  type: ActivityType;
  target: string;
  timestamp: number;
}

export interface WebsiteScanActivity extends BaseActivity {
  type: "website-scan";
  score: number | null;
}

export interface PortScanActivity extends BaseActivity {
  type: "port-scan";
  openPorts: number;
  totalPorts: number;
}

export interface FileHashActivity extends BaseActivity {
  type: "file-hash";
  verified: boolean | null;
}

export type Activity = WebsiteScanActivity | PortScanActivity | FileHashActivity;
