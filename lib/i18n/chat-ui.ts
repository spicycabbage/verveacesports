import type { Locale } from "@/lib/i18n/locale";
import type { SiteId } from "@/lib/site/config";

export type ChatUiStrings = {
  title: string;
  placeholder: string;
  send: string;
  welcome: string;
  thinking: string;
  error: string;
  open: string;
  close: string;
  unavailable: string;
  liveAgentSuggest: string;
  liveAgentButton: string;
  liveAgentRequesting: string;
  liveAgentWaiting: string;
  liveAgentJoined: string;
  liveAgentClosed: string;
  liveAgentError: string;
  liveAgentPlaceholder: string;
  liveAgentCloseConfirm: string;
  liveAgentCloseYes: string;
  liveAgentCloseNo: string;
};

type LiveAgentUi = Pick<
  ChatUiStrings,
  | "liveAgentSuggest"
  | "liveAgentButton"
  | "liveAgentRequesting"
  | "liveAgentWaiting"
  | "liveAgentJoined"
  | "liveAgentClosed"
  | "liveAgentError"
  | "liveAgentPlaceholder"
  | "liveAgentCloseConfirm"
  | "liveAgentCloseYes"
  | "liveAgentCloseNo"
>;

type ChatUiBySite = {
  verveace: Omit<ChatUiStrings, keyof LiveAgentUi>;
  "bleeq-ca": Omit<ChatUiStrings, keyof LiveAgentUi>;
};

const LIVE_UI: Record<Locale, LiveAgentUi> = {
  en: {
    liveAgentSuggest:
      "Our AI support assistant can answer a lot of questions but if you want to talk to a Live Agent, please press here.",
    liveAgentButton: "Live Agent",
    liveAgentRequesting: "Requesting a live agent…",
    liveAgentWaiting: "Waiting for an agent to join…",
    liveAgentJoined: "You're chatting with a live agent.",
    liveAgentClosed: "This conversation was closed.",
    liveAgentError: "Couldn't reach a live agent. Try again.",
    liveAgentPlaceholder: "Message the agent…",
    liveAgentCloseConfirm: "Are you sure you want to close this chat?",
    liveAgentCloseYes: "Yes",
    liveAgentCloseNo: "No",
  },
  nl: {
    liveAgentSuggest:
      "Onze AI-assistent beantwoordt veel vragen, maar wil je met een live medewerker praten? Druk dan hier.",
    liveAgentButton: "Live medewerker",
    liveAgentRequesting: "Live medewerker aanvragen…",
    liveAgentWaiting: "Wachten tot een medewerker meedoet…",
    liveAgentJoined: "Je chat nu met een live medewerker.",
    liveAgentClosed: "Dit gesprek is afgesloten.",
    liveAgentError: "Geen live medewerker bereikbaar. Probeer opnieuw.",
    liveAgentPlaceholder: "Bericht aan de medewerker…",
    liveAgentCloseConfirm: "Weet je zeker dat je deze chat wilt sluiten?",
    liveAgentCloseYes: "Ja",
    liveAgentCloseNo: "Nee",
  },
  fr: {
    liveAgentSuggest:
      "Notre assistant IA peut répondre à beaucoup de questions, mais si vous voulez parler à un agent en direct, appuyez ici.",
    liveAgentButton: "Agent en direct",
    liveAgentRequesting: "Demande d'un agent en direct…",
    liveAgentWaiting: "En attente d'un agent…",
    liveAgentJoined: "Vous discutez avec un agent en direct.",
    liveAgentClosed: "Cette conversation est close.",
    liveAgentError: "Impossible de joindre un agent. Réessayez.",
    liveAgentPlaceholder: "Message à l'agent…",
    liveAgentCloseConfirm: "Voulez-vous vraiment fermer ce chat ?",
    liveAgentCloseYes: "Oui",
    liveAgentCloseNo: "Non",
  },
  de: {
    liveAgentSuggest:
      "Unser KI-Assistent kann viele Fragen beantworten. Wenn Sie mit einem Live-Agenten sprechen möchten, tippen Sie hier.",
    liveAgentButton: "Live-Agent",
    liveAgentRequesting: "Live-Agent wird angefordert…",
    liveAgentWaiting: "Warten auf einen Agenten…",
    liveAgentJoined: "Sie chatten mit einem Live-Agenten.",
    liveAgentClosed: "Dieses Gespräch wurde geschlossen.",
    liveAgentError: "Kein Live-Agent erreichbar. Bitte erneut versuchen.",
    liveAgentPlaceholder: "Nachricht an den Agenten…",
    liveAgentCloseConfirm: "Möchten Sie diesen Chat wirklich schließen?",
    liveAgentCloseYes: "Ja",
    liveAgentCloseNo: "Nein",
  },
  "pt-PT": {
    liveAgentSuggest:
      "O nosso assistente de IA responde a muitas perguntas, mas se quiser falar com um agente em direto, prima aqui.",
    liveAgentButton: "Agente em direto",
    liveAgentRequesting: "A pedir um agente em direto…",
    liveAgentWaiting: "À espera de um agente…",
    liveAgentJoined: "Está a falar com um agente em direto.",
    liveAgentClosed: "Esta conversa foi encerrada.",
    liveAgentError: "Não foi possível contactar um agente. Tente novamente.",
    liveAgentPlaceholder: "Mensagem para o agente…",
    liveAgentCloseConfirm: "Tem a certeza de que quer fechar este chat?",
    liveAgentCloseYes: "Sim",
    liveAgentCloseNo: "Não",
  },
  es: {
    liveAgentSuggest:
      "Nuestro asistente de IA puede responder muchas preguntas, pero si quieres hablar con un agente en vivo, pulsa aquí.",
    liveAgentButton: "Agente en vivo",
    liveAgentRequesting: "Solicitando un agente en vivo…",
    liveAgentWaiting: "Esperando a un agente…",
    liveAgentJoined: "Estás hablando con un agente en vivo.",
    liveAgentClosed: "Esta conversación se cerró.",
    liveAgentError: "No se pudo contactar a un agente. Inténtalo de nuevo.",
    liveAgentPlaceholder: "Mensaje para el agente…",
    liveAgentCloseConfirm: "¿Seguro que quieres cerrar este chat?",
    liveAgentCloseYes: "Sí",
    liveAgentCloseNo: "No",
  },
  it: {
    liveAgentSuggest:
      "Il nostro assistente IA può rispondere a molte domande, ma se vuoi parlare con un agente dal vivo, premi qui.",
    liveAgentButton: "Agente dal vivo",
    liveAgentRequesting: "Richiesta agente dal vivo…",
    liveAgentWaiting: "In attesa di un agente…",
    liveAgentJoined: "Stai chattando con un agente dal vivo.",
    liveAgentClosed: "Questa conversazione è stata chiusa.",
    liveAgentError: "Impossibile raggiungere un agente. Riprova.",
    liveAgentPlaceholder: "Messaggio all'agente…",
    liveAgentCloseConfirm: "Sei sicuro di voler chiudere questa chat?",
    liveAgentCloseYes: "Sì",
    liveAgentCloseNo: "No",
  },
  ja: {
    liveAgentSuggest:
      "AIアシスタントで多くのご質問にお答えできます。オペレーターと話したい場合は、こちらを押してください。",
    liveAgentButton: "オペレーター",
    liveAgentRequesting: "オペレーターに接続しています…",
    liveAgentWaiting: "オペレーターの参加を待っています…",
    liveAgentJoined: "オペレーターとチャット中です。",
    liveAgentClosed: "この会話は終了しました。",
    liveAgentError: "オペレーターに接続できませんでした。再試行してください。",
    liveAgentPlaceholder: "オペレーターへのメッセージ…",
    liveAgentCloseConfirm: "このチャットを閉じますか？",
    liveAgentCloseYes: "はい",
    liveAgentCloseNo: "いいえ",
  },
  "zh-CN": {
    liveAgentSuggest:
      "我们的 AI 助手可以解答很多问题。如果您想与人工客服交谈，请按这里。",
    liveAgentButton: "人工客服",
    liveAgentRequesting: "正在请求人工客服…",
    liveAgentWaiting: "正在等待客服接入…",
    liveAgentJoined: "您正在与人工客服交谈。",
    liveAgentClosed: "此对话已结束。",
    liveAgentError: "无法接通人工客服，请重试。",
    liveAgentPlaceholder: "发送给客服…",
    liveAgentCloseConfirm: "确定要关闭此对话吗？",
    liveAgentCloseYes: "是",
    liveAgentCloseNo: "否",
  },
};

const CHAT_UI: Record<Locale, ChatUiBySite> = {
  en: {
    verveace: {
      title: "Support chat",
      placeholder: "Ask about BleeqUp, MGI, Motocaddy, shipping…",
      send: "Send",
      welcome:
        "Hi! I'm the VerveaceSports assistant. Ask me about BleeqUp Ranger, MGI & Motocaddy golf gear, shipping, returns, loyalty, or your account.",
      thinking: "Thinking…",
      error: "Something went wrong. Try again or email {{supportEmail}}.",
      open: "Open support chat",
      close: "Close support chat",
      unavailable: "Chat is temporarily unavailable. Email {{supportEmail}}.",
    },
    "bleeq-ca": {
      title: "Support chat",
      placeholder: "Ask about Ranger, CAD shipping, returns…",
      send: "Send",
      welcome:
        "Hi! I'm the BleeqUp Canada assistant. Ask me about Ranger glasses, Canadian shipping, CAD pricing, returns, loyalty, or your account.",
      thinking: "Thinking…",
      error: "Something went wrong. Try again or email {{supportEmail}}.",
      open: "Open support chat",
      close: "Close support chat",
      unavailable: "Chat is temporarily unavailable. Email {{supportEmail}}.",
    },
  },
  nl: {
    verveace: {
      title: "Supportchat",
      placeholder: "Vraag over BleeqUp, MGI, Motocaddy, verzending…",
      send: "Versturen",
      welcome:
        "Hoi! Ik ben de VerveaceSports-assistent. Stel vragen over BleeqUp Ranger, MGI & Motocaddy golfgear, verzending, retour, loyalty of je account.",
      thinking: "Bezig…",
      error: "Er ging iets mis. Probeer opnieuw of mail {{supportEmail}}.",
      open: "Supportchat openen",
      close: "Supportchat sluiten",
      unavailable: "Chat is tijdelijk niet beschikbaar. Mail {{supportEmail}}.",
    },
    "bleeq-ca": {
      title: "Supportchat",
      placeholder: "Vraag over Ranger, CAD-verzending, retour…",
      send: "Versturen",
      welcome:
        "Hoi! Ik ben de BleeqUp Canada-assistent. Stel vragen over Ranger-brillen, Canadese verzending, CAD-prijzen, retour, loyalty of je account.",
      thinking: "Bezig…",
      error: "Er ging iets mis. Probeer opnieuw of mail {{supportEmail}}.",
      open: "Supportchat openen",
      close: "Supportchat sluiten",
      unavailable: "Chat is tijdelijk niet beschikbaar. Mail {{supportEmail}}.",
    },
  },
  fr: {
    verveace: {
      title: "Chat d'assistance",
      placeholder: "Questions BleeqUp, MGI, Motocaddy, livraison…",
      send: "Envoyer",
      welcome:
        "Bonjour ! Je suis l'assistant VerveaceSports. Posez vos questions sur BleeqUp Ranger, le golf MGI & Motocaddy, la livraison, les retours, la fidélité ou votre compte.",
      thinking: "Réflexion…",
      error: "Une erreur s'est produite. Réessayez ou écrivez à {{supportEmail}}.",
      open: "Ouvrir le chat d'assistance",
      close: "Fermer le chat d'assistance",
      unavailable: "Le chat est temporairement indisponible. Écrivez à {{supportEmail}}.",
    },
    "bleeq-ca": {
      title: "Chat d'assistance",
      placeholder: "Questions Ranger, livraison CAD, retours…",
      send: "Envoyer",
      welcome:
        "Bonjour ! Je suis l'assistant BleeqUp Canada. Posez vos questions sur les lunettes Ranger, la livraison au Canada, les prix en CAD, les retours, la fidélité ou votre compte.",
      thinking: "Réflexion…",
      error: "Une erreur s'est produite. Réessayez ou écrivez à {{supportEmail}}.",
      open: "Ouvrir le chat d'assistance",
      close: "Fermer le chat d'assistance",
      unavailable: "Le chat est temporairement indisponible. Écrivez à {{supportEmail}}.",
    },
  },
  de: {
    verveace: {
      title: "Support-Chat",
      placeholder: "Fragen zu BleeqUp, MGI, Motocaddy, Versand…",
      send: "Senden",
      welcome:
        "Hallo! Ich bin der VerveaceSports-Assistent. Fragen Sie zu BleeqUp Ranger, MGI & Motocaddy Golf, Versand, Retouren, Treuepunkten oder Ihrem Konto.",
      thinking: "Denke nach…",
      error: "Etwas ist schiefgelaufen. Versuchen Sie es erneut oder mailen Sie {{supportEmail}}.",
      open: "Support-Chat öffnen",
      close: "Support-Chat schließen",
      unavailable: "Chat vorübergehend nicht verfügbar. Mail an {{supportEmail}}.",
    },
    "bleeq-ca": {
      title: "Support-Chat",
      placeholder: "Fragen zu Ranger, CAD-Versand, Retouren…",
      send: "Senden",
      welcome:
        "Hallo! Ich bin der BleeqUp Canada-Assistent. Fragen Sie zu Ranger-Brillen, kanadischem Versand, CAD-Preisen, Retouren, Treuepunkten oder Ihrem Konto.",
      thinking: "Denke nach…",
      error: "Etwas ist schiefgelaufen. Versuchen Sie es erneut oder mailen Sie {{supportEmail}}.",
      open: "Support-Chat öffnen",
      close: "Support-Chat schließen",
      unavailable: "Chat vorübergehend nicht verfügbar. Mail an {{supportEmail}}.",
    },
  },
  "pt-PT": {
    verveace: {
      title: "Chat de apoio",
      placeholder: "Pergunte sobre BleeqUp, MGI, Motocaddy, envio…",
      send: "Enviar",
      welcome:
        "Olá! Sou o assistente VerveaceSports. Pergunte sobre BleeqUp Ranger, golf MGI & Motocaddy, envio, devoluções, fidelização ou a sua conta.",
      thinking: "A pensar…",
      error: "Ocorreu um erro. Tente de novo ou escreva para {{supportEmail}}.",
      open: "Abrir chat de apoio",
      close: "Fechar chat de apoio",
      unavailable: "Chat temporariamente indisponível. Escreva para {{supportEmail}}.",
    },
    "bleeq-ca": {
      title: "Chat de apoio",
      placeholder: "Pergunte sobre Ranger, envio CAD, devoluções…",
      send: "Enviar",
      welcome:
        "Olá! Sou o assistente BleeqUp Canada. Pergunte sobre óculos Ranger, envio no Canadá, preços em CAD, devoluções, fidelização ou a sua conta.",
      thinking: "A pensar…",
      error: "Ocorreu um erro. Tente de novo ou escreva para {{supportEmail}}.",
      open: "Abrir chat de apoio",
      close: "Fechar chat de apoio",
      unavailable: "Chat temporariamente indisponível. Escreva para {{supportEmail}}.",
    },
  },
  es: {
    verveace: {
      title: "Chat de soporte",
      placeholder: "Pregunta sobre BleeqUp, MGI, Motocaddy, envíos…",
      send: "Enviar",
      welcome:
        "¡Hola! Soy el asistente de VerveaceSports. Pregunta sobre BleeqUp Ranger, golf MGI & Motocaddy, envíos, devoluciones, fidelidad o tu cuenta.",
      thinking: "Pensando…",
      error: "Algo salió mal. Inténtalo de nuevo o escribe a {{supportEmail}}.",
      open: "Abrir chat de soporte",
      close: "Cerrar chat de soporte",
      unavailable: "Chat temporalmente no disponible. Escribe a {{supportEmail}}.",
    },
    "bleeq-ca": {
      title: "Chat de soporte",
      placeholder: "Pregunta sobre Ranger, envío CAD, devoluciones…",
      send: "Enviar",
      welcome:
        "¡Hola! Soy el asistente de BleeqUp Canada. Pregunta sobre gafas Ranger, envíos en Canadá, precios en CAD, devoluciones, fidelidad o tu cuenta.",
      thinking: "Pensando…",
      error: "Algo salió mal. Inténtalo de nuevo o escribe a {{supportEmail}}.",
      open: "Abrir chat de soporte",
      close: "Cerrar chat de soporte",
      unavailable: "Chat temporalmente no disponible. Escribe a {{supportEmail}}.",
    },
  },
  it: {
    verveace: {
      title: "Chat di assistenza",
      placeholder: "Chiedi su BleeqUp, MGI, Motocaddy, spedizioni…",
      send: "Invia",
      welcome:
        "Ciao! Sono l'assistente VerveaceSports. Chiedi informazioni su BleeqUp Ranger, golf MGI & Motocaddy, spedizioni, resi, fedeltà o il tuo account.",
      thinking: "Sto pensando…",
      error: "Qualcosa è andato storto. Riprova o scrivi a {{supportEmail}}.",
      open: "Apri chat di assistenza",
      close: "Chiudi chat di assistenza",
      unavailable: "Chat temporaneamente non disponibile. Scrivi a {{supportEmail}}.",
    },
    "bleeq-ca": {
      title: "Chat di assistenza",
      placeholder: "Chiedi su Ranger, spedizioni CAD, resi…",
      send: "Invia",
      welcome:
        "Ciao! Sono l'assistente BleeqUp Canada. Chiedi informazioni su occhiali Ranger, spedizioni in Canada, prezzi in CAD, resi, fedeltà o il tuo account.",
      thinking: "Sto pensando…",
      error: "Qualcosa è andato storto. Riprova o scrivi a {{supportEmail}}.",
      open: "Apri chat di assistenza",
      close: "Chiudi chat di assistenza",
      unavailable: "Chat temporaneamente non disponibile. Scrivi a {{supportEmail}}.",
    },
  },
  ja: {
    verveace: {
      title: "サポートチャット",
      placeholder: "BleeqUp・MGI・Motocaddy・配送について…",
      send: "送信",
      welcome:
        "こんにちは。VerveaceSportsのアシスタントです。BleeqUp Ranger、MGI & Motocaddyのゴルフ用品、配送、返品、ロイヤルティ、アカウントについてお答えします。",
      thinking: "考え中…",
      error: "エラーが発生しました。再試行するか {{supportEmail}} までご連絡ください。",
      open: "サポートチャットを開く",
      close: "サポートチャットを閉じる",
      unavailable: "チャットは一時的に利用できません。{{supportEmail}} までご連絡ください。",
    },
    "bleeq-ca": {
      title: "サポートチャット",
      placeholder: "Ranger・カナダ配送・返品について…",
      send: "送信",
      welcome:
        "こんにちは。BleeqUp Canadaのアシスタントです。Rangerグラス、カナダ配送、CAD価格、返品、ロイヤルティ、アカウントについてお答えします。",
      thinking: "考え中…",
      error: "エラーが発生しました。再試行するか {{supportEmail}} までご連絡ください。",
      open: "サポートチャットを開く",
      close: "サポートチャットを閉じる",
      unavailable: "チャットは一時的に利用できません。{{supportEmail}} までご連絡ください。",
    },
  },
  "zh-CN": {
    verveace: {
      title: "支持聊天",
      placeholder: "询问 BleeqUp、MGI、Motocaddy、配送…",
      send: "发送",
      welcome:
        "您好！我是 VerveaceSports 助手。可解答 BleeqUp Ranger、MGI & Motocaddy 高尔夫、配送、退货、积分和账户相关问题。",
      thinking: "思考中…",
      error: "出错了。请重试或发送邮件至 {{supportEmail}}。",
      open: "打开支持聊天",
      close: "关闭支持聊天",
      unavailable: "聊天暂时不可用。请发送邮件至 {{supportEmail}}。",
    },
    "bleeq-ca": {
      title: "支持聊天",
      placeholder: "询问 Ranger、加拿大配送、退货…",
      send: "发送",
      welcome:
        "您好！我是 BleeqUp Canada 助手。可解答 Ranger 眼镜、加拿大配送、CAD 价格、退货、积分和账户相关问题。",
      thinking: "思考中…",
      error: "出错了。请重试或发送邮件至 {{supportEmail}}。",
      open: "打开支持聊天",
      close: "关闭支持聊天",
      unavailable: "聊天暂时不可用。请发送邮件至 {{supportEmail}}。",
    },
  },
};

const VOLT_CHAT: Record<Locale, Omit<ChatUiStrings, keyof LiveAgentUi>> = {
  en: {
    title: "Support chat",
    placeholder: "Ask about the Pro-S, shipping, returns…",
    send: "Send",
    welcome:
      "Hi! I'm the Volt Caddy assistant. Ask me about the Pro-S remote push cart, accessories, Canadian shipping, returns, or your account.",
    thinking: "Thinking…",
    error: "Something went wrong. Try again or email {{supportEmail}}.",
    open: "Open support chat",
    close: "Close support chat",
    unavailable: "Chat is temporarily unavailable. Email {{supportEmail}}.",
  },
  nl: {
    title: "Supportchat",
    placeholder: "Vraag over de Pro-S, verzending, retour…",
    send: "Versturen",
    welcome:
      "Hoi! Ik ben de Volt Caddy-assistent. Vraag me over de Pro-S, accessoires, verzending in Canada, retour of je account.",
    thinking: "Bezig met nadenken…",
    error: "Er ging iets mis. Probeer opnieuw of mail {{supportEmail}}.",
    open: "Open supportchat",
    close: "Sluit supportchat",
    unavailable: "Chat is tijdelijk niet beschikbaar. Mail {{supportEmail}}.",
  },
  fr: {
    title: "Chat d'assistance",
    placeholder: "Question sur le Pro-S, la livraison, les retours…",
    send: "Envoyer",
    welcome:
      "Bonjour ! Je suis l'assistant Volt Caddy. Posez vos questions sur le Pro-S, les accessoires, la livraison au Canada, les retours ou votre compte.",
    thinking: "Réflexion…",
    error: "Une erreur s'est produite. Réessayez ou écrivez à {{supportEmail}}.",
    open: "Ouvrir le chat",
    close: "Fermer le chat",
    unavailable: "Le chat est temporairement indisponible. Écrivez à {{supportEmail}}.",
  },
  de: {
    title: "Support-Chat",
    placeholder: "Frage zum Pro-S, Versand, Rückgabe…",
    send: "Senden",
    welcome:
      "Hallo! Ich bin der Volt-Caddy-Assistent. Fragen Sie mich zum Pro-S, Zubehör, Versand in Kanada, Rückgabe oder Ihrem Konto.",
    thinking: "Denke nach…",
    error: "Etwas ist schiefgelaufen. Erneut versuchen oder {{supportEmail}} schreiben.",
    open: "Support-Chat öffnen",
    close: "Support-Chat schließen",
    unavailable: "Der Chat ist vorübergehend nicht verfügbar. Schreiben Sie an {{supportEmail}}.",
  },
  "pt-PT": {
    title: "Chat de apoio",
    placeholder: "Pergunte sobre o Pro-S, envio, devoluções…",
    send: "Enviar",
    welcome:
      "Olá! Sou o assistente Volt Caddy. Pergunte sobre o Pro-S, acessórios, envio no Canadá, devoluções ou a sua conta.",
    thinking: "A pensar…",
    error: "Algo correu mal. Tente de novo ou escreva para {{supportEmail}}.",
    open: "Abrir chat",
    close: "Fechar chat",
    unavailable: "O chat está temporariamente indisponível. Escreva para {{supportEmail}}.",
  },
  es: {
    title: "Chat de soporte",
    placeholder: "Pregunta sobre el Pro-S, envío, devoluciones…",
    send: "Enviar",
    welcome:
      "Hola, soy el asistente de Volt Caddy. Pregúntame por el Pro-S, accesorios, envío en Canadá, devoluciones o tu cuenta.",
    thinking: "Pensando…",
    error: "Algo salió mal. Inténtalo de nuevo o escribe a {{supportEmail}}.",
    open: "Abrir chat",
    close: "Cerrar chat",
    unavailable: "El chat no está disponible temporalmente. Escribe a {{supportEmail}}.",
  },
  it: {
    title: "Chat di supporto",
    placeholder: "Chiedi del Pro-S, spedizione, resi…",
    send: "Invia",
    welcome:
      "Ciao! Sono l'assistente Volt Caddy. Chiedimi del Pro-S, degli accessori, della spedizione in Canada, dei resi o del tuo account.",
    thinking: "Sto pensando…",
    error: "Qualcosa è andato storto. Riprova o scrivi a {{supportEmail}}.",
    open: "Apri chat",
    close: "Chiudi chat",
    unavailable: "La chat è temporaneamente non disponibile. Scrivi a {{supportEmail}}.",
  },
  ja: {
    title: "サポートチャット",
    placeholder: "Pro-S、配送、返品について質問…",
    send: "送信",
    welcome:
      "こんにちは。Volt Caddyのアシスタントです。Pro-S、アクセサリー、カナダ国内配送、返品、アカウントについてご質問ください。",
    thinking: "考えています…",
    error: "問題が発生しました。再試行するか {{supportEmail}} までご連絡ください。",
    open: "サポートチャットを開く",
    close: "サポートチャットを閉じる",
    unavailable: "チャットは一時的に利用できません。{{supportEmail}} までご連絡ください。",
  },
  "zh-CN": {
    title: "支持聊天",
    placeholder: "询问 Pro-S、配送、退货…",
    send: "发送",
    welcome:
      "您好！我是 Volt Caddy 助手。可解答 Pro-S、配件、加拿大配送、退货和账户相关问题。",
    thinking: "思考中…",
    error: "出错了。请重试或发送邮件至 {{supportEmail}}。",
    open: "打开支持聊天",
    close: "关闭支持聊天",
    unavailable: "聊天暂时不可用。请发送邮件至 {{supportEmail}}。",
  },
};

export function chatUi(
  locale: Locale,
  supportEmail: string,
  siteId: SiteId = "verveace",
): ChatUiStrings {
  const base = siteId === "volt-ca" ? VOLT_CHAT[locale] : CHAT_UI[locale][siteId];
  const withEmail = (text: string) =>
    text.replaceAll("{{supportEmail}}", supportEmail);
  return {
    ...base,
    ...LIVE_UI[locale],
    error: withEmail(base.error),
    unavailable: withEmail(base.unavailable),
  };
}
