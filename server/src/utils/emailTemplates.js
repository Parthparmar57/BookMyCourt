/**
 * Clean, Lightweight White-Background HTML Email Templates for BookMyCourt.
 * Optimized for high deliverability, fast rendering, and crisp white styling.
 */

const baseEmailLayout = ({ title, subtitle, contentHtml, footerNote }) => {
  return `
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
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #ffffff;
      padding: 20px 10px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .brand-header {
      padding: 20px 24px;
      border-bottom: 3px solid #059669;
      background-color: #ffffff;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 800;
      color: #059669;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .logo-tag {
      font-size: 11px;
      font-weight: 700;
      color: #047857;
      background-color: #ecfdf5;
      padding: 3px 8px;
      border-radius: 6px;
      margin-left: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header {
      padding: 24px 24px 12px 24px;
      background-color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      color: #64748b;
    }
    .body {
      padding: 0 24px 24px 24px;
      background-color: #ffffff;
    }
    .card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      margin: 16px 0;
    }
    .badge-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-info { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-amber { background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .btn-primary {
      display: inline-block;
      background-color: #059669;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      margin: 16px 0;
      text-align: center;
    }
    .otp-box {
      background-color: #f0fdf4;
      border: 1.5px dashed #059669;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
      margin: 16px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #047857;
      font-family: monospace;
      margin: 0;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
    }
    .table-details td {
      padding: 10px 0;
      font-size: 13px;
      border-bottom: 1px solid #e2e8f0;
    }
    .table-details tr:last-child td {
      border-bottom: none;
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
      background-color: #ffffff;
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="brand-header">
        <span class="logo-text">BookMyCourt</span>
        <span class="logo-tag">SPORTS CLUB</span>
      </div>
      <div class="header">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <strong style="color: #334155;">BookMyCourt · Digital Club OS</strong><br>
        ${footerNote || 'This is an automated operational notification.'}
      </div>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * 1. Password Reset Email Template
 */
export const getPasswordResetTemplate = ({ name, resetLink, otpCode, expiryMinutes = 15 }) => {
  const contentHtml = `
    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Hello <strong>${name || 'Member'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      We received a request to reset your password for your <strong>BookMyCourt</strong> account. Use the verification code below or click the reset button to set a new password.
    </p>

    <div class="otp-box">
      <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Your One-Time Reset Code</div>
      <div class="otp-code">${otpCode || '------'}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Valid for ${expiryMinutes} minutes</div>
    </div>

    <div style="text-align: center; margin: 20px 0 16px;">
      <a href="${resetLink}" class="btn-primary" target="_blank">Reset My Password &rarr;</a>
    </div>

    <div class="card" style="margin-top: 20px; padding: 12px 16px; border-left: 4px solid #f59e0b;">
      <div style="font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 2px;">Security Notice</div>
      <div style="font-size: 12px; color: #78350f; line-height: 1.4;">
        If you did not initiate this request, you can safely ignore this email. Your password will remain unchanged.
      </div>
    </div>
  `;

  return baseEmailLayout({
    title: 'Password Reset Request',
    subtitle: 'Secure access to your BookMyCourt account',
    contentHtml,
    footerNote: 'Need help? Contact front desk support.',
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
    <div style="margin-bottom: 16px;">
      <span class="badge-pill badge-success">Booking Confirmed &#10003;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Hi <strong>${customerName || 'Player'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Your court reservation at <strong>BookMyCourt</strong> has been confirmed. Below are your session details:
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

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #166534;">
      <strong>&#127934; Player Guidelines:</strong>
      <ul style="margin: 6px 0 0; padding-left: 18px; line-height: 1.5;">
        <li>Please arrive 10 minutes prior to your session for check-in.</li>
        <li>Non-marking sports shoes are mandatory on indoor courts.</li>
        <li>Show your booking ID at the Front Desk upon arrival.</li>
      </ul>
    </div>
  `;

  return baseEmailLayout({
    title: 'Court Booking Confirmed',
    subtitle: `${courtName} · ${date} at ${startTime}`,
    contentHtml,
    footerNote: 'Need to manage your reservation? Visit your account dashboard.',
  });
};

/**
 * 3. Public Enquiry Auto-Reply & Acknowledgment
 */
export const getEnquiryAcknowledgmentTemplate = ({ name, interest, message }) => {
  const contentHtml = `
    <div style="margin-bottom: 16px;">
      <span class="badge-pill badge-info">Inquiry Received &#9993;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Dear <strong>${name || 'Visitor'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Thank you for contacting <strong>BookMyCourt</strong>! We have received your inquiry and our team is reviewing your request.
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
      A representative will connect with you shortly regarding tier packages, court schedules, and membership options.
    </p>
  `;

  return baseEmailLayout({
    title: 'Thank You for Contacting Us',
    subtitle: 'We have received your message at BookMyCourt',
    contentHtml,
    footerNote: 'Operating hours: 6:00 AM - 10:00 PM Daily',
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
    <div style="margin-bottom: 16px;">
      <span class="badge-pill badge-amber">Official Quotation &#128196;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">
      Dear <strong>${leadName || 'Client'}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Thank you for your interest in <strong>BookMyCourt</strong>. We are pleased to share your customized quotation:
    </p>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: #64748b;">QUOTE NO: <span style="color: #0f172a; font-family: monospace;">${quotationNo}</span></span>
        <span style="font-size: 12px; color: #64748b;">Valid Until: <strong>${validUntil}</strong></span>
      </div>

      <table class="table-details">
        <tr>
          <td>Package / Plan</td>
          <td><strong>${planName || 'Custom Membership Package'}</strong></td>
        </tr>
        <tr>
          <td>Base Amount</td>
          <td>₹${Number(amount).toLocaleString('en-IN')}</td>
        </tr>
        ${Number(discount) > 0 ? `<tr><td>Special Discount</td><td style="color: #16a34a;">- ₹${Number(discount).toLocaleString('en-IN')}</td></tr>` : ''}
        <tr>
          <td style="font-size: 14px; font-weight: 700; color: #0f172a;">Final Total Amount</td>
          <td style="font-size: 16px; font-weight: 800; color: #047857;">₹${Number(total).toLocaleString('en-IN')}</td>
        </tr>
      </table>

      ${customNotes ? `
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #475569;">
          <strong>Package Details:</strong> ${customNotes}
        </div>
      ` : ''}
    </div>

    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      To accept this quote and activate your membership, please reply to this email or visit our front desk.
    </p>
  `;

  return baseEmailLayout({
    title: 'Your BookMyCourt Quotation',
    subtitle: `Quotation #${quotationNo} for ${leadName}`,
    contentHtml,
    footerNote: 'This quote is valid up to the date mentioned above.',
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
    <div style="margin-bottom: 16px;">
      <span class="badge-pill badge-success">Membership Activated &#127881;</span>
    </div>

    <p style="font-size: 15px; margin-top: 0; line-height: 1.5; color: #0f172a;">
      Welcome to <strong>BookMyCourt</strong>, <strong>${memberName}</strong>!
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Your membership account has been registered successfully. Below are your credentials to access the member portal:
    </p>

    <div class="card">
      <table class="table-details">
        <tr>
          <td>Member ID</td>
          <td><strong style="font-family: monospace; color: #059669;">${memberNo}</strong></td>
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
          <td>Login Email</td>
          <td><strong>${email}</strong></td>
        </tr>
        <tr>
          <td>Account Password</td>
          <td><strong style="font-family: monospace; color: #047857; font-size: 15px; background-color: #ecfdf5; padding: 3px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">${password}</strong></td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
      You can now log into your account to book court slots, view digital passes, check active plans, and manage orders.
    </p>
  `;

  return baseEmailLayout({
    title: 'Welcome to BookMyCourt',
    subtitle: `Membership Activated · Member #${memberNo}`,
    contentHtml,
    footerNote: 'Please keep your credentials safe. You can change your password anytime after logging in.',
  });
};
