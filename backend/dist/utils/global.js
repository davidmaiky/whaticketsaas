"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLidFromMessage = exports.getJidFromMessage = exports.buildContactAddress = exports.getContactIdentifier = exports.map_msg = void 0;
const logger_1 = require("./logger");
exports.map_msg = new Map();
const getContactIdentifier = (contact) => {
    if (contact.lid) {
        console.log('Usando LID para envio:', contact.lid);
        return contact.lid;
    }
    else {
        console.log('Usando JID para envio:', contact.number);
        return contact.number;
    }
};
exports.getContactIdentifier = getContactIdentifier;
// Função helper para construir o endereço de envio
const buildContactAddress = (contact, isGroup) => {
    const contactId = (0, exports.getContactIdentifier)(contact);
    const domain = isGroup ? "@g.us" : contactId.includes("@") ? "" : "@s.whatsapp.net";
    return `${contactId}${domain}`;
};
exports.buildContactAddress = buildContactAddress;
const getJidFromMessage = async (message, wbot) => {
    const { key } = message;
    const { remoteJid, remoteJidAlt, participantAlt, participant } = key;
    let jid = '';
    // Prioridade: JID > LID > PN
    if (remoteJid && remoteJid.includes('@s.whatsapp.net')) {
        jid = remoteJid;
    }
    if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
        jid = remoteJidAlt;
    }
    if (participant && participant.includes('@s.whatsapp.net')) {
        jid = participant;
    }
    if (participantAlt && participantAlt.includes('@s.whatsapp.net')) {
        jid = participantAlt;
    }
    const lidMappingStore = getLIDMappingStore(wbot);
    if (lidMappingStore) {
        const jidForPN = await lidMappingStore.getPNForLID(remoteJid);
        if (jidForPN && jidForPN.includes('@s.whatsapp.net')) {
            jid = jidForPN;
            console.log('JID encontrado via LIDMappingStore:', jid);
        }
        else {
            console.log('JID não encontrado na LIDMappingStore para o PN:', remoteJid);
        }
    }
    else {
        logger_1.logger.error(`LIDMappingStore nao disponivel ou JID nao encontrado na mensagem, jid: ${!!jid}, lidMappingStore: ${!!lidMappingStore}`);
    }
    const jidSplitedPontos = jid.split(':')[0];
    const jidSplitedArroba = jid.split('@')[1];
    jid = jidSplitedPontos.includes('@') ? jid : `${jidSplitedPontos}@${jidSplitedArroba}`;
    console.log('JID final para envio:', jid);
    return jid;
};
exports.getJidFromMessage = getJidFromMessage;
// Função para acessar LIDMappingStore de forma segura
const getLIDMappingStore = (wbot) => {
    try {
        // Tentar acessar o LIDMappingStore de diferentes formas
        return wbot.lidMappingStore ||
            wbot.lidMappingStore ||
            null;
    }
    catch (error) {
        logger_1.logger.warn(`Erro ao acessar LIDMappingStore: ${error.message}`);
        return null;
    }
};
const getLidFromMessage = async (message, wbot) => {
    const { key } = message;
    const { remoteJid, remoteJidAlt, participantAlt, participant } = key;
    let lid = '';
    // Prioridade: LID > JID > PN
    if (remoteJid && remoteJid.includes('@lid')) {
        lid = remoteJid;
    }
    if (remoteJidAlt && remoteJidAlt.includes('@lid')) {
        lid = remoteJidAlt;
    }
    if (participant && participant.includes('@lid')) {
        lid = participant;
    }
    if (participantAlt && participantAlt.includes('@lid')) {
        lid = participantAlt;
    }
    const lidMappingStore = getLIDMappingStore(wbot);
    if (lidMappingStore && lid) {
        const lidForPN = await lidMappingStore.getLIDForPN(remoteJid);
        if (lidForPN && lidForPN.includes('@lid')) {
            lid = lidForPN;
            console.log('LID encontrado via LIDMappingStore:', lid);
        }
        else {
            console.log('LID não encontrado na LIDMappingStore para o PN:', remoteJid);
        }
    }
    else {
        logger_1.logger.error(`LIDMappingStore nao disponivel ou LID nao encontrado na mensagem, lid: ${!!lid}, lidMappingStore: ${!!lidMappingStore}`);
    }
    return lid;
};
exports.getLidFromMessage = getLidFromMessage;
