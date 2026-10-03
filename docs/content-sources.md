# Content sources

The résumé and website use the same career record in `content/profile.json`. English and Spanish preserve the same dates, responsibilities, and company outcomes. The founder and employee versions change emphasis and ordering.

## Evidence

1. Eduardo's [LinkedIn profile](https://www.linkedin.com/in/eduardolopezamaya/), using a saved export captured August 21, 2026 and the live profile viewed October 3, 2026. This is the primary source for career chronology, consulting projects, Amiloz responsibilities, funding, customer count, average technology team size, and founder programs, including Platanus Ventures 2023.
2. Eduardo's 2023 résumé, used to cross check earlier roles and education.
3. Eduardo's October 2026 application résumé, used for the Nixtla Head of Web title and September 2026 end date.
4. [Y Combinator's Amiloz profile](https://www.ycombinator.com/companies/amiloz), for the company and W22 affiliation.
5. [Supervisor](https://trysupervisor.com) and [Constructor](https://useconstructor.com), for current product descriptions and public links.
6. [Nixtla PR 855](https://github.com/Nixtla/nixtla/pull/855), authored by `loama` and merged August 10, 2026. The public description and diff support the documentation routing example. Destination checks are reported in that PR, not presented as current live verification.
7. [Nixtla documentation workflow correction](https://github.com/Nixtla/docs/commit/e9a8c4b88fe67e19673a459ae564697030ab12df), publicly attributed to `loama`. The diff supports replacing the previous HierarchicalForecast output in preview and production. It does not establish a measured reliability improvement.

Private source documents remain outside this repository. Contact details were supplied by Eduardo. The portrait comes from his LinkedIn profile, retrieved October 3, 2026 at his request. The X account came from his existing website.

## Visual assets

The orange and white palette, Sk Modernist headings, system body font, and VCR OSD Mono action font follow [Supervisor](https://trysupervisor.com), as requested by Eduardo. The font files come from his Supervisor website assets. Small orange text uses a darker shade for legibility.

The YC mark is the [official vector asset](https://bookface-static.ycombinator.com/vite/assets/yc-logo-vector-CecLwoGq.js) served by Y Combinator. It identifies the Amiloz W22 affiliation. Platanus Ventures is identified separately as the 2023 founder cohort.

## Claim boundaries

Amiloz raised more than USD 3.5 million and served hundreds of business customers. These are company outcomes. The résumé does not attribute all fundraising or customer acquisition to Eduardo. His role covers building the initial API, website, mobile apps, internal tools, and then hiring and leading a technology team averaging seven people.

Nixtla's start date has not been established. Its record intentionally omits `startDate`; the interface and PDF show the verified end date. The earlier LinkedIn record describes Nixtla work within consulting. Consulting dates overlap other roles because the source presents an ongoing independent practice, not a sequence of exclusive employment contracts.

Supervisor and Constructor are described as current development work. Their interface illustrations are labeled accordingly. The website does not claim a customer count, revenue, growth rate, or production availability for either product.

Education records distinguish founder programs from a university degree. Language records do not assign unverified proficiency levels. No compensation, agency valuation, or independent review verdict appears as a career fact.

The Amiloz and Nixtla work notes expand the responsibilities described in these same sources. Nixtla also includes two public code examples stored in `content/profile.json`. The diagrams show areas of responsibility and do not claim to reproduce production architecture or interfaces.

## Updating the record

Change the canonical record only when the claim is supported. Add the supporting public source or describe the private evidence here without publishing private documents. Run `bun run generate:resume`, inspect all four PDFs, and run `bun run check`. Review English and Spanish together before publishing a release.
