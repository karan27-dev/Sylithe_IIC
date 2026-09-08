import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Plus, Upload, X, CheckCircle2,
  AlertCircle, FileText, Trash2, Paperclip, Info,
  Building2, MoreVertical
} from 'lucide-react';
import { SCOPE1_CATEGORIES, SCOPE2_CATEGORIES } from './scopeData';

/* ═══════════════════════════════════════════════════════
   FILE ACCEPT TYPES
═══════════════════════════════════════════════════════ */
const ACCEPTED_FILES = '.csv,.xls,.xlsm,.xlsx';
const ACCEPTED_LABEL = 'csv, xls, xlsm, xlsx';

/* ═══════════════════════════════════════════════════════
   SCOPE 3 — FULL ESG-ANALYST ACTIVITY DATA
   Each activity has: label, desc, fullDetails (Learn More)
═══════════════════════════════════════════════════════ */
const SCOPE3_CATEGORIES = [
  {
    id: 'cat1', code: 'Scope 3.1', label: 'Purchased goods and services',
    activities: [
      {
        id: 'cat1_spend', label: 'Spend-based Procurement',
        desc: 'Provide total spend on purchased goods and services during the reporting period.',
        unit: '₹ or $', factor: 0.0001,
        fullDetails: {
          why: 'Purchased goods and services typically represent the single largest category within Scope 3 for most organizations. This data is essential because it captures the cradle-to-gate emissions of products and services your company purchases. Understanding this category helps identify high-emission suppliers and product lines, enabling targeted decarbonization strategies throughout the value chain.',
          sources: ['Raw material extraction', 'Manufacturing & processing', 'Transportation to supplier', 'Packaging materials', 'Third-party services (IT, consulting, marketing)'],
          whereToFind: ['Procurement or finance teams can export purchase ledgers and accounts payable data.', 'ERP systems (SAP, Oracle, NetSuite) typically store detailed spend records.'],
          dataSources: ['Accounts payable reports', 'Purchase order databases', 'Supplier invoices', 'ERP system exports'],
          requiredData: ['Date of purchase', 'Spend amount (₹ or $)', 'Supplier name', 'Product/service category'],
          additionalData: ['Supplier country of origin', 'Product weight or volume', 'Material type', 'NAICS / UNSPC product code', 'Facility or business unit', 'Any additional notes'],
        },
      },
      {
        id: 'cat1_supplier', label: 'Supplier-specific Data',
        desc: 'Provide emission data received directly from suppliers for purchased goods.',
        unit: 'tCO₂e', factor: 1,
        fullDetails: {
          why: 'Supplier-specific emission data is the most accurate method for calculating Scope 3.1 emissions. When suppliers provide their own product-level carbon footprint data (e.g., via Product Carbon Footprints or Environmental Product Declarations), it replaces estimated spend-based calculations with verified figures, significantly improving data quality and audit-readiness.',
          sources: ['Supplier-reported product carbon footprints (PCFs)', 'Environmental Product Declarations (EPDs)', 'Life Cycle Assessment (LCA) reports', 'Supplier sustainability disclosures'],
          whereToFind: ['Request directly from key suppliers via sustainability questionnaires.', 'Industry databases like Ecoinvent, GaBi, or DEFRA may provide proxy data.'],
          dataSources: ['Supplier sustainability reports', 'CDP supply chain program responses', 'Direct supplier engagement surveys'],
          requiredData: ['Supplier name', 'Product or material', 'Emission value (tCO₂e)'],
          additionalData: ['Scope of emissions covered', 'Methodology used (LCA standard)', 'Third-party verification status', 'Reporting period', 'Product quantity purchased'],
        },
      },
    ],
  },
  {
    id: 'cat2', code: 'Scope 3.2', label: 'Capital goods',
    activities: [
      {
        id: 'cat2_spend', label: 'Capital Expenditure',
        desc: 'Provide total spend on capital goods (machinery, equipment, buildings) during the reporting period.',
        unit: '₹ or $', factor: 0.00008,
        fullDetails: {
          why: 'Capital goods are assets with a long useful life such as machinery, buildings, vehicles, and IT infrastructure. Their embodied emissions — from mining raw materials through manufacturing — are significant but often overlooked. Unlike purchased goods (3.1), capital goods are amortized over years, so understanding their emissions upfront helps in sustainable procurement and investment planning.',
          sources: ['Manufacturing of machinery and equipment', 'Construction of buildings and facilities', 'Production of IT hardware (servers, computers)', 'Vehicle manufacturing', 'Furniture and fixtures production'],
          whereToFind: ['Finance teams maintain capital expenditure (CapEx) records in annual budgets.', 'Fixed asset registers typically contain purchase dates, values, and categories.'],
          dataSources: ['CapEx budget reports', 'Fixed asset register', 'Depreciation schedules', 'Project-level procurement records'],
          requiredData: ['Date of acquisition', 'Capital expenditure amount (₹ or $)', 'Asset category (building, machinery, IT, vehicle)'],
          additionalData: ['Manufacturer / supplier', 'Asset useful life', 'Material composition', 'Country of manufacture', 'Facility or location', 'Any additional notes'],
        },
      },
    ],
  },
  {
    id: 'cat3', code: 'Scope 3.3', label: 'Fuel and energy-related activities',
    activities: [
      {
        id: 'cat3_upstream', label: 'Upstream Energy Emissions',
        desc: 'Provide information on well-to-tank emissions and T&D losses for purchased electricity, heat, and fuels.',
        unit: 'kWh', factor: 0.035,
        fullDetails: {
          why: 'This category captures emissions that occur in the energy supply chain but are not included in Scope 1 (fuel combustion) or Scope 2 (purchased electricity). It includes well-to-tank (WTT) emissions from extraction, refining, and transportation of fuels, as well as transmission and distribution (T&D) losses in electricity grids. These "upstream" energy emissions can add 5–20% on top of Scope 1+2.',
          sources: ['Extraction and refining of fuels (diesel, petrol, natural gas, LPG)', 'Transportation of fuels to point of use', 'Electricity transmission & distribution losses', 'Mining and processing of coal or biomass'],
          whereToFind: ['Facilities or operations teams track fuel purchases and electricity consumption.', 'This data often mirrors Scope 1 and 2 data with different emission factors applied.'],
          dataSources: ['Energy utility bills', 'Fuel purchase records', 'Building management system exports', 'Scope 1 & 2 activity data (same quantities, different factors)'],
          requiredData: ['Energy type (electricity, diesel, natural gas, etc.)', 'Quantity consumed (kWh, litres, or m³)', 'Reporting period'],
          additionalData: ['Grid region or electricity supplier', 'Fuel grade', 'Facility or site location', 'Renewable energy certificates (RECs)', 'Any additional notes'],
        },
      },
    ],
  },
  {
    id: 'cat4', code: 'Scope 3.4', label: 'Upstream transportation and distribution',
    activities: [
      {
        id: 'cat4_road', label: 'Road Freight',
        desc: 'Provide information on all road freight transportation during the reporting period.',
        unit: 'tonne-km', factor: 0.089,
        fullDetails: {
          why: 'Road freight is often the dominant mode of upstream goods transportation, especially for last-mile and regional distribution. Heavy-duty vehicles running on diesel contribute significantly to Scope 3 emissions. Tracking road freight helps identify opportunities for route optimization, fleet electrification, and modal shifts to lower-carbon alternatives.',
          sources: ['Truck and lorry transportation of raw materials', 'LTL (Less-Than-Truckload) shipments', 'Container trucking to/from ports', 'Refrigerated transport'],
          whereToFind: ['Logistics or supply chain teams maintain freight records.', 'Third-party logistics (3PL) providers can supply transport data.'],
          dataSources: ['Freight invoices', '3PL provider reports', 'Transport management system (TMS) exports', 'Bill of lading documents'],
          requiredData: ['Weight of goods (tonnes)', 'Distance transported (km)', 'Or: tonne-km value directly'],
          additionalData: ['Vehicle type (HGV, LCV, refrigerated)', 'Fuel type (diesel, CNG, electric)', 'Route origin and destination', 'Carrier name', 'Shipment ID', 'Any additional notes'],
        },
      },
      {
        id: 'cat4_rail', label: 'Rail Freight',
        desc: 'Provide weight and distance data for rail-based logistics.',
        unit: 'tonne-km', factor: 0.028,
        fullDetails: {
          why: 'Rail freight is significantly less carbon-intensive per tonne-km compared to road transport (up to 75% lower). Tracking rail usage separately helps demonstrate modal shift achievements and supports decarbonization strategies that prioritize rail over road for long-distance bulk transport.',
          sources: ['Bulk material rail shipments', 'Intermodal container rail transport', 'Industrial siding deliveries'],
          whereToFind: ['Rail freight operators provide consignment and tonnage data.', 'Logistics teams or 3PL providers managing multi-modal supply chains.'],
          dataSources: ['Railway consignment notes', 'Freight operator invoices', 'Intermodal transport records'],
          requiredData: ['Weight of goods (tonnes)', 'Distance transported (km)'],
          additionalData: ['Rail operator name', 'Route (origin/destination)', 'Cargo type', 'Electric vs diesel traction', 'Any additional notes'],
        },
      },
      {
        id: 'cat4_sea', label: 'Sea Freight',
        desc: 'Provide data for ocean shipping during the reporting period.',
        unit: 'tonne-km', factor: 0.016,
        fullDetails: {
          why: 'Maritime shipping is the backbone of global trade, carrying over 80% of international goods. While per-unit emissions are lower than road or air, the sheer volumes make it a material Scope 3 category. Understanding sea freight emissions enables carrier selection, route optimization, and participation in clean shipping initiatives like Poseidon Principles.',
          sources: ['Container shipping (FCL/LCL)', 'Bulk carrier transport', 'Tanker shipments', 'Roll-on/Roll-off (RoRo) services'],
          whereToFind: ['International shipping companies and freight forwarders provide bills of lading with tonnage and route data.', 'Customs and trade compliance departments maintain import/export records.'],
          dataSources: ['Bills of lading', 'Shipping line invoices', 'Freight forwarder reports', 'Customs declarations'],
          requiredData: ['Weight of goods (tonnes)', 'Distance shipped (nautical miles or km)'],
          additionalData: ['Vessel type (container, bulk, tanker)', 'Shipping line / carrier', 'Port of origin and destination', 'Container size (TEU)', 'Fuel type (HFO, VLSFO, LNG)', 'Any additional notes'],
        },
      },
      {
        id: 'cat4_air_freight', label: 'Air Freight',
        desc: 'Provide data for air cargo shipments during the reporting period.',
        unit: 'tonne-km', factor: 0.602,
        fullDetails: {
          why: 'Air freight has the highest carbon intensity of any freight mode — roughly 40–50x more than sea freight per tonne-km. Even small volumes of air-shipped goods can dominate a company\'s transport emissions. Identifying air freight usage is critical for emission hotspot analysis and evaluating whether slower, lower-carbon modes are viable alternatives.',
          sources: ['Express and overnight cargo shipments', 'Perishable goods (pharma, food)', 'High-value or time-sensitive components', 'E-commerce returns and urgent deliveries'],
          whereToFind: ['Express courier services (DHL, FedEx, UPS) provide shipment reports.', 'Procurement or operations teams track air freight spend and volume.'],
          dataSources: ['Air waybills (AWBs)', 'Courier/express service invoices', 'Freight forwarder consolidated reports'],
          requiredData: ['Weight of goods (tonnes)', 'Distance shipped (km)'],
          additionalData: ['Carrier / airline', 'Origin and destination airports', 'Shipment type (express, standard)', 'Any additional notes'],
        },
      },
    ],
  },
  {
    id: 'cat5', code: 'Scope 3.5', label: 'Waste generated in operations',
    activities: [
      {
        id: 'cat5_landfill', label: 'Landfill Waste',
        desc: 'Provide total weight of waste sent to landfill during the reporting period.',
        unit: 'tonnes', factor: 0.586,
        fullDetails: {
          why: 'Landfill waste generates methane (CH₄) as organic matter decomposes anaerobically — a greenhouse gas 28x more potent than CO₂ over 100 years. Tracking landfilled waste is essential for zero-waste-to-landfill targets, circular economy strategies, and compliance with waste hierarchy regulations that prioritize reduce, reuse, and recycle over disposal.',
          sources: ['General office waste', 'Canteen and food waste', 'Manufacturing rejects and off-cuts', 'Construction & demolition debris', 'Non-recyclable packaging'],
          whereToFind: ['Facilities management teams track waste contractor pickups.', 'Waste contractors provide monthly tonnage reports and waste transfer notes.'],
          dataSources: ['Waste transfer notes', 'Contractor collection reports', 'Municipal waste bills', 'Waste management platform exports'],
          requiredData: ['Weight of waste (tonnes)', 'Waste type (general, organic, mixed)'],
          additionalData: ['Waste contractor name', 'Landfill site location', 'Facility or building', 'Diversion rate target', 'Any additional notes'],
        },
      },
      {
        id: 'cat5_recycle', label: 'Recycled Waste',
        desc: 'Provide total weight of waste sent for recycling.',
        unit: 'tonnes', factor: 0.021,
        fullDetails: {
          why: 'While recycling is far better than landfill from an emissions standpoint, the collection, sorting, and reprocessing of recyclable materials still produces some emissions. Tracking recycled volumes helps demonstrate diversion rates, supports circular economy reporting, and quantifies the emissions benefit compared to virgin material production.',
          sources: ['Paper and cardboard recycling', 'Plastic recycling', 'Metal and aluminium scrap', 'Glass recycling', 'Electronic waste (WEEE) recycling'],
          whereToFind: ['Waste management companies provide recycling tonnage certificates.', 'Facilities teams track recycling bin collections and weights.'],
          dataSources: ['Recycling certificates', 'Waste contractor monthly reports', 'Material Recovery Facility (MRF) receipts'],
          requiredData: ['Weight of recycled waste (tonnes)', 'Material type (paper, plastic, metal, glass, e-waste)'],
          additionalData: ['Recycling contractor', 'Facility or site', 'Contamination rate', 'Revenue from recyclables (if any)', 'Any additional notes'],
        },
      },
      {
        id: 'cat5_incinerate', label: 'Incinerated Waste',
        desc: 'Provide total weight of waste sent for incineration or energy-from-waste.',
        unit: 'tonnes', factor: 0.932,
        fullDetails: {
          why: 'Incineration (including energy-from-waste) combusts waste materials, releasing CO₂ and other emissions. Although it diverts waste from landfill and can recover energy, the carbon intensity is high — especially for plastics derived from fossil fuels. Accurate tracking helps evaluate whether waste prevention or alternative treatment methods could further reduce emissions.',
          sources: ['Hazardous waste incineration', 'Clinical/medical waste', 'Non-recyclable plastics', 'Energy-from-waste facilities', 'Industrial process waste'],
          whereToFind: ['Hazardous waste management contractors provide disposal certificates.', 'Facilities teams track incineration pickups and duty-of-care documentation.'],
          dataSources: ['Hazardous waste consignment notes', 'Incineration certificates', 'Energy-from-waste facility reports'],
          requiredData: ['Weight of incinerated waste (tonnes)', 'Waste type (hazardous, clinical, general, plastic)'],
          additionalData: ['Incineration facility name', 'Energy recovery (yes/no)', 'Facility or site', 'Regulatory waste codes', 'Any additional notes'],
        },
      },
    ],
  },
  {
    id: 'cat6', code: 'Scope 3.6', label: 'Business travel',
    activities: [
      {
        id: 'cat6_air', label: 'Air Travel',
        desc: 'Provide information on all flights taken during the reporting period.',
        unit: 'km', factor: 0.000255,
        fullDetails: {
          why: 'Business travel emissions come from activities that take place while employees are traveling for work. Air travel emissions can be a primary source of Scope 3 business travel emissions due to the high emissions of burning jet fuel and the distances traveled.',
          sources: ['Airplane fuel', 'Airport services', 'Maintenance'],
          whereToFind: ['Third-party travel agents, operations, HR, or finance teams should be able to pull travel reports or reimbursement information.'],
          dataSources: ['Travel agency automatic tracking report', 'Internal reimbursement systems', 'Travel management system'],
          requiredData: ['Date', 'Origin/destination or distance', 'Seat class'],
          additionalData: ['Trip type', 'Airline', 'Ticket cost', 'Trip ID', 'Flight number', 'Traveler', 'Booking date', 'Facility', 'Business division', 'Any additional information'],
        },
      },
      {
        id: 'cat6_hotel', label: 'Accommodations',
        desc: 'Provide information on all accommodations provided during the reporting period.',
        unit: 'nights', factor: 0.0209,
        fullDetails: {
          why: 'Hotel stays during business travel contribute to Scope 3 emissions through energy consumption for heating, cooling, lighting, laundry, and food services within the accommodation. The emissions vary significantly by hotel type, location, and star rating. Tracking accommodation data helps identify opportunities to select lower-carbon lodging options and set sustainable travel policies.',
          sources: ['Hotel electricity and gas consumption', 'HVAC systems', 'Laundry and housekeeping services', 'In-hotel food & beverage', 'Swimming pools and leisure facilities'],
          whereToFind: ['Corporate travel management companies (TMCs) maintain booking records.', 'Expense management systems capture hotel receipts and reimbursements.'],
          dataSources: ['Travel management company reports', 'Expense reimbursement records', 'Corporate credit card statements', 'Hotel booking confirmations'],
          requiredData: ['Number of room nights', 'Hotel location (country/city)'],
          additionalData: ['Hotel name or chain', 'Star rating', 'Room cost per night', 'Traveler name', 'Check-in / check-out dates', 'Booking reference', 'Business purpose', 'Any additional information'],
        },
      },
      {
        id: 'cat6_ground', label: 'Ground Transportation',
        desc: 'Provide information on all ground transportation by mode of transport during the reporting period.',
        unit: 'km', factor: 0.000171,
        fullDetails: {
          why: 'Ground transportation during business travel — including rental cars, trains, buses, and ride-hail services — contributes to Scope 3 emissions. While typically lower per-km than air travel, ground transport can be material for organizations with large field teams, sales forces, or regional operations that rely heavily on driving.',
          sources: ['Rental car fuel consumption', 'Train journeys (diesel and electric)', 'Bus and coach travel', 'Company car mileage for business trips'],
          whereToFind: ['Travel management companies track ground transport bookings.', 'Mileage reimbursement records from HR or finance departments.'],
          dataSources: ['Rental car invoices', 'Train booking confirmations', 'Mileage reimbursement claims', 'Corporate travel card statements'],
          requiredData: ['Mode of transport (car, train, bus)', 'Distance traveled (km)'],
          additionalData: ['Vehicle type or size', 'Fuel type (petrol, diesel, electric, hybrid)', 'Route (origin/destination)', 'Rental company', 'Cost', 'Traveler', 'Trip purpose', 'Any additional information'],
        },
      },
      {
        id: 'cat6_taxi', label: 'Taxi or Automobiles',
        desc: 'Provide data for taxi and hired vehicle travel during the reporting period.',
        unit: 'km', factor: 0.000149,
        fullDetails: {
          why: 'Taxi, ride-hailing (Uber, Ola, Lyft), and hired car services used by employees for business purposes contribute to Scope 3 emissions. These trips are often short-distance but frequent, particularly for airport transfers, client meetings, and inter-office travel. Consolidating this data helps set policies for greener alternatives like pooled rides or public transit.',
          sources: ['Airport and station transfers', 'Client site visits', 'Inter-office travel', 'Event and conference transport'],
          whereToFind: ['Ride-hailing apps (Uber, Ola) provide downloadable ride history for business accounts.', 'Expense reimbursement systems capture taxi receipts.'],
          dataSources: ['Uber/Ola Business trip exports', 'Taxi receipt reimbursements', 'Corporate account ride reports', 'Expense management platforms'],
          requiredData: ['Distance traveled (km)', 'Or: fare amount as a spend-based proxy'],
          additionalData: ['Service provider (Uber, Ola, local taxi)', 'Vehicle type (sedan, SUV, electric)', 'Trip date', 'Origin/destination', 'Traveler', 'Business purpose', 'Any additional information'],
        },
      },
      {
        id: 'cat6_food', label: 'Food and Beverages',
        desc: 'Provide data for meals and food expenses incurred during business travel.',
        unit: '₹ or $', factor: 0.00039,
        fullDetails: {
          why: 'Food and beverage consumption during business travel has an associated carbon footprint from agricultural production, food processing, transportation, cooking, and waste. While per-meal emissions are small, they aggregate over thousands of employee-days of travel. Tracking this helps set sustainable procurement guidelines for events and per-diem policies.',
          sources: ['Restaurant and dining emissions', 'Hotel breakfast and meal plans', 'Conference and event catering', 'In-flight meal services'],
          whereToFind: ['Expense management systems capture meal receipts and per-diem claims.', 'Corporate credit card statements itemize food and beverage charges.'],
          dataSources: ['Expense reimbursement records', 'Per-diem allowance reports', 'Event catering invoices', 'Corporate card food transactions'],
          requiredData: ['Total food & beverage spend (₹ or $)'],
          additionalData: ['Type of meal (breakfast, lunch, dinner)', 'Dining venue type (hotel, restaurant, fast food)', 'Number of attendees', 'Event name', 'Location', 'Any additional information'],
        },
      },
    ],
  },
  {
    id: 'cat7', code: 'Scope 3.7', label: 'Employee commuting',
    activities: [
      {
        id: 'cat7_commute', label: 'Employee Commuting and Work-from-Home',
        desc: 'Provide commuting data for employees across all offices for the reporting period.',
        unit: 'km', factor: 0.000170,
        fullDetails: {
          why: 'Employee commuting captures the daily travel of employees between home and office. This is often a significant Scope 3 category, especially for large organizations with thousands of employees driving personal vehicles. It also includes work-from-home (WFH) energy consumption, which has become relevant post-pandemic. Understanding commuting patterns helps design hybrid work policies, promote public transit subsidies, and plan EV charging infrastructure.',
          sources: ['Personal vehicle commuting (petrol/diesel)', 'Public transit (bus, metro, train)', 'Two-wheeler commuting', 'Ride-sharing and carpooling', 'Work-from-home electricity and heating'],
          whereToFind: ['HR departments can provide employee headcount, office locations, and work-from-home policies.', 'Employee commuting surveys collect mode, distance, and frequency data.'],
          dataSources: ['Employee commuting surveys', 'HR headcount data by office location', 'Public transit subsidy records', 'Parking pass or access card data'],
          requiredData: ['Number of employees', 'Average commuting distance (km one-way)', 'Primary mode of transport', 'Working days per year'],
          additionalData: ['Office location', 'WFH days per week', 'Vehicle type (car, bike, bus, metro)', 'Fuel type', 'Carpooling participation rate', 'EV charger availability', 'Any additional information'],
        },
      },
    ],
  },
  {
    id: 'cat8', code: 'Scope 3.9', label: 'Downstream transportation and distribution',
    activities: [
      {
        id: 'cat8_downstream', label: 'Downstream Logistics',
        desc: 'Provide data for transportation and distribution of sold products to end customers.',
        unit: 'tonne-km', factor: 0.089,
        fullDetails: {
          why: 'Downstream transportation covers the movement of your sold products from your gate to the end customer. This includes outbound logistics, last-mile delivery, and distribution through retail channels. For companies selling physical products, this category can be material especially with the rise of e-commerce and express delivery expectations that favor carbon-intensive air and road transport.',
          sources: ['Outbound road freight to warehouses/retailers', 'Last-mile delivery services', 'E-commerce parcel shipping', 'Cold chain distribution', 'Export shipping'],
          whereToFind: ['Sales and logistics teams track outbound shipment volumes.', 'Distribution partners and 3PL providers can supply weight and distance data.'],
          dataSources: ['Outbound shipping records', 'Distribution partner reports', 'E-commerce platform shipping data', 'Warehouse management system (WMS) exports'],
          requiredData: ['Weight of goods shipped (tonnes)', 'Distance to customer (km)', 'Mode of transport (road, rail, sea, air)'],
          additionalData: ['Logistics provider / carrier', 'Destination region or country', 'Product category', 'Delivery speed (standard, express)', 'Vehicle type (van, HGV, electric)', 'Any additional information'],
        },
      },
    ],
  },
];

const FY_YEARS = ['FY 2024', 'FY 2025', 'FY 2026'];

/* ═══════════════════════════════════════════════════════
   LEARN MORE SIDE PANEL (Full Details — Carbon Direct style)
═══════════════════════════════════════════════════════ */
const LearnMorePanel = ({ activity, uploadedFiles, onClose, onUploadFile }) => {
  const d = activity.fullDetails;

  const handleUpload = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = ACCEPTED_FILES;
    inp.multiple = true;
    inp.onchange = (e) => onUploadFile(activity.id, Array.from(e.target.files));
    inp.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-[520px] bg-white h-full flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-bold text-[#0F172A]">Learn more</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-5 my-5 border border-gray-200 rounded-xl p-6">
            <h3 className="text-[15px] font-bold text-[#0F172A] mb-5">
              {activity.label} <span className="font-normal text-gray-400">(Activity)</span>
            </h3>

            {/* Why do we need this? */}
            <div className="mb-5">
              <h4 className="text-[13px] font-bold text-[#0F172A] mb-2">Why do we need this?</h4>
              <p className="text-[13px] text-gray-600 leading-relaxed">{d.why}</p>
            </div>

            {/* Common emissions sources */}
            <div className="mb-5">
              <h4 className="text-[13px] font-bold text-[#0F172A] mb-2">Common emissions sources include:</h4>
              <ul className="space-y-1">
                {d.sources.map((s, i) => (
                  <li key={i} className="text-[13px] text-gray-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Where to find this data */}
            <div className="mb-5">
              <h4 className="text-[13px] font-bold text-[#0F172A] mb-2">Where to find this data?</h4>
              <ul className="space-y-1.5">
                {d.whereToFind.map((w, i) => (
                  <li key={i} className="text-[13px] text-gray-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
              {d.dataSources && (
                <div className="mt-2 ml-4">
                  <p className="text-[13px] text-gray-600 font-semibold mb-1">Common data sources include:</p>
                  <ul className="space-y-0.5">
                    {d.dataSources.map((ds, i) => (
                      <li key={i} className="text-[13px] text-gray-500 flex items-start gap-2 ml-2">
                        <span className="mt-2 w-1 h-1 bg-gray-300 rounded-full shrink-0" />
                        {ds}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* What data do we need? */}
            <div className="mb-5">
              <h4 className="text-[13px] font-bold text-[#0F172A] mb-3">What data do we need?</h4>
              <div className="flex gap-8">
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Required Data:</p>
                  <ul className="space-y-1">
                    {d.requiredData.map((r, i) => (
                      <li key={i} className="text-[13px] text-gray-600 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Additional Recommended Data:</p>
                  <ul className="space-y-1">
                    {d.additionalData.map((a, i) => (
                      <li key={i} className="text-[13px] text-gray-500 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Accepted file formats */}
            <div className="mb-2">
              <h4 className="text-[13px] font-bold text-[#0F172A] mb-1">Accepted file formats:</h4>
              <p className="text-[13px] text-gray-600">{ACCEPTED_LABEL}</p>
            </div>
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="mx-5 mb-5 border border-gray-200 rounded-xl p-4">
              <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-3">Uploaded Files</h4>
              <div className="space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <FileText size={14} className="text-emerald-600 shrink-0" />
                    <span className="text-[12px] font-medium text-[#0F172A] flex-1 truncate">{f.name}</span>
                    <span className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Upload button */}
        <div className="border-t border-gray-200 px-6 py-4 shrink-0 flex justify-end">
          <button onClick={handleUpload}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#08292F] text-white rounded-xl text-sm font-bold hover:bg-[#062125] transition-all shadow-sm active:scale-95">
            <Upload size={15} /> Add data
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ACTIVITY ROW (matches Carbon Direct UI exactly)
═══════════════════════════════════════════════════════ */
const ActivityRow = ({ activity, files, onAddData, onViewDetails }) => {
  const actFiles = files[activity.id] || [];
  const totalTasks = 1;
  const completedTasks = actFiles.length > 0 ? 1 : 0;

  return (
    <div className="flex items-center py-4 px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
      {/* Activity info */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-[13px] font-semibold text-[#0F172A] leading-snug">
          {activity.label} <span className="text-gray-400 font-normal">(Activity)</span>
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed max-w-[480px]">{activity.desc}</p>
        <button onClick={() => onViewDetails(activity)}
          className="text-[11px] font-bold text-[#08292F] hover:underline mt-1 inline-block">
          Full details
        </button>
      </div>

      {/* Tasks remaining */}
      <div className="w-[160px] shrink-0 text-center">
        <span className="text-[13px] font-medium text-gray-600">
          {completedTasks} of {totalTasks} <span className="text-gray-300 ml-0.5">›</span>
        </span>
      </div>

      {/* Uploaded files */}
      <div className="w-[160px] shrink-0 text-center">
        <span className="text-[13px] font-medium text-gray-600">
          {actFiles.length} <span className="text-gray-300 ml-0.5">›</span>
        </span>
      </div>

      {/* Add data */}
      <div className="w-[130px] shrink-0 flex justify-end">
        <button onClick={() => onAddData(activity)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#08292F] text-white rounded-lg text-[12px] font-bold hover:bg-[#062125] transition-all shadow-sm active:scale-95">
          <Plus size={13} /> Add data
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   CATEGORY ACCORDION
═══════════════════════════════════════════════════════ */
const CategoryAccordion = ({ category, files, onAddData, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);
  const totalFiles = category.activities.reduce((sum, a) => sum + (files[a.id]?.length || 0), 0);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
      >
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-[#0F172A]">{category.label}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{category.code}</p>
        </div>
        {totalFiles > 0 && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            {totalFiles} file{totalFiles > 1 ? 's' : ''}
          </span>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-t border-gray-100">
              {category.activities.map(activity => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  files={files}
                  onAddData={onAddData}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   DATA MANAGEMENT — MAIN EXPORT
═══════════════════════════════════════════════════════ */
const DataManagement = ({ onScope3Change }) => {
  const [selectedFY, setSelectedFY] = useState('FY 2025');
  const [fyDropdown, setFyDropdown] = useState(false);
  const [activeScope, setActiveScope] = useState('scope3');
  const [files, setFiles] = useState({}); // { activityId: [File, File, ...] }
  const [detailsPanel, setDetailsPanel] = useState(null); // activity object

  // Notify parent of total uploaded files count (as a proxy for scope 3 progress)
  useEffect(() => {
    const totalFiles = Object.values(files).reduce((s, arr) => s + arr.length, 0);
    // Rough CO2e estimate: 0.5 tCO2e per uploaded file as placeholder
    onScope3Change?.(totalFiles * 0.5);
  }, [files, onScope3Change]);

  const handleAddData = useCallback((activity) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = ACCEPTED_FILES;
    inp.multiple = true;
    inp.onchange = (e) => {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => ({
        ...prev,
        [activity.id]: [...(prev[activity.id] || []), ...newFiles],
      }));
    };
    inp.click();
  }, []);

  const handleUploadFromPanel = useCallback((activityId, newFiles) => {
    setFiles(prev => ({
      ...prev,
      [activityId]: [...(prev[activityId] || []), ...newFiles],
    }));
  }, []);

  const totalUploaded = Object.values(files).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* ── STICKY HEADER ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-[#0F172A]">Operations Emissions</h1>

            {/* FY Dropdown */}
            <div className="relative">
              <button onClick={() => setFyDropdown(!fyDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold text-[#0F172A] hover:bg-gray-50 transition-all">
                {selectedFY}
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {fyDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden min-w-[140px]">
                  {FY_YEARS.map(fy => (
                    <button key={fy} onClick={() => { setSelectedFY(fy); setFyDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors
                        ${fy === selectedFY ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700'}`}>
                      {fy}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status badge */}
            <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide border
              ${totalUploaded > 0
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}>
              {totalUploaded > 0 ? 'In Progress' : 'Not Started'}
            </span>
          </div>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center gap-1 mt-5 border-b border-gray-100 -mb-5 -mx-8 px-8">
          {[
            { id: 'scope1', label: 'Scope 1' },
            { id: 'scope2', label: 'Scope 2' },
            { id: 'scope3', label: 'Scope 3' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveScope(tab.id)}
              className={`px-5 py-3 text-[13px] font-bold border-b-2 transition-all
                ${activeScope === tab.id
                  ? 'border-[#08292F] text-[#0F172A]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAF9]">
        {(() => {
          const scopeMap = { scope1: SCOPE1_CATEGORIES, scope2: SCOPE2_CATEGORIES, scope3: SCOPE3_CATEGORIES };
          const cats = scopeMap[activeScope] || [];
          return (
            <div className="bg-white mx-6 my-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="flex-1">Data type</div>
                <div className="w-[160px] text-center">Tasks remaining <Info size={10} className="inline ml-0.5" /></div>
                <div className="w-[160px] text-center">Uploaded files <Info size={10} className="inline ml-0.5" /></div>
                <div className="w-[140px]" />
              </div>
              {cats.map(category => (
                <CategoryAccordion
                  key={category.id}
                  category={category}
                  files={files}
                  onAddData={handleAddData}
                  onViewDetails={setDetailsPanel}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── LEARN MORE SIDE PANEL ── */}
      <AnimatePresence>
        {detailsPanel && (
          <LearnMorePanel
            activity={detailsPanel}
            uploadedFiles={files[detailsPanel.id] || []}
            onClose={() => setDetailsPanel(null)}
            onUploadFile={handleUploadFromPanel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataManagement;
