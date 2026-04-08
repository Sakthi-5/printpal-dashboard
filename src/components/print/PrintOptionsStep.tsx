import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { BindingType, BINDING_PRICES } from "@/context/PrintQueueContext";
import { BookOpen, Palette, Copy, Package } from "lucide-react";

interface PrintOptionsStepProps {
  fileName: string;
  pageCount: number;
  setPageCount: (v: number) => void;
  printSide: "single" | "double";
  setPrintSide: (v: "single" | "double") => void;
  colorMode: "bw" | "color";
  setColorMode: (v: "bw" | "color") => void;
  copies: number;
  setCopies: (v: number) => void;
  binding: BindingType;
  setBinding: (v: BindingType) => void;
  costs: { printCost: number; bindingCost: number; totalCost: number };
  onSubmit: () => void;
}

const PrintOptionsStep = ({
  fileName, pageCount, setPageCount,
  printSide, setPrintSide, colorMode, setColorMode,
  copies, setCopies, binding, setBinding,
  costs, onSubmit,
}: PrintOptionsStepProps) => {
  return (
    <Card className="shadow-vibrant border-0 animate-slide-up">
      <CardHeader>
        <CardTitle className="font-heading text-foreground">Print Options</CardTitle>
        <p className="text-sm text-muted-foreground">{fileName} • ~{pageCount} pages</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Page count edit */}
        <div>
          <Label htmlFor="pageCount" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Number of Pages
          </Label>
          <Input id="pageCount" type="number" min={1} max={500} value={pageCount}
            onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-1 w-32" />
        </div>

        {/* Print Side */}
        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Print Side
          </Label>
          <RadioGroup value={printSide} onValueChange={(v) => setPrintSide(v as "single" | "double")} className="flex gap-4">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${printSide === "single" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="single" />
              <div><p className="font-medium text-foreground">Single-sided</p><p className="text-xs text-muted-foreground">₹2 (B&W) / ₹8 (Color) per page</p></div>
            </label>
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${printSide === "double" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="double" />
              <div><p className="font-medium text-foreground">Double-sided</p><p className="text-xs text-muted-foreground">30% savings per page</p></div>
            </label>
          </RadioGroup>
        </div>

        {/* Color Mode */}
        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" /> Color Mode
          </Label>
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

        {/* Binding Options */}
        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Binding / Finishing
          </Label>
          <RadioGroup value={binding} onValueChange={(v) => setBinding(v as BindingType)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(BINDING_PRICES) as BindingType[]).map((key) => {
              const opt = BINDING_PRICES[key];
              return (
                <label key={key} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${binding === key ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value={key} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {opt.price > 0 ? `₹${opt.price}` : "Free"}
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Copies */}
        <div>
          <Label htmlFor="copies" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Copy className="h-4 w-4 text-primary" /> Number of Copies
          </Label>
          <Input id="copies" type="number" min={1} max={100} value={copies}
            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-1 w-32" />
        </div>

        {/* Cost Breakdown */}
        <div className="p-5 rounded-xl gradient-card shadow-card space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Print Cost ({pageCount} pages × {copies} copies)</span>
            <span className="font-medium text-foreground">₹{costs.printCost}</span>
          </div>
          {costs.bindingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{BINDING_PRICES[binding].label} × {copies}</span>
              <span className="font-medium text-foreground">₹{costs.bindingCost}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Amount</span>
            <span className="text-2xl font-bold font-heading text-primary">₹{costs.totalCost}</span>
          </div>
        </div>

        <Button onClick={onSubmit} className="w-full gradient-primary text-primary-foreground font-semibold text-lg py-6 hover:opacity-90 transition-opacity">
          Proceed to Payment (₹{costs.totalCost})
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrintOptionsStep;
