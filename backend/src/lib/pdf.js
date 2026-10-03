import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (invoice, writeStream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(writeStream);

  doc.fontSize(20).text('THE CHAMPIONS CLUB', { align: 'center' });
  doc.fontSize(10).text('Sports Club Management System - Official Invoice', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNo}`);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
  doc.text(`Status: ${invoice.status}`);
  doc.moveDown();

  if (invoice.member) {
    doc.text(`Member: ${invoice.member.user?.name || invoice.member.memberNo} (${invoice.member.memberNo})`);
  } else if (invoice.companyName) {
    doc.text(`Company: ${invoice.companyName} | GSTIN: ${invoice.gstin || 'N/A'}`);
  }
  doc.moveDown();

  doc.fontSize(11).text('Items:');
  doc.moveDown(0.5);

  let subtotal = 0;
  invoice.items?.forEach((item, idx) => {
    const itemTotal = Number(item.total || item.quantity * item.unitPrice);
    subtotal += itemTotal;
    doc.text(`${idx + 1}. ${item.description} - Qty: ${item.quantity} x Rs.${item.unitPrice} = Rs.${itemTotal.toFixed(2)}`);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Subtotal: Rs. ${Number(invoice.amount).toFixed(2)}`);
  doc.text(`Tax: Rs. ${Number(invoice.tax).toFixed(2)}`);
  doc.font('Helvetica-Bold').text(`Total Amount: Rs. ${Number(invoice.total).toFixed(2)}`);

  doc.end();
  return doc;
};
