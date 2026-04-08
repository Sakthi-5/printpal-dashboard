import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface FileUploadStepProps {
  onFileSelected: (file: File, estimatedPages: number) => void;
}

const FileUploadStep = ({ onFileSelected }: FileUploadStepProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      const estimatedPages = Math.max(1, Math.round(f.size / 50000));
      onFileSelected(f, estimatedPages);
      toast.success(`${f.name} uploaded successfully!`);
    }
  };

  return (
    <Card className="shadow-vibrant border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-foreground">
          <Upload className="h-5 w-5 text-primary" /> Upload Document
        </CardTitle>
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
  );
};

export default FileUploadStep;
