import type { SiteConfig, SiteId } from "@/lib/site/config";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { interpolate } from "@/lib/i18n/translate";
import type { WarrantyPolicy, WarrantySection } from "@/lib/content/warranty";

type PolicyTemplate = {
  updated: string;
  intro: string;
  sections: WarrantySection[];
  entityNote?: string;
};

function applyVars(template: PolicyTemplate, vars: Record<string, string>): WarrantyPolicy {
  return {
    updated: interpolate(template.updated, vars),
    intro: interpolate(template.intro, vars),
    entityNote: template.entityNote ? interpolate(template.entityNote, vars) : undefined,
    sections: template.sections.map((section) => ({
      title: interpolate(section.title, vars),
      body: section.body.map((paragraph) => interpolate(paragraph, vars)),
      bullets: section.bullets?.map((bullet) => interpolate(bullet, vars)),
    })),
  };
}

const BLEEQ: Record<Locale, PolicyTemplate> = {
  en: {
    updated: "July 23, 2026",
    intro:
      "Support for your {shortName} product purchased from {name}, including troubleshooting, warranty coverage, and return options.",
    sections: [
      {
        title: "Getting Help",
        body: [
          "Please contact us at {supportEmail} if you experience any difficulties with your {shortName} product, as many issues can be resolved quickly with our assistance.",
          "When reaching out, please include your order number, model number (SKU), serial number, a video (if available), app version (if required), and a brief description of the issue so we can assist you more efficiently.",
        ],
      },
      {
        title: "Warranty Coverage",
        body: [
          "{shortName} products come with a 1-year limited warranty. This warranty covers the Ranger AI Sports Camera Glasses, Power Plus, and Bluetooth Controller. All lenses are not covered by this warranty. The warranty applies only to products purchased from {name} or other authorized BleeqUp resellers.",
          "If a covered product is found to be defective and is still under warranty, it will be repaired or replaced at no cost to the customer (please note that all lenses are not covered).",
        ],
      },
      {
        title: "Warranty Period",
        body: [
          "The warranty takes effect from the purchase date shown on your valid proof of purchase, or the delivery date if the delivery date is later than the purchase date. A valid proof of purchase is required for any warranty claim.",
          "The warranty period is subject to applicable local laws. Where Canadian consumer protection law provides a longer or more protective entitlement than the limited warranty described above, that local-law entitlement applies and prevails to the extent it is more favorable to you. {name} is an authorized BleeqUp retailer for Canada; manufacturer warranty service is coordinated through us when needed.",
        ],
      },
      {
        title: "Warranty Shipping",
        body: [
          "For warranty claims made within the first year from the effective date above (valid proof of purchase required), we will cover both inbound and outbound shipping costs within Canada. {name} is not responsible for items that are lost or damaged during inbound shipping.",
        ],
      },
      {
        title: "What the Warranty Does Not Cover",
        body: [
          "The warranty does not cover damage caused by unauthorized disassembly or repairs, accidents, negligence, normal wear and tear, or improper use. All lenses are excluded from warranty coverage. Products purchased from unauthorized dealers or sellers are not eligible for free warranty service.",
        ],
      },
      {
        title: "Returns and Refunds",
        body: [
          "For products purchased on {host}, you may request a return and refund within thirty (30) calendar days from the date of purchase — with valid proof of purchase such as the original receipt or invoice — or from the delivery date if it is later than the purchase date. The product must be unused, undamaged in appearance, with intact packaging, and must not affect resale.",
          "Return shipping is handled as follows:",
        ],
        bullets: [
          "Non-defective returns: the return shipping cost is borne by you.",
          "Defective products (manufacturing defects): {name} covers the return shipping cost.",
        ],
      },
      {
        title: "Return Conditions",
        body: [
          "The original purchase price will be refunded to your account within thirty (30) calendar days after we receive the returned product. When applying, please return the complete set (original packaging, all accessories, and any gifts) with all labels and markings intact, along with valid proof of purchase. Returns must be sent to the address specified by us with shipping prepaid; unauthorized or cash-on-delivery returns will be refused. If the item was part of a bundled discount, we reserve the right to revoke that discount during the refund.",
          "Returns are not accepted where valid proof of purchase is missing or altered; where the request is for non-quality reasons made more than thirty (30) days after purchase or delivery; where the product, packaging, accessories, gifts, or manuals are incomplete or not intact; where defects result from human error, unauthorized modification, incorrect installation, improper use, or failure to follow official instructions; or where the returned items are not shipped within seven (7) calendar days of return confirmation. A product used within 30 days of receipt is not eligible for return without a valid reason unless it is defective.",
        ],
      },
      {
        title: "Exchanges",
        body: [
          "For products purchased on {host} with a manufacturing defect, you may request a replacement within thirty (30) calendar days from the date of purchase (or delivery date if later). {name} covers the shipping cost for the replacement. Please return the complete set with valid proof of purchase; after inspection and confirmation, you will receive a new product of the same model and specifications. All lenses are excluded from exchange coverage.",
        ],
      },
      {
        title: "Repair Costs",
        body: [
          "If a covered product’s quality defect falls within the warranty scope, {name} (or the manufacturer via our coordination) covers the inspection fee, material costs, labor costs, and shipping fees. For products damaged by human factors or otherwise outside warranty coverage, you will be required to pay the repair fee, parts cost, and one-way shipping fee; if you cancel such a repair, you are responsible for the round-trip shipping costs.",
          "The warranty period for repaired or replaced parts is three (3) months from the date of repair or replacement, or the remaining warranty period of the original product, whichever is longer (parts only, not the entire product).",
        ],
      },
      {
        title: "Damage on Arrival",
        body: [
          "Please inspect your product upon receipt. If the outer packaging is damaged, refuse the delivery and have the courier return it. If the outer packaging is intact but the product inside is damaged or abnormal due to logistics, contact us at {supportEmail} within 24 hours to report the issue; otherwise it cannot be addressed.",
        ],
      },
    ],
  },
  fr: {
    updated: "23 juillet 2026",
    intro:
      "Soutien pour votre produit {shortName} acheté auprès de {name}, y compris le dépannage, la couverture de garantie et les options de retour.",
    sections: [
      {
        title: "Obtenir de l'aide",
        body: [
          "Veuillez nous écrire à {supportEmail} si vous éprouvez des difficultés avec votre produit {shortName}, car plusieurs problèmes se règlent rapidement avec notre aide.",
          "Lorsque vous nous contactez, veuillez indiquer votre numéro de commande, le numéro de modèle (SKU), le numéro de série, une vidéo (si disponible), la version de l'appli (si requise) et une brève description du problème afin que nous puissions vous aider plus efficacement.",
        ],
      },
      {
        title: "Couverture de garantie",
        body: [
          "Les produits {shortName} sont assortis d'une garantie limitée d'un an. Cette garantie couvre les Ranger AI Sports Camera Glasses, le Power Plus et le Bluetooth Controller. Tous les verres sont exclus de cette garantie. La garantie s'applique uniquement aux produits achetés auprès de {name} ou d'autres revendeurs BleeqUp agréés.",
          "Si un produit couvert s'avère défectueux et est encore sous garantie, il sera réparé ou remplacé sans frais pour le client (veuillez noter que tous les verres sont exclus).",
        ],
      },
      {
        title: "Période de garantie",
        body: [
          "La garantie prend effet à la date d'achat indiquée sur votre preuve d'achat valide, ou à la date de livraison si celle-ci est postérieure à la date d'achat. Une preuve d'achat valide est exigée pour toute demande de garantie.",
          "La période de garantie est assujettie aux lois locales applicables. Lorsque le droit canadien de la protection du consommateur accorde un droit plus long ou plus protecteur que la garantie limitée décrite ci-dessus, ce droit local s'applique et prévaut dans la mesure où il vous est plus favorable. {name} est un revendeur BleeqUp agréé pour le Canada; le service de garantie du fabricant est coordonné par notre entremise au besoin.",
        ],
      },
      {
        title: "Expédition en garantie",
        body: [
          "Pour les demandes de garantie présentées dans la première année suivant la date d'effet ci-dessus (preuve d'achat valide exigée), nous couvrons les frais d'expédition aller et retour au Canada. {name} n'est pas responsable des articles perdus ou endommagés pendant l'expédition de retour vers nous.",
        ],
      },
      {
        title: "Ce que la garantie ne couvre pas",
        body: [
          "La garantie ne couvre pas les dommages causés par un démontage ou des réparations non autorisés, les accidents, la négligence, l'usure normale ou une utilisation incorrecte. Tous les verres sont exclus de la couverture de garantie. Les produits achetés auprès de détaillants ou de vendeurs non autorisés ne sont pas admissibles au service de garantie gratuit.",
        ],
      },
      {
        title: "Retours et remboursements",
        body: [
          "Pour les produits achetés sur {host}, vous pouvez demander un retour et un remboursement dans les trente (30) jours civils suivant la date d'achat — avec une preuve d'achat valide comme le reçu ou la facture originale — ou suivant la date de livraison si elle est postérieure à la date d'achat. Le produit doit être inutilisé, d'apparence non endommagée, dans un emballage intact, et ne doit pas nuire à la revente.",
          "Les frais de retour sont traités comme suit :",
        ],
        bullets: [
          "Retours sans défaut : les frais d'expédition de retour sont à votre charge.",
          "Produits défectueux (défauts de fabrication) : {name} assume les frais d'expédition de retour.",
        ],
      },
      {
        title: "Conditions de retour",
        body: [
          "Le prix d'achat original sera remboursé dans votre compte dans les trente (30) jours civils suivant la réception du produit retourné. Au moment de la demande, veuillez retourner l'ensemble complet (emballage d'origine, tous les accessoires et tout cadeau) avec toutes les étiquettes et mentions intactes, ainsi qu'une preuve d'achat valide. Les retours doivent être envoyés à l'adresse que nous indiquons, port payé; les retours non autorisés ou en livraison contre remboursement seront refusés. Si l'article faisait partie d'un rabais groupé, nous nous réservons le droit d'annuler ce rabais au moment du remboursement.",
          "Les retours ne sont pas acceptés lorsque la preuve d'achat valide est manquante ou altérée; lorsque la demande est faite pour des raisons autres que la qualité plus de trente (30) jours après l'achat ou la livraison; lorsque le produit, l'emballage, les accessoires, les cadeaux ou les manuels sont incomplets ou non intacts; lorsque les défauts résultent d'une erreur humaine, d'une modification non autorisée, d'une installation incorrecte, d'une utilisation incorrecte ou du non-respect des instructions officielles; ou lorsque les articles retournés ne sont pas expédiés dans les sept (7) jours civils suivant la confirmation du retour. Un produit utilisé dans les 30 jours suivant la réception n'est pas admissible au retour sans motif valable, sauf s'il est défectueux.",
        ],
      },
      {
        title: "Échanges",
        body: [
          "Pour les produits achetés sur {host} présentant un défaut de fabrication, vous pouvez demander un remplacement dans les trente (30) jours civils suivant la date d'achat (ou la date de livraison si elle est postérieure). {name} assume les frais d'expédition du remplacement. Veuillez retourner l'ensemble complet avec une preuve d'achat valide; après inspection et confirmation, vous recevrez un nouveau produit du même modèle et des mêmes spécifications. Tous les verres sont exclus de la couverture d'échange.",
        ],
      },
      {
        title: "Frais de réparation",
        body: [
          "Si le défaut de qualité d'un produit couvert entre dans le champ de la garantie, {name} (ou le fabricant par notre coordination) assume les frais d'inspection, de matériel, de main-d'œuvre et d'expédition. Pour les produits endommagés par des facteurs humains ou autrement hors garantie, vous devrez payer les frais de réparation, le coût des pièces et les frais d'expédition aller; si vous annulez une telle réparation, les frais d'expédition aller-retour sont à votre charge.",
          "La période de garantie des pièces réparées ou remplacées est de trois (3) mois à compter de la date de réparation ou de remplacement, ou la période de garantie restante du produit original, selon la plus longue des deux (pièces seulement, pas le produit entier).",
        ],
      },
      {
        title: "Dommages à l'arrivée",
        body: [
          "Veuillez inspecter votre produit dès sa réception. Si l'emballage extérieur est endommagé, refusez la livraison et faites-le retourner par le coursier. Si l'emballage extérieur est intact mais que le produit à l'intérieur est endommagé ou anormal en raison de la logistique, communiquez avec nous à {supportEmail} dans les 24 heures pour signaler le problème; autrement, il ne pourra pas être traité.",
        ],
      },
    ],
  },
  de: {
    updated: "23. Juli 2026",
    intro:
      "Support für dein bei {name} gekauftes {shortName}-Produkt, einschließlich Fehlerbehebung, Garantieabdeckung und Rückgabeoptionen.",
    sections: [
      {
        title: "Hilfe erhalten",
        body: [
          "Bitte kontaktiere uns unter {supportEmail}, wenn du Schwierigkeiten mit deinem {shortName}-Produkt hast — viele Probleme lassen sich mit unserer Hilfe schnell lösen.",
          "Bitte nenne bei der Kontaktaufnahme deine Bestellnummer, Modellnummer (SKU), Seriennummer, ein Video (falls vorhanden), die App-Version (falls erforderlich) und eine kurze Beschreibung des Problems, damit wir dir effizienter helfen können.",
        ],
      },
      {
        title: "Garantieabdeckung",
        body: [
          "{shortName}-Produkte haben eine 1-jährige beschränkte Garantie. Diese Garantie gilt für die Ranger AI Sports Camera Glasses, Power Plus und den Bluetooth Controller. Alle Gläser sind von dieser Garantie ausgenommen. Die Garantie gilt nur für Produkte, die bei {name} oder anderen autorisierten BleeqUp-Händlern gekauft wurden.",
          "Wenn ein abgedecktes Produkt als defekt festgestellt wird und noch unter Garantie steht, wird es für den Kunden kostenlos repariert oder ersetzt (bitte beachte, dass alle Gläser nicht abgedeckt sind).",
        ],
      },
      {
        title: "Garantiezeitraum",
        body: [
          "Die Garantie gilt ab dem Kaufdatum auf deinem gültigen Kaufbeleg oder ab dem Lieferdatum, wenn das Lieferdatum nach dem Kaufdatum liegt. Für jeden Garantieanspruch ist ein gültiger Kaufbeleg erforderlich.",
          "Der Garantiezeitraum unterliegt den geltenden örtlichen Gesetzen. Wenn das kanadische Verbraucherschutzrecht einen längeren oder stärker schützenden Anspruch gewährt als die oben beschriebene beschränkte Garantie, gilt dieser gesetzliche Anspruch und hat Vorrang, soweit er für dich günstiger ist. {name} ist ein autorisierter BleeqUp-Händler für Kanada; der Herstellergarantieservice wird bei Bedarf über uns koordiniert.",
        ],
      },
      {
        title: "Garantieversand",
        body: [
          "Für Garantieansprüche innerhalb des ersten Jahres ab dem oben genannten Wirksamkeitsdatum (gültiger Kaufbeleg erforderlich) übernehmen wir die Hin- und Rückversandkosten innerhalb Kanadas. {name} ist nicht verantwortlich für Artikel, die beim eingehenden Versand verloren gehen oder beschädigt werden.",
        ],
      },
      {
        title: "Was die Garantie nicht abdeckt",
        body: [
          "Die Garantie deckt keine Schäden durch unbefugte Demontage oder Reparaturen, Unfälle, Fahrlässigkeit, normalen Verschleiß oder unsachgemäße Verwendung. Alle Gläser sind von der Garantie ausgeschlossen. Produkte von nicht autorisierten Händlern oder Verkäufern haben keinen Anspruch auf kostenlosen Garantieservice.",
        ],
      },
      {
        title: "Rückgaben und Erstattungen",
        body: [
          "Für auf {host} gekaufte Produkte kannst du innerhalb von dreißig (30) Kalendertagen ab dem Kaufdatum — mit gültigem Kaufbeleg wie dem Originalbeleg oder der Rechnung — oder ab dem Lieferdatum, wenn es nach dem Kaufdatum liegt, eine Rückgabe und Erstattung beantragen. Das Produkt muss unbenutzt, äußerlich unbeschädigt, mit intakter Verpackung sein und darf den Weiterverkauf nicht beeinträchtigen.",
          "Der Rückversand wird wie folgt gehandhabt:",
        ],
        bullets: [
          "Rückgaben ohne Defekt: die Rückversandkosten trägst du.",
          "Defekte Produkte (Herstellungsfehler): {name} übernimmt die Rückversandkosten.",
        ],
      },
      {
        title: "Rückgabebedingungen",
        body: [
          "Der ursprüngliche Kaufpreis wird innerhalb von dreißig (30) Kalendertagen nach Eingang des zurückgesandten Produkts auf dein Konto erstattet. Bitte sende bei der Beantragung das vollständige Set (Originalverpackung, alle Zubehörteile und etwaige Geschenke) mit allen Etiketten und Kennzeichnungen unversehrt sowie mit gültigem Kaufbeleg zurück. Rücksendungen müssen an die von uns angegebene Adresse mit vorausbezahltem Versand erfolgen; unautorisierte oder Nachnahme-Rücksendungen werden abgelehnt. War der Artikel Teil eines Bundle-Rabatts, behalten wir uns vor, diesen Rabatt bei der Erstattung zu widerrufen.",
          "Rückgaben werden nicht akzeptiert, wenn der gültige Kaufbeleg fehlt oder verändert ist; wenn der Antrag aus anderen als Qualitätsgründen mehr als dreißig (30) Tage nach Kauf oder Lieferung gestellt wird; wenn Produkt, Verpackung, Zubehör, Geschenke oder Handbücher unvollständig oder nicht intakt sind; wenn Mängel auf menschliches Versagen, unbefugte Änderung, falsche Installation, unsachgemäße Verwendung oder Nichtbefolgen der offiziellen Anweisungen zurückgehen; oder wenn die zurückgesandten Artikel nicht innerhalb von sieben (7) Kalendertagen nach Rückgabebestätigung versendet werden. Ein innerhalb von 30 Tagen nach Erhalt benutztes Produkt ist ohne triftigen Grund nicht rückgabefähig, es sei denn, es ist defekt.",
        ],
      },
      {
        title: "Umtausch",
        body: [
          "Für auf {host} gekaufte Produkte mit einem Herstellungsfehler kannst du innerhalb von dreißig (30) Kalendertagen ab dem Kaufdatum (oder dem späteren Lieferdatum) einen Ersatz beantragen. {name} übernimmt die Versandkosten für den Ersatz. Bitte sende das vollständige Set mit gültigem Kaufbeleg zurück; nach Prüfung und Bestätigung erhältst du ein neues Produkt desselben Modells und derselben Spezifikationen. Alle Gläser sind vom Umtausch ausgeschlossen.",
        ],
      },
      {
        title: "Reparaturkosten",
        body: [
          "Fällt der Qualitätsmangel eines abgedeckten Produkts in den Garantiebereich, übernimmt {name} (oder der Hersteller über unsere Koordination) die Prüfgebühr, Materialkosten, Arbeitskosten und Versandgebühren. Für durch menschliche Faktoren beschädigte oder anderweitig nicht von der Garantie erfasste Produkte zahlst du die Reparaturgebühr, die Teilekosten und die Einweg-Versandgebühr; stornierst du eine solche Reparatur, trägst du die Hin- und Rückversandkosten.",
          "Der Garantiezeitraum für reparierte oder ersetzte Teile beträgt drei (3) Monate ab dem Datum der Reparatur oder des Ersatzes oder die verbleibende Garantiezeit des Originalprodukts, je nachdem, was länger ist (nur Teile, nicht das gesamte Produkt).",
        ],
      },
      {
        title: "Schäden bei Ankunft",
        body: [
          "Bitte prüfe dein Produkt bei Erhalt. Ist die äußere Verpackung beschädigt, verweigere die Lieferung und lasse sie vom Kurier zurückschicken. Ist die äußere Verpackung intakt, das Produkt innen aber durch die Logistik beschädigt oder auffällig, kontaktiere uns innerhalb von 24 Stunden unter {supportEmail}; andernfalls kann der Fall nicht bearbeitet werden.",
        ],
      },
    ],
  },
  nl: {
    updated: "23 juli 2026",
    intro:
      "Ondersteuning voor je bij {name} gekochte {shortName}-product, inclusief probleemoplossing, garantiedekking en retouropties.",
    sections: [
      {
        title: "Hulp krijgen",
        body: [
          "Neem contact met ons op via {supportEmail} als je problemen ervaart met je {shortName}-product — veel kwesties zijn met onze hulp snel op te lossen.",
          "Vermeld bij contact je bestelnummer, modelnummer (SKU), serienummer, een video (indien beschikbaar), app-versie (indien vereist) en een korte beschrijving van het probleem, zodat we je efficiënter kunnen helpen.",
        ],
      },
      {
        title: "Garantiedekking",
        body: [
          "{shortName}-producten hebben een beperkte garantie van 1 jaar. Deze garantie dekt de Ranger AI Sports Camera Glasses, Power Plus en Bluetooth Controller. Alle glazen vallen niet onder deze garantie. De garantie geldt alleen voor producten gekocht bij {name} of andere erkende BleeqUp-verkopers.",
          "Als een gedekt product defect blijkt en nog onder garantie valt, wordt het kosteloos voor de klant gerepareerd of vervangen (let op: alle glazen zijn uitgesloten).",
        ],
      },
      {
        title: "Garantieperiode",
        body: [
          "De garantie gaat in op de aankoopdatum op je geldige aankoopbewijs, of op de leveringsdatum als die later is dan de aankoopdatum. Voor elke garantieclaim is een geldig aankoopbewijs vereist.",
          "De garantieperiode is onderworpen aan toepasselijke lokale wetten. Waar de Canadese consumentenbescherming een langer of beschermender recht biedt dan de hierboven beschreven beperkte garantie, geldt dat lokale recht en heeft het voorrang voor zover het gunstiger voor je is. {name} is een erkende BleeqUp-verkoper voor Canada; de garantiedienst van de fabrikant wordt indien nodig via ons gecoördineerd.",
        ],
      },
      {
        title: "Garantieverzending",
        body: [
          "Voor garantieclaims binnen het eerste jaar vanaf de hierboven genoemde ingangsdatum (geldig aankoopbewijs vereist) vergoeden wij de heen- en terugverzendkosten binnen Canada. {name} is niet verantwoordelijk voor artikelen die tijdens de inkomende verzending verloren gaan of beschadigd raken.",
        ],
      },
      {
        title: "Wat de garantie niet dekt",
        body: [
          "De garantie dekt geen schade door ongeautoriseerde demontage of reparaties, ongelukken, nalatigheid, normale slijtage of oneigenlijk gebruik. Alle glazen zijn uitgesloten van garantiedekking. Producten gekocht bij niet-erkende dealers of verkopers komen niet in aanmerking voor gratis garantiedienst.",
        ],
      },
      {
        title: "Retouren en terugbetalingen",
        body: [
          "Voor producten gekocht op {host} kun je binnen dertig (30) kalenderdagen vanaf de aankoopdatum — met geldig aankoopbewijs zoals het originele ontvangstbewijs of de factuur — of vanaf de leveringsdatum als die later is dan de aankoopdatum, een retour en terugbetaling aanvragen. Het product moet ongebruikt zijn, uiterlijk onbeschadigd, met intacte verpakking, en mag de wederverkoop niet beïnvloeden.",
          "Retourverzending wordt als volgt afgehandeld:",
        ],
        bullets: [
          "Retouren zonder defect: de retourverzendkosten zijn voor jouw rekening.",
          "Defecte producten (fabricagefouten): {name} vergoedt de retourverzendkosten.",
        ],
      },
      {
        title: "Retourvoorwaarden",
        body: [
          "De oorspronkelijke aankoopprijs wordt binnen dertig (30) kalenderdagen na ontvangst van het geretourneerde product op je rekening terugbetaald. Stuur bij de aanvraag de complete set terug (originele verpakking, alle accessoires en eventuele cadeaus) met alle labels en markeringen intact, plus geldig aankoopbewijs. Retouren moeten naar het door ons opgegeven adres worden gestuurd met vooruitbetaalde verzending; ongeautoriseerde of remboursretouren worden geweigerd. Als het artikel deel uitmaakte van een bundelkorting, behouden we ons het recht voor die korting bij de terugbetaling in te trekken.",
          "Retouren worden niet geaccepteerd wanneer het geldige aankoopbewijs ontbreekt of is gewijzigd; wanneer het verzoek om andere dan kwaliteitsredenen meer dan dertig (30) dagen na aankoop of levering wordt gedaan; wanneer product, verpakking, accessoires, cadeaus of handleidingen onvolledig of niet intact zijn; wanneer gebreken het gevolg zijn van menselijke fout, ongeautoriseerde wijziging, onjuiste installatie, oneigenlijk gebruik of het niet volgen van officiële instructies; of wanneer de geretourneerde artikelen niet binnen zeven (7) kalenderdagen na retourbevestiging worden verzonden. Een product dat binnen 30 dagen na ontvangst is gebruikt, komt zonder geldige reden niet in aanmerking voor retour, tenzij het defect is.",
        ],
      },
      {
        title: "Omruilen",
        body: [
          "Voor producten gekocht op {host} met een fabricagefout kun je binnen dertig (30) kalenderdagen vanaf de aankoopdatum (of de latere leveringsdatum) een vervanging aanvragen. {name} vergoedt de verzendkosten voor de vervanging. Stuur de complete set terug met geldig aankoopbewijs; na inspectie en bevestiging ontvang je een nieuw product van hetzelfde model en dezelfde specificaties. Alle glazen zijn uitgesloten van omruildekking.",
        ],
      },
      {
        title: "Reparatiekosten",
        body: [
          "Als het kwaliteitsgebrek van een gedekt product binnen de garantiescope valt, vergoedt {name} (of de fabrikant via onze coördinatie) de inspectiekosten, materiaalkosten, arbeidskosten en verzendkosten. Voor producten beschadigd door menselijke factoren of anderszins buiten de garantie betaal je de reparatiekosten, onderdelenkosten en enkele-reisverzendkosten; annuleer je zo'n reparatie, dan ben je verantwoordelijk voor de heen- en terugverzendkosten.",
          "De garantieperiode voor gerepareerde of vervangen onderdelen is drie (3) maanden vanaf de datum van reparatie of vervanging, of de resterende garantieperiode van het originele product, welke langer is (alleen onderdelen, niet het hele product).",
        ],
      },
      {
        title: "Schade bij aankomst",
        body: [
          "Inspecteer je product bij ontvangst. Als de buitenverpakking beschadigd is, weiger de levering en laat de koerier deze terugnemen. Als de buitenverpakking intact is maar het product binnenin door de logistiek beschadigd of afwijkend is, neem binnen 24 uur contact met ons op via {supportEmail}; anders kan het niet worden behandeld.",
        ],
      },
    ],
  },
  es: {
    updated: "23 de julio de 2026",
    intro:
      "Soporte para tu producto {shortName} comprado en {name}, incluyendo resolución de problemas, cobertura de garantía y opciones de devolución.",
    sections: [
      {
        title: "Cómo obtener ayuda",
        body: [
          "Escríbenos a {supportEmail} si tienes dificultades con tu producto {shortName}, ya que muchos problemas se resuelven rápido con nuestra ayuda.",
          "Al contactarnos, incluye tu número de pedido, número de modelo (SKU), número de serie, un vídeo (si está disponible), la versión de la app (si se requiere) y una breve descripción del problema para que podamos ayudarte con más eficacia.",
        ],
      },
      {
        title: "Cobertura de la garantía",
        body: [
          "Los productos {shortName} incluyen una garantía limitada de 1 año. Esta garantía cubre las Ranger AI Sports Camera Glasses, Power Plus y Bluetooth Controller. Todas las lentes quedan fuera de esta garantía. La garantía se aplica solo a productos comprados en {name} u otros revendedores BleeqUp autorizados.",
          "Si un producto cubierto resulta defectuoso y sigue en garantía, se reparará o sustituirá sin coste para el cliente (ten en cuenta que todas las lentes quedan fuera).",
        ],
      },
      {
        title: "Periodo de garantía",
        body: [
          "La garantía entra en vigor en la fecha de compra que figura en tu prueba de compra válida, o en la fecha de entrega si esta es posterior a la fecha de compra. Se requiere una prueba de compra válida para cualquier reclamación de garantía.",
          "El periodo de garantía está sujeto a las leyes locales aplicables. Cuando la ley canadiense de protección al consumidor otorgue un derecho más largo o más protector que la garantía limitada descrita arriba, ese derecho local se aplica y prevalece en la medida en que te sea más favorable. {name} es un minorista BleeqUp autorizado para Canadá; el servicio de garantía del fabricante se coordina a través de nosotros cuando hace falta.",
        ],
      },
      {
        title: "Envío en garantía",
        body: [
          "Para reclamaciones de garantía hechas dentro del primer año desde la fecha de efecto anterior (se requiere prueba de compra válida), cubriremos los costes de envío de ida y vuelta dentro de Canadá. {name} no es responsable de artículos perdidos o dañados durante el envío de entrada.",
        ],
      },
      {
        title: "Qué no cubre la garantía",
        body: [
          "La garantía no cubre daños causados por desmontaje o reparaciones no autorizados, accidentes, negligencia, desgaste normal o uso indebido. Todas las lentes quedan excluidas de la cobertura de garantía. Los productos comprados a distribuidores o vendedores no autorizados no son elegibles para el servicio de garantía gratuito.",
        ],
      },
      {
        title: "Devoluciones y reembolsos",
        body: [
          "Para productos comprados en {host}, puedes solicitar una devolución y reembolso dentro de treinta (30) días naturales desde la fecha de compra — con prueba de compra válida como el recibo o factura original — o desde la fecha de entrega si es posterior a la fecha de compra. El producto debe estar sin usar, sin daños de aspecto, con el embalaje intacto, y no debe afectar a la reventa.",
          "El envío de devolución se gestiona así:",
        ],
        bullets: [
          "Devoluciones no defectuosas: el coste de envío de devolución corre de tu cuenta.",
          "Productos defectuosos (defectos de fabricación): {name} cubre el coste de envío de devolución.",
        ],
      },
      {
        title: "Condiciones de devolución",
        body: [
          "El precio de compra original se reembolsará a tu cuenta dentro de treinta (30) días naturales después de que recibamos el producto devuelto. Al solicitarlo, devuelve el conjunto completo (embalaje original, todos los accesorios y cualquier regalo) con todas las etiquetas y marcas intactas, junto con prueba de compra válida. Las devoluciones deben enviarse a la dirección que indiquemos con el envío pagado; se rechazarán devoluciones no autorizadas o contrarreembolso. Si el artículo formaba parte de un descuento por pack, nos reservamos el derecho a revocar ese descuento durante el reembolso.",
          "No se aceptan devoluciones cuando falta o está alterada la prueba de compra válida; cuando la solicitud es por motivos distintos de la calidad más de treinta (30) días después de la compra o entrega; cuando el producto, embalaje, accesorios, regalos o manuales están incompletos o no intactos; cuando los defectos se deben a error humano, modificación no autorizada, instalación incorrecta, uso indebido o no seguir las instrucciones oficiales; o cuando los artículos devueltos no se envían dentro de siete (7) días naturales desde la confirmación de devolución. Un producto usado dentro de los 30 días posteriores a la recepción no es elegible para devolución sin un motivo válido, salvo que sea defectuoso.",
        ],
      },
      {
        title: "Cambios",
        body: [
          "Para productos comprados en {host} con un defecto de fabricación, puedes solicitar un recambio dentro de treinta (30) días naturales desde la fecha de compra (o la fecha de entrega si es posterior). {name} cubre el coste de envío del recambio. Devuelve el conjunto completo con prueba de compra válida; tras la inspección y confirmación, recibirás un producto nuevo del mismo modelo y especificaciones. Todas las lentes quedan excluidas de la cobertura de cambio.",
        ],
      },
      {
        title: "Costes de reparación",
        body: [
          "Si el defecto de calidad de un producto cubierto entra en el alcance de la garantía, {name} (o el fabricante a través de nuestra coordinación) cubre la tarifa de inspección, costes de material, costes de mano de obra y gastos de envío. Para productos dañados por factores humanos o que queden fuera de la garantía, deberás pagar la tarifa de reparación, el coste de las piezas y el envío de ida; si cancelas esa reparación, eres responsable de los costes de envío de ida y vuelta.",
          "El periodo de garantía de las piezas reparadas o sustituidas es de tres (3) meses desde la fecha de reparación o sustitución, o el periodo de garantía restante del producto original, el que sea más largo (solo piezas, no el producto entero).",
        ],
      },
      {
        title: "Daños a la llegada",
        body: [
          "Inspecciona tu producto al recibirlo. Si el embalaje exterior está dañado, rechaza la entrega y haz que el mensajero lo devuelva. Si el embalaje exterior está intacto pero el producto interior está dañado o anormal por la logística, contáctanos en {supportEmail} en un plazo de 24 horas para informar del problema; de lo contrario no se podrá atender.",
        ],
      },
    ],
  },
  it: {
    updated: "23 luglio 2026",
    intro:
      "Assistenza per il tuo prodotto {shortName} acquistato da {name}, inclusa la risoluzione dei problemi, la copertura in garanzia e le opzioni di reso.",
    sections: [
      {
        title: "Come ottenere aiuto",
        body: [
          "Contattaci a {supportEmail} se hai difficoltà con il tuo prodotto {shortName}: molti problemi si risolvono in fretta con il nostro aiuto.",
          "Quando ci scrivi, includi il numero d'ordine, il numero di modello (SKU), il numero di serie, un video (se disponibile), la versione dell'app (se richiesta) e una breve descrizione del problema, così possiamo assisterti in modo più efficiente.",
        ],
      },
      {
        title: "Copertura della garanzia",
        body: [
          "I prodotti {shortName} hanno una garanzia limitata di 1 anno. Questa garanzia copre le Ranger AI Sports Camera Glasses, Power Plus e Bluetooth Controller. Tutte le lenti sono escluse da questa garanzia. La garanzia si applica solo ai prodotti acquistati da {name} o da altri rivenditori BleeqUp autorizzati.",
          "Se un prodotto coperto risulta difettoso ed è ancora in garanzia, verrà riparato o sostituito senza costi per il cliente (si prega di notare che tutte le lenti sono escluse).",
        ],
      },
      {
        title: "Periodo di garanzia",
        body: [
          "La garanzia decorre dalla data di acquisto indicata sulla prova d'acquisto valida, o dalla data di consegna se successiva alla data di acquisto. Per qualsiasi richiesta di garanzia è necessaria una prova d'acquisto valida.",
          "Il periodo di garanzia è soggetto alle leggi locali applicabili. Laddove la legge canadese di tutela dei consumatori conceda un diritto più lungo o più protettivo della garanzia limitata descritta sopra, quel diritto locale si applica e prevale nella misura in cui ti è più favorevole. {name} è un rivenditore BleeqUp autorizzato per il Canada; il servizio di garanzia del produttore viene coordinato tramite di noi quando necessario.",
        ],
      },
      {
        title: "Spedizione in garanzia",
        body: [
          "Per le richieste di garanzia presentate entro il primo anno dalla data di effetto sopra (prova d'acquisto valida richiesta), copriamo i costi di spedizione di andata e ritorno in Canada. {name} non è responsabile per articoli persi o danneggiati durante la spedizione in ingresso.",
        ],
      },
      {
        title: "Cosa non copre la garanzia",
        body: [
          "La garanzia non copre danni causati da smontaggio o riparazioni non autorizzati, incidenti, negligenza, usura normale o uso improprio. Tutte le lenti sono escluse dalla copertura in garanzia. I prodotti acquistati da rivenditori o venditori non autorizzati non sono ammessi al servizio di garanzia gratuito.",
        ],
      },
      {
        title: "Resi e rimborsi",
        body: [
          "Per i prodotti acquistati su {host}, puoi richiedere un reso e un rimborso entro trenta (30) giorni di calendario dalla data di acquisto — con prova d'acquisto valida come lo scontrino o la fattura originale — o dalla data di consegna se successiva alla data di acquisto. Il prodotto deve essere inutilizzato, integro nell'aspetto, con imballaggio intatto, e non deve pregiudicare la rivendita.",
          "La spedizione di reso è gestita come segue:",
        ],
        bullets: [
          "Resi non difettosi: il costo di spedizione del reso è a tuo carico.",
          "Prodotti difettosi (difetti di fabbricazione): {name} copre il costo di spedizione del reso.",
        ],
      },
      {
        title: "Condizioni di reso",
        body: [
          "Il prezzo di acquisto originale verrà rimborsato sul tuo account entro trenta (30) giorni di calendario dopo che avremo ricevuto il prodotto reso. In fase di richiesta, restituisci il set completo (imballaggio originale, tutti gli accessori ed eventuali omaggi) con tutte le etichette e le marcature integre, insieme alla prova d'acquisto valida. I resi devono essere inviati all'indirizzo da noi indicato con spedizione prepagata; i resi non autorizzati o in contrassegno saranno rifiutati. Se l'articolo faceva parte di uno sconto in bundle, ci riserviamo il diritto di revocare tale sconto in fase di rimborso.",
          "I resi non sono accettati quando manca o è alterata la prova d'acquisto valida; quando la richiesta è per motivi non di qualità oltre trenta (30) giorni dopo l'acquisto o la consegna; quando prodotto, imballaggio, accessori, omaggi o manuali sono incompleti o non integri; quando i difetti derivano da errore umano, modifica non autorizzata, installazione errata, uso improprio o mancato rispetto delle istruzioni ufficiali; o quando gli articoli resi non vengono spediti entro sette (7) giorni di calendario dalla conferma del reso. Un prodotto usato entro 30 giorni dal ricevimento non è idoneo al reso senza un motivo valido, salvo che sia difettoso.",
        ],
      },
      {
        title: "Sostituzioni",
        body: [
          "Per i prodotti acquistati su {host} con un difetto di fabbricazione, puoi richiedere una sostituzione entro trenta (30) giorni di calendario dalla data di acquisto (o dalla data di consegna se successiva). {name} copre il costo di spedizione della sostituzione. Restituisci il set completo con prova d'acquisto valida; dopo ispezione e conferma, riceverai un prodotto nuovo dello stesso modello e delle stesse specifiche. Tutte le lenti sono escluse dalla copertura di sostituzione.",
        ],
      },
      {
        title: "Costi di riparazione",
        body: [
          "Se il difetto di qualità di un prodotto coperto rientra nell'ambito della garanzia, {name} (o il produttore tramite il nostro coordinamento) copre la tariffa di ispezione, i costi di materiale, i costi di manodopera e le spese di spedizione. Per i prodotti danneggiati da fattori umani o comunque fuori garanzia, dovrai pagare la tariffa di riparazione, il costo dei ricambi e la spedizione di sola andata; se annulli tale riparazione, sei responsabile dei costi di spedizione andata e ritorno.",
          "Il periodo di garanzia per i ricambi riparati o sostituiti è di tre (3) mesi dalla data di riparazione o sostituzione, o il periodo di garanzia residuo del prodotto originale, se più lungo (solo ricambi, non l'intero prodotto).",
        ],
      },
      {
        title: "Danni all'arrivo",
        body: [
          "Ispeziona il prodotto al ricevimento. Se l'imballaggio esterno è danneggiato, rifiuta la consegna e fai in modo che il corriere lo restituisca. Se l'imballaggio esterno è integro ma il prodotto interno è danneggiato o anomalo a causa della logistica, contattaci a {supportEmail} entro 24 ore per segnalare il problema; altrimenti non potrà essere gestito.",
        ],
      },
    ],
  },
  "pt-PT": {
    updated: "23 de julho de 2026",
    intro:
      "Apoio para o seu produto {shortName} comprado em {name}, incluindo resolução de problemas, cobertura de garantia e opções de devolução.",
    sections: [
      {
        title: "Como obter ajuda",
        body: [
          "Contacte-nos em {supportEmail} se tiver dificuldades com o seu produto {shortName}, pois muitos problemas resolvem-se rapidamente com a nossa ajuda.",
          "Ao contactar-nos, indique o número da encomenda, o número de modelo (SKU), o número de série, um vídeo (se disponível), a versão da app (se necessária) e uma breve descrição do problema para o podermos ajudar com mais eficiência.",
        ],
      },
      {
        title: "Cobertura da garantia",
        body: [
          "Os produtos {shortName} têm uma garantia limitada de 1 ano. Esta garantia cobre as Ranger AI Sports Camera Glasses, Power Plus e Bluetooth Controller. Todas as lentes estão excluídas desta garantia. A garantia aplica-se apenas a produtos comprados em {name} ou noutros revendedores BleeqUp autorizados.",
          "Se um produto coberto for considerado defeituoso e ainda estiver em garantia, será reparado ou substituído sem custo para o cliente (note que todas as lentes estão excluídas).",
        ],
      },
      {
        title: "Período de garantia",
        body: [
          "A garantia produz efeitos a partir da data de compra indicada no comprovativo de compra válido, ou da data de entrega se esta for posterior à data de compra. É necessário um comprovativo de compra válido para qualquer pedido de garantia.",
          "O período de garantia está sujeito às leis locais aplicáveis. Quando a lei canadiana de proteção do consumidor conceder um direito mais longo ou mais protetor do que a garantia limitada descrita acima, esse direito local aplica-se e prevalece na medida em que lhe for mais favorável. {name} é um revendedor BleeqUp autorizado para o Canadá; o serviço de garantia do fabricante é coordenado através de nós quando necessário.",
        ],
      },
      {
        title: "Envio em garantia",
        body: [
          "Para pedidos de garantia feitos no primeiro ano a contar da data de efeito acima (comprovativo de compra válido necessário), cobrimos os custos de envio de ida e volta no Canadá. {name} não é responsável por artigos perdidos ou danificados durante o envio de entrada.",
        ],
      },
      {
        title: "O que a garantia não cobre",
        body: [
          "A garantia não cobre danos causados por desmontagem ou reparações não autorizadas, acidentes, negligência, desgaste normal ou utilização indevida. Todas as lentes estão excluídas da cobertura de garantia. Os produtos comprados a revendedores ou vendedores não autorizados não são elegíveis para o serviço de garantia gratuito.",
        ],
      },
      {
        title: "Devoluções e reembolsos",
        body: [
          "Para produtos comprados em {host}, pode pedir uma devolução e reembolso no prazo de trinta (30) dias de calendário a contar da data de compra — com comprovativo de compra válido, como o recibo ou fatura original — ou da data de entrega se for posterior à data de compra. O produto deve estar por usar, sem danos de aspeto, com embalagem intacta, e não deve afetar a revenda.",
          "O envio de devolução é tratado da seguinte forma:",
        ],
        bullets: [
          "Devoluções sem defeito: o custo de envio da devolução é suportado por si.",
          "Produtos defeituosos (defeitos de fabrico): {name} cobre o custo de envio da devolução.",
        ],
      },
      {
        title: "Condições de devolução",
        body: [
          "O preço de compra original será reembolsado na sua conta no prazo de trinta (30) dias de calendário após recebermos o produto devolvido. Ao pedir, devolva o conjunto completo (embalagem original, todos os acessórios e quaisquer ofertas) com todos os rótulos e marcações intactos, juntamente com comprovativo de compra válido. As devoluções devem ser enviadas para o endereço por nós indicado com portes pagos; devoluções não autorizadas ou à cobrança serão recusadas. Se o artigo fez parte de um desconto em conjunto, reservamo-nos o direito de revogar esse desconto no reembolso.",
          "As devoluções não são aceites quando o comprovativo de compra válido está em falta ou alterado; quando o pedido é por motivos que não de qualidade mais de trinta (30) dias após a compra ou entrega; quando o produto, embalagem, acessórios, ofertas ou manuais estão incompletos ou não intactos; quando os defeitos resultam de erro humano, alteração não autorizada, instalação incorreta, utilização indevida ou incumprimento das instruções oficiais; ou quando os artigos devolvidos não são enviados no prazo de sete (7) dias de calendário após a confirmação da devolução. Um produto usado nos 30 dias após a receção não é elegível para devolução sem um motivo válido, salvo se for defeituoso.",
        ],
      },
      {
        title: "Trocas",
        body: [
          "Para produtos comprados em {host} com um defeito de fabrico, pode pedir uma substituição no prazo de trinta (30) dias de calendário a contar da data de compra (ou da data de entrega se for posterior). {name} cobre o custo de envio da substituição. Devolva o conjunto completo com comprovativo de compra válido; após inspeção e confirmação, receberá um produto novo do mesmo modelo e especificações. Todas as lentes estão excluídas da cobertura de troca.",
        ],
      },
      {
        title: "Custos de reparação",
        body: [
          "Se o defeito de qualidade de um produto coberto estiver no âmbito da garantia, {name} (ou o fabricante através da nossa coordenação) cobre a taxa de inspeção, custos de material, custos de mão de obra e taxas de envio. Para produtos danificados por fatores humanos ou de outro modo fora da garantia, terá de pagar a taxa de reparação, o custo das peças e o envio só de ida; se cancelar essa reparação, é responsável pelos custos de envio de ida e volta.",
          "O período de garantia das peças reparadas ou substituídas é de três (3) meses a contar da data da reparação ou substituição, ou o período de garantia restante do produto original, o que for mais longo (apenas peças, não o produto inteiro).",
        ],
      },
      {
        title: "Danos à chegada",
        body: [
          "Inspecione o produto à receção. Se a embalagem exterior estiver danificada, recuse a entrega e peça ao estafeta que a devolva. Se a embalagem exterior estiver intacta mas o produto no interior estiver danificado ou anormal devido à logística, contacte-nos em {supportEmail} no prazo de 24 horas para reportar o problema; caso contrário, não poderá ser tratado.",
        ],
      },
    ],
  },
  ja: {
    updated: "2026年7月23日",
    intro:
      "{name}でご購入いただいた{shortName}製品のサポート（トラブルシューティング、保証範囲、返品オプションを含みます）。",
    sections: [
      {
        title: "サポートのご案内",
        body: [
          "{shortName}製品で不具合がある場合は {supportEmail} までご連絡ください。多くの問題は、当社のサポートで迅速に解決できます。",
          "ご連絡の際は、注文番号、型番（SKU）、シリアル番号、動画（あれば）、アプリのバージョン（必要な場合）、問題の簡単な説明をお知らせください。より迅速に対応できます。",
        ],
      },
      {
        title: "保証範囲",
        body: [
          "{shortName}製品には1年間の限定保証が付きます。この保証は Ranger AI Sports Camera Glasses、Power Plus、Bluetooth Controller を対象とします。すべてのレンズはこの保証の対象外です。保証は {name} またはその他の正規 BleeqUp 販売店で購入した製品にのみ適用されます。",
          "対象製品に欠陥があり、まだ保証期間内である場合、お客様負担なく修理または交換します（すべてのレンズは対象外である点にご注意ください）。",
        ],
      },
      {
        title: "保証期間",
        body: [
          "保証は、有効な購入証明に記載の購入日、または配送日が購入日より後の場合はその配送日から効力を生じます。保証請求には有効な購入証明が必要です。",
          "保証期間は適用される現地法に従います。カナダの消費者保護法が上記の限定保証より長い、またはより保護的な権利を定める場合、お客様により有利な範囲でその現地法上の権利が適用され優先します。{name} はカナダ向けの正規 BleeqUp 販売店です。メーカー保証サービスは、必要な場合当社を通じて調整します。",
        ],
      },
      {
        title: "保証送料",
        body: [
          "上記の効力発生日から1年以内に行われた保証請求（有効な購入証明が必要）については、カナダ国内の往復送料を当社が負担します。{name} は、返送中に紛失または損傷した品目について責任を負いません。",
        ],
      },
      {
        title: "保証の対象外",
        body: [
          "保証は、無断分解または修理、事故、過失、通常の摩耗、不適切な使用による損傷を対象としません。すべてのレンズは保証対象外です。正規販売店以外の販売者から購入した製品は、無料の保証サービス対象外です。",
        ],
      },
      {
        title: "返品と返金",
        body: [
          "{host} で購入した製品は、購入日（または配送日が購入日より後の場合はその配送日）から三十（30）暦日以内に、原本の領収書や請求書などの有効な購入証明とともに返品・返金を請求できます。製品は未使用で、外観に損傷がなく、梱包が無傷で、再販に影響しない状態である必要があります。",
          "返送は次のとおり扱います。",
        ],
        bullets: [
          "欠陥のない返品：返送料はお客様負担です。",
          "欠陥製品（製造上の欠陥）：{name} が返送料を負担します。",
        ],
      },
      {
        title: "返品条件",
        body: [
          "返金は、返送品を受領してから三十（30）暦日以内に、元の購入価格をご指定の口座へ返金します。申請時は、すべてのラベルと表記が無傷の完全セット（元箱、すべての付属品、贈呈品）と有効な購入証明を返送してください。返送は当社指定の住所へ送料前払いで送付してください。無断返送または代金引換の返送は拒否します。バンドル割引の一部だった場合、返金時にその割引を取り消す権利を留保します。",
          "有効な購入証明がない、または改変されている場合。品質以外の理由で購入または配送から三十（30）日を超えて請求した場合。製品、梱包、付属品、贈呈品、説明書が不完全または無傷でない場合。欠陥が人為ミス、無断改造、誤った取り付け、不適切な使用、公式手順の不遵守による場合。返品確認から七（7）暦日以内に発送されない場合。返品は受け付けません。受領後30日以内に使用した製品は、欠陥がない限り、正当な理由なしに返品できません。",
        ],
      },
      {
        title: "交換",
        body: [
          "{host} で購入し製造上の欠陥がある製品は、購入日（またはそれより後の配送日）から三十（30）暦日以内に交換を請求できます。交換の送料は {name} が負担します。有効な購入証明とともに完全セットを返送してください。検査・確認後、同じモデル・仕様の新品をお届けします。すべてのレンズは交換対象外です。",
        ],
      },
      {
        title: "修理費用",
        body: [
          "対象製品の品質上の欠陥が保証範囲内である場合、検査料、材料費、工賃、送料は {name}（または当社調整によるメーカー）が負担します。人為的要因による損傷や保証対象外の製品については、修理費、部品代、片道送料をお支払いいただきます。そのような修理をキャンセルした場合、往復送料はお客様負担です。",
          "修理または交換した部品の保証期間は、修理または交換日から三（3）か月、または元の製品の残存保証期間のうち長い方です（部品のみ。製品全体ではありません）。",
        ],
      },
      {
        title: "到着時の損傷",
        body: [
          "受領時に製品を点検してください。外装が損傷している場合は配送を拒否し、宅配便に返送させてください。外装は無傷でも、物流により内部の製品が損傷または異常な場合は、24時間以内に {supportEmail} までご連絡ください。それ以降は対応できません。",
        ],
      },
    ],
  },
  "zh-CN": {
    updated: "2026年7月23日",
    intro: "针对您从 {name} 购买的 {shortName} 产品的支持，包括故障排除、保修范围和退货选项。",
    sections: [
      {
        title: "获取帮助",
        body: [
          "如果您的 {shortName} 产品出现任何问题，请通过 {supportEmail} 联系我们，许多问题可在我们的协助下迅速解决。",
          "联系时请提供订单号、型号（SKU）、序列号、视频（如有）、应用版本（如需要）以及问题的简要说明，以便我们更高效地协助您。",
        ],
      },
      {
        title: "保修范围",
        body: [
          "{shortName} 产品享有 1 年有限保修。本保修涵盖 Ranger AI Sports Camera Glasses、Power Plus 和 Bluetooth Controller。所有镜片不在本保修范围内。保修仅适用于从 {name} 或其他授权 BleeqUp 经销商处购买的产品。",
          "如果所涵盖产品被认定为有缺陷且仍在保修期内，将为客户免费维修或更换（请注意所有镜片均不涵盖）。",
        ],
      },
      {
        title: "保修期限",
        body: [
          "保修自有效购买凭证上所示的购买日期起生效，若交付日期晚于购买日期，则以交付日期为准。任何保修申请均需提供有效购买凭证。",
          "保修期限受适用当地法律约束。若加拿大消费者保护法提供比上述有限保修更长或更具保护性的权利，则在对您更有利的范围内适用并优先于该当地法律权利。{name} 是面向加拿大的授权 BleeqUp 零售商；制造商保修服务在需要时由我们协调。",
        ],
      },
      {
        title: "保修运费",
        body: [
          "自上述生效日期起一年内提出的保修申请（需有效购买凭证），我们将承担加拿大境内的往返运费。{name} 对寄回途中丢失或损坏的物品不承担责任。",
        ],
      },
      {
        title: "保修不包括的内容",
        body: [
          "保修不涵盖因未经授权拆卸或维修、事故、疏忽、正常磨损或不当使用造成的损坏。所有镜片均排除在保修范围之外。从未授权经销商或卖家处购买的产品不符合免费保修服务资格。",
        ],
      },
      {
        title: "退货与退款",
        body: [
          "在 {host} 购买的产品，可自购买日期起三十（30）个日历日内（需提供原始收据或发票等有效购买凭证）申请退货退款；若交付日期晚于购买日期，则自交付日期起算。产品必须未使用、外观无损、包装完好，且不得影响再销售。",
          "退货运费按如下方式处理：",
        ],
        bullets: [
          "非缺陷退货：退货运费由您承担。",
          "缺陷产品（制造缺陷）：{name} 承担退货运费。",
        ],
      },
      {
        title: "退货条件",
        body: [
          "我们将在收到退回产品后三十（30）个日历日内，将原始购买价格退回您的账户。申请时请退回完整套装（原包装、全部配件及任何赠品），所有标签和标记完好，并附有效购买凭证。退货须预付运费寄至我们指定的地址；未经授权或货到付款的退货将被拒收。若该商品属于捆绑折扣的一部分，我们保留在退款时撤销该折扣的权利。",
          "在以下情况下不接受退货：有效购买凭证缺失或被改动；非质量原因且在购买或交付超过三十（30）天后提出；产品、包装、配件、赠品或说明书不完整或不完好；缺陷由人为失误、未经授权改装、错误安装、不当使用或未遵循官方说明导致；或退回物品未在退货确认后七（7）个日历日内寄出。收货后 30 天内已使用的产品，除非存在缺陷，否则无正当理由不得退货。",
        ],
      },
      {
        title: "换货",
        body: [
          "在 {host} 购买且存在制造缺陷的产品，可自购买日期（或较晚的交付日期）起三十（30）个日历日内申请更换。{name} 承担更换件的运费。请连同有效购买凭证退回完整套装；经检查确认后，您将收到同型号、同规格的新产品。所有镜片均排除在换货范围之外。",
        ],
      },
      {
        title: "维修费用",
        body: [
          "若所涵盖产品的质量缺陷属于保修范围，{name}（或经我们协调的制造商）承担检查费、材料费、人工费和运费。因人为因素损坏或超出保修范围的产品，您需支付维修费、零件费和单程运费；若取消此类维修，往返运费由您承担。",
          "已维修或更换零件的保修期为自维修或更换之日起三（3）个月，或原产品剩余保修期，以较长者为准（仅限零件，不含整机）。",
        ],
      },
      {
        title: "收货损坏",
        body: [
          "请在收货时检查产品。若外包装损坏，请拒收并让快递员退回。若外包装完好但内部产品因物流损坏或异常，请在 24 小时内通过 {supportEmail} 联系我们报告问题；否则将无法处理。",
        ],
      },
    ],
  },
};

const VERVEACE: Record<Locale, PolicyTemplate> = {
  en: {
    updated: "July 23, 2026",
    intro:
      "Support for products purchased from {name}, including troubleshooting, warranty coverage, and return options for BleeqUp, MGI, Motocaddy, and other eligible gear.",
    sections: [
      {
        title: "Getting Help",
        body: [
          "Please contact us at {supportEmail} if you experience any difficulties with a product purchased from {name}, as many issues can be resolved quickly with our assistance.",
          "When reaching out, please include your order number, model number (SKU), serial number, a video (if available), app version (if required for smart devices), and a brief description of the issue so we can assist you more efficiently.",
        ],
      },
      {
        title: "Warranty Coverage",
        body: [
          "{name} is an authorized retailer for BleeqUp, MGI, and Motocaddy. Manufacturer warranties apply to eligible products purchased from us.",
          "BleeqUp products come with a 1-year limited manufacturer warranty covering the Ranger AI Sports Camera Glasses, Power Plus, and Bluetooth Controller. All lenses are not covered by this warranty. The warranty applies only to products purchased from {name} or other authorized BleeqUp resellers.",
          "MGI and Motocaddy electric trolleys and eligible accessories are covered by their respective manufacturer warranties. Contact us with your proof of purchase and we will help coordinate warranty service with the brand when needed.",
          "If a covered BleeqUp product is found to be defective and is still under warranty, it will be repaired or replaced at no cost to the customer (lenses excluded).",
        ],
      },
      {
        title: "Warranty Period",
        body: [
          "The warranty takes effect from the purchase date shown on your valid proof of purchase, or the delivery date if the delivery date is later than the purchase date. A valid proof of purchase is required for any warranty claim.",
          "The warranty period is subject to applicable local laws. Customers in the European Union and EEA may be entitled to a statutory minimum 2-year legal guarantee of conformity from the date of delivery for goods purchased for personal use. Where local law provides a longer or more protective warranty than the limited warranty described above, that local-law entitlement applies and prevails to the extent it is more favorable to you.",
        ],
      },
      {
        title: "Warranty Shipping",
        body: [
          "For eligible BleeqUp warranty claims made within the first year from the effective date above (valid proof of purchase required), inbound and outbound shipping costs for approved claims are covered as arranged with our support team. {name} is not responsible for items that are lost or damaged during inbound shipping unless we arranged the carrier label.",
          "Shipping terms for MGI and Motocaddy warranty claims follow the applicable manufacturer process; we will advise you when coordinating service.",
        ],
      },
      {
        title: "What the Warranty Does Not Cover",
        body: [
          "The warranty does not cover damage caused by unauthorized disassembly or repairs, accidents, negligence, normal wear and tear, or improper use. BleeqUp lenses are excluded from warranty coverage. Products purchased from unauthorized dealers or sellers are not eligible for free warranty service through {name}.",
        ],
      },
      {
        title: "Returns and Refunds",
        body: [
          "For products purchased on {host}, you may request a return and refund within thirty (30) calendar days from the date of purchase — with valid proof of purchase such as the original receipt or invoice — or from the delivery date if it is later than the purchase date. The product must be unused, undamaged in appearance, with intact packaging, and must not affect resale.",
          "Return shipping is handled as follows:",
        ],
        bullets: [
          "Non-defective returns: the return shipping cost is borne by you.",
          "Defective products (manufacturing defects): {name} covers the return shipping cost.",
        ],
      },
      {
        title: "Return Conditions",
        body: [
          "The original purchase price will be refunded to your account within thirty (30) calendar days after we receive the returned product. When applying, please return the complete set (original packaging, all accessories, and any gifts) with all labels and markings intact, along with valid proof of purchase. Returns must be sent to the address specified by us with shipping prepaid; unauthorized or cash-on-delivery returns will be refused. If the item was part of a bundled discount, we reserve the right to revoke that discount during the refund.",
          "Returns are not accepted where valid proof of purchase is missing or altered; where the request is for non-quality reasons made more than thirty (30) days after purchase or delivery; where the product, packaging, accessories, gifts, or manuals are incomplete or not intact; where defects result from human error, unauthorized modification, incorrect installation, improper use, or failure to follow official instructions; or where the returned items are not shipped within seven (7) calendar days of return confirmation. A product used within 30 days of receipt is not eligible for return without a valid reason unless it is defective.",
        ],
      },
      {
        title: "Exchanges",
        body: [
          "For products purchased on {host} with a manufacturing defect, you may request a replacement within thirty (30) calendar days from the date of purchase (or delivery date if later). {name} covers the shipping cost for the replacement. Please return the complete set with valid proof of purchase; after inspection and confirmation, you will receive a new product of the same model and specifications. BleeqUp lenses are excluded from exchange coverage.",
        ],
      },
      {
        title: "Repair Costs",
        body: [
          "If a covered product’s quality defect falls within the warranty scope, inspection, material, labor, and shipping fees for approved claims are covered as arranged with the manufacturer or {name}. For products damaged by human factors or otherwise outside warranty coverage, you will be required to pay the repair fee, parts cost, and one-way shipping fee; if you cancel such a repair, you are responsible for the round-trip shipping costs.",
          "For BleeqUp repairs or replacements, the warranty period for repaired or replaced parts is three (3) months from the date of repair or replacement, or the remaining warranty period of the original product, whichever is longer (parts only, not the entire product). Other brands follow their manufacturer terms.",
        ],
      },
      {
        title: "Damage on Arrival",
        body: [
          "Please inspect your product upon receipt. If the outer packaging is damaged, refuse the delivery and have the courier return it. If the outer packaging is intact but the product inside is damaged or abnormal due to logistics, contact us at {supportEmail} within 24 hours to report the issue; otherwise it cannot be addressed.",
        ],
      },
    ],
  },
  fr: {
    updated: "23 juillet 2026",
    intro:
      "Soutien pour les produits achetés auprès de {name}, y compris le dépannage, la couverture de garantie et les options de retour pour BleeqUp, MGI, Motocaddy et tout autre équipement admissible.",
    sections: [
      {
        title: "Obtenir de l'aide",
        body: [
          "Veuillez nous écrire à {supportEmail} si vous éprouvez des difficultés avec un produit acheté auprès de {name}, car plusieurs problèmes se règlent rapidement avec notre aide.",
          "Lorsque vous nous contactez, veuillez indiquer votre numéro de commande, le numéro de modèle (SKU), le numéro de série, une vidéo (si disponible), la version de l'appli (si requise pour les appareils intelligents) et une brève description du problème afin que nous puissions vous aider plus efficacement.",
        ],
      },
      {
        title: "Couverture de garantie",
        body: [
          "{name} est un revendeur agréé de BleeqUp, MGI et Motocaddy. Les garanties du fabricant s'appliquent aux produits admissibles achetés chez nous.",
          "Les produits BleeqUp sont assortis d'une garantie limitée d'un an du fabricant couvrant les Ranger AI Sports Camera Glasses, le Power Plus et le Bluetooth Controller. Tous les verres sont exclus de cette garantie. La garantie s'applique uniquement aux produits achetés auprès de {name} ou d'autres revendeurs BleeqUp agréés.",
          "Les chariots électriques MGI et Motocaddy et les accessoires admissibles sont couverts par leurs garanties fabricant respectives. Communiquez avec nous en joignant votre preuve d'achat et nous aiderons à coordonner le service de garantie avec la marque au besoin.",
          "Si un produit BleeqUp couvert s'avère défectueux et est encore sous garantie, il sera réparé ou remplacé sans frais pour le client (verres exclus).",
        ],
      },
      {
        title: "Période de garantie",
        body: [
          "La garantie prend effet à la date d'achat indiquée sur votre preuve d'achat valide, ou à la date de livraison si celle-ci est postérieure à la date d'achat. Une preuve d'achat valide est exigée pour toute demande de garantie.",
          "La période de garantie est assujettie aux lois locales applicables. Les clients de l'Union européenne et de l'EEE peuvent avoir droit à une garantie légale de conformité d'une durée minimale de 2 ans à compter de la date de livraison pour les biens achetés à des fins personnelles. Lorsque le droit local prévoit une garantie plus longue ou plus protectrice que la garantie limitée décrite ci-dessus, ce droit local s'applique et prévaut dans la mesure où il vous est plus favorable.",
        ],
      },
      {
        title: "Expédition en garantie",
        body: [
          "Pour les demandes de garantie BleeqUp admissibles présentées dans la première année suivant la date d'effet ci-dessus (preuve d'achat valide exigée), les frais d'expédition aller et retour des demandes approuvées sont couverts selon les arrangements pris avec notre équipe de soutien. {name} n'est pas responsable des articles perdus ou endommagés pendant l'expédition de retour vers nous, sauf si nous avons fourni l'étiquette du transporteur.",
          "Les modalités d'expédition des demandes de garantie MGI et Motocaddy suivent le processus du fabricant applicable; nous vous en informerons lors de la coordination du service.",
        ],
      },
      {
        title: "Ce que la garantie ne couvre pas",
        body: [
          "La garantie ne couvre pas les dommages causés par un démontage ou des réparations non autorisés, les accidents, la négligence, l'usure normale ou une utilisation incorrecte. Les verres BleeqUp sont exclus de la couverture de garantie. Les produits achetés auprès de détaillants ou de vendeurs non autorisés ne sont pas admissibles au service de garantie gratuit par l'entremise de {name}.",
        ],
      },
      {
        title: "Retours et remboursements",
        body: [
          "Pour les produits achetés sur {host}, vous pouvez demander un retour et un remboursement dans les trente (30) jours civils suivant la date d'achat — avec une preuve d'achat valide comme le reçu ou la facture originale — ou suivant la date de livraison si elle est postérieure à la date d'achat. Le produit doit être inutilisé, d'apparence non endommagée, dans un emballage intact, et ne doit pas nuire à la revente.",
          "Les frais de retour sont traités comme suit :",
        ],
        bullets: [
          "Retours sans défaut : les frais d'expédition de retour sont à votre charge.",
          "Produits défectueux (défauts de fabrication) : {name} assume les frais d'expédition de retour.",
        ],
      },
      {
        title: "Conditions de retour",
        body: [
          "Le prix d'achat original sera remboursé dans votre compte dans les trente (30) jours civils suivant la réception du produit retourné. Au moment de la demande, veuillez retourner l'ensemble complet (emballage d'origine, tous les accessoires et tout cadeau) avec toutes les étiquettes et mentions intactes, ainsi qu'une preuve d'achat valide. Les retours doivent être envoyés à l'adresse que nous indiquons, port payé; les retours non autorisés ou en livraison contre remboursement seront refusés. Si l'article faisait partie d'un rabais groupé, nous nous réservons le droit d'annuler ce rabais au moment du remboursement.",
          "Les retours ne sont pas acceptés lorsque la preuve d'achat valide est manquante ou altérée; lorsque la demande est faite pour des raisons autres que la qualité plus de trente (30) jours après l'achat ou la livraison; lorsque le produit, l'emballage, les accessoires, les cadeaux ou les manuels sont incomplets ou non intacts; lorsque les défauts résultent d'une erreur humaine, d'une modification non autorisée, d'une installation incorrecte, d'une utilisation incorrecte ou du non-respect des instructions officielles; ou lorsque les articles retournés ne sont pas expédiés dans les sept (7) jours civils suivant la confirmation du retour. Un produit utilisé dans les 30 jours suivant la réception n'est pas admissible au retour sans motif valable, sauf s'il est défectueux.",
        ],
      },
      {
        title: "Échanges",
        body: [
          "Pour les produits achetés sur {host} présentant un défaut de fabrication, vous pouvez demander un remplacement dans les trente (30) jours civils suivant la date d'achat (ou la date de livraison si elle est postérieure). {name} assume les frais d'expédition du remplacement. Veuillez retourner l'ensemble complet avec une preuve d'achat valide; après inspection et confirmation, vous recevrez un nouveau produit du même modèle et des mêmes spécifications. Les verres BleeqUp sont exclus de la couverture d'échange.",
        ],
      },
      {
        title: "Frais de réparation",
        body: [
          "Si le défaut de qualité d'un produit couvert entre dans le champ de la garantie, les frais d'inspection, de matériel, de main-d'œuvre et d'expédition des demandes approuvées sont couverts selon les arrangements pris avec le fabricant ou {name}. Pour les produits endommagés par des facteurs humains ou autrement hors garantie, vous devrez payer les frais de réparation, le coût des pièces et les frais d'expédition aller; si vous annulez une telle réparation, les frais d'expédition aller-retour sont à votre charge.",
          "Pour les réparations ou remplacements BleeqUp, la période de garantie des pièces réparées ou remplacées est de trois (3) mois à compter de la date de réparation ou de remplacement, ou la période de garantie restante du produit original, selon la plus longue des deux (pièces seulement, pas le produit entier). Les autres marques suivent les conditions de leur fabricant.",
        ],
      },
      {
        title: "Dommages à l'arrivée",
        body: [
          "Veuillez inspecter votre produit dès sa réception. Si l'emballage extérieur est endommagé, refusez la livraison et faites-le retourner par le coursier. Si l'emballage extérieur est intact mais que le produit à l'intérieur est endommagé ou anormal en raison de la logistique, communiquez avec nous à {supportEmail} dans les 24 heures pour signaler le problème; autrement, il ne pourra pas être traité.",
        ],
      },
    ],
  },
  de: {
    updated: "23. Juli 2026",
    intro:
      "Support für bei {name} gekaufte Produkte, einschließlich Fehlerbehebung, Garantieabdeckung und Rückgabeoptionen für BleeqUp, MGI, Motocaddy und anderes berechtigtes Equipment.",
    sections: [
      {
        title: "Hilfe erhalten",
        body: [
          "Bitte kontaktiere uns unter {supportEmail}, wenn du Schwierigkeiten mit einem bei {name} gekauften Produkt hast — viele Probleme lassen sich mit unserer Hilfe schnell lösen.",
          "Bitte nenne bei der Kontaktaufnahme deine Bestellnummer, Modellnummer (SKU), Seriennummer, ein Video (falls vorhanden), die App-Version (falls für Smart-Geräte erforderlich) und eine kurze Beschreibung des Problems, damit wir dir effizienter helfen können.",
        ],
      },
      {
        title: "Garantieabdeckung",
        body: [
          "{name} ist ein autorisierter Händler für BleeqUp, MGI und Motocaddy. Herstellergarantien gelten für berechtigte, bei uns gekaufte Produkte.",
          "BleeqUp-Produkte haben eine 1-jährige beschränkte Herstellergarantie für die Ranger AI Sports Camera Glasses, Power Plus und den Bluetooth Controller. Alle Gläser sind von dieser Garantie ausgenommen. Die Garantie gilt nur für Produkte, die bei {name} oder anderen autorisierten BleeqUp-Händlern gekauft wurden.",
          "Elektrische Trolleys von MGI und Motocaddy sowie berechtigtes Zubehör unterliegen den jeweiligen Herstellergarantien. Kontaktiere uns mit deinem Kaufbeleg und wir helfen bei Bedarf, den Garantieservice mit der Marke zu koordinieren.",
          "Wenn ein abgedecktes BleeqUp-Produkt als defekt festgestellt wird und noch unter Garantie steht, wird es für den Kunden kostenlos repariert oder ersetzt (Gläser ausgeschlossen).",
        ],
      },
      {
        title: "Garantiezeitraum",
        body: [
          "Die Garantie gilt ab dem Kaufdatum auf deinem gültigen Kaufbeleg oder ab dem Lieferdatum, wenn das Lieferdatum nach dem Kaufdatum liegt. Für jeden Garantieanspruch ist ein gültiger Kaufbeleg erforderlich.",
          "Der Garantiezeitraum unterliegt den geltenden örtlichen Gesetzen. Kunden in der Europäischen Union und im EWR können ab dem Lieferdatum Anspruch auf eine gesetzliche Mindestgarantie der Vertragskonformität von 2 Jahren für Waren zum persönlichen Gebrauch haben. Wenn örtliches Recht eine längere oder stärker schützende Garantie vorsieht als die oben beschriebene beschränkte Garantie, gilt dieser gesetzliche Anspruch und hat Vorrang, soweit er für dich günstiger ist.",
        ],
      },
      {
        title: "Garantieversand",
        body: [
          "Für berechtigte BleeqUp-Garantieansprüche innerhalb des ersten Jahres ab dem oben genannten Wirksamkeitsdatum (gültiger Kaufbeleg erforderlich) werden Hin- und Rückversandkosten für genehmigte Ansprüche nach Absprache mit unserem Support-Team übernommen. {name} ist nicht verantwortlich für Artikel, die beim eingehenden Versand verloren gehen oder beschädigt werden, es sei denn, wir haben das Versandetikett bereitgestellt.",
          "Die Versandbedingungen für Garantieansprüche von MGI und Motocaddy folgen dem jeweiligen Herstellerprozess; wir beraten dich bei der Koordination des Service.",
        ],
      },
      {
        title: "Was die Garantie nicht abdeckt",
        body: [
          "Die Garantie deckt keine Schäden durch unbefugte Demontage oder Reparaturen, Unfälle, Fahrlässigkeit, normalen Verschleiß oder unsachgemäße Verwendung. BleeqUp-Gläser sind von der Garantie ausgeschlossen. Produkte von nicht autorisierten Händlern oder Verkäufern haben keinen Anspruch auf kostenlosen Garantieservice über {name}.",
        ],
      },
      {
        title: "Rückgaben und Erstattungen",
        body: [
          "Für auf {host} gekaufte Produkte kannst du innerhalb von dreißig (30) Kalendertagen ab dem Kaufdatum — mit gültigem Kaufbeleg wie dem Originalbeleg oder der Rechnung — oder ab dem Lieferdatum, wenn es nach dem Kaufdatum liegt, eine Rückgabe und Erstattung beantragen. Das Produkt muss unbenutzt, äußerlich unbeschädigt, mit intakter Verpackung sein und darf den Weiterverkauf nicht beeinträchtigen.",
          "Der Rückversand wird wie folgt gehandhabt:",
        ],
        bullets: [
          "Rückgaben ohne Defekt: die Rückversandkosten trägst du.",
          "Defekte Produkte (Herstellungsfehler): {name} übernimmt die Rückversandkosten.",
        ],
      },
      {
        title: "Rückgabebedingungen",
        body: [
          "Der ursprüngliche Kaufpreis wird innerhalb von dreißig (30) Kalendertagen nach Eingang des zurückgesandten Produkts auf dein Konto erstattet. Bitte sende bei der Beantragung das vollständige Set (Originalverpackung, alle Zubehörteile und etwaige Geschenke) mit allen Etiketten und Kennzeichnungen unversehrt sowie mit gültigem Kaufbeleg zurück. Rücksendungen müssen an die von uns angegebene Adresse mit vorausbezahltem Versand erfolgen; unautorisierte oder Nachnahme-Rücksendungen werden abgelehnt. War der Artikel Teil eines Bundle-Rabatts, behalten wir uns vor, diesen Rabatt bei der Erstattung zu widerrufen.",
          "Rückgaben werden nicht akzeptiert, wenn der gültige Kaufbeleg fehlt oder verändert ist; wenn der Antrag aus anderen als Qualitätsgründen mehr als dreißig (30) Tage nach Kauf oder Lieferung gestellt wird; wenn Produkt, Verpackung, Zubehör, Geschenke oder Handbücher unvollständig oder nicht intakt sind; wenn Mängel auf menschliches Versagen, unbefugte Änderung, falsche Installation, unsachgemäße Verwendung oder Nichtbefolgen der offiziellen Anweisungen zurückgehen; oder wenn die zurückgesandten Artikel nicht innerhalb von sieben (7) Kalendertagen nach Rückgabebestätigung versendet werden. Ein innerhalb von 30 Tagen nach Erhalt benutztes Produkt ist ohne triftigen Grund nicht rückgabefähig, es sei denn, es ist defekt.",
        ],
      },
      {
        title: "Umtausch",
        body: [
          "Für auf {host} gekaufte Produkte mit einem Herstellungsfehler kannst du innerhalb von dreißig (30) Kalendertagen ab dem Kaufdatum (oder dem späteren Lieferdatum) einen Ersatz beantragen. {name} übernimmt die Versandkosten für den Ersatz. Bitte sende das vollständige Set mit gültigem Kaufbeleg zurück; nach Prüfung und Bestätigung erhältst du ein neues Produkt desselben Modells und derselben Spezifikationen. BleeqUp-Gläser sind vom Umtausch ausgeschlossen.",
        ],
      },
      {
        title: "Reparaturkosten",
        body: [
          "Fällt der Qualitätsmangel eines abgedeckten Produkts in den Garantiebereich, werden Prüf-, Material-, Arbeits- und Versandgebühren für genehmigte Ansprüche nach Absprache mit dem Hersteller oder {name} übernommen. Für durch menschliche Faktoren beschädigte oder anderweitig nicht von der Garantie erfasste Produkte zahlst du die Reparaturgebühr, die Teilekosten und die Einweg-Versandgebühr; stornierst du eine solche Reparatur, trägst du die Hin- und Rückversandkosten.",
          "Für BleeqUp-Reparaturen oder -Ersatz beträgt der Garantiezeitraum für reparierte oder ersetzte Teile drei (3) Monate ab dem Datum der Reparatur oder des Ersatzes oder die verbleibende Garantiezeit des Originalprodukts, je nachdem, was länger ist (nur Teile, nicht das gesamte Produkt). Andere Marken folgen den Herstellerbedingungen.",
        ],
      },
      {
        title: "Schäden bei Ankunft",
        body: [
          "Bitte prüfe dein Produkt bei Erhalt. Ist die äußere Verpackung beschädigt, verweigere die Lieferung und lasse sie vom Kurier zurückschicken. Ist die äußere Verpackung intakt, das Produkt innen aber durch die Logistik beschädigt oder auffällig, kontaktiere uns innerhalb von 24 Stunden unter {supportEmail}; andernfalls kann der Fall nicht bearbeitet werden.",
        ],
      },
    ],
  },
  nl: {
    updated: "23 juli 2026",
    intro:
      "Ondersteuning voor bij {name} gekochte producten, inclusief probleemoplossing, garantiedekking en retouropties voor BleeqUp, MGI, Motocaddy en andere in aanmerking komende uitrusting.",
    sections: [
      {
        title: "Hulp krijgen",
        body: [
          "Neem contact met ons op via {supportEmail} als je problemen ervaart met een bij {name} gekocht product — veel kwesties zijn met onze hulp snel op te lossen.",
          "Vermeld bij contact je bestelnummer, modelnummer (SKU), serienummer, een video (indien beschikbaar), app-versie (indien vereist voor slimme apparaten) en een korte beschrijving van het probleem, zodat we je efficiënter kunnen helpen.",
        ],
      },
      {
        title: "Garantiedekking",
        body: [
          "{name} is een erkende verkoper van BleeqUp, MGI en Motocaddy. Fabrieksgaranties gelden voor bij ons gekochte in aanmerking komende producten.",
          "BleeqUp-producten hebben een beperkte fabrieksgarantie van 1 jaar voor de Ranger AI Sports Camera Glasses, Power Plus en Bluetooth Controller. Alle glazen vallen niet onder deze garantie. De garantie geldt alleen voor producten gekocht bij {name} of andere erkende BleeqUp-verkopers.",
          "Elektrische trolleys van MGI en Motocaddy en in aanmerking komende accessoires vallen onder hun respectieve fabrieksgaranties. Neem contact met ons op met je aankoopbewijs en we helpen indien nodig de garantiedienst met het merk te coördineren.",
          "Als een gedekt BleeqUp-product defect blijkt en nog onder garantie valt, wordt het kosteloos voor de klant gerepareerd of vervangen (glazen uitgesloten).",
        ],
      },
      {
        title: "Garantieperiode",
        body: [
          "De garantie gaat in op de aankoopdatum op je geldige aankoopbewijs, of op de leveringsdatum als die later is dan de aankoopdatum. Voor elke garantieclaim is een geldig aankoopbewijs vereist.",
          "De garantieperiode is onderworpen aan toepasselijke lokale wetten. Klanten in de Europese Unie en de EER kunnen recht hebben op een wettelijke minimale garantie van conformiteit van 2 jaar vanaf de leveringsdatum voor goederen gekocht voor persoonlijk gebruik. Waar lokale wet een langere of beschermendere garantie biedt dan de hierboven beschreven beperkte garantie, geldt dat lokale recht en heeft het voorrang voor zover het gunstiger voor je is.",
        ],
      },
      {
        title: "Garantieverzending",
        body: [
          "Voor in aanmerking komende BleeqUp-garantieclaims binnen het eerste jaar vanaf de hierboven genoemde ingangsdatum (geldig aankoopbewijs vereist) worden heen- en terugverzendkosten voor goedgekeurde claims gedekt zoals afgesproken met ons supportteam. {name} is niet verantwoordelijk voor artikelen die tijdens de inkomende verzending verloren gaan of beschadigd raken, tenzij wij het verzendlabel hebben geregeld.",
          "Verzendvoorwaarden voor garantieclaims van MGI en Motocaddy volgen het toepasselijke fabrikantenproces; we adviseren je bij het coördineren van de service.",
        ],
      },
      {
        title: "Wat de garantie niet dekt",
        body: [
          "De garantie dekt geen schade door ongeautoriseerde demontage of reparaties, ongelukken, nalatigheid, normale slijtage of oneigenlijk gebruik. BleeqUp-glazen zijn uitgesloten van garantiedekking. Producten gekocht bij niet-erkende dealers of verkopers komen niet in aanmerking voor gratis garantiedienst via {name}.",
        ],
      },
      {
        title: "Retouren en terugbetalingen",
        body: [
          "Voor producten gekocht op {host} kun je binnen dertig (30) kalenderdagen vanaf de aankoopdatum — met geldig aankoopbewijs zoals het originele ontvangstbewijs of de factuur — of vanaf de leveringsdatum als die later is dan de aankoopdatum, een retour en terugbetaling aanvragen. Het product moet ongebruikt zijn, uiterlijk onbeschadigd, met intacte verpakking, en mag de wederverkoop niet beïnvloeden.",
          "Retourverzending wordt als volgt afgehandeld:",
        ],
        bullets: [
          "Retouren zonder defect: de retourverzendkosten zijn voor jouw rekening.",
          "Defecte producten (fabricagefouten): {name} vergoedt de retourverzendkosten.",
        ],
      },
      {
        title: "Retourvoorwaarden",
        body: [
          "De oorspronkelijke aankoopprijs wordt binnen dertig (30) kalenderdagen na ontvangst van het geretourneerde product op je rekening terugbetaald. Stuur bij de aanvraag de complete set terug (originele verpakking, alle accessoires en eventuele cadeaus) met alle labels en markeringen intact, plus geldig aankoopbewijs. Retouren moeten naar het door ons opgegeven adres worden gestuurd met vooruitbetaalde verzending; ongeautoriseerde of remboursretouren worden geweigerd. Als het artikel deel uitmaakte van een bundelkorting, behouden we ons het recht voor die korting bij de terugbetaling in te trekken.",
          "Retouren worden niet geaccepteerd wanneer het geldige aankoopbewijs ontbreekt of is gewijzigd; wanneer het verzoek om andere dan kwaliteitsredenen meer dan dertig (30) dagen na aankoop of levering wordt gedaan; wanneer product, verpakking, accessoires, cadeaus of handleidingen onvolledig of niet intact zijn; wanneer gebreken het gevolg zijn van menselijke fout, ongeautoriseerde wijziging, onjuiste installatie, oneigenlijk gebruik of het niet volgen van officiële instructies; of wanneer de geretourneerde artikelen niet binnen zeven (7) kalenderdagen na retourbevestiging worden verzonden. Een product dat binnen 30 dagen na ontvangst is gebruikt, komt zonder geldige reden niet in aanmerking voor retour, tenzij het defect is.",
        ],
      },
      {
        title: "Omruilen",
        body: [
          "Voor producten gekocht op {host} met een fabricagefout kun je binnen dertig (30) kalenderdagen vanaf de aankoopdatum (of de latere leveringsdatum) een vervanging aanvragen. {name} vergoedt de verzendkosten voor de vervanging. Stuur de complete set terug met geldig aankoopbewijs; na inspectie en bevestiging ontvang je een nieuw product van hetzelfde model en dezelfde specificaties. BleeqUp-glazen zijn uitgesloten van omruildekking.",
        ],
      },
      {
        title: "Reparatiekosten",
        body: [
          "Als het kwaliteitsgebrek van een gedekt product binnen de garantiescope valt, worden inspectie-, materiaal-, arbeids- en verzendkosten voor goedgekeurde claims gedekt zoals afgesproken met de fabrikant of {name}. Voor producten beschadigd door menselijke factoren of anderszins buiten de garantie betaal je de reparatiekosten, onderdelenkosten en enkele-reisverzendkosten; annuleer je zo'n reparatie, dan ben je verantwoordelijk voor de heen- en terugverzendkosten.",
          "Voor BleeqUp-reparaties of -vervangingen is de garantieperiode voor gerepareerde of vervangen onderdelen drie (3) maanden vanaf de datum van reparatie of vervanging, of de resterende garantieperiode van het originele product, welke langer is (alleen onderdelen, niet het hele product). Andere merken volgen hun fabrikantvoorwaarden.",
        ],
      },
      {
        title: "Schade bij aankomst",
        body: [
          "Inspecteer je product bij ontvangst. Als de buitenverpakking beschadigd is, weiger de levering en laat de koerier deze terugnemen. Als de buitenverpakking intact is maar het product binnenin door de logistiek beschadigd of afwijkend is, neem binnen 24 uur contact met ons op via {supportEmail}; anders kan het niet worden behandeld.",
        ],
      },
    ],
  },
  es: {
    updated: "23 de julio de 2026",
    intro:
      "Soporte para productos comprados en {name}, incluyendo resolución de problemas, cobertura de garantía y opciones de devolución para BleeqUp, MGI, Motocaddy y otro equipo elegible.",
    sections: [
      {
        title: "Cómo obtener ayuda",
        body: [
          "Escríbenos a {supportEmail} si tienes dificultades con un producto comprado en {name}, ya que muchos problemas se resuelven rápido con nuestra ayuda.",
          "Al contactarnos, incluye tu número de pedido, número de modelo (SKU), número de serie, un vídeo (si está disponible), la versión de la app (si se requiere para dispositivos inteligentes) y una breve descripción del problema para que podamos ayudarte con más eficacia.",
        ],
      },
      {
        title: "Cobertura de la garantía",
        body: [
          "{name} es un minorista autorizado de BleeqUp, MGI y Motocaddy. Las garantías del fabricante se aplican a los productos elegibles comprados a nosotros.",
          "Los productos BleeqUp incluyen una garantía limitada de 1 año del fabricante que cubre las Ranger AI Sports Camera Glasses, Power Plus y Bluetooth Controller. Todas las lentes quedan fuera de esta garantía. La garantía se aplica solo a productos comprados en {name} u otros revendedores BleeqUp autorizados.",
          "Los carros eléctricos MGI y Motocaddy y los accesorios elegibles están cubiertos por sus respectivas garantías de fabricante. Contáctanos con tu prueba de compra y te ayudaremos a coordinar el servicio de garantía con la marca cuando haga falta.",
          "Si un producto BleeqUp cubierto resulta defectuoso y sigue en garantía, se reparará o sustituirá sin coste para el cliente (lentes excluidas).",
        ],
      },
      {
        title: "Periodo de garantía",
        body: [
          "La garantía entra en vigor en la fecha de compra que figura en tu prueba de compra válida, o en la fecha de entrega si esta es posterior a la fecha de compra. Se requiere una prueba de compra válida para cualquier reclamación de garantía.",
          "El periodo de garantía está sujeto a las leyes locales aplicables. Los clientes de la Unión Europea y el EEE pueden tener derecho a una garantía legal mínima de conformidad de 2 años desde la fecha de entrega para bienes comprados para uso personal. Cuando la ley local prevea una garantía más larga o más protectora que la garantía limitada descrita arriba, ese derecho local se aplica y prevalece en la medida en que te sea más favorable.",
        ],
      },
      {
        title: "Envío en garantía",
        body: [
          "Para reclamaciones de garantía BleeqUp elegibles hechas dentro del primer año desde la fecha de efecto anterior (se requiere prueba de compra válida), los costes de envío de ida y vuelta de las reclamaciones aprobadas se cubren según lo acordado con nuestro equipo de soporte. {name} no es responsable de artículos perdidos o dañados durante el envío de entrada, salvo que hayamos gestionado la etiqueta del transportista.",
          "Las condiciones de envío de las reclamaciones de garantía de MGI y Motocaddy siguen el proceso del fabricante aplicable; te informaremos al coordinar el servicio.",
        ],
      },
      {
        title: "Qué no cubre la garantía",
        body: [
          "La garantía no cubre daños causados por desmontaje o reparaciones no autorizados, accidentes, negligencia, desgaste normal o uso indebido. Las lentes BleeqUp quedan excluidas de la cobertura de garantía. Los productos comprados a distribuidores o vendedores no autorizados no son elegibles para el servicio de garantía gratuito a través de {name}.",
        ],
      },
      {
        title: "Devoluciones y reembolsos",
        body: [
          "Para productos comprados en {host}, puedes solicitar una devolución y reembolso dentro de treinta (30) días naturales desde la fecha de compra — con prueba de compra válida como el recibo o factura original — o desde la fecha de entrega si es posterior a la fecha de compra. El producto debe estar sin usar, sin daños de aspecto, con el embalaje intacto, y no debe afectar a la reventa.",
          "El envío de devolución se gestiona así:",
        ],
        bullets: [
          "Devoluciones no defectuosas: el coste de envío de devolución corre de tu cuenta.",
          "Productos defectuosos (defectos de fabricación): {name} cubre el coste de envío de devolución.",
        ],
      },
      {
        title: "Condiciones de devolución",
        body: [
          "El precio de compra original se reembolsará a tu cuenta dentro de treinta (30) días naturales después de que recibamos el producto devuelto. Al solicitarlo, devuelve el conjunto completo (embalaje original, todos los accesorios y cualquier regalo) con todas las etiquetas y marcas intactas, junto con prueba de compra válida. Las devoluciones deben enviarse a la dirección que indiquemos con el envío pagado; se rechazarán devoluciones no autorizadas o contrarreembolso. Si el artículo formaba parte de un descuento por pack, nos reservamos el derecho a revocar ese descuento durante el reembolso.",
          "No se aceptan devoluciones cuando falta o está alterada la prueba de compra válida; cuando la solicitud es por motivos distintos de la calidad más de treinta (30) días después de la compra o entrega; cuando el producto, embalaje, accesorios, regalos o manuales están incompletos o no intactos; cuando los defectos se deben a error humano, modificación no autorizada, instalación incorrecta, uso indebido o no seguir las instrucciones oficiales; o cuando los artículos devueltos no se envían dentro de siete (7) días naturales desde la confirmación de devolución. Un producto usado dentro de los 30 días posteriores a la recepción no es elegible para devolución sin un motivo válido, salvo que sea defectuoso.",
        ],
      },
      {
        title: "Cambios",
        body: [
          "Para productos comprados en {host} con un defecto de fabricación, puedes solicitar un recambio dentro de treinta (30) días naturales desde la fecha de compra (o la fecha de entrega si es posterior). {name} cubre el coste de envío del recambio. Devuelve el conjunto completo con prueba de compra válida; tras la inspección y confirmación, recibirás un producto nuevo del mismo modelo y especificaciones. Las lentes BleeqUp quedan excluidas de la cobertura de cambio.",
        ],
      },
      {
        title: "Costes de reparación",
        body: [
          "Si el defecto de calidad de un producto cubierto entra en el alcance de la garantía, las tarifas de inspección, material, mano de obra y envío de las reclamaciones aprobadas se cubren según lo acordado con el fabricante o {name}. Para productos dañados por factores humanos o que queden fuera de la garantía, deberás pagar la tarifa de reparación, el coste de las piezas y el envío de ida; si cancelas esa reparación, eres responsable de los costes de envío de ida y vuelta.",
          "Para reparaciones o sustituciones BleeqUp, el periodo de garantía de las piezas reparadas o sustituidas es de tres (3) meses desde la fecha de reparación o sustitución, o el periodo de garantía restante del producto original, el que sea más largo (solo piezas, no el producto entero). Otras marcas siguen las condiciones de su fabricante.",
        ],
      },
      {
        title: "Daños a la llegada",
        body: [
          "Inspecciona tu producto al recibirlo. Si el embalaje exterior está dañado, rechaza la entrega y haz que el mensajero lo devuelva. Si el embalaje exterior está intacto pero el producto interior está dañado o anormal por la logística, contáctanos en {supportEmail} en un plazo de 24 horas para informar del problema; de lo contrario no se podrá atender.",
        ],
      },
    ],
  },
  it: {
    updated: "23 luglio 2026",
    intro:
      "Assistenza per i prodotti acquistati da {name}, inclusa la risoluzione dei problemi, la copertura in garanzia e le opzioni di reso per BleeqUp, MGI, Motocaddy e altra attrezzatura idonea.",
    sections: [
      {
        title: "Come ottenere aiuto",
        body: [
          "Contattaci a {supportEmail} se hai difficoltà con un prodotto acquistato da {name}: molti problemi si risolvono in fretta con il nostro aiuto.",
          "Quando ci scrivi, includi il numero d'ordine, il numero di modello (SKU), il numero di serie, un video (se disponibile), la versione dell'app (se richiesta per i dispositivi smart) e una breve descrizione del problema, così possiamo assisterti in modo più efficiente.",
        ],
      },
      {
        title: "Copertura della garanzia",
        body: [
          "{name} è un rivenditore autorizzato di BleeqUp, MGI e Motocaddy. Le garanzie del produttore si applicano ai prodotti idonei acquistati da noi.",
          "I prodotti BleeqUp hanno una garanzia limitata di 1 anno del produttore che copre le Ranger AI Sports Camera Glasses, Power Plus e Bluetooth Controller. Tutte le lenti sono escluse da questa garanzia. La garanzia si applica solo ai prodotti acquistati da {name} o da altri rivenditori BleeqUp autorizzati.",
          "I trolley elettrici MGI e Motocaddy e gli accessori idonei sono coperti dalle rispettive garanzie del produttore. Contattaci con la prova d'acquisto e ti aiuteremo a coordinare il servizio di garanzia con il marchio quando necessario.",
          "Se un prodotto BleeqUp coperto risulta difettoso ed è ancora in garanzia, verrà riparato o sostituito senza costi per il cliente (lenti escluse).",
        ],
      },
      {
        title: "Periodo di garanzia",
        body: [
          "La garanzia decorre dalla data di acquisto indicata sulla prova d'acquisto valida, o dalla data di consegna se successiva alla data di acquisto. Per qualsiasi richiesta di garanzia è necessaria una prova d'acquisto valida.",
          "Il periodo di garanzia è soggetto alle leggi locali applicabili. I clienti nell'Unione europea e nello SEE possono avere diritto a una garanzia legale minima di conformità di 2 anni dalla data di consegna per i beni acquistati per uso personale. Laddove la legge locale preveda una garanzia più lunga o più protettiva della garanzia limitata descritta sopra, quel diritto locale si applica e prevale nella misura in cui ti è più favorevole.",
        ],
      },
      {
        title: "Spedizione in garanzia",
        body: [
          "Per le richieste di garanzia BleeqUp idonee presentate entro il primo anno dalla data di effetto sopra (prova d'acquisto valida richiesta), i costi di spedizione di andata e ritorno per le richieste approvate sono coperti come concordato con il nostro team di assistenza. {name} non è responsabile per articoli persi o danneggiati durante la spedizione in ingresso, salvo che abbiamo fornito l'etichetta del corriere.",
          "Le condizioni di spedizione per le richieste di garanzia MGI e Motocaddy seguono il processo del produttore applicabile; ti informeremo nel coordinare il servizio.",
        ],
      },
      {
        title: "Cosa non copre la garanzia",
        body: [
          "La garanzia non copre danni causati da smontaggio o riparazioni non autorizzati, incidenti, negligenza, usura normale o uso improprio. Le lenti BleeqUp sono escluse dalla copertura in garanzia. I prodotti acquistati da rivenditori o venditori non autorizzati non sono ammessi al servizio di garanzia gratuito tramite {name}.",
        ],
      },
      {
        title: "Resi e rimborsi",
        body: [
          "Per i prodotti acquistati su {host}, puoi richiedere un reso e un rimborso entro trenta (30) giorni di calendario dalla data di acquisto — con prova d'acquisto valida come lo scontrino o la fattura originale — o dalla data di consegna se successiva alla data di acquisto. Il prodotto deve essere inutilizzato, integro nell'aspetto, con imballaggio intatto, e non deve pregiudicare la rivendita.",
          "La spedizione di reso è gestita come segue:",
        ],
        bullets: [
          "Resi non difettosi: il costo di spedizione del reso è a tuo carico.",
          "Prodotti difettosi (difetti di fabbricazione): {name} copre il costo di spedizione del reso.",
        ],
      },
      {
        title: "Condizioni di reso",
        body: [
          "Il prezzo di acquisto originale verrà rimborsato sul tuo account entro trenta (30) giorni di calendario dopo che avremo ricevuto il prodotto reso. In fase di richiesta, restituisci il set completo (imballaggio originale, tutti gli accessori ed eventuali omaggi) con tutte le etichette e le marcature integre, insieme alla prova d'acquisto valida. I resi devono essere inviati all'indirizzo da noi indicato con spedizione prepagata; i resi non autorizzati o in contrassegno saranno rifiutati. Se l'articolo faceva parte di uno sconto in bundle, ci riserviamo il diritto di revocare tale sconto in fase di rimborso.",
          "I resi non sono accettati quando manca o è alterata la prova d'acquisto valida; quando la richiesta è per motivi non di qualità oltre trenta (30) giorni dopo l'acquisto o la consegna; quando prodotto, imballaggio, accessori, omaggi o manuali sono incompleti o non integri; quando i difetti derivano da errore umano, modifica non autorizzata, installazione errata, uso improprio o mancato rispetto delle istruzioni ufficiali; o quando gli articoli resi non vengono spediti entro sette (7) giorni di calendario dalla conferma del reso. Un prodotto usato entro 30 giorni dal ricevimento non è idoneo al reso senza un motivo valido, salvo che sia difettoso.",
        ],
      },
      {
        title: "Sostituzioni",
        body: [
          "Per i prodotti acquistati su {host} con un difetto di fabbricazione, puoi richiedere una sostituzione entro trenta (30) giorni di calendario dalla data di acquisto (o dalla data di consegna se successiva). {name} copre il costo di spedizione della sostituzione. Restituisci il set completo con prova d'acquisto valida; dopo ispezione e conferma, riceverai un prodotto nuovo dello stesso modello e delle stesse specifiche. Le lenti BleeqUp sono escluse dalla copertura di sostituzione.",
        ],
      },
      {
        title: "Costi di riparazione",
        body: [
          "Se il difetto di qualità di un prodotto coperto rientra nell'ambito della garanzia, le tariffe di ispezione, materiale, manodopera e spedizione per le richieste approvate sono coperte come concordato con il produttore o {name}. Per i prodotti danneggiati da fattori umani o comunque fuori garanzia, dovrai pagare la tariffa di riparazione, il costo dei ricambi e la spedizione di sola andata; se annulli tale riparazione, sei responsabile dei costi di spedizione andata e ritorno.",
          "Per le riparazioni o sostituzioni BleeqUp, il periodo di garanzia per i ricambi riparati o sostituiti è di tre (3) mesi dalla data di riparazione o sostituzione, o il periodo di garanzia residuo del prodotto originale, se più lungo (solo ricambi, non l'intero prodotto). Gli altri marchi seguono le condizioni del produttore.",
        ],
      },
      {
        title: "Danni all'arrivo",
        body: [
          "Ispeziona il prodotto al ricevimento. Se l'imballaggio esterno è danneggiato, rifiuta la consegna e fai in modo che il corriere lo restituisca. Se l'imballaggio esterno è integro ma il prodotto interno è danneggiato o anomalo a causa della logistica, contattaci a {supportEmail} entro 24 ore per segnalare il problema; altrimenti non potrà essere gestito.",
        ],
      },
    ],
  },
  "pt-PT": {
    updated: "23 de julho de 2026",
    intro:
      "Apoio para produtos comprados em {name}, incluindo resolução de problemas, cobertura de garantia e opções de devolução para BleeqUp, MGI, Motocaddy e outro equipamento elegível.",
    sections: [
      {
        title: "Como obter ajuda",
        body: [
          "Contacte-nos em {supportEmail} se tiver dificuldades com um produto comprado em {name}, pois muitos problemas resolvem-se rapidamente com a nossa ajuda.",
          "Ao contactar-nos, indique o número da encomenda, o número de modelo (SKU), o número de série, um vídeo (se disponível), a versão da app (se necessária para dispositivos inteligentes) e uma breve descrição do problema para o podermos ajudar com mais eficiência.",
        ],
      },
      {
        title: "Cobertura da garantia",
        body: [
          "{name} é um revendedor autorizado da BleeqUp, MGI e Motocaddy. As garantias do fabricante aplicam-se aos produtos elegíveis comprados junto de nós.",
          "Os produtos BleeqUp têm uma garantia limitada de 1 ano do fabricante que cobre as Ranger AI Sports Camera Glasses, Power Plus e Bluetooth Controller. Todas as lentes estão excluídas desta garantia. A garantia aplica-se apenas a produtos comprados em {name} ou noutros revendedores BleeqUp autorizados.",
          "Os trolleys elétricos MGI e Motocaddy e os acessórios elegíveis estão cobertos pelas respetivas garantias do fabricante. Contacte-nos com o comprovativo de compra e ajudaremos a coordenar o serviço de garantia com a marca quando necessário.",
          "Se um produto BleeqUp coberto for considerado defeituoso e ainda estiver em garantia, será reparado ou substituído sem custo para o cliente (lentes excluídas).",
        ],
      },
      {
        title: "Período de garantia",
        body: [
          "A garantia produz efeitos a partir da data de compra indicada no comprovativo de compra válido, ou da data de entrega se esta for posterior à data de compra. É necessário um comprovativo de compra válido para qualquer pedido de garantia.",
          "O período de garantia está sujeito às leis locais aplicáveis. Os clientes na União Europeia e no EEE podem ter direito a uma garantia legal mínima de conformidade de 2 anos a contar da data de entrega para bens comprados para uso pessoal. Quando a lei local prever uma garantia mais longa ou mais protetora do que a garantia limitada descrita acima, esse direito local aplica-se e prevalece na medida em que lhe for mais favorável.",
        ],
      },
      {
        title: "Envio em garantia",
        body: [
          "Para pedidos de garantia BleeqUp elegíveis feitos no primeiro ano a contar da data de efeito acima (comprovativo de compra válido necessário), os custos de envio de ida e volta dos pedidos aprovados são cobertos conforme combinado com a nossa equipa de apoio. {name} não é responsável por artigos perdidos ou danificados durante o envio de entrada, salvo se tivermos tratado da etiqueta da transportadora.",
          "Os termos de envio dos pedidos de garantia MGI e Motocaddy seguem o processo do fabricante aplicável; informá-lo-emos ao coordenar o serviço.",
        ],
      },
      {
        title: "O que a garantia não cobre",
        body: [
          "A garantia não cobre danos causados por desmontagem ou reparações não autorizadas, acidentes, negligência, desgaste normal ou utilização indevida. As lentes BleeqUp estão excluídas da cobertura de garantia. Os produtos comprados a revendedores ou vendedores não autorizados não são elegíveis para o serviço de garantia gratuito através de {name}.",
        ],
      },
      {
        title: "Devoluções e reembolsos",
        body: [
          "Para produtos comprados em {host}, pode pedir uma devolução e reembolso no prazo de trinta (30) dias de calendário a contar da data de compra — com comprovativo de compra válido, como o recibo ou fatura original — ou da data de entrega se for posterior à data de compra. O produto deve estar por usar, sem danos de aspeto, com embalagem intacta, e não deve afetar a revenda.",
          "O envio de devolução é tratado da seguinte forma:",
        ],
        bullets: [
          "Devoluções sem defeito: o custo de envio da devolução é suportado por si.",
          "Produtos defeituosos (defeitos de fabrico): {name} cobre o custo de envio da devolução.",
        ],
      },
      {
        title: "Condições de devolução",
        body: [
          "O preço de compra original será reembolsado na sua conta no prazo de trinta (30) dias de calendário após recebermos o produto devolvido. Ao pedir, devolva o conjunto completo (embalagem original, todos os acessórios e quaisquer ofertas) com todos os rótulos e marcações intactos, juntamente com comprovativo de compra válido. As devoluções devem ser enviadas para o endereço por nós indicado com portes pagos; devoluções não autorizadas ou à cobrança serão recusadas. Se o artigo fez parte de um desconto em conjunto, reservamo-nos o direito de revogar esse desconto no reembolso.",
          "As devoluções não são aceites quando o comprovativo de compra válido está em falta ou alterado; quando o pedido é por motivos que não de qualidade mais de trinta (30) dias após a compra ou entrega; quando o produto, embalagem, acessórios, ofertas ou manuais estão incompletos ou não intactos; quando os defeitos resultam de erro humano, alteração não autorizada, instalação incorreta, utilização indevida ou incumprimento das instruções oficiais; ou quando os artigos devolvidos não são enviados no prazo de sete (7) dias de calendário após a confirmação da devolução. Um produto usado nos 30 dias após a receção não é elegível para devolução sem um motivo válido, salvo se for defeituoso.",
        ],
      },
      {
        title: "Trocas",
        body: [
          "Para produtos comprados em {host} com um defeito de fabrico, pode pedir uma substituição no prazo de trinta (30) dias de calendário a contar da data de compra (ou da data de entrega se for posterior). {name} cobre o custo de envio da substituição. Devolva o conjunto completo com comprovativo de compra válido; após inspeção e confirmação, receberá um produto novo do mesmo modelo e especificações. As lentes BleeqUp estão excluídas da cobertura de troca.",
        ],
      },
      {
        title: "Custos de reparação",
        body: [
          "Se o defeito de qualidade de um produto coberto estiver no âmbito da garantia, as taxas de inspeção, material, mão de obra e envio dos pedidos aprovados são cobertas conforme combinado com o fabricante ou {name}. Para produtos danificados por fatores humanos ou de outro modo fora da garantia, terá de pagar a taxa de reparação, o custo das peças e o envio só de ida; se cancelar essa reparação, é responsável pelos custos de envio de ida e volta.",
          "Para reparações ou substituições BleeqUp, o período de garantia das peças reparadas ou substituídas é de três (3) meses a contar da data da reparação ou substituição, ou o período de garantia restante do produto original, o que for mais longo (apenas peças, não o produto inteiro). As outras marcas seguem as condições do respetivo fabricante.",
        ],
      },
      {
        title: "Danos à chegada",
        body: [
          "Inspecione o produto à receção. Se a embalagem exterior estiver danificada, recuse a entrega e peça ao estafeta que a devolva. Se a embalagem exterior estiver intacta mas o produto no interior estiver danificado ou anormal devido à logística, contacte-nos em {supportEmail} no prazo de 24 horas para reportar o problema; caso contrário, não poderá ser tratado.",
        ],
      },
    ],
  },
  ja: {
    updated: "2026年7月23日",
    intro:
      "{name}でご購入いただいた製品のサポート（BleeqUp、MGI、Motocaddy、その他対象機器のトラブルシューティング、保証範囲、返品オプションを含みます）。",
    sections: [
      {
        title: "サポートのご案内",
        body: [
          "{name}で購入した製品で不具合がある場合は {supportEmail} までご連絡ください。多くの問題は、当社のサポートで迅速に解決できます。",
          "ご連絡の際は、注文番号、型番（SKU）、シリアル番号、動画（あれば）、アプリのバージョン（スマートデバイスで必要な場合）、問題の簡単な説明をお知らせください。より迅速に対応できます。",
        ],
      },
      {
        title: "保証範囲",
        body: [
          "{name} は BleeqUp、MGI、Motocaddy の正規販売店です。当社で購入した対象製品にはメーカー保証が適用されます。",
          "BleeqUp製品には、Ranger AI Sports Camera Glasses、Power Plus、Bluetooth Controller を対象とする1年間の限定メーカー保証が付きます。すべてのレンズはこの保証の対象外です。保証は {name} またはその他の正規 BleeqUp 販売店で購入した製品にのみ適用されます。",
          "MGIおよびMotocaddyの電動トロリーと対象アクセサリーは、各メーカー保証の対象です。購入証明を添えてご連絡ください。必要な場合、ブランドとの保証サービス調整をお手伝いします。",
          "対象の BleeqUp 製品に欠陥があり、まだ保証期間内である場合、お客様負担なく修理または交換します（レンズは対象外）。",
        ],
      },
      {
        title: "保証期間",
        body: [
          "保証は、有効な購入証明に記載の購入日、または配送日が購入日より後の場合はその配送日から効力を生じます。保証請求には有効な購入証明が必要です。",
          "保証期間は適用される現地法に従います。欧州連合およびEEAのお客様は、個人使用で購入した商品について、配送日から法定最低2年の適合保証を受けられる場合があります。現地法が上記の限定保証より長い、またはより保護的な保証を定める場合、お客様により有利な範囲でその現地法上の権利が適用され優先します。",
        ],
      },
      {
        title: "保証送料",
        body: [
          "上記の効力発生日から1年以内に行われた対象の BleeqUp 保証請求（有効な購入証明が必要）については、承認された請求の往復送料をサポートチームとの取り決めに従って負担します。{name} は、当社が配送ラベルを手配した場合を除き、返送中に紛失または損傷した品目について責任を負いません。",
          "MGIおよびMotocaddyの保証請求の送料条件は、該当するメーカー手続きに従います。サービス調整の際にご案内します。",
        ],
      },
      {
        title: "保証の対象外",
        body: [
          "保証は、無断分解または修理、事故、過失、通常の摩耗、不適切な使用による損傷を対象としません。BleeqUp のレンズは保証対象外です。正規販売店以外の販売者から購入した製品は、{name} を通じた無料の保証サービス対象外です。",
        ],
      },
      {
        title: "返品と返金",
        body: [
          "{host} で購入した製品は、購入日（または配送日が購入日より後の場合はその配送日）から三十（30）暦日以内に、原本の領収書や請求書などの有効な購入証明とともに返品・返金を請求できます。製品は未使用で、外観に損傷がなく、梱包が無傷で、再販に影響しない状態である必要があります。",
          "返送は次のとおり扱います。",
        ],
        bullets: [
          "欠陥のない返品：返送料はお客様負担です。",
          "欠陥製品（製造上の欠陥）：{name} が返送料を負担します。",
        ],
      },
      {
        title: "返品条件",
        body: [
          "返金は、返送品を受領してから三十（30）暦日以内に、元の購入価格をご指定の口座へ返金します。申請時は、すべてのラベルと表記が無傷の完全セット（元箱、すべての付属品、贈呈品）と有効な購入証明を返送してください。返送は当社指定の住所へ送料前払いで送付してください。無断返送または代金引換の返送は拒否します。バンドル割引の一部だった場合、返金時にその割引を取り消す権利を留保します。",
          "有効な購入証明がない、または改変されている場合。品質以外の理由で購入または配送から三十（30）日を超えて請求した場合。製品、梱包、付属品、贈呈品、説明書が不完全または無傷でない場合。欠陥が人為ミス、無断改造、誤った取り付け、不適切な使用、公式手順の不遵守による場合。返品確認から七（7）暦日以内に発送されない場合。返品は受け付けません。受領後30日以内に使用した製品は、欠陥がない限り、正当な理由なしに返品できません。",
        ],
      },
      {
        title: "交換",
        body: [
          "{host} で購入し製造上の欠陥がある製品は、購入日（またはそれより後の配送日）から三十（30）暦日以内に交換を請求できます。交換の送料は {name} が負担します。有効な購入証明とともに完全セットを返送してください。検査・確認後、同じモデル・仕様の新品をお届けします。BleeqUp のレンズは交換対象外です。",
        ],
      },
      {
        title: "修理費用",
        body: [
          "対象製品の品質上の欠陥が保証範囲内である場合、承認された請求の検査料、材料費、工賃、送料はメーカーまたは {name} との取り決めに従って負担します。人為的要因による損傷や保証対象外の製品については、修理費、部品代、片道送料をお支払いいただきます。そのような修理をキャンセルした場合、往復送料はお客様負担です。",
          "BleeqUp の修理または交換について、修理または交換した部品の保証期間は、修理または交換日から三（3）か月、または元の製品の残存保証期間のうち長い方です（部品のみ。製品全体ではありません）。他ブランドは各メーカー条件に従います。",
        ],
      },
      {
        title: "到着時の損傷",
        body: [
          "受領時に製品を点検してください。外装が損傷している場合は配送を拒否し、宅配便に返送させてください。外装は無傷でも、物流により内部の製品が損傷または異常な場合は、24時間以内に {supportEmail} までご連絡ください。それ以降は対応できません。",
        ],
      },
    ],
  },
  "zh-CN": {
    updated: "2026年7月23日",
    intro:
      "针对从 {name} 购买的产品的支持，包括 BleeqUp、MGI、Motocaddy 及其他符合条件装备的故障排除、保修范围和退货选项。",
    sections: [
      {
        title: "获取帮助",
        body: [
          "如果您从 {name} 购买的产品出现任何问题，请通过 {supportEmail} 联系我们，许多问题可在我们的协助下迅速解决。",
          "联系时请提供订单号、型号（SKU）、序列号、视频（如有）、应用版本（智能设备如需要）以及问题的简要说明，以便我们更高效地协助您。",
        ],
      },
      {
        title: "保修范围",
        body: [
          "{name} 是 BleeqUp、MGI 和 Motocaddy 的授权零售商。从我们处购买的符合条件的产品适用制造商保修。",
          "BleeqUp 产品享有 1 年有限制造商保修，涵盖 Ranger AI Sports Camera Glasses、Power Plus 和 Bluetooth Controller。所有镜片不在本保修范围内。保修仅适用于从 {name} 或其他授权 BleeqUp 经销商处购买的产品。",
          "MGI 和 Motocaddy 电动球车及符合条件的配件由其各自的制造商保修覆盖。请携带购买凭证联系我们，我们会在需要时协助与品牌协调保修服务。",
          "如果所涵盖的 BleeqUp 产品被认定为有缺陷且仍在保修期内，将为客户免费维修或更换（镜片除外）。",
        ],
      },
      {
        title: "保修期限",
        body: [
          "保修自有效购买凭证上所示的购买日期起生效，若交付日期晚于购买日期，则以交付日期为准。任何保修申请均需提供有效购买凭证。",
          "保修期限受适用当地法律约束。欧盟和欧洲经济区的客户，对于为个人使用而购买的商品，可能有权自交付之日起享有法定最低 2 年的符合性法律保证。若当地法律提供比上述有限保修更长或更具保护性的保修，则在对您更有利的范围内适用并优先于该当地法律权利。",
        ],
      },
      {
        title: "保修运费",
        body: [
          "自上述生效日期起一年内提出的符合条件的 BleeqUp 保修申请（需有效购买凭证），获批申请的往返运费按与我们支持团队的安排承担。除非由我们安排承运商标签，{name} 对寄回途中丢失或损坏的物品不承担责任。",
          "MGI 和 Motocaddy 保修申请的运输条款遵循适用的制造商流程；我们在协调服务时会告知您。",
        ],
      },
      {
        title: "保修不包括的内容",
        body: [
          "保修不涵盖因未经授权拆卸或维修、事故、疏忽、正常磨损或不当使用造成的损坏。BleeqUp 镜片排除在保修范围之外。从未授权经销商或卖家处购买的产品不符合通过 {name} 获得免费保修服务的资格。",
        ],
      },
      {
        title: "退货与退款",
        body: [
          "在 {host} 购买的产品，可自购买日期起三十（30）个日历日内（需提供原始收据或发票等有效购买凭证）申请退货退款；若交付日期晚于购买日期，则自交付日期起算。产品必须未使用、外观无损、包装完好，且不得影响再销售。",
          "退货运费按如下方式处理：",
        ],
        bullets: [
          "非缺陷退货：退货运费由您承担。",
          "缺陷产品（制造缺陷）：{name} 承担退货运费。",
        ],
      },
      {
        title: "退货条件",
        body: [
          "我们将在收到退回产品后三十（30）个日历日内，将原始购买价格退回您的账户。申请时请退回完整套装（原包装、全部配件及任何赠品），所有标签和标记完好，并附有效购买凭证。退货须预付运费寄至我们指定的地址；未经授权或货到付款的退货将被拒收。若该商品属于捆绑折扣的一部分，我们保留在退款时撤销该折扣的权利。",
          "在以下情况下不接受退货：有效购买凭证缺失或被改动；非质量原因且在购买或交付超过三十（30）天后提出；产品、包装、配件、赠品或说明书不完整或不完好；缺陷由人为失误、未经授权改装、错误安装、不当使用或未遵循官方说明导致；或退回物品未在退货确认后七（7）个日历日内寄出。收货后 30 天内已使用的产品，除非存在缺陷，否则无正当理由不得退货。",
        ],
      },
      {
        title: "换货",
        body: [
          "在 {host} 购买且存在制造缺陷的产品，可自购买日期（或较晚的交付日期）起三十（30）个日历日内申请更换。{name} 承担更换件的运费。请连同有效购买凭证退回完整套装；经检查确认后，您将收到同型号、同规格的新产品。BleeqUp 镜片排除在换货范围之外。",
        ],
      },
      {
        title: "维修费用",
        body: [
          "若所涵盖产品的质量缺陷属于保修范围，获批申请的检查、材料、人工和运费按与制造商或 {name} 的安排承担。因人为因素损坏或超出保修范围的产品，您需支付维修费、零件费和单程运费；若取消此类维修，往返运费由您承担。",
          "对于 BleeqUp 的维修或更换，已维修或更换零件的保修期为自维修或更换之日起三（3）个月，或原产品剩余保修期，以较长者为准（仅限零件，不含整机）。其他品牌遵循其制造商条款。",
        ],
      },
      {
        title: "收货损坏",
        body: [
          "请在收货时检查产品。若外包装损坏，请拒收并让快递员退回。若外包装完好但内部产品因物流损坏或异常，请在 24 小时内通过 {supportEmail} 联系我们报告问题；否则将无法处理。",
        ],
      },
    ],
  },
};

const VOLT: PolicyTemplate = {
  updated: "September 27, 2026",
  intro:
    "Support for your Volt Caddy product purchased from {name}, including troubleshooting, warranty coverage, and return options.",
  sections: [
    {
      title: "Getting help",
      body: [
        "Contact {supportEmail} with your order number, model, and a short description of the issue. Technical support is also available at info@voltcaddy.com.",
      ],
    },
    {
      title: "Warranty",
      body: [
        "Volt Caddy electric push carts and eligible accessories are covered by the manufacturer warranty. Contact us with your proof of purchase and we will help coordinate service.",
      ],
    },
    {
      title: "Returns",
      body: [
        "Unused items in original packaging may be returned within 30 days of delivery for a refund to the original payment method. Return shipping fees may apply.",
      ],
    },
  ],
};

export function getWarrantyPolicyForLocale(site: SiteConfig, locale: Locale): WarrantyPolicy {
  const host = site.hosts[0] ?? "verveacesports.com";
  const vars = {
    name: site.name,
    shortName: site.shortName,
    host,
    supportEmail: site.supportEmail,
  };

  const id: SiteId = site.id;
  switch (id) {
    case "bleeq-ca":
      return applyVars(BLEEQ[locale] ?? BLEEQ[DEFAULT_LOCALE], vars);
    case "volt-ca":
      return applyVars(VOLT, vars);
    case "verveace":
      return applyVars(VERVEACE[locale] ?? VERVEACE[DEFAULT_LOCALE], vars);
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}
