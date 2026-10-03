import React from 'react';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import {
  X,
  Printer,
  Download,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Store
} from 'lucide-react';

/**
 * Generate clean printable HTML document for an order with Book My Court logo,
 * containing only price and order details.
 */
export const generateOrderReceiptHtml = (order) => {
  const orderNo = order?.orderNo || `#${order?.id?.slice(-8) || '0000'}`;
  const dateFormatted = order?.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString();

  const isDelivery = order?.fulfilment === 'DELIVERY';
  const memberName = order?.member?.user?.name || order?.member?.name || 'Club Member';
  const memberEmail = order?.member?.user?.email || order?.member?.email || '';
  const memberPhone = order?.member?.user?.phone || order?.member?.phone || '';

  const subtotal = Number(order?.subtotal || 0);
  const discount = Number(order?.discount || 0);
  const tax = Number(order?.tax || 0);
  const total = Number(order?.total || order?.totalAmount || 0);

  const itemsHtml = (order?.items || [])
    .map((item, idx) => {
      const name = item.product?.name || item.name || 'Pro Shop Item';
      const qty = item.quantity || 1;
      const price = Number(item.unitPrice || 0);
      const lineTotal = Number(item.totalPrice || price * qty);
      return `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">
            ${idx + 1}. ${name}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #334155;">
            ${qty}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #334155;">
            ₹${price.toLocaleString('en-IN')}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">
            ₹${lineTotal.toLocaleString('en-IN')}
          </td>
        </tr>
      `;
    })
    .join('');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Receipt_${orderNo}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 24px;
            font-size: 13px;
            line-height: 1.5;
          }
          .receipt-container {
            max-width: 680px;
            margin: 0 auto;
            border: 1px solid #cbd5e1;
            padding: 32px;
            background: #ffffff;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-logo-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-logo {
            height: 48px;
            width: auto;
            object-fit: contain;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .receipt-tag {
            font-size: 14px;
            font-weight: 800;
            color: #15803d;
            text-align: right;
          }
          .order-no {
            font-family: monospace;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 2px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 14px 18px;
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 4px;
          }
          .detail-val {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 10px 14px;
            text-align: left;
            border-bottom: 1px solid #cbd5e1;
          }
          .summary-box {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
          }
          .summary-table {
            width: 260px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            color: #334155;
          }
          .grand-total {
            border-top: 2px solid #0f172a;
            padding-top: 8px;
            margin-top: 4px;
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header-row">
            <div class="brand-logo-wrap">
              <img src="${origin}/bookmycourt_logo.png" alt="Book My Court Logo" class="brand-logo" onerror="this.src='/bookmycourt_logo.png'" />
              <div>
                <div class="brand-title">Book My Court</div>
                <div style="font-size: 12px; color: #475569;">Official Pro Shop Order Receipt</div>
              </div>
            </div>
            <div>
              <div class="receipt-tag">Order Receipt</div>
              <div class="order-no">${orderNo}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${dateFormatted}</div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="section-title">Customer Details</div>
              <div class="detail-val">${memberName}</div>
              ${memberEmail ? `<div style="font-size: 12px; color: #475569;">${memberEmail}</div>` : ''}
              ${memberPhone ? `<div style="font-size: 12px; color: #475569;">${memberPhone}</div>` : ''}
            </div>

            <div>
              <div class="section-title">Fulfillment & Payment</div>
              <div class="detail-val">
                ${isDelivery ? 'Delivery' : 'Click & Collect (Pickup)'}
              </div>
              <div style="font-size: 12px; color: #475569;">
                ${
                  isDelivery
                    ? (order?.deliveryAddress || 'Registered Address') + (order?.pinCode ? ` - ${order.pinCode}` : '')
                    : 'Pick up at Club Front Desk Counter'
                }
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                Payment: <strong>${order?.paymentMode || 'Online'}</strong> (${order?.paymentStatus || 'PAID'})
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Item</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 18%; text-align: right;">Unit Price</th>
                <th style="width: 17%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-table">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
              </div>
              ${
                discount > 0
                  ? `
                <div class="summary-row" style="color: #15803d; font-weight: 600;">
                  <span>Discount:</span>
                  <span>-₹${discount.toLocaleString('en-IN')}</span>
                </div>
              `
                  : ''
              }
              <div class="summary-row">
                <span>Tax:</span>
                <span>₹${tax.toLocaleString('en-IN')}</span>
              </div>
              <div class="summary-row grand-total">
                <span>Total Amount:</span>
                <span>₹${total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;
};

/**
 * Triggers clean printing / Save-As-PDF for an order receipt.
 */
export const printOrderReceipt = (order) => {
  if (!order) return;
  const printWindow = window.open('', '_blank', 'width=720,height=850');
  if (!printWindow) {
    window.print();
    return;
  }
  const html = generateOrderReceiptHtml(order);
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Clean On-Screen Receipt Modal containing Book My Court logo, order details, and price breakdown.
 */
export const MemberOrderReceiptModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const orderNo = order.orderNo || `#${order.id?.slice(-8) || '0000'}`;
  const isDelivery = order.fulfilment === 'DELIVERY';
  const memberName = order.member?.user?.name || order.member?.name || 'Club Member';
  const memberEmail = order.member?.user?.email || order.member?.email || '';

  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const tax = Number(order.tax || 0);
  const total = Number(order.total || order.totalAmount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/bookmycourt_logo.png"
              alt="Book My Court"
              className="h-8 w-auto object-contain bg-white px-1.5 py-0.5 rounded"
            />
            <div>
              <h3 className="text-sm font-black tracking-tight leading-tight">Order Receipt</h3>
              <div className="text-xs text-slate-400 font-mono">{orderNo}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printOrderReceipt(order)}
              className="bg-[#4A812F] hover:bg-[#3d6b27] text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Brand Row with Book My Court Logo */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <img
                src="/bookmycourt_logo.png"
                alt="Book My Court Logo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <div className="text-sm font-black text-slate-900 tracking-tight">Book My Court</div>
                <div className="text-[11px] text-slate-500 font-medium">Official Pro Shop & Gear Order Receipt</div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                {order.paymentStatus || 'PAID'}
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(order.createdAt || new Date())}</div>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Order Information
              </span>
              <div className="font-bold text-slate-900">{orderNo}</div>
              <div className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{formatDate(order.createdAt || new Date())}</span>
              </div>
              <div className="text-slate-600">
                Payment: <strong>{order.paymentMode || 'Online'}</strong> ({order.paymentStatus || 'PAID'})
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Customer & Fulfillment
              </span>
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>{memberName}</span>
              </div>
              <div className="text-slate-600 flex items-center gap-1">
                {isDelivery ? <Truck className="w-3.5 h-3.5 text-blue-500" /> : <Store className="w-3.5 h-3.5 text-[#4A812F]" />}
                <span>{isDelivery ? 'Delivery' : 'Click & Collect (Pickup)'}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {isDelivery
                  ? `${order.deliveryAddress || 'Registered Address'} ${order.pinCode ? `(${order.pinCode})` : ''}`
                  : 'Club Front Desk Counter'}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => {
                  const name = item.product?.name || item.name || 'Pro Shop Item';
                  const qty = item.quantity || 1;
                  const price = Number(item.unitPrice || 0);
                  const lineTotal = Number(item.totalPrice || price * qty);
                  return (
                    <tr key={item.id || idx}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{name}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{qty}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(price)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Price Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-56 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 font-black text-slate-950 text-sm">
                <span>Grand Total</span>
                <span className="text-[#4A812F] text-base">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => printOrderReceipt(order)}
            className="px-4 py-1.5 bg-[#4A812F] hover:bg-[#3d6b27] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
