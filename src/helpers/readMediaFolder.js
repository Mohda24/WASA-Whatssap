import fs from 'fs';
import path from 'path';
import { mediaBase } from './folderSetup';

export function readMediaFolder() {
    const mediaData = [];

    if (!fs.existsSync(mediaBase)) {
        fs.mkdirSync(mediaBase, { recursive: true });
    }

    const files = fs.readdirSync(mediaBase)
        .filter(file => /^\d{3}_/.test(file))
        .sort();

    for (const file of files) {
        const filePath = path.join(mediaBase, file);
        const stat = fs.statSync(filePath);

        if (!stat.isFile()) continue;
        if (file.endsWith('.caption')) continue;

        const [order, ...rest] = file.split('_');
        const pureName = rest.join('_');

        const ext = path.extname(file).toLowerCase();
        let type = 'document';
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) type = 'image';
        if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) type = 'video';
        if (['.opus', '.mp3'].includes(ext)) type = 'audio';
        if (file.endsWith('.txt') && !fs.existsSync(filePath.replace('.txt', ''))) {
            type = 'message';
        }

        const captionPath = filePath + '.caption';
        let caption = "";
        if (fs.existsSync(captionPath)) {
            caption = fs.readFileSync(captionPath, 'utf-8');
        }

        if (type === 'message') {
            const content = fs.readFileSync(filePath, 'utf-8');
            mediaData.push({
                type: 'message',
                name: pureName.replace('.txt', ''),
                content,
                caption,
                order
            });
        } else {
            const buffer = fs.readFileSync(filePath);
            mediaData.push({
                type,
                name: pureName,
                buffer: Array.from(buffer),
                caption,
                order
            });
        }
    }

    return mediaData;
}
