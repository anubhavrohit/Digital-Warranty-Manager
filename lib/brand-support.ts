export interface BrandSupportInfo {
  brand: string;
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  portalUrl?: string;
  hours?: string;
  claimTurnaround?: string;
}

export const BRAND_DIRECTORY: Record<string, BrandSupportInfo> = {
  apple: {
    brand: 'Apple',
    name: 'Apple Support India & Global',
    phone: '000800 1009009',
    email: 'contactus.in@apple.com',
    portalUrl: 'https://support.apple.com/en-in',
    hours: '9:00 AM – 9:00 PM (Mon-Sun)',
    claimTurnaround: '3–5 Business Days',
  },
  samsung: {
    brand: 'Samsung',
    name: 'Samsung Customer Care',
    phone: '1800 5 7267864',
    email: 'support.india@samsung.com',
    whatsapp: '91180057267864',
    portalUrl: 'https://www.samsung.com/in/support/',
    hours: '24x7 Support Available',
    claimTurnaround: '2–4 Business Days',
  },
  sony: {
    brand: 'Sony',
    name: 'Sony India Customer Care',
    phone: '1800 103 7799',
    email: 'sonyindia.care@sony.com',
    whatsapp: '918069399999',
    portalUrl: 'https://www.sony.co.in/support',
    hours: '9:00 AM – 7:30 PM (Mon-Sun)',
    claimTurnaround: '4–7 Business Days',
  },
  lg: {
    brand: 'LG',
    name: 'LG Electronics India Support',
    phone: '1800 315 9999',
    email: 'serviceindia@lge.com',
    whatsapp: '919711709999',
    portalUrl: 'https://www.lg.com/in/support',
    hours: '9:00 AM – 6:00 PM (Mon-Sat)',
    claimTurnaround: '2–3 Business Days',
  },
  dell: {
    brand: 'Dell',
    name: 'Dell Technologies Care',
    phone: '1800 425 0088',
    email: 'dell_care_india@dell.com',
    whatsapp: '919108283355',
    portalUrl: 'https://www.dell.com/support/home/en-in',
    hours: '9:00 AM – 6:00 PM (Mon-Fri)',
    claimTurnaround: 'Next Business Day Onsite',
  },
  hp: {
    brand: 'HP',
    name: 'HP India Care & Support',
    phone: '1800 258 7170',
    email: 'hpstoreindia@customerservice.team',
    whatsapp: '912261014560',
    portalUrl: 'https://support.hp.com/in-en',
    hours: '9:00 AM – 7:00 PM (Mon-Sat)',
    claimTurnaround: '3–5 Business Days',
  },
  lenovo: {
    brand: 'Lenovo',
    name: 'Lenovo Service & Support',
    phone: '1800 419 7555',
    email: 'customercare@lenovo.com',
    whatsapp: '918067916666',
    portalUrl: 'https://pcsupport.lenovo.com/in/en',
    hours: '10:00 AM – 7:00 PM (Mon-Sat)',
    claimTurnaround: '3–6 Business Days',
  },
  asus: {
    brand: 'Asus',
    name: 'Asus India Support & Service',
    phone: '1800 209 0365',
    email: 'rc_india@asus.com',
    portalUrl: 'https://www.asus.com/in/support/',
    hours: '9:00 AM – 6:00 PM (Mon-Sat)',
    claimTurnaround: '4–7 Business Days',
  },
  acer: {
    brand: 'Acer',
    name: 'Acer EasyCare Support',
    phone: '1800 11 6677',
    email: 'ail.easycare@acer.com',
    whatsapp: '919089088880',
    portalUrl: 'https://www.acer.com/in-en/support',
    hours: '9:00 AM – 6:00 PM (Mon-Sat)',
    claimTurnaround: '3–5 Business Days',
  },
  oneplus: {
    brand: 'OnePlus',
    name: 'OnePlus Customer Support',
    phone: '1800 102 8411',
    email: 'onepluscare@oneplus.com',
    whatsapp: '919289606888',
    portalUrl: 'https://www.oneplus.in/support',
    hours: '9:00 AM – 9:00 PM (All Days)',
    claimTurnaround: '2–4 Business Days',
  },
  xiaomi: {
    brand: 'Xiaomi',
    name: 'Xiaomi & Redmi Care',
    phone: '1800 103 6286',
    email: 'service.in@xiaomi.com',
    whatsapp: '918800215000',
    portalUrl: 'https://www.mi.com/in/service/online/',
    hours: '9:00 AM – 9:00 PM (All Days)',
    claimTurnaround: '2–4 Business Days',
  },
  redmi: {
    brand: 'Redmi',
    name: 'Redmi & Xiaomi Care',
    phone: '1800 103 6286',
    email: 'service.in@xiaomi.com',
    whatsapp: '918800215000',
    portalUrl: 'https://www.mi.com/in/service/online/',
    hours: '9:00 AM – 9:00 PM (All Days)',
    claimTurnaround: '2–4 Business Days',
  },
  realme: {
    brand: 'Realme',
    name: 'Realme Support Center',
    phone: '1800 102 2777',
    email: 'service.in@realme.com',
    whatsapp: '919711012388',
    portalUrl: 'https://www.realme.com/in/support',
    hours: '9:00 AM – 6:00 PM (Mon-Sun)',
    claimTurnaround: '3–5 Business Days',
  },
  boat: {
    brand: 'boAt',
    name: 'boAt Lifestyle Warranty & Care',
    phone: '022 6918 1920',
    email: 'info@imaginemarketingindia.com',
    portalUrl: 'https://support.boat-lifestyle.com',
    hours: '9:00 AM – 7:00 PM (Mon-Sat)',
    claimTurnaround: '5–7 Business Days (Courier Pickup)',
  },
  noise: {
    brand: 'Noise',
    name: 'Noise Consumer Care',
    phone: '022 4893 2012',
    email: 'help@gonoise.com',
    portalUrl: 'https://www.gonoise.com/pages/support',
    hours: '9:30 AM – 6:30 PM (Mon-Sat)',
    claimTurnaround: '5–7 Business Days',
  },
  whirlpool: {
    brand: 'Whirlpool',
    name: 'Whirlpool India Customer Care',
    phone: '1800 208 1800',
    email: 'helpdeskindia@whirlpool.com',
    whatsapp: '919667427788',
    portalUrl: 'https://www.whirlpoolindia.com/contact-us',
    hours: '8:00 AM – 8:00 PM (All Days)',
    claimTurnaround: '24–48 Hours Technician Visit',
  },
  bosch: {
    brand: 'Bosch',
    name: 'Bosch Home Appliances Care',
    phone: '1800 266 1880',
    email: 'service.in@bosch-home.com',
    whatsapp: '918451000555',
    portalUrl: 'https://www.bosch-home.in/service',
    hours: '8:30 AM – 8:00 PM (Mon-Sat)',
    claimTurnaround: '24–48 Hours Technician Visit',
  },
  dyson: {
    brand: 'Dyson',
    name: 'Dyson India Support',
    phone: '1800 258 6688',
    email: 'ask@dyson.in',
    whatsapp: '918800334888',
    portalUrl: 'https://www.dyson.in/support',
    hours: '9:00 AM – 9:00 PM (All Days)',
    claimTurnaround: '2–3 Business Days',
  },
  philips: {
    brand: 'Philips',
    name: 'Philips Consumer Support',
    phone: '1800 102 2929',
    email: 'customercare.india@philips.com',
    whatsapp: '919830022929',
    portalUrl: 'https://www.philips.co.in/c-w/support-home',
    hours: '9:00 AM – 6:00 PM (Mon-Sat)',
    claimTurnaround: '3–5 Business Days',
  },
  ikea: {
    brand: 'IKEA',
    name: 'IKEA Customer Support',
    phone: '1800 419 4532',
    email: 'customercare.india@ikea.com',
    portalUrl: 'https://www.ikea.com/in/en/customer-service/',
    hours: '9:00 AM – 9:00 PM (All Days)',
    claimTurnaround: '3–5 Business Days',
  },
  godrej: {
    brand: 'Godrej',
    name: 'Godrej SmartCare Support',
    phone: '1800 209 5511',
    email: 'smartcare@godrej.com',
    whatsapp: '919321665511',
    portalUrl: 'https://www.godrej.com/customer-service',
    hours: '8:00 AM – 8:00 PM (All Days)',
    claimTurnaround: '24–48 Hours',
  },
  voltas: {
    brand: 'Voltas',
    name: 'Voltas Customer Service',
    phone: '1860 599 4555',
    email: 'vcare@voltas.com',
    whatsapp: '919818994444',
    portalUrl: 'https://www.voltas.com/customer-care',
    hours: '8:00 AM – 8:00 PM (All Days)',
    claimTurnaround: '24–48 Hours',
  },
  canon: {
    brand: 'Canon',
    name: 'Canon Consumer Support',
    phone: '1860 180 3366',
    email: 'customer.care@canon.co.in',
    portalUrl: 'https://in.canon/en/consumer/support',
    hours: '9:30 AM – 5:30 PM (Mon-Sat)',
    claimTurnaround: '3–5 Business Days',
  },
  nikon: {
    brand: 'Nikon',
    name: 'Nikon India Support',
    phone: '1800 102 7346',
    email: 'nfindia@nikon.com',
    portalUrl: 'https://www.nikon.co.in/support',
    hours: '9:30 AM – 5:30 PM (Mon-Fri)',
    claimTurnaround: '4–7 Business Days',
  },
  amazon: {
    brand: 'Amazon',
    name: 'Amazon Customer Service',
    phone: '1800 3000 9009',
    email: 'cs-reply@amazon.in',
    portalUrl: 'https://www.amazon.in/contact-us',
    hours: '24x7 Customer Care',
    claimTurnaround: 'Instant / Replacement',
  },
  flipkart: {
    brand: 'Flipkart',
    name: 'Flipkart Help Center',
    phone: '1800 208 9898',
    email: 'support@flipkart.com',
    portalUrl: 'https://www.flipkart.com/helpcentre',
    hours: '24x7 Customer Care',
    claimTurnaround: 'Instant / Replacement',
  },
  croma: {
    brand: 'Croma',
    name: 'Croma Customer Support',
    phone: '1800 572 7662',
    email: 'customersupport@croma.com',
    portalUrl: 'https://www.croma.com/help-and-support',
    hours: '9:00 AM – 9:00 PM (All Days)',
    claimTurnaround: '2–3 Business Days',
  },
  'reliance digital': {
    brand: 'Reliance Digital',
    name: 'Reliance Digital Care',
    phone: '1800 889 1055',
    email: 'reliancedigital@ril.com',
    portalUrl: 'https://www.reliancedigital.in/content/contact-us',
    hours: '9:30 AM – 7:30 PM (All Days)',
    claimTurnaround: '2–3 Business Days',
  },
};

/**
 * Searches the brand directory for official customer support info
 */
export function getBrandSupportInfo(brandName?: string): BrandSupportInfo | null {
  if (!brandName) return null;
  const clean = brandName.toLowerCase().trim();

  // 1. Direct match
  if (BRAND_DIRECTORY[clean]) {
    return BRAND_DIRECTORY[clean];
  }

  // 2. Substring or keyword match
  for (const [key, info] of Object.entries(BRAND_DIRECTORY)) {
    if (clean.includes(key) || key.includes(clean)) {
      return info;
    }
  }

  // Fallback generic directory object
  return {
    brand: brandName,
    name: `${brandName} Authorized Service & Support`,
    portalUrl: `https://www.google.com/search?q=${encodeURIComponent(brandName + ' official warranty claim customer care contact support')}`,
    hours: 'Standard Business Hours',
    claimTurnaround: '3–7 Business Days',
  };
}

export interface ClaimLetterParams {
  productName: string;
  brand: string;
  category: string;
  purchaseDate: string;
  warrantyEndDate: string;
  warrantyStatus: string;
  serialNumber?: string;
  invoiceNumber?: string;
  store?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  defectCategory: string;
  defectDescription: string;
}

export interface GeneratedClaimLetter {
  subject: string;
  body: string;
  mailtoUrl: string;
  whatsappUrl?: string;
  supportPhone?: string;
  portalUrl?: string;
}

/**
 * Constructs a formal, legally structured warranty claim email and message
 */
export function generateClaimLetter(params: ClaimLetterParams): GeneratedClaimLetter {
  const brandInfo = getBrandSupportInfo(params.brand);
  const supportEmail = brandInfo?.email || 'support@' + params.brand.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';

  const subject = `[Warranty Claim] Service & Repair Request - ${params.brand} ${params.productName} (S/N: ${params.serialNumber || 'N/A'})`;

  const body = `To: ${brandInfo?.name || params.brand + ' Customer Care & Warranty Department'}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

SUBJECT: FORMAL WARRANTY SERVICE & CLAIM REQUEST

Dear Customer Support Team,

I am writing to formally log a warranty service claim for my ${params.brand} product under the manufacturer warranty terms.

--------------------------------------------------
PRODUCT & PURCHASE IDENTIFICATION
--------------------------------------------------
Product Name:        ${params.productName}
Brand / Make:        ${params.brand}
Category:            ${params.category}
Serial Number (S/N): ${params.serialNumber || 'N/A (Refer to attached bill)'}
Invoice / Order ID:  ${params.invoiceNumber || 'N/A (Refer to attached bill)'}
Purchased From:      ${params.store || 'Authorized Retailer'}
Date of Purchase:    ${params.purchaseDate}
Warranty Expiry:     ${params.warrantyEndDate}
Coverage Status:     ${params.warrantyStatus}

--------------------------------------------------
DEFECT & ISSUE DETAILS
--------------------------------------------------
Defect Category:     ${params.defectCategory}
Problem Summary:
${params.defectDescription}

--------------------------------------------------
REQUESTED ACTION
--------------------------------------------------
As this product is covered under the official manufacturer warranty, I kindly request:
1. Generation of an official Service Ticket / RMA Number.
2. Instructions for scheduling an authorized technician visit, free doorstep courier pickup, or the address of the nearest authorized service center.
3. Prompt inspection, repair, or replacement in accordance with the warranty terms.

I have attached a digital copy of the original purchase invoice and receipt as proof of purchase and warranty eligibility.

Thank you for your prompt assistance. I look forward to hearing from your team shortly.

Sincerely,
${params.customerName || '[Customer Name]'}
Contact Phone: ${params.customerPhone || '[Phone Number]'}
Contact Email: ${params.customerEmail || '[Email Address]'}

[Attached: Proof of Purchase / Tax Invoice]`;

  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  let whatsappUrl: string | undefined;
  if (brandInfo?.whatsapp) {
    const waText = `Hello ${params.brand} Support, I would like to raise a warranty claim for my ${params.productName} (S/N: ${params.serialNumber || 'N/A'}). Issue: ${params.defectCategory} - ${params.defectDescription.slice(0, 100)}... Invoice: ${params.invoiceNumber || 'Available'}. Please share the RMA ticket and service instructions.`;
    whatsappUrl = `https://wa.me/${brandInfo.whatsapp}?text=${encodeURIComponent(waText)}`;
  }

  return {
    subject,
    body,
    mailtoUrl,
    whatsappUrl,
    supportPhone: brandInfo?.phone,
    portalUrl: brandInfo?.portalUrl,
  };
}
