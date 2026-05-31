const callsCreate = jest.fn();
const callsUpdate = jest.fn();
const callsFn = Object.assign(jest.fn(() => ({ update: callsUpdate })), { create: callsCreate });
const twilioDefault = jest.fn((..._a: unknown[]) => ({ calls: callsFn }));

jest.mock('twilio', () => ({ __esModule: true, default: (...a: unknown[]) => twilioDefault(...(a as [string, string])) }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadEngine(env: Record<string, string>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let VoiceEngine: any;
  jest.isolateModules(() => {
    process.env.TWILIO_ACCOUNT_SID = env.TWILIO_ACCOUNT_SID ?? '';
    process.env.TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN ?? '';
    process.env.ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY ?? '';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    VoiceEngine = require('../../../src/services/voiceEngine').VoiceEngine;
  });
  return new VoiceEngine();
}

const realCreds = { TWILIO_ACCOUNT_SID: 'ACx', TWILIO_AUTH_TOKEN: 'tok' };

describe('services/voiceEngine', () => {
  const callConfig = {
    to: '+1999', from: '+1888', webhookUrl: 'http://w', statusCallbackUrl: 'http://s',
    recordingEnabled: true, voicemailDetection: true, timeout: 30,
  };

  describe('initiateCall', () => {
    it('returns demo mode when Twilio is not configured', async () => {
      const engine = loadEngine({});
      const res = await engine.initiateCall(callConfig);
      expect(res.status).toBe('demo_mode');
      expect(res.callSid).toMatch(/^demo_/);
    });

    it('places a real call when configured', async () => {
      callsCreate.mockResolvedValue({ sid: 'CA1', status: 'queued' });
      const engine = loadEngine(realCreds);
      const res = await engine.initiateCall(callConfig);
      expect(res).toEqual({ callSid: 'CA1', status: 'queued' });
      expect(callsCreate).toHaveBeenCalledWith(expect.objectContaining({ machineDetection: 'Enable' }));
    });

    it('uses DetectMessageEnd when voicemail detection is off', async () => {
      callsCreate.mockResolvedValue({ sid: 'CA2', status: 'queued' });
      const engine = loadEngine(realCreds);
      await engine.initiateCall({ ...callConfig, voicemailDetection: false });
      expect(callsCreate).toHaveBeenCalledWith(expect.objectContaining({ machineDetection: 'DetectMessageEnd' }));
    });
  });

  describe('synthesizeSpeech', () => {
    const voiceCfg = { voiceId: '', language: 'en', stability: 0, similarityBoost: 0, speed: 0 };

    afterEach(() => { (global.fetch as jest.Mock | undefined)?.mockReset?.(); });

    it('returns demo audio when ElevenLabs is not configured', async () => {
      const engine = loadEngine({});
      const buf = await engine.synthesizeSpeech('hi', voiceCfg);
      expect(buf.toString()).toBe('demo_audio');
    });

    it('calls the ElevenLabs API and returns audio', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode('audio').buffer,
      });
      const engine = loadEngine({ ELEVENLABS_API_KEY: 'el' });
      const buf = await engine.synthesizeSpeech('hi', voiceCfg);
      expect(buf.toString()).toBe('audio');
      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('EXAVITQu4vr4xnSDxMaL');
    });

    it('uses an explicit voice id when provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });
      const engine = loadEngine({ ELEVENLABS_API_KEY: 'el' });
      await engine.synthesizeSpeech('hi', { ...voiceCfg, voiceId: 'custom_voice', stability: 0.9, similarityBoost: 0.9, speed: 1.2 });
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('custom_voice');
    });

    it('throws when the API responds with an error', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: 'Bad Request' });
      const engine = loadEngine({ ELEVENLABS_API_KEY: 'el' });
      await expect(engine.synthesizeSpeech('hi', voiceCfg)).rejects.toThrow('ElevenLabs API error');
    });
  });

  describe('endCall', () => {
    it('no-ops in demo mode', async () => {
      const engine = loadEngine({});
      await engine.endCall('CA1');
      expect(callsUpdate).not.toHaveBeenCalled();
    });

    it('no-ops for a demo call sid', async () => {
      const engine = loadEngine(realCreds);
      await engine.endCall('demo_123');
      expect(callsUpdate).not.toHaveBeenCalled();
    });

    it('completes a real call', async () => {
      callsUpdate.mockResolvedValue({});
      const engine = loadEngine(realCreds);
      await engine.endCall('CA1');
      expect(callsUpdate).toHaveBeenCalledWith({ status: 'completed' });
    });
  });

  describe('transferCall', () => {
    it('no-ops in demo mode', async () => {
      const engine = loadEngine({});
      await engine.transferCall('CA1', '+1777');
      expect(callsUpdate).not.toHaveBeenCalled();
    });

    it('transfers a real call', async () => {
      callsUpdate.mockResolvedValue({});
      const engine = loadEngine(realCreds);
      await engine.transferCall('CA1', '+1777');
      expect(callsUpdate).toHaveBeenCalledWith({ twiml: expect.stringContaining('+1777') });
    });
  });

  describe('language helpers', () => {
    it('returns the voice for a known language and falls back otherwise', () => {
      const engine = loadEngine({});
      expect(engine.getDefaultVoiceForLanguage('hi')).toBe('hindi_voice_id');
      expect(engine.getDefaultVoiceForLanguage('zz')).toBe('EXAVITQu4vr4xnSDxMaL');
    });

    it('lists the supported languages', () => {
      const engine = loadEngine({});
      expect(engine.getSupportedLanguages()).toHaveLength(5);
    });
  });
});
