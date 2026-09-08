import chmHeroImg from '../../assets/chm16.png';

import chmGenerationImg from '../../assets/CHMGeneration.png';
import spacebornePhotographImg from '../../assets/SpacebornePhotograph.png';
import forestStructureImg from '../../assets/ForestStructure.png';
import biomass3DImg from '../../assets/3DBiomass.png';

export const canopyHeightLiDARBlogPost = {
  id: 'canopy-height-lidar',
  category: 'technology',
  categoryLabel: 'Technology',
  title: 'Canopy Height LiDAR for Forest Carbon: How GEDI Measures Biomass, Vertical Structure, and Carbon Density',
  subtitle: "Optical satellites see the 'Skin' of the forest; LiDAR sees the 'Skeleton'. A deep dive into GEDI, spaceborne lasers, canopy height models, and the 3D future of carbon MRV.",
  excerpt:
    "If you want to know how much carbon is in a forest, you need to know how tall the trees are. Canopy height LiDAR for forest carbon is the gold standard two forests can look identical from above, but if one is 10m taller, it stores 3x the carbon. We explain how GEDI LiDAR works, how canopy height models (CHM) are built, why LiDAR beats photogrammetry, and how Sylithe uses 3D structure to reach Tier 3 biomass accuracy.",
  metaDescription:
    "Learn how canopy height LiDAR for forest carbon works. Explore GEDI LiDAR forest biomass estimation, canopy height model CHM generation, NASA GEDI data in India, and how LiDAR-derived carbon credits are changing MRV.",

  date: 'May 14, 2026',
  lastModified: 'June 4, 2026',
  readTime: '22 min read',
  wordCount: 5200,
  featured: false,

  image: chmHeroImg,
  heroImage: chmHeroImg,
  author: 'Sylithe Engineering',

  primaryKeyword: 'canopy height LiDAR forest carbon',
  secondaryKeywords: [
    'GEDI LiDAR forest biomass',
    'vertical forest structure carbon',
    'spaceborne LiDAR vs photogrammetry',
    'canopy height model CHM satellite',
    'NASA GEDI data India',
    'LiDAR derived carbon credits',
    '3D forest monitoring remote sensing',

    'forest canopy height measurement',
    'forest biomass estimation using LiDAR',
    'aboveground biomass mapping',
    'forest carbon stock assessment',
    'forest carbon density mapping',
    'tree height remote sensing',
    'GEDI canopy height data',
    'GEDI biomass products',
    'NASA GEDI mission',
    'spaceborne laser scanning forests',
    'LiDAR forest inventory',
    'LiDAR for carbon accounting',
    'forest structure analysis',
    'vertical vegetation profile',
    '3D forest structure mapping',
    'forest carbon MRV',
    'high accuracy biomass estimation',
    'remote sensing for carbon credits',
    'forest carbon monitoring technology',
    'nature based solutions monitoring',
    'afforestation biomass measurement',
    'reforestation carbon monitoring',
    'mangrove biomass LiDAR',
    'tropical forest biomass mapping',
    'forest carbon project verification',
    'LiDAR carbon measurement',
    'canopy height and biomass relationship',
    'satellite LiDAR carbon estimation',
    'forest carbon quantification',
    'forest carbon verification',
    'advanced MRV technology',
    'Tier 3 biomass assessment',
    'carbon credit project monitoring'
  ],

  relatedLinks: [
    { text: 'SAR Sees Through Clouds. Here\'s Why That Changes Everything.', slug: 'sar-radar-carbon-monitoring' },
    { text: 'LULC Classification: Why 90% Accuracy Is Often a Lie', slug: 'lulc-classification-accuracy' },
    { text: 'AI Foundation Models for Forest Carbon: What They Actually Deliver', slug: 'ai-foundation-models-forest-carbon' },
    { text: 'Biomass Estimation Methods Compared: From Tape Measures to Lasers', slug: 'biomass-estimation-methods-compared' },
  ],

  tags: ['LiDAR', 'GEDI', 'Canopy Height', 'CHM', 'Forest Carbon', 'Forest Structure', 'Biomass', 'Remote Sensing', 'Technology', 'MRV', 'NASA', 'India', 'Carbon Credits'],

  essentialFindings: [
    {
      label: 'Forest Carbon Monitoring Has Moved From 2D Area to 3D Structure',
      text: 'Modern carbon accounting depends on measuring forest volume and vertical complexity rather than simply tracking forest cover.'
    },
    {
      label: 'LiDAR Provides Direct Measurements of Forest Height',
      text: 'By recording laser returns from the canopy, understory, and ground, LiDAR generates highly accurate canopy height estimates.'
    },
    {
      label: 'GEDI Has Enabled Global-Scale Biomass Mapping',
      text: 'NASA’s GEDI mission delivers spaceborne LiDAR data that improves forest biomass estimation and carbon stock assessment across large landscapes.'
    },
    {
      label: 'Canopy Height Is a Strong Predictor of Carbon Density',
      text: 'Accurate canopy height models help estimate biomass, identify high-carbon forests, and reduce uncertainty in carbon calculations.'
    },
    {
      label: 'LiDAR Outperforms Photogrammetry for Carbon MRV',
      text: 'Unlike photogrammetry, LiDAR can penetrate vegetation and detect ground elevation, producing more reliable forest structure measurements.'
    },
    {
      label: 'Multi-Sensor Fusion Is Defining the Future of Carbon Monitoring',
      text: 'Combining GEDI LiDAR, SAR, and optical imagery enables Tier 3-grade biomass mapping, 3D forest monitoring, and higher-integrity carbon credits.'
    },
  ],
  faq: [
    {
      question: 'What is canopy height in forest carbon accounting?',
      answer:
        'Canopy height is the vertical distance between the ground and the top of the forest canopy. In carbon accounting, it is the single most important variable because biomass and therefore carbon scales exponentially with tree height. A forest with 30m canopy height stores dramatically more carbon than a 15m forest of the same area. Canopy height LiDAR for forest carbon allows us to measure this variable with centimetre-level precision from space, enabling Tier 3 biomass accuracy without exhaustive field surveys.',
    },
    {
      question: 'How does GEDI LiDAR estimate forest biomass?',
      answer:
        "NASA's GEDI fires laser pulses from the ISS and records the full waveform of returning energy. By analysing relative height metrics (RH25, RH50, RH75, RH98) from each waveform, GEDI characterises both canopy height and vertical foliage density. These metrics are fed into allometric models that convert structural information into Above-Ground Biomass (AGB). GEDI LiDAR forest biomass estimates are then fused with continuous satellite data (Sentinel-1 SAR and Sentinel-2 optical) to produce wall-to-wall biomass maps at landscape scale.",
    },
    {
      question: 'Is LiDAR more accurate than photogrammetry for forest carbon?',
      answer:
        'Yes, significantly. Photogrammetry (Structure from Motion) can only model the top surface of the canopy it cannot detect the ground through dense vegetation. Without a true ground reference, you cannot calculate actual tree height. LiDAR pulses penetrate gaps in the foliage to reach the ground, giving a precise Canopy Height = DSM − DTM measurement. In dense tropical forests, photogrammetry can underestimate canopy height by 20–40%, leading to severe biomass and carbon underestimation.',
    },
    {
      question: 'Can NASA GEDI data be used in India?',
      answer:
        "Yes. NASA GEDI data India coverage includes all major forest types the Western Ghats, Himalayan forests, Central Indian dry forests, and Northeast India's tropical forests. GEDI operates between 51.6° N and S latitudes, providing excellent coverage across India. The data is publicly available and has been used in multiple peer-reviewed studies to estimate biomass and carbon stocks in Indian forests where field measurement infrastructure is limited.",
    },
    {
      question: 'How do LiDAR-derived carbon credits work?',
      answer:
        'LiDAR-derived carbon credits are generated by using LiDAR data especially GEDI to establish a highly accurate baseline biomass measurement for a forest project. As the project progresses, repeat measurements track biomass change, enabling precise additionality calculation. The LiDAR measurement reduces uncertainty, which means fewer conservative deductions are applied, resulting in more carbon credits issued per hectare. This approach is increasingly being adopted under Verra VCS and Gold Standard methodologies for high-integrity forest carbon projects.',
    },
    {
      question: 'Why is vertical forest structure important for carbon storage?',
      answer:
        "Vertical forest structure determines how much wood volume is packed into every layer of the forest from the ground to the canopy top. A primary forest with a multi-layered vertical structure (emergent trees, main canopy, understory, shrubs) stores 2–3x more carbon than a plantation of the same height with just trunks and air below the canopy. Metrics like Plant Area Index (PAI) at each vertical level, captured by full-waveform LiDAR, allow us to quantify this complexity and differentiate high-integrity native forests from low-integrity monocultures.",
    },
    {
      question: 'What is LiDAR and how does it measure trees?',
      answer:
        "LiDAR (Light Detection and Ranging) is a remote sensing technology that uses laser pulses to measure distances. A sensor sends out a laser beam, which reflects off the leaves and branches (canopy) and eventually the ground. By measuring the 'Time of Flight' of the laser, we can calculate the exact height of the tree and the vertical arrangement of its branches with centimetre-level precision.",
    },
    {
      question: 'What is GEDI (NASA)?',
      answer:
        "GEDI (Global Ecosystem Dynamics Investigation) is a LiDAR instrument attached to the International Space Station (ISS). It is the first mission specifically designed to map the Earth's forests in 3D. Since 2019, it has fired billions of laser pulses at the world's forests, providing the high-resolution 'Vertical Profiles' that are now the gold standard for global carbon mapping.",
    },
    {
      question: 'Can you use LiDAR to detect selective logging?',
      answer:
        "Yes, and it is the best tool for it. Selective logging (removing one or two high-value trees) is often invisible to optical satellites because the surrounding canopy closes up quickly. However, a LiDAR pulse will show a 'Gap' in the vertical structure where the tree used to be. By comparing LiDAR passes over time, we can detect even small-scale degradation that would otherwise be missed.",
    },
  ],

  content: [
    {
      type: 'bold-statement',
      text: "Optical satellites see the 'Skin' of the forest; LiDAR sees the 'Skeleton'. If you aren't measuring height, you aren't measuring carbon you're just guessing.",
    },
    {
      type: 'quick-answer',
      text: "In the 2010s, carbon monitoring was about 'Area'. We measured how many hectares of forest were lost or gained. In the 2020s, carbon monitoring is about 'Volume'. We have moved from a 2D understanding of the landscape to a 3D inventory of the carbon stored in every cubic meter of vegetation.",
      label: 'The Big Picture'
    },
    {
      type: 'paragraph',
      text: "The technology driving this shift is canopy height LiDAR for forest carbon (Light Detection and Ranging). By firing laser pulses from the International Space Station and airplanes, we can now map the 'Vertical Profile' of any forest on Earth. For the carbon market, this means moving from 'Global Averages' (which are often wrong by 50% or more) to 'Project-Specific Precision'.",
    },
    {
      type: 'paragraph',
      text: 'This article explains how spaceborne LiDAR works, how canopy height models (CHM) are built, why canopy height is the \'Master Variable\' of biomass estimation, the crucial difference between LiDAR and photogrammetry, how NASA GEDI data India is transforming tropical forest monitoring, and how Sylithe uses 3D structural data to deliver LiDAR-derived **[[carbon credits|what-are-carbon-credits]]** at Tier 3 accuracy.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'The Physics of the Laser: From ISS to Forest Floor',
      id: 'lidar-physics',
    },
    {
      type: 'paragraph',
      text: "A LiDAR sensor works by emitting a pulse of light and measuring the time it takes to return. Since the speed of light is constant, this time tells us the exact distance. In a forest, a single laser pulse will generate multiple 'Returns'.",
    },
    {
      type: 'why-it-matters',

      items: [
        'First Return: The laser hits the top of the canopy (the highest leaves).',
        'Intermediate Returns: The laser bounces off branches and leaves at different heights within the canopy.',
        'Last Return: The laser finds a tiny gap in the foliage and hits the actual ground.',
      ],

      title: 'Why It Matters'
    },
    {
      type: 'paragraph',
      text: "By subtracting the 'Last Return' (Ground) from the 'First Return' (Canopy Top), we get the absolute 'Canopy Height'. This is the most accurate measurement of height possible from remote sensing, far superior to the estimates derived from optical imagery.",
    },


    {
      type: 'heading',
      level: 2,
      text: 'GEDI: The 3D Census of the Earth\u2019s Forests',
      id: 'gedi-mission',
    },
    {
      type: 'paragraph',
      text: "Until recently, LiDAR was limited to expensive airplane surveys. NASA's GEDI (Global Ecosystem Dynamics Investigation) changed everything. GEDI is a 'Waveform LiDAR' instrument on the ISS that has been mapping the world between 51.6\u00b0 N and S latitudes since 2019.",
    },
    {
      type: 'paragraph',
      text: "GEDI doesn't provide a continuous map; it provides 'Footprints' (circles of 25m diameter) every 60 meters along its track. While it looks like a 'Dotted Line' on a map, these billions of high-precision points act as 'Anchor Data'. We use these anchor points to train AI models that can then estimate height for the entire landscape using continuous (but less precise) data from Sentinel-1 and Sentinel-2. This is the 'Fusion' that powers modern biomass mapping.",
    },

    {
      type: 'heading',
      level: 2,
      text: 'How GEDI LiDAR Estimates Forest Biomass',
      id: 'gedi-biomass-estimation',
    },
    {
      type: 'paragraph',
      text: "GEDI LiDAR forest biomass estimation follows a precise physics-to-carbon pipeline. Unlike simple optical indices (like NDVI) that only infer greenness, GEDI directly measures the three-dimensional architecture of vegetation. Here is how the process works step by step.",
    },
    {
      type: 'numbered-list',
      items: [
        {
          title: 'Laser Pulse Emitted',
          desc: 'GEDI fires a near-infrared laser pulse (1064 nm) from the ISS toward the forest surface. Each pulse illuminates a circular footprint of approximately 25 metres in diameter on the ground.',
        },
        {
          title: 'Full Waveform Recorded',
          desc: 'Instead of recording just a single return, GEDI captures the full waveform a continuous record of how laser energy returns over time. This encodes the distribution of vegetation and ground across every vertical layer of the forest.',
        },
        {
          title: 'Relative Height Metrics Extracted',
          desc: 'From each waveform, scientists extract Relative Height (RH) metrics: RH25, RH50, RH75, and RH98. RH98 is equivalent to the 98th percentile canopy height. Together, these metrics describe both the maximum height and the vertical density profile of the forest.',
        },
        {
          title: 'Allometric Biomass Model Applied',
          desc: 'The RH metrics are fed into species- and region-specific allometric equations that relate structural measurements to Above-Ground Biomass (AGB). These equations are calibrated using field plots where researchers have directly measured tree diameter, height, and weight.',
        },
        {
          title: 'Carbon Estimation',
          desc: 'AGB is converted to carbon stock using a standard carbon fraction (typically 0.47 meaning approximately 47% of dry biomass is carbon). This gives a carbon density value in tonnes of CO\u2082-equivalent per hectare, which is the foundation of any carbon credit calculation.',
        },
      ],
    },
    {
      type: 'paragraph',
      text: "The power of GEDI LiDAR forest biomass estimation is that it captures what optical satellites fundamentally cannot: the vertical distribution of wood volume. A plantation and a primary forest can look identical from above in an optical image, but GEDI's waveform will show the stark difference in their internal architecture and therefore their true carbon storage.",
    },

    {
      type: 'heading',
      level: 2,
      text: 'From LiDAR Returns to a Canopy Height Model (CHM)',
      id: 'chm-generation',
    },
    {
      type: 'paragraph',
      text: 'The canopy height model CHM satellite is one of the most important derived products in forest remote sensing. A CHM is a raster map where each pixel represents the height of the vegetation above the ground at that specific location. It is the foundation for nearly every downstream analysis biomass estimation, forest degradation detection, species composition inference, and **[[carbon credit|what-are-carbon-credits]]** quantification.',
    },
    {
      type: 'paragraph',
      text: "A CHM is generated using a simple but powerful formula: Canopy Height = DSM \u2212 DTM. The Digital Surface Model (DSM) captures the elevation of the highest surface at each point which in a forest is the top of the canopy. The Digital Terrain Model (DTM) captures the bare-earth elevation the actual ground level beneath the vegetation. Subtracting the DTM from the DSM removes topographic variation and gives you the true vegetation height.",
    },
    {
      type: 'paragraph',
      text: "This is where canopy height LiDAR for forest carbon has an enormous advantage over optical methods. Creating a reliable DTM requires knowing where the ground actually is and in dense tropical forests, the ground is completely hidden beneath the canopy. LiDAR pulses, by penetrating gaps in the foliage and reaching the ground, can construct an accurate DTM even under closed-canopy conditions. The resulting canopy height model CHM satellite product, when derived from GEDI or airborne LiDAR, achieves accuracy of \u00b11\u20133 metres for canopy height, compared to \u00b110\u201320 metre errors typical of photogrammetry in similar conditions.",
    },
    {
      type: 'image',
      src: chmGenerationImg,
      alt: 'Canopy Height Model CHM generation from LiDAR DSM and DTM subtraction',
    },

    {
      type: 'heading',
      level: 2,
      text: 'LiDAR vs. Photogrammetry: The "Digital Surface" Illusion',
      id: 'lidar-vs-photogrammetry',
    },
    {
      type: 'paragraph',
      text: "Many low-cost MRV providers use 'Photogrammetry' (also called Structure from Motion or Stereo Mapping) to estimate height. They take two satellite images from different angles and create a 3D model. While this looks impressive, it has a fatal flaw: it can only see the 'Top Surface'.",
    },
    {
      type: 'paragraph',
      text: "In a dense tropical forest, photogrammetry cannot see the ground. If you don't know where the ground is, you don't know how tall the trees are you only know how high the canopy surface is relative to the perceived ground. This often leads to 'Height Underestimation' in hilly areas and 'Height Overestimation' in dense secondary forests. LiDAR is the only technology that penetrates the canopy to find the true zero-point (the ground).",
    },
    {
      type: 'image',
      src: spacebornePhotographImg,
      alt: 'Spaceborne LiDAR vs photogrammetry comparison showing canopy penetration difference',
      caption: 'Unlike photogrammetry, LiDAR can penetrate forest canopies and detect ground elevation, producing more reliable biomass estimates.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Spaceborne LiDAR vs Photogrammetry: Direct Comparison',
      id: 'spaceborne-lidar-vs-photogrammetry',
    },
    {
      type: 'data-table',
      title: 'Spaceborne LiDAR vs Photogrammetry for Forest Carbon MRV',
      headers: ['Parameter', 'LiDAR (GEDI / Airborne)', 'Photogrammetry (Stereo)'],
      rows: [
        ['Ground Detection', 'Yes pulses penetrate canopy gaps', 'Limited only in open areas'],
        ['Canopy Penetration', 'Yes full vertical profile captured', 'No surface model only'],
        ['Biomass Accuracy', 'High (Tier 3 achievable)', 'Medium (Tier 2 at best)'],
        ['Carbon MRV Quality', 'Excellent IPCC Tier 3', 'Moderate  IPCC Tier 2'],
        ['Performance in Dense Forests', 'Excellent', 'Weak high error rates'],
        ['DTM Accuracy Under Forest', 'High (\u00b10.5\u20131.5m)', 'Poor (\u00b15\u201320m)'],
        ['CHM Accuracy', '\u00b11\u20133m', '\u00b110\u201320m in dense cover'],
        ['Suitability for Carbon Credits', 'High accepted by Verra, Gold Standard', 'Limited conservative deductions apply'],
      ],
      footnote: 'Comparison based on published peer-reviewed benchmarks for tropical forest conditions.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'Why Vertical Structure Matters for Carbon Density',
      id: 'vertical-structure-carbon',
    },
    {
      type: 'paragraph',
      text: "Carbon density isn't just about the tallest tree. It's about how much wood is packed into the 'Understory' and 'Mid-canopy'. Two forests can both be 20m tall, but if one is a 'Primary Forest' with multiple layers of vegetation and the other is a 'Plantation' with nothing but trunks and air under the top leaves, the primary forest will have 2x the carbon.",
    },
    {
      type: 'paragraph',
      text: "Two forests can both be 20m tall, but if one is a Primary Forest with multiple layers of vegetation and the other is a Plantation with nothing but trunks and air under the top canopy, the primary forest stores dramatically more carbon. Vertical forest structure carbon is quantified through allometric equations that relate measurable structural properties height, diameter, wood density to biomass. Canopy height LiDAR for forest carbon provides the height input to these equations at landscape scale.",
    },
    {
      type: 'image',
      src: forestStructureImg,
      alt: 'Two forests with similar canopy heights showing different vertical structure and carbon density',
      caption: 'Forests with similar canopy heights can store very different amounts of carbon depending on their internal vertical structure.',
    },
    {
      type: 'data-table',
      title: 'How Canopy Height Drives Carbon Density',
      headers: ['Forest Type', 'Canopy Height', 'Carbon Density (tCO\u2082e/ha)', 'Vertical Layers'],
      rows: [
        ['Young Plantation', '3\u20138 m', 'Low (10\u201340)', '1 layer'],
        ['Mature Plantation', '12\u201318 m', 'Medium (60\u2013120)', '1\u20132 layers'],
        ['Secondary Forest', '15\u201322 m', 'Medium\u2013High (100\u2013200)', '2\u20133 layers'],
        ['Mature Primary Forest', '28\u201345 m', 'High (250\u2013500+)', '4\u20135 layers'],
      ],
      footnote: 'Carbon density estimates based on IPCC Tier 1 defaults and published tropical forest studies.',
    },
    {
      type: 'paragraph',
      text: 'LiDAR provides the \'Plant Area Index\' (PAI) at every vertical level. It tells us the \'Complexity\' of the forest. High complexity correlates with high biomass and high biodiversity. By using canopy height LiDAR for forest carbon, Sylithe can differentiate between high-**[[integrity|high-integrity-carbon-credits-icvcm-ccps]]** native forests and low-**[[integrity|high-integrity-carbon-credits-icvcm-ccps]]** monocultures that might look similar on a 2D map.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'NASA GEDI Data in India: Mapping Tropical Forests',
      id: 'gedi-india',
    },
    {
      type: 'paragraph',
      text: "NASA GEDI data India provides one of the most valuable datasets for biomass estimation in tropical forests where field measurements remain limited. India's forest carbon landscape is enormously diverse from the dense evergreen forests of the Western Ghats to the dry deciduous forests of Central India, the alpine forests of the Himalayas, and the rich tropical biodiversity of Northeast India.",
    },
    {
      type: 'why-it-matters',

      items: [
        "Western Ghats: One of the world's 36 biodiversity hotspots. NASA GEDI data India has been used to map biomass across Kerala, Karnataka, and Tamil Nadu, revealing that protected forest patches store up to 400 tCO\u2082e/ha nearly double previous optical estimates.",
        'Himalayan Forests: High-altitude conifer and broadleaf forests across Uttarakhand, Himachal Pradesh, and the northeast states. GEDI\'s ability to measure height in complex terrain makes it particularly valuable here, where topographic variation makes photogrammetry unreliable.',
        'Central Indian Forests: The dry deciduous forests of Madhya Pradesh and Chhattisgarh critical for REDD+ and avoided deforestation projects. NASA GEDI data India allows baseline biomass establishment across millions of hectares at low cost.',
        "Northeast India: The tropical forests of Assam, Meghalaya, Nagaland, and Mizoram contain some of India's highest biomass density. These forests are increasingly being integrated into voluntary carbon markets, and GEDI provides the verification backbone.",
      ],

      title: 'Why It Matters'
    },
    {
      type: 'paragraph',
      text: "NASA GEDI data India provides one of the most valuable datasets for biomass estimation in tropical forests where field measurements remain limited. The open availability through NASA's Earthdata platform means any carbon project developer, forest department, or MRV provider can access this data at no cost. The challenge lies in processing the raw waveforms extracting RH metrics, applying regional allometric models, fusing with SAR and optical data, and validating against field plots.",
    },

    {
      type: 'heading',
      level: 2,
      text: 'LiDAR-Derived **[[Carbon Credits|what-are-carbon-credits]]**: From Measurement to Market',
      id: 'lidar-carbon-credits',
    },
    {
      type: 'paragraph',
      text: 'LiDAR-derived **[[carbon credits|what-are-carbon-credits]]** represent the next generation of forest carbon finance credits backed by precise, three-dimensional measurement rather than statistical inference from two-dimensional satellite imagery. The use of LiDAR-derived **[[carbon credits|what-are-carbon-credits]]** follows a rigorous MRV framework with five key phases.',
    },
    {
      type: 'step-list',
      items: [
        {
          label: 'Baseline Establishment',
          text: 'LiDAR-derived carbon credits begin with an accurate baseline. GEDI waveforms and/or airborne LiDAR map the existing Above-Ground Biomass (AGB) at project start. This 3D baseline is far more accurate than default IPCC values, reducing conservative deductions and increasing credit value.',
        },
        {
          label: 'Additionality',
          text: 'Historical GEDI time-series (available since 2019) can demonstrate pre-project deforestation or degradation trends, providing a data-rich evidence base for additionality claims that strengthens LiDAR-derived carbon credits under any methodology.',
        },
        {
          label: 'Monitoring',
          text: 'Annual or biennial GEDI acquisitions track biomass change within the project boundary. Fused with continuous SAR and optical data, this produces monthly-to-annual biomass change maps capturing any losses from fire, degradation, or illegal logging.',
        },
        {
          label: 'Verification',
          text: 'Third-party auditors verify LiDAR-derived carbon credits by cross-checking LiDAR-based biomass estimates against a reserved 20% validation dataset of field plots. Because LiDAR uncertainty is quantifiable, verification is faster with smaller conservative deductions.',
        },
        {
          label: 'Credit Issuance',
          text: "After verification, LiDAR-derived carbon credits are issued under Verra VCS, Gold Standard, or India's CCTS. Each credit represents one tonne of CO\u2082-equivalent. Projects using LiDAR typically issue 15\u201330% more credits per hectare than equivalent projects using older precision methods.",
        },
      ],
    },
    {
      type: 'paragraph',
      text: 'The growing adoption of LiDAR-derived **[[carbon credits|what-are-carbon-credits]]** reflects a broader shift toward measurement-based carbon accounting. Registries like Verra are increasingly mandating higher-precision monitoring for large projects. IPCC Tier 3 accuracy which delivers the highest credit values and lowest discount rates is essentially only achievable with LiDAR as the primary height measurement tool.',
    },

    {
      type: 'heading',
      level: 2,
      text: "Sylithe's 3D Biomass Pipeline",
      id: 'sylithe-3d-pipeline',
    },
    {
      type: 'paragraph',
      text: "We have built a proprietary pipeline that integrates GEDI LiDAR waveforms with Sentinel-1 SAR and Sentinel-2 Optical data. Our process follows three steps:",
    },
    {
      type: 'why-it-matters',

      items: [
        'Calibration: We match local GEDI footprints to ground-truth inventory plots to build species-specific height-to-biomass models.',
        'Extrapolation: We use a Vision Transformer (ViT) to "Spread" the GEDI height information across the entire project area using the spectral and textural signatures from continuous satellites.',
        'Validation: We set aside 20% of the GEDI data to independently verify the accuracy of the final 3D map, ensuring the uncertainty is within the limits required by Tier 3 standards.',
      ],

      title: 'Why It Matters'
    },
    {
      type: 'image',
      src: biomass3DImg,
      alt: 'Sylithe 3D biomass pipeline combining GEDI LiDAR, SAR, and optical satellite imagery',
      caption: 'Sylithe combines GEDI LiDAR, SAR, and optical satellite imagery to generate project-scale biomass and carbon stock maps.',
    },

    {
      type: 'heading',
      level: 2,
      text: 'The Future: Drone-LiDAR and Beyond',
      id: 'lidar-future',
    },
    {
      type: 'paragraph',
      text: "While spaceborne LiDAR is great for landscapes, we use 'Drone-LiDAR' for high-value project validation. A drone flying at 50m with a LiDAR sensor can map every single tree in a forest with 2cm precision. This is the 'Digital Inventory' of the future, where every individual tree becomes a tagged, monitored carbon asset.",
    },

    { type: 'divider' },
    {
      type: 'bold-statement',
      text: 'In the carbon market of 2026, the vertical dimension is the only dimension that matters for **[[integrity|high-integrity-carbon-credits-icvcm-ccps]]**.',
    },
    {
      type: 'callout',
      title: 'Audit your forest structure',
      text: "Sylithe is the leader in 3D forest monitoring in India. We help project developers use GEDI and airborne LiDAR to reach Tier 3 biomass accuracy, reducing 'Conservative Deductions' and increasing credit value. If you are ready to see your forest in 3D, let's talk.",
    },
  ],
};