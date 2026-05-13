// Define your JSON object with main titles and subtitles
const data = {
  "mainTitles": [
    "Men's Health",
    "Women's Health",
    "Sexual & Reproductive Health",
    "Weight Management",
    "Mental Health",
    "Skin Conditions",
    "General Health & Wellness",
    "Prescription & Repeat Medication Services"
  ],
  "details": {
    "Men's Health": [
      "Erectile dysfunction",
      "Premature ejaculation",
      "Hair loss (male pattern baldness)",
      "Testosterone deficiency (Low T)"
    ],
    "Women's Health": [
      "Menstrual irregularities",
      "Polycystic ovary syndrome (PCOS)",
      "Menopause symptoms",
      "Contraception advice and prescriptions",
      "Vaginal infections (e.g., thrush, BV)"
    ],
    "Sexual & Reproductive Health": [
      "STI screening and treatment",
      "Genital herpes / chlamydia / gonorrhoea management",
      "Emergency contraception",
      "Fertility assessment & support"
    ],
    "Weight Management": [
      "Medical weight loss programs (e.g., GLP-1 agonists like Wegovy/Ozempic)",
      "Nutritional guidance",
      "Support for metabolic conditions like prediabetes"
    ],
    "Mental Health": [
      "Anxiety",
      "Depression",
      "Insomnia",
      "Stress management",
      "ADHD initial screening (if within your scope)"
    ],
    "Skin Conditions": [
      "Acne",
      "Eczema",
      "Psoriasis",
      "Rosacea",
      "Fungal infections",
      "Hair/scalp conditions"
    ],
    "General Health & Wellness": [
      "High blood pressure (hypertension) monitoring",
      "High cholesterol",
      "Diabetes (Type 2) early support and referral",
      "Smoking cessation",
      "Travel health & vaccinations",
      "Cold, flu, and sinus infections"
    ],
    "Prescription & Repeat Medication Services": [
      "Repeat prescriptions for stable chronic conditions",
      "Private prescriptions for specific conditions",
      "Medication reviews"
    ]
  }
};

function getSubtitlesByTitle(mainTitle) {
  return data.details[mainTitle] || "Title not found";
}

const selectedTitle = "Skin Conditions";
const subtitles = getSubtitlesByTitle(selectedTitle);

console.log(subtitles);  
