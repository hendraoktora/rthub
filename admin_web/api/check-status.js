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

  const merchantOrderId =
    req.query?.merchantOrderId ||
    req.body?.merchantOrderId ||
    req.query?.orderId;

  if (!merchantOrderId) {
    return res.status(400).json({ message: 'Parameter merchantOrderId wajib diisi' });
  }

  try {
    const merchantCode = 'D24902';
    const apiKey = '9c5f5c48f3cfb2013eedba2372360a94';
    const signature = crypto
      .createHash('md5')
      .update(`${merchantCode}${merchantOrderId}${apiKey}`)
      .digest('hex');

    const duitkuRes = await fetch('https://passport.duitku.com/webapi/api/merchant/transactionStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantCode,
        merchantOrderId,
        signature,
      }),
    });

    const result = await duitkuRes.json();

    const isPaid = result && result.statusCode === '00';
    const isPending = result && result.statusCode === '01';

    return res.status(200).json({
      success: true,
      merchantOrderId,
      statusCode: result?.statusCode,
      statusMessage: result?.statusMessage,
      isPaid,
      isPending,
      raw: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}
