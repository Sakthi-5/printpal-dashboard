import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, IndianRupee, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface PaymentStepProps {
  totalCost: number;
  userName: string;
  jobId: string;
  onPaymentSuccess: (paymentId: string, method: string) => void;
  onCancel: () => void;
}

type PaymentMethod = "upi" | "netbanking" | "card";
type PaymentPhase = "select" | "details" | "processing" | "pin";

const PaymentStep = ({ totalCost, userName, jobId, onPaymentSuccess, onCancel }: PaymentStepProps) => {
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [phase, setPhase] = useState<PaymentPhase>("select");
  const [upiId, setUpiId] = useState("");
  const [pin, setPin] = useState("");

  const handleProceed = () => {
    if (method === "upi" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g., name@upi)");
      return;
    }
    setPhase("processing");
    // Simulate redirect to GPay / UPI app
    setTimeout(() => setPhase("pin"), 1500);
  };

  const handlePinSubmit = () => {
    if (pin.length < 4) {
      toast.error("Please enter your 4-6 digit UPI PIN");
      return;
    }
    setPhase("processing");
    // Simulate payment verification
    setTimeout(() => {
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const methodLabel = method === "upi" ? `UPI (${upiId})` : method === "netbanking" ? "Net Banking" : "Debit/Credit Card";
      onPaymentSuccess(paymentId, methodLabel);
      toast.success("Payment successful! 🎉");
    }, 2000);
  };

  // Processing screen
  if (phase === "processing") {
    return (
      <Card className="shadow-vibrant border-0 animate-fade-in">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="font-heading font-bold text-lg text-foreground">Processing Payment...</p>
          <p className="text-sm text-muted-foreground">Please do not close this window</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" /> Secured & Encrypted
          </div>
        </CardContent>
      </Card>
    );
  }

  // UPI PIN entry screen (simulates GPay)
  if (phase === "pin") {
    return (
      <Card className="shadow-vibrant border-0 animate-slide-up">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#4285F4] flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <CardTitle className="font-heading text-foreground">Google Pay</CardTitle>
          <p className="text-sm text-muted-foreground">Confirm payment to PrintQueue Pro</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 rounded-xl bg-muted">
            <p className="text-sm text-muted-foreground">Paying</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <IndianRupee className="h-6 w-6 text-foreground" />
              <span className="text-4xl font-bold font-heading text-foreground">{totalCost}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">to PrintQueue Pro</p>
            <p className="text-xs text-muted-foreground">from {upiId || "your account"}</p>
          </div>

          <div>
            <Label htmlFor="upiPin" className="text-sm font-semibold text-foreground">Enter UPI PIN</Label>
            <Input
              id="upiPin"
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="mt-2 text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">Enter your 4-6 digit UPI PIN to authorize</p>
          </div>

          <Button
            onClick={handlePinSubmit}
            disabled={pin.length < 4}
            className="w-full py-6 text-lg font-semibold bg-[#4285F4] hover:bg-[#3367D6] text-white"
          >
            <CheckCircle className="h-5 w-5 mr-2" /> Pay ₹{totalCost}
          </Button>

          <Button variant="ghost" onClick={() => { setPhase("select"); setPin(""); }} className="w-full text-muted-foreground">
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Method selection & details
  return (
    <Card className="shadow-vibrant border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-foreground">
          <CreditCard className="h-5 w-5 text-primary" /> Payment
        </CardTitle>
        <p className="text-sm text-muted-foreground">Complete payment to confirm your print job</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount */}
        <div className="text-center p-6 rounded-2xl gradient-card shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
          <div className="flex items-center justify-center gap-1">
            <IndianRupee className="h-7 w-7 text-primary" />
            <span className="text-5xl font-bold font-heading text-primary">{totalCost}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground">Select Payment Method</Label>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="space-y-3">
            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === "upi" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="upi" />
              <Smartphone className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">UPI / Google Pay</p>
                <p className="text-xs text-muted-foreground">Pay using GPay, PhonePe, Paytm</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === "netbanking" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="netbanking" />
              <CreditCard className="h-5 w-5 text-accent" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Net Banking</p>
                <p className="text-xs text-muted-foreground">All major banks supported</p>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* UPI ID Input */}
        {method === "upi" && (
          <div className="animate-fade-in">
            <Label htmlFor="upiId" className="text-sm font-semibold text-foreground">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">e.g., name@okaxis, name@ybl, name@paytm</p>
          </div>
        )}

        {method === "netbanking" && (
          <div className="animate-fade-in p-4 rounded-xl bg-muted">
            <p className="text-sm text-muted-foreground">You will be redirected to your bank's secure page to complete the payment.</p>
          </div>
        )}

        <Button
          onClick={handleProceed}
          className="w-full py-6 text-lg font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Smartphone className="h-5 w-5 mr-2" /> Pay ₹{totalCost}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>256-bit SSL Encrypted • Secure Payment</span>
        </div>

        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel & Go Back
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;
