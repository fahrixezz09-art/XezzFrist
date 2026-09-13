require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const { tavily } = require("@tavily/core");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// ===============================
// GEMINI
// ===============================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ===============================
// TAVILY
// ===============================

const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY
});


// ===============================
// CHAT API
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const messages = Array.isArray(req.body.messages)
            ? req.body.messages
            : [];

        if (messages.length === 0) {

            return res.status(400).json({
                error: "Pesan tidak ditemukan."
            });

        }


        // Batasi riwayat agar request tidak membesar terus
        const recentMessages = messages.slice(-20);


        // Gabungkan percakapan menjadi context
        const conversation = recentMessages
            .map((item) => {

                const role =
                    item.role === "assistant"
                        ? "Xezz AI"
                        : "User";

                const content =
                    String(item.content || "");

                return `${role}: ${content}`;

            })
            .join("\n\n");


        // Panggil Gemini
        const interaction =
            await ai.interactions.create({

                model: "gemini-3.6-flash",

                system_instruction:
                    "Kamu adalah Xezz AI, asisten digital yang ramah, cerdas, jelas, dan mudah dipahami. " +
                    "Jawablah dalam bahasa Indonesia kecuali pengguna meminta bahasa lain. " +
                    "Gunakan konteks percakapan sebelumnya agar jawaban tetap nyambung. " +
                    "Jangan mengaku sebagai manusia. " +
                    "Kalau kamu tidak mengetahui sesuatu, katakan dengan jujur.",

                input: conversation

            });


        const reply =
            interaction.output_text ||
            "Maaf, Xezz AI tidak mendapatkan jawaban.";


        res.json({
            reply: reply
        });


    } catch (error) {

        console.error(
            "ERROR GEMINI:",
            error
        );


        res.status(500).json({

            error:
                error?.message ||
                "Terjadi kesalahan saat menghubungi Gemini API."

        });

    }

});


// ===============================
// WEB SEARCH API
// ===============================

app.post("/api/search", async (req, res) => {

    try {

        const query =
            typeof req.body.query === "string"
                ? req.body.query.trim()
                : "";


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (!query) {

            return res.status(400).json({
                error: "Query pencarian tidak ditemukan."
            });

        }


        if (query.length > 300) {

            return res.status(400).json({
                error: "Query terlalu panjang."
            });

        }


        // ------------------------------------------
        // TAVILY SEARCH
        // ------------------------------------------

        const response =
            await tavilyClient.search(query, {

                searchDepth: "basic",

                maxResults: 8,

                includeAnswer: false,

                includeImages: false

            });


        // ------------------------------------------
        // NORMALIZE RESULTS
        // ------------------------------------------

        const results =
            Array.isArray(response.results)
                ? response.results.map((item) => ({

                    title:
                        item.title || "Untitled",

                    url:
                        item.url || "#",

                    content:
                        item.content || "",

                    score:
                        typeof item.score === "number"
                            ? item.score
                            : null

                }))
                : [];


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        res.json({

            query: query,

            results: results

        });


    } catch (error) {

        console.error(
            "ERROR TAVILY:",
            error
        );


        res.status(500).json({

            error:
                error?.message ||
                "Terjadi kesalahan saat melakukan web search."

        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("🚀 XezzFrist berhasil dijalankan!");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🤖 Chat  : http://localhost:${PORT}/api/chat`);
    console.log(`🔎 Search: http://localhost:${PORT}/api/search`);
    console.log("🧠 AI    : Gemini 3.6 Flash");
    console.log("🌐 Web Search : Tavily");
    console.log("💬 Context memory : ON");
    console.log("=================================");

});