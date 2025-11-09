
import { AttachedFile } from '../types';

export const isTextFile = (mimeType: string): boolean => {
    return mimeType.startsWith('text/') ||
           mimeType === 'application/json' ||
           mimeType === 'application/javascript' ||
           mimeType === 'application/xml' ||
           mimeType === 'application/csv';
}

export const readFile = (file: File): Promise<AttachedFile> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const isText = isTextFile(file.type);
        
        reader.onload = () => {
            if (!reader.result) {
                return reject(new Error("Failed to read file."));
            }
            resolve({
                name: file.name,
                mimeType: file.type,
                url: reader.result as string, // Data URL
                content: reader.result,
                isText: isText,
            });
        };
        
        reader.onerror = (error) => reject(error);

        if (isText) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });
}

export const fileToGenerativePart = async (file: AttachedFile) => {
    if (file.url.startsWith('data:')) {
        const base64EncodedData = file.url.split(',')[1];
        return {
            inlineData: {
                data: base64EncodedData,
                mimeType: file.mimeType,
            },
        };
    }
    throw new Error("Could not convert file to generative part: URL is not a data URL.");
};
