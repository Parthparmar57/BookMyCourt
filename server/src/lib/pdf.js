import PDFDocument from 'pdfkit';

// ─── Invoice PDF ─────────────────────────────────────────────────────────────

export const generateInvoicePDF = (invoice, writeStream) => {
  const doc = new PDFDocument({ margin: 50 });
  if (typeof writeStream?.setHeader === 'function') {
    writeStream.setHeader('Content-Type', 'application/pdf');
    writeStream.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNo || 'document'}.pdf"`
    );
  }
  doc.pipe(writeStream);

  doc.fontSize(20).text('THE CHAMPIONS CLUB', { align: 'center' });
  doc.fontSize(10).text('Sports Club Management System - Official Invoice', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNo || 'N/A'}`);
  doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN')}`);
  doc.text(`Due Date: ${new Date(invoice.dueDate || Date.now()).toLocaleDateString('en-IN')}`);
  doc.text(`Status: ${invoice.status || 'PAID'}`);
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
    doc.text(`${idx + 1}. ${item.description} - Qty: ${item.quantity} x Rs.${Number(item.unitPrice).toFixed(2)} = Rs.${itemTotal.toFixed(2)}`);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Subtotal: Rs. ${Number(invoice.amount ?? subtotal).toFixed(2)}`);
  doc.text(`Tax: Rs. ${Number(invoice.tax || 0).toFixed(2)}`);
  doc.font('Helvetica-Bold').text(`Total Amount: Rs. ${Number(invoice.total ?? (invoice.amount || subtotal)).toFixed(2)}`);

  doc.end();
  return doc;
};

// ─── Quotation PDF (G1) ───────────────────────────────────────────────────────

export const generateQuotationPDF = (quotation, writeStream) => {
  const doc = new PDFDocument({ margin: 50 });

  if (typeof writeStream?.setHeader === 'function') {
    writeStream.setHeader('Content-Type', 'application/pdf');
    writeStream.setHeader(
      'Content-Disposition',
      `attachment; filename="quotation-${quotation.quotationNo || 'doc'}.pdf"`
    );
  }
  doc.pipe(writeStream);

  // Header
  doc.fontSize(22).font('Helvetica-Bold').text('THE CHAMPIONS CLUB', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('Official Quotation', { align: 'center' });
  doc.moveDown();

  // Meta
  doc.fontSize(12).font('Helvetica-Bold').text('Quotation Details', { underline: true });
  doc.font('Helvetica');
  doc.text(`Quotation No : ${quotation.quotationNo || 'N/A'}`);
  doc.text(`Date         : ${new Date(quotation.createdAt || Date.now()).toLocaleDateString('en-IN')}`);
  doc.text(`Valid Until  : ${new Date(quotation.validUntil || Date.now()).toLocaleDateString('en-IN')}`);
  doc.text(`Status       : ${quotation.status || 'DRAFT'}`);
  doc.moveDown();

  // Lead info
  if (quotation.lead) {
    doc.font('Helvetica-Bold').text('Prepared For', { underline: true });
    doc.font('Helvetica');
    doc.text(`Name  : ${quotation.lead.name || '—'}`);
    doc.text(`Phone : ${quotation.lead.phone || '—'}`);
    if (quotation.lead.email) doc.text(`Email : ${quotation.lead.email}`);
    doc.moveDown();
  }

  // Plan details
  if (quotation.plan) {
    doc.font('Helvetica-Bold').text('Plan Details', { underline: true });
    doc.font('Helvetica');
    doc.text(`Plan          : ${quotation.plan.name}`);
    doc.text(`Duration      : ${quotation.plan.durationMonths || 1} month(s)`);
    doc.text(`Court Rate    : Rs. ${Number(quotation.plan.courtRate || 0).toFixed(2)}`);
    doc.text(`Shop Discount : ${quotation.plan.shopDiscountPct || 0}%`);
    doc.text(`Bar Discount  : ${quotation.plan.barDiscountPct || 0}%`);
    doc.moveDown();
  }

  // Pricing
  doc.font('Helvetica-Bold').text('Pricing', { underline: true });
  doc.font('Helvetica');
  doc.text(`Amount   : Rs. ${Number(quotation.amount || 0).toFixed(2)}`);
  doc.text(`Discount : Rs. ${Number(quotation.discount || 0).toFixed(2)}`);
  doc.fontSize(13).font('Helvetica-Bold')
    .text(`Total    : Rs. ${Number(quotation.total || quotation.amount || 0).toFixed(2)}`);

  doc.moveDown(2);
  doc.fontSize(10).font('Helvetica').fillColor('grey')
    .text(
      'This quotation is valid until the date mentioned above. For queries, contact the front desk.',
      { align: 'center' }
    );

  doc.end();
  return doc;
};

// ─── Payslip PDF (G1) ────────────────────────────────────────────────────────

export const generatePayslipPDF = (payroll, writeStream) => {
  const doc = new PDFDocument({ margin: 50 });

  if (typeof writeStream?.setHeader === 'function') {
    writeStream.setHeader('Content-Type', 'application/pdf');
    writeStream.setHeader(
      'Content-Disposition',
      `attachment; filename="payslip-${payroll.payrollNo || 'doc'}.pdf"`
    );
  }
  doc.pipe(writeStream);

  const emp = payroll.employee;
  const user = emp?.user;
  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Header
  doc.fontSize(22).font('Helvetica-Bold').text('THE CHAMPIONS CLUB', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('Salary Payslip', { align: 'center' });
  doc.moveDown();

  // Employee info
  doc.fontSize(12).font('Helvetica-Bold').text('Employee Details', { underline: true });
  doc.font('Helvetica');
  doc.text(`Employee No  : ${emp?.employeeNo || '—'}`);
  doc.text(`Name         : ${user?.name || '—'}`);
  doc.text(`Email        : ${user?.email || '—'}`);
  doc.text(`Designation  : ${emp?.designation || '—'}`);
  doc.text(`Pay Period   : ${monthNames[payroll.month] || payroll.month} ${payroll.year}`);
  doc.moveDown();

  // Salary breakdown
  doc.font('Helvetica-Bold').text('Salary Breakdown', { underline: true });
  doc.font('Helvetica');
  doc.text(`Basic Salary   : Rs. ${Number(payroll.basicSalary || 0).toFixed(2)}`);
  doc.text(`Allowances (+) : Rs. ${Number(payroll.allowances || 0).toFixed(2)}`);
  doc.text(`Deductions (−) : Rs. ${Number(payroll.deductions || 0).toFixed(2)}`);
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold')
    .text(`Net Salary     : Rs. ${Number(payroll.netSalary || 0).toFixed(2)}`);

  doc.moveDown();
  doc.fontSize(11).font('Helvetica');
  doc.text(`Status  : ${payroll.status || 'PAID'}`);
  if (payroll.paidDate) {
    doc.text(`Paid On : ${new Date(payroll.paidDate).toLocaleDateString('en-IN')}`);
  }

  doc.moveDown(2);
  doc.fontSize(10).fillColor('grey')
    .text('This is a system-generated payslip. For discrepancies, contact HR.', {
      align: 'center',
    });

  doc.end();
  return doc;
};
