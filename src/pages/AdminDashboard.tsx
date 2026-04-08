import { useNavigate } from "react-router-dom";
import { usePrintQueue, BINDING_PRICES } from "@/context/PrintQueueContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, CheckCircle2, Printer, LogOut, IndianRupee } from "lucide-react";
import logo from "@/assets/logo.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentAdmin, logoutAdmin, queuedJobs, completedJobs, jobs, completeJob } = usePrintQueue();

  useEffect(() => {
    if (!currentAdmin) navigate("/");
  }, [currentAdmin, navigate]);

  if (!currentAdmin) return null;

  const handleComplete = (jobId: string) => {
    completeJob(jobId);
    toast.success("Job marked as completed!");
  };

  const totalRevenue = jobs.filter(j => j.status === "paid" || j.status === "completed").reduce((s, j) => s + j.totalCost, 0);

  const statusBadge = (status: string) => {
    switch (status) {
      case "queued": return <Badge variant="default">Queued</Badge>;
      case "paid": return <Badge className="bg-accent text-accent-foreground">Paid</Badge>;
      case "completed": return <Badge className="bg-success text-success-foreground">Done</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" width={40} height={40} />
          <div>
            <h1 className="text-xl font-bold font-heading text-primary-foreground">Admin Dashboard</h1>
            <p className="text-sm text-primary-foreground/80">Welcome, {currentAdmin.name}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { logoutAdmin(); navigate("/"); }} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <Card className="shadow-card border-0 gradient-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Queue</p>
                <p className="text-3xl font-bold font-heading text-foreground">{queuedJobs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 gradient-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-success flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-success-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold font-heading text-foreground">{completedJobs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 gradient-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center">
                <Printer className="h-7 w-7 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold font-heading text-foreground">{jobs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0 gradient-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center">
                <IndianRupee className="h-7 w-7 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold font-heading text-foreground">₹{totalRevenue}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="font-heading text-foreground">Print Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No print jobs yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Copies</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Binding</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job, i) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{job.userName}</TableCell>
                        <TableCell className="max-w-[120px] truncate">{job.fileName}</TableCell>
                        <TableCell>{job.pageCount}</TableCell>
                        <TableCell>{job.copies}</TableCell>
                        <TableCell>{job.printSide === "double" ? "Double" : "Single"}</TableCell>
                        <TableCell>{job.colorMode === "color" ? "Color" : "B&W"}</TableCell>
                        <TableCell>{BINDING_PRICES[job.binding || "none"]?.label || "None"}</TableCell>
                        <TableCell className="font-semibold">₹{job.totalCost}</TableCell>
                        <TableCell>{statusBadge(job.status)}</TableCell>
                        <TableCell>
                          {(job.status === "queued" || job.status === "paid") && (
                            <Button size="sm" variant="outline" onClick={() => handleComplete(job.id)} className="text-success border-success hover:bg-success/10">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
