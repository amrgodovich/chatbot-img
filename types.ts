
export interface TextPart {
    type: 'text';
    content: string;
}

export interface ImagePart {
    type: 'image';
    url: string;
    alt?: string;
}

export interface FilePart {
    type: 'file';
    name: string;
    mimeType: string;
    url: string; // Data URL for preview
}

export type MessagePart = TextPart | ImagePart | FilePart;

export interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface AttachedFile {
    name: string;
    mimeType: string;
    url: string; // Data URL for preview and API
    content: string | ArrayBuffer | null; // Content for API
    isText: boolean;
}
