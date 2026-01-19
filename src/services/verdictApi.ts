export type VerdictType = "VISIONARY" | "DELUSIONAL";

export interface Verdict {
    type: VerdictType;
    message: string;
}

async function getVerdict(audioBlob: Blob): Promise<Verdict> {
    try {
        // Check if audio is below 10MB
        const maxSize = 10 * 1024 * 1024;
        if (audioBlob.size > maxSize) {
            console.error("Audio file is too large:", audioBlob.size, "bytes");
            throw new Error("Audio file must be below 10MB");
        }

        console.log("Sending audio to backend, size:", audioBlob.size, "bytes");

        const response = await fetch(
            "https://is-api-jywq.onrender.com/api/idea/audio",
            {
                method: "POST",
                body: audioBlob,
                headers: {
                    "Content-Type": "audio/webm",
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status} ${response.statusText}`
            );
        }

        // TODO should be standard on what the api returns
        // for now, a boolean flag, `success`
        // and the verdict, `message`
        // seems like the final report requires a header, currently, it's visionary or delusional
        // i'd tweak the api to return a header too..
        const data = await response.json();
        console.log("Backend response:", data);

        return {
            type: "VISIONARY", // TODO remove this after tweaking API
            message: data.message,
        };
    } catch (error) {
        console.error("Error calling verdict API:", error);

        return {
            type: "VISIONARY", // TODO remove this after tweaking API
            message: "i'm not feeling well today",
        };
    }
}

export default getVerdict;
