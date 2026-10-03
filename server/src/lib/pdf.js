import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

// Helper: Get logo path if exists
const getLogoPath = () => {
  const primaryPath = path.join(process.cwd(), 'src/assets/bookmycourt_logo.png');
  if (fs.existsSync(primaryPath)) return primaryPath;
  const clientPath = path.join(process.cwd(), '../client/public/bookmycourt_logo.png');
  if (fs.existsSync(clientPath)) return clientPath;
  return null;
};

// Helper: Draw standard BookMyCourt header and footer
export const drawPdfHeader = (doc, title, subtitle) => {
  // Top accent bar
  doc.rect(0, 0, 595.28, 8).fill('#0f172a');

  const logoPath = getLogoPath();
  if (logoPath) {
    try {
      doc.image(logoPath, 40, 22, { height: 38 });
    } catch (e) {
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('BookMyCourt', 40, 24);
    }
  } else {
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text('BookMyCourt', 40, 24);
  }

  // Right-aligned brand header text
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('BOOKMYCOURT', 350, 22, { width: 205, align: 'right' });
  doc.fontSize(8.5).font('Helvetica').fillColor('#64748b').text('Sports Club Management System', 350, 38, { width: 205, align: 'right' });

  // Top divider line
  doc.moveTo(40, 68).lineTo(555.28, 68).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // Document Title & Subtitle banner
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text(title.toUpperCase(), 40, 80);
  if (subtitle) {
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(subtitle, 40, 100);
  }

  // Set start Y for content
  doc.y = subtitle ? 120 : 108;
};

export const drawPdfFooter = (doc) => {
  const footerY = 795;
  doc.moveTo(40, footerY).lineTo(555.28, footerY).strokeColor('#e2e8f0').lineWidth(0.8).stroke();

  doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
    .text('BookMyCourt · Official Document · Confidential', 40, footerY + 8, { width: 300, align: 'left' });

  doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
    .text('www.bookmycourt.com', 350, footerY + 8, { width: 205, align: 'right' });
};

// Helper: Draw Stat Summary Box Cards
export const drawSummaryCards = (doc, cards, startY) => {
  const gap = 12;
  const count = cards.length;
  const totalW = 515.28;
  const cardW = (totalW - (count - 1) * gap) / count;
  const cardH = 46;

  cards.forEach((card, idx) => {
    const cardX = 40 + idx * (cardW + gap);
    
    // Background card rect
    doc.roundedRect(cardX, startY, cardW, cardH, 6).fillAndStroke('#f8fafc', '#e2e8f0');

    // Label
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b')
      .text(card.label.toUpperCase(), cardX + 10, startY + 8, { width: cardW - 20, align: 'left' });

    // Value
    doc.fontSize(13).font('Helvetica-Bold').fillColor(card.color || '#0f172a')
      .text(String(card.value), cardX + 10, startY + 22, { width: cardW - 20, align: 'left' });
  });

  return startY + cardH + 16;
};

// Helper: Styled Table Generator
export const drawPdfTable = (doc, columns, rows, startY) => {
  let currentY = startY;
  const tableWidth = 515.28;

  // Header background
  doc.rect(40, currentY, tableWidth, 22).fill('#0f172a');

  // Header text
  columns.forEach((col) => {
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff')
      .text(col.header.toUpperCase(), 40 + col.x, currentY + 6, { width: col.width, align: col.align || 'left' });
  });

  currentY += 22;

  // Rows
  rows.forEach((row, rIdx) => {
    const isEven = rIdx % 2 === 0;
    const rowH = 20;

    // Row bg
    doc.rect(40, currentY, tableWidth, rowH).fill(isEven ? '#ffffff' : '#f8fafc');

    // Row bottom border
    doc.moveTo(40, currentY + rowH).lineTo(40 + tableWidth, currentY + rowH).strokeColor('#f1f5f9').lineWidth(0.5).stroke();

    // Cell contents
    columns.forEach((col) => {
      const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—';
      const color = col.textColor ? (typeof col.textColor === 'function' ? col.textColor(row) : col.textColor) : '#1e293b';

      doc.fontSize(8.5).font('Helvetica').fillColor(color)
        .text(val, 40 + col.x, currentY + 5, { width: col.width, align: col.align || 'left' });
    });

    currentY += rowH;
  });

  return currentY + 12;
};

// ─── Invoice PDF ─────────────────────────────────────────────────────────────

export const generateInvoicePDF = (invoice, writeStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  if (typeof writeStream?.setHeader === 'function') {
    writeStream.setHeader('Content-Type', 'application/pdf');
    writeStream.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNo || 'document'}.pdf"`
    );
  }
  doc.pipe(writeStream);

  drawPdfHeader(doc, 'TAX INVOICE', `Invoice No: ${invoice.invoiceNo || 'N/A'}`);

  let y = doc.y;

  // Invoice Summary Cards
  const dateStr = new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN');
  const dueStr = new Date(invoice.dueDate || Date.now()).toLocaleDateString('en-IN');
  const statusStr = (invoice.status || 'PAID').toUpperCase();

  y = drawSummaryCards(doc, [
    { label: 'Date', value: dateStr },
    { label: 'Due Date', value: dueStr },
    { label: 'Status', value: statusStr, color: statusStr === 'PAID' ? '#166534' : '#b45309' },
  ], y);

  // Bill To section
  doc.roundedRect(40, y, 515.28, 44, 6).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748b').text('BILLED TO', 50, y + 8);
  
  let billedToText = 'Walk-in Customer';
  if (invoice.member) {
    billedToText = `${invoice.member.user?.name || invoice.member.memberNo} (Member ID: ${invoice.member.memberNo})`;
  } else if (invoice.companyName) {
    billedToText = `${invoice.companyName} ${invoice.gstin ? `| GSTIN: ${invoice.gstin}` : ''}`;
  }
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text(billedToText, 50, y + 22);

  y += 58;

  // Items table
  let subtotal = 0;
  const itemsRows = (invoice.items || []).map((item, idx) => {
    const itemTotal = Number(item.total || item.quantity * item.unitPrice);
    subtotal += itemTotal;
    return {
      sno: idx + 1,
      desc: item.description || 'Item',
      qty: item.quantity,
      price: `Rs. ${Number(item.unitPrice).toFixed(2)}`,
      total: `Rs. ${itemTotal.toFixed(2)}`,
    };
  });

  const cols = [
    { header: '#', key: 'sno', x: 10, width: 30, align: 'left' },
    { header: 'Description', key: 'desc', x: 45, width: 240, align: 'left' },
    { header: 'Qty', key: 'qty', x: 290, width: 50, align: 'center' },
    { header: 'Unit Price', key: 'price', x: 345, width: 80, align: 'right' },
    { header: 'Amount', key: 'total', x: 430, width: 75, align: 'right' },
  ];

  y = drawPdfTable(doc, cols, itemsRows, y);

  // Total Summary Panel
  const totalsY = y;
  doc.roundedRect(300, totalsY, 255.28, 70, 6).fillAndStroke('#f8fafc', '#e2e8f0');

  const subTotalVal = Number(invoice.amount ?? subtotal).toFixed(2);
  const taxVal = Number(invoice.tax || 0).toFixed(2);
  const grandTotalVal = Number(invoice.total ?? (invoice.amount || subtotal)).toFixed(2);

  doc.fontSize(9).font('Helvetica').fillColor('#475569').text('Subtotal:', 315, totalsY + 10);
  doc.text(`Rs. ${subTotalVal}`, 430, totalsY + 10, { width: 110, align: 'right' });

  doc.text('Tax (GST):', 315, totalsY + 26);
  doc.text(`Rs. ${taxVal}`, 430, totalsY + 26, { width: 110, align: 'right' });

  doc.moveTo(315, totalsY + 42).lineTo(545, totalsY + 42).strokeColor('#cbd5e1').lineWidth(0.8).stroke();

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('Total Amount:', 315, totalsY + 48);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#059669').text(`Rs. ${grandTotalVal}`, 430, totalsY + 47, { width: 110, align: 'right' });

  drawPdfFooter(doc);
  doc.end();
  return doc;
};

// ─── Quotation PDF ───────────────────────────────────────────────────────────

export const generateQuotationPDF = (quotation, writeStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  if (typeof writeStream?.setHeader === 'function') {
    writeStream.setHeader('Content-Type', 'application/pdf');
    writeStream.setHeader(
      'Content-Disposition',
      `attachment; filename="quotation-${quotation.quotationNo || 'doc'}.pdf"`
    );
  }
  doc.pipe(writeStream);

  drawPdfHeader(doc, 'OFFICIAL QUOTATION', `Quotation No: ${quotation.quotationNo || 'N/A'}`);

  let y = doc.y;

  const dateStr = new Date(quotation.createdAt || Date.now()).toLocaleDateString('en-IN');
  const validStr = new Date(quotation.validUntil || Date.now()).toLocaleDateString('en-IN');
  const statusStr = (quotation.status || 'DRAFT').toUpperCase();

  y = drawSummaryCards(doc, [
    { label: 'Date Issued', value: dateStr },
    { label: 'Valid Until', value: validStr },
    { label: 'Status', value: statusStr, color: statusStr === 'ACCEPTED' ? '#166534' : '#0284c7' },
  ], y);

  // Client Details Card
  if (quotation.lead) {
    doc.roundedRect(40, y, 515.28, 44, 6).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748b').text('PREPARED FOR', 50, y + 8);
    const clientStr = `${quotation.lead.name || 'Client'} | Phone: ${quotation.lead.phone || '—'} | Email: ${quotation.lead.email || '—'}`;
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0f172a').text(clientStr, 50, y + 22);
    y += 56;
  }

  // Package Details Card
  if (quotation.plan) {
    doc.roundedRect(40, y, 515.28, 54, 6).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748b').text('MEMBERSHIP PLAN INCLUSIONS', 50, y + 8);
    
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#059669').text(quotation.plan.name || 'Package', 50, y + 22);
    doc.fontSize(8.5).font('Helvetica').fillColor('#475569')
      .text(`Duration: ${quotation.plan.durationMonths || 1} Month(s) · Court Hourly Discount: Rs.${Number(quotation.plan.courtRate || 0).toFixed(2)} · Shop Discount: ${quotation.plan.shopDiscountPct || 0}% · Bar Discount: ${quotation.plan.barDiscountPct || 0}%`, 50, y + 36);

    y += 66;
  }

  // Financial Breakdown
  const amountVal = Number(quotation.amount || 0).toFixed(2);
  const discountVal = Number(quotation.discount || 0).toFixed(2);
  const totalVal = Number(quotation.total || quotation.amount || 0).toFixed(2);

  const priceRows = [
    { item: 'Base Package Amount', val: `Rs. ${amountVal}` },
    { item: 'Special Promotional Discount', val: `- Rs. ${discountVal}` },
    { item: 'Final Quotation Total', val: `Rs. ${totalVal}` },
  ];

  const cols = [
    { header: 'Financial Component', key: 'item', x: 15, width: 350, align: 'left' },
    { header: 'Amount', key: 'val', x: 370, width: 130, align: 'right' },
  ];

  y = drawPdfTable(doc, cols, priceRows, y);

  doc.fontSize(8.5).font('Helvetica').fillColor('#94a3b8')
    .text('This quotation is computer generated and valid until the expiration date listed above. Subject to standard club terms & conditions.', 40, y + 10, { width: 515.28, align: 'center' });

  drawPdfFooter(doc);
  doc.end();
  return doc;
};

// ─── Payslip PDF ─────────────────────────────────────────────────────────────

export const generatePayslipPDF = (payroll, writeStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
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
  const periodStr = `${monthNames[payroll.month] || payroll.month} ${payroll.year}`;

  drawPdfHeader(doc, 'SALARY PAYSLIP', `Pay Period: ${periodStr}`);

  let y = doc.y;

  // Summary Cards
  y = drawSummaryCards(doc, [
    { label: 'Employee ID', value: emp?.employeeNo || 'EMP-000' },
    { label: 'Employee Name', value: user?.name || 'Staff' },
    { label: 'Status', value: payroll.status || 'PAID', color: '#166534' },
  ], y);

  // Employee Profile Card
  doc.roundedRect(40, y, 515.28, 44, 6).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748b').text('EMPLOYEE DETAILS', 50, y + 8);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0f172a')
    .text(`Designation: ${emp?.designation || 'Staff Member'}  |  Email: ${user?.email || 'N/A'}`, 50, y + 22);

  y += 56;

  // Breakdown Table
  const basicVal = Number(payroll.basicSalary || 0).toFixed(2);
  const allowVal = Number(payroll.allowances || 0).toFixed(2);
  const dedVal = Number(payroll.deductions || 0).toFixed(2);
  const netVal = Number(payroll.netSalary || 0).toFixed(2);

  const salaryRows = [
    { component: 'Basic Monthly Salary', type: 'Earnings', amount: `Rs. ${basicVal}` },
    { component: 'Allowances & Perks', type: 'Earnings', amount: `+ Rs. ${allowVal}` },
    { component: 'Deductions & Taxes', type: 'Deduction', amount: `- Rs. ${dedVal}` },
    { component: 'Net Take Home Salary', type: 'NET TOTAL', amount: `Rs. ${netVal}` },
  ];

  const cols = [
    { header: 'Salary Component', key: 'component', x: 15, width: 280, align: 'left' },
    { header: 'Category', key: 'type', x: 300, width: 90, align: 'center' },
    { header: 'Amount', key: 'amount', x: 400, width: 100, align: 'right' },
  ];

  y = drawPdfTable(doc, cols, salaryRows, y);

  doc.fontSize(8.5).font('Helvetica').fillColor('#94a3b8')
    .text('This is an official system-generated salary payslip for BookMyCourt personnel.', 40, y + 10, { width: 515.28, align: 'center' });

  drawPdfFooter(doc);
  doc.end();
  return doc;
};
