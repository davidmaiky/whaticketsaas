"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("baileys");
const KEY_MAP = {
    "pre-key": "preKeys",
    session: "sessions",
    "sender-key": "senderKeys",
    "app-state-sync-key": "appStateSyncKeys",
    "app-state-sync-version": "appStateVersions",
    "sender-key-memory": "senderKeyMemory",
    "lid-mapping": "lidMapping" // Suporte ao LID mapping da @vipconnect
};
const authState = async (whatsapp) => {
    let creds;
    let keys = {};
    const saveState = async () => {
        try {
            await whatsapp.update({
                session: JSON.stringify({ creds, keys }, baileys_1.BufferJSON.replacer, 0)
            });
        }
        catch (error) {
            console.log(error);
        }
    };
    // const getSessionDatabase = await whatsappById(whatsapp.id);
    if (whatsapp.session && whatsapp.session !== null) {
        const result = JSON.parse(whatsapp.session, baileys_1.BufferJSON.reviver);
        creds = result.creds;
        keys = result.keys;
        // DEBUG: Verificar se creds.me existe
        if (!creds.me || !creds.me.id) {
            console.log('⚠️ creds.me está undefined ou sem id, reinicializando...');
            creds = (0, baileys_1.initAuthCreds)();
        }
    }
    else {
        creds = (0, baileys_1.initAuthCreds)();
        keys = {};
    }
    // DEBUG: Log das credenciais
    console.log('🔍 AuthState Debug:', {
        hasCreds: !!creds,
        hasMe: !!creds?.me,
        hasMeId: !!creds?.me?.id,
        meId: creds?.me?.id,
        meLid: creds?.me?.lid
    });
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const key = KEY_MAP[type];
                    return ids.reduce((dict, id) => {
                        let value = keys[key]?.[id];
                        if (value) {
                            if (type === "app-state-sync-key") {
                                value = baileys_1.proto.Message.AppStateSyncKeyData.create(value);
                            }
                            dict[id] = value;
                        }
                        return dict;
                    }, {});
                },
                set: (data) => {
                    // eslint-disable-next-line no-restricted-syntax, guard-for-in
                    for (const i in data) {
                        const key = KEY_MAP[i];
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[i]);
                    }
                    saveState();
                }
            }
        },
        saveState
    };
};
exports.default = authState;
