import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileImage, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Student } from '@/types/database';

interface StudentQRCodeDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentQRCodeDialog({ student, open, onOpenChange }: StudentQRCodeDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const verificationUrl = `${window.location.origin}/verify/${student.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      toast.success('Verification URL copied to clipboard!');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const downloadAsPNG = async () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 300, 300);

        const link = document.createElement('a');
        link.download = `qr-${student.admission_number}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        URL.revokeObjectURL(url);
        toast.success('QR Code downloaded as PNG!');
      };

      img.src = url;
    } catch {
      toast.error('Failed to download PNG');
    }
  };

  const downloadAsPDF = async () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 300, 300);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const qrSize = 60;
        const x = (pageWidth - qrSize) / 2;

        // Add title
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Student Verification QR Code', pageWidth / 2, 30, { align: 'center' });

        // Add student info
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Name: ${student.full_name}`, pageWidth / 2, 45, { align: 'center' });
        pdf.text(`Admission: ${student.admission_number}`, pageWidth / 2, 52, { align: 'center' });
        if (student.certificate_number) {
          pdf.text(`Certificate: ${student.certificate_number}`, pageWidth / 2, 59, { align: 'center' });
        }

        // Add QR code
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, 70, qrSize, qrSize);

        // Add URL below QR
        pdf.setFontSize(8);
        pdf.text(verificationUrl, pageWidth / 2, 140, { align: 'center' });

        // Add footer
        pdf.setFontSize(10);
        pdf.text('Scan this QR code to verify the student certificate', pageWidth / 2, 150, { align: 'center' });

        pdf.save(`qr-${student.admission_number}.pdf`);
        URL.revokeObjectURL(url);
        toast.success('QR Code downloaded as PDF!');
      };

      img.src = url;
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-center">
            QR Code for {student.full_name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-center" ref={qrRef}>
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={verificationUrl}
                size={200}
                level="H"
                includeMargin
              />
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p className="font-mono text-xs break-all">{verificationUrl}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={copyToClipboard} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </Button>
            <Button variant="outline" onClick={downloadAsPNG} className="w-full">
              <FileImage className="mr-2 h-4 w-4" />
              PNG
            </Button>
            <Button variant="outline" onClick={downloadAsPDF} className="w-full col-span-2">
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
