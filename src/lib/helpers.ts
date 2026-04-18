/**
 * Smart Image Detector for Marketplace Listings
 * Scans titles for engineering keywords and returns high-quality Unsplash placeholders.
 */
export function getSmartPlaceholder(title: string, society: string): string {
    const t = (title || "").toLowerCase();
    const s = (society || "").toLowerCase();

    // Electronics & Hardware
    if (t.includes('arduino') || t.includes('esp32') || t.includes('raspberry') || t.includes('circuit') || t.includes('pcb') || t.includes('soldering') || t.includes('breadboard')) {
        return 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=800'; // Circuit board
    }
    if (t.includes('oscilloscope') || t.includes('multimeter') || t.includes('scope') || t.includes('meter') || t.includes('probe')) {
        return 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'; // Lab equipment
    }

    // Computing & Gear
    if (t.includes('laptop') || t.includes('macbook') || t.includes('thinkpad') || t.includes('computer') || t.includes('monitor') || t.includes('screen')) {
        return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800'; // Clean laptop
    }
    if (t.includes('keyboard') || t.includes('mouse') || t.includes('gpu') || t.includes('nvidia') || t.includes('graphics') || t.includes('ram')) {
        return 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800'; // Tech gear
    }

    // Books & Stationery
    if (t.includes('textbook') || t.includes('book') || t.includes('notes') || t.includes('manual') || t.includes('calculator') || t.includes('equations')) {
        return 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'; // Engineering books
    }

    // Tools & Prototypes
    if (t.includes('3d printer') || t.includes('filament') || t.includes('pla') || t.includes('printer') || t.includes('nozzle')) {
        return 'https://images.unsplash.com/photo-1631541913700-6421524e7587?auto=format&fit=crop&q=80&w=800'; // 3D Printer
    }
    if (t.includes('drill') || t.includes('tool') || t.includes('wrench') || t.includes('hammer') || t.includes('kit') || t.includes('screwdriver')) {
        return 'https://images.unsplash.com/photo-1530124560677-bbfda89676e1?auto=format&fit=crop&q=80&w=800'; // Toolkit
    }

    // Mechanical Components
    if (t.includes('gear') || t.includes('motor') || t.includes('servo') || t.includes('bearing') || t.includes('shaft')) {
        return 'https://images.unsplash.com/photo-1537151372322-15d7123bc39c?auto=format&fit=crop&q=80&w=800'; // Industrial gears
    }

    // Default Society Stock Fallbacks (Premium replacements for old PNG icons)
    if (s.includes('comp') || s.includes('elec') || s.includes('software')) {
        return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'; // Coding/Software
    }
    if (s.includes('bio') || s.includes('chem') || s.includes('medical')) {
        return 'https://images.unsplash.com/photo-1532187863486-abf9d3971a17?auto=format&fit=crop&q=80&w=800'; // Lab/Science
    }
    if (s.includes('civil') || s.includes('struct') || s.includes('mech') || s.includes('truss')) {
        return 'https://images.unsplash.com/photo-1541888941259-79273946027a?auto=format&fit=crop&q=80&w=800'; // Construction/Mech
    }
    
    // Generic high-quality engineering workspace if all else fails
    return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1000'; 
}

export function getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days >= 30) {
        const months = Math.floor(days / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
    } else if (days >= 1) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours >= 1) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        const mins = Math.floor(diff / (1000 * 60));
        return mins <= 1 ? 'just now' : `${mins} mins ago`;
    }
}
