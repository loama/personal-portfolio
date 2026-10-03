import { profile } from "./resume";

export const CASE_IDS = ["amiloz", "nixtla"] as const;
export type CaseId = (typeof CASE_IDS)[number];

export const caseStudies = {
  amiloz: {
    version: "founder",
    en: {
      title: "Software for the whole operation.",
      intro: "At Amiloz, a company supplying corner stores in Mexico, I built the first products and then hired and led the technology team.",
      context: "A store order was only the beginning. The work also covered the software used in the warehouse, on deliveries, and inside the business.",
      scope: ["Customer ordering", "Warehouse operations", "Deliveries", "Internal analytics"],
      sections: [
        { title: "Build the first version", body: "I wrote the initial API, website, mobile apps, and internal administration tools. This put the customer experience and the operational software within the same engineering remit." },
        { title: "Build the team", body: "After the initial products, I hired and led the technology team. It averaged seven people. My responsibility expanded from writing the first software to leading the people responsible for customer apps, warehouse and delivery tools, and internal analytics." },
        { title: "Keep the company outcome in view", body: "Amiloz joined Y Combinator W22. The company raised more than USD 3.5 million and served hundreds of business customers. These were company outcomes, supported by work across the business." },
      ],
      takeaway: "This is the experience I bring to a new company: building the initial product myself, then building the team that carries it forward.",
      link: "Amiloz at Y Combinator",
    },
    es: {
      title: "Software para toda la operación.",
      intro: "En Amiloz, una empresa que abastecía a tiendas de barrio en México, desarrollé los primeros productos y después contraté y dirigí al equipo de tecnología.",
      context: "El pedido de una tienda era solo el principio. El trabajo también abarcaba el software del almacén, las entregas y la operación interna.",
      scope: ["Pedidos de clientes", "Operación del almacén", "Entregas", "Análisis interno"],
      sections: [
        { title: "Construir la primera versión", body: "Escribí la primera API, el sitio web, las aplicaciones móviles y las herramientas de administración. La experiencia del cliente y el software operativo formaban parte de la misma responsabilidad de ingeniería." },
        { title: "Formar el equipo", body: "Después de los primeros productos, contraté y dirigí al equipo de tecnología. Tenía siete personas en promedio. Mi responsabilidad pasó de escribir el software inicial a dirigir a quienes desarrollaban las aplicaciones para clientes, las herramientas de almacén y reparto, y el análisis interno." },
        { title: "Entender el resultado de la empresa", body: "Amiloz formó parte de Y Combinator W22. La empresa levantó más de USD 3.5 millones y atendió a cientos de clientes empresariales. Estos fueron resultados de la empresa, apoyados por el trabajo de distintas áreas." },
      ],
      takeaway: "Esta es la experiencia que aporto a una empresa nueva: construir el producto inicial y después formar al equipo que lo continúa.",
      link: "Amiloz en Y Combinator",
    },
  },
  nixtla: {
    version: "employee",
    en: {
      title: "The web side of forecasting.",
      intro: "At Nixtla, I work on web products and developer experience. My contributions include the website, the developer portal, and early versions of the forecasting API.",
      context: "The public changes below show two small parts of the work: maintaining documentation routes and the workflows that publish developer documentation.",
      scope: ["Website", "Developer portal", "Early API contributions"],
      sections: profile.publicWork.filter((work) => work.project === "nixtla").map((work) => ({ title: work.title.en, body: work.body.en, source: work.url })),
      takeaway: "I continue to work as Head of Web at Nixtla, combining public web products, developer experience, and API contributions.",
      link: "Visit Nixtla",
    },
    es: {
      title: "La parte web del pronóstico.",
      intro: "En Nixtla trabajo en productos web y experiencia para desarrolladores. He contribuido al sitio web, al portal para desarrolladores y a las primeras versiones de la API de pronóstico.",
      context: "Los cambios públicos de abajo muestran dos partes concretas del trabajo: mantener las rutas de documentación y los flujos que la publican.",
      scope: ["Sitio web", "Portal para desarrolladores", "Contribuciones a la API inicial"],
      sections: profile.publicWork.filter((work) => work.project === "nixtla").map((work) => ({ title: work.title.es, body: work.body.es, source: work.url })),
      takeaway: "Sigo trabajando como Head of Web en Nixtla, combinando productos web, experiencia para desarrolladores y contribuciones a la API.",
      link: "Visitar Nixtla",
    },
  },
} as const;

export function isCaseId(value: string): value is CaseId {
  return CASE_IDS.some((id) => id === value);
}
