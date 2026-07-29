import type { Dictionary } from "./types";

export const it: Dictionary = {
  nav: {
    openMenu: "Apri menu",
    menu: "Menu",
    language: "Lingua",
    allProducts: "Tutti i prodotti",
    cart: "Carrello",
    account: "Account",
    orders: "Ordini",
    faq: "FAQ",
    searchPlaceholder: "Cerca attrezzatura...",
    signIn: "Accedi",
    signOut: "Esci",
    profile: "Profilo",
    loyaltyPoints: "Punti fedeltà",
    referrals: "Referral",
    admin: "Admin",
    pts: "{n} pt",
    accountMenu: "Menu account",
    openCart: "Apri carrello",
  },

  footer: {
    tagline:
      "Rivenditore autorizzato degli occhiali-fotocamera con IA BleeqUp e dei trolley da golf elettrici MGI & Motocaddy.",
    shop: "Shop",
    account: "Account",
    help: "Aiuto",
    profile: "Profilo",
    orders: "Ordini",
    loyaltyPoints: "Punti fedeltà",
    referFriend: "Invita un amico",
    freeShippingOver: "Spedizione gratuita da {amount} $",
    freeReturns30: "Resi gratuiti entro 30 giorni",
    earn1Point: "Guadagna 1 punto per dollaro",
    privacyPolicy: "Informativa sulla privacy",
    termsOfService: "Termini di servizio",
    warranty: "Garanzia",
    privacy: "Privacy",
    terms: "Termini",
    themePlayground: "Area temi",
    faq: "FAQ",
    copyright: "© {year} VerveaceSports. Tutti i diritti riservati.",
  },

  home: {
    shopByCategory: "Acquista per categoria",
    viewAll: "Vedi tutto",
    featured: "In evidenza",
    seeAll: "Vedi tutto",
    badge: "BleeqUp, MGI & Motocaddy  spedizione USA e Canada",
    headlineGlasses: "Cattura ogni momento",
    headlineCart: "Potenza a ogni giro",
    ctaGlasses: "Acquista occhiali IA",
    ctaCarts: "Acquista carrelli da golf",
    ctaAll: "Vedi tutti i prodotti",
    altGlasses: "Occhiali-fotocamera sportivi con IA BleeqUp Ranger",
    altCart: "Trolley da golf elettrico MGI Zip X5",
    subcopy:
      "Acquista gli occhiali-fotocamera sportivi con IA BleeqUp Ranger e i trolley da golf elettrici premium di MGI e Motocaddy. Spedizione gratuita in Canada per ordini superiori a {amount} $.",
    trustShipping: "Spedizione gratuita da {amount} $",
    trustReturns: "Resi entro 30 giorni",
    trustLoyalty: "Premi fedeltà",
  },

  categories: {
    "ai-glasses": "Occhiali IA",
    wearables: "Indossabili",
    "electric-carts": "Trolley elettrici",
    "golf-gear": "Attrezzatura da golf",
  },

  products: {
    allProducts: "Tutti i prodotti",
    shopAllTitle: "Vedi tutti i prodotti",
    count: "{n} prodotti",
    countForQuery: '{n} prodotti per «{query}»',
    empty: "Nessun prodotto trovato.",
    youMightAlsoLike: "Potrebbe piacerti anche",
    sortNewest: "Più recenti",
    sortPriceAsc: "Prezzo: crescente",
    sortPriceDesc: "Prezzo: decrescente",
    sortNameAsc: "Nome AZ",
    searching: "Ricerca:",
    clearSearch: "Cancella ricerca",
    all: "Tutti",
    shopRanger: "Acquista Ranger",
    rangerMeta:
      "{n} modelli disponibili · Resi gratuiti entro 30 giorni · Guadagna 1 punto fedeltà per dollaro",
  },

  product: {
    addToCart: "Aggiungi al carrello",
    outOfStock: "Non disponibile",
    soldOut: "Esaurito",
    onlyNLeft: "Solo {n} rimasti",
    inStock: "Disponibile",
    freeShippingOver: "Spedizione gratuita per ordini superiori a {amount} $",
    freeShippingCanada: "Spedizione gratuita per ordini superiori a {amount} $ (Canada)",
    freeShippingUsaCa: "Spedizione gratuita per ordini superiori a {amount} $ (USA e CA)",
    returns30: "Resi senza pensieri entro 30 giorni",
    earnPoints: "Guadagna {n} punti con questo ordine",
    addedToast: "{name} aggiunto al carrello",
    viewCart: "Vedi carrello",
    reviews: {
      heading: "Recensioni dei clienti",
      writeReview: "Scrivi una recensione",
      cancel: "Annulla",
      rating: "Valutazione",
      reviewTitle: "Titolo",
      titleOptional: "Titolo (facoltativo)",
      titlePlaceholder: "Riassumilo",
      reviewBody: "Recensione",
      bodyPlaceholder: "Cosa ti è piaciuto? Come si comporta nel tempo?",
      submitReview: "Invia recensione",
      submitting: "Invio",
      noReviews: "Ancora nessuna recensione.",
      signInToReview: "Accedi",
      signIn: "Accedi",
      afterPurchase: "dopo l'acquisto per lasciare una recensione verificata.",
      alreadyReviewed: "Hai già recensito questo prodotto.",
      verifiedOnly: "Le recensioni sono riservate agli acquirenti verificati di questo prodotto.",
      verifiedBuyer: "Acquirente verificato",
      thanksReview: "Grazie  la tua recensione è online",
      reviewSingular: "recensione",
      reviewPlural: "recensioni",
    },
  },

  cart: {
    title: "Il tuo carrello",
    empty: "Il tuo carrello è vuoto",
    emptyHint: "Scopri attrezzatura che spinge le tue prestazioni.",
    browseProducts: "Sfoglia i prodotti",
    remove: "Rimuovi",
    removeItem: "Rimuovi articolo",
    subtotal: "Subtotale",
    discount: "Sconto",
    estimatedTotal: "Totale stimato",
    shipping: "Spedizione",
    shippingCalc: "Calcolata al checkout",
    orderSummary: "Riepilogo ordine",
    proceedCheckout: "Procedi al checkout",
    checkout: "Checkout",
    shippingTaxesNote: "Spedizione e imposte calcolate al checkout.",
    emptyDiscover: "Scopri attrezzatura che spinge le tue prestazioni.",
  },

  checkout: {
    title: "Checkout",
    empty: "Il tuo carrello è vuoto",
    browseProducts: "Sfoglia i prodotti",
    shippingAddress: "Indirizzo di spedizione",
    firstName: "Nome",
    lastName: "Cognome",
    address: "Indirizzo",
    aptOptional: "Interno / scala (facoltativo)",
    city: "Città",
    stateProvince: "Stato / provincia",
    postalCode: "CAP",
    country: "Paese",
    unitedStates: "Stati Uniti",
    canada: "Canada",
    promo: "Codice promozionale",
    noPromo: "Nessun codice promozionale applicato.",
    addPromoOnCart: "Aggiungine uno nel tuo carrello",
    youSave: "Risparmi {amount}",
    freeShippingIncluded: "Spedizione gratuita inclusa",
    remove: "Rimuovi",
    redeemPoints: "Usa i punti fedeltà",
    pointsAvailable: "Hai {n} pt. 100 pt = 1 $ di sconto.",
    redeemN: "Usa {n} pt",
    payment: "Pagamento",
    payForOrder: "Paga l'ordine",
    cadNotConfigured:
      "I pagamenti canadesi non sono ancora configurati. Aggiorna tra un minuto  se il problema persiste, contatta il supporto.",
    currencyNotConfigured:
      "I pagamenti non sono ancora configurati per questa valuta. Contatta il supporto.",
    calculating: "Calcolo del totale",
    belowMinimum: "Il totale dell'ordine è inferiore all'importo minimo.",
    orderSummary: "Riepilogo ordine",
    subtotal: "Subtotale",
    discount: "Sconto",
    discountWithCode: "Sconto ({code})",
    shipping: "Spedizione",
    shippingPromo: "Spedizione (promo)",
    tax: "Imposta",
    taxWithRate: "Imposta ({rate}%)",
    points: "Punti ({n})",
    total: "Totale",
    free: "GRATIS",
    enterRegionForTax: "Inserisci stato/provincia per la stima dell'imposta.",
    earnPointsNote: "Guadagnerai ~{n} pt con questo ordine.",
    completeShipping: "Completa il modulo di spedizione.",
    couldNotUpdate: "Impossibile aggiornare i totali",
    promoRemoved: "Codice promozionale rimosso",
    successConfirmed: "Ordine confermato",
    thankYou: "Grazie per il tuo ordine!",
    viewOrder: "Vedi ordine",
    keepShopping: "Continua lo shopping",
    paymentReceived:
      "Pagamento ricevuto. I punti fedeltà di questo ordine compariranno a breve nel tuo account.",
    confirmingPayment:
      "Stiamo confermando il pagamento con Stripe  di solito richiede solo pochi secondi.",
    totalPaid: "Totale pagato",
    pointsRedeemed: "Punti riscattati",
  },

  account: {
    title: "Account",
    profile: "Profilo",
    orders: "Ordini",
    loyalty: "Fedeltà",
    referrals: "Referral",
    admin: "Admin",
    signOut: "Esci",
    loyaltyPoints: "Punti fedeltà",
    worthAtCheckout: "Valgono {amount} $ al checkout",
    memberSince: "Membro dal",
    profileTitle: "Profilo",
    profileDesc: "Tieni aggiornati i tuoi dati.",
    email: "E-mail",
    yourReferralCode: "Il tuo codice referral",
    firstName: "Nome",
    lastName: "Cognome",
    country: "Paese",
    saveChanges: "Salva modifiche",
    profileUpdated: "Profilo aggiornato",
    ordersTitle: "I miei ordini",
    noOrders: "Ancora nessun ordine",
    startShopping: "Inizia lo shopping",
    order: "Ordine",
    date: "Data",
    status: "Stato",
    total: "Totale",
    view: "Vedi",
    loyaltyTitle: "Punti fedeltà",
    loyaltyDesc: "Guadagna 1 punto per dollaro. Usa 100 punti per 1 $ di sconto al checkout.",
    referralsTitle: "Invita un amico",
    referralsDesc:
      "Condividi il tuo link. Quando un amico completa un acquisto idoneo, entrambi guadagnate punti bonus.",
    copyLink: "Copia link",
    linkCopied: "Link copiato",
    status_pending: "in attesa",
    status_paid: "pagato",
    status_shipped: "spedito",
    status_delivered: "consegnato",
    status_cancelled: "annullato",
  },

  auth: {
    welcomeBack: "Bentornato",
    signInDesc: "Accedi al tuo account VerveaceSports.",
    continueGoogle: "Continua con Google",
    or: "OPPURE",
    password: "Password",
    email: "E-mail",
    signIn: "Accedi",
    noAccount: "Non hai un account?",
    signUp: "Registrati",
    createAccount: "Crea account",
    createTitle: "Crea il tuo account",
    createDesc: "Guadagna 1 punto per dollaro dal tuo primo ordine.",
    alreadyHave: "Hai già un account?",
    min8: "Minimo 8 caratteri.",
    firstName: "Nome",
    lastName: "Cognome",
    referredBy: "Invitato da {code}",
    referralBonus: "Entrambi guadagnate 100 punti bonus dopo il tuo primo ordine pagato.",
    agreeTerms: "Creando un account accetti i nostri",
    terms: "Termini",
    and: "e l'",
    privacyPolicy: "Informativa sulla privacy",
    signedIn: "Accesso effettuato",
    checkEmailConfirm: "Controlla la tua e-mail per confermare l'account.",
  },

  faq: {
    title: "Domande frequenti",
    home: "Home",
    introVerveace:
      "Risposte rapide su spedizioni, resi, prodotti BleeqUp, MGI & Motocaddy, punti fedeltà e checkout. Non trovi quello che cerchi? Scrivi a {email}.",
    introBleeq:
      "Risposte rapide su spedizioni in Canada, prezzi in CAD, resi, occhiali BleeqUp Ranger, fedeltà e checkout. Non trovi quello che cerchi? Scrivi a {email}.",
    emailSupport: "Scrivi a {email} per ulteriore assistenza.",
    sections: {
      ordersShipping: {
        title: "Ordini e spedizioni",
        items: [
          {
            q: "Dove spedite?",
            a: "Spediamo a indirizzi negli Stati Uniti e in Canada. Le tariffe di spedizione e i tempi di consegna stimati vengono calcolati al checkout in base alla tua posizione e al totale dell'ordine.",
          },
          {
            q: "La spedizione è gratuita?",
            a: "Gli ordini di {freeShippingOver} $ USD o più (o {freeShippingOver} $ CAD al checkout canadese) hanno diritto alla spedizione standard gratuita in USA e Canada. Gli ordini più piccoli mostrano la tariffa di spedizione prima del pagamento.",
          },
          {
            q: "Quando arriverà il mio ordine?",
            a: "La maggior parte degli ordini disponibili viene spedita entro 1-3 giorni lavorativi. I tempi di consegna dipendono dal corriere e dalla destinazione  riceverai le informazioni di tracciamento via e-mail una volta spedito l'ordine.",
          },
          {
            q: "Posso modificare o annullare il mio ordine?",
            a: "Contattaci a {supportEmail} il prima possibile se devi cambiare l'indirizzo di spedizione o annullare. Di solito possiamo aiutarti prima della spedizione; una volta che l'ordine lascia il nostro magazzino, le modifiche potrebbero non essere possibili.",
          },
        ],
      },
      returnsWarranty: {
        title: "Resi e garanzia",
        items: [
          {
            q: "Qual è la vostra politica di reso?",
            a: "Gli articoli non utilizzati nella confezione originale possono essere restituiti entro 30 giorni dalla consegna per un rimborso sul metodo di pagamento originale. L'attrezzatura aperta o usata può avere diritto a un credito in negozio  scrivi a {supportEmail} con il numero d'ordine per avviare un reso.",
          },
          {
            q: "Come avvio un reso?",
            a: "Scrivi a {supportEmail} con il tuo numero d'ordine e gli articoli che desideri restituire. Ti invieremo le istruzioni per il reso e un'etichetta di spedizione quando applicabile.",
          },
          {
            q: "I prodotti BleeqUp, MGI e Motocaddy sono coperti da garanzia?",
            a: "Le garanzie del produttore si applicano ai prodotti idonei. Siamo rivenditore autorizzato di BleeqUp, MGI e Motocaddy  contattaci con la prova d'acquisto e ti aiuteremo a coordinare il servizio di garanzia con il marchio quando necessario.",
          },
        ],
      },
      productsPricing: {
        title: "Prodotti e prezzi",
        items: [
          {
            q: "Siete un rivenditore autorizzato?",
            a: "Sì. VerveaceSports è rivenditore autorizzato degli occhiali-fotocamera con IA BleeqUp e dei trolley da golf elettrici, caddie e accessori MGI & Motocaddy.",
          },
          {
            q: "Perché i prezzi sono in USD o CAD?",
            a: "I prezzi sono mostrati in USD per gli acquirenti degli Stati Uniti e in CAD per gli acquirenti canadesi in base al mercato selezionato. La valuta mostrata su ogni pagina prodotto e al checkout è l'importo che ti verrà addebitato.",
          },
          {
            q: "Cosa succede se un articolo è esaurito?",
            a: "Le varianti esaurite sono indicate sulla pagina del prodotto. Puoi accedere e tornare più tardi, oppure contattarci se desideri aiuto per trovare un'alternativa o stimare i tempi di riassortimento.",
          },
        ],
      },
      accountLoyalty: {
        title: "Account, fedeltà e referral",
        items: [
          {
            q: "Serve un account per ordinare?",
            a: "Serve un account gratuito per completare il checkout. Registrati con e-mail o Google  la cronologia ordini, il saldo fedeltà e i dati del profilo salvati si trovano in Account.",
          },
          {
            q: "Come funzionano i punti fedeltà?",
            a: "Guadagna 1 punto per ogni 1 $ speso su acquisti idonei. Usa 100 punti per 1 $ di sconto al checkout. Consulta saldo e cronologia in Account ? Fedeltà.",
          },
          {
            q: "Come funzionano i premi referral?",
            a: "Condividi il tuo link referral personale da Account ? Referral. Quando un amico crea un account e completa un acquisto idoneo, entrambi guadagnate punti fedeltà bonus.",
          },
        ],
      },
      paymentSupport: {
        title: "Pagamento e supporto",
        items: [
          {
            q: "Quali metodi di pagamento accettate?",
            a: "Accettiamo le principali carte di credito e debito tramite Stripe. Il numero completo della tua carta non viene mai memorizzato sui nostri server.",
          },
          {
            q: "Posso usare un codice promozionale?",
            a: "Sì  inserisci il codice nella pagina Il tuo carrello prima del checkout. Si applica un solo codice promozionale per ordine. I codici devono essere attivi e soddisfare eventuali requisiti di ordine minimo indicati nella promozione.",
          },
          {
            q: "Come contatto il supporto?",
            a: "Scrivi a {supportEmail} con il tuo numero d'ordine e la tua domanda. Di solito rispondiamo entro un giorno lavorativo.",
          },
        ],
      },
    },
    bleeqSections: {
      ordersShipping: {
        title: "Ordini e spedizioni",
        items: [
          {
            q: "Dove spedite?",
            a: "Spediamo solo a indirizzi in Canada. Le tariffe di spedizione e i tempi di consegna stimati vengono calcolati al checkout in base alla tua provincia e al totale dell'ordine. Tutti i prezzi sono in dollari canadesi (CAD).",
          },
          {
            q: "La spedizione è gratuita?",
            a: "Gli ordini di {freeShippingOver} $ CAD o più hanno diritto alla spedizione standard gratuita in Canada. Gli ordini più piccoli mostrano la tariffa di spedizione prima del pagamento.",
          },
          {
            q: "Quando arriverà il mio ordine?",
            a: "La maggior parte degli ordini disponibili viene spedita entro 1-3 giorni lavorativi. La consegna in Canada richiede in genere alcuni giorni lavorativi in più a seconda della provincia e del corriere. Riceverai il tracciamento via e-mail una volta spedito l'ordine.",
          },
          {
            q: "Spedite negli Stati Uniti?",
            a: "Questo negozio spedisce solo in Canada. Per spedizioni negli USA (e golf / altri marchi), acquista su VerveaceSports.com.",
          },
          {
            q: "Posso modificare o annullare il mio ordine?",
            a: "Scrivi il prima possibile a {supportEmail} con il tuo numero d'ordine se devi cambiare l'indirizzo di spedizione o annullare. Di solito possiamo aiutarti prima della spedizione; una volta che l'ordine lascia il nostro magazzino, le modifiche potrebbero non essere possibili.",
          },
          {
            q: "Devo pagare dazi o spese di importazione?",
            a: "Gli ordini gestiti per la consegna in Canada sono trattati come spedizioni nazionali canadesi. Il totale che vedi al checkout in CAD è quello che ti viene addebitato  nessun dazio d'importazione statunitense a sorpresa su questi ordini.",
          },
        ],
      },
      returnsWarranty: {
        title: "Resi e garanzia",
        items: [
          {
            q: "Qual è la vostra politica di reso?",
            a: "Gli articoli non utilizzati nella confezione originale possono essere restituiti entro 30 giorni dalla consegna per un rimborso sul metodo di pagamento originale. Gli articoli aperti o usati possono avere diritto a un credito in negozio  scrivi a {supportEmail} con il numero d'ordine per avviare un reso.",
          },
          {
            q: "Come avvio un reso?",
            a: "Scrivi a {supportEmail} con il tuo numero d'ordine canadese e gli articoli che desideri restituire. Ti invieremo le istruzioni per il reso e un'etichetta di spedizione quando applicabile.",
          },
          {
            q: "I prodotti BleeqUp sono coperti da garanzia?",
            a: "Sì  le garanzie del produttore si applicano ai prodotti BleeqUp idonei. Siamo rivenditore BleeqUp autorizzato per il Canada. Contattaci con la prova d'acquisto e ti aiuteremo a coordinare il servizio di garanzia con BleeqUp quando necessario.",
          },
        ],
      },
      productsPricing: {
        title: "Prodotti e prezzi",
        items: [
          {
            q: "Cosa vendete?",
            a: "Questo è un negozio dedicato a BleeqUp Canada. Vendiamo gli occhiali-fotocamera sportivi con IA BleeqUp Ranger e accessori ufficiali (Power Plus, controller Bluetooth, lenti, cavo di ricarica, opzioni con lenti graduate e indossabili correlati). Non vendiamo trolley da golf o altri marchi su questo sito.",
          },
          {
            q: "Siete un rivenditore BleeqUp autorizzato?",
            a: "Sì. Questo sito è gestito come rivenditore BleeqUp autorizzato per il mercato canadese. Non è il sito ufficiale del produttore BleeqUp (bleequp.com).",
          },
          {
            q: "Perché i prezzi sono in CAD?",
            a: "Questo negozio è solo per il Canada. Ogni prezzo e totale al checkout è in dollari canadesi (CAD). L'addebito avviene in CAD tramite il nostro account Stripe canadese.",
          },
          {
            q: "Cosa succede se un articolo è esaurito?",
            a: "Le varianti esaurite sono indicate sulla pagina del prodotto. Accedi e torna più tardi, oppure scrivi a {supportEmail} se desideri aiuto con un'alternativa o i tempi di riassortimento.",
          },
        ],
      },
      accountLoyalty: {
        title: "Account, fedeltà e referral",
        items: [
          {
            q: "Serve un account per ordinare?",
            a: "Sì  per completare il checkout è richiesto un account gratuito. Registrati con e-mail o Google. I tuoi ordini canadesi, il saldo fedeltà e il profilo si trovano in Account.",
          },
          {
            q: "Come funzionano i punti fedeltà?",
            a: "Guadagna 1 punto per ogni 1 $ CAD speso su acquisti idonei. Usa 100 punti per 1 $ CAD di sconto al checkout. Consulta il saldo in Account ? Fedeltà.",
          },
          {
            q: "Come funzionano i premi referral?",
            a: "Condividi il tuo link referral personale da Account ? Referral. Quando un amico crea un account e completa un acquisto idoneo su questo negozio, entrambi guadagnate punti fedeltà bonus.",
          },
        ],
      },
      paymentSupport: {
        title: "Pagamento e supporto",
        items: [
          {
            q: "Quali metodi di pagamento accettate?",
            a: "Accettiamo le principali carte di credito e debito tramite Stripe, con addebito in CAD. Il numero completo della tua carta non viene mai memorizzato sui nostri server.",
          },
          {
            q: "Posso usare un codice promozionale?",
            a: "Sì  inserisci il codice nella pagina Il tuo carrello prima del checkout. Si applica un solo codice promozionale per ordine. I codici devono essere attivi e soddisfare eventuali requisiti di ordine minimo indicati nella promozione.",
          },
          {
            q: "Come contatto il supporto?",
            a: "Scrivi a {supportEmail} con il tuo numero d'ordine e la tua domanda. Di solito rispondiamo entro un giorno lavorativo. Indica che il tuo ordine proviene dal negozio BleeqUp Canada così possiamo aiutarti più rapidamente.",
          },
        ],
      },
    },
  },

  legal: {
    home: "Home",
    lastUpdated: "Ultimo aggiornamento {date}",
    questionsEmail: "Domande? Scrivi a",
    privacy: {
      title: "Informativa sulla privacy",
      metaDesc: "Come {name} raccoglie, utilizza e protegge i tuoi dati personali.",
      updated: "2 giugno 2025",
      intro:
        "{name} («noi») gestisce {host}. Questa informativa spiega quali dati raccogliamo quando fai acquisti o crei un account e come li utilizziamo.",
      sections: [
        {
          title: "Dati che raccogliamo",
          body: [
            "Dati dell'account: nome, e-mail e dati del profilo che fornisci alla registrazione o nelle impostazioni dell'account.",
            "Dati dell'ordine: indirizzo di spedizione, articoli acquistati, stato del pagamento e cronologia ordini. I numeri di carta sono elaborati da Stripe  non memorizziamo credenziali di pagamento complete sui nostri server.",
            "Dati di utilizzo: informazioni di base su dispositivo e browser raccolte tramite i nostri fornitori di hosting e analisi per mantenere il sito sicuro e performante.",
            "Autenticazione: se accedi con Google, riceviamo la tua e-mail e il profilo di base da Google secondo la relativa schermata di consenso OAuth.",
          ],
        },
        {
          title: "Come utilizziamo i tuoi dati",
          body: [
            "Per evadere gli ordini, calcolare imposte e spedizione, inviare conferme d'ordine e fornire assistenza clienti.",
            "Per gestire punti fedeltà, premi referral e sconti promozionali che scegli di applicare.",
            "Per prevenire frodi, far rispettare i nostri termini e adempiere agli obblighi di legge.",
            "Non vendiamo i tuoi dati personali a terze parti.",
          ],
        },
        {
          title: "Fornitori di servizi",
          body: [
            "Utilizziamo processori affidabili tra cui Stripe (pagamenti), Supabase (database e autenticazione) e Vercel (hosting). Ricevono solo i dati necessari per erogare i loro servizi.",
          ],
        },
        {
          title: "Cookie",
          body: [
            "Utilizziamo cookie essenziali per mantenere l'accesso e ricordare il carrello e la preferenza di paese. I codici referral possono essere memorizzati in un cookie di breve durata quando arrivi tramite un link referral.",
          ],
        },
        {
          title: "Le tue scelte",
          body: [
            "Puoi aggiornare i dati del profilo in Account ? Profilo, visualizzare gli ordini in Account ? Ordini e uscire in qualsiasi momento.",
            "Puoi richiedere l'accesso, la correzione o l'eliminazione dei dati del tuo account contattando {supportEmail}. Possiamo conservare alcuni dati ove richiesto per motivi fiscali, di prevenzione frodi o di conformità legale.",
          ],
        },
        {
          title: "Minori",
          body: [
            "Il nostro negozio non è rivolto a minori di 13 anni. Non raccogliamo consapevolmente dati personali di minori.",
          ],
        },
        {
          title: "Modifiche",
          body: [
            "Possiamo aggiornare questa informativa di tanto in tanto. L'uso continuato del sito dopo le modifiche costituisce accettazione dell'informativa rivista.",
          ],
        },
      ],
    },
    terms: {
      title: "Termini di servizio",
      metaDesc: "Termini e condizioni per acquistare su {name}.",
      updated: "2 giugno 2025",
      intro:
        "Utilizzando {host} o effettuando un ordine, accetti questi termini. Ti invitiamo a leggerli prima dell'acquisto.",
      sections: [
        {
          title: "Negozio e account",
          body: [
            "Devi fornire informazioni di account e spedizione accurate. Sei responsabile dell'attività svolta con il tuo account.",
            "Possiamo sospendere gli account coinvolti in frodi, abuso delle promozioni o violazione di questi termini.",
          ],
        },
        {
          title: "Prodotti e prezzi",
          body: [
            "I prezzi sono mostrati in USD o CAD in base al paese selezionato. Imposte e spedizione sono calcolate al checkout.",
            "Ci impegniamo a mostrare un inventario accurato, ma la disponibilità non è garantita finché il pagamento non è autorizzato. Possiamo annullare gli ordini interessati da errori di prezzo o carenze di stock e rimborseremo qualsiasi addebito.",
            "Le immagini e le descrizioni dei prodotti sono a scopo illustrativo; possono verificarsi piccole variazioni.",
          ],
        },
        {
          title: "Ordini e pagamento",
          body: [
            "Effettuare un ordine è una proposta d'acquisto. Accettiamo il tuo ordine quando il pagamento viene acquisito con successo.",
            "I pagamenti sono elaborati da Stripe. Pagando, ci autorizzi ad addebitare sul metodo di pagamento selezionato il totale dell'ordine mostrato al checkout, inclusi sconti, imposte e spedizione applicabili.",
            "I codici promozionali sono soggetti a regole di idoneità, limiti di utilizzo e date di scadenza indicati nelle campagne configurate dall'amministratore.",
          ],
        },
        {
          title: "Spedizione e resi",
          body: [
            "Spediamo a indirizzi negli Stati Uniti e in Canada. I tempi di consegna sono stime, non garanzie.",
            "La spedizione gratuita si applica agli ordini di {freeShippingOver} $ o più (nella valuta dell'ordine), e valgono le finestre di reso descritte sul sito, salvo diversa indicazione nella conferma d'ordine.",
            "Gli articoli devono essere restituiti non utilizzati e nella confezione originale, ove ragionevole. I rimborsi vengono emessi sul metodo di pagamento originale dopo l'ispezione.",
          ],
        },
        {
          title: "Fedeltà e referral",
          body: [
            "I punti fedeltà e i bonus referral non hanno valore in denaro, possono scadere o cambiare e non sono trasferibili. Possiamo modificare o revocare i punti ottenuti per errore o abuso.",
          ],
        },
        {
          title: "Esclusione di responsabilità",
          body: [
            "I prodotti sono venduti per uso atletico e ricreativo generale. Ti assumi i rischi insiti nelle attività sportive. Nella misura massima consentita dalla legge, decliniamo le garanzie non richieste dalle norme applicabili a tutela dei consumatori.",
          ],
        },
        {
          title: "Limitazione di responsabilità",
          body: [
            "La nostra responsabilità per qualsiasi reclamo derivante dall'uso del sito o di un prodotto è limitata all'importo che hai pagato per l'ordine in questione, salvo ove vietato dalla legge.",
          ],
        },
        {
          title: "Legge applicabile",
          body: [
            "Questi termini sono regolati dalle leggi dello Stato del Delaware, USA, senza riguardo alle norme sui conflitti di legge. Le controversie saranno risolte presso i tribunali del Delaware, salvo diversa disposizione delle tue leggi locali a tutela dei consumatori.",
          ],
        },
        {
          title: "Contatti",
          body: ["Per domande su ordini o termini, contatta {supportEmail}."],
        },
      ],
      productsPricingVerveace:
        "I prezzi sono mostrati in USD o CAD in base al paese selezionato. Imposte e spedizione sono calcolate al checkout.",
      productsPricingBleeq:
        "I prezzi sono mostrati in CAD. Imposte e spedizione sono calcolate al checkout.",
      shippingBodyVerveace:
        "Spediamo a indirizzi negli Stati Uniti e in Canada. I tempi di consegna sono stime, non garanzie.",
      shippingBodyBleeq:
        "Spediamo a indirizzi in Canada. I tempi di consegna sono stime, non garanzie.",
      governingLawVerveace:
        "Questi termini sono regolati dalle leggi dello Stato del Delaware, USA, senza riguardo alle norme sui conflitti di legge. Le controversie saranno risolte presso i tribunali del Delaware, salvo diversa disposizione delle tue leggi locali a tutela dei consumatori.",
      governingLawBleeq:
        "Questi termini sono regolati dalle leggi del Canada e della provincia dell'Ontario, senza riguardo alle norme sui conflitti di legge, salvo diversa disposizione delle tue leggi locali a tutela dei consumatori.",
    },
    warranty: {
      title: "Garanzia",
      metaDesc: "Politica di garanzia e registrazione prodotto per {name}.",
      tabPolicy: "Politica di garanzia",
      tabRegister: "Registrazione garanzia",
      registerIntro:
        "Registra il prodotto per aiutarci a verificare la proprietà e velocizzare le richieste di garanzia. Tieni a portata la conferma d'ordine — il numero di serie è facoltativo ma consigliato per gli occhiali con fotocamera.",
      fullName: "Nome completo",
      email: "Email",
      orderNumber: "Numero ordine",
      orderNumberPlaceholder: "es. ORD-12345",
      product: "Prodotto",
      productPlaceholder: "Seleziona un prodotto",
      serialNumber: "Numero di serie",
      purchaseDate: "Data di acquisto",
      notes: "Note",
      notesPlaceholder: "Altro da comunicarci?",
      optional: "facoltativo",
      submit: "Registra prodotto",
      submitting: "Invio…",
      successTitle: "Registrazione ricevuta",
      successBody:
        "Grazie — abbiamo salvato la registrazione della garanzia. Conserva la conferma d'ordine per eventuali richieste future. Ti scriveremo se servono altri dettagli.",
      toastSuccess: "Registrazione garanzia inviata.",
      errorProduct: "Seleziona un prodotto",
      errorGeneric: "Qualcosa è andato storto. Riprova.",
      errorConn: "Invio non riuscito. Controlla la connessione e riprova.",
    },
  },

  newsletter: {
    title: "Resta aggiornato",
    descVerveace:
      "Ricevi drop BleeqUp, offerte esclusive e avvisi sui nuovi prodotti da VerveaceSports.",
    descBleeq:
      "Iscriviti alla newsletter per avere la possibilità di vincere un paio GRATUITO di BleeqUp Rangers AI Glasses",
    email: "Indirizzo e-mail",
    emailPlaceholder: "tu@esempio.com",
    subscribe: "Iscriviti",
    subscribing: "Iscrizione",
    privacyNote: "Disiscriviti quando vuoi. Consulta la nostra",
    privacyPolicy: "Informativa sulla privacy",
    noThanks: "No, grazie",
    toastSuccess: "Iscrizione completata. Controlla la tua casella di posta.",
    toastAlready: "Sei già nella lista  grazie!",
    toastError: "Qualcosa è andato storto. Riprova.",
    toastConnError: "Iscrizione non riuscita. Controlla la connessione e riprova.",
  },

  draw: {
    title: "Estrazione NBDA",
    metaDescription:
      "Iscriviti per partecipare all’estrazione di un paio di BleeqUp Ranger AI. Codice NBDA2026: 10% di sconto.",
    kicker: "NBDA Canada 2026",
    headline: "Vinci un paio di occhiali BleeqUp AI",
    subhead:
      "Iscriviti alla newsletter per entrare nell’estrazione di un paio gratis di BleeqUp Ranger AI Sports Glasses — e usa la promo NBDA mentre acquisti.",
    promoTitle: "Promo in corso",
    promoBody:
      "Usa il codice NBDA2026 per il 10% di sconto. Spedizione gratuita per ordini superiori a {amount} $.",
    promoCode: "NBDA2026",
    howTitle: "Come partecipare",
    step1: "Inserisci la tua email per iscriverti alla newsletter BleeqUp Canada.",
    step2:
      "Sei automaticamente iscritto all’estrazione di un paio gratis di BleeqUp Ranger AI Sports Glasses.",
    step3: "Acquista quando vuoi con il codice NBDA2026 per il 10% di sconto.",
    formTitle: "Partecipa all’estrazione",
    formSubtitle: "Una email = newsletter + partecipazione all’estrazione.",
    cta: "Iscriviti e partecipa",
    entered: "Sei dentro — controlla la posta per gli aggiornamenti.",
    toastSuccess: "Sei iscritto. Controlla la posta.",
    finePrint: "Nessun acquisto richiesto. Consulta la nostra",
    navLabel: "Estrazione",
  },

  bleeq: {
    trust: {
      promo: "Usa il codice NBDA2026 per il 10% di sconto",
      promoDesktop:
        "Usa il codice NBDA2026 per il 10% di sconto. Spedizione gratuita per ordini superiori a {amount} $.",
    },
    header: {
      shopRanger: "Acquista Ranger",
      accessories: "Accessori",
      support: "Supporto",
      faq: "FAQ",
      allProducts: "Tutti i prodotti",
      supportFaq: "Supporto / FAQ",
      viewAllModels: "Vedi tutti i modelli Ranger ?",
      allAccessories: "Tutti gli accessori ?",
      canada: "Canada",
    },
    footer: {
      blurb: "Rivenditore BleeqUp autorizzato. Prezzi in CAD, spedizione in tutto il Canada.",
      shopRanger: "Acquista Ranger",
      allModels: "Tutti i modelli",
      accessories: "Accessori",
      support: "Supporto",
      shipsCad: "Spedizione Canada · CAD",
      copyright: "© {year} {name}. Rivenditore BleeqUp autorizzato.",
    },
    home: {
      heroKicker: "{shortName} · Canada · CAD",
      shopNow: "Acquista ora",
      compareModels: "Confronta i modelli",
      chooseTitle: "Scegli il tuo Ranger",
      chooseSubtitle: "Standard, Zeiss o Ultimate Bundle  un clic verso il prodotto.",
      viewAll: "Vedi tutto ?",
      featuresKicker: "Caratteristiche del prodotto",
      featuresTitle: "Scopri cosa può fare Ranger",
      watchMore: "Guarda altro nella pagina dello shop",
      testimonialsKicker: "I clienti dicono",
      testimonialsTitle: "Fatto per come ti muovi",
      asSeenIn: "Come visto su",
      accessoriesTitle: "Accessori",
      accessoriesSubtitle: "Power Plus, controller, lenti e altro.",
      shopAccessories: "Acquista accessori ?",
      ctaTitle: "Pronto per la tua prossima uscita?",
      ctaSubtitle:
        "Rivenditore BleeqUp autorizzato per il Canada. Resi gratuiti entro 30 giorni. Guadagna punti fedeltà a ogni ordine.",
      shopRanger: "Acquista Ranger",
    },
  },

  common: {
    remove: "Rimuovi",
    cancel: "Annulla",
    apply: "Applica",
    copy: "Copia",
    copied: "Copiato",
    share: "Condividi",
    loading: "Caricamento",
    language: "Lingua",
    free: "Gratis",
    home: "Home",
    save: "Salva",
    close: "Chiudi",
    error: "Qualcosa è andato storto.",
  },
};
