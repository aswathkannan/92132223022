const AUTH_URL = "http://20.244.56.144/evaluation-service/auth";
const LOGS_URL = "http://20.244.56.144/evaluation-service/logs";

const authPayload = {
    email: "mohamedakrams22it@psnacet.edu.in",
    name: "Mohamed Akram",
    rollNo: "92132223091",
    accessCode: "rBPfSS",
    clientID: "c5a4d2bc-958b-43d6-b6cc-105bf682bced",
    clientSecret: "ZkKJfZCJYgUMyMEu"
};

async function getAuthToken(): Promise<string> {
    const cachedToken = localStorage.getItem("affordmed_token");
    const expiry = localStorage.getItem("affordmed_token_expiry");

    if (cachedToken && expiry && Date.now() < Number(expiry)) {
        return cachedToken; // Return cached token if valid
    }

    const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authPayload)
    });

    if (!response.ok) throw new Error("Authentication failed!");

    const data = await response.json();
    const token = data.access_token;

    // Extract expiry from JWT payload
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const exp = tokenPayload.exp * 1000; // Convert to ms

    // Save token and expiry in localStorage
    localStorage.setItem("affordmed_token", token);
    localStorage.setItem("affordmed_token_expiry", exp.toString());

    return token;
}

export async function log(stack: string, level: string, pkg: string, message: string): Promise<void> {
    try {
        const token = await getAuthToken();

        const logPayload = { stack, level, package: pkg, message };

        const logResponse = await fetch(LOGS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(logPayload)
        });

        if (!logResponse.ok) throw new Error("Log submission failed!");

        const logData = await logResponse.json();
        console.log("Log Created Successfully:", logData);

    } catch (error) {
        console.error("Logger Error:", error);
    }
}

