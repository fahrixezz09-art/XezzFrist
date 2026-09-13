// ==================================================
// XEZZFRIST — NETLIFY API
// Gemini + Tavily
// ==================================================


// ==================================================
// GEMINI
// ==================================================

const { GoogleGenAI } =
    require("@google/genai");


// ==================================================
// TAVILY
// ==================================================

const { tavily } =
    require("@tavily/core");


// ==================================================
// CLIENTS
// ==================================================

const ai =
    new GoogleGenAI({
        apiKey:
            process.env.GEMINI_API_KEY
    });


const tavilyClient =
    tavily({
        apiKey:
            process.env.TAVILY_API_KEY
    });


// ==================================================
// CORS
// ==================================================

const corsHeaders = {

    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Headers":
        "Content-Type",

    "Access-Control-Allow-Methods":
        "GET,POST,OPTIONS"

};


// ==================================================
// JSON RESPONSE
// ==================================================

function jsonResponse(
    statusCode,
    data
) {

    return {

        statusCode,

        headers: {
            ...corsHeaders,

            "Content-Type":
                "application/json"
        },

        body:
            JSON.stringify(data)

    };

}


// ==================================================
// CHAT API
// ==================================================

async function handleChat(
    body
) {

    const messages =
        Array.isArray(body?.messages)
            ? body.messages
            : [];


    if (messages.length === 0) {

        return jsonResponse(
            400,
            {
                error:
                    "Pesan tidak ditemukan."
            }
        );

    }


    // ------------------------------------------
    // LIMIT CONTEXT
    // ------------------------------------------

    const recentMessages =
        messages.slice(-20);


    // ------------------------------------------
    // BUILD CONVERSATION
    // ------------------------------------------

    const conversation =
        recentMessages
            .map((item) => {

                const role =
                    item.role === "assistant"
                        ? "Xezz AI"
                        : "User";


                const content =
                    String(
                        item.content || ""
                    );


                return (
                    `${role}: ${content}`
                );

            })
            .join("\n\n");


    // ------------------------------------------
    // GEMINI
    // ------------------------------------------

    const interaction =
        await ai.interactions.create({

            model:
                "gemini-3.6-flash",

            system_instruction:
                "Kamu adalah Xezz AI, asisten digital yang ramah, cerdas, jelas, dan mudah dipahami. " +
                "Jawablah dalam bahasa Indonesia kecuali pengguna meminta bahasa lain. " +
                "Gunakan konteks percakapan sebelumnya agar jawaban tetap nyambung. " +
                "Jangan mengaku sebagai manusia. " +
                "Kalau kamu tidak mengetahui sesuatu, katakan dengan jujur.",

            input:
                conversation

        });


    const reply =
        interaction.output_text ||
        "Maaf, Xezz AI tidak mendapatkan jawaban.";


    return jsonResponse(
        200,
        {
            reply: reply
        }
    );

}


// ==================================================
// SEARCH API
// ==================================================

async function handleSearch(
    body
) {

    const query =
        typeof body?.query === "string"
            ? body.query.trim()
            : "";


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!query) {

        return jsonResponse(
            400,
            {
                error:
                    "Query pencarian tidak ditemukan."
            }
        );

    }


    if (query.length > 300) {

        return jsonResponse(
            400,
            {
                error:
                    "Query terlalu panjang."
            }
        );

    }


    // ------------------------------------------
    // TAVILY
    // ------------------------------------------

    const response =
        await tavilyClient.search(
            query,
            {

                searchDepth:
                    "basic",

                maxResults:
                    8,

                includeAnswer:
                    false,

                includeImages:
                    false

            }
        );


    // ------------------------------------------
    // NORMALIZE RESULTS
    // ------------------------------------------

    const results =
        Array.isArray(
            response.results
        )
            ? response.results.map(
                (item) => ({

                    title:
                        item.title ||
                        "Untitled",

                    url:
                        item.url ||
                        "#",

                    content:
                        item.content ||
                        "",

                    score:
                        typeof item.score ===
                        "number"
                            ? item.score
                            : null

                })
            )
            : [];


    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return jsonResponse(
        200,
        {
            query:
                query,

            results:
                results

        }
    );

}


// ==================================================
// MAIN HANDLER
// ==================================================

exports.handler =
    async function (
        event
    ) {

        try {

            // ----------------------------------
            // OPTIONS / PREFLIGHT
            // ----------------------------------

            if (
                event.httpMethod ===
                "OPTIONS"
            ) {

                return {
                    statusCode: 204,

                    headers:
                        corsHeaders,

                    body: ""
                };

            }


            // ----------------------------------
            // METHOD CHECK
            // ----------------------------------

            if (
                event.httpMethod !==
                    "POST"
            ) {

                return jsonResponse(
                    405,
                    {
                        error:
                            "Method tidak diizinkan."
                    }
                );

            }


            // ----------------------------------
            // PARSE BODY
            // ----------------------------------

            let body = {};

            try {

                body =
                    event.body
                        ? JSON.parse(
                            event.body
                        )
                        : {};

            } catch {

                return jsonResponse(
                    400,
                    {
                        error:
                            "Format JSON tidak valid."
                    }
                );

            }


            // ----------------------------------
            // DETECT ROUTE
            // ----------------------------------

            const path =
                String(
                    event.path || ""
                ).toLowerCase();


            // ----------------------------------
            // CHAT
            // ----------------------------------

            if (
                path.endsWith(
                    "/chat"
                )
            ) {

                return await handleChat(
                    body
                );

            }


            // ----------------------------------
            // SEARCH
            // ----------------------------------

            if (
                path.endsWith(
                    "/search"
                )
            ) {

                return await handleSearch(
                    body
                );

            }


            // ----------------------------------
            // UNKNOWN ROUTE
            // ----------------------------------

            return jsonResponse(
                404,
                {
                    error:
                        "API route tidak ditemukan."
                }
            );


        } catch (error) {

            console.error(
                "XEZZFRIST NETLIFY API ERROR:",
                error
            );


            return jsonResponse(
                500,
                {
                    error:
                        error?.message ||
                        "Terjadi kesalahan pada server."
                }
            );

        }

    };