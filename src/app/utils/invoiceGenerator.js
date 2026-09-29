import html2canvas from 'html2canvas';

function numberToWords(num) {
  var a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  var integerPart = Math.floor(num || 0);
  var decimalPart = Math.round(((num || 0) - integerPart) * 100);

  function convert(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  var word = 'Rupees ' + (convert(integerPart) || 'Zero');
  if (decimalPart > 0) word += ' and ' + convert(decimalPart) + ' Paise';
  return word + ' Only';
}

// ─── Normalize order fields from ALL callers ────────────────────────────────
function normalizeOrder(order) {
  var rawItems = order.items || order.order_items || order.cart || [];
  if (!rawItems || rawItems.length === 0) rawItems = [];

  var items = rawItems.map(function(i) {
    return {
      name:  i.name || i.title || i.product_name || (i.products && i.products.name) || 'Crockery Item',
      qty:   i.qty  || i.quantity || 1,
      price: i.price || i.selling_price || i.mrp || 0,
      mrp:   i.mrp || i.price || 0,
      gst:   (i.gst !== undefined && i.gst !== null && i.gst !== '') ? parseFloat(i.gst) : 0,
      hsn:   i.hsn || '',
      sku:   i.sku || '',
      id:    i.id || i.product_id || ''
    };
  });

  var addrRaw = order.shippingAddress || order.shipping_address;
  var addrStr = '';
  if (typeof addrRaw === 'string') {
    addrStr = addrRaw;
  } else if (addrRaw && addrRaw.raw_text) {
    addrStr = addrRaw.raw_text;
  } else if (addrRaw) {
    addrStr = [addrRaw.street, addrRaw.area, addrRaw.city, addrRaw.state].filter(Boolean).join(', ');
  } else {
    addrStr = 'Jaipur, Rajasthan';
  }

  return {
    orderNum:      order.order_number || order.id || 'RECEIPT',
    date:          order.created_at   || order.date || new Date().toISOString(),
    custName:      order.customerName || order.customer_name || 'Retail Customer',
    custPhone:     order.customerPhone || order.guest_phone || 'N/A',
    addrStr:       addrStr,
    items:         items,
    shipping:      Number(order.shipping || order.shipping_charge || 0),
    discount:      Number(order.discount || order.discount_amount || 0),
    paymentMode:   order.payment_mode || order.paymentMode || 'UPI Online',
    // Stored totals from DB — used as fallback when items can't be loaded
    storedTotal:   Number(order.total || order.final_total || 0),
    storedSubtotal:Number(order.subtotal || order.total_mrp || 0),
    storedTax:     Number(order.tax_amount || order.gstAmount || 0)
  };
}

export var generateInvoicePDF = async function(order) {
  if (!order) return;

  var o = normalizeOrder(order);

  // ── Compute totals from items ──────────────────────────────────────────────
  var totalTaxable = 0;
  var totalGst     = 0;
  var gstBreakdownMap = {};
  var hasItems = o.items.length > 0;

  var itemsTableRows = '';

  if (hasItems) {
    itemsTableRows = o.items.map(function(item, idx) {
      var taxable = item.price * item.qty;
      var gstAmt  = taxable * (item.gst / 100);
      totalTaxable += taxable;
      totalGst     += gstAmt;

      var rateKey = String(item.gst);
      if (!gstBreakdownMap[rateKey]) {
        gstBreakdownMap[rateKey] = { rate: item.gst, taxableSum: 0, gstSum: 0 };
      }
      gstBreakdownMap[rateKey].taxableSum += taxable;
      gstBreakdownMap[rateKey].gstSum     += gstAmt;

      return '<tr style="border-bottom:1px solid #e2e8f0;">'
        + '<td style="padding:10px 8px;text-align:center;font-size:12px;color:#64748b;">' + (idx + 1) + '</td>'
        + '<td style="padding:10px 8px;font-size:12px;color:#1e293b;font-weight:600;word-wrap:break-word;max-width:220px;">' + item.name + '</td>'
        + '<td style="padding:10px 8px;text-align:center;font-size:12px;color:#64748b;">' + (item.hsn || '&#8211;') + '</td>'
        + '<td style="padding:10px 8px;text-align:center;font-size:12px;color:#1e293b;">' + item.qty + '</td>'
        + '<td style="padding:10px 8px;text-align:right;font-size:12px;color:#1e293b;">&#8377;' + item.price.toFixed(2) + '</td>'
        + '<td style="padding:10px 8px;text-align:center;font-size:12px;color:#64748b;">' + item.gst + '%</td>'
        + '<td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b;">&#8377;' + gstAmt.toFixed(2) + '</td>'
        + '<td style="padding:10px 8px;text-align:right;font-size:12px;color:#1e293b;font-weight:600;">&#8377;' + (taxable + gstAmt).toFixed(2) + '</td>'
        + '</tr>';
    }).join('');
  }

  // ── FALLBACK: If no items but stored totals exist, use them ────────────────
  var gstRounded, grandTotal;
  if (hasItems) {
    gstRounded = Math.round(totalGst * 100) / 100;
    grandTotal = totalTaxable + gstRounded + o.shipping - o.discount;
  } else {
    // Use database-stored values — always recompute grand total since
    // older orders may have stored final_total without GST
    totalTaxable = o.storedSubtotal;
    gstRounded   = o.storedTax;
    totalGst     = o.storedTax;
    grandTotal   = totalTaxable + gstRounded + o.shipping - o.discount;
  }

  // ── Build GST breakdown HTML ───────────────────────────────────────────────
  var gstBreakdownHtml = '';
  if (hasItems) {
    var rates = Object.keys(gstBreakdownMap).sort(function(a, b) { return parseFloat(a) - parseFloat(b); });
    rates.forEach(function(rateKey) {
      var entry = gstBreakdownMap[rateKey];
      var label = entry.rate === 0
        ? 'GST Exempt'
        : entry.rate + '% GST (CGST ' + (entry.rate / 2) + '% + SGST ' + (entry.rate / 2) + '%)';
      gstBreakdownHtml += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">'
        + '<span style="color:#475569;">' + label + '</span>'
        + '<span style="color:#0f172a;font-weight:600;">'
        + (entry.rate === 0 ? '&#8377;0.00' : '+ &#8377;' + entry.gstSum.toFixed(2))
        + '</span></div>';
    });
  } else if (gstRounded > 0) {
    gstBreakdownHtml = '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">'
      + '<span style="color:#475569;">GST (from order record)</span>'
      + '<span style="color:#0f172a;font-weight:600;">+ &#8377;' + gstRounded.toFixed(2) + '</span></div>';
  } else {
    gstBreakdownHtml = '<div style="font-size:12px;color:#94a3b8;">No tax breakdown available</div>';
  }

  // ── Conditional rows ───────────────────────────────────────────────────────
  var shippingRow = o.shipping > 0
    ? '<div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:8px;"><span>Shipping Fee</span><span>+ &#8377;' + o.shipping.toFixed(2) + '</span></div>'
    : '';
  var discountRow = o.discount > 0
    ? '<div style="display:flex;justify-content:space-between;font-size:13px;color:#10b981;margin-bottom:8px;"><span>Discount Applied</span><span>- &#8377;' + o.discount.toFixed(2) + '</span></div>'
    : '';

  var orderDateStr = new Date(o.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // ── Items table or "no items" message ──────────────────────────────────────
  var itemsSection = '';
  if (hasItems) {
    itemsSection = '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">'
      + '<thead><tr style="background:#1e3a8a;">'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:center;font-weight:600;">S.No</th>'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:left;font-weight:600;">Item / Description</th>'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:center;font-weight:600;">HSN</th>'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:center;font-weight:600;">Qty</th>'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:right;font-weight:600;">Rate (&#8377;)</th>'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:center;font-weight:600;">GST</th>'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:right;font-weight:600;">Tax (&#8377;)</th>'
      + '<th style="padding:10px 8px;color:white;font-size:11px;text-align:right;font-weight:600;">Total (&#8377;)</th>'
      + '</tr></thead><tbody>' + itemsTableRows + '</tbody></table>';
  } else {
    itemsSection = '<div style="padding:20px;background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;margin-bottom:20px;text-align:center;font-size:13px;color:#92400e;">'
      + '<strong>Item details not available for this order.</strong><br/>'
      + 'Totals shown below are from the order record.'
      + '</div>';
  }

  // ── Build full HTML ────────────────────────────────────────────────────────
  var html = ''
    + '<div style="height:10px;background:linear-gradient(90deg,#1e3a8a,#2563eb);width:100%;"></div>'
    + '<div style="padding:35px 40px;background-color:#ffffff;">'

    // HEADER
    + '<div style="display:flex;justify-content:space-between;margin-bottom:25px;">'
    + '<div>'
    + '<h1 style="margin:0;color:#1e3a8a;font-size:26px;font-weight:800;letter-spacing:-0.5px;">ORIENT CROCKERIES</h1>'
    + '<p style="margin:4px 0 0 0;color:#64748b;font-size:12px;">Premium Crockery, Glassware &amp; Kitchenware</p>'
    + '</div>'
    + '<div style="text-align:right;">'
    + '<div style="font-size:20px;font-weight:800;color:#0f172a;">TAX RECEIPT</div>'
    + '<div style="color:#10b981;font-size:11px;font-weight:700;margin-top:2px;">Original for Recipient</div>'
    + '</div>'
    + '</div>'

    // STORE + META
    + '<div style="display:flex;justify-content:space-between;padding:15px 0;border-top:2px solid #e2e8f0;border-bottom:2px solid #e2e8f0;margin-bottom:20px;">'
    + '<div style="color:#475569;font-size:11px;line-height:1.7;">'
    + '<strong style="color:#1e293b;">ORIENT CROCKERIES</strong><br/>'
    + '22, Industrial Area, Patel Nagar, Geejgarh Vihar Colony<br/>'
    + 'Bais Godam, Jaipur, Rajasthan &#8211; 302006<br/>'
    + 'GSTIN: 08AAAAA0000A1Z5 &nbsp;|&nbsp; PAN: AAAAA0000A<br/>'
    + 'Phone: +91-93145 00229 &nbsp;|&nbsp; Email: sales@orientcrockery.in'
    + '</div>'
    + '<div style="text-align:right;font-size:11px;line-height:1.7;">'
    + '<div style="margin-bottom:4px;"><span style="color:#64748b;">Receipt No: </span><strong style="color:#1e293b;">' + o.orderNum + '</strong></div>'
    + '<div style="margin-bottom:4px;"><span style="color:#64748b;">Date: </span><strong style="color:#1e293b;">' + orderDateStr + '</strong></div>'
    + '<div><span style="color:#64748b;">Payment: </span><strong style="color:#1e293b;">' + o.paymentMode + '</strong></div>'
    + '</div>'
    + '</div>'

    // BILLED TO + STORE INFO
    + '<div style="display:flex;gap:30px;margin-bottom:25px;">'
    + '<div style="flex:1;border-left:3px solid #1e3a8a;padding-left:12px;">'
    + '<div style="color:#1e3a8a;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">Billed To</div>'
    + '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:3px;">' + o.custName + '</div>'
    + '<div style="color:#64748b;font-size:11px;line-height:1.6;">Mobile: ' + o.custPhone + '<br/>Address: ' + o.addrStr + '<br/>GSTIN: Unregistered (Consumer)</div>'
    + '</div>'
    + '<div style="flex:1;border-left:3px solid #1e3a8a;padding-left:12px;">'
    + '<div style="color:#1e3a8a;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">Store &amp; Sales Info</div>'
    + '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:3px;">Orient Crockery &#8211; Main Store</div>'
    + '<div style="color:#64748b;font-size:11px;line-height:1.6;">Salesperson: Online Store Counter 01<br/>Customer Type: Retail Consumer<br/>Channel: Orient Web Store</div>'
    + '</div>'
    + '</div>'

    // ITEMS TABLE or FALLBACK MESSAGE
    + itemsSection

    // GST BREAKDOWN + TOTALS
    + '<div style="display:flex;gap:25px;margin-bottom:25px;">'
    + '<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:15px;">'
    + '<div style="font-size:12px;font-weight:700;color:#1e3a8a;margin-bottom:10px;text-transform:uppercase;">GST Breakdown</div>'
    + gstBreakdownHtml
    + '<div style="border-top:1px solid #cbd5e1;padding-top:8px;margin-top:8px;display:flex;justify-content:space-between;font-size:12px;font-weight:700;"><span style="color:#1e293b;">Total Tax</span><span style="color:#1e293b;">&#8377;' + gstRounded.toFixed(2) + '</span></div>'
    + '</div>'
    + '<div style="flex:1;">'
    + '<div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:8px;"><span>Taxable Value</span><span style="font-weight:600;color:#0f172a;">&#8377;' + totalTaxable.toFixed(2) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:8px;"><span>Total Tax</span><span>+ &#8377;' + gstRounded.toFixed(2) + '</span></div>'
    + shippingRow
    + discountRow
    + '<div style="background:#1e3a8a;color:white;padding:12px 15px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;margin-top:12px;">'
    + '<span style="font-size:14px;font-weight:600;">Grand Total</span>'
    + '<span style="font-size:18px;font-weight:700;">&#8377;' + grandTotal.toFixed(2) + '</span>'
    + '</div>'
    + '</div>'
    + '</div>'

    // AMOUNT IN WORDS
    + '<div style="padding:15px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;margin-bottom:20px;">'
    + '<span style="font-size:12px;color:#1e3a8a;font-weight:700;">Amount in Words: </span>'
    + '<span style="font-size:12px;color:#0f172a;font-weight:600;">' + numberToWords(grandTotal) + '</span>'
    + '</div>'

    // TERMS + SIGNATORY
    + '<div style="display:flex;justify-content:space-between;padding-top:15px;border-top:1px solid #e2e8f0;">'
    + '<div style="font-size:10px;color:#94a3b8;line-height:1.6;">'
    + '1. Goods once sold are subject to store return/exchange policy.<br/>'
    + '2. Please check items carefully before leaving store.<br/>'
    + '3. This is a computer-generated tax receipt.'
    + '</div>'
    + '<div style="text-align:right;">'
    + '<div style="font-size:11px;font-weight:700;color:#1e293b;">For ORIENT CROCKERIES</div>'
    + '<div style="font-size:10px;color:#94a3b8;margin-top:25px;">Authorised Signatory</div>'
    + '</div>'
    + '</div>'

    + '</div>'
    + '<div style="background:#f1f5f9;padding:8px 0;text-align:center;font-size:10px;color:#64748b;font-weight:600;">Powered by Orient Crockeries &#8226; Premium Tableware &amp; Kitchenware</div>';

  // ── Render to PNG ──────────────────────────────────────────────────────────
  var container = document.createElement('div');
  container.style.position       = 'absolute';
  container.style.left           = '-9999px';
  container.style.top            = '-9999px';
  container.style.width          = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily      = 'Arial, Helvetica, sans-serif';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    var canvas = await html2canvas(container, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
    });
    var dataUrl = canvas.toDataURL('image/png');
    var link    = document.createElement('a');
    link.download = 'Invoice_Orient_' + o.orderNum + '.png';
    link.href     = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error generating image receipt:', err);
    alert('Failed to generate receipt. Please try again.');
  } finally {
    document.body.removeChild(container);
  }
};
