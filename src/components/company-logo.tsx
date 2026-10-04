import Image, { type StaticImageData } from "next/image";
import supervisor from "../../public/images/companies/supervisor.png";
import nixtla from "../../public/images/companies/nixtla.png";
import amiloz from "../../public/images/companies/amiloz.png";
import freelance from "../../public/images/companies/freelance.png";
import betterfin from "../../public/images/companies/betterfin.png";
import zeel from "../../public/images/companies/zeel.png";
import eiya from "../../public/images/companies/eiya.png";
import rappi from "../../public/images/companies/rappi.png";
import centraal from "../../public/images/companies/centraal.png";

const logos = new Map<string, { image: StaticImageData; monochrome?: boolean; brandColor?: "amiloz"; size?: number; rounded?: boolean }>([
  ["Supervisor", { image: supervisor, monochrome: true, size: 28 }],
  ["Nixtla", { image: nixtla, monochrome: true }],
  ["amiloz", { image: amiloz, monochrome: true, brandColor: "amiloz" }],
  ["freelance", { image: freelance, monochrome: true }],
  ["Betterfin", { image: betterfin, rounded: true }],
  ["Zeel", { image: zeel, monochrome: true }],
  ["Eiya", { image: eiya, rounded: true }],
  ["Rappi", { image: rappi }],
  ["Centraal", { image: centraal }],
]);

export function CompanyLogo({ company }: { company: string }) {
  const logo = logos.get(company);
  if (!logo) return null;

  if (logo.monochrome) {
    return <span aria-hidden="true" className={`company-logo company-logo-monochrome h-11 w-11 shrink-0${logo.brandColor ? ` company-logo-${logo.brandColor}` : ""}`} style={{ maskImage: `url("${logo.image.src}")`, maskSize: logo.size ? `${logo.size}px` : "contain" }} />;
  }

  return <Image src={logo.image} alt="" width={44} height={44} sizes="44px" className={`company-logo h-11 w-11 shrink-0 object-contain${logo.rounded ? " rounded-lg" : ""}`} />;
}
