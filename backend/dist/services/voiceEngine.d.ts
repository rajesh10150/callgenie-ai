interface VoiceConfig {
    voiceId: string;
    language: string;
    stability: number;
    similarityBoost: number;
    speed: number;
}
interface CallConfig {
    to: string;
    from: string;
    webhookUrl: string;
    recordingEnabled: boolean;
    voicemailDetection: boolean;
    timeout: number;
}
export declare class VoiceEngine {
    private twilioAccountSid;
    private twilioAuthToken;
    private elevenlabsApiKey;
    constructor();
    initiateCall(callConfig: CallConfig): Promise<{
        callSid: string;
        status: string;
    }>;
    synthesizeSpeech(text: string, voiceConfig: VoiceConfig): Promise<Buffer>;
    endCall(callSid: string): Promise<void>;
    transferCall(callSid: string, targetNumber: string): Promise<void>;
    getDefaultVoiceForLanguage(language: string): string;
    getSupportedLanguages(): Array<{
        code: string;
        name: string;
    }>;
}
export declare const voiceEngine: VoiceEngine;
export {};
//# sourceMappingURL=voiceEngine.d.ts.map