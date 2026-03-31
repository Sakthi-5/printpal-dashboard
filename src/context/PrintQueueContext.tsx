import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

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
  totalCost: number;
  status: "queued" | "completed";
  createdAt: Date;
  completedAt?: Date;
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
  addJob: (job: Omit<PrintJob, "id" | "status" | "createdAt" | "totalCost">) => PrintJob;
  completeJob: (jobId: string) => void;
  calculateCost: (pageCount: number, printSide: "single" | "double", colorMode: "bw" | "color", copies: number) => number;
  getQueuePosition: (jobId: string) => number;
  getEstimatedTime: (jobId: string) => number;
  queuedJobs: PrintJob[];
  completedJobs: PrintJob[];
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
        }));
      }
    } catch {}
    return [];
  });
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  const queuedJobs = jobs.filter((j) => j.status === "queued");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  const loginAdmin = useCallback((username: string, password: string) => {
    const admin = ADMINS.find((a) => a.username === username && a.password === password);
    if (admin) {
      setCurrentAdmin(admin);
      return true;
    }
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

  const calculateCost = useCallback((pageCount: number, printSide: "single" | "double", colorMode: "bw" | "color", copies: number) => {
    const pricePerPage = colorMode === "color" ? PRICE_PER_PAGE_COLOR : PRICE_PER_PAGE_BW;
    const sideMultiplier = printSide === "double" ? DOUBLE_SIDE_DISCOUNT : 1;
    return Math.ceil(pageCount * pricePerPage * sideMultiplier * copies);
  }, []);

  const addJob = useCallback((job: Omit<PrintJob, "id" | "status" | "createdAt" | "totalCost">) => {
    const totalCost = calculateCost(job.pageCount, job.printSide, job.colorMode, job.copies);
    const newJob: PrintJob = {
      ...job,
      id: `job_${Date.now()}`,
      status: "queued",
      createdAt: new Date(),
      totalCost,
    };
    setJobs((prev) => [...prev, newJob]);
    return newJob;
  }, [calculateCost]);

  const completeJob = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "completed" as const, completedAt: new Date() } : j))
    );
  }, []);

  const getQueuePosition = useCallback((jobId: string) => {
    const idx = queuedJobs.findIndex((j) => j.id === jobId);
    return idx === -1 ? -1 : idx + 1;
  }, [queuedJobs]);

  const getEstimatedTime = useCallback((jobId: string) => {
    const pos = getQueuePosition(jobId);
    return pos === -1 ? 0 : pos * EST_MINUTES_PER_JOB;
  }, [getQueuePosition]);

  return (
    <PrintQueueContext.Provider
      value={{
        jobs, admins: ADMINS, currentAdmin, currentUserId, currentUserName,
        loginAdmin, logoutAdmin, loginUser, logoutUser,
        addJob, completeJob, calculateCost, getQueuePosition, getEstimatedTime,
        queuedJobs, completedJobs,
      }}
    >
      {children}
    </PrintQueueContext.Provider>
  );
};
