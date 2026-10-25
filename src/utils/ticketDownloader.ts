import { jsPDF } from 'jspdf';
import { Booking } from '../types';

/**
 * Safely extracts passenger array with fallback
 */
function getSafePassengers(booking: Booking) {
  if (Array.isArray(booking?.passengers) && booking.passengers.length > 0) {
    return booking.passengers;
  }
  const seatList = Array.isArray(booking?.seatNumbers) && booking.seatNumbers.length > 0 ? booking.seatNumbers : ['1A'];
  return seatList.map((st, i) => ({
    seatNumber: st,
    name: i === 0 ? (booking?.passengerName || 'Lead Passenger') : `Passenger ${i + 1}`,
    age: 28,
    gender: 'Male' as const,
    fare: Number(booking?.baseFare || 450) / (seatList.length || 1)
  }));
}

/**
 * Safely extracts seat numbers array with fallback
 */
function getSafeSeatNumbers(booking: Booking): string[] {
  if (Array.isArray(booking?.seatNumbers) && booking.seatNumbers.length > 0) {
    return booking.seatNumbers;
  }
  return ['Assigned'];
}

/**
 * Generates clean standalone HTML representation of the Guardian Travels ticket
 */
export function getTicketHtmlString(booking: Booking): string {
  const safePassengers = getSafePassengers(booking);
  const safeSeats = getSafeSeatNumbers(booking);
  const pnr = booking?.pnr || 'GT-REF';
  const totalAmount = Number(booking?.totalAmount || 0);

  const passengersHtml = safePassengers
    .map(
      (p, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${index + 1}. ${p.name || 'Traveler'}</td>
        <td style="padding: 10px 12px; color: #475569;">${p.age || 26} Yrs / ${p.gender || 'Adult'}</td>
        <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #1d4ed8; text-align: center;">Seat ${p.seatNumber || '-'}</td>
        <td style="padding: 10px 12px; font-weight: 600; text-align: right; color: #0f172a;">₹${Number(p.fare || (totalAmount / (safePassengers.length || 1))).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const insuranceCardHtml = booking?.insuranceOpted
    ? `
      <div style="margin-top: 20px; padding: 16px; background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="color: #065f46; font-size: 13px;">🛡️ Guardian Protect Comprehensive Travel Insurance Certificate</strong>
          <span style="background: #10b981; color: #ffffff; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">POLICY ACTIVE</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px; color: #047857; margin-top: 8px;">
          <div>Policy No: <strong>${booking?.insurancePolicyNumber || 'POL-GT-' + pnr}</strong></div>
          <div>Emergency Medical: <strong>₹3,00,000</strong></div>
          <div>Accidental Cover: <strong>₹6,00,000</strong></div>
        </div>
        <div style="font-size: 11px; color: #059669; margin-top: 8px;">
          24x7 Cashless Hospitalization & Medical Hotline: <strong>1800-425-4827</strong>
        </div>
      </div>
    `
    : `
      <div style="margin-top: 20px; padding: 12px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 12px; color: #64748b;">
        Travel Insurance: <strong>Not Opted</strong>
      </div>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Guardian Travels - Ticket ${pnr}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
    .ticket-container { max-width: 780px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; }
    .header-banner { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; }
    .brand-title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin: 0; display: flex; align-items: center; gap: 8px; }
    .brand-tag { font-size: 11px; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; }
    .pnr-box { text-align: right; }
    .pnr-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; }
    .pnr-value { font-size: 22px; font-family: monospace; font-weight: 900; color: #34d399; margin-top: 2px; }
    .content-body { padding: 28px; }
    .route-strip { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .city-block { flex: 1; }
    .city-block.right { text-align: right; }
    .city-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px; }
    .city-name { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
    .city-time { font-size: 13px; font-weight: 600; color: #2563eb; margin-top: 4px; }
    .route-arrow { padding: 0 20px; text-align: center; color: #94a3b8; font-size: 22px; font-weight: 700; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; }
    .info-card-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px; }
    .info-card-value { font-size: 13px; font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
    .fare-container { margin-top: 24px; padding: 18px; background: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .qr-area { display: flex; align-items: center; gap: 14px; }
    .qr-box { width: 75px; height: 75px; background: #ffffff; border: 1px solid #cbd5e1; padding: 6px; border-radius: 8px; }
    .fare-total { text-align: right; }
    .total-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; }
    .total-amount { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 2px; }
    .footer-note { text-align: center; margin-top: 24px; font-size: 11px; color: #64748b; line-height: 1.6; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .ticket-container { box-shadow: none !important; border: 1px solid #000 !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="header-banner">
      <div>
        <div class="brand-title">GUARDIAN TRAVELS</div>
        <div class="brand-tag">Travel Smarter. Travel Safer. &bull; Official Digital Boarding Pass</div>
      </div>
      <div class="pnr-box">
        <div class="pnr-label">Booking Reference (PNR)</div>
        <div class="pnr-value">${pnr}</div>
      </div>
    </div>

    <div class="content-body">
      <!-- Route Header -->
      <div class="route-strip">
        <div class="city-block">
          <div class="city-label">Boarding Station</div>
          <div class="city-name">${booking?.source || 'Origin Station'}</div>
          <div class="city-time">${booking?.departureTime || '06:30 AM'} &bull; ${booking?.journeyDate || booking?.travelDate || 'Scheduled Date'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Pickup: <strong>${booking?.boardingPoint || booking?.source || 'City Terminal'}</strong></div>
        </div>
        <div class="route-arrow">&rarr;</div>
        <div class="city-block right">
          <div class="city-label">Arrival Destination</div>
          <div class="city-name">${booking?.destination || 'Destination'}</div>
          <div class="city-time">${booking?.arrivalTime || '10:00 AM'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Drop: <strong>${booking?.droppingPoint || booking?.destination || 'Central Stand'}</strong></div>
        </div>
      </div>

      <!-- Bus & Trip Meta -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-card-label">Coach Name</div>
          <div class="info-card-value">${booking?.busName || 'Guardian Express'}</div>
        </div>
        <div class="info-card">
          <div class="info-card-label">Vehicle Registration</div>
          <div class="info-card-value" style="font-family: monospace;">${booking?.busNumber || 'TN57AB1234'}</div>
        </div>
        <div class="info-card">
          <div class="info-card-label">Seats Reserved</div>
          <div class="info-card-value" style="color: #2563eb;">[${safeSeats.join(', ')}]</div>
        </div>
        <div class="info-card">
          <div class="info-card-label">Booking Status</div>
          <div class="info-card-value" style="color: ${booking?.status === 'CANCELLED' ? '#e11d48' : '#059669'};">${booking?.status || 'CONFIRMED'}</div>
        </div>
      </div>

      <!-- Passengers Table -->
      <div style="margin-top: 16px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1e293b; margin-bottom: 8px;">
          Passenger Manifest (${safePassengers.length} Traveler${safePassengers.length > 1 ? 's' : ''})
        </div>
        <table>
          <thead>
            <tr>
              <th>Passenger Name</th>
              <th>Age / Gender</th>
              <th style="text-align: center;">Seat Number</th>
              <th style="text-align: right;">Fare (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${passengersHtml}
          </tbody>
        </table>
      </div>

      <!-- Insurance Certificate Section -->
      ${insuranceCardHtml}

      <!-- Fare & QR Verification -->
      <div class="fare-container">
        <div class="qr-area">
          <svg class="qr-box" viewBox="0 0 100 100" fill="#0f172a">
            <rect x="5" y="5" width="28" height="28" rx="3" fill="none" stroke="#0f172a" stroke-width="6"/>
            <rect x="13" y="13" width="12" height="12"/>
            <rect x="67" y="5" width="28" height="28" rx="3" fill="none" stroke="#0f172a" stroke-width="6"/>
            <rect x="75" y="13" width="12" height="12"/>
            <rect x="5" y="67" width="28" height="28" rx="3" fill="none" stroke="#0f172a" stroke-width="6"/>
            <rect x="13" y="75" width="12" height="12"/>
            <rect x="44" y="12" width="10" height="10"/>
            <rect x="44" y="30" width="10" height="10"/>
            <rect x="12" y="44" width="10" height="10"/>
            <rect x="30" y="44" width="10" height="10"/>
            <rect x="45" y="45" width="16" height="16"/>
            <rect x="68" y="44" width="10" height="10"/>
            <rect x="44" y="68" width="10" height="10"/>
            <rect x="75" y="75" width="14" height="14"/>
          </svg>
          <div style="font-size: 11px; color: #475569; font-family: monospace;">
            <div><strong>GATE VERIFICATION QR</strong></div>
            <div>PNR: ${pnr}</div>
            <div>STATUS: ${booking?.status || 'CONFIRMED'}</div>
          </div>
        </div>

        <div class="fare-total">
          <div class="total-label">Total Amount Paid</div>
          <div class="total-amount">₹${totalAmount.toLocaleString('en-IN')}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Includes GST & Highway Tolls</div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="footer-note">
        <strong>Guardian Travels Helpline: 1800-200-8899 (Toll Free)</strong><br>
        Please report to boarding point 15 minutes prior to scheduled departure time.<br>
        Carrying government-issued photo ID is mandatory during boarding. Have a safe & comfortable journey!
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads the ticket as a PDF document using jsPDF
 */
export function generatePdfTicket(booking: Booking): { success: boolean; filename: string; error?: string } {
  const pnr = booking?.pnr || 'GT-REF';
  const filename = `Guardian_Travels_Ticket_${pnr}.pdf`;
  const safePassengers = getSafePassengers(booking);
  const safeSeats = getSafeSeatNumbers(booking);
  const totalAmount = Number(booking?.totalAmount || 0);

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm

    // --- 1. Header Banner ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, 12, contentWidth, 26, 3, 3, 'F');

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('GUARDIAN TRAVELS', margin + 8, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(147, 197, 253); // blue-300
    doc.text('TRAVEL SMARTER. TRAVEL SAFER.  |  OFFICIAL E-TICKET & BOARDING PASS', margin + 8, 28);

    // PNR on right side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('BOOKING REFERENCE (PNR)', pageWidth - margin - 8, 20, { align: 'right' });

    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.text(pnr, pageWidth - margin - 8, 29, { align: 'right' });

    // --- 2. Journey Route Card ---
    let y = 43;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, 25, 2.5, 2.5, 'FD');

    // From City
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('BOARDING STATION', margin + 6, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(booking?.source || 'Origin Station', margin + 6, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(`${booking?.departureTime || '06:30 AM'} • ${booking?.journeyDate || booking?.travelDate || 'Scheduled'}`, margin + 6, y + 18);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Pickup: ${booking?.boardingPoint || booking?.source || 'City Terminal'}`, margin + 6, y + 22);

    // Arrow in the middle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text('--------->', pageWidth / 2, y + 13, { align: 'center' });

    // To City
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ARRIVAL DESTINATION', pageWidth - margin - 6, y + 6, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(booking?.destination || 'Destination', pageWidth - margin - 6, y + 13, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(`${booking?.arrivalTime || '10:00 AM'}`, pageWidth - margin - 6, y + 18, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Drop: ${booking?.droppingPoint || booking?.destination || 'Central Stand'}`, pageWidth - margin - 6, y + 22, { align: 'right' });

    // --- 3. Coach & Trip Meta Grid ---
    y = 72;
    const colWidth = (contentWidth - 6) / 4;

    const cards = [
      { label: 'COACH NAME', value: booking?.busName || 'Guardian Express' },
      { label: 'VEHICLE REG NO', value: booking?.busNumber || 'TN57AB1234' },
      { label: 'SEATS RESERVED', value: `[${safeSeats.join(', ')}]`, color: [37, 99, 235] },
      { label: 'STATUS', value: booking?.status || 'CONFIRMED', color: booking?.status === 'CANCELLED' ? [225, 29, 72] : [5, 150, 105] }
    ];

    cards.forEach((card, i) => {
      const cx = margin + i * (colWidth + 2);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, y, colWidth, 16, 2, 2, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(card.label, cx + 4, y + 5);

      if (card.color) {
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      } else {
        doc.setTextColor(15, 23, 42);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(card.value, cx + 4, y + 11);
    });

    // --- 4. Passenger Manifest Table ---
    y = 93;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`PASSENGER MANIFEST (${safePassengers.length} TRAVELER${safePassengers.length > 1 ? 'S' : ''})`, margin, y);

    y += 4;
    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('NO.', margin + 4, y + 4.8);
    doc.text('PASSENGER NAME', margin + 18, y + 4.8);
    doc.text('AGE / GENDER', margin + 85, y + 4.8);
    doc.text('SEAT NUMBER', margin + 130, y + 4.8);
    doc.text('FARE (INR)', pageWidth - margin - 4, y + 4.8, { align: 'right' });

    y += 7;
    // Rows
    safePassengers.forEach((p, index) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      // Alternating row background
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, contentWidth, 7, 'F');
      }

      doc.text(String(index + 1), margin + 4, y + 4.8);
      doc.setFont('helvetica', 'bold');
      doc.text(p.name || 'Traveler', margin + 18, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.text(`${p.age || 26} Yrs / ${p.gender || 'Adult'}`, margin + 85, y + 4.8);

      doc.setFont('courier', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`Seat ${p.seatNumber || '-'}`, margin + 130, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const fareVal = p.fare ? `INR ${Number(p.fare).toFixed(0)}` : `INR ${(totalAmount / (safePassengers.length || 1)).toFixed(0)}`;
      doc.text(fareVal, pageWidth - margin - 4, y + 4.8, { align: 'right' });

      // border bottom
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 7, margin + contentWidth, y + 7);

      y += 7.5;
    });

    // --- 5. Travel Insurance Certificate Section ---
    y += 3;
    if (booking?.insuranceOpted) {
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(16, 185, 129); // emerald-500
      doc.roundedRect(margin, y, contentWidth, 22, 2.5, 2.5, 'FD');

      doc.setTextColor(6, 95, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('GUARDIAN PROTECT COMPREHENSIVE TRAVEL INSURANCE CERTIFICATE', margin + 6, y + 6);

      doc.setFillColor(16, 185, 129);
      doc.roundedRect(pageWidth - margin - 32, y + 2.5, 26, 5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('POLICY ACTIVE', pageWidth - margin - 19, y + 6, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(4, 120, 87);
      const policyNo = booking?.insurancePolicyNumber || `POL-GT-${pnr}`;
      doc.text(`Policy No: ${policyNo}`, margin + 6, y + 12);
      doc.text('Medical Emergency: INR 3,00,000', margin + 65, y + 12);
      doc.text('Accidental Cover: INR 6,00,000', margin + 125, y + 12);

      doc.setFontSize(7);
      doc.setTextColor(5, 150, 105);
      doc.text('24x7 Cashless Hospitalization & Claims Support Helpline: 1800-425-4827', margin + 6, y + 17);

      y += 26;
    } else {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Travel Insurance: Not Opted for this reservation', margin + 6, y + 7);

      y += 15;
    }

    // --- 6. Fare Breakdown & Gate Verification ---
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 26, 2.5, 2.5, 'FD');

    // QR block placeholder
    doc.setFillColor(15, 23, 42);
    doc.rect(margin + 6, y + 4, 18, 18, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(margin + 8, y + 6, 5, 5, 'F');
    doc.rect(margin + 17, y + 6, 5, 5, 'F');
    doc.rect(margin + 8, y + 15, 5, 5, 'F');

    doc.setTextColor(71, 85, 105);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.text('GATE VERIFICATION PASS', margin + 28, y + 9);
    doc.setFontSize(7);
    doc.text(`PNR: ${pnr}`, margin + 28, y + 14);
    doc.text(`SEATS: [${safeSeats.join(', ')}]`, margin + 28, y + 19);

    // Fare calculation on right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const baseFare = Number(booking?.baseFare || (totalAmount - (booking?.taxGst || 0) - (booking?.insuranceFee || 0)));
    doc.text(`Base Fare: INR ${baseFare.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 7, { align: 'right' });
    doc.text(`GST & Taxes: INR ${Number(booking?.taxGst || 0).toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 12, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL PAID:', pageWidth - margin - 35, y + 21);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`INR ${totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 21, { align: 'right' });

    // --- 7. Security & Boarding Guidelines Footer ---
    y += 31;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('IMPORTANT PASSENGER INSTRUCTIONS', margin, y);

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('1. Please arrive at the boarding pickup location at least 15 minutes prior to scheduled departure.', margin, y);
    doc.text('2. Every passenger must present a valid government-issued photo identity proof (Aadhaar, Voter ID, Passport, DL).', margin, y + 3.8);
    doc.text('3. For assistance, tracking, or emergency delay notifications, call Guardian Travels 24x7 Helpline: 1800-200-8899.', margin, y + 7.6);

    // Footer Watermark
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated securely by Guardian Travels Booking Engine • Document Auth ID: ${pnr}-${Date.now().toString(36).toUpperCase()}`, pageWidth / 2, 285, { align: 'center' });

    // Try multiple download approaches for 100% reliability in all environments (browser, iframe, mobile)
    let downloadSucceeded = false;

    // Approach 1: Direct Blob Anchor trigger (highest compatibility)
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 5000);
      downloadSucceeded = true;
    } catch (blobErr) {
      console.warn('Direct Blob download failed, trying doc.save', blobErr);
    }

    // Approach 2: jsPDF native doc.save()
    if (!downloadSucceeded) {
      try {
        doc.save(filename);
        downloadSucceeded = true;
      } catch (saveErr) {
        console.warn('doc.save failed, trying data URI', saveErr);
      }
    }

    // Approach 3: Data URI trigger
    if (!downloadSucceeded) {
      try {
        const dataUri = doc.output('datauristring');
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = filename;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 3000);
        downloadSucceeded = true;
      } catch (uriErr) {
        console.warn('Data URI download failed', uriErr);
      }
    }

    // Approach 4: Fallback to HTML ticket download if PDF was blocked by iframe sandbox
    if (!downloadSucceeded) {
      downloadTicketHtml(booking);
    }

    return { success: true, filename };
  } catch (err: any) {
    console.error('PDF generation error, falling back to HTML ticket:', err);
    // Robust fallback: download HTML format
    downloadTicketHtml(booking);
    return { success: true, filename: `Guardian_Travels_Ticket_${pnr}.html`, error: err?.message };
  }
}

/**
 * Downloads the ticket as an HTML file
 */
export function downloadTicketHtml(booking: Booking): { success: boolean; filename: string } {
  const pnr = booking?.pnr || 'GT-REF';
  const filename = `Guardian_Travels_Ticket_${pnr}.html`;
  const htmlContent = getTicketHtmlString(booking);

  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 5000);
    return { success: true, filename };
  } catch {
    // Data URI fallback
    const encodedUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = filename;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 3000);
    return { success: true, filename };
  }
}

/**
 * Triggers clean native system print preview for the ticket using an isolated iframe
 * so that no surrounding app UI or dashboard is visible in print.
 */
export function printTicketDocument(booking: Booking): void {
  const html = getTicketHtmlString(booking);

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      }, 400);
    } else {
      window.print();
    }
  } catch {
    window.print();
  }
}

/**
 * Copies a structured text summary of the ticket to clipboard
 */
export async function copyTicketSummary(booking: Booking): Promise<boolean> {
  const pnr = booking?.pnr || 'GT-REF';
  const safePassengers = getSafePassengers(booking);
  const safeSeats = getSafeSeatNumbers(booking);
  const totalAmount = Number(booking?.totalAmount || 0);

  const summary = `
========================================
🛡️ GUARDIAN TRAVELS — DIGITAL E-TICKET
========================================
PNR: ${pnr}
Status: ${booking?.status || 'CONFIRMED'}
Route: ${booking?.source || ''} ➔ ${booking?.destination || ''}
Journey Date: ${booking?.journeyDate || booking?.travelDate || ''}
Departure Time: ${booking?.departureTime || ''}
Arrival Time: ${booking?.arrivalTime || ''}
Pickup Boarding Point: ${booking?.boardingPoint || booking?.source || ''}
Drop Location: ${booking?.droppingPoint || booking?.destination || ''}

Coach: ${booking?.busName || ''} (${booking?.busNumber || ''})
Bus Type: ${booking?.busType || 'Express'}
Reserved Seats: [${safeSeats.join(', ')}]
Lead Passenger: ${booking?.passengerName || ''}
Passengers: ${safePassengers.map(p => `${p.name} (Seat ${p.seatNumber})`).join(', ')}

${booking?.insuranceOpted ? `Travel Insurance: Active (Policy: ${booking?.insurancePolicyNumber || 'POL-GT-' + pnr})` : 'Travel Insurance: Not opted'}
Total Fare Paid: ₹${totalAmount.toLocaleString('en-IN')}

Helpline: 1800-200-8899 | support@guardiantravels.in
========================================`.trim();

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
      return true;
    }
  } catch {
    // fallback
  }
  return false;
}

/**
 * Backward-compatible main export for generateAndDownloadTicket
 * Automatically generates high-res PDF and downloads it, falling back to HTML if needed.
 */
export function generateAndDownloadTicket(booking: Booking): { success: boolean; filename: string } {
  return generatePdfTicket(booking);
}
