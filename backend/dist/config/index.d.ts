export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly supabase: {
        readonly url: string;
        readonly anonKey: string;
        readonly serviceRoleKey: string;
    };
    readonly redis: {
        readonly url: string;
    };
    readonly twilio: {
        readonly accountSid: string;
        readonly authToken: string;
        readonly phoneNumber: string;
    };
    readonly elevenlabs: {
        readonly apiKey: string;
    };
    readonly openai: {
        readonly apiKey: string;
    };
    readonly anthropic: {
        readonly apiKey: string;
    };
    readonly gemini: {
        readonly apiKey: string;
    };
    readonly deepseek: {
        readonly apiKey: string;
    };
    readonly stripe: {
        readonly secretKey: string;
        readonly webhookSecret: string;
    };
    readonly cors: {
        readonly origin: string;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: 100;
    };
};
//# sourceMappingURL=index.d.ts.map