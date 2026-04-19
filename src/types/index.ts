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
    country?: string;
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
    country?: string;
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
    country?: string;
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
    country: string;
    locations: {
        name: string;
        lat: number;
        lng: number;
    }[];
}

export const UNIVERSITY_PRESETS: UniversityPreset[] = [
    // UK PRESETS
    {
        name: 'Abertay University',
        country: 'UK',
        locations: [
            { name: "Abertay Library", lat: 56.4630, lng: -2.9730 }
        ]
    },
    {
        name: 'Edinburgh Napier University',
        country: 'UK',
        locations: [
            { name: "Merchiston Campus", lat: 55.9324, lng: -3.2120 },
            { name: "Sighthill Campus", lat: 55.9240, lng: -3.2880 },
            { name: "Craiglockhart Campus", lat: 55.9180, lng: -3.2390 }
        ]
    },
    {
        name: 'Glasgow Caledonian University (GCU)',
        country: 'UK',
        locations: [
            { name: "Saltire Centre (Library)", lat: 55.8665, lng: -4.2505 },
            { name: "Student Association", lat: 55.8660, lng: -4.2510 }
        ]
    },
    {
        name: 'Heriot-Watt University',
        country: 'UK',
        locations: [
            { name: "Riccarton Campus Library", lat: 55.9080, lng: -3.3210 },
            { name: "Student Union", lat: 55.9100, lng: -3.3230 }
        ]
    },
    {
        name: 'Imperial College London',
        country: 'UK',
        locations: [
            { name: "South Kensington Campus", lat: 51.4988, lng: -0.1749 },
            { name: "Library", lat: 51.4984, lng: -0.1769 }
        ]
    },
    {
        name: 'Queen Margaret University (QMU)',
        country: 'UK',
        locations: [
            { name: "LRC (Learning Resource Centre)", lat: 55.9348, lng: -3.0360 }
        ]
    },
    {
        name: 'Robert Gordon University (RGU)',
        country: 'UK',
        locations: [
            { name: "Garthdee Campus (The Sir Ian Wood)", lat: 57.1180, lng: -2.1380 },
            { name: "Georgina Scott Sutherland Library", lat: 57.1185, lng: -2.1390 }
        ]
    },
    {
        name: 'University of Aberdeen',
        country: 'UK',
        locations: [
            { name: "Sir Duncan Rice Library", lat: 57.1645, lng: -2.1020 },
            { name: "King's College", lat: 57.1637, lng: -2.0963 }
        ]
    },
    {
        name: 'University of Bath',
        country: 'UK',
        locations: [
            { name: "Library & Learning Centre", lat: 51.3810, lng: -2.3275 },
            { name: "Students' Union", lat: 51.3815, lng: -2.3280 }
        ]
    },
    {
        name: 'University of Bristol',
        country: 'UK',
        locations: [
            { name: "Queen's Building (Engineering)", lat: 51.4584, lng: -2.6033 },
            { name: "Wills Memorial Library", lat: 51.4582, lng: -2.6015 }
        ]
    },
    {
        name: 'University of Cambridge',
        country: 'UK',
        locations: [
            { name: "Department of Engineering", lat: 52.2043, lng: 0.1149 },
            { name: "University Library", lat: 52.2025, lng: 0.1085 }
        ]
    },
    {
        name: 'University of Dundee',
        country: 'UK',
        locations: [
            { name: "Campus Green", lat: 56.4566, lng: -2.9818 },
            { name: "Main Library", lat: 56.4580, lng: -2.9830 }
        ]
    },
    {
        name: 'University of Edinburgh',
        country: 'UK',
        locations: [
            { name: "Appleton Tower", lat: 55.9400, lng: -3.1857 },
            { name: "King's Buildings", lat: 55.9203, lng: -3.1717 },
            { name: "Main Library (George Sq)", lat: 55.9427, lng: -3.1890 }
        ]
    },
    {
        name: 'University of Glasgow',
        country: 'UK',
        locations: [
            { name: "Gilbert Scott Building", lat: 55.8720, lng: -4.2882 },
            { name: "James McCune Smith Hub", lat: 55.8715, lng: -4.2887 },
            { name: "Library", lat: 55.8725, lng: -4.2900 }
        ]
    },
    {
        name: 'University of Manchester',
        country: 'UK',
        locations: [
            { name: "Engineering Building A (MECD)", lat: 53.4668, lng: -2.2346 },
            { name: "Main Library", lat: 53.4675, lng: -2.2330 }
        ]
    },
    {
        name: 'University of Oxford',
        country: 'UK',
        locations: [
            { name: "Department of Engineering Science", lat: 51.7589, lng: -1.2537 },
            { name: "Radcliffe Camera", lat: 51.7534, lng: -1.2540 }
        ]
    },
    {
        name: 'University of Sheffield',
        country: 'UK',
        locations: [
            { name: "The Diamond (Engineering)", lat: 53.3814, lng: -1.4884 },
            { name: "University Library", lat: 53.3810, lng: -1.4890 }
        ]
    },
    {
        name: 'University of St Andrews',
        country: 'UK',
        locations: [
            { name: "St Salvator's Quad", lat: 56.3417, lng: -2.7944 },
            { name: "University Library", lat: 56.3395, lng: -2.7960 }
        ]
    },
    {
        name: 'University of Stirling',
        country: 'UK',
        locations: [
            { name: "Andrew Miller Building", lat: 56.1486, lng: -3.9213 },
            { name: "Cottrell Building", lat: 56.1495, lng: -3.9220 }
        ]
    },
    {
        name: 'University of Strathclyde',
        country: 'UK',
        locations: [
            { name: "John Anderson Campus", lat: 55.8624, lng: -4.2464 },
            { name: "Learning & Teaching Building", lat: 55.8615, lng: -4.2450 }
        ]
    },
    {
        name: 'University of the West of Scotland (UWS)',
        country: 'UK',
        locations: [
            { name: "Paisley Campus (Main Entrance)", lat: 55.8453, lng: -4.4258 }
        ]
    },

    // MALAYSIA PRESETS
    {
        name: 'Asia Pacific University (APU)',
        country: 'Malaysia',
        locations: [
            { name: "Technology Park Malaysia", lat: 3.0560, lng: 101.6910 },
            { name: "Engineering Lab Block", lat: 3.0570, lng: 101.6920 }
        ]
    },
    {
        name: 'Heriot-Watt University Malaysia',
        country: 'Malaysia',
        locations: [
            { name: "Putrajaya Campus Library", lat: 2.9090, lng: 101.6705 },
            { name: "Student Plaza", lat: 2.9100, lng: 101.6710 }
        ]
    },
    {
        name: 'Monash University Malaysia',
        country: 'Malaysia',
        locations: [
            { name: "Main Campus Building", lat: 3.0648, lng: 101.6010 },
            { name: "Library", lat: 3.0655, lng: 101.6020 }
        ]
    },
    {
        name: 'Multimedia University (MMU)',
        country: 'Malaysia',
        locations: [
            { name: "Cyberjaya Campus Library", lat: 2.9276, lng: 101.6421 },
            { name: "Engineering Faculty Block", lat: 2.9285, lng: 101.6430 }
        ]
    },
    {
        name: 'Sunway University',
        country: 'Malaysia',
        locations: [
            { name: "Sunway Campus", lat: 3.0673, lng: 101.6033 },
            { name: "Library", lat: 3.0680, lng: 101.6040 }
        ]
    },
    {
        name: 'Taylor\'s University',
        country: 'Malaysia',
        locations: [
            { name: "Lakeside Campus", lat: 3.0620, lng: 101.6160 },
            { name: "Syopz Mall", lat: 3.0615, lng: 101.6150 }
        ]
    },
    {
        name: 'UNITEN',
        country: 'Malaysia',
        locations: [
            { name: "Putrajaya Campus", lat: 2.9728, lng: 101.7310 },
            { name: "Library (BLC)", lat: 2.9735, lng: 101.7320 }
        ]
    },
    {
        name: 'University of Malaya (UM)',
        country: 'Malaysia',
        locations: [
            { name: "Engineering Faculty", lat: 3.1209, lng: 101.6538 },
            { name: "Main Library", lat: 3.1215, lng: 101.6540 },
            { name: "Dewan Tunku Canselor (DTC)", lat: 3.1205, lng: 101.6535 }
        ]
    },
    {
        name: 'University of Nottingham Malaysia',
        country: 'Malaysia',
        locations: [
            { name: "Semenyih Campus Library", lat: 2.9450, lng: 101.8740 },
            { name: "Student Association (SA) Building", lat: 2.9460, lng: 101.8750 }
        ]
    },
    {
        name: 'Universiti Kebangsaan Malaysia (UKM)',
        country: 'Malaysia',
        locations: [
            { name: "Bangi Campus Main Library", lat: 2.9230, lng: 101.7691 },
            { name: "Engineering Block", lat: 2.9240, lng: 101.7700 }
        ]
    },
    {
        name: 'Universiti Putra Malaysia (UPM)',
        country: 'Malaysia',
        locations: [
            { name: "Serdang Campus Engineering Faculty", lat: 2.9920, lng: 101.7105 },
            { name: "Main Library", lat: 2.9930, lng: 101.7115 }
        ]
    },
    {
        name: 'Universiti Sains Malaysia (USM)',
        country: 'Malaysia',
        locations: [
            { name: "Nibong Tebal (Engineering Campus)", lat: 5.1472, lng: 100.4905 },
            { name: "Main Library (Penang)", lat: 5.3553, lng: 100.2947 }
        ]
    },
    {
        name: 'Universiti Teknologi Malaysia (UTM)',
        country: 'Malaysia',
        locations: [
            { name: "KL Campus Main Entrance", lat: 3.1728, lng: 101.7215 },
            { name: "Skudai Campus Library (PSZ)", lat: 1.5585, lng: 103.6385 }
        ]
    },
    {
        name: 'Universiti Teknologi MARA (UiTM)',
        country: 'Malaysia',
        locations: [
            { name: "Shah Alam Campus (Main Library)", lat: 3.0673, lng: 101.4989 },
            { name: "Engineering Building", lat: 3.0685, lng: 101.5005 }
        ]
    }
];
