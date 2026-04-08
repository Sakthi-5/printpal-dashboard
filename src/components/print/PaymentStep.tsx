import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface PaymentStepProps {
  totalCost: number;
  userName: string;
  jobId: string;
  onPaymentSuccess: (paymentId: string, method: string) => void;
  onCancel: () => void;
}

const PaymentStep = ({ totalCost, userName, jobId, onPaymentSuccess, onCancel }: PaymentStepProps) => {

  const handleRazorpayPayment = () => {
    if (!window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh and try again.");
      return;
    }

    const options: RazorpayOptions = {
      key: "rzp_test_demo1234567890",
      amount: totalCost * 100, // paise
      currency: "INR",
      name: "PrintQueue Pro",
      description: `Print Job #${jobId}`,
      prefill: {
        name: userName,
      },
      theme: {
        color: "#7C3AED",
      },
      handler: (response: RazorpayResponse) => {
        onPaymentSuccess(response.razorpay_payment_id, "Razorpay UPI/Card");
        toast.success("Payment successful! 🎉");
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <Card className="shadow-vibrant border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-foreground">
          <CreditCard className="h-5 w-5 text-primary" /> Payment
        </CardTitle>
        <p className="text-sm text-muted-foreground">Complete your payment to confirm the print job</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center p-8 rounded-2xl gradient-card shadow-card">
          <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
          <div className="flex items-center justify-center gap-1">
            <IndianRupee className="h-8 w-8 text-primary" />
            <span className="text-5xl font-bold font-heading text-primary">{totalCost}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Including all taxes</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Choose Payment Method</p>
          
          <Button
            onClick={handleRazorpayPayment}
            className="w-full py-6 text-lg font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
          >
            <Smartphone className="h-5 w-5" />
            Pay with UPI / GPay / Cards
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secured by Razorpay • UPI, Net Banking, Debit/Credit Cards accepted
          </p>
        </div>

        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel & Go Back
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;
