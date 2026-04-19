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
    imageUrls?: string[];
    origin?: string;
    degree?: string;
    yearOfStudy?: string;
    points?: number;
    sellerAvatar?: string;
    sellerName?: string;
    transactionMode?: 'sell' | 'trade' | 'both';
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
    authorName?: string;
    authorAvatar?: string;
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
    itemId?: string;
    readAt?: string;
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
    points?: number;
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

export interface UniversityPreset {
    name: string;
    locations: {
        name: string;
        lat: number;
        lng: number;
    }[];
}

export const UNIVERSITY_PRESETS: UniversityPreset[] = [
    {
        name: 'University of Edinburgh',
        locations: [
            { name: "Appleton Tower", lat: 55.9400, lng: -3.1857 },
            { name: "King's Buildings", lat: 55.9203, lng: -3.1717 },
            { name: "Main Library (George Sq)", lat: 55.9427, lng: -3.1890 }
        ]
    },
    {
        name: 'University of Glasgow',
        locations: [
            { name: "Gilbert Scott Building", lat: 55.8720, lng: -4.2882 },
            { name: "James McCune Smith Hub", lat: 55.8715, lng: -4.2887 },
            { name: "Library", lat: 55.8725, lng: -4.2900 }
        ]
    },
    {
        name: 'University of Strathclyde',
        locations: [
            { name: "John Anderson Campus", lat: 55.8624, lng: -4.2464 },
            { name: "Learning & Teaching Building", lat: 55.8615, lng: -4.2450 }
        ]
    },
    {
        name: 'Edinburgh Napier University',
        locations: [
            { name: "Merchiston Campus", lat: 55.9324, lng: -3.2120 },
            { name: "Sighthill Campus", lat: 55.9240, lng: -3.2880 },
            { name: "Craiglockhart Campus", lat: 55.9180, lng: -3.2390 }
        ]
    },
    {
        name: 'Heriot-Watt University',
        locations: [
            { name: "Riccarton Campus Library", lat: 55.9080, lng: -3.3210 },
            { name: "Student Union", lat: 55.9100, lng: -3.3230 }
        ]
    },
    {
        name: 'University of St Andrews',
        locations: [
            { name: "St Salvator's Quad", lat: 56.3417, lng: -2.7944 },
            { name: "University Library", lat: 56.3395, lng: -2.7960 }
        ]
    },
    {
        name: 'University of Aberdeen',
        locations: [
            { name: "Sir Duncan Rice Library", lat: 57.1645, lng: -2.1020 },
            { name: "King's College", lat: 57.1637, lng: -2.0963 }
        ]
    },
    {
        name: 'University of Dundee',
        locations: [
            { name: "Campus Green", lat: 56.4566, lng: -2.9818 },
            { name: "Main Library", lat: 56.4580, lng: -2.9830 }
        ]
    },
    {
        name: 'Robert Gordon University (RGU)',
        locations: [
            { name: "Garthdee Campus (The Sir Ian Wood)", lat: 57.1180, lng: -2.1380 },
            { name: "Georgina Scott Sutherland Library", lat: 57.1185, lng: -2.1390 }
        ]
    },
    {
        name: 'Glasgow Caledonian University (GCU)',
        locations: [
            { name: "Saltire Centre (Library)", lat: 55.8665, lng: -4.2505 },
            { name: "Student Association", lat: 55.8660, lng: -4.2510 }
        ]
    },
    {
        name: 'University of Stirling',
        locations: [
            { name: "Andrew Miller Building", lat: 56.1486, lng: -3.9213 },
            { name: "Cottrell Building", lat: 56.1495, lng: -3.9220 }
        ]
    },
    {
        name: 'Queen Margaret University (QMU)',
        locations: [
            { name: "LRC (Learning Resource Centre)", lat: 55.9348, lng: -3.0360 }
        ]
    },
    {
        name: 'University of the West of Scotland (UWS)',
        locations: [
            { name: "Paisley Campus (Main Entrance)", lat: 55.8453, lng: -4.4258 }
        ]
    },
    {
        name: 'Abertay University',
        locations: [
            { name: "Abertay Library", lat: 56.4630, lng: -2.9730 }
        ]
    }
];
