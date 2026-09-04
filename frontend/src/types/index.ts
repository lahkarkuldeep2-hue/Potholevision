export type Severity = "Low" | "Medium" | "High" | "Critical";

export type PotholeStatus =
  | "Detected"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Repaired"
  | "Closed";

export interface Pothole {
  id: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  status: PotholeStatus;
  confidence: number;
  road: string;
  detectedAt: string;
}

export interface WorkOrder {
  id: string;
  potholeId: string;
  road: string;
  severity: Severity;
  status: "Pending" | "Assigned" | "In Progress" | "Completed";
  contractor?: string;
  createdAt: string;
}