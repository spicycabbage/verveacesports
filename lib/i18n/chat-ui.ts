import type { Locale } from "@/lib/i18n/locale";

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

export const CHAT_UI: Record<Locale, ChatUiStrings> = {
  en: {
    title: "Support chat",
    placeholder: "Ask about orders, shipping, returns…",
    send: "Send",
    welcome:
      "Hi! I'm the VerveaceSports assistant. Ask me about shipping, returns, products, loyalty, or your account.",
    thinking: "Thinking…",
    error: "Something went wrong. Try again or email support@verveacesports.com.",
    open: "Open support chat",
    close: "Close support chat",
    unavailable: "Chat is temporarily unavailable. Email support@verveacesports.com.",
  },
  nl: {
    title: "Supportchat",
    placeholder: "Vraag over bestellingen, verzending, retour…",
    send: "Versturen",
    welcome:
      "Hoi! Ik ben de VerveaceSports-assistent. Stel vragen over verzending, retour, producten, loyalty of je account.",
    thinking: "Bezig…",
    error: "Er ging iets mis. Probeer opnieuw of mail support@verveacesports.com.",
    open: "Supportchat openen",
    close: "Supportchat sluiten",
    unavailable: "Chat is tijdelijk niet beschikbaar. Mail support@verveacesports.com.",
  },
  fr: {
    title: "Chat d'assistance",
    placeholder: "Questions sur commandes, livraison, retours…",
    send: "Envoyer",
    welcome:
      "Bonjour ! Je suis l'assistant VerveaceSports. Posez vos questions sur la livraison, les retours, les produits, la fidélité ou votre compte.",
    thinking: "Réflexion…",
    error: "Une erreur s'est produite. Réessayez ou écrivez à support@verveacesports.com.",
    open: "Ouvrir le chat d'assistance",
    close: "Fermer le chat d'assistance",
    unavailable: "Le chat est temporairement indisponible. Écrivez à support@verveacesports.com.",
  },
  de: {
    title: "Support-Chat",
    placeholder: "Fragen zu Bestellungen, Versand, Retouren…",
    send: "Senden",
    welcome:
      "Hallo! Ich bin der VerveaceSports-Assistent. Fragen Sie zu Versand, Retouren, Produkten, Treuepunkten oder Ihrem Konto.",
    thinking: "Denke nach…",
    error: "Etwas ist schiefgelaufen. Versuchen Sie es erneut oder mailen Sie support@verveacesports.com.",
    open: "Support-Chat öffnen",
    close: "Support-Chat schließen",
    unavailable: "Chat vorübergehend nicht verfügbar. Mail an support@verveacesports.com.",
  },
  "pt-PT": {
    title: "Chat de apoio",
    placeholder: "Pergunte sobre encomendas, envio, devoluções…",
    send: "Enviar",
    welcome:
      "Olá! Sou o assistente VerveaceSports. Pergunte sobre envio, devoluções, produtos, fidelização ou a sua conta.",
    thinking: "A pensar…",
    error: "Ocorreu um erro. Tente de novo ou escreva para support@verveacesports.com.",
    open: "Abrir chat de apoio",
    close: "Fechar chat de apoio",
    unavailable: "Chat temporariamente indisponível. Escreva para support@verveacesports.com.",
  },
  es: {
    title: "Chat de soporte",
    placeholder: "Pregunta sobre pedidos, envíos, devoluciones…",
    send: "Enviar",
    welcome:
      "¡Hola! Soy el asistente de VerveaceSports. Pregunta sobre envíos, devoluciones, productos, fidelidad o tu cuenta.",
    thinking: "Pensando…",
    error: "Algo salió mal. Inténtalo de nuevo o escribe a support@verveacesports.com.",
    open: "Abrir chat de soporte",
    close: "Cerrar chat de soporte",
    unavailable: "Chat temporalmente no disponible. Escribe a support@verveacesports.com.",
  },
  it: {
    title: "Chat di assistenza",
    placeholder: "Chiedi su ordini, spedizioni, resi…",
    send: "Invia",
    welcome:
      "Ciao! Sono l'assistente VerveaceSports. Chiedi informazioni su spedizioni, resi, prodotti, fedeltà o il tuo account.",
    thinking: "Sto pensando…",
    error: "Qualcosa è andato storto. Riprova o scrivi a support@verveacesports.com.",
    open: "Apri chat di assistenza",
    close: "Chiudi chat di assistenza",
    unavailable: "Chat temporaneamente non disponibile. Scrivi a support@verveacesports.com.",
  },
  ja: {
    title: "サポートチャット",
    placeholder: "注文・配送・返品について質問…",
    send: "送信",
    welcome:
      "こんにちは。VerveaceSportsのアシスタントです。配送、返品、商品、ロイヤルティ、アカウントについてお答えします。",
    thinking: "考え中…",
    error: "エラーが発生しました。再試行するか support@verveacesports.com までご連絡ください。",
    open: "サポートチャットを開く",
    close: "サポートチャットを閉じる",
    unavailable: "チャットは一時的に利用できません。support@verveacesports.com までご連絡ください。",
  },
  "zh-CN": {
    title: "支持聊天",
    placeholder: "询问订单、配送、退货…",
    send: "发送",
    welcome:
      "您好！我是 VerveaceSports 助手。可解答配送、退货、产品、积分和账户相关问题。",
    thinking: "思考中…",
    error: "出错了。请重试或发送邮件至 support@verveacesports.com。",
    open: "打开支持聊天",
    close: "关闭支持聊天",
    unavailable: "聊天暂时不可用。请发送邮件至 support@verveacesports.com。",
  },
};

export function chatUi(locale: Locale): ChatUiStrings {
  return CHAT_UI[locale];
}
