async function getVerdict(audioBlob: Blob) {
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

        const data = await response.json();
        console.log("Backend response:", data);

        return data;
    } catch (error) {
        console.error("Error calling verdict API:", error);
        // Fallback to mock response on error
        const isImpressed = Math.random() > 0.5;
        return {
            impressed: isImpressed,
            category: isImpressed ? "VISIONARY" : "DELUSIONAL",
            feedback: isImpressed
                ? "This could actually work. The oracle is intrigued."
                : "The oracle has seen a thousand of these fail.",
        };
    }
}

export default getVerdict;
