
import { GoogleGenAI } from "@google/genai";
import { ContentConfig, TaskType } from "../types";

export const verifyLanguage = async (text: string, expectedLanguage: string): Promise<{ matches: boolean, detectedLanguage: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analizza il seguente testo e determina se è scritto in ${expectedLanguage}. 
  Rispondi esclusivamente in formato JSON: {"matches": boolean, "detectedLanguage": "nome della lingua rilevata in italiano"}.
  Se il testo è troppo corto per essere identificato con certezza, restituisci "matches": true.
  
  Testo: "${text.substring(0, 500)}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json" 
      },
    });
    
    const result = JSON.parse(response.text || '{"matches": true, "detectedLanguage": "sconosciuta"}');
    return result;
  } catch (error) {
    console.error("Errore verifica lingua:", error);
    return { matches: true, detectedLanguage: expectedLanguage }; 
  }
};

export const generateContent = async (config: ContentConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const taskDescription: Record<TaskType, string> = {
    [TaskType.ARTICLE_BLOG]: "un articolo approfondito o un blog post strutturato",
    [TaskType.AD_POST]: "un annuncio pubblicitario o un post per i social media",
    [TaskType.EMAIL]: "una e-mail professionale o promozionale",
    [TaskType.MESSAGE]: "un messaggio diretto, formale o informale",
    [TaskType.REWRITE]: "una riscrittura creativa o traduzione"
  };

  const prompt = `
    Agisci come un esperto traduttore e copywriter professionista.
    Il tuo compito è tradurre o riscrivere ${taskDescription[config.task]} partendo da un testo in lingua ${config.sourceLanguage} e portandolo in lingua ${config.targetLanguage}.
    
    Argomento/Testo sorgente: "${config.description}"

    Parametri richiesti:
    - Tono di voce: ${config.tone === 'Scelta AI' ? 'Mantenere lo spirito del testo originale o scegliere il più adatto' : config.tone}
    - Pubblico di riferimento: ${config.audience}
    - Lingua di PARTENZA: ${config.sourceLanguage}
    - Lingua di ARRIVO: ${config.targetLanguage}
    - Uso di emoji: ${config.useEmoji === 'Scelta AI' ? 'Usa emoji solo se appropriato al contesto' : config.useEmoji}

    REGOLE DI FORMATTAZIONE MANDATORIE:
    1. NON USARE MAI GLI ASTERISCHI (*). Non usarli né per il grassetto né per gli elenchi.
    2. Per evidenziare parole o titoli in GRASSETTO, usa esclusivamente il tag HTML <b> (es. <b>parola</b>).
    3. Inizia il testo IMMEDIATAMENTE con il contenuto tradotto/scritto.
    4. NON aggiungere introduzioni, saluti o preamboli di alcun tipo.
    5. Se devi fare elenchi, usa numeri o trattini semplici (-).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Cambiato in Flash per evitare 429 di quota Pro
      contents: prompt,
    });
    
    return response.text || "Spiacente, non è stato possibile generare il contenuto.";
  } catch (error: any) {
    console.error("Errore durante la generazione:", error);
    if (error?.message?.includes('429')) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    throw new Error("Errore durante la comunicazione con l'IA.");
  }
};
