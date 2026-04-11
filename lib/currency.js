// 1 USD Conversion Rates
const RATES = {
  YER: 250, // Example adjustment requested by user (10 USD = 2500 YER)
  SAR: 3.75
};

export function getCurrencyDisplays(usdAmount) {
  const amount = parseFloat(usdAmount) || 0;
  const yer = amount * RATES.YER;
  const sar = amount * RATES.SAR;

  return {
    usd: `$${amount.toFixed(2)}`,
    yer: `${Math.round(yer)} ريال يمني`,
    sar: `${sar.toFixed(2)} ريال سعودي`,
    // Combined format: السعر: 2500 ريال يمني | 37 ريال سعودي
    combined: `${Math.round(yer)} ريال يمني | ${sar.toFixed(2)} ريال سعودي`
  };
}
