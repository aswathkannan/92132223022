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

   
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const exp = tokenPayload.exp * 1000; // Convert to ms

  
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

