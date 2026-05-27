import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.post('/twilio/voice', async (req: Request, res: Response) => {
  const { CallSid, CallStatus, To, From } = req.body;

  try {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew">Hello! This is a call from CallGenie AI. How can I help you today?</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/api/v1/webhooks/twilio/gather">
    <Say voice="Polly.Matthew">Please tell me how I can assist you.</Say>
  </Gather>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Twilio voice webhook error:', error, CallSid, CallStatus, To, From);
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred. Goodbye.</Say><Hangup/></Response>`);
  }
});

router.post('/twilio/status', async (req: Request, res: Response) => {
  const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;

  try {
    const statusMap: Record<string, string> = {
      'initiated': 'queued',
      'ringing': 'ringing',
      'in-progress': 'in_progress',
      'completed': 'completed',
      'busy': 'busy',
      'no-answer': 'no_answer',
      'failed': 'failed',
      'canceled': 'failed',
    };

    await supabaseAdmin
      .from('calls')
      .update({
        status: statusMap[CallStatus] || CallStatus,
        duration_seconds: parseInt(CallDuration || '0', 10),
        recording_url: RecordingUrl || null,
        ended_at: ['completed', 'busy', 'no-answer', 'failed', 'canceled'].includes(CallStatus)
          ? new Date().toISOString()
          : undefined,
      })
      .eq('twilio_call_sid', CallSid);

    if (CallStatus === 'completed' && CallSid) {
      const { data: call } = await supabaseAdmin
        .from('calls')
        .select('id')
        .eq('twilio_call_sid', CallSid)
        .single();

      if (call) {
        await supabaseAdmin.from('call_events').insert({
          id: uuidv4(),
          call_id: call.id,
          event_type: 'hangup',
          data: { duration: CallDuration, recording_url: RecordingUrl },
          timestamp: new Date().toISOString(),
        });
      }
    }

    sendSuccess(res, { received: true });
  } catch {
    sendError(res, 'WEBHOOK_ERROR', 'Failed to process status callback', 500);
  }
});

router.post('/twilio/recording', async (req: Request, res: Response) => {
  const { CallSid, RecordingUrl, RecordingDuration } = req.body;

  try {
    await supabaseAdmin
      .from('calls')
      .update({
        recording_url: RecordingUrl,
        duration_seconds: parseInt(RecordingDuration || '0', 10),
      })
      .eq('twilio_call_sid', CallSid);

    sendSuccess(res, { received: true });
  } catch {
    sendError(res, 'WEBHOOK_ERROR', 'Failed to process recording callback', 500);
  }
});

router.post('/twilio/gather', async (req: Request, res: Response) => {
  const { SpeechResult } = req.body;

  // In production, this would feed into the AI orchestrator for response generation
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew">Thank you for your response. I heard: ${escapeXml(SpeechResult || 'nothing')}. Let me process that for you.</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/api/v1/webhooks/twilio/gather">
    <Say voice="Polly.Matthew">Is there anything else you would like to discuss?</Say>
  </Gather>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

export default router;
