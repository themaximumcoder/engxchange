export type SocietyName =
    | 'Hyped'
    | 'HumanEd'
    | 'Battleburgh'
    | 'Engineering 4 change (E4C)'
    | 'Winds of Change (WoC)'
    | 'Chemical Engineering Society'
    | 'Civil Engineering Society'
    | 'CompSoc'
    | 'Engineers Without Borders'
    | 'Formula Students'
    | 'Hands-On!'
    | 'Precious Plastic'
    | 'BioBlocks'
    | 'Wind Over Waves'
    | 'Other';

export type EntryType = 'Materials' | 'Tools' | 'Recruiting';

export interface MarketplaceItem {
    id: string;
    title: string;
    description: string;
    society: SocietyName;
    type: EntryType;
    originalPrice?: number;
    sellingPrice?: number;
    createdAt: string;
    imageUrl?: string;
    isSold?: boolean;
    sellerEmail?: string;
    sellerPhone?: string;
    deliveryMethod?: 'delivery' | 'meetup' | 'both';
    meetupLocationName?: string;
    meetupLat?: number;
    meetupLng?: number;
    views?: number;
    origin?: string;
    degree?: string;
    yearOfStudy?: string;
    points?: number;
}

export interface ForumPost {
    id: string;
    authorEmail: string;
    title: string;
    content: string;
    upvotes: number;
    createdAt: string;
    origin?: string;
    degree?: string;
    yearOfStudy?: string;
    imageUrl?: string;
    stlFileUrl?: string;
    stlFileName?: string;
    tags?: string[];
    points?: number;
}

export interface Comment {
    id: string;
    postId: string;
    authorEmail: string;
    content: string;
    createdAt: string;
    points?: number;
}

export interface Message {
    id: string;
    senderEmail: string;
    receiverEmail: string;
    content: string;
    read: boolean;
    createdAt: string;
    points?: number;
}

export interface Notification {
    id: string;
    userEmail: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface Report {
    id: string;
    item_id: string;
    item_type: 'item' | 'post' | 'comment';
    reported_by: string;
    reason: string;
    created_at: string;
}

export interface Project {
    id: string;
    user_email: string;
    title: string;
    description: string;
    image_url?: string;
    created_at: string;
}

export const SOCIETIES: SocietyName[] = [
    'Hyped',
    'HumanEd',
    'Battleburgh',
    'Engineering 4 change (E4C)',
    'Winds of Change (WoC)',
    'Chemical Engineering Society',
    'Civil Engineering Society',
    'CompSoc',
    'Engineers Without Borders',
    'Formula Students',
    'Hands-On!',
    'Precious Plastic',
    'BioBlocks',
    'Wind Over Waves',
    'Other'
];

export const ENTRY_TYPES: EntryType[] = ['Materials', 'Tools', 'Recruiting'];
