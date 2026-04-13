// 1 USD Conversion Rates
const RATES = {
  YER: 530, // Example adjustment requested by user (10 USD = 5300 YER)
  SAR: 3.75
};

export function getCurrencyDisplays(usdAmount) {
  const amount = parseFloat(usdAmount) || 0;
  const yer = amount * RATES.YER;
  const sar = amount * RATES.SAR;

  return {
    usd: `${Math.round(yer)} ر.ي`, 
    yer: `${Math.round(yer)} ريال يمني`,
    sar: `${sar.toFixed(2)} ريال سعودي`,
    combined: `${Math.round(yer)} ريال يمني`
  };
}
