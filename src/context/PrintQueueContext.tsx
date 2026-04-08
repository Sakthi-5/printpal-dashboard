import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type BindingType = "none" | "spiral" | "hardbound" | "stapler" | "loose";

export interface PrintJob {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  printSide: "single" | "double";
  colorMode: "bw" | "color";
  copies: number;
  binding: BindingType;
  totalCost: number;
  printCost: number;
  bindingCost: number;
  status: "queued" | "paid" | "completed";
  paymentId?: string;
  paymentMethod?: string;
  createdAt: Date;
  completedAt?: Date;
  paidAt?: Date;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
}

const ADMINS: Admin[] = [
  { id: "admin1", username: "admin1", password: "admin@123", name: "Admin One" },
  { id: "admin2", username: "admin2", password: "admin@456", name: "Admin Two" },
  { id: "admin3", username: "admin3", password: "admin@789", name: "Admin Three" },
];

// Pricing
const PRICE_PER_PAGE_BW = 2;
const PRICE_PER_PAGE_COLOR = 8;
const DOUBLE_SIDE_DISCOUNT = 0.7;
const EST_MINUTES_PER_JOB = 3;

export const BINDING_PRICES: Record<BindingType, { label: string; price: number; description: string }> = {
  none: { label: "No Binding", price: 0, description: "Loose sheets only" },
  loose: { label: "Loose Papers", price: 0, description: "Unbound loose pages" },
  stapler: { label: "Stapler Pin", price: 5, description: "Simple staple binding" },
  spiral: { label: "Spiral Binding", price: 30, description: "Professional spiral bound" },
  hardbound: { label: "Project Binding", price: 60, description: "Hard cover project binding" },
};

interface PrintQueueContextType {
  jobs: PrintJob[];
  admins: Admin[];
  currentAdmin: Admin | null;
  currentUserId: string | null;
  currentUserName: string | null;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  loginUser: (name: string) => string;
  logoutUser: () => void;
  addJob: (job: Omit<PrintJob, "id" | "status" | "createdAt" | "totalCost" | "printCost" | "bindingCost">) => PrintJob;
  completeJob: (jobId: string) => void;
  markPaid: (jobId: string, paymentId: string, paymentMethod: string) => void;
  calculateCost: (pageCount: number, printSide: "single" | "double", colorMode: "bw" | "color", copies: number, binding: BindingType) => { printCost: number; bindingCost: number; totalCost: number };
  getQueuePosition: (jobId: string) => number;
  getEstimatedTime: (jobId: string) => number;
  queuedJobs: PrintJob[];
  completedJobs: PrintJob[];
  getJobById: (jobId: string) => PrintJob | undefined;
}

const PrintQueueContext = createContext<PrintQueueContextType | null>(null);

export const usePrintQueue = () => {
  const ctx = useContext(PrintQueueContext);
  if (!ctx) throw new Error("usePrintQueue must be used within PrintQueueProvider");
  return ctx;
};

export const PrintQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<PrintJob[]>(() => {
    try {
      const stored = localStorage.getItem("printqueue_jobs");
      if (stored) {
        return JSON.parse(stored).map((j: PrintJob) => ({
          ...j,
          createdAt: new Date(j.createdAt),
          completedAt: j.completedAt ? new Date(j.completedAt) : undefined,
          paidAt: j.paidAt ? new Date(j.paidAt) : undefined,
        }));
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("printqueue_jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "printqueue_jobs" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue).map((j: PrintJob) => ({
            ...j,
            createdAt: new Date(j.createdAt),
            completedAt: j.completedAt ? new Date(j.completedAt) : undefined,
            paidAt: j.paidAt ? new Date(j.paidAt) : undefined,
          }));
          setJobs(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  const queuedJobs = jobs.filter((j) => j.status === "queued" || j.status === "paid");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  const loginAdmin = useCallback((username: string, password: string) => {
    const admin = ADMINS.find((a) => a.username === username && a.password === password);
    if (admin) { setCurrentAdmin(admin); return true; }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => setCurrentAdmin(null), []);

  const loginUser = useCallback((name: string) => {
    const id = `user_${Date.now()}`;
    setCurrentUserId(id);
    setCurrentUserName(name);
    return id;
  }, []);

  const logoutUser = useCallback(() => {
    setCurrentUserId(null);
    setCurrentUserName(null);
  }, []);

  const calculateCost = useCallback((pageCount: number, printSide: "single" | "double", colorMode: "bw" | "color", copies: number, binding: BindingType) => {
    const pricePerPage = colorMode === "color" ? PRICE_PER_PAGE_COLOR : PRICE_PER_PAGE_BW;
    const sideMultiplier = printSide === "double" ? DOUBLE_SIDE_DISCOUNT : 1;
    const printCost = Math.ceil(pageCount * pricePerPage * sideMultiplier * copies);
    const bindingCost = BINDING_PRICES[binding].price * copies;
    return { printCost, bindingCost, totalCost: printCost + bindingCost };
  }, []);

  const addJob = useCallback((job: Omit<PrintJob, "id" | "status" | "createdAt" | "totalCost" | "printCost" | "bindingCost">) => {
    const costs = calculateCost(job.pageCount, job.printSide, job.colorMode, job.copies, job.binding);
    const newJob: PrintJob = {
      ...job,
      id: `job_${Date.now()}`,
      status: "queued",
      createdAt: new Date(),
      ...costs,
    };
    setJobs((prev) => [...prev, newJob]);
    return newJob;
  }, [calculateCost]);

  const completeJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "completed" as const, completedAt: new Date() } : j)));
  }, []);

  const markPaid = useCallback((jobId: string, paymentId: string, paymentMethod: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "paid" as const, paymentId, paymentMethod, paidAt: new Date() } : j)));
  }, []);

  const getQueuePosition = useCallback((jobId: string) => {
    const idx = queuedJobs.findIndex((j) => j.id === jobId);
    return idx === -1 ? -1 : idx + 1;
  }, [queuedJobs]);

  const getEstimatedTime = useCallback((jobId: string) => {
    const pos = getQueuePosition(jobId);
    return pos === -1 ? 0 : pos * EST_MINUTES_PER_JOB;
  }, [getQueuePosition]);

  const getJobById = useCallback((jobId: string) => {
    return jobs.find((j) => j.id === jobId);
  }, [jobs]);

  return (
    <PrintQueueContext.Provider
      value={{
        jobs, admins: ADMINS, currentAdmin, currentUserId, currentUserName,
        loginAdmin, logoutAdmin, loginUser, logoutUser,
        addJob, completeJob, markPaid, calculateCost, getQueuePosition, getEstimatedTime,
        queuedJobs, completedJobs, getJobById,
      }}
    >
      {children}
    </PrintQueueContext.Provider>
  );
};
