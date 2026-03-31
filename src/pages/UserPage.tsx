import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrintQueue } from "@/context/PrintQueueContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Upload, FileText, Clock, CheckCircle, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";

const UserPage = () => {
  const navigate = useNavigate();
  const { currentUserId, currentUserName, logoutUser, addJob, queuedJobs, getQueuePosition, getEstimatedTime, jobs } = usePrintQueue();

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [printSide, setPrintSide] = useState<"single" | "double">("single");
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [copies, setCopies] = useState(1);
  const [step, setStep] = useState<"upload" | "options" | "payment" | "queue">("upload");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { calculateCost } = usePrintQueue();

  useEffect(() => {
    if (!currentUserId) navigate("/");
  }, [currentUserId, navigate]);

  if (!currentUserId) return null;

  const userJobs = jobs.filter((j) => j.userId === currentUserId && j.status === "queued");
  const totalCost = calculateCost(pageCount, printSide, colorMode, copies);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      setFile(f);
      // Estimate pages (rough: 1 page per 50KB)
      setPageCount(Math.max(1, Math.round(f.size / 50000)));
      setStep("options");
      toast.success(`${f.name} uploaded successfully!`);
    }
  };

  const handleSubmit = () => {
    const job = addJob({
      userId: currentUserId,
      userName: currentUserName || "User",
      fileName: file!.name,
      fileSize: file!.size,
      pageCount,
      printSide,
      colorMode,
      copies,
    });
    setCurrentJobId(job.id);
    setStep("queue");
    toast.success("Print job submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" width={40} height={40} />
          <div>
            <h1 className="text-xl font-bold font-heading text-primary-foreground">My Print Jobs</h1>
            <p className="text-sm text-primary-foreground/80">Hello, {currentUserName}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { logoutUser(); navigate("/"); }} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </header>

      <div className="container mx-auto p-6 max-w-2xl space-y-6">
        {/* Step: Upload */}
        {step === "upload" && (
          <Card className="shadow-vibrant border-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-foreground"><Upload className="h-5 w-5 text-primary" /> Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl p-12 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
                <FileText className="h-12 w-12 text-primary mb-3" />
                <p className="font-semibold text-foreground">Click to upload PDF</p>
                <p className="text-sm text-muted-foreground mt-1">Only PDF files are accepted</p>
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </CardContent>
          </Card>
        )}

        {/* Step: Options */}
        {step === "options" && file && (
          <Card className="shadow-vibrant border-0 animate-slide-up">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Print Options</CardTitle>
              <p className="text-sm text-muted-foreground">{file.name} • ~{pageCount} pages</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-semibold mb-3 block text-foreground">Print Side</Label>
                <RadioGroup value={printSide} onValueChange={(v) => setPrintSide(v as "single" | "double")} className="flex gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${printSide === "single" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value="single" />
                    <div><p className="font-medium text-foreground">Single-sided</p><p className="text-xs text-muted-foreground">Print on one side</p></div>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${printSide === "double" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value="double" />
                    <div><p className="font-medium text-foreground">Double-sided</p><p className="text-xs text-muted-foreground">30% savings</p></div>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-3 block text-foreground">Color Mode</Label>
                <RadioGroup value={colorMode} onValueChange={(v) => setColorMode(v as "bw" | "color")} className="flex gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${colorMode === "bw" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value="bw" />
                    <div><p className="font-medium text-foreground">Black & White</p><p className="text-xs text-muted-foreground">₹2/page</p></div>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${colorMode === "color" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value="color" />
                    <div><p className="font-medium text-foreground">Color</p><p className="text-xs text-muted-foreground">₹8/page</p></div>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="copies" className="text-sm font-semibold text-foreground">Number of Copies</Label>
                <Input id="copies" type="number" min={1} max={100} value={copies} onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 w-32" />
              </div>

              <div className="p-4 rounded-xl gradient-card shadow-card">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimated Total</span>
                  <span className="text-2xl font-bold font-heading text-primary">₹{totalCost}</span>
                </div>
              </div>

              <Button onClick={() => setStep("payment")} className="w-full gradient-primary text-primary-foreground font-semibold text-lg py-6 hover:opacity-90 transition-opacity">
                <CreditCard className="h-5 w-5 mr-2" /> Proceed to Pay ₹{totalCost}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Payment */}
        {step === "payment" && (
          <Card className="shadow-vibrant border-0 animate-slide-up">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl gradient-card shadow-card text-center">
                <p className="text-muted-foreground mb-2">Amount to Pay</p>
                <p className="text-4xl font-bold font-heading text-gradient">₹{totalCost}</p>
              </div>
              <div className="space-y-3">
                <Button onClick={handlePayment} className="w-full gradient-primary text-primary-foreground font-semibold text-lg py-6 hover:opacity-90 transition-opacity animate-pulse-glow">
                  <CreditCard className="h-5 w-5 mr-2" /> Pay Now
                </Button>
                <Button variant="outline" onClick={() => setStep("options")} className="w-full">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Queue Status */}
        {step === "queue" && currentJobId && (
          <Card className="shadow-vibrant border-0 animate-slide-up">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-foreground"><CheckCircle className="h-5 w-5 text-success" /> Job Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl gradient-card shadow-card text-center">
                  <p className="text-sm text-muted-foreground">Queue Position</p>
                  <p className="text-3xl font-bold font-heading text-primary">{getQueuePosition(currentJobId)}</p>
                </div>
                <div className="p-4 rounded-xl gradient-card shadow-card text-center">
                  <p className="text-sm text-muted-foreground">Users in Queue</p>
                  <p className="text-3xl font-bold font-heading text-secondary">{queuedJobs.length}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-3">
                <Clock className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Estimated collection time</p>
                  <p className="text-sm text-muted-foreground">~{getEstimatedTime(currentJobId)} minutes</p>
                </div>
              </div>
              <p className="text-center text-muted-foreground text-sm">You'll be notified when your printout is ready for collection.</p>
              <Button onClick={() => { setStep("upload"); setFile(null); setCurrentJobId(null); }} className="w-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Submit Another Job
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Existing user jobs */}
        {userJobs.length > 0 && step === "upload" && (
          <Card className="shadow-card border-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="font-heading text-sm text-foreground">Your Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {userJobs.map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2">
                  <span className="text-sm font-medium text-foreground">{job.fileName}</span>
                  <span className="text-xs text-muted-foreground">Position #{getQueuePosition(job.id)} • ~{getEstimatedTime(job.id)} min</span>
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
