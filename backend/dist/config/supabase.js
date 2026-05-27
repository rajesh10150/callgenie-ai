"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseClient = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const index_1 = require("./index");
exports.supabaseAdmin = (0, supabase_js_1.createClient)(index_1.config.supabase.url, index_1.config.supabase.serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
const createSupabaseClient = (accessToken) => {
    return (0, supabase_js_1.createClient)(index_1.config.supabase.url, index_1.config.supabase.anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
};
exports.createSupabaseClient = createSupabaseClient;
//# sourceMappingURL=supabase.js.map