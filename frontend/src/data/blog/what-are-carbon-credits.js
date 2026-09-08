
import howToSellHeroImg from '../../assets/HowToSellHero.png';
import whatAreCCHeroImg from '../../assets/WhatAreCChero.png';

export const whatAreCarbonCreditsBlogPost = {
  id: 'what-are-carbon-credits',
  category: 'carbon-markets',
  categoryLabel: 'Carbon Markets',
  title: 'Carbon Credits Explained: What They Are, How They Work & Why They Matter',
  subtitle: 'One carbon credit equals one tonne of CO₂ kept out of the atmosphere. Simple to define  harder to prove. Here is how carbon credits actually work, who buys them, and why verification decides everything.',
  excerpt:
    'A carbon credit is a certificate for one tonne of CO₂ reduced or removed. But behind that one sentence sits an entire industry of measurement, verification and trust. This guide explains what carbon credits are, how they are created, the difference between compliance and voluntary markets, how they work in India (ICM/CCTS), and why "high-integrity" credits command a premium.',
  metaDescription:
    'What are carbon credits? A carbon credit equals one tonne of CO₂ reduced or removed. Learn how carbon credits work, compliance vs voluntary markets, carbon credits in India (ICM/CCTS), types, pricing and verification  a complete 2026 guide.',
  date: 'July 5, 2026',
  lastModified: 'July 5, 2026',
  readTime: '14 min read',
  wordCount: 2600,
  featured: false,

  image: whatAreCCHeroImg,
  heroImage: whatAreCCHeroImg,
  author: 'Sylithe Research',

  primaryKeyword: 'what are carbon credits',
  secondaryKeywords: [
    'carbon credits meaning',
    'carbon credits definition',
    'how do carbon credits work',
    'carbon credits in india',
    'compliance vs voluntary carbon credits',
    'carbon credit verification',
    'carbon credit price',
  ],

  relatedLinks: [
    { text: 'Voluntary vs Compliance Carbon Markets in India', slug: 'voluntary-vs-compliance-carbon-india' },
    { text: 'Verra & the Indian Carbon Market: How They Align', slug: 'verra-icm-alignment' },
    { text: 'Integrity Is the Only Currency in Carbon Credits', slug: 'high-integrity-carbon-credits-icvcm-ccps' },
    { text: 'Nature-Based Solutions in India: The Scale Opportunity', slug: 'nature-based-solutions-india-scale' },
  ],

  tags: ['Carbon Credits', 'Education', 'India', 'ICM', 'CCTS', 'Voluntary Carbon Market', 'MRV', 'Verra', 'Gold Standard'],

  essentialFindings: [
    { label: 'One carbon credit = one tonne of CO₂e reduced or removed.', text: 'It is a tradable certificate proving a measurable climate benefit  either an avoided emission or a removal from the atmosphere.' },
    { label: 'Two markets exist: compliance and voluntary.', text: 'Compliance markets are created by law (like India’s CCTS); voluntary markets let companies buy credits by choice to meet net-zero goals.' },
    { label: 'A credit is only as good as its measurement.', text: 'Every credit depends on additionality, an accurate baseline, permanence and leakage checks  verified through MRV.' },
    { label: 'India now has a formal compliance market (ICM/CCTS).', text: 'Governed by the Bureau of Energy Efficiency, alongside a large voluntary market for nature-based projects (ARR, REDD+, agroforestry).' },
    { label: 'Price depends on quality, not just quantity.', text: 'High-integrity, well-verified credits sell at a premium; poorly verified credits face repricing and reputational risk.' },
    { label: 'Verification (MRV) is the deciding factor.', text: 'Satellite-based digital MRV (dMRV) makes credits cheaper to verify and far harder to over-issue  the foundation of trust.' },
  ],

  content: [
    {
      type: 'bold-statement',
      text: 'A **[[carbon credit|what-are-carbon-credits]]** is a promise, backed by evidence: one tonne of carbon dioxide, kept out of the atmosphere or pulled back from it. The definition is simple. Proving it is the entire industry.',
    },
    {
      type: 'quick-answer',
      text: 'If you have heard the term "**[[carbon credit|what-are-carbon-credits]]**" and found the explanations either too vague or drowning in jargon, this guide is for you. We will build the concept from the ground up  what a credit actually is, how one gets created and verified, who buys them and why, how the market works in India specifically, and how to tell a high-quality credit from a worthless one.',
      label: 'The Big Picture'
    },
    {
      type: 'paragraph',
      text: 'By the end, you will understand not just the definition, but the thing that actually matters: a **[[carbon credit|what-are-carbon-credits]]** is only worth what its measurement can prove. That single idea explains why prices vary so widely, why the market had a crisis of confidence, and why verification technology has become the centre of gravity for the whole industry.',
    },

    { type: 'heading', level: 2, text: 'What Is a **[[Carbon Credit|what-are-carbon-credits]]**, Exactly?', id: 'definition' },
    {
      type: 'paragraph',
      text: 'A **[[carbon credit|what-are-carbon-credits]]** (sometimes called a carbon offset) is a tradable certificate that represents one metric tonne of carbon dioxide equivalent (CO₂e) that has been either prevented from being emitted, or actively removed from the atmosphere. "Equivalent" matters because other greenhouse gases  methane, nitrous oxide  are converted into their CO₂-warming equivalent, so everything is measured in one common unit.',
    },
    {
      type: 'callout',
      title: 'The one-line definition',
      text: '1 **[[carbon credit|what-are-carbon-credits]]** = 1 tonne of CO₂e reduced or removed, measured, verified and issued by a recognised standard. Once retired against a company’s emissions, that credit cannot be used again.',
    },
    {
      type: 'image',
      src: howToSellHeroImg,
      alt: 'How to Sell Carbon Credits',
    },
    {
      type: 'paragraph',
      text: 'There are two fundamentally different ways to earn a credit, and confusing them is the single most common mistake. An avoidance/reduction credit is earned by stopping an emission that would otherwise have happened  for example, protecting a forest that was about to be cut down (REDD+). A removal credit is earned by actively taking CO₂ out of the air  for example, planting new trees that absorb carbon as they grow (Afforestation/Reforestation/Revegetation, or ARR). Buyers increasingly prefer removals, because the climate benefit is more tangible and easier to prove.',
    },

    { type: 'heading', level: 2, text: 'How a **[[Carbon Credit|what-are-carbon-credits]]** Is Created', id: 'how-created' },
    {
      type: 'paragraph',
      text: 'A credit does not appear the moment a tree is planted. It travels through a rigorous lifecycle designed to guarantee that the tonne it represents is real, additional and permanent. Skip any step, and the credit loses its **[[integrity|high-integrity-carbon-credits-icvcm-ccps]]**.',
    },
    {
      type: 'step-list',
      items: [
        { label: 'Project Design', text: 'A developer defines the activity (e.g. afforestation on degraded land) and selects a methodology under a standard such as Verra VCS or Gold Standard.' },
        { label: 'Baseline & Additionality', text: 'They prove what would have happened without the project (the baseline) and that the project is additional  it would not have occurred anyway.' },
        { label: 'Measurement (MRV)', text: 'Carbon stored or avoided is measured through Monitoring, Reporting and Verification  increasingly using satellites and AI rather than manual field surveys.' },
        { label: 'Independent Verification', text: 'A third-party auditor (a Validation & Verification Body) checks the claims against the methodology.' },
        { label: 'Issuance', text: 'The registry issues credits  one per verified tonne  into a serialised account so each is unique and trackable.' },
        { label: 'Retirement', text: 'A buyer purchases and "retires" the credit against their emissions. Retired credits are permanently removed from circulation.' },
      ],
    },
    {
      type: 'highlight',
      title: 'The four integrity tests',
      text: 'Every credible credit must pass four tests: **[[Additionality|additionality-carbon-credits-explained]]** (would it have happened anyway?), Baseline accuracy (is the counterfactual honest?), Permanence (will the carbon stay stored?), and Leakage (did the activity just push emissions elsewhere?). A credit that fails any of these is a credit you should not buy.',
    },

    { type: 'heading', level: 2, text: 'Compliance vs Voluntary: The Two Markets', id: 'two-markets' },
    {
      type: 'paragraph',
      text: 'People say "the carbon market" as if it were one thing. It is two. Understanding the split is essential because the rules, buyers and prices are completely different.',
    },
    {
      type: 'comparison-cards',
      items: [
        { label: 'Compliance Market', title: 'Mandated by law', text: 'Governments cap emissions and require regulated entities to surrender allowances or credits. Participation is legally required. In India this is the Carbon Credit Trading Scheme (CCTS), governed by the Bureau of Energy Efficiency.' },
        { label: 'Voluntary Market', title: 'Driven by choice', text: 'Companies buy credits voluntarily to meet net-zero and ESG commitments, offset unavoidable emissions, or support climate action. Standards like Verra VCS and Gold Standard dominate here. This is where most nature-based (ARR, REDD+, agroforestry) credits trade.' },
      ],
    },
    {
      type: 'paragraph',
      text: 'The two markets increasingly overlap. India’s compliance market (**[[CCTS|ccts-rewriting-esg]]**) is being designed to work alongside the voluntary market, and global corporate buyers pull demand into both. For a project developer in India, the practical question is which pathway  compliance or voluntary  best fits the project type and buyer base.',
    },

    { type: 'heading', level: 2, text: '**[[Carbon Credits|what-are-carbon-credits]]** in India (ICM & **[[CCTS|ccts-rewriting-esg]]**)', id: 'india' },
    {
      type: 'paragraph',
      text: 'India has moved decisively from being mainly a supplier to the global voluntary market toward having its own formal, regulated carbon market. The Indian Carbon Market (ICM) framework and the **[[Carbon Credit|what-are-carbon-credits]]** Trading Scheme (**[[CCTS|ccts-rewriting-esg]]**), administered under the Bureau of Energy Efficiency, establish a domestic compliance mechanism with defined obligations, trading and registry infrastructure.',
    },
    {
      type: 'paragraph',
      text: 'At the same time, India remains one of the most important sources of nature-based carbon projects in the world  afforestation and reforestation (ARR), avoided deforestation (REDD+), agroforestry, mangrove and blue-carbon restoration, and improved land management. These projects typically list under Verra VCS or Gold Standard for the voluntary market, and many are aligned to the ICM as the domestic framework matures.',
    },
    {
      type: 'callout',
      title: 'Why India matters',
      text: 'India combines vast restorable land, millions of smallholder and community landholdings, and rising corporate net-zero demand. That makes it one of the highest-potential  and highest-scrutiny  carbon markets on earth. **[[Integrity|high-integrity-carbon-credits-icvcm-ccps]]** and verification are what will decide whether that potential is realised.',
    },

    { type: 'heading', level: 2, text: 'The Main Types of **[[Carbon Credits|what-are-carbon-credits]]**', id: 'types' },
    {
      type: 'paragraph',
      text: 'Not all credits are created the same way. The most common categories relevant to India’s land sector are:',
    },
    {
      type: 'why-it-matters',

      items: [
        'ARR (Afforestation, Reforestation & Revegetation): planting or regenerating trees on non-forest land  a removal activity (Verra VM0047).',
        'REDD+ (Reducing Emissions from Deforestation & Degradation): protecting existing forest that is under threat  an avoidance activity.',
        'Agroforestry: integrating trees into farmland, sequestering carbon while improving farmer livelihoods.',
        'Blue carbon: restoring mangroves and coastal ecosystems, which store exceptional amounts of carbon in soil and biomass.',
        'Soil & biochar: increasing soil organic carbon or locking carbon into stable biochar.',
        'Improved Forest Management (IFM): changing management of existing forest to increase carbon stocks.',
      ],

      title: 'Why It Matters'
    },

    { type: 'heading', level: 2, text: 'How Are **[[Carbon Credits|what-are-carbon-credits]]** Priced?', id: 'pricing' },
    {
      type: 'paragraph',
      text: 'There is no single "**[[carbon credit|what-are-carbon-credits]]** price". A credit’s value depends on the project type, the standard it is issued under, the co-benefits it delivers (biodiversity, community impact), the vintage (year it was issued), and  above all  the credibility of its verification. A well-verified nature-based removal credit with strong co-benefits can trade at many times the price of an old, thinly verified avoidance credit.',
    },
    {
      type: 'highlight',
      title: 'Quality is the price signal',
      text: 'After the **[[integrity|high-integrity-carbon-credits-icvcm-ccps]]** controversies of recent years, buyers no longer pay for volume alone. They pay for proof. Two credits that both claim "one tonne" can trade at wildly different prices purely because one is backed by transparent, high-resolution measurement and the other is not.',
    },

    { type: 'heading', level: 2, text: 'Why Verification (MRV) Decides Everything', id: 'mrv' },
    {
      type: 'paragraph',
      text: 'Every problem the carbon market has faced  over-crediting, phantom credits, collapsed baselines  traces back to weak measurement. If you cannot precisely and independently measure how much carbon a project stored, you cannot know how many credits it deserves. Traditional MRV relied on infrequent, expensive field surveys that were easy to game and hard to audit.',
    },
    {
      type: 'paragraph',
      text: '**[[Digital MRV|nature-based-carbon-projects-ai-digital-mrv]]** (**[[dMRV|nature-based-carbon-projects-ai-digital-mrv]]**) changes the economics. By combining high-resolution satellite imagery, geospatial intelligence and AI, projects can be monitored continuously, at scale, with results that are transparent and reproducible. That is how the market rebuilds trust  not with more promises, but with better evidence.',
    },
    {
      type: 'callout',
      title: 'Where Sylithe fits',
      text: 'Sylithe is a satellite-powered **[[dMRV|nature-based-carbon-projects-ai-digital-mrv]]** platform for **[[carbon credit|what-are-carbon-credits]]** verification. It takes projects from land eligibility and land-cover analysis through to audit-ready measurement of canopy, biomass, baselines and permanence  for ARR, REDD+ and agroforestry projects across India. Better measurement, lower cost, higher-**[[integrity|high-integrity-carbon-credits-icvcm-ccps]]** credits.',
    },

    {
      type: 'paragraph',
      text: 'So  what are **[[carbon credits|what-are-carbon-credits]]**? Certificates for a tonne of climate benefit. But the more useful answer is this: a **[[carbon credit|what-are-carbon-credits]]** is a claim, and its worth is set entirely by how well that claim can be proven. Understand measurement, and you understand the market.',
    },
  ],

  faq: [
    {
      question: 'What is a carbon credit in simple terms?',
      answer: 'A carbon credit is a certificate that represents one tonne of carbon dioxide equivalent (CO₂e) that has been reduced or removed from the atmosphere. Companies buy and "retire" credits to compensate for their own emissions.',
    },
    {
      question: 'What is the difference between a carbon credit and a carbon offset?',
      answer: 'The terms are often used interchangeably. Technically, a carbon offset is the action of compensating for an emission by funding a reduction elsewhere, and a carbon credit is the tradable certificate that represents one tonne of that reduction or removal.',
    },
    {
      question: 'How do carbon credits work in India?',
      answer: 'India has a compliance market  the Carbon Credit Trading Scheme (CCTS) under the Indian Carbon Market framework, administered by the Bureau of Energy Efficiency  alongside a large voluntary market where nature-based projects (ARR, REDD+, agroforestry) are typically certified under Verra VCS or Gold Standard.',
    },
    {
      question: 'How much does a carbon credit cost?',
      answer: 'There is no single price. It depends on the project type, standard, vintage, co-benefits and, above all, the quality of verification. High-integrity, well-verified removal credits command a significant premium over older, weakly verified credits.',
    },
    {
      question: 'Are carbon credits legitimate?',
      answer: 'Carbon credits are legitimate when they are additional, backed by an honest baseline, permanent, free of leakage, and independently verified. Weak measurement is what causes low-quality credits  which is why satellite-based digital MRV (dMRV) is becoming the standard for trustworthy credits.',
    },
    {
      question: 'What makes a high-quality carbon credit?',
      answer: 'Additionality, an accurate baseline, permanence, no leakage, real co-benefits, and transparent, independent measurement. The stronger and more transparent the MRV behind a credit, the higher its integrity  and usually its price.',
    },
  ],
};
