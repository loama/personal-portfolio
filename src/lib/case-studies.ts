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
      intro: "At Nixtla, my work covered the website, the developer portal, and contributions to early versions of the forecasting API.",
      context: "A forecasting product needs both the underlying capability and a way for developers to discover and use it. My work spanned those points of entry.",
      scope: ["Website", "Developer portal", "Early API contributions"],
      sections: [
        { title: "The website", body: "I built the website for Nixtla's forecasting products. This was the public side of the work, alongside the tools developers used to access the product." },
        { title: "The developer portal", body: "I built the developer portal. The role connected product interfaces with the experience of developers using forecasting software." },
        { title: "Contribute beyond the interface", body: "I also contributed to early versions of the forecasting API. My remit connected the web experience with early API development." },
      ],
      takeaway: "The work combined public web products, developer experience, and API contributions. My Head of Web role continued through September 2026.",
      link: "Visit Nixtla",
    },
    es: {
      title: "La parte web del pronóstico.",
      intro: "En Nixtla, mi trabajo abarcó el sitio web, el portal para desarrolladores y contribuciones a las primeras versiones de la API de pronóstico.",
      context: "Un producto de pronóstico necesita su capacidad técnica y una forma de que los desarrolladores lo descubran y lo usen. Mi trabajo abarcó esos puntos de entrada.",
      scope: ["Sitio web", "Portal para desarrolladores", "Contribuciones a la API inicial"],
      sections: [
        { title: "El sitio web", body: "Desarrollé el sitio web de los productos de pronóstico de Nixtla. Era la parte pública del trabajo, junto con las herramientas que usaban los desarrolladores para acceder al producto." },
        { title: "El portal para desarrolladores", body: "Desarrollé el portal para desarrolladores. El trabajo conectaba las interfaces del producto con la experiencia de quienes usaban el software de pronóstico." },
        { title: "Contribuir más allá de la interfaz", body: "También contribuí a las primeras versiones de la API de pronóstico. Mi trabajo conectó la experiencia web con el desarrollo inicial de la API." },
      ],
      takeaway: "El trabajo combinó productos web, experiencia para desarrolladores y contribuciones a la API. Mi etapa como Head of Web terminó en septiembre de 2026.",
      link: "Visitar Nixtla",
    },
  },
} as const;

export function isCaseId(value: string): value is CaseId {
  return CASE_IDS.some((id) => id === value);
}
