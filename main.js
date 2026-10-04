import "dotenv/config";
import { RodiumAI } from "rodiumai";
import fs from "fs";
import readline from "readline";

const client = new RodiumAI({
  apiKey: process.env.RODIUMAI_API_KEY
});

const CHAT_MODEL = "openai/gpt-4o";
const IMAGE_MODEL = "openai/gpt-image-1";
const VIDEO_MODEL = "google/veo-3.1-lite";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(text) {
  return new Promise((resolve) => {
    rl.question(text, resolve);
  });
}


// =========================
// ÉTAPE 1 : CHAT
// =========================

async function chatStep() {
  while (true) {
    console.log("\n==============================");
    console.log("ÉTAPE 1 : CHAT");
    console.log("==============================");

    const prompt = await question(
      "\nEntre ton message (ou 'next' pour continuer) : "
    );

    if (prompt.toLowerCase() === "next") {
      return "next";
    }

    if (!prompt.trim()) {
      console.log("Le message ne peut pas être vide.");
      continue;
    }

    try {
      const response = await client.chat(prompt, {
        model: CHAT_MODEL
      });

      console.log("\nRéponse :");
      console.log(response.choices[0].message.content);

      const action = await question(
        "\nTape 'repeat' pour recommencer ou 'next' pour continuer : "
      );

      if (action.toLowerCase() === "next") {
        return "next";
      }

    } catch (error) {
      console.log("\nErreur :", error.message);

      const action = await question(
        "\nTape 'repeat' pour réessayer ou 'next' pour continuer : "
      );

      if (action.toLowerCase() === "next") {
        return "next";
      }
    }
  }
}


// =========================
// ÉTAPE 2 : IMAGE
// =========================

async function imageStep() {
  while (true) {
    console.log("\n==============================");
    console.log("ÉTAPE 2 : IMAGE");
    console.log("==============================");

    const prompt = await question(
      "\nDécris l'image à générer\n" +
      "(ou 'back' pour revenir à l'étape précédente) : "
    );

    if (prompt.toLowerCase() === "back") {
      return "back";
    }

    if (!prompt.trim()) {
      console.log("La description ne peut pas être vide.");
      continue;
    }

    try {
      console.log("\nGénération de l'image...");

      const response = await client.images({
        model: IMAGE_MODEL,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "medium"
      });

      const base64Image = response.data[0].b64_json;

      fs.writeFileSync(
        "image.png",
        Buffer.from(base64Image, "base64")
      );

      console.log("\nImage générée avec succès.");
      console.log("Fichier enregistré : image.png");

      const action = await question(
        "\nTape 'repeat' pour recommencer,\n" +
        "'next' pour continuer,\n" +
        "'back' pour revenir : "
      );

      if (action.toLowerCase() === "next") {
        return "next";
      }

      if (action.toLowerCase() === "back") {
        return "back";
      }

    } catch (error) {
      console.log("\nErreur :", error.message);

      const action = await question(
        "\nTape 'repeat' pour réessayer,\n" +
        "'next' pour continuer,\n" +
        "'back' pour revenir : "
      );

      if (action.toLowerCase() === "next") {
        return "next";
      }

      if (action.toLowerCase() === "back") {
        return "back";
      }
    }
  }
}


// =========================
// ÉTAPE 3 : VIDÉO
// =========================

async function videoStep() {
  while (true) {
    console.log("\n==============================");
    console.log("ÉTAPE 3 : VIDÉO");
    console.log("==============================");

    const prompt = await question(
      "\nDécris la vidéo à générer\n" +
      "(ou 'back' pour revenir à l'étape précédente) : "
    );

    if (prompt.toLowerCase() === "back") {
      return "back";
    }

    if (!prompt.trim()) {
      console.log("La description ne peut pas être vide.");
      continue;
    }

    try {
      console.log("\nGénération de la vidéo...");
      console.log("Cela peut prendre un peu de temps.");

      const response = await client.videos({
        model: VIDEO_MODEL,
        prompt: prompt,
        duration_seconds: 4
      });

      const base64Video = response.data[0].b64_json;

      fs.writeFileSync(
        "video.mp4",
        Buffer.from(base64Video, "base64")
      );

      console.log("\nVidéo générée avec succès.");
      console.log("Fichier enregistré : video.mp4");

      const action = await question(
        "\nTape 'repeat' pour recommencer,\n" +
        "'quit' pour terminer : "
      );

      if (action.toLowerCase() === "quit") {
        return "quit";
      }

    } catch (error) {
      console.log("\nErreur :", error.message);

      const action = await question(
        "\nTape 'repeat' pour réessayer,\n" +
        "'quit' pour terminer : "
      );

      if (action.toLowerCase() === "quit") {
        return "quit";
      }
    }
  }
}


// =========================
// PROGRAMME PRINCIPAL
// =========================

async function main() {
  console.log("=================================");
  console.log("       PROJET RODIUMAI");
  console.log("=================================");

  if (!process.env.RODIUMAI_API_KEY) {
    console.log(
      "\nErreur : RODIUMAI_API_KEY est introuvable dans le fichier .env"
    );

    rl.close();
    return;
  }

  let step = 1;

  while (true) {

    // ÉTAPE 1
    if (step === 1) {
      const result = await chatStep();

      if (result === "next") {
        step = 2;
      }
    }

    // ÉTAPE 2
    else if (step === 2) {
      const result = await imageStep();

      if (result === "next") {
        step = 3;
      }

      else if (result === "back") {
        step = 1;
      }
    }

    // ÉTAPE 3
    else if (step === 3) {
      const result = await videoStep();

      if (result === "back") {
        step = 2;
      }

      else if (result === "quit") {
        break;
      }
    }
  }

  rl.close();

  console.log("\n=================================");
  console.log("Programme terminé.");
  console.log("=================================");
}

main();