"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = async (req, res) => {
    return res.status(200).json({
        version: "6.3.0"
    });
};
exports.index = index;
