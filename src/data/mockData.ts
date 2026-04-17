import type { MarketplaceItem, ForumPost } from '../types';

export const initialMockItems: MarketplaceItem[] = [
    {
        id: '1',
        title: 'Arduino Uno R3',
        description: 'Barely used Arduino, perfect for tinkering. Good for intro robotics.',
        society: 'HumanEd',
        type: 'Materials',
        originalPrice: 25,
        sellingPrice: 15,
        deliveryMethod: 'meetup',
        views: 120,
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        title: '3D Printer Filament - Red PLA',
        description: '1kg spool, unopened. Extra from last semester.',
        society: 'Hyped',
        type: 'Materials',
        originalPrice: 22,
        sellingPrice: 18,
        deliveryMethod: 'both',
        views: 450,
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Soldering Iron Kit',
        description: 'Includes solder and stand. Reliable tool for electronics.',
        society: 'Battleburgh',
        type: 'Tools',
        originalPrice: 45,
        sellingPrice: 25,
        deliveryMethod: 'delivery',
        views: 15,
        createdAt: new Date().toISOString()
    },
    {
        id: '4',
        title: 'Software Lead needed!',
        description: 'Looking for a Software Lead. Experience with React and Node.js preferred. Contact us if interested!',
        society: 'Engineering 4 change (E4C)',
        type: 'Recruiting',
        views: 310,
        createdAt: new Date().toISOString()
    },
    {
        id: '5',
        title: 'Wind Turbine Blade Molds',
        description: 'Molds used for casting small turbine blades. Great condition.',
        society: 'Winds of Change (WoC)',
        type: 'Tools',
        originalPrice: 100,
        sellingPrice: 60,
        deliveryMethod: 'meetup',
        views: 5,
        createdAt: new Date().toISOString()
    }
];

export const initialMockPosts: ForumPost[] = [
    {
        id: 'p1',
        authorEmail: 'alice@ed.ac.uk',
        title: 'Need help with 3D sorting algorithm for Arduino project',
        content: 'I am trying to build a robot that sorts parts based on color. Has anyone successfully interfaced the TCS3200 sensor with an Uno without extreme noise?',
        upvotes: 12,
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'p2',
        authorEmail: 'bob@ed.ac.uk',
        title: 'Useful STL for the wind turbine lab!',
        content: 'I designed a much better mounting bracket that dramatically reduces vibration compared to the stock one. Feel free to download and print it!',
        upvotes: 45,
        stlFileName: 'turbine_bracket_v2_final.stl',
        stlFileUrl: 'data:application/octet-stream;base64,dummy_file_do_not_download',
        createdAt: new Date().toISOString()
    }
];
