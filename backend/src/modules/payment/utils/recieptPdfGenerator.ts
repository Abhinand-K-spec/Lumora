
import PDFDocument from "pdfkit";
import type { ReceiptDTO } from "../dtos/recieptDto";

export class ReceiptPdfGenerator {
  static generate(data: ReceiptDTO): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount);

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("LUMORA", { align: "center" });

      doc
        .fontSize(11)
        .font("Helvetica")
        .text("PAYMENT RECEIPT", { align: "center" });

      doc.moveDown(2);

      // Receipt information
      doc.fontSize(10);
      doc.text(`Receipt Number: ${data.receiptNumber}`);
      doc.text(`Issued At: ${data.issuedAt.toLocaleString("en-IN")}`);

      doc.moveDown();

      // Customer details
      doc.font("Helvetica-Bold").text("Customer Details");
      doc.font("Helvetica");
      doc.text(`Name: ${data.customer.name}`);
      doc.text(`Email: ${data.customer.email}`);
      doc.text(`Phone: ${data.customer.phone}`);

      doc.moveDown();

      // Photographer details
      doc.font("Helvetica-Bold").text("Photographer Details");
      doc.font("Helvetica");
      doc.text(`Name: ${data.photographer.name}`);
      doc.text(`Email: ${data.photographer.email}`);
      doc.text(`Phone: ${data.photographer.phone}`);

      doc.moveDown();

      // Booking details
      doc.font("Helvetica-Bold").text("Booking Details");
      doc.font("Helvetica");
      doc.text(`Booking ID: ${data.booking.bookingId}`);

      data.booking.events.forEach((event) => {
        doc.text(
          `${event.eventType} - ${event.eventDate.toLocaleDateString("en-IN")}`
        );

        if (event.location) {
          doc.text(`Location: ${event.location}`);
        }
      });

      doc.moveDown();

      // Quotation details
      doc.font("Helvetica-Bold").text("Quotation Details");
      doc.font("Helvetica");
      doc.text(`Quotation Number: ${data.quotation.quotationNumber}`);

      doc.moveDown(0.5);

      data.quotation.items.forEach((item) => {
        doc.text(
          `${item.name} | Qty: ${item.quantity} | ${formatCurrency(item.total)}`
        );
      });

      doc.moveDown();
      doc.text(
        `Quotation Total: ${formatCurrency(data.quotation.totalAmount)}`
      );

      doc.moveDown();

      // Payment details
      doc.font("Helvetica-Bold").text("Payment Details");
      doc.font("Helvetica");
      doc.text(`Payment ID: ${data.payment.paymentId}`);
      doc.text(`Payment Type: ${data.payment.paymentType}`);
      doc.text(`Gateway: ${data.payment.gateway}`);
      doc.text(`Gateway Payment ID: ${data.payment.gatewayPaymentId ?? "N/A"}`);
      doc.text(`Paid At: ${data.payment.paidAt.toLocaleString("en-IN")}`);

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(
          `Amount Paid: ${formatCurrency(data.payment.amount)}`,
          { align: "right" }
        );

      doc.moveDown(2);

      doc
        .font("Helvetica")
        .fontSize(9)
        .text("Thank you for choosing Lumora!", { align: "center" });

      doc.end();
    });
  }
}
