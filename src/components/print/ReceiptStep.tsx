import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrintJob, BINDING_PRICES } from "@/context/PrintQueueContext";
import { CheckCircle, Printer, Download, Clock } from "lucide-react";
import logo from "@/assets/logo.png";

interface ReceiptStepProps {
  job: PrintJob;
  queuePosition: number;
  estimatedTime: number;
  onNewJob: () => void;
}

const ReceiptStep = ({ job, queuePosition, estimatedTime, onNewJob }: ReceiptStepProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;
    const w = window.open("", "_blank", "width=400,height=700");
    if (!w) return;
    w.document.write(`
      <html><head><title>PrintQueue Pro - Receipt</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 20px; max-width: 380px; margin: 0 auto; color: #1a1a2e; }
        .header { text-align: center; border-bottom: 2px dashed #7C3AED; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { color: #7C3AED; font-size: 20px; margin: 0; }
        .header p { font-size: 11px; color: #666; margin: 4px 0 0; }
        .section { margin: 12px 0; }
        .section-title { font-weight: 700; font-size: 13px; color: #7C3AED; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
        .row .label { color: #666; }
        .row .value { font-weight: 600; }
        .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; padding: 10px 0; border-top: 2px solid #7C3AED; border-bottom: 2px solid #7C3AED; margin: 12px 0; color: #7C3AED; }
        .paid-badge { text-align: center; background: #22c55e; color: white; padding: 8px; border-radius: 8px; font-weight: 700; font-size: 14px; margin: 12px 0; }
        .footer { text-align: center; font-size: 10px; color: #999; margin-top: 20px; border-top: 1px dashed #ddd; padding-top: 12px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="header">
        <h1>🖨️ PrintQueue Pro</h1>
        <p>E-Print Receipt</p>
      </div>
      <div class="paid-badge">✅ PAYMENT SUCCESSFUL</div>
      <div class="section">
        <div class="section-title">Receipt Details</div>
        <div class="row"><span class="label">Receipt No</span><span class="value">${job.id.toUpperCase()}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${new Date(job.paidAt || job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
        <div class="row"><span class="label">Customer</span><span class="value">${job.userName}</span></div>
        <div class="row"><span class="label">Payment ID</span><span class="value">${job.paymentId || "N/A"}</span></div>
        <div class="row"><span class="label">Payment Method</span><span class="value">${job.paymentMethod || "N/A"}</span></div>
      </div>
      <div class="section">
        <div class="section-title">Print Job Details</div>
        <div class="row"><span class="label">File Name</span><span class="value">${job.fileName}</span></div>
        <div class="row"><span class="label">Pages</span><span class="value">${job.pageCount}</span></div>
        <div class="row"><span class="label">Copies</span><span class="value">${job.copies}</span></div>
        <div class="row"><span class="label">Print Side</span><span class="value">${job.printSide === "double" ? "Double-sided" : "Single-sided"}</span></div>
        <div class="row"><span class="label">Color</span><span class="value">${job.colorMode === "color" ? "Color" : "Black & White"}</span></div>
        <div class="row"><span class="label">Binding</span><span class="value">${BINDING_PRICES[job.binding].label}</span></div>
      </div>
      <div class="section">
        <div class="section-title">Cost Breakdown</div>
        <div class="row"><span class="label">Print Cost</span><span class="value">₹${job.printCost}</span></div>
        ${job.bindingCost > 0 ? `<div class="row"><span class="label">Binding Cost</span><span class="value">₹${job.bindingCost}</span></div>` : ""}
      </div>
      <div class="total-row"><span>TOTAL PAID</span><span>₹${job.totalCost}</span></div>
      <div class="section">
        <div class="section-title">Collection Info</div>
        <div class="row"><span class="label">Queue Position</span><span class="value">#${queuePosition}</span></div>
        <div class="row"><span class="label">Est. Collection</span><span class="value">~${estimatedTime} minutes</span></div>
      </div>
      <div class="footer">
        <p>Thank you for using PrintQueue Pro!</p>
        <p>Please show this receipt at the collection counter.</p>
        <p>For support, contact the admin desk.</p>
      </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <Card className="shadow-vibrant border-0 animate-slide-up">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <CardTitle className="font-heading text-foreground text-2xl">Payment Successful!</CardTitle>
        <p className="text-sm text-muted-foreground">Your e-receipt is ready</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Receipt Card */}
        <div ref={receiptRef} className="border-2 border-dashed border-primary/30 rounded-xl p-5 space-y-4">
          <div className="text-center border-b border-border pb-3">
            <img src={logo} alt="Logo" className="w-10 h-10 mx-auto mb-1" />
            <p className="font-heading font-bold text-foreground">PrintQueue Pro</p>
            <p className="text-xs text-muted-foreground">E-Print Receipt</p>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Receipt No</span><span className="font-medium text-foreground">{job.id.slice(0, 12).toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{new Date(job.paidAt || job.createdAt).toLocaleDateString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium text-foreground">{job.userName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment ID</span><span className="font-medium text-foreground text-xs">{job.paymentId?.slice(0, 16) || "N/A"}</span></div>
          </div>

          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <p className="font-semibold text-primary text-xs uppercase tracking-wider">Job Details</p>
            <div className="flex justify-between"><span className="text-muted-foreground">File</span><span className="font-medium text-foreground truncate max-w-[180px]">{job.fileName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pages × Copies</span><span className="font-medium text-foreground">{job.pageCount} × {job.copies}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Side</span><span className="font-medium text-foreground">{job.printSide === "double" ? "Double" : "Single"}-sided</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Color</span><span className="font-medium text-foreground">{job.colorMode === "color" ? "Color" : "B&W"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Binding</span><span className="font-medium text-foreground">{BINDING_PRICES[job.binding].label}</span></div>
          </div>

          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Print Cost</span><span className="font-medium text-foreground">₹{job.printCost}</span></div>
            {job.bindingCost > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Binding</span><span className="font-medium text-foreground">₹{job.bindingCost}</span></div>}
            <div className="flex justify-between border-t border-primary pt-2 mt-2">
              <span className="font-bold text-foreground">TOTAL PAID</span>
              <span className="font-bold text-primary text-lg">₹{job.totalCost}</span>
            </div>
          </div>
        </div>

        {/* Queue Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl gradient-card shadow-card text-center">
            <p className="text-sm text-muted-foreground">Queue Position</p>
            <p className="text-3xl font-bold font-heading text-primary">{queuePosition}</p>
          </div>
          <div className="p-4 rounded-xl gradient-card shadow-card text-center">
            <p className="text-sm text-muted-foreground">Est. Collection</p>
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-5 w-5 text-accent" />
              <p className="text-3xl font-bold font-heading text-secondary">{estimatedTime}m</p>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm">
          Show this receipt at the collection counter to pick up your printout.
        </p>

        <div className="flex gap-3">
          <Button onClick={handlePrint} variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Download className="h-4 w-4" /> Download Receipt
          </Button>
          <Button onClick={onNewJob} className="flex-1 gradient-primary text-primary-foreground font-semibold hover:opacity-90">
            <Printer className="h-4 w-4 mr-2" /> New Print Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptStep;
