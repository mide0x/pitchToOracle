/**
 * 
 * VISIONARY and DELUSIONAL describe the quality of the user's idea.
 * 
 * GARBAGE handles cases where user doesn't follow instructions:
 * - blank/silent recordings
 * - unrelated rambling
 * - forgot they started recording
 * - any input that isn't a startup idea
 */
export type VerdictType = "VISIONARY" | "DELUSIONAL" | "GARBAGE";

export interface Verdict {
    type: VerdictType;
    message: string;
}

// if api interface changes, this should change accordingly
interface VerdictApiResponse {
    success: boolean,
    debug?: object,
    transcriptionResult?: {
        verdictType: VerdictType | null,
        verdictText: string | null
    };
}

async function getVerdict(audioBlob: Blob): Promise<Verdict | null> {
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

        const data: VerdictApiResponse = await response.json();
        console.log("Backend response:", data);

        const { transcriptionResult } = data;

        if (
            !transcriptionResult || 
            !transcriptionResult.verdictText || 
            !transcriptionResult.verdictType
        ) {
            throw new Error(
                `error occurred, see: ${data.debug}`
            )
        }

        return {
            type: transcriptionResult.verdictType,
            message: transcriptionResult.verdictText,
        };
    } catch (error) {
        console.error("Error calling verdict API:", error);

        return null;
    }
}

export default getVerdict;
