"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.post('/twilio/voice', async (req, res) => {
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
    }
    catch (error) {
        console.error('Twilio voice webhook error:', error, CallSid, CallStatus, To, From);
        res.type('text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred. Goodbye.</Say><Hangup/></Response>`);
    }
});
router.post('/twilio/status', async (req, res) => {
    const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;
    try {
        const statusMap = {
            'initiated': 'queued',
            'ringing': 'ringing',
            'in-progress': 'in_progress',
            'completed': 'completed',
            'busy': 'busy',
            'no-answer': 'no_answer',
            'failed': 'failed',
            'canceled': 'failed',
        };
        await supabase_1.supabaseAdmin
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
            await supabase_1.supabaseAdmin.from('call_events').insert({
                id: (0, uuid_1.v4)(),
                call_id: CallSid,
                event_type: 'hangup',
                data: { duration: CallDuration, recording_url: RecordingUrl },
                timestamp: new Date().toISOString(),
            });
        }
        (0, response_1.sendSuccess)(res, { received: true });
    }
    catch {
        (0, response_1.sendError)(res, 'WEBHOOK_ERROR', 'Failed to process status callback', 500);
    }
});
router.post('/twilio/recording', async (req, res) => {
    const { CallSid, RecordingUrl, RecordingDuration } = req.body;
    try {
        await supabase_1.supabaseAdmin
            .from('calls')
            .update({
            recording_url: RecordingUrl,
            duration_seconds: parseInt(RecordingDuration || '0', 10),
        })
            .eq('twilio_call_sid', CallSid);
        (0, response_1.sendSuccess)(res, { received: true });
    }
    catch {
        (0, response_1.sendError)(res, 'WEBHOOK_ERROR', 'Failed to process recording callback', 500);
    }
});
router.post('/twilio/gather', async (req, res) => {
    const { SpeechResult } = req.body;
    // In production, this would feed into the AI orchestrator for response generation
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew">Thank you for your response. I heard: ${SpeechResult || 'nothing'}. Let me process that for you.</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/api/v1/webhooks/twilio/gather">
    <Say voice="Polly.Matthew">Is there anything else you would like to discuss?</Say>
  </Gather>
</Response>`;
    res.type('text/xml');
    res.send(twiml);
});
exports.default = router;
//# sourceMappingURL=webhooks.js.map