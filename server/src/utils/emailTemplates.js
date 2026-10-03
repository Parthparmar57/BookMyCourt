/**
 * Branded HTML Email Templates for The Champions Club / BookMyCourt.
 * Matches the club's emerald/mint aesthetic with responsive, mobile-ready layout.
 */

const baseEmailLayout = ({ title, subtitle, contentHtml, footerNote }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .club-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 10px;
      color: #a7f3d0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      color: #d1fae5;
      font-weight: 400;
    }
    .body {
      padding: 32px 28px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      margin: 20px 0;
    }
    .badge-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-info { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-amber { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .btn-primary {
      display: inline-block;
      background: #059669;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      margin: 18px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
    }
    .otp-box {
      background: #ecfdf5;
      border: 2px dashed #059669;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #065f46;
      font-family: monospace;
      margin: 0;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
    }
    .table-details td {
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
    .table-details td:first-child {
      color: #64748b;
      font-weight: 500;
      width: 40%;
    }
    .table-details td:last-child {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 28px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer strong {
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="club-badge">THE CHAMPIONS CLUB</div>
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <strong>The Champions Club · BookMyCourt</strong><br>
        100 Sports Club Boulevard · Tennis, Cricket & Padel Facility<br>
        ${footerNote || 'This is an automated operational notification.'}
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Password Reset Email Template
 */
export const getPasswordResetTemplate = ({ name, resetLink, otpCode, expiryMinutes = 15 }) => {
  const contentHtml = `
    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Hello <strong>${name || 'Member'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      We received a request to reset your password for <strong>The Champions Club</strong> portal. Use the verification code below or click the reset button to set a new password.
    </p>

    <div class="otp-box">
      <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Your One-Time Reset Code</div>
      <div class="otp-code">${otpCode || '------'}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Valid for ${expiryMinutes} minutes</div>
    </div>

    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${resetLink}" class="btn-primary" target="_blank">Reset My Password &rarr;</a>
    </div>

    <div class="card" style="margin-top: 24px; padding: 14px 18px; border-left: 4px solid #f59e0b;">
      <div style="font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 2px;">Security Notice</div>
      <div style="font-size: 12px; color: #78350f; line-height: 1.4;">
        If you did not initiate this request, you can safely ignore this email. Your password will remain unchanged.
      </div>
    </div>
  `;

  return baseEmailLayout({
    title: 'Password Reset Request',
    subtitle: 'Secure access to your Champions Club account',
    contentHtml,
    footerNote: 'Need help? Contact our front desk at support@championsclub.com',
  });
};

/**
 * 2. Court Booking Confirmation & Calendar Details
 */
export const getBookingConfirmationTemplate = ({
  bookingId,
  customerName,
  courtName,
  sport,
  date,
  startTime,
  endTime,
  price,
  paymentMode,
}) => {
  const formattedPrice = Number(price) === 0 ? 'FREE (Member Perk)' : `₹${Number(price).toLocaleString('en-IN')}`;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="badge-pill badge-success">Booking Confirmed &#10003;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Hi <strong>${customerName || 'Player'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Your court reservation at <strong>The Champions Club</strong> has been locked and confirmed. Below are your session details:
    </p>

    <div class="card">
      <table class="table-details">
        <tr>
          <td>Booking ID</td>
          <td><span style="font-family: monospace; color: #047857;">${bookingId || 'CONFIRMED'}</span></td>
        </tr>
        <tr>
          <td>Court & Sport</td>
          <td>${courtName || 'Court'} (${sport || 'General'})</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>${date}</td>
        </tr>
        <tr>
          <td>Time Slot</td>
          <td>${startTime} - ${endTime} (60 mins)</td>
        </tr>
        <tr>
          <td>Amount Paid</td>
          <td><strong style="color: #047857;">${formattedPrice}</strong></td>
        </tr>
        ${paymentMode ? `<tr><td>Payment Method</td><td>${paymentMode}</td></tr>` : ''}
      </table>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 13px; color: #166534;">
      <strong>&#127934; Player Guidelines:</strong>
      <ul style="margin: 6px 0 0; padding-left: 18px; line-height: 1.5;">
        <li>Please arrive 10 minutes prior to your session for check-in.</li>
        <li>Non-marking sports shoes are mandatory on all indoor courts.</li>
        <li>Show your booking ID at the Front Desk for swift check-in.</li>
      </ul>
    </div>
  `;

  return baseEmailLayout({
    title: 'Court Booking Confirmed',
    subtitle: `${courtName} · ${date} at ${startTime}`,
    contentHtml,
    footerNote: 'Need to cancel or reschedule? Please manage your booking at least 2 hours in advance.',
  });
};

/**
 * 3. Public Enquiry Auto-Reply & Acknowledgment
 */
export const getEnquiryAcknowledgmentTemplate = ({ name, interest, message }) => {
  const contentHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="badge-pill badge-info">Inquiry Received &#9993;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Dear <strong>${name || 'Visitor'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Thank you for reaching out to <strong>The Champions Club</strong>! We have received your inquiry and our team is already reviewing your request.
    </p>

    <div class="card">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Inquiry Summary</div>
      <table class="table-details">
        <tr>
          <td>Primary Interest</td>
          <td>${interest || 'General Membership & Court Booking'}</td>
        </tr>
        ${message ? `<tr><td>Your Message</td><td>"${message}"</td></tr>` : ''}
        <tr>
          <td>Estimated Response</td>
          <td><strong style="color: #047857;">Within 2 hours</strong></td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      A dedicated front-desk representative will connect with you shortly with our tier packages (Gold, Silver, Junior), court schedules, and trial booking options.
    </p>

    <div style="text-align: center; margin-top: 20px;">
      <a href="tel:+919876543210" class="btn-primary" style="background: #0284c7;">Call Front Desk Directly &rarr;</a>
    </div>
  `;

  return baseEmailLayout({
    title: 'Thank You for Contacting Us',
    subtitle: 'We have received your message at The Champions Club',
    contentHtml,
    footerNote: 'Operating hours: 6:00 AM - 11:00 PM Daily',
  });
};

/**
 * 4. Formal Quotation Email (CRM Lead Follow-Up)
 */
export const getQuotationEmailTemplate = ({
  leadName,
  quotationNo,
  planName,
  amount,
  discount,
  total,
  validUntil,
  customNotes,
}) => {
  const contentHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="badge-pill badge-amber">Official Quotation &#128196;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Dear <strong>${leadName || 'Client'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Thank you for your interest in <strong>The Champions Club</strong>. As discussed with our team, we are delighted to present your customized quotation:
    </p>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 10px;">
        <span style="font-size: 12px; font-weight: 700; color: #64748b;">QUOTE NO: <span style="color: #0f172a; font-family: monospace;">${quotationNo}</span></span>
        <span style="font-size: 12px; color: #64748b;">Valid Until: <strong>${validUntil}</strong></span>
      </div>

      <table class="table-details">
        <tr>
          <td>Package / Plan</td>
          <td><strong>${planName || 'Custom Sports Membership Package'}</strong></td>
        </tr>
        <tr>
          <td>Base Amount</td>
          <td>₹${Number(amount).toLocaleString('en-IN')}</td>
        </tr>
        ${Number(discount) > 0 ? `<tr><td>Special Discount</td><td style="color: #16a34a;">- ₹${Number(discount).toLocaleString('en-IN')}</td></tr>` : ''}
        <tr style="border-top: 2px solid #cbd5e1;">
          <td style="font-size: 15px; font-weight: 700; color: #0f172a;">Final Total Amount</td>
          <td style="font-size: 18px; font-weight: 800; color: #047857;">₹${Number(total).toLocaleString('en-IN')}</td>
        </tr>
      </table>

      ${customNotes ? `
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #475569;">
          <strong>Notes / Package Inclusions:</strong><br>
          ${customNotes}
        </div>
      ` : ''}
    </div>

    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      To accept this quote and activate your membership or trial, simply reply to this email or visit our front desk.
    </p>
  `;

  return baseEmailLayout({
    title: 'Your Champions Club Quotation',
    subtitle: `Quotation #${quotationNo} for ${leadName}`,
    contentHtml,
    footerNote: 'This quote is valid up to the date mentioned above. Subject to club terms & conditions.',
  });
};

/**
 * 5. Welcome & Member Credentials Confirmation Email
 */
export const getWelcomeMemberEmailTemplate = ({
  memberName,
  memberNo,
  planName,
  email,
  password,
  startDate,
}) => {
  const contentHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="badge-pill badge-success">Membership Activated &#127881;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Welcome to <strong>The Champions Club</strong>, <strong>${memberName}</strong>!
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Your membership account has been successfully registered. Below are your account credentials to log into our member portal:
    </p>

    <div class="card">
      <table class="table-details">
        <tr>
          <td>Member ID</td>
          <td><strong style="font-family: monospace; color: #047857;">${memberNo}</strong></td>
        </tr>
        <tr>
          <td>Plan Tier</td>
          <td><strong>${planName || 'Active Membership'}</strong></td>
        </tr>
        <tr>
          <td>Start Date</td>
          <td>${startDate || 'Today'}</td>
        </tr>
        <tr>
          <td>Portal Login Email</td>
          <td><strong>${email}</strong></td>
        </tr>
        <tr>
          <td>Portal Password</td>
          <td><strong style="font-family: monospace; color: #047857; font-size: 16px;">${password}</strong></td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
      Log into your member portal to reserve court slots, view invoices, book trial sessions, and check cafeteria balances.
    </p>
  `;

  return baseEmailLayout({
    title: 'Welcome to The Champions Club',
    subtitle: `Membership Account Activated · Member #${memberNo}`,
    contentHtml,
    footerNote: 'Please keep your credentials confidential. You can change your password anytime after logging in.',
  });
};
