import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function findChromeExecutable() {
    // First try bundled Chrome
    const bundledChromePath = app.isPackaged
        ? path.join(process.resourcesPath, 'chrome', 'win64', 'chrome.exe')
        : path.join(__dirname, '..', '..', 'resources', 'chrome', 'win64', 'chrome.exe');

    if (fs.existsSync(bundledChromePath)) {
        return bundledChromePath;
    }

    // Fallback to system Chrome paths
    const systemChromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];

    for (const chromePath of systemChromePaths) {
        if (fs.existsSync(chromePath)) {
            return chromePath;
        }
    }

    // Last resort - try bundled Chromium
    const possiblePaths = [
        path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'puppeteer', 'node_modules', 'puppeteer-core', '.local-chromium'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'puppeteer-core', '.local-chromium')
    ];

    for (const basePath of possiblePaths) {
        const chromePath = path.join(basePath, 'win64-1045629', 'chrome-win', 'chrome.exe');
        if (fs.existsSync(chromePath)) {
            return chromePath;
        }
    }

    throw new Error('No Chrome executable found. Please check the installation.');
}