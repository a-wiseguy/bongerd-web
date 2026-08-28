Nieuwe website Apotheek de Bongerd

Een volledig nieuwe, snelle en mobielvriendelijke site in het Nederlands, met een beheeromgeving waar het apotheekteam zelf teksten bijwerkt. Geen WordPress, geen plugins.

Pagina's





Home — hero met openingstijden-status ("nu open / gesloten"), snelkoppelingen (herhaalrecept, contact, route), actuele mededelingen



Over ons — team, praktijkinformatie, kwaliteit



Openingstijden — weekschema, afwijkende dagen/feestdagen, dienstapotheek buiten openingstijden



Diensten — medicatiebegeleiding, herhaalrecepten, bezorgservice, reisadvies, etc. (kaartjes met detailtekst)



Nieuws — overzicht + detailpagina per bericht



Contact — adres, telefoon, e-mail, kaartlink, routebeschrijving en het contactformulier

Elke pagina krijgt eigen SEO-titels, omschrijvingen en deelbare previews; adres/openingstijden komen ook als gestructureerde data (Pharmacy schema) zodat Google ze goed toont.

Formulier

Eén contactformulier (naam, e-mail, telefoon, onderwerp, bericht). Inzendingen worden veilig opgeslagen en zijn alleen zichtbaar in de beveiligde beheeromgeving — niets is publiek opvraagbaar. Duidelijke waarschuwing bij het formulier: geen medische spoedvragen of privacygevoelige gegevens via het formulier.

Beheeromgeving (CMS)

Inloggen met e-mail/wachtwoord via een /beheer-omgeving. Daar kan het team:





teksten van alle pagina's aanpassen (per pagina blokken met titel + tekst)



openingstijden en afwijkende dagen wijzigen



mededelingen op de homepage plaatsen



nieuwsberichten toevoegen, bewerken, publiceren of verbergen



diensten beheren



binnengekomen contactberichten lezen en als afgehandeld markeren

Accounts worden door jou aangemaakt; er is geen open registratie.

Ontwerp

Rustig, klinisch-verzorgd en vertrouwenwekkend: helder wit met zacht mint/teal als apotheek-accent, warm grijs voor tekst, ruime witruimte, grote leesbare typografie (belangrijk voor oudere patiënten), duidelijke aanraakvlakken. Mobile-first: onderaan op mobiel een vaste balk met bellen/route/herhaalrecept. Toegankelijk contrast, focusstijlen, en tekst die tot 200% inzoomt zonder te breken.

Techniek





TanStack Start + React, Tailwind met semantische design tokens in src/styles.css



Aparte routes per pagina (/, /over-ons, /openingstijden, /diensten, /nieuws, /nieuws/$slug, /contact, /beheer/*)



Lovable Cloud voor database, auth en beveiliging:





tabellen: site_content, opening_hours, announcements, news_posts, services, contact_submissions, plus user_roles (aparte rollentabel, geen rol op profiel)



publiek: alleen leesrechten op gepubliceerde content; contactformulier mag alleen invoegen, nooit lezen



contact_submissions uitsluitend leesbaar voor ingelogde beheerders



Content wordt server-side geladen zodat pagina's direct en SEO-vriendelijk renderen



Initiële content wordt gevuld met teksten in de stijl van de huidige site, zodat het beheer meteen echte inhoud toont

Wat er niet in zit

Geen online bestelsysteem, geen koppeling met apotheeksystemen, geen patiëntportaal of medische gegevensverwerking — dat vraagt aparte certificering.
