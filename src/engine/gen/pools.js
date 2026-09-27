// Realistic sample-data pools (fictional people and companies).

export const FIRST = ['Priya', 'Daniel', 'Sofia', 'Liam', 'Hannah', 'Marcus', 'Aiko', 'Tom', 'Grace', 'Oliver', 'Nadia', 'Ethan', 'Amara', 'Lucas', 'Mei', 'Jonas', 'Fatima', 'Diego', 'Chloe', 'Ravi', 'Yuki', 'Kwame', 'Elena', 'Noah', 'Zara', 'Mateo', 'Ingrid', 'Omar', 'Leila', 'Ben', 'Anika', 'Tariq', 'Rosa', 'Felix', 'Imani', 'Kenji', 'Sara', 'Pablo', 'Maya', 'Viktor', 'Aisha', 'Hugo', 'Keira', 'Samuel', 'Lina', 'Theo'];
export const LAST = ['Raman', 'Okafor', 'Marquez', 'Chen', 'Weiss', 'Johnson', 'Tanaka', 'Becker', 'Mwangi', 'Grant', 'Haddad', 'Brooks', 'Nwosu', 'Silva', 'Lin', 'Berg', 'Rahman', 'Alvarez', 'Dubois', 'Iyer', 'Sato', 'Mensah', 'Petrova', 'Kim', 'Ahmed', 'Rossi', 'Larsen', 'Farouk', 'Nasser', 'Carter', 'Kapoor', 'Aziz', 'Moreno', 'Wagner', 'Diallo', 'Mori', 'Cohen', 'Ortiz', 'Singh', 'Novak', 'Hughes', 'Park'];

/** Internal teammates (owners, assignees, reviewers). */
export const TEAM = ['Meera', 'Arjun', 'Sam', 'Lena', 'Kofi', 'Rosa', 'Jin', 'Ada'];

export const COMPANIES = [
  { name: 'Northwind Health', industry: 'Healthcare', domain: 'northwind.health', size: 420, country: 'US' },
  { name: 'Brightline Logistics', industry: 'Logistics', domain: 'brightline.io', size: 1200, country: 'US' },
  { name: 'Casa Verde Foods', industry: 'Food & Beverage', domain: 'casaverde.mx', size: 85, country: 'MX' },
  { name: 'Quanta Robotics', industry: 'Manufacturing', domain: 'quanta.ai', size: 60, country: 'US' },
  { name: 'Keller & Partner', industry: 'Professional services', domain: 'kellerpartner.de', size: 35, country: 'DE' },
  { name: 'Evergreen Schools', industry: 'Education', domain: 'evergreen.edu', size: 900, country: 'US' },
  { name: 'Sakura Retail', industry: 'Retail', domain: 'sakura-retail.jp', size: 240, country: 'JP' },
  { name: 'Solo Studio', industry: 'Design', domain: 'solostudio.co', size: 3, country: 'UK' },
  { name: 'Savanna Fintech', industry: 'Financial services', domain: 'savannafin.com', size: 150, country: 'KE' },
  { name: 'Grant Architects', industry: 'Professional services', domain: 'grantarch.co.uk', size: 48, country: 'UK' },
  { name: 'Cedar Hospitality', industry: 'Hospitality', domain: 'cedarhotels.com', size: 610, country: 'AE' },
  { name: 'Brooks & Co', industry: 'Consulting', domain: 'brooksco.com', size: 12, country: 'US' },
  { name: 'Helix Biotech', industry: 'Healthcare', domain: 'helixbio.com', size: 310, country: 'CH' },
  { name: 'Lumen Energy', industry: 'Energy', domain: 'lumen-energy.com', size: 780, country: 'NO' },
  { name: 'Parcelpoint', industry: 'Logistics', domain: 'parcelpoint.eu', size: 190, country: 'NL' },
  { name: 'Fathom Analytics', industry: 'Software', domain: 'fathomhq.com', size: 95, country: 'CA' },
  { name: 'Tandem Bank', industry: 'Financial services', domain: 'tandembank.co', size: 1500, country: 'UK' },
  { name: 'Juniper Dental Group', industry: 'Healthcare', domain: 'juniperdental.com', size: 140, country: 'US' },
  { name: 'Orbit Media', industry: 'Media', domain: 'orbitmedia.io', size: 70, country: 'US' },
  { name: 'Harbor Freight Co', industry: 'Logistics', domain: 'harborfreight.co', size: 330, country: 'SG' },
  { name: 'Kite Learning', industry: 'Education', domain: 'kitelearning.com', size: 55, country: 'IN' },
  { name: 'Mosaic Retail Group', industry: 'Retail', domain: 'mosaicretail.com', size: 2100, country: 'US' },
  { name: 'Atlas Build', industry: 'Construction', domain: 'atlasbuild.com', size: 460, country: 'AU' },
  { name: 'Pinecrest Clinics', industry: 'Healthcare', domain: 'pinecrest.care', size: 260, country: 'US' },
  { name: 'Vireo Software', industry: 'Software', domain: 'vireo.dev', size: 38, country: 'PT' },
  { name: 'Beacon Insurance', industry: 'Financial services', domain: 'beaconins.com', size: 890, country: 'US' },
  { name: 'Marigold Events', industry: 'Hospitality', domain: 'marigoldevents.in', size: 22, country: 'IN' },
  { name: 'Stonebridge Legal', industry: 'Legal', domain: 'stonebridgelaw.com', size: 120, country: 'UK' },
  { name: 'Nimbus Cloudworks', industry: 'Software', domain: 'nimbuscloud.io', size: 640, country: 'US' },
  { name: 'Golden Grain Bakery', industry: 'Food & Beverage', domain: 'goldengrain.co', size: 18, country: 'US' },
];

export const SERVICES = {
  clinic: [['General consultation', 20, 60], ['Follow-up visit', 15, 40], ['Blood test', 15, 35], ['Vaccination', 10, 30], ['Physiotherapy session', 45, 85], ['Health check-up', 40, 120]],
  dental: [['Check-up & clean', 30, 90], ['Filling', 45, 160], ['Teeth whitening', 60, 320], ['Emergency visit', 30, 120], ['Braces consultation', 30, 0], ['Root canal', 90, 650]],
  salon: [['Haircut & style', 45, 55], ['Colour', 90, 120], ['Blow-dry', 30, 35], ['Beard trim', 20, 20], ['Balayage', 150, 190], ['Treatment mask', 30, 40]],
  fitness: [['Drop-in class', 60, 18], ['Personal training', 60, 70], ['Intro session', 30, 0], ['Mobility workshop', 90, 35], ['Private lesson', 45, 55], ['10-class pack', 60, 150]],
  vet: [['Wellness exam', 30, 65], ['Vaccination', 15, 45], ['Dental cleaning', 60, 280], ['Nail trim', 15, 20], ['Sick visit', 30, 85], ['Microchipping', 15, 50]],
  generic: [['Consultation', 30, 60], ['Standard session', 60, 90], ['Follow-up', 30, 45], ['Extended session', 90, 130], ['Intro call', 15, 0], ['Assessment', 45, 75]],
};
