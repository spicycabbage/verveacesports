import type { Dictionary } from "./types";

export const es: Dictionary = {
  nav: {
    openMenu: "Abrir menú",
    menu: "Menú",
    language: "Idioma",
    allProducts: "Todos los productos",
    cart: "Carrito",
    account: "Cuenta",
    orders: "Pedidos",
    faq: "FAQ",
    searchPlaceholder: "Buscar equipo...",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    profile: "Perfil",
    loyaltyPoints: "Puntos de fidelidad",
    referrals: "Referidos",
    admin: "Admin",
    pts: "{n} pts",
    accountMenu: "Menú de la cuenta",
    openCart: "Abrir carrito",
  },

  footer: {
    tagline:
      "Distribuidor autorizado de las gafas-cámara con IA BleeqUp y de los carros de golf eléctricos MGI & Motocaddy.",
    shop: "Tienda",
    account: "Cuenta",
    help: "Ayuda",
    profile: "Perfil",
    orders: "Pedidos",
    loyaltyPoints: "Puntos de fidelidad",
    referFriend: "Recomendar a un amigo",
    freeShippingOver: "Envío gratis desde {amount} $",
    freeReturns30: "Devoluciones gratuitas en 30 días",
    earn1Point: "Gana 1 punto por dólar",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos del Servicio",
    warranty: "Garantía",
    privacy: "Privacidad",
    terms: "Términos",
    themePlayground: "Zona de temas",
    faq: "FAQ",
    copyright: "© {year} VerveaceSports. Todos los derechos reservados.",
  },

  home: {
    shopByCategory: "Comprar por categoría",
    viewAll: "Ver todo",
    featured: "Destacado",
    seeAll: "Ver todo",
    badge: "BleeqUp, MGI & Motocaddy  envío a EE. UU. y Canadá",
    headlineGlasses: "Captura cada momento",
    headlineCart: "Potencia en cada ronda",
    ctaGlasses: "Comprar gafas con IA",
    ctaCarts: "Comprar carros de golf",
    ctaAll: "Ver todos los productos",
    altGlasses: "Gafas-cámara deportivas con IA BleeqUp Ranger",
    altCart: "Carro de golf eléctrico MGI Zip X5",
    subcopy:
      "Compra las gafas-cámara deportivas con IA BleeqUp Ranger y los carros de golf eléctricos premium de MGI y Motocaddy. Envío gratis en Canadá en pedidos superiores a {amount} $.",
    trustShipping: "Envío gratis desde {amount} $",
    trustReturns: "Devoluciones en 30 días",
    trustLoyalty: "Recompensas de fidelidad",
  },

  categories: {
    "ai-glasses": "Gafas con IA",
    wearables: "Wearables",
    "electric-carts": "Carros eléctricos",
    "golf-gear": "Equipo de golf",
  },

  products: {
    allProducts: "Todos los productos",
    shopAllTitle: "Ver todos los productos",
    count: "{n} productos",
    countForQuery: '{n} productos para «{query}»',
    empty: "No se encontraron productos.",
    youMightAlsoLike: "También te puede gustar",
    sortNewest: "Más nuevos",
    sortPriceAsc: "Precio: de menor a mayor",
    sortPriceDesc: "Precio: de mayor a menor",
    sortNameAsc: "Nombre AZ",
    searching: "Buscando:",
    clearSearch: "Borrar búsqueda",
    all: "Todos",
    shopRanger: "Comprar Ranger",
    rangerMeta:
      "{n} modelos disponibles · Devoluciones gratuitas en 30 días · Gana 1 punto de fidelidad por dólar",
  },

  product: {
    addToCart: "Añadir al carrito",
    outOfStock: "Sin stock",
    soldOut: "Agotado",
    onlyNLeft: "Solo quedan {n}",
    inStock: "En stock",
    freeShippingOver: "Envío gratis en pedidos superiores a {amount} $",
    freeShippingCanada: "Envío gratis en pedidos superiores a {amount} $ (Canadá)",
    freeShippingUsaCa: "Envío gratis en pedidos superiores a {amount} $ (EE. UU. y CA)",
    returns30: "Devoluciones sin complicaciones en 30 días",
    earnPoints: "Gana {n} puntos con este pedido",
    addedToast: "{name} añadido al carrito",
    viewCart: "Ver carrito",
    reviews: {
      heading: "Opiniones de clientes",
      writeReview: "Escribir una opinión",
      cancel: "Cancelar",
      rating: "Valoración",
      reviewTitle: "Título",
      titleOptional: "Título (opcional)",
      titlePlaceholder: "Resúmelo",
      reviewBody: "Opinión",
      bodyPlaceholder: "¿Qué te gustó? ¿Cómo aguanta?",
      submitReview: "Enviar opinión",
      submitting: "Enviando",
      noReviews: "Aún no hay opiniones.",
      signInToReview: "Iniciar sesión",
      signIn: "Iniciar sesión",
      afterPurchase: "tras la compra para dejar una opinión verificada.",
      alreadyReviewed: "Ya has valorado este producto.",
      verifiedOnly: "Las opiniones están limitadas a compradores verificados de este producto.",
      verifiedBuyer: "Comprador verificado",
      thanksReview: "Gracias, tu opinión ya está publicada",
      reviewSingular: "opinión",
      reviewPlural: "opiniones",
    },
  },

  cart: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío",
    emptyHint: "Descubre equipo que impulsa tu rendimiento.",
    browseProducts: "Ver productos",
    remove: "Quitar",
    removeItem: "Quitar artículo",
    subtotal: "Subtotal",
    discount: "Descuento",
    estimatedTotal: "Total estimado",
    shipping: "Envío",
    shippingCalc: "Se calcula al finalizar la compra",
    orderSummary: "Resumen del pedido",
    proceedCheckout: "Ir a finalizar la compra",
    checkout: "Finalizar compra",
    shippingTaxesNote: "Envío e impuestos calculados al finalizar la compra.",
    emptyDiscover: "Descubre equipo que impulsa tu rendimiento.",
  },

  checkout: {
    title: "Finalizar compra",
    empty: "Tu carrito está vacío",
    browseProducts: "Ver productos",
    shippingAddress: "Dirección de envío",
    firstName: "Nombre",
    lastName: "Apellidos",
    address: "Dirección",
    aptOptional: "Piso / apto. (opcional)",
    city: "Ciudad",
    stateProvince: "Estado / provincia",
    postalCode: "Código postal",
    country: "País",
    unitedStates: "Estados Unidos",
    canada: "Canadá",
    promo: "Código promocional",
    noPromo: "Ningún código promocional aplicado.",
    addPromoOnCart: "Añade uno en tu carrito",
    youSave: "Ahorras {amount}",
    freeShippingIncluded: "Envío gratis incluido",
    remove: "Quitar",
    redeemPoints: "Canjear puntos de fidelidad",
    pointsAvailable: "Tienes {n} pts. 100 pts = 1 $ de descuento.",
    redeemN: "Canjear {n} pts",
    payment: "Pago",
    payForOrder: "Pagar el pedido",
    cadNotConfigured:
      "Los pagos canadienses aún no están configurados. Actualiza en un minuto; si continúa, contacta con soporte.",
    currencyNotConfigured:
      "Los pagos aún no están configurados para esta moneda. Contacta con soporte.",
    calculating: "Calculando el total",
    belowMinimum: "El total del pedido está por debajo del cargo mínimo.",
    orderSummary: "Resumen del pedido",
    subtotal: "Subtotal",
    discount: "Descuento",
    discountWithCode: "Descuento ({code})",
    shipping: "Envío",
    shippingPromo: "Envío (promo)",
    tax: "Impuesto",
    taxWithRate: "Impuesto ({rate} %)",
    points: "Puntos ({n})",
    total: "Total",
    free: "GRATIS",
    enterRegionForTax: "Introduce el estado/provincia para estimar el impuesto.",
    earnPointsNote: "Ganarás ~{n} pts con este pedido.",
    completeShipping: "Completa el formulario de envío.",
    couldNotUpdate: "No se pudieron actualizar los totales",
    promoRemoved: "Código promocional eliminado",
    successConfirmed: "Pedido confirmado",
    thankYou: "¡Gracias por tu pedido!",
    viewOrder: "Ver pedido",
    keepShopping: "Seguir comprando",
    paymentReceived:
      "Pago recibido. Los puntos de fidelidad de este pedido aparecerán pronto en tu cuenta.",
    confirmingPayment:
      "Estamos confirmando el pago con Stripe: suele tardar solo unos segundos.",
    totalPaid: "Total pagado",
    pointsRedeemed: "Puntos canjeados",
  },

  account: {
    title: "Cuenta",
    profile: "Perfil",
    orders: "Pedidos",
    loyalty: "Fidelidad",
    referrals: "Referidos",
    admin: "Admin",
    signOut: "Cerrar sesión",
    loyaltyPoints: "Puntos de fidelidad",
    worthAtCheckout: "Valen {amount} $ al finalizar la compra",
    memberSince: "Miembro desde",
    profileTitle: "Perfil",
    profileDesc: "Mantén tus datos actualizados.",
    email: "Correo electrónico",
    yourReferralCode: "Tu código de referido",
    firstName: "Nombre",
    lastName: "Apellidos",
    country: "País",
    saveChanges: "Guardar cambios",
    profileUpdated: "Perfil actualizado",
    ordersTitle: "Mis pedidos",
    noOrders: "Aún no hay pedidos",
    startShopping: "Empezar a comprar",
    order: "Pedido",
    date: "Fecha",
    status: "Estado",
    total: "Total",
    view: "Ver",
    loyaltyTitle: "Puntos de fidelidad",
    loyaltyDesc:
      "Gana 1 punto por dólar. Canjea 100 puntos por 1 $ de descuento al finalizar la compra.",
    referralsTitle: "Recomendar a un amigo",
    referralsDesc:
      "Comparte tu enlace. Cuando un amigo realice una compra válida, ambos ganáis puntos extra.",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    status_pending: "pendiente",
    status_paid: "pagado",
    status_shipped: "enviado",
    status_delivered: "entregado",
    status_cancelled: "cancelado",
  },

  auth: {
    welcomeBack: "Bienvenido de nuevo",
    signInDesc: "Inicia sesión en tu cuenta de VerveaceSports.",
    continueGoogle: "Continuar con Google",
    or: "O",
    password: "Contraseña",
    email: "Correo electrónico",
    signIn: "Iniciar sesión",
    noAccount: "¿No tienes cuenta?",
    signUp: "Regístrate",
    createAccount: "Crear cuenta",
    createTitle: "Crea tu cuenta",
    createDesc: "Gana 1 punto por dólar desde tu primer pedido.",
    alreadyHave: "¿Ya tienes cuenta?",
    min8: "Mínimo 8 caracteres.",
    firstName: "Nombre",
    lastName: "Apellidos",
    referredBy: "Recomendado por {code}",
    referralBonus: "Ambos ganáis 100 puntos extra tras tu primer pedido pagado.",
    agreeTerms: "Al crear una cuenta aceptas nuestros",
    terms: "Términos",
    and: "y la",
    privacyPolicy: "Política de Privacidad",
    signedIn: "Sesión iniciada",
    checkEmailConfirm: "Revisa tu correo para confirmar tu cuenta.",
  },

  faq: {
    title: "Preguntas frecuentes",
    home: "Inicio",
    introVerveace:
      "Respuestas rápidas sobre envíos, devoluciones, productos BleeqUp, MGI & Motocaddy, puntos de fidelidad y pago. ¿No encuentras lo que buscas? Escribe a {email}.",
    introBleeq:
      "Respuestas rápidas sobre envíos en Canadá, precios en CAD, devoluciones, gafas BleeqUp Ranger, fidelidad y pago. ¿No encuentras lo que buscas? Escribe a {email}.",
    emailSupport: "Escribe a {email} para más ayuda.",
    sections: {
      ordersShipping: {
        title: "Pedidos y envíos",
        items: [
          {
            q: "¿A dónde enviáis?",
            a: "Enviamos a direcciones en Estados Unidos y Canadá. Las tarifas de envío y los plazos de entrega estimados se calculan al finalizar la compra según tu ubicación y el total del pedido.",
          },
          {
            q: "¿El envío es gratis?",
            a: "Los pedidos de {freeShippingOver} $ USD o más (o {freeShippingOver} $ CAD en el pago canadiense) tienen envío estándar gratuito dentro de EE. UU. y Canadá. Los pedidos más pequeños muestran la tarifa de envío antes de pagar.",
          },
          {
            q: "¿Cuándo llegará mi pedido?",
            a: "La mayoría de los pedidos con stock se envían en 1 a 3 días laborables. Los plazos de entrega dependen del transportista y del destino; recibirás la información de seguimiento por correo cuando se envíe tu pedido.",
          },
          {
            q: "¿Puedo cambiar o cancelar mi pedido?",
            a: "Contáctanos en {supportEmail} lo antes posible si necesitas cambiar la dirección de envío o cancelar. Normalmente podemos ayudar antes de que se envíe; una vez que sale de nuestro almacén, es posible que los cambios ya no sean posibles.",
          },
        ],
      },
      returnsWarranty: {
        title: "Devoluciones y garantía",
        items: [
          {
            q: "¿Cuál es vuestra política de devoluciones?",
            a: "Los artículos sin usar en su embalaje original pueden devolverse en un plazo de 30 días tras la entrega para un reembolso a tu método de pago original. El equipo abierto o usado puede optar a crédito en tienda; escribe a {supportEmail} con tu número de pedido para iniciar una devolución.",
          },
          {
            q: "¿Cómo inicio una devolución?",
            a: "Escribe a {supportEmail} con tu número de pedido y los artículos que quieres devolver. Te enviaremos las instrucciones de devolución y una etiqueta de envío cuando corresponda.",
          },
          {
            q: "¿Los productos BleeqUp, MGI y Motocaddy tienen garantía?",
            a: "Las garantías del fabricante se aplican a los productos elegibles. Somos distribuidor autorizado de BleeqUp, MGI y Motocaddy; contáctanos con tu comprobante de compra y te ayudaremos a coordinar el servicio de garantía con la marca cuando sea necesario.",
          },
        ],
      },
      productsPricing: {
        title: "Productos y precios",
        items: [
          {
            q: "¿Sois distribuidor autorizado?",
            a: "Sí. VerveaceSports es distribuidor autorizado de las gafas-cámara con IA BleeqUp y de los carros de golf eléctricos, caddies y accesorios MGI & Motocaddy.",
          },
          {
            q: "¿Por qué los precios aparecen en USD o CAD?",
            a: "Los precios se muestran en USD para compradores de Estados Unidos y en CAD para compradores canadienses según el mercado seleccionado. La moneda que aparece en cada página de producto y al finalizar la compra es el importe que se te cobrará.",
          },
          {
            q: "¿Y si un artículo está agotado?",
            a: "Las variantes agotadas se indican en la página del producto. Puedes iniciar sesión y volver más tarde, o contactarnos si quieres ayuda para encontrar una alternativa o estimar la reposición.",
          },
        ],
      },
      accountLoyalty: {
        title: "Cuenta, fidelidad y referidos",
        items: [
          {
            q: "¿Necesito una cuenta para pedir?",
            a: "Necesitas una cuenta gratuita para completar el pago. Regístrate con correo o Google: tu historial de pedidos, saldo de fidelidad y datos de perfil guardados están en Cuenta.",
          },
          {
            q: "¿Cómo funcionan los puntos de fidelidad?",
            a: "Gana 1 punto por cada 1 $ gastado en compras elegibles. Canjea 100 puntos por 1 $ de descuento al finalizar la compra. Consulta tu saldo e historial en Cuenta ? Fidelidad.",
          },
          {
            q: "¿Cómo funcionan las recompensas por referidos?",
            a: "Comparte tu enlace de referido personal desde Cuenta ? Referidos. Cuando un amigo crea una cuenta y realiza una compra válida, ambos ganáis puntos de fidelidad extra.",
          },
        ],
      },
      paymentSupport: {
        title: "Pago y soporte",
        items: [
          {
            q: "¿Qué métodos de pago aceptáis?",
            a: "Aceptamos las principales tarjetas de crédito y débito a través de Stripe. El número completo de tu tarjeta nunca se almacena en nuestros servidores.",
          },
          {
            q: "¿Puedo usar un código promocional?",
            a: "Sí; introduce tu código en la página Tu carrito antes de pagar. Solo se aplica un código promocional por pedido. Los códigos deben estar activos y cumplir cualquier requisito de pedido mínimo indicado en la promoción.",
          },
          {
            q: "¿Cómo contacto con soporte?",
            a: "Escribe a {supportEmail} con tu número de pedido y tu pregunta. Normalmente respondemos en un día laborable.",
          },
        ],
      },
    },
    bleeqSections: {
      ordersShipping: {
        title: "Pedidos y envíos",
        items: [
          {
            q: "¿A dónde enviáis?",
            a: "Solo enviamos a direcciones en Canadá. Las tarifas de envío y los plazos de entrega estimados se calculan al finalizar la compra según tu provincia y el total del pedido. Todos los precios son en dólares canadienses (CAD).",
          },
          {
            q: "¿El envío es gratis?",
            a: "Los pedidos de {freeShippingOver} $ CAD o más tienen envío estándar gratuito dentro de Canadá. Los pedidos más pequeños muestran la tarifa de envío antes de pagar.",
          },
          {
            q: "¿Cuándo llegará mi pedido?",
            a: "La mayoría de los pedidos con stock se envían en 1 a 3 días laborables. La entrega dentro de Canadá suele tardar algunos días laborables adicionales según tu provincia y el transportista. Recibirás el seguimiento por correo cuando se envíe el pedido.",
          },
          {
            q: "¿Enviáis a Estados Unidos?",
            a: "Esta tienda solo envía dentro de Canadá. Para envíos a EE. UU. (y golf u otras marcas), compra en VerveaceSports.com.",
          },
          {
            q: "¿Puedo cambiar o cancelar mi pedido?",
            a: "Escribe a {supportEmail} lo antes posible con tu número de pedido si necesitas cambiar la dirección de envío o cancelar. Normalmente podemos ayudar antes del envío; una vez que sale de nuestro almacén, es posible que los cambios ya no sean posibles.",
          },
          {
            q: "¿Pago aranceles o tasas de importación?",
            a: "Los pedidos gestionados para entrega en Canadá se tratan como envíos nacionales canadienses. El total que ves al pagar en CAD es lo que se te cobra: sin aranceles de importación de EE. UU. inesperados en estos pedidos.",
          },
        ],
      },
      returnsWarranty: {
        title: "Devoluciones y garantía",
        items: [
          {
            q: "¿Cuál es vuestra política de devoluciones?",
            a: "Los artículos sin usar en su embalaje original pueden devolverse en un plazo de 30 días tras la entrega para un reembolso a tu método de pago original. Los artículos abiertos o usados pueden optar a crédito en tienda; escribe a {supportEmail} con tu número de pedido para iniciar una devolución.",
          },
          {
            q: "¿Cómo inicio una devolución?",
            a: "Escribe a {supportEmail} con tu número de pedido canadiense y los artículos que quieres devolver. Te enviaremos las instrucciones de devolución y una etiqueta de envío cuando corresponda.",
          },
          {
            q: "¿Los productos BleeqUp tienen garantía?",
            a: "Sí; las garantías del fabricante se aplican a los productos BleeqUp elegibles. Somos distribuidor autorizado de BleeqUp para Canadá. Contáctanos con tu comprobante de compra y te ayudaremos a coordinar el servicio de garantía con BleeqUp cuando sea necesario.",
          },
        ],
      },
      productsPricing: {
        title: "Productos y precios",
        items: [
          {
            q: "¿Qué vendéis?",
            a: "Esta es una tienda dedicada a BleeqUp Canadá. Vendemos las gafas-cámara deportivas con IA BleeqUp Ranger y accesorios oficiales (Power Plus, mando Bluetooth, lentes, cable de carga, opciones graduadas y wearables relacionados). No vendemos carros de golf ni otras marcas en este sitio.",
          },
          {
            q: "¿Sois distribuidor autorizado de BleeqUp?",
            a: "Sí. Este sitio se opera como distribuidor autorizado de BleeqUp para el mercado canadiense. No es el sitio oficial del fabricante BleeqUp (bleequp.com).",
          },
          {
            q: "¿Por qué los precios están en CAD?",
            a: "Esta tienda es solo para Canadá. Cada precio y total de pago está en dólares canadienses (CAD). Se te cobrará en CAD a través de nuestra cuenta canadiense de Stripe.",
          },
          {
            q: "¿Y si un artículo está agotado?",
            a: "Las variantes agotadas se indican en la página del producto. Inicia sesión y vuelve más tarde, o escribe a {supportEmail} si quieres ayuda con una alternativa o la reposición.",
          },
        ],
      },
      accountLoyalty: {
        title: "Cuenta, fidelidad y referidos",
        items: [
          {
            q: "¿Necesito una cuenta para pedir?",
            a: "Sí; se requiere una cuenta gratuita para completar el pago. Regístrate con correo o Google. Tus pedidos canadienses, saldo de fidelidad y perfil están en Cuenta.",
          },
          {
            q: "¿Cómo funcionan los puntos de fidelidad?",
            a: "Gana 1 punto por cada 1 $ CAD gastado en compras elegibles. Canjea 100 puntos por 1 $ CAD de descuento al finalizar la compra. Consulta tu saldo en Cuenta ? Fidelidad.",
          },
          {
            q: "¿Cómo funcionan las recompensas por referidos?",
            a: "Comparte tu enlace de referido personal desde Cuenta ? Referidos. Cuando un amigo crea una cuenta y realiza una compra válida en esta tienda, ambos ganáis puntos de fidelidad extra.",
          },
        ],
      },
      paymentSupport: {
        title: "Pago y soporte",
        items: [
          {
            q: "¿Qué métodos de pago aceptáis?",
            a: "Aceptamos las principales tarjetas de crédito y débito a través de Stripe, con cargo en CAD. El número completo de tu tarjeta nunca se almacena en nuestros servidores.",
          },
          {
            q: "¿Puedo usar un código promocional?",
            a: "Sí; introduce tu código en la página Tu carrito antes de pagar. Solo se aplica un código promocional por pedido. Los códigos deben estar activos y cumplir cualquier requisito de pedido mínimo indicado en la promoción.",
          },
          {
            q: "¿Cómo contacto con soporte?",
            a: "Escribe a {supportEmail} con tu número de pedido y tu pregunta. Normalmente respondemos en un día laborable. Menciona que tu pedido es de la tienda BleeqUp Canadá para ayudarte más rápido.",
          },
        ],
      },
    },
  },

  legal: {
    home: "Inicio",
    lastUpdated: "Última actualización {date}",
    questionsEmail: "¿Preguntas? Escribe a",
    privacy: {
      title: "Política de Privacidad",
      metaDesc: "Cómo {name} recopila, usa y protege tu información personal.",
      updated: "2 de junio de 2025",
      intro:
        "{name} («nosotros») opera {host}. Esta política explica qué datos recopilamos cuando compras o creas una cuenta, y cómo los usamos.",
      sections: [
        {
          title: "Información que recopilamos",
          body: [
            "Datos de la cuenta: nombre, correo y datos de perfil que proporcionas al registrarte o en la configuración de tu cuenta.",
            "Datos del pedido: dirección de envío, artículos comprados, estado del pago e historial de pedidos. Los números de tarjeta los procesa Stripe; no almacenamos credenciales de pago completas en nuestros servidores.",
            "Datos de uso: información básica del dispositivo y del navegador recopilada a través de nuestros proveedores de alojamiento y analítica para mantener el sitio seguro y con buen rendimiento.",
            "Autenticación: si inicias sesión con Google, recibimos tu correo y perfil básico de Google según su pantalla de consentimiento OAuth.",
          ],
        },
        {
          title: "Cómo usamos tu información",
          body: [
            "Para tramitar pedidos, calcular impuestos y envío, enviar confirmaciones de pedido y ofrecer atención al cliente.",
            "Para gestionar puntos de fidelidad, recompensas por referidos y descuentos promocionales que elijas aplicar.",
            "Para prevenir el fraude, hacer cumplir nuestros términos y cumplir con las obligaciones legales.",
            "No vendemos tu información personal a terceros.",
          ],
        },
        {
          title: "Proveedores de servicios",
          body: [
            "Usamos procesadores de confianza como Stripe (pagos), Supabase (base de datos y autenticación) y Vercel (alojamiento). Solo reciben los datos necesarios para prestar sus servicios.",
          ],
        },
        {
          title: "Cookies",
          body: [
            "Usamos cookies esenciales para mantener tu sesión iniciada y recordar tu carrito y preferencia de país. Los códigos de referido pueden almacenarse en una cookie de corta duración cuando llegas a través de un enlace de referido.",
          ],
        },
        {
          title: "Tus opciones",
          body: [
            "Puedes actualizar los datos de perfil en Cuenta ? Perfil, ver pedidos en Cuenta ? Pedidos y cerrar sesión en cualquier momento.",
            "Puedes solicitar acceso, corrección o eliminación de los datos de tu cuenta contactando con {supportEmail}. Podemos conservar ciertos registros cuando sea necesario por motivos fiscales, de prevención del fraude o de cumplimiento legal.",
          ],
        },
        {
          title: "Menores",
          body: [
            "Nuestra tienda no está dirigida a menores de 13 años. No recopilamos conscientemente información personal de menores.",
          ],
        },
        {
          title: "Cambios",
          body: [
            "Podemos actualizar esta política de vez en cuando. El uso continuado del sitio tras los cambios constituye la aceptación de la política revisada.",
          ],
        },
      ],
    },
    terms: {
      title: "Términos del Servicio",
      metaDesc: "Términos y condiciones para comprar en {name}.",
      updated: "2 de junio de 2025",
      intro:
        "Al usar {host} o realizar un pedido, aceptas estos términos. Léelos antes de comprar.",
      sections: [
        {
          title: "Tienda y cuentas",
          body: [
            "Debes proporcionar información de cuenta y envío exacta. Eres responsable de la actividad en tu cuenta.",
            "Podemos suspender cuentas implicadas en fraude, abuso de promociones o incumplimiento de estos términos.",
          ],
        },
        {
          title: "Productos y precios",
          body: [
            "Los precios se muestran en USD o CAD según el país seleccionado. Los impuestos y el envío se calculan al finalizar la compra.",
            "Nos esforzamos por mostrar un inventario exacto, pero el stock no está garantizado hasta que se autorice tu pago. Podemos cancelar pedidos afectados por errores de precio o falta de stock y reembolsaremos cualquier cargo.",
            "Las imágenes y descripciones de los productos son ilustrativas; pueden producirse pequeñas variaciones.",
          ],
        },
        {
          title: "Pedidos y pago",
          body: [
            "Realizar un pedido es una oferta de compra. Aceptamos tu pedido cuando el pago se captura correctamente.",
            "Los pagos los procesa Stripe. Al pagar, nos autorizas a cobrar en el método de pago seleccionado el total del pedido mostrado al finalizar la compra, incluidos los descuentos, impuestos y envío aplicables.",
            "Los códigos promocionales están sujetos a reglas de elegibilidad, límites de uso y fechas de caducidad indicados en las campañas configuradas por el administrador.",
          ],
        },
        {
          title: "Envío y devoluciones",
          body: [
            "Enviamos a direcciones en Estados Unidos y Canadá. Los plazos de entrega son estimaciones, no garantías.",
            "El envío gratis se aplica a pedidos de {freeShippingOver} $ o más (en la moneda del pedido), y se aplican los plazos de devolución descritos en el sitio, salvo que se indique lo contrario en tu confirmación de pedido.",
            "Los artículos deben devolverse sin usar y en su embalaje original cuando sea razonable. Los reembolsos se emiten al método de pago original tras la inspección.",
          ],
        },
        {
          title: "Fidelidad y referidos",
          body: [
            "Los puntos de fidelidad y los bonos por referidos no tienen valor en efectivo, pueden caducar o cambiar y no son transferibles. Podemos ajustar o revocar puntos obtenidos por error o abuso.",
          ],
        },
        {
          title: "Descargo de responsabilidad",
          body: [
            "Los productos se venden para uso atlético y recreativo general. Asumes los riesgos inherentes a las actividades deportivas. En la máxima medida permitida por la ley, renunciamos a las garantías no exigidas por las leyes de protección al consumidor aplicables.",
          ],
        },
        {
          title: "Limitación de responsabilidad",
          body: [
            "Nuestra responsabilidad por cualquier reclamación derivada de tu uso del sitio o de un producto se limita al importe que pagaste por el pedido correspondiente, salvo cuando la ley lo prohíba.",
          ],
        },
        {
          title: "Ley aplicable",
          body: [
            "Estos términos se rigen por las leyes del Estado de Delaware, EE. UU., sin tener en cuenta las normas sobre conflicto de leyes. Las disputas se resolverán en tribunales de Delaware, salvo que tus leyes locales de protección al consumidor exijan lo contrario.",
          ],
        },
        {
          title: "Contacto",
          body: ["Para preguntas sobre pedidos o términos, contacta con {supportEmail}."],
        },
      ],
      productsPricingVerveace:
        "Los precios se muestran en USD o CAD según el país seleccionado. Los impuestos y el envío se calculan al finalizar la compra.",
      productsPricingBleeq:
        "Los precios se muestran en CAD. Los impuestos y el envío se calculan al finalizar la compra.",
      shippingBodyVerveace:
        "Enviamos a direcciones en Estados Unidos y Canadá. Los plazos de entrega son estimaciones, no garantías.",
      shippingBodyBleeq:
        "Enviamos a direcciones en Canadá. Los plazos de entrega son estimaciones, no garantías.",
      governingLawVerveace:
        "Estos términos se rigen por las leyes del Estado de Delaware, EE. UU., sin tener en cuenta las normas sobre conflicto de leyes. Las disputas se resolverán en tribunales de Delaware, salvo que tus leyes locales de protección al consumidor exijan lo contrario.",
      governingLawBleeq:
        "Estos términos se rigen por las leyes de Canadá y la provincia de Ontario, sin tener en cuenta las normas sobre conflicto de leyes, salvo que tus leyes locales de protección al consumidor exijan lo contrario.",
    },
    warranty: {
      title: "Garantía",
      metaDesc: "Política de garantía y registro de producto para {name}.",
      tabPolicy: "Política de garantía",
      tabRegister: "Registro de garantía",
      registerIntro:
        "Registra tu producto para ayudarnos a verificar la propiedad y agilizar futuras reclamaciones de garantía. Ten a mano la confirmación del pedido — el número de serie es opcional, pero recomendado para las gafas con cámara.",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      orderNumber: "Número de pedido",
      orderNumberPlaceholder: "p. ej. ORD-12345",
      product: "Producto",
      productPlaceholder: "Selecciona un producto",
      serialNumber: "Número de serie",
      purchaseDate: "Fecha de compra",
      notes: "Notas",
      notesPlaceholder: "¿Algo más que debamos saber?",
      optional: "opcional",
      submit: "Registrar producto",
      submitting: "Enviando…",
      successTitle: "Registro recibido",
      successBody:
        "Gracias — hemos guardado tu registro de garantía. Conserva la confirmación del pedido para futuras reclamaciones. Te escribiremos si necesitamos más detalles.",
      toastSuccess: "Registro de garantía enviado.",
      errorProduct: "Selecciona un producto",
      errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
      errorConn: "No se pudo enviar. Comprueba tu conexión e inténtalo de nuevo.",
    },
  },

  newsletter: {
    title: "Mantente al día",
    descVerveace:
      "Recibe lanzamientos BleeqUp, ofertas exclusivas y avisos de nuevos productos de VerveaceSports.",
    descBleeq:
      "Suscríbete al boletín para participar y ganar un par GRATIS de BleeqUp Rangers AI Glasses",
    email: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    subscribe: "Suscribirse",
    subscribing: "Suscribiendo",
    privacyNote: "Cancela la suscripción cuando quieras. Consulta nuestra",
    privacyPolicy: "Política de Privacidad",
    noThanks: "No, gracias",
    toastSuccess: "Te has suscrito. Revisa tu bandeja de entrada.",
    toastAlready: "Ya estás en la lista, ¡gracias!",
    toastError: "Algo salió mal. Inténtalo de nuevo.",
    toastConnError: "No se pudo suscribir. Comprueba tu conexión e inténtalo de nuevo.",
  },

  draw: {
    title: "Sorteo NBDA",
    metaDescription:
      "Suscríbete para participar en el sorteo de unas BleeqUp Ranger AI. Código NBDA2026: 10% de descuento.",
    kicker: "NBDA Canada 2026",
    headline: "Gana unas gafas BleeqUp AI",
    subhead:
      "Únete a la newsletter para entrar en el sorteo de un par gratis de BleeqUp Ranger AI Sports Glasses — y aprovecha la promo NBDA al comprar.",
    promoTitle: "Promo activa",
    promoBody:
      "Usa el código NBDA2026 para 10% de descuento. Envío gratis en pedidos superiores a {amount} $.",
    promoCode: "NBDA2026",
    howTitle: "Cómo participar",
    step1: "Introduce tu email para suscribirte a la newsletter de BleeqUp Canada.",
    step2:
      "Quedas automáticamente inscrito en el sorteo de un par gratis de BleeqUp Ranger AI Sports Glasses.",
    step3: "Compra cuando quieras con el código NBDA2026 para 10% de descuento.",
    formTitle: "Entrar en el sorteo",
    formSubtitle: "Un email = newsletter + participación en el sorteo.",
    cta: "Suscribirse y participar",
    entered: "Ya estás dentro — revisa tu bandeja para novedades del sorteo.",
    toastSuccess: "Estás inscrito. Revisa tu bandeja de entrada.",
    finePrint: "No es necesario comprar. Consulta nuestra",
    navLabel: "Sorteo",
  },

  bleeq: {
    trust: {
      promo: "Usa el código NBDA2026 para 10% de descuento",
      promoDesktop:
        "Usa el código NBDA2026 para 10% de descuento. Envío gratis en pedidos superiores a {amount} $.",
    },
    header: {
      shopRanger: "Comprar Ranger",
      accessories: "Accesorios",
      support: "Soporte",
      faq: "FAQ",
      allProducts: "Todos los productos",
      supportFaq: "Soporte / FAQ",
      viewAllModels: "Ver todos los modelos Ranger ?",
      allAccessories: "Todos los accesorios ?",
      canada: "Canadá",
    },
    footer: {
      blurb: "Distribuidor autorizado BleeqUp. Precios en CAD, envío a todo Canadá.",
      shopRanger: "Comprar Ranger",
      allModels: "Todos los modelos",
      accessories: "Accesorios",
      support: "Soporte",
      shipsCad: "Envío Canadá · CAD",
      copyright: "© {year} {name}. Distribuidor autorizado BleeqUp.",
    },
    home: {
      heroKicker: "{shortName} · Canadá · CAD",
      shopNow: "Comprar ahora",
      compareModels: "Comparar modelos",
      chooseTitle: "Elige tu Ranger",
      chooseSubtitle: "Standard, Zeiss o Ultimate Bundle: un clic hasta el producto.",
      viewAll: "Ver todo ?",
      featuresKicker: "Características del producto",
      featuresTitle: "Descubre lo que puede hacer Ranger",
      watchMore: "Ver más en la página de la tienda",
      testimonialsKicker: "Lo que dicen los clientes",
      testimonialsTitle: "Hecho para cómo te mueves",
      asSeenIn: "Visto en",
      accessoriesTitle: "Accesorios",
      accessoriesSubtitle: "Power Plus, mandos, lentes y más.",
      shopAccessories: "Comprar accesorios ?",
      ctaTitle: "¿Listo para tu próxima salida?",
      ctaSubtitle:
        "Distribuidor autorizado BleeqUp para Canadá. Devoluciones gratuitas en 30 días. Gana puntos de fidelidad en cada pedido.",
      shopRanger: "Comprar Ranger",
    },
  },

  common: {
    remove: "Quitar",
    cancel: "Cancelar",
    apply: "Aplicar",
    copy: "Copiar",
    copied: "Copiado",
    share: "Compartir",
    loading: "Cargando",
    language: "Idioma",
    free: "Gratis",
    home: "Inicio",
    save: "Guardar",
    close: "Cerrar",
    error: "Algo salió mal.",
  },
};
