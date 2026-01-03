export interface AmazonProduct {
  title: string;
  description: string;
  amazonLink: string;
  image: string;
}

export const AMAZON_PRODUCTS: AmazonProduct[] = [
    {
      title: "Cracking the Coding Interview",
      description: "189 Programming Questions and Solutions - Essential for tech interview preparation",
      amazonLink: "https://www.amazon.in/Cracking-Coding-Interview-Programming-Questions/dp/0984782850?=&linkCode=ll1&tag=skillhubtools-21&linkId=881b8f174c82b322e7f3c322ee7018bf&language=en_IN&ref_=as_li_ss_tl",
      image: "https://m.media-amazon.com/images/I/61mIq2iJUXL._SY425_.jpg"
    },
    {
      title: "Coding Interview Patterns",
      description: "Nail Your Next Coding Interview",
      amazonLink: "https://www.amazon.in/Handbook-Coding-Interviews-Interview-Questions/dp/B0DK5TY77X?crid=1FBRQZRG1T9SM&dib=eyJ2IjoiMSJ9.HnklbEFFVxNpr6gyoS1F-zfS6e1dPpseXqL2wHwa-MNCYwCCDM6gA3fiHFF3EvlNqxGYYj7P_ZLJ808BsMjJ06OPGjUoKm_HZay5Suzuc5zTo4px00tOLRH0Fs5yZc0pnxDgnqmKdYqCrQ4RBMA72mA9oCym8Ew4VFGqCZMNq6OhYbn-xFKz69WlEMRavtwESteKbrPJUGLtR7_8OBAh673u94o5zemt_4_isekiTqs.OVWVK8m0qU1qyGz0hhK6GX3nWuEu9LlElbFN4UDRNZs&dib_tag=se&keywords=interview+solve+coding&qid=1767446277&s=books&sprefix=interview+solve+codin%2Cstripbooks%2C351&sr=1-3&linkCode=ll1&tag=skillhubtools-21&linkId=5b25b601004d329cc39f8b728a690861&language=en_IN&ref_=as_li_ss_tl",
      image: "https://m.media-amazon.com/images/I/71qfxvZ52OL._SY385_.jpg"
    },
    {
      title: "What Color Is Your Parachute?",
      description: "Your Guide to a Lifetime of Meaningful Work and Career Success",
      amazonLink: "https://www.amazon.in/Coding-Interview-Patterns-Greyscale-Indian/dp/9398874067?crid=141UHW8TR1BSA&dib=eyJ2IjoiMSJ9.HnklbEFFVxNpr6gyoS1F-zfS6e1dPpseXqL2wHwa-MNCYwCCDM6gA3fiHFF3EvlNqxGYYj7P_ZLJ808BsMjJ05iw4pzU0BOI5_bXbGiPSKEnxRvK_njv7ISPVLdaGtLZ4VlpHzcyukTkoTIZ6IKi6bh0oxInXxSI4oQ0-op3M1fJWqCvDCRCAzKjhsUU5IP89yTaGL0WO1QpFhKp7ltPPr3u94o5zemt_4_isekiTqs.Sul-FtFZl_0ZJCcivxwrwUBRzSS4mrXfVYWzsygPyIU&dib_tag=se&keywords=interview+solve+coding&qid=1767446351&s=books&sprefix=interview+solve+coding%2Cstripbooks%2C346&sr=1-5&linkCode=ll1&tag=skillhubtools-21&linkId=a0bb21a5fbe0f26b673950e5c462e6c5&language=en_IN&ref_=as_li_ss_tl",
      image: "https://m.media-amazon.com/images/I/41dMzaaCGSL.jpg"
    },
    {
      title: "ZEBRONICS Wireless Mouse",
      description: "ZEBRONICS Blanc Slim Wireless Mouse with Rechargeable",
      amazonLink: "https://www.amazon.in/ZEBRONICS-Launched-Rechargeable-Operation-Multicolor/dp/B0CQRNWJM2?crid=359KOIJM42DGU&dib=eyJ2IjoiMSJ9.vq8kuIQsmUIaz9QmRfXztzCOWhp3LqGT2MJNrK6TQiRcDYWWWso7kQMGct-r_fyu7Tq6Q-fkbtKEHEZi3wRNCcJXnq3IbWl7BI0nW57ts2Bxn_z6QRlyq7BNvvFC_W8obd2LcD5mx9fZYakNYLojjm8SyCqp5DBr_beeVue64FwBCiSPxza459hlwbUbssBEOlx-RwY2HhfhZIJTQats7b_ll5oAZAaRntKQV0h3vSU.Mz1mLcrLGbe3iIV3HZ45jGaooaOl0RTnm0nuWz62XB0&dib_tag=se&keywords=wireless%2Bmouse&qid=1767446421&s=books&sprefix=wireless%2Bmouse%2B%2Cstripbooks%2C357&sr=1-7-catcorr&th=1&linkCode=ll1&tag=skillhubtools-21&linkId=0ed4cb728e1d1c41caf57d0b80b16fae&language=en_IN&ref_=as_li_ss_tl",
      image: "https://m.media-amazon.com/images/I/51vMo-pHZ5L._SX522_.jpg"
    },
    {
      title: "Boat Airdopes",
      description: "Boat Airdopes Joy, 35Hrs Battery, Fast Charge, IWP Tech, Low Latency, 2Mic ENx, Type-C Port, v5.3 Bluetooth Earbuds, TWS Ear Buds Wireless Earphones with mic(Jet Black)",
      amazonLink: "https://www.amazon.in/boAt-Airdopes-Alpha-Wireless-Earbuds/dp/B0C3ZYFZ77?crid=2EOHJ0OAFGCHL&dib=eyJ2IjoiMSJ9.AfB-TiV-lw3iDlxm1wEt_9BrqLBjyjN6rnpl3dToXN_39K5Cp7dJv8CymGcFjpTvtbFG0-jSFRS6D6rfC6i3BIeAFOVcpmgVumoiA6_MXGPDAJjL1U2rbAEiyojLcz5B_ZDiTN9AZjVR1-RWnP8GD3W3R2PDuC6zMrqnBH1CHDPg5g1tCI0HOGd2-oO28HwgIdm0fx2un5-A8qfctXNqlpCT7Bh-wK4YfhxUaVk5Kkw.5sMFQdwg439hL2enRggpN1DspICoNWPH8ZP-eU_QPiw&dib_tag=se&keywords=ear%2Bbud&qid=1767446507&sprefix=ear%2Bbu%2Caps%2C376&sr=8-3&th=1&linkCode=ll1&tag=skillhubtools-21&linkId=96417c00af86144106b66bb3414ed4f0&language=en_IN&ref_=as_li_ss_tl",
      image: "https://m.media-amazon.com/images/I/512jrg8-68L._SX522_.jpg"
    },
    {
      title: "NOVOO 11 in 1 USB C Hub Dual HDMI VGA Gigabit",
      description: "NOVOO 11 in 1 USB C Hub Dual HDMI VGA Gigabit Ethernet 100W PD 2 * 3.0 USB Ports,2 * 2.0 USB Ports USB C Adapter Thunderbolt 3 Dock Compatible for MacBook and Other USB C Laptop",
      amazonLink: "https://www.amazon.in/NOVOO-Gigabit-Ethernet-Thunderbolt-Compatible/dp/B09ZQPQ3N8?_encoding=UTF8&pd_rd_w=WiRoU&content-id=amzn1.sym.c7856867-7399-4487-8ea1-2895e0decba2%3Aamzn1.symc.96b8365e-3b12-433f-a173-648d41788658&pf_rd_p=c7856867-7399-4487-8ea1-2895e0decba2&pf_rd_r=7DAMCRVD4H1PJWJNXK33&pd_rd_wg=twQAM&pd_rd_r=d1f05015-15a5-435a-91a0-6a2d8729920e&th=1&linkCode=ll1&tag=skillhubtools-21&linkId=10d0bf03caf51adfa3b7da8ae149e40c&language=en_IN&ref_=as_li_ss_tl",
      image: "https://m.media-amazon.com/images/I/61Me-xeAXbL._SX522_.jpg"
    }
  ];

// Get specific products for each page
export const getProductsForPage = (page: 'home' | 'jobsearch' | 'resume') => {
  switch (page) {
    case 'home':
      return [AMAZON_PRODUCTS[0], AMAZON_PRODUCTS[1]]; // Interview prep books
    case 'jobsearch':
      return [AMAZON_PRODUCTS[2], AMAZON_PRODUCTS[3]]; // Work tools
    case 'resume':
      return [AMAZON_PRODUCTS[4], AMAZON_PRODUCTS[5]]; // Tech tools & career guide
    default:
      return [];
  }
};
