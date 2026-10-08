import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    const merchantCode = 'DS35894';
    const apiKey = '7df0c7c17a6838e0944554f2c5c265d8';
    const nominalTotal = Math.round(Number(body.amount) || 15000);
    const durasi = Number(body.durasiHari) || 7;
    const productTitle = body.productTitle || 'Produk UMKM Warga';
    const planName = `Slot Iklan Sponsor (${durasi} Hari) - ${productTitle}`;
    const customerName = body.customerName || 'Pelaku Usaha Warga';
    const customerEmail = body.customerEmail || 'iklan@rthub.id';
    const customerPhone = body.customerPhone || '085155163110';
    const methodCode = body.paymentMethodCode || 'SP'; // SP = QRIS

    const merchantOrderId = `ADS-${Date.now()}`;
    const signature = crypto
      .createHash('md5')
      .update(`${merchantCode}${merchantOrderId}${nominalTotal}${apiKey}`)
      .digest('hex');

    const payload = {
      merchantCode,
      paymentAmount: nominalTotal,
      paymentMethod: methodCode,
      merchantOrderId,
      productDetails: planName,
      email: customerEmail,
      phoneNumber: customerPhone,
      customerVaName: customerName,
      itemDetails: [
        {
          name: planName,
          price: nominalTotal,
          quantity: 1,
        },
      ],
      customerDetail: {
        firstName: customerName,
        lastName: '',
        email: customerEmail,
        phoneNumber: customerPhone,
      },
      callbackUrl: 'https://api.rthub.id/api/payment/duitku/callback',
      returnUrl: 'https://rthub.id/payment-success',
      signature,
      expiryPeriod: 1440,
    };

    const duitkuRes = await fetch('https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await duitkuRes.json();
    if (result && result.statusCode === '00') {
      return res.status(200).json({
        success: true,
        merchantOrderId,
        reference: result.reference,
        paymentUrl: result.paymentUrl,
        vaNumber: result.vaNumber,
        qrString: result.qrString,
        amount: nominalTotal,
        paymentMethod: methodCode,
        statusCode: result.statusCode,
        message: `Invoice iklan sponsor Rp ${nominalTotal.toLocaleString('id-ID')} (${durasi} hari) berhasil diterbitkan via Duitku Sandbox.`,
      });
    }

    return res.status(400).json({
      message: `Gagal membuat checkout Duitku Sandbox: ${result?.statusMessage || result?.statusCode || 'Respon tidak valid'}`,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}
