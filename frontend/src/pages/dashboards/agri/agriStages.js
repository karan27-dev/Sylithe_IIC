/**
 * Agroforestry + Biochar programme — stage definitions.
 *
 * One source of truth for the FPO/farmer pipeline so the sidebar, the flow
 * overview and each stage screen can never drift apart.
 *
 * Methodology constraints this pipeline is built around (Verra VM0047 v1.1,
 * census-based approach):
 *   • ≤ 50 planting units per hectare — above that the activity counts as
 *     land-use change and must use the heavier area-based approach instead.
 *   • Only trees planted BY the project are creditable; pre-existing trees
 *     are baseline and earn nothing.
 *   • Every planting unit is individually tagged (GPS + tag id) and its
 *     survival tracked each monitoring period.
 * Bund agroforestry (trees along field boundaries) is the design target: it
 * lands naturally at 30–50 trees/ha and costs the farmer no cropping area.
 */

/** Hard cap on planting density for the census-based approach (VM0047 v1.1). */
export const CENSUS_MAX_TREES_PER_HA = 50;

export const AGRI_GROUPS = [
  {
    id: 'onboarding',
    label: 'Agroforestry Program',
    badge: 'NEW',
    stages: [
      {
        key: 'agri_flow',
        code: 'S—',
        title: 'Programme Flow',
        blurb: 'The full FPO → farmer → credit pipeline, end to end.',
      },
      {
        key: 'agri_fpo',
        code: 'S0',
        title: 'FPO & Pools',
        blurb: 'Register the aggregator and open a pool farmers can join.',
        role: 'The FPO is the project proponent on the registry — not the farmer.',
        inputs: ['FPO registration no.', 'Board resolution', 'Member roster', 'Bank account'],
        outputs: ['Pool with district, target hectares, methodology', 'Revenue split locked before enrolment'],
      },
      {
        key: 'agri_enroll',
        code: 'S1',
        title: 'Farmer Enrolment',
        blurb: 'Six questions and a boundary. Nothing more.',
        role: 'Farmer registers as a participant and draws or walks their parcel.',
        inputs: ['Name + mobile (OTP)', 'Village / district', 'Land record ID', 'Parcel boundary',
                 'Current crop + season', 'Residue today: burn / sell / plough back'],
        outputs: ['Parcel polygon', 'Residue baseline — "I burn it" is the strongest one'],
      },
      {
        key: 'agri_eligibility',
        code: 'S2',
        title: 'Eligibility Screen',
        blurb: 'Automatic verdict the moment the polygon closes.',
        role: 'Satellite screening decides if the parcel can carry a census project.',
        inputs: ['Parcel geometry', 'Dynamic World land cover', 'Meta CHM canopy height',
                 'Registry polygons', 'MODIS / NBR burn history'],
        outputs: ['Eligible area + bund length', 'Max trees at ≤50/ha', 'Existing trees flagged as baseline',
                  'Double-claim rejection', 'Indicative annual value'],
      },
      {
        key: 'agri_agreements',
        code: 'S3',
        title: 'Agreements & Consent',
        blurb: 'Local-language agreement, digitally signed.',
        role: 'Registry-required consent and benefit-sharing record.',
        inputs: ['Revenue split %', 'Duration', 'Obligations', 'Exit terms'],
        outputs: ['Signed participation agreement per farmer', 'Audit trail for the VVB'],
      },
    ],
  },
  {
    id: 'census',
    label: 'Census & Monitoring',
    stages: [
      {
        key: 'agri_baseline',
        code: 'S4',
        title: 'Baseline Lock',
        blurb: 'Freeze the pre-planting state before a single sapling goes in.',
        role: 'Establishes what would have happened without the project.',
        inputs: ['Existing tree count', 'Land cover', '10-year land history', 'Matched control parcels'],
        outputs: ['Locked baseline', 'DCAB dynamic performance benchmark'],
      },
      {
        key: 'agri_census',
        code: 'S5',
        title: 'Tree Census',
        blurb: 'Every tree tagged, located and photographed.',
        role: 'The census obligation — the credit unit is the individual tree.',
        inputs: ['GPS point', 'Tag / QR id', 'Species', 'Planting date', 'Photo'],
        outputs: ['Per-tree register', `Live ≤${CENSUS_MAX_TREES_PER_HA}/ha cap enforcement`],
      },
      {
        key: 'agri_growth',
        code: 'S6',
        title: 'Growth & Survival',
        blurb: 'Canopy height each year; survival drives the credit.',
        role: 'Mortality is a crediting input, not an afterthought.',
        inputs: ['Meta CHM 1 m', 'Sentinel-2 NDVI', 'Field spot-checks'],
        outputs: ['Height + canopy per tree', 'Survival rate', 'Mortality deduction'],
      },
      {
        key: 'agri_burn',
        code: 'S6',
        title: 'Burn Watch',
        blurb: 'Residue burning has a 7–10 day evidence window.',
        role: 'Proves the residue was not burned — the biochar claim depends on it.',
        inputs: ['Sentinel-2 NBR drop', 'VIIRS / MODIS active fire'],
        outputs: ['Dated burn events per parcel', 'Breach alert', 'Clean-season record'],
      },
    ],
  },
  {
    id: 'biochar',
    label: 'Biochar Loop',
    stages: [
      {
        key: 'agri_residue',
        code: 'S7',
        title: 'Residue Ledger',
        blurb: 'Balance what is retained against what leaves the field.',
        role: 'Removing residue lowers soil carbon input. Track the split or you over-credit.',
        inputs: ['Crop + yield', 'Residue produced', 'Retained on field', 'Delivered to kiln'],
        outputs: ['Residue balance per parcel', 'Removable fraction cap on feedstock'],
      },
      {
        key: 'agri_biochar',
        code: 'S7',
        title: 'Biochar Batches',
        blurb: 'Measured at the kiln, not from space.',
        role: 'Satellite proves no burn; the kiln proves the carbon.',
        inputs: ['Feedstock mass', 'Moisture', 'Carbon fraction', 'Batch id → parcel'],
        outputs: ['Biochar tonnes', 'tCO2e per batch', 'Biochar returned to the farmer'],
      },
    ],
  },
  {
    id: 'credits',
    label: 'Credits & Payouts',
    stages: [
      {
        key: 'agri_verification',
        code: 'S8',
        title: 'Verification Pack',
        blurb: 'One evidence bundle for the auditor.',
        role: 'Everything the VVB needs, assembled automatically.',
        inputs: ['Baseline', 'Tree register + survival', 'Burn record', 'Biochar batches', 'Agreements'],
        outputs: ['Monitoring report', 'Issuance-ready evidence pack'],
      },
      {
        key: 'agri_payouts',
        code: 'S9',
        title: 'Revenue & Payouts',
        blurb: 'Credits sold, price, deductions, farmer-wise payment.',
        role: 'Registry rules require this disclosure — make it a screen, not a spreadsheet.',
        inputs: ['Credits issued per parcel', 'Sale price', 'FPO fee', 'Deductions'],
        outputs: ['Per-farmer payment', 'Upside share if prices rise', 'Payment receipt'],
      },
      {
        key: 'agri_portal',
        code: 'S10',
        title: 'Farmer Portal',
        blurb: 'Their land, their trees, their money.',
        role: 'The farmer-facing view — trees alive, land greening, money paid.',
        inputs: ['Tree register', 'NDVI trend', 'Burn record', 'Biochar returned', 'Payments'],
        outputs: ['Plain-language dashboard in the local language'],
      },
    ],
  },
];

/** Flat lookup: stage key → stage (plus its group). */
export const AGRI_STAGES = AGRI_GROUPS.flatMap((g) =>
  g.stages.map((s) => ({ ...s, group: g.label, groupId: g.id })),
);

export const getAgriStage = (key) => AGRI_STAGES.find((s) => s.key === key) || null;

/** True when `key` belongs to this programme (used to route sidebar clicks). */
export const isAgriSection = (key) => AGRI_STAGES.some((s) => s.key === key);
