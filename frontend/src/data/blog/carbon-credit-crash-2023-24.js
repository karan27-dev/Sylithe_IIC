import marketTimelineImg from '../../assets/MarketTime.png';
import priceDeclineImg from '../../assets/Priceyears.png';
import ratingsImg from '../../assets/CCRatings.png';
import dmrvImg from '../../assets/TraditionalvsDMRV.png';
import highIntegrityImg from '../../assets/HighIntegrity.png';
import marketStackImg from '../../assets/CarbonMarket.png';
import marketCrashHeroImg from '../../assets/MarketCrash23-24.png';
export const carbonCreditCrashBlogPost = {
  id: 'carbon-credit-crash-2023-24',
  category: 'carbon-markets',
  categoryLabel: 'Carbon Markets',
  title: 'The Carbon Credit Crash of 2023–24: What Caused It and Whether the Recovery Is Real',
  subtitle: 'VCS REDD+ prices fell over 80% from peak. An honest post-mortem methodology failure, media exposure, and what the price floor looks like in 2025–26.',
  excerpt:
    "The market didn't collapse because demand disappeared. It collapsed because trust did. And trust is a data problem. A forensic timeline of the Guardian and Zeit exposé, which credit types survived, what the integrity platforms discovered, and why dMRV-backed credits avoided the worst of the selloff.",
  metaDescription:
    "Carbon credit prices crashed 80%+ in 2023–24. Learn why VCS REDD+ collapsed, which credit types held value, how BeZero and Sylvera's ratings models responded, and what the recovery looks like in 2025–26 for high-integrity credits.",
  date: 'May 14, 2026',
  lastModified: 'May 14, 2026',
  readTime: '17 min read',
  wordCount: 3400,
  featured: false,

  image: marketCrashHeroImg,
  heroImage: marketCrashHeroImg,
  author: 'Sylithe Research',

  primaryKeyword: 'carbon credit market crash 2023 REDD+',
  secondaryKeywords: [
    'VCS REDD+ price collapse 2023',
    'Guardian carbon credit investigation',
    'voluntary carbon market integrity crisis',
    'BeZero Sylvera carbon ratings',
    'high integrity carbon credit recovery 2025',
    'dMRV carbon market trust',
    'carbon credit price floor 2026',
    'REDD+ carbon credit controversy',
    'Verra REDD+ methodology',
    'carbon credit market recovery',
    'ICVCM CCP carbon credits',
    'Article 6 carbon credits',
    'carbon market transparency',
    'carbon credit quality ratings',
    'carbon market trust crisis',
    'forest carbon credit verification',
    'continuous monitoring carbon credits',
  ],

  relatedLinks: [
    { text: 'Integrity Is the Only Currency in Carbon Credits', slug: 'high-integrity-carbon-credits-icvcm-ccps' },
    { text: 'Why Indian Carbon Credits Are Mispriced And How That Changes', slug: 'carbon-credit-price-discovery-india' },
    { text: 'BeZero, Sylvera, Calyx Global: How Carbon Credit Ratings Work', slug: 'carbon-credit-ratings-bezero-sylvera' },
    { text: 'Additionality Is the Most Abused Word in Carbon Markets', slug: 'additionality-carbon-credits-explained' },
  ],

  tags: ['Carbon Markets', 'VCM', 'REDD+', 'Carbon Credit Crash', 'Integrity', 'BeZero', 'Sylvera', 'Price Discovery', 'Guardian', 'dMRV'],

  essentialFindings: [
    {
      label: 'The 2023–24 Crash Was A Trust Crisis, Not A Demand Crisis',
      text: 'Carbon credit demand did not disappear. Buyers lost confidence in the quality and verifiability of many projects.'
    },
    {
      label: 'REDD+ Projects Faced The Largest Market Repricing',
      text: 'Avoided deforestation credits experienced the steepest declines as baseline methodologies came under intense scrutiny.'
    },
    {
      label: 'Data Quality Became A Financial Variable',
      text: 'Projects with transparent monitoring and independently verifiable datasets retained significantly more value.'
    },
    {
      label: 'Carbon Rating Agencies Became Core Market Infrastructure',
      text: 'BeZero, Sylvera, and similar platforms became key tools for institutional buyers evaluating project risk.'
    },
    {
      label: 'dMRV Created A Measurable Trust Premium',
      text: 'Projects supported by continuous satellite monitoring generally weathered the selloff better than opaque projects.'
    },
    {
      label: 'Recovery Is Concentrated In High-Integrity Credits',
      text: 'Credits with strong monitoring, independent ratings, and quality labels are recovering faster than generic commodity credits.'
    },
  ],

  faq: [
    {
      question: 'Why did carbon credit prices crash in 2023–24?',
      answer:
        "The Guardian and Die Zeit investigation cited academic analyses suggesting substantial over‑crediting risk in many REDD+ projects. The findings were widely debated by Verra, project developers, and researchers, but they triggered a major market reassessment of project quality and baseline methodologies.",
    },
    {
      question: 'Which credit types crashed and which held value?',
      answer:
        "Credits tied to claims that were hardest to verify independently experienced the largest price declines: REDD+ avoided deforestation fell 70–85% from 2022 peaks. Improved forest management credits fell 50–65%. Credits with more directly measurable outcomes renewable energy, clean cookstoves with IoT monitoring, avoided methane from landfill experienced smaller declines or maintained prices. Notably, credits from projects with continuous satellite monitoring and published MRV data held value better than project types relying on periodic field audits and self-reported baselines.",
    },
    {
      question: "What do BeZero and Sylvera's ratings actually measure?",
      answer:
        "BeZero Carbon rates credits on six risk dimensions: additionality, permanence, over-crediting, non-permanence, governance, and structural risks producing a letter grade from AAA to D. Sylvera combines quantitative carbon performance scoring with qualitative project governance assessment, producing a separate score for carbon performance and a co-benefit assessment. Both rating systems penalise projects with low monitoring data quality, infrequent verification, or disputed baselines which means dMRV infrastructure directly improves the rating a project can achieve.",
    },
    {
      question: 'Is the carbon credit market recovery real in 2025–26?',
      answer:
        "The recovery is selective, not broad. The overall market has not returned to 2022 price levels and likely will not the price peak of 2022 reflected speculative demand and inadequate quality screening. High-integrity credits with continuous monitoring, ICVCM CCP labels, BeZero ratings of BB or above, and Article 6 ITMO authorisation are trading at strong premiums relative to 2023 lows. Generic commodity credits without these quality signals remain depressed. The recovery is real for projects that resolved the trust deficit; it is not real for projects that did not.",
    },
    {
      question: 'Why did dMRV-backed credits avoid the worst of the selloff?',
      answer:
        "The crash was fundamentally a data problem: buyers could not independently verify whether the forests being credited were actually threatened, making additionality impossible to assess remotely. Projects with continuous satellite monitoring, published deforestation risk data, and independently verifiable baselines offered buyers the only defensible evidence that the offset was real. When the Guardian investigation triggered a flight to quality, buyers gravitated toward projects where they could check the data themselves exactly the transparency that dMRV provides.",
    },
  ],

  content: [
    {
      type: 'bold-statement',
      text: "The market didn't collapse because demand disappeared. It collapsed because trust did. And trust is a data problem.",
    },
    {
      type: 'quick-answer',
      text: 'In January 2023, the Guardian and Zeit Online published an investigative series on Verra-certified REDD+ forest **[[carbon credits|what-are-carbon-credits]]**. The central claim drawn from an analysis by CarbonPlan and Grayson Badgley was that the vast majority of credits from REDD+ avoided deforestation projects did not represent genuine emission reductions. The methodology for establishing what deforestation \'would have happened\' without the project was so flawed, the analysis argued, that the forests being credited as protected were in many cases not under any meaningful threat.',
      label: 'The Big Picture'
    },
    {
      type: 'paragraph',
      text: "The Guardian and Die Zeit investigation cited academic analyses suggesting substantial over-crediting risk in many REDD+ projects. The findings were widely debated by Verra, project developers, and researchers, but they triggered a major market reassessment of project quality and baseline methodologies. Institutional buyers particularly European corporates with net-zero commitments and legal liability around misleading claims suspended REDD+ purchases within weeks. The selloff that followed was the largest collapse in voluntary carbon market history.",
    },
    {
      type: 'paragraph',
      text: "This article is a forensic post-mortem of what actually happened, which credit types fell and which held, what the rating agencies found, and what the recovery looks like in 2025–26. It is also an argument for why the crash was not an accident of journalism but a structural inevitability and why the market that emerges from it will be permanently different.",
    },

    {
      type: 'heading',
      level: 2,
      text: 'What Is REDD+ And Why Was It Vulnerable?',
      id: 'redd-plus-vulnerable',
    },
    {
      type: 'paragraph',
      text: 'REDD+ (Reducing Emissions from Deforestation and Forest Degradation) is a UN-backed framework that allows countries and project developers to earn **[[carbon credits|what-are-carbon-credits]]** by protecting forests that would otherwise be cleared. The theory is sound: standing forests store enormous amounts of carbon, and paying landowners or governments to keep them standing should reduce global emissions. In practice, REDD+ became the largest single category of credits in the voluntary carbon market and its most controversial.',
    },
    {
      type: 'paragraph',
      text: "The core vulnerability is structural. REDD+ credits are earned based on a counterfactual: how much deforestation would have occurred without the project? This baseline must be estimated it cannot be directly observed. When baselines are overstated, credits are issued for emissions reductions that would have happened anyway, creating what researchers call the 'over-crediting' problem. Many REDD+ projects also lacked continuous satellite monitoring, making it near-impossible for buyers to independently verify whether the protected forest was genuinely under threat.",
    },
    {
      type: 'paragraph',
      text: 'The combination of weak **[[additionality|additionality-carbon-credits-explained]]** evidence, opaque verification processes, and the sheer scale of REDD+ in voluntary markets made the category especially vulnerable to reputational shocks. When the Guardian investigation hit, there was no independent data wall to hide behind.',
    },
    {
      type: 'image',
      src: marketTimelineImg,
      alt: 'REDD+ carbon market timeline showing price crash from 2022 to 2024',

    },

    {
      type: 'heading',
      level: 2,
      text: 'What Is **[[Additionality|additionality-carbon-credits-explained]]** And Why Does It Matter?',
      id: 'additionality-importance',
    },
    {
      type: 'paragraph',
      text: '**[[Additionality|additionality-carbon-credits-explained]]** is the core test of whether a carbon project creates emissions reductions that would not have happened under business-as-usual conditions. It is, in essence, the answer to the question: \'Would this forest have been protected anyway, without carbon finance?\' If the answer is yes, the credits generated are not additional they represent a claim on a reduction the world would have achieved regardless, delivering no real climate benefit.',
    },
    {
      type: 'paragraph',
      text: 'Proving **[[additionality|additionality-carbon-credits-explained]]** requires rigorous baseline studies supported by satellite data, field surveys, historical deforestation trend analysis, and scenario modelling. The challenge in REDD+ is that the counterfactual baseline the rate of deforestation that would have occurred is inherently unobservable. This uncertainty creates space for manipulation, whether deliberate or structural. Projects in low-deforestation-risk areas can still generate credits by claiming high theoretical threat.',
    },
    {
      type: 'paragraph',
      text: 'When **[[additionality|additionality-carbon-credits-explained]]** cannot be independently demonstrated, buyers are exposed to legal liability, reputational risk, and regulatory scrutiny. High-**[[integrity|high-integrity-carbon-credits-icvcm-ccps]]** credits that prove **[[additionality|additionality-carbon-credits-explained]]** through transparent, independently verifiable data command significant price premiums precisely because they reduce buyer risk and withstand net-zero scrutiny.',
    },
    {
      type: 'image',
      src: priceDeclineImg,
      alt: 'Carbon credit price decline by project type showing additionality-linked differentiation',
      caption: 'Credits where additionality was independently verifiable experienced far smaller price declines than those relying on unverifiable counterfactual baselines.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'Timeline: How the Market Unravelled Between January 2023 and Mid-2024',
      id: 'timeline',
    },
    {
      type: 'paragraph',
      text: "January 18, 2023: The Guardian publishes 'Revealed: more than 90% of rainforest carbon offsets by biggest certifier are worthless, analysis shows.' The article cites Verra's REDD+ programme specifically, attributing the analysis to researchers including CarbonPlan. Within 24 hours, the article had reached the desks of sustainability officers and in-house legal teams at major European multinationals.",
    },
    {
      type: 'paragraph',
      text: "Late January 2023: Several major buyers publicly pause REDD+ purchases pending review. Shell, Gucci, and Disney three of the highest-profile REDD+ buyers face direct media questions about their offset portfolios. Verra issues a formal rebuttal challenging the analytical methodology. The International Carbon Reduction and Offset Alliance (ICROA) calls for an independent technical review.",
    },
    {
      type: 'paragraph',
      text: "February–April 2023: BeZero Carbon and Sylvera both publish updated ratings on their covered REDD+ projects, with significant downward revisions on projects where monitoring data was sparse, baselines were self-reported, or control area selection was methodologically weak. Several projects rated previously at BB or B move to C or D. Buyers interpret the rating downgrades as independent validation of the Guardian's core directional claim, even while disputing the specific 90% figure.",
    },
    {
      type: 'paragraph',
      text: 'Mid-2023 through 2024: REDD+ prices on the secondary market fall from a peak of approximately $13–18 per tonne in 2022 to $2–4 per tonne by mid-2023 for unrated credits. Rated credits with BeZero BB or above hold better some maintaining $8–12 but the overall market volume contracts sharply as buyers shift toward credit types with more verifiable **[[additionality|additionality-carbon-credits-explained]]**. Industrial credits methane capture, refrigerant destruction, direct air capture see increased demand. Cookstove credits with IoT monitoring see a \'flight to verifiability.\'',
    },
    {
      type: 'quote',
      text: "The crash was not caused by the Guardian article. The article exposed what was already true: a market that had scaled faster than its verification infrastructure could support, built on baselines that no one could independently check.",

    },

    {
      type: 'heading',
      level: 2,
      text: 'Which Credit Types Crashed and Which Held Value',
      id: 'credit-type-analysis',
    },
    {
      type: 'paragraph',
      text: "The crash was not uniform across the voluntary carbon market. Understanding the differentiation between credit types that collapsed and those that held value is essential to understanding both what went wrong and what recovery looks like.",
    },
    {
      type: 'paragraph',
      text: 'The hardest hit were credits whose **[[additionality|additionality-carbon-credits-explained]]** rested on claims about what would have happened without the project avoided deforestation being the archetypal case. When you cannot independently observe the counterfactual, you cannot independently verify the credit. The investigation\'s core finding was that many REDD+ baselines were significantly overstated relative to what satellite data showed had actually occurred in comparable unprotected forests.',
    },
    {
      type: 'interactive-table',

      caption: 'Carbon credit price movement by type: 2022 peak vs 2024 trough vs 2025–26 recovery',
      headers: ['Credit Type', '2022 Peak Price', '2024 Trough', '2025–26 Price', 'Key Differentiator'],
      rows: [
        ['REDD+ (unrated)', '$13–18/t', '$2–4/t', '$4–7/t', 'Additionality unverifiable'],
        ['REDD+ (BeZero BB+)', '$15–22/t', '$8–12/t', '$12–18/t', 'Rated, monitored'],
        ['Cookstoves (narrative)', '$8–12/t', '$1–3/t', '$2–5/t', 'Usage self-reported'],
        ['Cookstoves (IoT monitored)', '$10–14/t', '$9–13/t', '$13–18/t', 'Measurable, verifiable'],
        ['Methane capture (landfill)', '$6–10/t', '$6–9/t', '$8–12/t', 'Directly measured'],
        ['Mangrove/blue carbon', '$10–15/t', '$7–10/t', '$14–22/t', 'High biodiversity co-benefit'],
        ['ICVCM CCP-labelled', 'N/A (new)', 'N/A', '$15–25/t', 'Highest integrity label'],
      ],
    },
    {
      type: 'paragraph',
      text: "The pattern is consistent across all credit types: projects with directly measurable, independently verifiable outcomes held value; projects whose claims rested on unverifiable assumptions collapsed. This reflects a fundamental economic truth about information asymmetry when buyers cannot verify quality, they assume the worst and price accordingly.",
    },

    {
      type: 'heading',
      level: 2,
      text: '**[[Integrity|high-integrity-carbon-credits-icvcm-ccps]]** Platforms: What BeZero, Sylvera, and Calyx Global Actually Found',
      id: 'integrity-platforms',
    },
    {
      type: 'paragraph',
      text: '**[[Carbon credit|what-are-carbon-credits]]** rating agencies BeZero Carbon, Sylvera, and Calyx Global did not exist as significant market actors five years ago. By 2023, they had become the primary mechanism through which institutional buyers attempted to differentiate high-quality credits from low-quality ones. The crash stress-tested their methodologies and revealed both their value and their limitations.',
    },
    {
      type: 'paragraph',
      text: 'BeZero Carbon\'s rating methodology evaluates credits on six risk dimensions: **[[additionality|additionality-carbon-credits-explained]]** risk, over-crediting risk, non-permanence risk, leakage risk, governance risk, and structural risk. Each dimension is scored and combined into a letter grade from AAA (lowest risk) to D (highest risk).',
    },
    {
      type: 'paragraph',
      text: 'In the post-crash period, BeZero\'s most significant finding was the correlation between monitoring data quality and **[[additionality|additionality-carbon-credits-explained]]** scores. Projects with continuous satellite monitoring, published deforestation risk maps, and independently verifiable baselines consistently scored higher on **[[additionality|additionality-carbon-credits-explained]]** than projects relying on self-reported data and infrequent field audits regardless of which standard (Verra, Gold Standard, ACR) they were certified under.',
    },
    {
      type: 'paragraph',
      text: 'Sylvera\'s post-crash analysis of REDD+ projects found that projects in locations with high satellite monitoring coverage and published deforestation pressure data significantly outperformed projects in remote areas where baseline deforestation rates were less independently observable. The pattern reinforced the **[[dMRV|nature-based-carbon-projects-ai-digital-mrv]]** premium: observable projects were rateable projects, and rateable projects held price.',
    },
    {
      type: 'highlight',
      title: 'What the ratings mean for pricing',
      text: "A BeZero BBB rating commands $4–8 per tonne premium over an unrated equivalent credit. A BB rating commands $2–4. An A or AA rating can command $10–15 premium over unrated the difference between a $4 commodity credit and a $15–20 institutional-grade asset. These premiums are data-driven differentials, not marketing premiums.",
    },

    {
      type: 'heading',
      level: 2,
      text: 'ICVCM And The Rise Of **[[Carbon Credit|what-are-carbon-credits]]** Quality Standards',
      id: 'icvcm-rise',
    },
    {
      type: 'paragraph',
      text: 'The **[[Integrity|high-integrity-carbon-credits-icvcm-ccps]]** Council for the Voluntary Carbon Market (ICVCM) introduced the Core Carbon Principles (CCP) as a global benchmark for what constitutes a high-quality **[[carbon credit|what-are-carbon-credits]]**. The CCP label sits above existing registries like Verra and Gold Standard, assessing whether programmes and methodologies meet a minimum **[[integrity|high-integrity-carbon-credits-icvcm-ccps]]** threshold. By 2025–26, CCP-approved credits have become the clearest quality signal in the market.',
    },
    {
      type: 'paragraph',
      text: 'Projects that earn the CCP label must demonstrate verifiable **[[additionality|additionality-carbon-credits-explained]]**, robust permanence provisions, no double counting, and continuous monitoring often requiring satellite-based MRV systems. The ICVCM\'s criteria were directly shaped by the methodological weaknesses exposed in the 2023 crash. The result: CCP-labelled credits trade at $15–25 per tonne, significantly outperforming legacy VCS REDD+ credits without quality certification.',
    },
    {
      type: 'paragraph',
      text: 'For project developers in India, ICVCM approval is increasingly a prerequisite for accessing institutional buyers. As domestic **[[CCTS|ccts-rewriting-esg]]** credit demand grows alongside compliance obligations, the CCP framework is expected to set the quality floor for credits participating in cross-border **[[Article 6|article-6-paris-agreement-india]]** transactions.',
    },
    {
      type: 'image',
      src: ratingsImg,
      alt: 'ICVCM Core Carbon Principles CCP label and carbon credit quality ratings tier',
      caption: 'The ICVCM CCP label has created a clear quality tier in the voluntary carbon market CCP-certified projects command the highest prices and face the least buyer scrutiny.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'Why **[[dMRV|nature-based-carbon-projects-ai-digital-mrv]]**-Backed Credits Avoided the Worst of the Selloff',
      id: 'dmrv-resilience',
    },
    {
      type: 'paragraph',
      text: 'The flight to quality in 2023–24 was fundamentally a flight to verifiability. When the Guardian investigation triggered buyer withdrawal, the projects that maintained price were those where buyers could independently check the data where the monitoring record was continuous, satellite-backed, and publicly accessible. This is the core commercial value proposition of **[[digital MRV|nature-based-carbon-projects-ai-digital-mrv]]**, and the crash made it financially concrete.',
    },
    {
      type: 'paragraph',
      text: "Projects operating with continuous satellite monitoring Sentinel-1 SAR change detection, Sentinel-2 canopy cover time series, and AI-driven disturbance alerts provided buyers with the ability to independently verify forest condition at any point. A buyer could look at the satellite record and confirm that the forest had not experienced material loss, that the monitoring coverage was complete and uninterrupted, and that the deforestation risk the project was protecting against was real and observable.",
    },
    {
      type: 'paragraph',
      text: "The market's response was immediate and financially material. Among projects covered by BeZero Carbon's monitoring data quality assessment, those with the highest monitoring data quality scores experienced price declines 40–50% smaller than projects with low monitoring scores during the January–June 2023 selloff.",
    },
    { type: 'related-link', text: '**[[Integrity|high-integrity-carbon-credits-icvcm-ccps]]** Is the Only Currency in **[[Carbon Credits|what-are-carbon-credits]]**', slug: 'high-integrity-carbon-credits-icvcm-ccps' },

    {
      type: 'heading',
      level: 2,
      text: 'Recovery Signals: What High-**[[Integrity|high-integrity-carbon-credits-icvcm-ccps]]** Credits Are Trading at in 2025–26',
      id: 'recovery-signals',
    },
    {
      type: 'paragraph',
      text: "The recovery is selective, not broad. The overall voluntary carbon market has not returned to 2022 price levels, and the likelihood is that it will not the 2022 price peak reflected speculative demand, inadequate quality screening, and corporate net-zero announcements that outpaced any credible supply of verified reductions. That market structure no longer exists.",
    },
    {
      type: 'paragraph',
      text: 'What has recovered genuinely and durably is the high-**[[integrity|high-integrity-carbon-credits-icvcm-ccps]]** segment. Credits carrying the ICVCM\'s Core Carbon Principles (CCP) label are trading at $15–25 per tonne. Credits with BeZero BB+ or Sylvera High ratings from projects with continuous monitoring are in the $12–22 range. **[[Article 6|article-6-paris-agreement-india]]** ITMO-authorized credits are in the $18–35 range.',
    },
    {
      type: 'paragraph',
      text: "The picture for commodity credits without quality signals is different: unrated REDD+ credits are at $4–7, representing a partial recovery from the $2–4 trough but nowhere near 2022 peaks. Many project developers in this segment face a structural challenge their projects may be generating genuine reductions, but without the monitoring infrastructure to prove it, they cannot access the premium segment.",
    },
    {
      type: 'paragraph',
      text: 'For Indian project developers, the recovery trajectory matters specifically because the domestic **[[CCTS|ccts-rewriting-esg]]** market is opening simultaneously. Compliance buyers with statutory obligations are expected to be more quality-conscious than voluntary market buyers, reinforcing the premium for verifiable, rated credits.',
    },
    {
      type: 'image',
      src: highIntegrityImg,
      alt: 'High integrity carbon credit recovery 2025-26 showing CCP and rated credit price premiums',
      caption: 'High-integrity credits with CCP labels and BeZero BB+ ratings are recovering strongly the price gap between verified and unverified credits has never been wider.',
    },
    { type: 'related-link', text: 'Why Indian **[[Carbon Credits|what-are-carbon-credits]]** Are Mispriced And How That Changes', slug: 'carbon-credit-price-discovery-india' },

    {
      type: 'heading',
      level: 2,
      text: 'Buyer Priorities In The Evolving Carbon Market',
      id: 'buyer-priorities',
    },
    {
      type: 'paragraph',
      text: 'Modern corporate buyers have fundamentally changed how they evaluate and procure **[[carbon credits|what-are-carbon-credits]]**. The 2023 crash eliminated the era of volume-first purchasing. Today\'s institutional buyer applies a three-pillar framework before any purchase: (1) verifiable quality demonstrated through independent third-party ratings (BeZero, Sylvera, Calyx), satellite-based continuous monitoring data, and CCP certification; (2) strategic alignment credits must fit within a credible net-zero roadmap, targeting hard-to-abate residual emissions; and (3) risk mitigation buyers require permanence buffers, regulatory compliance, and clear co-benefits that strengthen the social licence of the offset claim.',
    },
    {
      type: 'paragraph',
      text: "As buyers shift from volume-first to quality-first procurement strategies, projects that embed continuous MRV infrastructure and secure high ratings capture the premium segment of the market the segment that survived the crash and is growing in 2025–26.",
    },
    {
      type: 'image',
      src: dmrvImg,
      alt: 'Traditional MRV vs digital MRV comparison showing buyer confidence and price gap',
      caption: 'Digital MRV provides the continuous, independently verifiable monitoring data that institutional buyers now require bridging the gap between project claims and independently checkable evidence.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'What the Crash Changed Permanently',
      id: 'permanent-changes',
    },
    {
      type: 'paragraph',
      text: "Three structural changes are permanent outcomes of the 2023–24 crash. First, institutional buyers now require independent third-party data before purchase not just certification by a standard. The era of buying based on a Verra registration number has ended. Buyers want BeZero or Sylvera scores, monitoring data access, and in some cases their own independent remote sensing review before committing to large purchases.",
    },
    {
      type: 'paragraph',
      text: 'Second, **[[additionality|additionality-carbon-credits-explained]]** methodology scrutiny is now permanent. Verra released updated jurisdictional REDD+ methodology requirements in 2024 that tighten baseline construction rules significantly. Gold Standard is following. Project developers who cannot demonstrate that their baselines were constructed with verifiable, independently observable data will face ongoing rating penalties.',
    },
    {
      type: 'paragraph',
      text: "Third, the intermediary infrastructure of the carbon market rating agencies, data providers, independent verification firms is now permanent and growing. The market has permanently institutionalised quality screening, and this infrastructure will only become more sophisticated as satellite monitoring data improves.",
    },
    {
      type: 'image',
      src: marketStackImg,
      alt: 'Post-crash carbon market structure showing permanent quality tiers and infrastructure layers',
      caption: 'The post-crash carbon market is permanently stratified rating agencies, CCP labels, and continuous satellite monitoring are now core infrastructure, not optional add-ons.',
    },

    { type: 'divider' },
    {
      type: 'bold-statement',
      text: 'The crash was not a market failure. It was a correction brutal, necessary, and ultimately healthy for projects that can prove their impact.',
    },
    {
      type: 'callout',
      title: 'How Sylithe protects your project from the next correction',
      text: 'The next market stress event will, like the last one, target the projects whose claims cannot be independently verified. Sylithe\'s continuous satellite monitoring and **[[dMRV|nature-based-carbon-projects-ai-digital-mrv]]** pipeline provide the evidence chain that kept rated, monitored projects at premium prices through the crash. If your project\'s monitoring infrastructure is not currently audit-ready and rating-agency-ready, the time to upgrade is before the next investigation, not after.',
    },
  ],
};
