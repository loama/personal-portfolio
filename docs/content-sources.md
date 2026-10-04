# Content sources

The résumé and website use the same career record in `content/profile.json`. English and Spanish preserve the same dates, responsibilities, and company outcomes. The founder and employee versions change emphasis and ordering.

## Evidence

1. Eduardo's [LinkedIn profile](https://www.linkedin.com/in/eduardolopezamaya/), using a saved export captured August 21, 2026 and the live profile viewed October 3, 2026. This is the primary source for career chronology, consulting projects, amiloz responsibilities, funding, customer count, average technology team size, and founder programs, including Platanus Ventures 2023.
2. Eduardo's 2023 résumé, used to cross check earlier roles and education.
3. Eduardo's October 2026 application résumé, used for the Nixtla Head of Web title. Eduardo confirmed on October 3, 2026 that the role is current, correcting the earlier end date.
4. [Y Combinator's amiloz profile](https://www.ycombinator.com/companies/amiloz), for the company and W22 affiliation.
5. [Supervisor](https://trysupervisor.com) and [Constructor](https://useconstructor.com), for current product descriptions and public links.
6. [Nixtla PR 855](https://github.com/Nixtla/nixtla/pull/855), authored by `loama` and merged August 10, 2026. The public description and diff support the documentation routing example. Destination checks are reported in that PR, not presented as current live verification.
7. [Nixtla documentation workflow correction](https://github.com/Nixtla/docs/commit/e9a8c4b88fe67e19673a459ae564697030ab12df), publicly attributed to `loama`. The diff supports replacing the previous HierarchicalForecast output in preview and production. It does not establish a measured reliability improvement.
8. Eduardo's October 3, 2026 feedback confirms his founder role for Supervisor and Constructor and his current description as a full stack AI engineer. The 2015 date describes when he began building software, not when he began working in AI.
9. Eduardo's feedback on the same date clarifies the Rappi position as Full Stack Developer. The description identifies him as the first in house developer in Mexico.
10. Eduardo's detailed career account on October 3, 2026 supports the expanded experience sections. For Nixtla, he describes a little over three years of work, being the first and usually sole web engineer, creating the first API serving TimeGPT, and owning the developer dashboard, website, monitoring, analytics, HubSpot integrations, and internal AI products. For amiloz, he confirms building the first apps before fundraising, 80 employees, a technology team of seven, and an agreed personal exit when the founders chose different directions. For consulting, he clarifies the first Selia release, MarketPryce's iOS app, Ciro's design scope, and CervezaSiempre's launch and customer growth. He also confirms the iOS, Android, and web scope at Eiya. These additional claims are his account, rather than independently audited outcomes.
11. The [Y Combinator company record](https://www.ycombinator.com/companies/amiloz), retrieved October 3, 2026, currently identifies the company as BelozFi. The résumé retains amiloz as its name during Eduardo's tenure and explains the current name in the expanded details.

12. Eduardo's October 4, 2026 feedback sets the display names to "amiloz" and "freelance". The founder summary includes the funding amount, his CTO role, the first product versions, and subsequent hiring. He describes Supervisor and Constructor as software to help small and medium businesses run better using AI. His later feedback uses "Founder" throughout and supplies the current product descriptions.

Private source documents remain outside this repository. Contact details were supplied by Eduardo. The portrait is the complete 1260 by 1849 pixel photograph he supplied on October 4, 2026. The website displays it at its original proportions without cropping or zoom. It replaces the square crop that LinkedIn served. The X account came from his existing website.

## Visual assets

The orange and white palette, Sk Modernist headings, system body font, and VCR OSD Mono action font follow [Supervisor](https://trysupervisor.com), as requested by Eduardo. The font files come from his Supervisor website assets. Orange text uses a darker shade in Light mode and a lighter shade in Dark mode.

Eyebrows, uppercase labels, and button styling follow the live Supervisor site viewed October 3, 2026. Buttons have white labels on a darker orange for readable contrast. The portrait uses its source image dimensions, automatic height, and no crop or zoom. The founder badges sit below the photo, and the decorative label sits above it. The favicon has a white background.

The résumé is now the main page. Both versions include the portrait, founder program badges, and Supervisor and Constructor cards. Previous landing pages redirect to the corresponding résumé. The header keeps language and appearance controls. A footer link opens the alternate résumé version. Device, Light, and Dark options use a sliding selection indicator and respect reduced motion preferences. The choice stays in the browser.

The PDFs embed the regular and bold Liberation Sans fonts distributed with Mozilla's PDF.js. The font files and their SIL Open Font License are stored in `assets/fonts`. These static fonts preserve the PDF layout and avoid relying on fonts installed in the viewer. Unicode mappings keep accented text searchable and selectable.

The YC mark is the [official vector asset](https://bookface-static.ycombinator.com/vite/assets/yc-logo-vector-CecLwoGq.js) served by Y Combinator. It identifies the amiloz W22 affiliation. Platanus Ventures is identified separately as the 2023 founder cohort.

The Platanus symbol comes from the header SVG on its [official website](https://platan.us/), retrieved October 3, 2026 and checked again against the live header on October 4. The local asset preserves the symbol's paths and yellow colors. The badge links to that website and displays the mark without an added background.

The [Supervisor logo](https://trysupervisor.com/supervisor-logo.svg) comes from its current website. The local copy preserves the original icon and wordmark.

Company logos appear beside the experience entries on the website and in the PDFs. Local PNG copies in `public/images/companies` preserve the source proportions. The website adds no frames or backgrounds. White mattes were removed from the amiloz, Centraal, Zeel, and freelance assets. Betterfin and Eiya have 8 pixel corner rounding. Monochrome marks follow the selected theme, and the Supervisor mark renders at 28 pixels. Static image imports give updated assets new URLs so browsers do not retain earlier backgrounds.

1. Supervisor uses the icon from its existing official logo asset.
2. Nixtla uses its [official site icon](https://nixtla.io/favicon.svg).
3. amiloz uses the [original wordmark in Innogen Capital's 2022 archive](https://innogencapital.com/wp-content/uploads/2022/04/amiloz-logo-Innogen.png).
4. Betterfin uses the image shown in Eduardo's experience record, linked to its [company profile](https://www.linkedin.com/company/11388878/).
5. Zeel uses its [official application icon](https://inhome.zeel.com/favicon.png).
6. Eiya uses the image shown in Eduardo's experience record, linked to its [company profile](https://www.linkedin.com/company/15264369/).
7. Rappi uses its [official application icon](https://www.rappi.com.mx/pwa-icons/192x192.png).
8. Centraal uses the image shown in Eduardo's experience record, linked to its [company profile](https://www.linkedin.com/company/2852335/).

These assets were retrieved on October 3, 2026. The LinkedIn images are stored locally so they remain available after their source URLs expire.

The freelance entry uses the Code icon from the installed Radix icon library, with matching SVG and PNG assets in `public/images/companies`. It appears on the website and in the PDFs.

Contact links use the LinkedIn and GitHub marks and envelope icon from the installed Radix icon library. The X and WhatsApp vector paths come from the [X](https://github.com/simple-icons/simple-icons/blob/develop/icons/x.svg) and [WhatsApp](https://github.com/simple-icons/simple-icons/blob/develop/icons/whatsapp.svg) assets in Simple Icons, retrieved October 3, 2026. Text labels remain visible alongside the icons.

## Claim boundaries

amiloz raised more than USD 3.5 million and served hundreds of business customers. These are company outcomes. The résumé does not attribute all fundraising or customer acquisition to Eduardo. His role covers building the initial API, website, mobile apps, internal tools, and then hiring and leading a technology team of seven in a company of 80 people. The expanded departure account describes a small personal exit through an agreed founder separation. It does not claim that amiloz was acquired or give an exit valuation.

The wording "We raised" follows Eduardo's October 3, 2026 feedback and refers to the founding team collectively.

Nixtla's start date has not been established. Its record intentionally omits `startDate`; the interface and PDF show the role as current, following Eduardo's October 3, 2026 correction. The earlier LinkedIn record describes Nixtla work within consulting. Consulting dates overlap other roles because the source presents an ongoing independent practice, not a sequence of exclusive employment contracts.

The Nixtla tenure statement is anchored to October 2026 and does not establish an exact joining month. Creating the first API serving TimeGPT does not imply creating or training TimeGPT itself. Internal AI products are mentioned only in general terms, without names, implementation details, or claims that they have launched.

The consulting record limits MarketPryce to the iOS app Eduardo described and records that it is no longer in use. Ciro was a Figma product design engagement with no code delivery. CervezaSiempre launched in approximately one and a half months and reached thousands of customers during the following one and a half months, according to Eduardo's account. The record does not infer revenue or a more precise customer count.

Supervisor and Constructor are described as current development work. The project captions identify Eduardo as their founder, following his feedback. The previews fetch their public website HTML on the server and refresh cached content after 60 seconds. The live frames load when their cards approach the viewport, so they do not delay the résumé introduction. Sanitization removes scripts, event handlers, nested frames, and external resource references. Styling attributes remain so the headers preserve their layout. The previews use a full iframe sandbox and a separate content security policy that blocks scripts and limits styles, images, and fonts to the two websites. Local screenshots of those headers, captured October 4, 2026, remain visible if a preview is unavailable. The card descriptions follow Eduardo's October 4, 2026 wording and are shared with JSON and MCP through `content/profile.json`. The website does not claim a customer count, revenue, or growth rate for either product.

Education records distinguish founder programs from a university degree. Language records do not assign unverified proficiency levels. No target salary, agency valuation, or independent review verdict appears as a career fact.

The amiloz and Nixtla work notes expand the responsibilities described in these same sources. Nixtla also includes two public code examples stored in `content/profile.json`. The diagrams show areas of responsibility and do not claim to reproduce production architecture or interfaces.

## Updating the record

Change the canonical record only when the claim is supported. Add the supporting public source or describe the private evidence here without publishing private documents. Run `bun run generate:resume`, inspect all eight PDFs, and run `bun run check`. Review English and Spanish together before publishing a release. The short PDFs remain one page. Detailed PDFs add the expanded sections, which also appear in JSON and MCP responses and in collapsible sections on the web résumé.
