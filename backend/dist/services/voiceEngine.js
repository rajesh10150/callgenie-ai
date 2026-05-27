"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceEngine = exports.VoiceEngine = void 0;
const config_1 = require("../config");
const LANGUAGE_VOICES = {
    en: 'EXAVITQu4vr4xnSDxMaL', // ElevenLabs default English voice
    hi: 'hindi_voice_id',
    kn: 'kannada_voice_id',
    ta: 'tamil_voice_id',
    te: 'telugu_voice_id',
};
class VoiceEngine {
    twilioAccountSid;
    twilioAuthToken;
    elevenlabsApiKey;
    constructor() {
        this.twilioAccountSid = config_1.config.twilio.accountSid;
        this.twilioAuthToken = config_1.config.twilio.authToken;
        this.elevenlabsApiKey = config_1.config.elevenlabs.apiKey;
    }
    async initiateCall(callConfig) {
        if (!this.twilioAccountSid || !this.twilioAuthToken) {
            return { callSid: 'demo_' + Date.now(), status: 'demo_mode' };
        }
        const twilio = await Promise.resolve().then(() => __importStar(require('twilio')));
        const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);
        const call = await client.calls.create({
            to: callConfig.to,
            from: callConfig.from,
            url: callConfig.webhookUrl,
            record: callConfig.recordingEnabled,
            machineDetection: callConfig.voicemailDetection ? 'Enable' : 'DetectMessageEnd',
            timeout: callConfig.timeout,
            statusCallback: `${callConfig.webhookUrl}/status`,
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        });
        return {
            callSid: call.sid,
            status: call.status,
        };
    }
    async synthesizeSpeech(text, voiceConfig) {
        if (!this.elevenlabsApiKey) {
            return Buffer.from('demo_audio');
        }
        const voiceId = voiceConfig.voiceId || LANGUAGE_VOICES[voiceConfig.language] || LANGUAGE_VOICES['en'];
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': this.elevenlabsApiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: voiceConfig.stability || 0.5,
                    similarity_boost: voiceConfig.similarityBoost || 0.75,
                    speed: voiceConfig.speed || 1.0,
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    async endCall(callSid) {
        if (!this.twilioAccountSid || !this.twilioAuthToken || callSid.startsWith('demo_')) {
            return;
        }
        const twilio = await Promise.resolve().then(() => __importStar(require('twilio')));
        const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);
        await client.calls(callSid).update({ status: 'completed' });
    }
    async transferCall(callSid, targetNumber) {
        if (!this.twilioAccountSid || !this.twilioAuthToken || callSid.startsWith('demo_')) {
            return;
        }
        const twilio = await Promise.resolve().then(() => __importStar(require('twilio')));
        const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);
        await client.calls(callSid).update({
            twiml: `<Response><Dial>${targetNumber}</Dial></Response>`,
        });
    }
    getDefaultVoiceForLanguage(language) {
        return LANGUAGE_VOICES[language] || LANGUAGE_VOICES['en'];
    }
    getSupportedLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'Hindi' },
            { code: 'kn', name: 'Kannada' },
            { code: 'ta', name: 'Tamil' },
            { code: 'te', name: 'Telugu' },
        ];
    }
}
exports.VoiceEngine = VoiceEngine;
exports.voiceEngine = new VoiceEngine();
//# sourceMappingURL=voiceEngine.js.map