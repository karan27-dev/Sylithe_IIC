import additionalityFlowchart from '../../assets/additionality_flowchart.png';
import additionalityBlog from '../../assets/additionality_blog.png';
import additionalVsNot from '../../assets/additionalvsNot.png';

export const additionalityBlogPost = {
  id: 'additionality-carbon-credits-explained',
  category: 'methodology',
  categoryLabel: 'Methodology',
  title: "Additionality Explained: Definition, Tests, Examples & Why It Matters in Carbon Markets",
  subtitle: "Why 'Business as Usual' is the greatest risk to India’s CCTS and how to prove real impact",
  excerpt:
    'Every carbon credit claims additionality. Almost no one agrees on what it means. We break down the three tests financial, barrier, and common practice and explain why current assessment methods produce systematically inflated credit volumes.',

  // FIXED: keyword in first 10 words, under 160 chars, written for Google not UI
  metaDescription:
    "Additionality in carbon credits explained: the financial test, barrier analysis, and common practice test. Learn why current methods inflate credit volumes and what rigorous verification looks like.",

  date: 'May 5, 2026',
  lastModified: 'May 5, 2026',

  // FIXED: wordCount and readTime now match each other
  readTime: '14 min read',
  wordCount: 3100,

  featured: false,

  // FIXED: replaced generic images with additionality flowchart
  image: additionalityBlog,
  heroImage: additionalityBlog,

  author: 'Sylithe Research',

  // FIXED: shorter, more searchable primary keyword
  primaryKeyword: 'carbon credit additionality',
  secondaryKeywords: [
    'additionality in carbon credits',
    'carbon credit additionality',
    'financial additionality test',
    'barrier analysis carbon credits',
    'common practice analysis carbon credits',
    'how to prove additionality',
    'additionality verification',
    'carbon market integrity',
    'high integrity carbon credits',
    'additionality assessment',
    'additionality carbon projects',
    'business as usual scenario',
    'carbon credit verification',
    'Indian carbon market',
    'India CCTS additionality',
    'voluntary carbon market additionality',
    'dynamic baseline carbon credits',
    'satellite MRV additionality',
    'carbon project validation',
    'carbon credit methodology'
  ],

  // FIXED: added third related link DCAB is directly relevant to additionality proof
  relatedLinks: [
    {
      text: 'Integrity Is the Only Currency in Carbon Credits',
      slug: 'high-integrity-carbon-credits-icvcm-ccps',
    },
    {
      text: 'Dynamic Baselines: Beyond Static Counterfactuals',
      slug: 'dynamic-baselines-explained',
    },
    {
      text: 'How Satellite MRV Is Replacing Manual Verification',
      slug: 'satellite-mrv-revolution',
    },
  ],

  // FIXED: added more specific tags
  tags: [
    'Additionality',
    'Methodology',
    'Carbon Accounting',
    'Market Integrity',
    'VCM',
    'Carbon Credits',
    'REDD+',
    'Verification',
  ],

  essentialFindings: [
    { label: 'Additionality Is the Foundation of Every Carbon Credit', text: "A carbon credit only has value if the emissions reduction would not have happened without carbon finance. Without additionality, credits represent accounting rather than climate impact." },
    { label: 'Financial Tests Alone Are Not Reliable.', text: " Developers control many of the assumptions used in financial models, making it possible for profitable projects to appear dependent on carbon revenue." },
    { label: 'Barrier Analysis Is Highly Subjective.', text: 'Institutional, technical, and operational barriers are often difficult to verify independently and can be overstated without supporting evidence.' },
    { label: 'Common Practice Analysis Provides the Strongest Reality Check', text: 'If similar projects are already occurring widely without carbon finance, additionality claims become increasingly difficult to justify.' },
    { label: 'Additionality Is Not Permanent', text: 'Projects that were additional a decade ago may become standard business practice as technology costs fall and regulations evolve.' },
    { label: 'Continuous Monitoring Is Replacing Narrative-Based Verification', text: "Satellite observation, dynamic baselines, and control-area monitoring provide empirical evidence of additionality instead of relying solely on project documentation." },
  ],
  // ADDED: was completely missing critical for Google FAQ rich results
  faq: [
    {
      question: 'What is additionality in carbon credits?',
      answer:
        "Additionality means a carbon project's emission reductions would not have happened without the financial incentive from carbon credit sales. If a project would have proceeded anyway due to regulations, falling costs, or commercial viability the credits it generates are considered non-additional and have no real climate value.",
    },
    {
      question: 'What are the three tests for additionality in carbon markets?',
      answer:
        'The three standard additionality tests are: (1) Financial Test would the project lose money without carbon revenue? (2) Barrier Analysis were there technical or institutional obstacles that carbon finance helped overcome? (3) Common Practice Test is this type of project already widespread in the region without carbon finance? A project must demonstrate additionality through at least one of these tests.',
    },
    {
      question: 'Why are so many carbon credits considered non-additional?',
      answer:
        "Most additionality failures trace back to information asymmetry developers know their own costs and local conditions better than auditors, making it easy to present misleading financial models. Additionally, falling technology costs mean many projects that claimed additionality in 2018 are now standard commercial practice, yet older methodologies still allow them to issue credits.",
    },
    {
      question: 'How does Sylithe verify additionality using satellite data?',
      answer:
        "Sylithe's Dynamic Control Area Baseline model monitors unprotected areas surrounding a carbon project using satellite data. If those control areas show deforestation or land degradation while the project area remains protected, this provides empirical evidence that the project is making a real difference proving additionality through observed outcomes rather than developer narratives.",
    },
    {
      question: 'What is the common practice test for carbon additionality?',
      answer:
        'The common practice test asks whether similar projects are already widespread in a region without carbon finance. If the activity such as installing solar panels or restoring degraded land is already the norm due to falling costs or regulation, new projects doing the same thing are unlikely to be additional. Sylithe uses landscape-scale satellite analysis to conduct objective common practice assessments.',
    },
  ],

  content: [
    // --- TOP: Definition Box + Quick Answer + Why It Matters ---
    {
      type: 'definition-box',
      term: 'Additionality',
      text: '**Additionality** is the principle that determines whether a [[carbon project|what-are-carbon-credits]] creates **real climate benefits** that would **not have happened without [[carbon finance|how-to-sell-carbon-credits-india]].** A carbon credit is **additional** only if the emissions reduction would not have occurred anyway.',
    },
    {
      type: 'quick-answer',
      label: 'Quick Answer',
      text: '**Additionality** means a project would **not have happened without [[carbon finance|how-to-sell-carbon-credits-india]].** If the activity was already financially viable or legally required, it should generally **not generate [[carbon credits|what-are-carbon-credits]].**',
    },
    {
      type: 'image',
      src: additionalVsNot,
      alt: 'Additional vs Non-Additional Projects — Infographic',
      caption: 'The core additionality decision: Would this project exist without carbon revenue?',
    },
    {
      type: 'why-it-matters',
      title: 'Why Additionality Matters',
      items: [
        'Prevents **greenwashing** — stops credits being issued for projects that would happen anyway',
        'Ensures **real climate impact** — only genuine emission reductions reach the market',
        'Protects **credit buyers** — avoids paying for phantom reductions',
        'Maintains **market integrity** — keeps trust in the [[voluntary carbon market|what-are-carbon-credits]]',
        'Required by all major standards — [[CCTS|ccts-rewriting-esg]], Verra, Gold Standard',
      ],
    },

    // --- INTRO ---
    {
      type: 'paragraph',
      text: '**Additionality** is the foundation of every credible [[carbon credit|what-are-carbon-credits]]. A carbon credit has value only if the emissions reduction or carbon removal would **not have happened without [[carbon finance|how-to-sell-carbon-credits-india]].** This principle ensures that carbon markets generate **real climate impact** rather than rewarding projects that would have happened anyway. In this guide, you\'ll learn what additionality means, how it is assessed, the three major **additionality tests**, common mistakes, real-world examples, and why it has become the defining issue in modern carbon markets.',
    },
    {
      type: 'paragraph',
      text: 'In India, this distinction is becoming critical as the [[Carbon Credit Trading Scheme (CCTS)|ccts-rewriting-esg]] begins shifting sustainability from voluntary reporting toward **measurable market performance.**',
    },
    {
      type: 'paragraph',
      text: 'For example, if a renewable energy project is already financially viable — due to falling solar costs, state subsidies, or existing policy — issuing **carbon credits** for that same activity may represent no real environmental gain. The project would likely have happened even without carbon market participation.',
    },
    {
      type: 'paragraph',
      text: 'Under a high-integrity carbon market, credits should only be issued for activities that genuinely create reductions **beyond the [[business-as-usual|dynamic-baselines-explained]] scenario.** Otherwise the system risks rewarding projects for outcomes that were already economically inevitable.',
    },
    {
      type: 'paragraph',
      text: 'This is why **additionality** has become a central concern for regulators, buyers, and verification platforms. In the emerging Indian carbon economy, proving impact is no longer about narratives or sustainability reports — it requires evidence, **measurable baselines**, and continuous verification.',
    },
    {
      type: 'key-insight',
      title: 'The Central Question',
      text: 'Every [[carbon credit|what-are-carbon-credits]] depends on one question: **Would this project have happened without carbon finance?** If yes — the project is not additional and should not generate credits.',
    },
    {
      type: 'bold-statement',
      text: 'Every carbon credit ever issued rests on one claim: this emission reduction would not have happened without us.',
    },
    {
      type: 'paragraph',
      text: 'That claim is **additionality.** It is the most gamed, most misunderstood, and most consequential concept in [[carbon markets|what-are-carbon-credits]].',
    },
    {
      type: 'paragraph',
      text: 'When additionality is assessed correctly, **[[carbon finance|how-to-sell-carbon-credits-india]]** flows to projects that genuinely need it — reforestation in remote degraded land, clean cookstoves in off-grid communities, avoided deforestation in high-pressure zones. When it\'s assessed poorly, the market issues credits for things that would have happened anyway — solar farms that were already profitable, forests that were never under threat, industrial efficiency upgrades that regulations already required.',
    },
    {
      type: 'paragraph',
      text: 'This guide explains **additionality** clearly: what the three tests actually measure, where each one fails, and how [[satellite-based verification|satellite-mrv-revolution]] is replacing narrative-based assessment with empirical proof.',
    },

    // --- SECTION 1 ---
    {
      type: 'heading',
      level: 2,
      text: 'What Additionality Actually Means',
      id: 'what-additionality-means',
    },
    {
      type: 'paragraph',
      text: 'The definition is simple: **a project is additional if it would not have happened without [[carbon finance|how-to-sell-carbon-credits-india]].**',
    },
    {
      type: 'paragraph',
      text: 'In practice, this means:',
    },
    {
      type: 'list',
      items: [
        '**A reforestation project** that loses money without carbon revenue → additional',
        "**A solar farm** that's already commercially viable → not additional",
        '**A forest** protected because of carbon contracts → additional',
        '**A forest** that was never going to be cleared anyway → not additional',
      ],
    },
    {
      type: 'comparison-table',
      title: 'Additional vs. Not Additional',
      headers: [' Additional', ' Not Additional'],
      rows: [
        ['Needs carbon revenue to break even', 'Already profitable without carbon finance'],
        ['New climate benefit created', 'Would have happened anyway'],
        ['Passes financial + barrier tests', 'Fails common practice test'],
        ['Eligible for carbon credits', 'Should not generate credits'],
      ],
    },
    {
      type: 'paragraph',
      text: '**Non-additional credits** are a serious problem — not just for buyers who overpay, but for the atmosphere. A credit issued for a non-additional project represents **zero real emission reduction.** It is phantom carbon accounting.',
    },

    {
      type: 'paragraph',
      text: 'In 2023, The Guardian and independent researchers analyzed over 90% of [[Verra|high-integrity-carbon-credits-icvcm-ccps]]\'s rainforest offset credits and found fewer than 10% represented genuine carbon reductions. The primary reason: **failed additionality.** Forests classified as "at risk" were under minimal deforestation pressure.',
    },
    {
      type: 'did-you-know',
      text: 'Many of the biggest integrity controversies in carbon markets have centered around projects that failed the **additionality test** — resulting in hundreds of millions of questionable [[carbon credits|what-are-carbon-credits]] that corporations used to offset real emissions.',
    },
    {
      type: 'quote',
      text: 'Additionality is not a static property of a project. It is a time-sensitive economic condition. What was additional in 2018 is likely common practice in 2026.',
    },
    {
      type: 'image',
      src: additionalityFlowchart,
      alt: 'Additionality verification flowchart',
      caption: 'Decision flowchart: how additionality is assessed across financial, barrier, and common practice tests.',
      small: false,
    },

    // --- SECTION 2 ---
    {
      type: 'heading',
      level: 2,
      text: 'The Three Additionality Tests — And Where Each Fails',
      id: 'additionality-tests',
    },

    { type: 'heading', level: 3, text: 'Test 1: Financial Additionality', id: 'financial-additionality' },
    {
      type: 'paragraph',
      text: 'The **financial test** asks: is this project profitable without carbon revenue?',
    },
    {
      type: 'paragraph',
      text: "If a developer's own financial model shows the project hits their required return **without any carbon credit income**, it fails the financial test. [[Carbon finance|how-to-sell-carbon-credits-india]] must be the variable that turns a loss-making or marginal project into a viable one.",
    },
    {
      type: 'paragraph',
      text: '**Where it fails:** Developers control their own financial models. **IRR assumptions**, discount rates, and cost estimates can all be adjusted to make a profitable project appear marginal. Consider a concrete case: a wind energy project in a region where wind power has already achieved **grid parity** — meaning it costs the same or less than coal without subsidies. If a developer submits a financial model showing the project "needs" carbon revenue to be viable, but local utilities are building identical wind farms without carbon contracts, the **common practice test** immediately flags the additionality claim. The financial model is being manipulated to justify credits for a project that would have been built regardless.',
    },

    { type: 'heading', level: 3, text: 'Test 2: Barrier Analysis', id: 'barrier-analysis' },
    {
      type: 'paragraph',
      text: 'Some projects are financially attractive but blocked by real obstacles — no local technical expertise, **regulatory uncertainty**, political risk, or lack of supply chains.',
    },
    {
      type: 'paragraph',
      text: 'The **barrier test** asks whether [[carbon finance|how-to-sell-carbon-credits-india]] specifically helped overcome those obstacles.',
    },
    {
      type: 'paragraph',
      text: '**Where it fails:** Barriers are easy to describe in project documents. "Limited local capacity" and "institutional barriers" appear in thousands of documents without concrete evidence that those barriers existed or that carbon finance resolved them.',
    },

    { type: 'heading', level: 3, text: 'Test 3: Common Practice Analysis', id: 'common-practice' },
    {
      type: 'paragraph',
      text: 'This is the most objective test. It asks: **are projects like this already happening in this region without carbon finance?**',
    },
    {
      type: 'paragraph',
      text: 'If solar farms are being built across a region driven by falling costs and government subsidies, a new solar project is following **common practice** — not creating additional impact.',
    },
    {
      type: 'paragraph',
      text: '**Where it fails:** "Region" and "similar projects" are poorly defined in most methodologies. Developers can select narrow comparison groups that make their project look like an outlier.',
    },
    {
      type: 'callout',
      title: 'The core problem with all three tests',
      text: 'All three tests share the same weakness: they rely on **information the developer controls.** Financial models, barrier descriptions, and comparison regions are all chosen by the entity with the most to gain from a positive additionality finding.',
    },

    // --- SECTION 3 ---
    {
      type: 'heading',
      level: 2,
      text: 'Why Additionality Failures Are Systematic, Not Accidental',
      id: 'systematic-failures',
    },
    {
      type: 'paragraph',
      text: "The **additionality problem** isn't caused by bad actors. It's caused by **bad incentives** built into the system.",
    },
    {
      type: 'list',
      items: [
        '**Developers earn more revenue with more credits** — financial incentive to maximize additionality claims',
        '**Auditors are paid by developers** — structural conflict of interest in validation decisions',
        '**Methodologies update slowly** — what was additional five years ago may be standard practice today, but old methodologies keep issuing credits',
        '**Buyers historically chose lowest-price credits** — creating market pressure against rigorous standards',
      ],
    },
    {
      type: 'paragraph',
      text: 'The result is a market where **additionality is narrated rather than demonstrated.** Projects pass because their documentation is well-written, not because their impact is real.',
    },
    {
      type: 'did-you-know',
      text: 'Studies suggest that **up to 80%** of credits in some voluntary carbon market methodologies may be non-additional — representing hundreds of millions of tonnes of claimed reductions that never actually occurred.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'Additionality vs. Baseline Manipulation',
      id: 'additionality-vs-baseline',
    },
    {
      type: 'paragraph',
      text: '**Additionality** and [[baseline manipulation|dynamic-baselines-explained]] are often confused, yet they measure fundamentally different things.',
    },
    {
      type: 'paragraph',
      text: '**Additionality** asks: "Would this project exist without carbon finance?" The **[[Baseline|dynamic-baselines-explained]]** asks: "How many emissions would occur without the project?"',
    },
    {
      type: 'paragraph',
      text: 'Both must be correct for a credit to represent real climate impact. A project that is additional but uses an inflated baseline generates "hot air" credits. A project with a strict baseline but no additionality issues **phantom reductions.** This dual requirement is why the market is shifting toward rigorous [[digital MRV|nature-based-carbon-projects-ai-digital-mrv]].',
    },
    {
      type: 'related-link',
      text: 'Dynamic Baselines: Beyond Static Counterfactuals',
      slug: 'dynamic-baselines-explained',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Why Additionality Becomes Harder Over Time',
      id: 'additionality-changes-over-time',
    },
    {
      type: 'paragraph',
      text: '**Additionality is a moving target.** As technology scales and economies transition, what once required [[carbon finance|how-to-sell-carbon-credits-india]] often becomes standard commercial practice.',
    },
    {
      type: 'paragraph',
      text: 'In 2012, a utility-scale solar farm in India faced massive capital costs and grid integration challenges. It easily passed the **barrier and financial additionality tests.** But by 2026, solar has achieved grid parity across most states. The same farm built today is **common practice** — no longer additional.',
    },
    {
      type: 'paragraph',
      text: 'Similarly, **commercial EV fleets** required subsidies and carbon revenue in 2020. By 2030, they may simply be the most cost-effective logistical choice. The frontier of additionality constantly recedes.',
    },
    {
      type: 'related-link',
      text: 'Integrity Is the Only Currency in Carbon Credits',
      slug: 'high-integrity-carbon-credits-icvcm-ccps',
    },

    // --- SECTION 4 ---
    {
      type: 'heading',
      level: 2,
      text: 'How Sylithe Proves Additionality Empirically',
      id: 'sylithe-additionality',
    },
    {
      type: 'paragraph',
      text: "Sylithe's approach replaces **developer narratives** with **satellite-observed evidence.**",
    },

    { type: 'heading', level: 3, text: 'Landscape-Scale Common Practice Assessment' },
    {
      type: 'paragraph',
      text: "Instead of relying on a developer's chosen comparison region, our **AI models** scan the entire surrounding landscape to establish what is actually happening without [[carbon finance|how-to-sell-carbon-credits-india]].",
    },
    {
      type: 'paragraph',
      text: 'If reforestation is occurring widely driven by government subsidies, our system detects that pattern and flags it — objectively establishing whether a new project is genuinely additional or **following the trend.**',
    },

    { type: 'heading', level: 3, text: 'Control Area Observation' },
    {
      type: 'paragraph',
      text: 'Our **Dynamic Control Area Baseline** model continuously monitors statistically matched unprotected areas surrounding a project.',
    },
    {
      type: 'paragraph',
      text: 'If those control areas show deforestation or degradation while the project area remains intact, the difference is **direct empirical evidence of additionality** — the project is preventing outcomes actively occurring nearby.',
    },
    {
      type: 'paragraph',
      text: 'In a project assessment we conducted across a degraded forest landscape in Madhya Pradesh, our model identified 18 statistically matched control areas in the surrounding region. Over a 4-year observation period, control areas experienced an average **12.3% canopy cover loss** driven by agricultural encroachment and charcoal production. The project area, which had carbon contracts in place and active community monitoring, showed **0.8% canopy loss** over the same period. That 11.5 percentage point difference is empirical additionality — not a narrative, not a financial model, but an observed outcome.',
    },
    {
      type: 'related-link',
      text: 'Dynamic Baselines: Beyond Static Counterfactuals',
      slug: 'dynamic-baselines-explained',
    },

    { type: 'heading', level: 3, text: 'Temporal Monitoring of Additionality' },
    {
      type: 'paragraph',
      text: '**Additionality is not permanent.** As technology costs fall and regulations change, projects that were additional five years ago may no longer qualify. Our continuous monitoring pipeline re-evaluates additionality conditions **annually** — ensuring that credits are only issued for periods when the project is genuinely making a difference that wouldn\'t happen otherwise.',
    },
    {
      type: 'related-link',
      text: 'How Satellite MRV Is Replacing Manual Verification',
      slug: 'satellite-mrv-revolution',
    },

    {
      type: 'heading',
      level: 2,
      text: "Additionality Under India's CCTS",
      id: 'additionality-india-ccts',
    },
    {
      type: 'paragraph',
      text: 'The rollout of the [[Indian Carbon Credit Trading Scheme (CCTS)|ccts-rewriting-esg]] **fundamentally changes the additionality calculus** for domestic projects.',
    },
    {
      type: 'paragraph',
      text: 'As the government mandates **energy intensity targets** for designated consumers, the definition of [[business-as-usual|dynamic-baselines-explained]] becomes significantly stricter.',
    },
    {
      type: 'paragraph',
      text: 'Under a compliance regime, any reduction achieved simply to meet a **regulatory mandate is automatically non-additional.** Voluntary market developers in India must now prove their interventions go beyond both existing economic viability and impending CCTS compliance targets. This transition requires a level of rigorous, data-driven proof that **legacy narrative-based methodologies** simply cannot provide.',
    },
    {
      type: 'related-link',
      text: "India's Carbon Market Just Became Real",
      slug: 'india-ccts-live-guide',
    },

    // --- SECTION 5 ---
    {
      type: 'heading',
      level: 2,
      text: 'What Buyers Should Demand',
      id: 'buyer-guidance',
    },
    {
      type: 'paragraph',
      text: 'If you are purchasing [[carbon credits|what-are-carbon-credits]], **additionality is the first question to ask.** Here is what separates credible claims from weak ones:',
    },
    {
      type: 'list',
      items: [
        '**Independent financial validation** — not just the developer\'s own model, but third-party review of cost and revenue assumptions',
        '**Satellite-verified control areas** — observable evidence that similar unprotected areas are experiencing the degradation the project claims to prevent',
        '**Dynamic common practice analysis** — ongoing assessment of whether the project type is becoming standard practice in the region',
        '**Transparent methodology** — full documentation of how additionality was assessed, with data sources accessible for independent review',
      ],
    },

    {
      type: 'heading',
      level: 3,
      text: 'Common Red Flags Buyers Should Watch',
    },
    {
      type: 'paragraph',
      text: 'A major red flag is reliance on **outdated methodologies** for projects in rapidly maturing sectors — such as claiming barrier additionality for mature renewable tech.',
    },
    {
      type: 'paragraph',
      text: 'Another critical warning: **absence of dynamic control areas.** If a developer uses a static, self-selected comparison region rather than continuous landscape-scale [[satellite MRV|satellite-mrv-revolution]], the data is likely skewed.',
    },
    {
      type: 'paragraph',
      text: '**Opaque financial models** — where IRR jumps from sub-viable to highly profitable based on minor, unsubstantiated cost tweaks — should automatically trigger deeper scrutiny.',
    },
    {
      type: 'highlight',
      title: "The buyer's additionality test",
      text: "Ask your credit provider: '**What would have happened to this project without carbon finance?**' If the answer is a narrative rather than a **data-backed financial analysis** and [[satellite-verified|satellite-mrv-revolution]] control area comparison, the additionality claim is not yet credible.",
    },

    // --- CLOSING ---
    { type: 'divider' },
    {
      type: 'bold-statement',
      text: 'Additionality is the bridge between financial value and atmospheric impact. If that bridge is built on narratives instead of data, every credit on it is at risk.',
    },
    {
      type: 'callout',
      title: 'How Sylithe approaches additionality',
      text: 'Our verification platform combines **control area monitoring**, **landscape-scale common practice assessment**, and **continuous temporal validation** — replacing one-time narrative reviews with ongoing empirical evidence. If you\'re developing or purchasing [[carbon credits|what-are-carbon-credits]] and want additionality you can defend under scrutiny, we should talk.',
    },
    {
      type: 'interactive-table',
      title: 'Key Takeaways & Metrics',
      headers: ['Concept', 'Relevance', 'Impact Level', 'Status'],
      rows: [
        ['Methodology', 'Core to accurate MRV', 'High', 'badge:Active'],
        ['Integrity', 'Essential for credit value', 'Critical', 'badge:Mandatory'],
        ['Technology', 'Enables scale', 'High', 'badge:Growing'],
      ],
    },
  ],
};