"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const projectPath = path_1.default.resolve(__dirname, '..');
const logPath = path_1.default.join(projectPath, 'cron.log');
const command = `0 * * * * cd ${projectPath} && npm start >> ${logPath} 2>&1`;
try {
    const existing = (0, child_process_1.execSync)('crontab -l', { encoding: 'utf-8' });
    if (!existing.includes(command)) {
        const newCrontab = existing + '\n' + command + '\n';
        (0, child_process_1.execSync)(`echo "${newCrontab}" | crontab -`);
        console.log('[✓] Cron job added successfully.');
    }
    else {
        console.log('[i] Cron job already exists.');
    }
}
catch (e) {
    const fallback = command + '\n';
    (0, child_process_1.execSync)(`echo "${fallback}" | crontab -`);
    console.log('[✓] Cron job created.');
}
