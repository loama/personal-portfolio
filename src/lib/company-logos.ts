const companyLogos = new Map([
  ["Supervisor", "/images/companies/supervisor.png"],
  ["Nixtla", "/images/companies/nixtla.png"],
  ["amiloz", "/images/companies/amiloz.png"],
  ["freelance", "/images/companies/freelance.png"],
  ["Betterfin", "/images/companies/betterfin.png"],
  ["Zeel", "/images/companies/zeel.png"],
  ["Eiya", "/images/companies/eiya.png"],
  ["Rappi", "/images/companies/rappi.png"],
  ["Centraal", "/images/companies/centraal.png"],
]);

export function getCompanyLogo(name: string) {
  return companyLogos.get(name);
}
