const AUTH_URL = "http://20.244.56.144/evaluation-service/auth";
const LOGS_URL = "http://20.244.56.144/evaluation-service/logs";
const authPayload = {
    email: "aswathkannanm22it@psnacet.edu.in",
    name: "Aswath Kannan M",
    rollNo: "92132223022",
    accessCode: "rBPfSS",
    clientID: "d8c56328-6dd1-48fb-a62d-96326f518207",
    clientSecret: "ubhaKaaJGzHWsNvW"
};

async function getAuthToken() {
    const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authPayload)
    });
    const data = await res.json();
    return data.access_token;
}

async function log(stack, level, pkg, message) {
    try {
        const token = await getAuthToken();
        await fetch(LOGS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ stack, level, package: pkg, message })
        });
    } catch (err) {
        console.error("Logger API failed!", err);
    }
}

module.exports = { log };
