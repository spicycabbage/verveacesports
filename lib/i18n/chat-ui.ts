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
};

type ChatUiBySite = {
  verveace: ChatUiStrings;
  "bleeq-ca": ChatUiStrings;
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

export function chatUi(
  locale: Locale,
  supportEmail: string,
  siteId: SiteId = "verveace",
): ChatUiStrings {
  const base = CHAT_UI[locale][siteId];
  const withEmail = (text: string) =>
    text.replaceAll("{{supportEmail}}", supportEmail);
  return {
    ...base,
    error: withEmail(base.error),
    unavailable: withEmail(base.unavailable),
  };
}
