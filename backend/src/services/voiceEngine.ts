import { config } from '../config';

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
  statusCallbackUrl: string;
  recordingEnabled: boolean;
  voicemailDetection: boolean;
  timeout: number;
}

const LANGUAGE_VOICES: Record<string, string> = {
  en: 'EXAVITQu4vr4xnSDxMaL', // ElevenLabs default English voice
  hi: 'hindi_voice_id',
  kn: 'kannada_voice_id',
  ta: 'tamil_voice_id',
  te: 'telugu_voice_id',
};

export class VoiceEngine {
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private elevenlabsApiKey: string;

  constructor() {
    this.twilioAccountSid = config.twilio.accountSid;
    this.twilioAuthToken = config.twilio.authToken;
    this.elevenlabsApiKey = config.elevenlabs.apiKey;
  }

  async initiateCall(callConfig: CallConfig): Promise<{ callSid: string; status: string }> {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      return { callSid: 'demo_' + Date.now(), status: 'demo_mode' };
    }

    const twilio = await import('twilio');
    const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);

    const call = await client.calls.create({
      to: callConfig.to,
      from: callConfig.from,
      url: callConfig.webhookUrl,
      record: callConfig.recordingEnabled,
      machineDetection: callConfig.voicemailDetection ? 'Enable' : 'DetectMessageEnd',
      timeout: callConfig.timeout,
      statusCallback: callConfig.statusCallbackUrl,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    return {
      callSid: call.sid,
      status: call.status,
    };
  }

  async synthesizeSpeech(
    text: string,
    voiceConfig: VoiceConfig
  ): Promise<Buffer> {
    if (!this.elevenlabsApiKey) {
      return Buffer.from('demo_audio');
    }

    const voiceId = voiceConfig.voiceId || LANGUAGE_VOICES[voiceConfig.language] || LANGUAGE_VOICES['en'];

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
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
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async endCall(callSid: string): Promise<void> {
    if (!this.twilioAccountSid || !this.twilioAuthToken || callSid.startsWith('demo_')) {
      return;
    }

    const twilio = await import('twilio');
    const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);

    await client.calls(callSid).update({ status: 'completed' });
  }

  async transferCall(callSid: string, targetNumber: string): Promise<void> {
    if (!this.twilioAccountSid || !this.twilioAuthToken || callSid.startsWith('demo_')) {
      return;
    }

    const twilio = await import('twilio');
    const client = twilio.default(this.twilioAccountSid, this.twilioAuthToken);

    await client.calls(callSid).update({
      twiml: `<Response><Dial>${targetNumber}</Dial></Response>`,
    });
  }

  getDefaultVoiceForLanguage(language: string): string {
    return LANGUAGE_VOICES[language] || LANGUAGE_VOICES['en'];
  }

  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
    ];
  }
}

export const voiceEngine = new VoiceEngine();
