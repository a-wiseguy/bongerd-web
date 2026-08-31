import bcrypt from 'bcryptjs'
import { count, eq } from 'drizzle-orm'
import { db } from './db'
import {
  announcements,
  locations,
  newsPosts,
  openingExceptions,
  openingHours,
  services,
  siteContent,
  userRoles,
  users,
} from './schema'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} ontbreekt`)
  return value
}

const ADMIN_EMAIL = requiredEnv('ADMIN_EMAIL').trim().toLowerCase()
const ADMIN_PASSWORD = requiredEnv('ADMIN_PASSWORD')

const locationSeed = [
  {
    slug: 'kesteren',
    name: 'Kesteren',
    address: 'Hoofdstraat 29',
    postal: '4041 AA',
    city: 'Kesteren',
    phone: '0488 482 133',
    phoneTel: '+31488482133',
    email: 'info@apotheekdebongerd.nl',
    zorgmail: 'apotheekdebongerd@zorgmail.nl',
    mapsQuery: 'Hoofdstraat 29, 4041 AA Kesteren',
    sortOrder: 1,
    close: '17:00',
  },
  {
    slug: 'ochten',
    name: 'Ochten',
    address: 'Burgemeester Houtkoperlaan 3',
    postal: '4051 EW',
    city: 'Ochten',
    phone: '0344 642 300',
    phoneTel: '+31344642300',
    email: 'info@apotheekdebongerd.nl',
    zorgmail: 'apotheekdebongerd@zorgmail.nl',
    mapsQuery: 'Burgemeester Houtkoperlaan 3, 4051 EW Ochten',
    sortOrder: 2,
    close: '17:30',
  },
  {
    slug: 'rhenen',
    name: 'Rhenen',
    address: 'Valleiweg 10',
    postal: '3911 DD',
    city: 'Rhenen',
    phone: '0317 796 000',
    phoneTel: '+31317796000',
    email: 'info@apotheekdebongerd.nl',
    zorgmail: 'apotheekdebongerdrhenen@zorgmail.nl',
    mapsQuery: 'Valleiweg 10, 3911 DD Rhenen',
    sortOrder: 3,
    close: '17:30',
  },
] as const

const contentSeed = [
  {
    page: 'home',
    blockKey: 'hero',
    title: 'Zorg om de hoek',
    body: 'Apotheek De Bongerd zit bij u om de hoek. Korte lijnen en een persoonlijke, snelle service staan centraal.',
    sortOrder: 1,
  },
  {
    page: 'home',
    blockKey: 'intro',
    title: 'Zelfstandig en dichtbij',
    body: 'Sinds 1987 zijn we gevestigd in Ochten. Kesteren volgde in 2009, Rhenen in 2020. We zijn HKZ-gecertificeerd, werken nauw samen met huisartsen in de regio en hebben contracten met alle zorgverzekeraars. Nagenoeg alle geneesmiddelen declareren we rechtstreeks.',
    sortOrder: 2,
  },
  {
    page: 'over-ons',
    blockKey: 'intro',
    title: 'Over Apotheek De Bongerd',
    body: 'Wij zijn een zelfstandige apotheek met drie vestigingen in de Betuwe en de Gelderse Vallei. Op iedere vestiging werkt een vast team. We leveren zorg op maat, met korte lijnen naar huisartsen en thuiszorg.',
    sortOrder: 1,
  },
  {
    page: 'over-ons',
    blockKey: 'team',
    title: 'Ons team',
    body: 'Het team bestaat uit apothekers, (hoofd)apothekersassistenten, administratief medewerkers, bezorgers en schoonmakers. Onze assistenten hebben specialismen zoals astma/COPD, diabetes en incontinentie.\n\nApotheker John Wisman volgde de opleiding in Utrecht en kwam in 1990 naar Ochten. In 1999 nam hij de apotheek over. “Dicht bij de klant staan, zorg op maat leveren en goed samenwerken met huisartsen in de omgeving.”',
    sortOrder: 2,
  },
  {
    page: 'over-ons',
    blockKey: 'kwaliteit',
    title: 'Kwaliteit',
    body: 'Apotheek De Bongerd is HKZ-gecertificeerd. We toetsen medicatie op veiligheid, begeleiden bij gebruik en stemmen af met uw huisarts als dat nodig is.',
    sortOrder: 3,
  },
  {
    page: 'over-ons',
    blockKey: 'inschrijven',
    title: 'Inschrijven of wijziging doorgeven',
    body: 'Wilt u zich inschrijven of een verhuizing doorgeven? Bel of mail uw vestiging, of gebruik het contactformulier. Stuur voor elk gezinslid een aparte melding. Uw gegevens behandelen we vertrouwelijk.',
    sortOrder: 4,
  },
  {
    page: 'over-ons',
    blockKey: 'huisregels',
    title: 'Huisregels',
    body: 'In de apotheek zijn vaak meerdere mensen tegelijk. We vragen om respect voor elkaars privacy, geen agressie of intimidatie, en geen ongevraagde foto’s of opnamen. Minder valide bezoekers krijgen voorrang op een zitplaats. Hulphonden zijn welkom, andere honden niet vanwege allergie. Roken (inclusief e-sigaret) is niet toegestaan. Bij het afhalen van medicijnen kunnen we om legitimatie vragen.',
    sortOrder: 5,
  },
  {
    page: 'over-ons',
    blockKey: 'klachten',
    title: 'Klachten',
    body: 'Bespreek een klacht eerst met de apotheker. Komt u er samen niet uit, dan helpt de onafhankelijke klachtenbemiddelaar van het Bemiddelingsbureau Apotheken: 06 2292 1649 of bemiddelingapotheken@kpnmail.nl. Bemiddeling is gratis.\n\nDaarna kunt u, met een schriftelijke eindreactie van de apotheker, naar de Geschillencommissie Openbare Apotheken (SKGE): Postbus 8018, 5601 KA Eindhoven, 088 022 9100, info@skge.nl, skge.nl. Daar zijn kosten aan verbonden.',
    sortOrder: 6,
  },
  {
    page: 'openingstijden',
    blockKey: 'intro',
    title: 'Openingstijden',
    body: 'Onze vestigingen zijn op werkdagen geopend. In het weekend zijn we gesloten. Op 24 en 31 december sluiten alle vestigingen om 16.00 uur.',
    sortOrder: 1,
  },
  {
    page: 'openingstijden',
    blockKey: 'dienst',
    title: 'Buiten openingstijden',
    body: 'Vanuit Kesteren, Ochten en Opheusden: Regioapotheek Rivierenland, in de hal van Ziekenhuis Rivierenland naast de huisartsenpost. 24 uur per dag, 0900 600 6666.\n\nVanuit Rhenen: Dienstapotheek Ede, Willy Brandtlaan 10 in Ede. 24 uur per dag, 0318 434 945.',
    sortOrder: 2,
  },
  {
    page: 'diensten',
    blockKey: 'intro',
    title: 'Onze diensten',
    body: 'Van herhaalrecept tot bezorging en een gesprek met de apotheker. Kies een dienst voor de details.',
    sortOrder: 1,
  },
  {
    page: 'nieuws',
    blockKey: 'intro',
    title: 'Nieuws',
    body: 'Actuele berichten van Apotheek De Bongerd.',
    sortOrder: 1,
  },
  {
    page: 'contact',
    blockKey: 'intro',
    title: 'Contact',
    body: 'Bel, mail of kom langs. Voor een persoonlijk gesprek met de apotheker kunt u een afspraak maken — in de spreekkamer of, als dat nodig is, bij u thuis.',
    sortOrder: 1,
  },
  {
    page: 'contact',
    blockKey: 'form',
    title: 'Bericht sturen',
    body: 'Gebruik dit formulier niet voor medische spoed of privacygevoelige gegevens zoals BSN, diagnoses of medicatielijsten. Bij spoed buiten openingstijden: zie de dienstapotheek.',
    sortOrder: 2,
  },
  {
    page: 'privacy',
    blockKey: 'intro',
    title: 'Privacy',
    body: 'Apotheek De Bongerd verwerkt persoonsgegevens om farmaceutische zorg te leveren. We beperken ons tot wat nodig is, beveiligen de gegevens en geven ze niet door aan derden tenzij dat nodig is voor de zorg of wettelijk verplicht.\n\nWe kunnen NAW-gegevens, geboortedatum, BSN, contactgegevens, medicatie- en medische gegevens en betaalinformatie verwerken. Medewerkers zien alleen wat zij voor hun werk nodig hebben. Nieuwe cliënten worden via de welkomstbrief geïnformeerd.\n\nU kunt inzage, correctie of verwijdering vragen via uw vestiging of info@apotheekdebongerd.nl.',
    sortOrder: 1,
  },
]

const serviceSeed = [
  {
    slug: 'herhaalrecepten',
    title: 'Herhaalrecepten',
    summary: 'Vraag uw medicatie aan via MijnGezondheid.net. Voor 12.00 uur aanvragen is de volgende werkdag om 12.00 uur klaar.',
    body: 'Het ophaalmoment van herhaalmedicatie: als u vóór 12.00 uur aanvraagt, staat het de volgende werkdag om 12.00 uur klaar.\n\nVraag herhaalrecepten aan via MijnGezondheid.net. Log in met DigiD. Zodra de medicatie klaarstaat, krijgt u een bericht per e-mail of sms. Zorg dat uw e-mailadres en/of 06-nummer bij ons bekend is.\n\nVoor de anticonceptiepil is geen herhaalrecept nodig.',
    href: 'https://home.mijngezondheid.net',
    sortOrder: 1,
  },
  {
    slug: 'herhaalservice',
    title: 'Herhaalservice',
    summary: 'Chronische medicatie automatisch klaarzetten of bezorgen, zonder telkens een nieuw recept bij de huisarts.',
    body: 'De herhaalservice is bedoeld voor chronische medicatie. Wij zetten deze automatisch klaar — om op te halen of, als u wilt, thuis te laten bezorgen. Steeds opnieuw een herhaalrecept bij de huisarts aanvragen is dan niet nodig. Vraag in de apotheek naar de voorwaarden.',
    href: null,
    sortOrder: 2,
  },
  {
    slug: 'bezorgdienst',
    title: 'Bezorgdienst',
    summary: 'Gratis thuisbezorging in de regio als u niet zelf kunt langskomen.',
    body: 'Voor mensen die niet zelf medicijnen kunnen ophalen, rijdt dagelijks een bezorgauto in de regio. Bezorging is gratis. Drie bezorgers zetten zich hiervoor in. Vraag ernaar bij uw vestiging.',
    href: null,
    sortOrder: 3,
  },
  {
    slug: 'afhaalautomaat',
    title: 'Afhaalautomaat',
    summary: 'Haal medicijnen 24/7 op in Kesteren, Ochten en Rhenen, met een unieke code.',
    body: 'Alle vestigingen hebben een afhaalautomaat. U bepaalt zelf wanneer u ophaalt — 24 uur per dag, 7 dagen per week. De service is gratis.\n\nMeld u eenmalig aan via info@apotheekdebongerd.nl, telefonisch of in de apotheek. Zodra het recept binnen is, maken we de medicijnen klaar. U ontvangt een bericht met een unieke afhaalcode. Daarna heeft u 72 uur om op te halen; u krijgt ook een herinnering.\n\nHoud de code bij de hand en volg de instructies op het scherm. Met de code kunt u de automaat één keer openen.',
    href: null,
    sortOrder: 4,
  },
  {
    slug: 'baxter',
    title: 'Baxterrollen',
    summary: 'Medicijnen per innamemoment verpakt, handig bij meerdere geneesmiddelen per dag.',
    body: 'Gebruikt u dagelijks meerdere geneesmiddelen? Baxterrollen helpen om het juiste moment niet te missen. Per innamemoment zit de medicatie in een zakje, met datum en tijdstip. De rollen worden per zeven dagen verpakt en volledig vergoed door de zorgverzekeraar. We werken nauw samen met thuiszorg in de regio.',
    href: null,
    sortOrder: 5,
  },
  {
    slug: 'bereiding',
    title: 'Eigen bereiding',
    summary: 'In Ochten bereiden we bepaalde medicijnen, zalven en capsules zelf.',
    body: 'Bij de vestiging in Ochten bereiden we bepaalde medicijnen, zalven en capsules zelf. Zo kunnen we gericht en snel leveren als een standaardpreparaat niet past.',
    href: null,
    sortOrder: 6,
  },
  {
    slug: 'medicatiebegeleiding',
    title: 'Medicatiebegeleiding',
    summary: 'Hulp bij veilig en juist gebruik, in overleg met uw huisarts.',
    body: 'Goed medicijngebruik betekent: niet te veel, niet te weinig, op het juiste moment. Samen met uw huisarts kijken we of uw medicatie nog past bij de richtlijnen.\n\nWe nemen contact op als medicijnen niet of te laat worden opgehaald, als de medicatie moet worden aangepast, of als nieuwere richtlijnen een andere behandeling adviseren.',
    href: null,
    sortOrder: 7,
  },
  {
    slug: 'diabetes',
    title: 'Diabetes hulpmiddelen',
    summary: 'Bestel diabetes hulpmiddelen als u insuline gebruikt of een machtiging heeft.',
    body: 'U kunt diabetes hulpmiddelen bij ons bestellen als u insuline gebruikt of een machtiging van uw verzekering heeft. Meet u bloedglucose bij tabletten? Dat kan ook; vraag naar vergoeding in de apotheek.',
    href: null,
    sortOrder: 8,
  },
  {
    slug: 'huidverzorging',
    title: 'Huidverzorging',
    summary: 'Advies over de huid en dermatologische lijnen zoals Vichy en Eucerin.',
    body: 'De apotheek is de plek voor deskundig advies over de huid. We voeren onder andere Vichy en Eucerin. Vraag ernaar bij de balie.',
    href: null,
    sortOrder: 9,
  },
  {
    slug: 'medicijnpaspoort',
    title: 'Medicijnpaspoort',
    summary: 'Vraag een overzicht van uw medicatie aan voor onderweg of op reis. Neem een ID mee bij het ophalen.',
    body: 'Een medicijnpaspoort geeft overzicht van uw medicatie, handig op reis of bij een andere zorgverlener. Vraag het aan via het contactformulier of in de apotheek. Vergeet bij het ophalen uw identiteitsbewijs niet.',
    href: '/contact',
    sortOrder: 10,
  },
  {
    slug: 'reisadvies',
    title: 'Reisadvies',
    summary: 'Vaccinaties en reizigersadvisering via de landelijke richtlijnen van het LCR.',
    body: 'Gaat u op reis? Kijk op de landenpagina van het Landelijk Coördinatiecentrum Reizigersadvisering (LCR) en overleg met ons over medicatie, vaccinaties en een medicijnpaspoort.',
    href: 'https://www.lcr.nl/Landen',
    sortOrder: 11,
  },
  {
    slug: 'gesprek',
    title: 'Gesprek met de apotheker',
    summary: 'Vragen over medicatie, gezondheid of leefstijl? Maak een afspraak in de spreekkamer.',
    body: 'Alle vestigingen hebben een spreekkamer. Uw privacy is gewaarborgd. De apotheker kan indien nodig ook bij u thuis langskomen. Bel uw vestiging of gebruik het contactformulier.',
    href: '/contact',
    sortOrder: 12,
  },
]

const newsSeed = [
  {
    slug: 'herhaalmedicatie-ophalen',
    title: 'Nieuw ophaalmoment herhaalmedicatie',
    excerpt: 'Vraagt u vóór 12.00 uur aan, dan staat uw medicatie de volgende werkdag om 12.00 uur klaar.',
    body: 'Het ophaalmoment van herhaalmedicatie is gewijzigd. Als u uw medicatie vóór 12.00 uur aanvraagt, staat deze de volgende werkdag om 12.00 uur voor u klaar.\n\nAanvragen doet u via MijnGezondheid.net, met DigiD. U krijgt een bericht als de medicatie klaarstaat.',
    publishedAt: new Date('2026-01-08T09:00:00+01:00'),
  },
  {
    slug: 'geen-zaterdagopening',
    title: 'Geen zaterdagopening',
    excerpt: 'Onze vestigingen zijn op zaterdag gesloten. Voor spoed buiten openingstijden kunt u terecht bij de dienstapotheek.',
    body: 'Apotheek De Bongerd is op zaterdag gesloten. Op werkdagen bent u van harte welkom in Kesteren, Ochten en Rhenen.\n\nBuiten openingstijden: vanuit Kesteren, Ochten en Opheusden de Regioapotheek Rivierenland (0900 600 6666). Vanuit Rhenen de Dienstapotheek Ede (0318 434 945).',
    publishedAt: new Date('2022-01-10T09:00:00+01:00'),
  },
]

function isEmpty(value: unknown) {
  return Number(value) === 0
}

async function seed() {
  const [{ value: userCount } = { value: 0 }] = await db.select({ value: count() }).from(users)

  if (isEmpty(userCount)) {
    const adminId = crypto.randomUUID()
    await db.insert(users).values({
      id: adminId,
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    })
    await db.insert(userRoles).values({ userId: adminId, role: 'admin' })
    console.log(`admin account: ${ADMIN_EMAIL}`)
  }

  const [{ value: locCount } = { value: 0 }] = await db.select({ value: count() }).from(locations)
  if (isEmpty(locCount)) {
    for (const loc of locationSeed) {
      const locationId = crypto.randomUUID()
      await db.insert(locations).values({
        id: locationId,
        slug: loc.slug,
        name: loc.name,
        address: loc.address,
        postal: loc.postal,
        city: loc.city,
        phone: loc.phone,
        phoneTel: loc.phoneTel,
        email: loc.email,
        zorgmail: loc.zorgmail,
        mapsQuery: loc.mapsQuery,
        sortOrder: loc.sortOrder,
      })
      for (let weekday = 0; weekday <= 6; weekday++) {
        const closed = weekday === 0 || weekday === 6
        await db.insert(openingHours).values({
          locationId,
          weekday,
          opens: closed ? null : '08:00',
          closes: closed ? null : loc.close,
          isClosed: closed,
        })
      }
    }
    const allLocations = await db.select().from(locations)
    for (const loc of allLocations) {
      for (const date of ['2026-12-24', '2026-12-31']) {
        await db.insert(openingExceptions).values({
          locationId: loc.id,
          date,
          opens: '08:00',
          closes: '16:00',
          isClosed: false,
          label: 'Aangepaste sluitingstijd',
        })
      }
    }
  }

  const [{ value: contentCount } = { value: 0 }] = await db.select({ value: count() }).from(siteContent)
  if (isEmpty(contentCount)) {
    await db.insert(siteContent).values(contentSeed)
  }

  const [{ value: serviceCount } = { value: 0 }] = await db.select({ value: count() }).from(services)
  if (isEmpty(serviceCount)) {
    await db.insert(services).values(serviceSeed)
  }

  const [{ value: newsCount } = { value: 0 }] = await db.select({ value: count() }).from(newsPosts)
  if (isEmpty(newsCount)) {
    await db.insert(newsPosts).values(
      newsSeed.map((post) => ({
        ...post,
        published: true,
      })),
    )
  }

  const [{ value: announcementCount } = { value: 0 }] = await db.select({ value: count() }).from(announcements)
  if (isEmpty(announcementCount)) {
    await db.insert(announcements).values({
      title: 'Herhaalrecepten',
      body: 'Vraag herhaalmedicatie aan via MijnGezondheid.net. Voor 12.00 uur aanvragen is de volgende werkdag om 12.00 uur klaar.',
      published: true,
      sortOrder: 1,
    })
  }

  // keep admin password in sync for local docker resets without wiping data
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1)
  if (existing[0] && process.env.RESET_ADMIN_PASSWORD === 'true') {
    await db
      .update(users)
      .set({ passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) })
      .where(eq(users.id, existing[0].id))
  }
}

seed()
  .then(async () => {
    console.log('seed ok')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
