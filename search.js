// ==================================================
// XEZZFRIST — WEB SEARCH
// ==================================================


// ==================================================
// ELEMENTS
// ==================================================

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const searchStatus =
    document.getElementById("searchStatus");

const searchLoading =
    document.getElementById("searchLoading");

const searchResults =
    document.getElementById("searchResults");

const searchEmpty =
    document.getElementById("searchEmpty");


// ==================================================
// SEARCH FUNCTION
// ==================================================

async function performSearch() {

    if (!searchInput) {
        return;
    }


    const query =
        searchInput.value.trim();


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (query === "") {

        searchInput.focus();

        updateStatus(
            "Masukkan kata kunci pencarian terlebih dahulu."
        );

        return;
    }


    // ------------------------------------------
    // PREPARE UI
    // ------------------------------------------

    setLoading(true);

    clearResults();

    updateStatus(
        `Mencari informasi untuk "${query}"...`
    );


    try {

        // --------------------------------------
        // REQUEST TO BACKEND
        // --------------------------------------

        const response =
            await fetch(
                "/api/search",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        query: query
                    })
                }
            );


        // --------------------------------------
        // READ RESPONSE
        // --------------------------------------

        const data =
            await response.json();


        // --------------------------------------
        // SERVER ERROR
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                data?.error ||
                "Terjadi kesalahan saat melakukan pencarian."
            );

        }


        // --------------------------------------
        // RESULTS
        // --------------------------------------

        const results =
            Array.isArray(data.results)
                ? data.results
                : [];


        // --------------------------------------
        // EMPTY RESULT
        // --------------------------------------

        if (results.length === 0) {

            setLoading(false);

            showEmptyState();

            updateStatus(
                `Tidak ada hasil untuk "${query}".`
            );

            return;
        }


        // --------------------------------------
        // SHOW RESULTS
        // --------------------------------------

        setLoading(false);

        renderResults(results);

        updateStatus(
            `${results.length} hasil ditemukan untuk "${query}"`
        );


    } catch (error) {

        console.error(
            "SEARCH ERROR:",
            error
        );


        setLoading(false);

        showError(
            error?.message ||
            "Terjadi kesalahan saat melakukan pencarian."
        );

        updateStatus(
            "Pencarian gagal."
        );

    }

}


// ==================================================
// RENDER RESULTS
// ==================================================

function renderResults(results) {

    if (!searchResults) {
        return;
    }


    searchResults.innerHTML = "";


    results.forEach(
        (result, index) => {

            const card =
                document.createElement("a");


            card.className =
                "result-card";


            card.href =
                result.url || "#";


            card.target =
                "_blank";


            card.rel =
                "noopener noreferrer";


            // ----------------------------------
            // TITLE
            // ----------------------------------

            const title =
                document.createElement("h2");

            title.className =
                "result-title";

            title.textContent =
                result.title ||
                "Untitled";


            // ----------------------------------
            // URL
            // ----------------------------------

            const url =
                document.createElement("div");

            url.className =
                "result-url";

            url.textContent =
                formatUrl(
                    result.url
                );


            // ----------------------------------
            // CONTENT
            // ----------------------------------

            const content =
                document.createElement("p");

            content.className =
                "result-content";

            content.textContent =
                result.content ||
                "Tidak ada ringkasan yang tersedia.";


            // ----------------------------------
            // META
            // ----------------------------------

            const meta =
                document.createElement("div");

            meta.className =
                "result-meta";


            const badge =
                document.createElement("span");

            badge.className =
                "result-badge";

            badge.textContent =
                `Result ${index + 1}`;


            meta.appendChild(
                badge
            );


            // ----------------------------------
            // APPEND
            // ----------------------------------

            card.appendChild(
                title
            );

            card.appendChild(
                url
            );

            card.appendChild(
                content
            );

            card.appendChild(
                meta
            );


            searchResults.appendChild(
                card
            );

        }
    );


    // ------------------------------------------
    // HIDE EMPTY STATE
    // ------------------------------------------

    if (searchEmpty) {

        searchEmpty.style.display =
            "none";

    }

}


// ==================================================
// FORMAT URL
// ==================================================

function formatUrl(url) {

    if (!url) {
        return "";
    }


    try {

        const parsedUrl =
            new URL(url);


        return parsedUrl.hostname +
            parsedUrl.pathname;

    } catch {

        return url;

    }

}


// ==================================================
// CLEAR RESULTS
// ==================================================

function clearResults() {

    if (searchResults) {

        searchResults.innerHTML =
            "";

    }


    if (searchEmpty) {

        searchEmpty.style.display =
            "none";

    }

}


// ==================================================
// EMPTY STATE
// ==================================================

function showEmptyState() {

    if (!searchEmpty) {
        return;
    }


    searchEmpty.style.display =
        "flex";

}


// ==================================================
// ERROR STATE
// ==================================================

function showError(message) {

    if (!searchResults) {
        return;
    }


    searchResults.innerHTML =
        "";


    const errorBox =
        document.createElement("div");


    errorBox.className =
        "search-error";


    const title =
        document.createElement("strong");


    title.textContent =
        "Pencarian gagal";


    const text =
        document.createElement("span");


    text.textContent =
        message;


    errorBox.appendChild(
        title
    );

    errorBox.appendChild(
        text
    );


    searchResults.appendChild(
        errorBox
    );


    if (searchEmpty) {

        searchEmpty.style.display =
            "none";

    }

}


// ==================================================
// LOADING STATE
// ==================================================

function setLoading(isLoading) {

    if (!searchLoading) {
        return;
    }


    if (isLoading) {

        searchLoading.classList.remove(
            "hidden"
        );

    } else {

        searchLoading.classList.add(
            "hidden"
        );

    }


    if (isLoading && searchEmpty) {

        searchEmpty.style.display =
            "none";

    }

}


// ==================================================
// STATUS
// ==================================================

function updateStatus(message) {

    if (!searchStatus) {
        return;
    }


    searchStatus.textContent =
        message;

}


// ==================================================
// URL QUERY
// ==================================================

function getQueryFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("q") || ""
    ).trim();

}


// ==================================================
// SEARCH FROM URL
// ==================================================

function searchFromURL() {

    if (!searchInput) {
        return;
    }


    const query =
        getQueryFromURL();


    if (!query) {
        return;
    }


    searchInput.value =
        query;


    performSearch();

}


// ==================================================
// ENTER KEY
// ==================================================

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                performSearch();

            }

        }
    );

}


// ==================================================
// SEARCH BUTTON
// ==================================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        performSearch
    );

}


// ==================================================
// PAGE READY
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "XezzFrist Web Search loaded."
        );


        const query =
            getQueryFromURL();


        if (query) {

            searchFromURL();

        } else if (searchInput) {

            searchInput.focus();

        }

    }
);