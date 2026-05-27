"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const campaigns_1 = __importDefault(require("./routes/campaigns"));
const leads_1 = __importDefault(require("./routes/leads"));
const calls_1 = __importDefault(require("./routes/calls"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const billing_1 = __importDefault(require("./routes/billing"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const ai_1 = __importDefault(require("./routes/ai"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: config_1.config.cors.origin, credentials: true }));
app.use((0, morgan_1.default)('combined'));
app.use('/api/v1/webhooks', express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json({ limit: '10mb' }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
    },
});
app.use('/api/', limiter);
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/campaigns', campaigns_1.default);
app.use('/api/v1/leads', leads_1.default);
app.use('/api/v1/calls', calls_1.default);
app.use('/api/v1/analytics', analytics_1.default);
app.use('/api/v1/billing', billing_1.default);
app.use('/api/v1/whatsapp', whatsapp_1.default);
app.use('/api/v1/ai', ai_1.default);
app.use('/api/v1/webhooks', webhooks_1.default);
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        version: '0.1.0',
        timestamp: new Date().toISOString(),
    });
});
app.use(errorHandler_1.errorHandler);
app.listen(config_1.config.port, () => {
    console.log(`CallGenie AI Backend running on port ${config_1.config.port}`);
    console.log(`Environment: ${config_1.config.nodeEnv}`);
    console.log(`Health check: http://localhost:${config_1.config.port}/api/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map