/* ═══════════════════════════════════════════════════════
   SCOPE 1 — DIRECT EMISSIONS
═══════════════════════════════════════════════════════ */
export const SCOPE1_CATEGORIES = [
  {
    id: 's1_stationary', code: 'Scope 1.1', label: 'Stationary combustion',
    activities: [
      {
        id: 's1_natgas', label: 'Natural Gas (Activity)',
        desc: 'Provide natural gas consumption data from utility bills for boilers, heaters, and furnaces during the reporting period.',
        fullDetails: {
          why: 'Natural gas is one of the most common fuels used in commercial and industrial buildings for heating, hot water, cooking, and industrial processes. Combustion of natural gas directly releases CO₂, CH₄, and N₂O, making it a primary Scope 1 emission source. Accurate tracking is critical for GHG inventories and identifying energy efficiency opportunities.',
          sources: ['Boilers and space heating systems', 'Industrial furnaces and kilns', 'Hot water systems', 'Commercial kitchens and canteens', 'Combined heat and power (CHP) units'],
          whereToFind: ['Facilities management teams receive monthly gas utility bills.', 'Building management systems (BMS) may log real-time gas consumption.'],
          dataSources: ['Monthly gas utility bills', 'BMS or smart meter exports', 'Supplier invoices with volume data'],
          requiredData: ['Gas consumption (m³, kWh, or therms)', 'Billing period', 'Facility or meter ID'],
          additionalData: ['Meter location', 'Equipment type (boiler, furnace)', 'Gas supplier', 'Cost', 'Facility name', 'Any additional information'],
        },
      },
      {
        id: 's1_diesel_gen', label: 'Diesel Generators (Activity)',
        desc: 'Provide diesel consumption data for backup generators and stationary engines during the reporting period.',
        fullDetails: {
          why: 'Diesel generators are used for backup power, peak shaving, and in remote locations without grid access. Diesel combustion is carbon-intensive and also produces particulate matter and NOx. Tracking generator fuel use is essential for Scope 1 reporting and highlights opportunities to transition to battery storage or renewable alternatives.',
          sources: ['Backup/emergency generators', 'Peak-load generators', 'Construction site generators', 'Remote facility power supply'],
          whereToFind: ['Facilities or maintenance teams track diesel purchases and refueling logs.', 'Generator run-hour meters can also be used to estimate fuel use.'],
          dataSources: ['Diesel purchase invoices', 'Fuel delivery receipts', 'Generator run-hour logs', 'Tank dip records'],
          requiredData: ['Diesel consumed (litres)', 'Reporting period', 'Generator or facility ID'],
          additionalData: ['Generator capacity (kVA)', 'Run hours', 'Purpose (backup, continuous)', 'Facility location', 'Any additional information'],
        },
      },
      {
        id: 's1_other_fuels', label: 'Other Fuels (Activity)',
        desc: 'Provide consumption data for LPG, coal, biomass, fuel oil, or other fuels burned on-site during the reporting period.',
        fullDetails: {
          why: 'Many facilities use LPG for cooking and heating, fuel oil for industrial boilers, coal for process heat, or biomass for energy. Each fuel has a distinct emission factor. Capturing all stationary fuel types ensures a complete Scope 1 inventory and enables fuel-switching analysis toward lower-carbon alternatives.',
          sources: ['LPG for cooking and heating', 'Heavy fuel oil (HFO) for boilers', 'Coal for industrial kilns', 'Biomass (wood pellets, agricultural waste)', 'Kerosene and propane'],
          whereToFind: ['Procurement or facilities teams track fuel deliveries and storage levels.', 'Industrial operations teams maintain process fuel consumption logs.'],
          dataSources: ['Fuel purchase orders and invoices', 'Delivery receipts and tank records', 'Process control system exports'],
          requiredData: ['Fuel type', 'Quantity consumed (litres, kg, or tonnes)', 'Reporting period'],
          additionalData: ['Facility or equipment', 'Calorific value (if known)', 'Supplier', 'Cost', 'Purpose of use', 'Any additional information'],
        },
      },
    ],
  },
  {
    id: 's1_mobile', code: 'Scope 1.2', label: 'Mobile combustion',
    activities: [
      {
        id: 's1_vehicles', label: 'Company Vehicles (Activity)',
        desc: 'Provide fuel consumption or mileage data for all company-owned or leased vehicles during the reporting period.',
        fullDetails: {
          why: 'Company-owned and leased vehicles — including cars, vans, trucks, and buses — produce direct CO₂ emissions from fuel combustion. Fleet emissions are often a significant portion of Scope 1 for logistics, sales, and field-service organizations. Detailed tracking supports fleet electrification planning, route optimization, and fuel efficiency targets.',
          sources: ['Company cars (petrol, diesel, hybrid)', 'Delivery vans and trucks', 'Buses and shuttles', 'Motorcycles and two-wheelers'],
          whereToFind: ['Fleet management teams track fuel card transactions and odometer readings.', 'Fleet management software (e.g., Geotab, Teletrac) provides automated reports.'],
          dataSources: ['Fuel card transaction reports', 'Fleet management system exports', 'Odometer/mileage logs', 'Fuel purchase receipts'],
          requiredData: ['Vehicle type or class', 'Fuel type (petrol, diesel, CNG, electric)', 'Fuel consumed (litres) or distance (km)'],
          additionalData: ['Vehicle registration number', 'Engine size', 'Driver or department', 'Route/purpose', 'EV charging data', 'Any additional information'],
        },
      },
      {
        id: 's1_vehicles_est', label: 'Company Vehicles (Estimation)',
        desc: 'Provide fleet size and average mileage to estimate emissions from company vehicles.',
        fullDetails: {
          why: 'When detailed fuel records are unavailable, fleet size and average mileage can provide a reasonable estimate of vehicle emissions. This estimation approach is accepted by GHG Protocol when activity data is incomplete, though it carries higher uncertainty. It serves as a starting point that should be improved with actual fuel data over time.',
          sources: ['Estimated from fleet registry and average annual mileage', 'Industry-average fuel efficiency rates', 'Department-level vehicle allocation'],
          whereToFind: ['HR or admin teams maintain vehicle allocation lists.', 'Fleet insurance records show total number and type of vehicles.'],
          dataSources: ['Vehicle fleet register', 'Insurance policy vehicle lists', 'HR vehicle assignment records'],
          requiredData: ['Number of vehicles by type', 'Average annual distance per vehicle (km)', 'Fuel type per vehicle'],
          additionalData: ['Vehicle age/year', 'City vs highway split', 'Department allocation', 'Expected replacement date', 'Any additional information'],
        },
      },
      {
        id: 's1_offroad', label: 'Off-road Equipment (Activity)',
        desc: 'Provide fuel consumption data for forklifts, construction equipment, and other off-road machinery.',
        fullDetails: {
          why: 'Off-road mobile sources — forklifts, excavators, loaders, tractors, and generators on wheels — often use diesel or LPG and operate outside normal road vehicle tracking systems. These emissions are part of Scope 1 and can be significant in manufacturing, warehousing, agriculture, and construction operations.',
          sources: ['Diesel forklifts in warehouses', 'LPG-powered forklifts', 'Construction equipment (excavators, bulldozers)', 'Agricultural machinery (tractors)', 'Airport ground support equipment'],
          whereToFind: ['Warehouse and logistics teams track forklift fuel/charging.', 'Construction site managers maintain equipment fuel logs.'],
          dataSources: ['Equipment fuel log books', 'LPG cylinder purchase records', 'Diesel bulk fuel records for equipment', 'Equipment hour meters'],
          requiredData: ['Equipment type', 'Fuel type', 'Fuel consumed (litres or kg)'],
          additionalData: ['Equipment model/ID', 'Operating hours', 'Facility or site', 'Department', 'Any additional information'],
        },
      },
    ],
  },
  {
    id: 's1_process', code: 'Scope 1.3', label: 'Process emissions',
    activities: [
      {
        id: 's1_industrial', label: 'Industrial Process Emissions (Activity)',
        desc: 'Provide data on GHG emissions from chemical reactions and industrial processes (not from fuel combustion).',
        fullDetails: {
          why: 'Process emissions arise from chemical or physical transformations in manufacturing — not from burning fuel. Examples include CO₂ from cement clinker production, CO₂ from lime calcination, N₂O from nitric acid production, and PFCs from aluminium smelting. These emissions are often large and technically difficult to abate, making accurate measurement critical for long-term decarbonization planning.',
          sources: ['Cement and clinker production (calcination)', 'Lime and glass manufacturing', 'Ammonia and fertilizer production', 'Iron and steel production', 'Aluminium smelting (PFCs)'],
          whereToFind: ['Process engineering teams monitor chemical feedstock and product volumes.', 'Environmental compliance teams often calculate these for regulatory reporting.'],
          dataSources: ['Production volume records', 'Process stoichiometry calculations', 'Continuous Emissions Monitoring Systems (CEMS)', 'Environmental compliance reports'],
          requiredData: ['Process type', 'Production volume (tonnes)', 'Raw material input quantities'],
          additionalData: ['Emission factor used', 'Measurement methodology', 'Facility name', 'Product output', 'Regulatory permit reference', 'Any additional information'],
        },
      },
    ],
  },
  {
    id: 's1_fugitive', code: 'Scope 1.4', label: 'Fugitive emissions',
    activities: [
      {
        id: 's1_refrigerants', label: 'Refrigerants & AC Systems (Activity)',
        desc: 'Provide data on refrigerant gas leakage from air conditioning, chillers, and refrigeration equipment.',
        fullDetails: {
          why: 'Refrigerant gases (HFCs like R-410A, R-134a, R-407C) have extremely high Global Warming Potentials — often 1,000–4,000 times that of CO₂. Even small leaks from HVAC systems, chillers, cold rooms, and refrigerated transport can generate significant Scope 1 emissions. Tracking refrigerant top-ups and leakage rates is essential for any organization operating cooling equipment.',
          sources: ['Split and central air conditioning systems', 'Industrial chillers', 'Commercial refrigeration (cold rooms, display cases)', 'Refrigerated transport units', 'Heat pumps'],
          whereToFind: ['HVAC maintenance contractors log refrigerant top-ups and leak checks.', 'Facilities management maintains F-gas registers as required by regulation.'],
          dataSources: ['HVAC maintenance and service logs', 'F-gas registers', 'Refrigerant purchase receipts', 'Equipment leak-check certificates'],
          requiredData: ['Refrigerant type (R-410A, R-134a, etc.)', 'Quantity topped up or leaked (kg)', 'Equipment type'],
          additionalData: ['Equipment ID or location', 'GWP value of refrigerant', 'Date of service', 'Contractor name', 'Leak detection results', 'Any additional information'],
        },
      },
      {
        id: 's1_fire_sup', label: 'Fire Suppression Systems (Activity)',
        desc: 'Provide data on fire suppression gas discharges and refills during the reporting period.',
        fullDetails: {
          why: 'Fire suppression systems in server rooms, data centers, and industrial facilities often use gases with high GWP such as HFC-227ea, HFC-23, or CO₂. Both planned discharges (testing) and accidental releases must be reported. While quantities are typically small, the high GWP of some agents means even minor releases can be significant.',
          sources: ['HFC-based clean agent systems (FM-200/HFC-227ea)', 'CO₂ suppression systems', 'Halon systems (legacy)', 'Inert gas systems (Inergen, Novec)'],
          whereToFind: ['Fire safety or facilities teams maintain suppression system inspection and refill logs.', 'Fire system contractors provide service reports.'],
          dataSources: ['Fire suppression system service logs', 'Gas cylinder refill records', 'Annual fire system inspection reports'],
          requiredData: ['Suppression agent type', 'Quantity discharged or refilled (kg)', 'System location'],
          additionalData: ['Reason for discharge (test, incident)', 'GWP of agent', 'Equipment manufacturer', 'Service contractor', 'Any additional information'],
        },
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   SCOPE 2 — INDIRECT ENERGY EMISSIONS
═══════════════════════════════════════════════════════ */
export const SCOPE2_CATEGORIES = [
  {
    id: 's2_electricity', code: 'Scope 2.1', label: 'Purchased electricity',
    activities: [
      {
        id: 's2_elec_activity', label: 'Electricity (Activity)',
        desc: 'Provide electricity consumption data from utility bills for all facilities during the reporting period.',
        fullDetails: {
          why: 'Purchased electricity is typically the largest Scope 2 emission source for commercial and office-based organizations. The emissions depend on the electricity grid mix — regions with high coal usage have higher emission factors. Tracking electricity consumption by facility enables targeted energy efficiency programs, renewable energy procurement (PPAs, RECs), and progress toward RE100 or similar commitments.',
          sources: ['Office buildings and headquarters', 'Manufacturing facilities', 'Data centers and server rooms', 'Retail stores and warehouses', 'Street lighting and common areas'],
          whereToFind: ['Facilities management receives monthly electricity bills with kWh readings.', 'Smart meters and BMS systems provide real-time consumption data.'],
          dataSources: ['Monthly electricity utility bills', 'Smart meter data exports', 'Building management system (BMS) reports', 'Landlord utility statements (for leased spaces)'],
          requiredData: ['Electricity consumed (kWh)', 'Billing period', 'Facility or meter ID'],
          additionalData: ['Electricity supplier/tariff', 'Grid region', 'Peak vs off-peak split', 'Cost per kWh', 'Renewable energy percentage', 'Facility name/address', 'Any additional information'],
        },
      },
      {
        id: 's2_elec_estimation', label: 'Electricity (Estimation)',
        desc: 'Provide facility floor area and type to estimate electricity consumption where meter data is unavailable.',
        fullDetails: {
          why: 'When direct electricity meter data is unavailable — common for leased offices without sub-metering, coworking spaces, or small branch locations — estimation based on floor area and building type provides an acceptable proxy. While less accurate than metered data, it ensures completeness in your Scope 2 inventory.',
          sources: ['Estimated from floor area benchmarks (kWh/m²/year)', 'Building type intensity factors (office, retail, warehouse)', 'Regional energy intensity benchmarks'],
          whereToFind: ['Real estate or facilities teams know floor areas of all locations.', 'CIBSE, ASHRAE, or IEA publish energy intensity benchmarks by building type.'],
          dataSources: ['Lease agreements (floor area)', 'Building type classification', 'Industry benchmark databases'],
          requiredData: ['Floor area (m² or sq ft)', 'Building type (office, retail, warehouse)', 'Location/country'],
          additionalData: ['Number of employees at site', 'Operating hours per week', 'HVAC type', 'Year of construction', 'Any additional information'],
        },
      },
      {
        id: 's2_rec', label: 'Renewable Energy Certificates (Activity)',
        desc: 'Provide data on purchased RECs, I-RECs, or Guarantees of Origin to adjust your Scope 2 market-based emissions.',
        fullDetails: {
          why: 'Renewable Energy Certificates (RECs), International RECs (I-RECs), and Guarantees of Origin (GOs) allow organizations to claim zero-emission electricity under the GHG Protocol market-based accounting method. Uploading REC data ensures your market-based Scope 2 figure reflects your green power investments and supports RE100 reporting.',
          sources: ['Bundled RECs from PPA agreements', 'Unbundled REC purchases', 'I-RECs (international markets)', 'Green tariff certificates from utility'],
          whereToFind: ['Energy procurement or sustainability teams manage REC portfolios.', 'REC registries (e.g., APX, M-RETS, I-REC Standard) provide certificates.'],
          dataSources: ['REC/I-REC certificates', 'PPA contract documents', 'Green tariff confirmation from utility', 'Registry retirement statements'],
          requiredData: ['Certificate type (REC, I-REC, GO)', 'Quantity (MWh)', 'Generation technology (solar, wind, hydro)'],
          additionalData: ['Registry name', 'Certificate serial numbers', 'Generation facility location', 'Vintage year', 'Retirement date', 'Any additional information'],
        },
      },
    ],
  },
  {
    id: 's2_heat', code: 'Scope 2.2', label: 'Utilities',
    activities: [
      {
        id: 's2_district', label: 'District Heat, Steam & Cooling (Activity)',
        desc: 'Provide utility bills and/or invoices for district heating, steam, or cooling during the reporting period.',
        fullDetails: {
          why: 'District heating, steam, and cooling networks supply thermal energy to buildings from centralized plants. The emissions depend on the fuel mix of the district energy provider. This category is separate from electricity because thermal energy has different emission factors and is common in European cities, industrial parks, and campus settings.',
          sources: ['District heating from municipal networks', 'Industrial steam supply', 'District cooling systems', 'Campus-level thermal energy'],
          whereToFind: ['Facilities management receives invoices from the district energy provider.', 'Building meters track thermal energy consumption in MWh or GJ.'],
          dataSources: ['District energy invoices', 'Heat meter readings', 'Steam consumption logs', 'Cooling system billing statements'],
          requiredData: ['Energy consumed (MWh, GJ, or kWh)', 'Energy type (heat, steam, cooling)', 'Billing period'],
          additionalData: ['District energy provider name', 'Fuel mix of provider (if known)', 'Facility or building', 'Contract reference', 'Cost', 'Any additional information'],
        },
      },
      {
        id: 's2_utilities', label: 'Utilities (Activity)',
        desc: 'Upload PDFs or files containing electric, gas, HVAC refrigerant bills. For physical copies, ensure required data is visible.',
        fullDetails: {
          why: 'This catch-all activity allows uploading raw utility bills (electricity, gas, district energy) as scanned PDFs or spreadsheets. It is useful when bills combine multiple utility types or when the raw document is needed for audit trail purposes alongside structured data entry in other activities.',
          sources: ['Combined utility bills covering electricity and gas', 'HVAC maintenance invoices with refrigerant data', 'Landlord-provided utility cost allocations', 'Sub-metered tenant billings'],
          whereToFind: ['Finance or accounts payable teams receive and file utility invoices.', 'Facilities management archives utility documentation for audit.'],
          dataSources: ['Scanned utility bills (PDF)', 'Utility company online portal exports', 'Landlord cost allocation statements'],
          requiredData: ['Utility bill document (PDF, CSV, or Excel)', 'Billing period covered', 'Facility identifier'],
          additionalData: ['Utility account number', 'Meter serial number', 'Facility address', 'Any additional information'],
        },
      },
    ],
  },
];
