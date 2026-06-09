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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWASocket = exports.msgDB = exports.restartWbot = exports.removeWbot = exports.getWbot = void 0;
const Sentry = __importStar(require("@sentry/node"));
const baileys_1 = __importStar(require("baileys"));
const sequelize_1 = require("sequelize");
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const logger_1 = require("../utils/logger");
const logger_2 = __importDefault(require("baileys/lib/Utils/logger"));
const authState_1 = __importDefault(require("../helpers/authState"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const socket_1 = require("./socket");
const StartWhatsAppSession_1 = require("../services/WbotServices/StartWhatsAppSession");
const DeleteBaileysService_1 = __importDefault(require("../services/BaileysServices/DeleteBaileysService"));
const node_cache_1 = __importDefault(require("node-cache"));
const Contact_1 = __importDefault(require("../models/Contact"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const lid_mapping_1 = require("baileys/lib/Signal/lid-mapping");
const loggerBaileys = logger_2.default.child({});
loggerBaileys.level = "error";
const msgRetryCounterCache = new node_cache_1.default({
    stdTTL: 600,
    maxKeys: 1000,
    checkperiod: 300,
    useClones: false
});
const msgCache = new node_cache_1.default({
    stdTTL: 60,
    maxKeys: 1000,
    checkperiod: 300,
    useClones: false
});
function msg() {
    return {
        get: (key) => {
            const { id } = key;
            if (!id)
                return;
            let data = msgCache.get(id);
            if (data) {
                try {
                    let msg = JSON.parse(data);
                    return msg?.message;
                }
                catch (error) {
                    logger_1.logger.error(error);
                }
            }
        },
        save: (msg) => {
            const { id } = msg.key;
            const msgtxt = JSON.stringify(msg);
            try {
                msgCache.set(id, msgtxt);
            }
            catch (error) {
                logger_1.logger.error(error);
            }
        }
    };
}
exports.default = msg;
const sessions = [];
const retriesQrCodeMap = new Map();
// Contador de tentativas de reconexão para erro 403
const reconnectAttempts = new Map();
const getWbot = (whatsappId) => {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex === -1) {
        throw new AppError_1.default("ERR_WAPP_NOT_INITIALIZED");
    }
    return sessions[sessionIndex];
};
exports.getWbot = getWbot;
const removeWbot = async (whatsappId, isLogout = true) => {
    try {
        const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
        if (sessionIndex !== -1) {
            if (isLogout) {
                sessions[sessionIndex].logout();
                sessions[sessionIndex].ws.close();
            }
            sessions.splice(sessionIndex, 1);
        }
    }
    catch (err) {
        logger_1.logger.error(err);
    }
};
exports.removeWbot = removeWbot;
const restartWbot = async (companyId, session) => {
    try {
        const options = {
            where: {
                companyId,
            },
            attributes: ["id"],
        };
        const whatsapp = await Whatsapp_1.default.findAll(options);
        whatsapp.map(async (c) => {
            const sessionIndex = sessions.findIndex(s => s.id === c.id);
            if (sessionIndex !== -1) {
                sessions[sessionIndex].ws.close();
            }
        });
    }
    catch (err) {
        logger_1.logger.error(err);
    }
};
exports.restartWbot = restartWbot;
exports.msgDB = msg();
const initWASocket = async (whatsapp) => {
    return new Promise(async (resolve, reject) => {
        try {
            (async () => {
                const io = (0, socket_1.getIO)();
                const whatsappUpdate = await Whatsapp_1.default.findOne({
                    where: { id: whatsapp.id }
                });
                if (!whatsappUpdate)
                    return;
                const { id, name, provider } = whatsappUpdate;
                const { version, isLatest } = await (0, baileys_1.fetchLatestWaWebVersion)({});
                // const { version, isLatest } = await fetchLatestBaileysVersion();
                const isLegacy = provider === "stable" ? true : false;
                logger_1.logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
                logger_1.logger.info(`isLegacy: ${isLegacy}`);
                logger_1.logger.info(`Starting session ${name}`);
                let retriesQrCode = 0;
                let wsocket = null;
                // Removido makeInMemoryStore que não existe mais na versão 6.7.16
                // Usando apenas caches externos conforme exemplo oficial
                const { state, saveState } = await (0, authState_1.default)(whatsapp);
                const userDevicesCache = new node_cache_1.default();
                const signalKeyStore = (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger_1.logger, userDevicesCache);
                const groupCache = new node_cache_1.default({
                    stdTTL: 3600,
                    maxKeys: 10000,
                    checkperiod: 600,
                    useClones: false
                });
                const lidMappingStore = new lid_mapping_1.LIDMappingStore(signalKeyStore, // Cast temporário para compatibilidade
                async (...jids) => {
                    // Função para verificar JIDs no WhatsApp e obter LIDs
                    try {
                        const results = await wsocket?.onWhatsApp(...jids);
                        return results?.map(result => ({
                            jid: result.jid,
                            exists: result.exists,
                            lid: result.lid || result.jid
                        }));
                    }
                    catch (error) {
                        logger_1.logger.error("Erro ao verificar JIDs no WhatsApp:", error);
                        return undefined;
                    }
                });
                const cachedGroupMetadata = async (jid) => {
                    let data = groupCache.get(jid);
                    console.log('cachedGroupMetadata jid:', jid, 'data:', !!data);
                    if (data) {
                        return data;
                    }
                    else {
                        const result = await wsocket.groupMetadata(jid);
                        groupCache.set(jid, result);
                        return result;
                    }
                };
                wsocket = (0, baileys_1.default)({
                    logger: loggerBaileys,
                    printQRInTerminal: false,
                    auth: {
                        creds: state.creds,
                        keys: signalKeyStore,
                    },
                    version,
                    browser: baileys_1.Browsers.appropriate("Desktop"),
                    defaultQueryTimeoutMs: undefined,
                    msgRetryCounterCache,
                    markOnlineOnConnect: false,
                    connectTimeoutMs: 25000,
                    retryRequestDelayMs: 500,
                    getMessage: exports.msgDB.get,
                    emitOwnEvents: true,
                    fireInitQueries: true,
                    transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
                    shouldIgnoreJid: jid => (0, baileys_1.isJidBroadcast)(jid),
                    cachedGroupMetadata,
                });
                // PATCH ESPECÍFICO - Converter objetos Object() para Buffer
                const originalBufferFrom = Buffer.from;
                Buffer.from = function (value, ...args) {
                    try {
                        // Interceptar APENAS objetos Object() que não são válidos para Buffer.from
                        if (typeof value === 'object' && value !== null &&
                            !Array.isArray(value) &&
                            !Buffer.isBuffer(value) &&
                            !(value instanceof Uint8Array) && // NÃO interceptar Uint8Array
                            !(value instanceof ArrayBuffer) && // NÃO interceptar ArrayBuffer
                            value.constructor === Object) { // APENAS objetos Object()
                            // console.log(`🚨 INTERCEPTADO Buffer.from com objeto Object() inválido:`, {
                            //   type: typeof value,
                            //   constructor: value.constructor?.name,
                            //   keys: Object.keys(value),
                            //   value: value
                            // });
                            // Tentar converter o objeto Object() para array e depois para Buffer
                            try {
                                const keys = Object.keys(value);
                                const isNumericKeys = keys.every(key => /^\d+$/.test(key));
                                if (isNumericKeys) {
                                    // Converter objeto com chaves numéricas para array
                                    const maxIndex = Math.max(...keys.map(k => parseInt(k)));
                                    const array = new Array(maxIndex + 1);
                                    for (let i = 0; i <= maxIndex; i++) {
                                        array[i] = value[i] || 0;
                                    }
                                    const buffer = Buffer.from(array);
                                    console.log(`✅ Convertido objeto Object() para Buffer (${buffer.length} bytes)`);
                                    return buffer;
                                }
                                else {
                                    console.log(`⚠️ Objeto Object() não tem chaves numéricas, retornando Buffer vazio`);
                                    return Buffer.from([]);
                                }
                            }
                            catch (conversionError) {
                                console.error(`❌ Erro ao converter objeto Object() para Buffer:`, conversionError);
                                return Buffer.from([]);
                            }
                        }
                        return originalBufferFrom.call(this, value, ...args);
                    }
                    catch (error) {
                        console.error(`❌ Erro no Buffer.from interceptado:`, error);
                        // Retornar Buffer vazio como fallback
                        return Buffer.from([]);
                    }
                };
                wsocket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
                    logger_1.logger.info(`Socket ${name} Connection Update: ${connection}`);
                    // Log detalhado de desconexões
                    if (lastDisconnect) {
                        const error = lastDisconnect.error;
                        logger_1.logger.warn(`Desconexão detectada para ${name}:`, {
                            statusCode: error?.output?.statusCode,
                            message: error?.message,
                            timestamp: new Date().toISOString()
                        });
                    }
                    const disconect = lastDisconnect?.error?.output?.statusCode;
                    if (connection === "close") {
                        if (disconect === 403) {
                            logger_1.logger.warn(`Erro 403 detectado para ${name}. Tentando reconexão inteligente...`);
                            // NÃO deletar dados imediatamente - tentar reconectar primeiro
                            const attempts = reconnectAttempts.get(id) || 0;
                            if (attempts < 5) { // Máximo 5 tentativas
                                logger_1.logger.info(`Tentativa ${attempts + 1} de reconexão para ${name}`);
                                reconnectAttempts.set(id, attempts + 1);
                                // Tentar reconectar sem deletar dados
                                setTimeout(() => {
                                    (0, StartWhatsAppSession_1.StartWhatsAppSession)(whatsapp, whatsapp.companyId);
                                }, [2000, 5000, 10000, 30000, 60000][attempts]); // Delays progressivos
                                return; // NÃO deletar dados ainda
                            }
                            else {
                                // Após 5 tentativas, então deletar dados
                                logger_1.logger.error(`Máximo de tentativas atingido para ${name}. Deletando sessão.`);
                                await whatsapp.update({ status: "PENDING", session: "", number: "" });
                                (0, exports.removeWbot)(id, false);
                                await (0, DeleteBaileysService_1.default)(whatsapp.id);
                                reconnectAttempts.delete(id);
                                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                                    action: "update",
                                    session: whatsapp
                                });
                            }
                        }
                        if (disconect !== baileys_1.DisconnectReason.loggedOut) {
                            (0, exports.removeWbot)(id, false);
                            setTimeout(() => (0, StartWhatsAppSession_1.StartWhatsAppSession)(whatsapp, whatsapp.companyId), 2000);
                        }
                        else {
                            await whatsapp.update({ status: "PENDING", session: "", number: "" });
                            await (0, DeleteBaileysService_1.default)(whatsapp.id);
                            io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                                action: "update",
                                session: whatsapp
                            });
                            (0, exports.removeWbot)(id, false);
                            setTimeout(() => (0, StartWhatsAppSession_1.StartWhatsAppSession)(whatsapp, whatsapp.companyId), 2000);
                        }
                    }
                    if (connection === "open") {
                        // Limpar tentativas de reconexão quando conectar com sucesso
                        reconnectAttempts.delete(id);
                        await whatsapp.update({
                            status: "CONNECTED",
                            qrcode: "",
                            retries: 0,
                            number: wsocket.type === "md"
                                ? (0, baileys_1.jidNormalizedUser)(wsocket.user.id).split("@")[0]
                                : "-"
                        });
                        io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                            action: "update",
                            session: whatsapp
                        });
                        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
                        if (sessionIndex === -1) {
                            wsocket.id = whatsapp.id;
                            sessions.push(wsocket);
                        }
                        resolve(wsocket);
                    }
                    if (qr !== undefined) {
                        if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                            await whatsapp.update({
                                status: "DISCONNECTED",
                                qrcode: ""
                            });
                            await (0, DeleteBaileysService_1.default)(whatsapp.id);
                            io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                                action: "update",
                                session: whatsapp
                            });
                            wsocket.ev.removeAllListeners("connection.update");
                            wsocket.ws.close();
                            wsocket = null;
                            retriesQrCodeMap.delete(id);
                        }
                        else {
                            logger_1.logger.info(`Session QRCode Generate ${name}`);
                            retriesQrCodeMap.set(id, (retriesQrCode += 1));
                            await whatsapp.update({
                                qrcode: qr,
                                status: "qrcode",
                                retries: 0,
                                number: ""
                            });
                            const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
                            if (sessionIndex === -1) {
                                wsocket.id = whatsapp.id;
                                sessions.push(wsocket);
                            }
                            io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                                action: "update",
                                session: whatsapp
                            });
                        }
                    }
                });
                wsocket.ev.on("creds.update", saveState);
                wsocket.ev.on("presence.update", async ({ id: remoteJid, presences }) => {
                    try {
                        logger_1.logger.debug({ remoteJid, presences }, "Received contact presence");
                        if (!presences[remoteJid]?.lastKnownPresence) {
                            return;
                        }
                        const contact = await Contact_1.default.findOne({
                            where: {
                                number: remoteJid.replace(/\D/g, ""),
                                companyId: whatsapp.companyId
                            }
                        });
                        if (!contact) {
                            return;
                        }
                        const ticket = await Ticket_1.default.findOne({
                            where: {
                                contactId: contact.id,
                                whatsappId: whatsapp.id,
                                status: {
                                    [sequelize_1.Op.or]: ["open", "pending"]
                                }
                            }
                        });
                        if (ticket) {
                            io.to(ticket.id.toString())
                                .to(`company-${whatsapp.companyId}-${ticket.status}`)
                                .to(`queue-${ticket.queueId}-${ticket.status}`)
                                .emit(`company-${whatsapp.companyId}-presence`, {
                                ticketId: ticket.id,
                                presence: presences[remoteJid].lastKnownPresence
                            });
                        }
                    }
                    catch (error) {
                        logger_1.logger.error({ remoteJid, presences }, "presence.update: error processing");
                        if (error instanceof Error) {
                            logger_1.logger.error(`Error: ${error.name} ${error.message}`);
                        }
                        else {
                            logger_1.logger.error(`Error was object of type: ${typeof error}`);
                        }
                    }
                });
                wsocket.lidMappingStore = lidMappingStore;
                // Removida a linha que vinculava o store ao socket
                // store.bind(wsocket.ev);
            })();
        }
        catch (error) {
            Sentry.captureException(error);
            console.log(error);
            reject(error);
        }
    });
};
exports.initWASocket = initWASocket;
