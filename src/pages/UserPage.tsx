import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrintQueue, BindingType } from "@/context/PrintQueueContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import FileUploadStep from "@/components/print/FileUploadStep";
import PrintOptionsStep from "@/components/print/PrintOptionsStep";
import PaymentStep from "@/components/print/PaymentStep";
import ReceiptStep from "@/components/print/ReceiptStep";

type Step = "upload" | "options" | "payment" | "receipt";

const UserPage = () => {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, logoutUser, addJob, markPaid, queuedJobs, getQueuePosition, getEstimatedTime, jobs, calculateCost, getJobById } = usePrintQueue();

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [printSide, setPrintSide] = useState<"single" | "double">("single");
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [copies, setCopies] = useState(1);
  const [binding, setBinding] = useState<BindingType>("none");
  const [step, setStep] = useState<Step>("upload");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) navigate("/");
  }, [currentUserId, navigate]);

  if (!currentUserId) return null;

  const costs = calculateCost(pageCount, printSide, colorMode, copies, binding);
  const userJobs = jobs.filter((j) => j.userId === currentUserId && (j.status === "queued" || j.status === "paid"));
  const currentJob = currentJobId ? getJobById(currentJobId) : undefined;

  const handleFileSelected = (f: File, estimatedPages: number) => {
    setFile(f);
    setPageCount(estimatedPages);
    setStep("options");
  };

  const handleSubmitOptions = () => {
    const job = addJob({
      userId: currentUserId,
      userName: currentUserName || "User",
      fileName: file!.name,
      fileSize: file!.size,
      pageCount,
      printSide,
      colorMode,
      copies,
      binding,
    });
    setCurrentJobId(job.id);
    setStep("payment");
  };

  const handlePaymentSuccess = (paymentId: string, method: string) => {
    if (currentJobId) {
      markPaid(currentJobId, paymentId, method);
      setStep("receipt");
    }
  };

  const handleNewJob = () => {
    setStep("upload");
    setFile(null);
    setCurrentJobId(null);
    setPageCount(1);
    setPrintSide("single");
    setColorMode("bw");
    setCopies(1);
    setBinding("none");
  };

  const steps = [
    { key: "upload", label: "Upload" },
    { key: "options", label: "Options" },
    { key: "payment", label: "Payment" },
    { key: "receipt", label: "Receipt" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" width={40} height={40} />
          <div>
            <h1 className="text-xl font-bold font-heading text-primary-foreground">PrintQueue Pro</h1>
            <p className="text-sm text-primary-foreground/80">Hello, {currentUserName}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { logoutUser(); navigate("/"); }} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 pt-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${i <= currentStepIndex ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:inline ${i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto p-6 pt-0 max-w-2xl space-y-6">
        {step === "upload" && <FileUploadStep onFileSelected={handleFileSelected} />}

        {step === "options" && file && (
          <PrintOptionsStep
            fileName={file.name} pageCount={pageCount} setPageCount={setPageCount}
            printSide={printSide} setPrintSide={setPrintSide}
            colorMode={colorMode} setColorMode={setColorMode}
            copies={copies} setCopies={setCopies}
            binding={binding} setBinding={setBinding}
            costs={costs} onSubmit={handleSubmitOptions}
          />
        )}

        {step === "payment" && currentJobId && (
          <PaymentStep
            totalCost={costs.totalCost}
            userName={currentUserName || "User"}
            jobId={currentJobId}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setStep("options")}
          />
        )}

        {step === "receipt" && currentJob && (
          <ReceiptStep
            job={currentJob}
            queuePosition={getQueuePosition(currentJobId!)}
            estimatedTime={getEstimatedTime(currentJobId!)}
            onNewJob={handleNewJob}
          />
        )}

        {/* Active Jobs */}
        {userJobs.length > 0 && step === "upload" && (
          <Card className="shadow-card border-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="font-heading text-sm text-foreground">Your Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {userJobs.map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">{job.fileName}</span>
                    <span className="ml-2 text-xs text-primary font-semibold">₹{job.totalCost}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {job.status === "paid" ? "✅ Paid" : "⏳ Pending"} • Position #{getQueuePosition(job.id)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserPage;
