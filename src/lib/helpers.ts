/**
 * Smart Image Detector for Marketplace Listings
 * Scans titles for engineering keywords and returns high-quality Unsplash placeholders.
 */
export function getSmartPlaceholder(title: string, society: string): string {
    const t = (title || "").toLowerCase();
    const s = (society || "").toLowerCase();

    // Electronics & Hardware
    if (t.includes('arduino') || t.includes('esp32') || t.includes('raspberry') || t.includes('circuit') || t.includes('pcb') || t.includes('soldering') || t.includes('breadboard')) {
        return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'; // Motherboard
    }
    if (t.includes('oscilloscope') || t.includes('multimeter') || t.includes('scope') || t.includes('meter') || t.includes('probe')) {
        return 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'; // Lab gear
    }

    // Computing & Gear
    if (t.includes('laptop') || t.includes('macbook') || t.includes('thinkpad') || t.includes('computer') || t.includes('monitor') || t.includes('screen')) {
        return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800'; // Clean laptop
    }
    if (t.includes('keyboard') || t.includes('mouse') || t.includes('gpu') || t.includes('nvidia') || t.includes('graphics') || t.includes('ram')) {
        return 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800'; // Gaming gear
    }

    // Books & Stationery
    if (t.includes('textbook') || t.includes('book') || t.includes('notes') || t.includes('manual') || t.includes('calculator') || t.includes('equations')) {
        return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'; // Books
    }

    // Tools & Prototypes
    if (t.includes('3d printer') || t.includes('filament') || t.includes('pla') || t.includes('printer') || t.includes('nozzle') || t.includes('3d') || t.includes('ender') || t.includes('creality') || t.includes('resin') || t.includes('cubic')) {
        return 'https://images.unsplash.com/photo-1631541913700-6421524e7587?auto=format&fit=crop&q=80&w=800'; // 3D Printer
    }
    if (t.includes('drill') || t.includes('tool') || t.includes('wrench') || t.includes('hammer') || t.includes('kit') || t.includes('screwdriver') || t.includes('dremel') || t.includes('pliers')) {
        return 'https://images.unsplash.com/photo-1530124560677-bbfda89676e1?auto=format&fit=crop&q=80&w=800'; // Tools
    }

    // Mechanical Components
    if (t.includes('gear') || t.includes('motor') || t.includes('servo') || t.includes('bearing') || t.includes('shaft') || t.includes('engine') || t.includes('piston')) {
        return 'https://images.unsplash.com/photo-1504198453319-5ce911baf2ea?auto=format&fit=crop&q=80&w=800'; // Heavy gears
    }

    // Default Society Stock Fallbacks (Premium replacements for old PNG icons)
    if (s.includes('comp') || s.includes('elec') || s.includes('software')) {
        return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'; // High tech
    }
    if (s.includes('bio') || s.includes('chem') || s.includes('medical')) {
        return 'https://images.unsplash.com/photo-1532187863486-abf9d3971a17?auto=format&fit=crop&q=80&w=800'; // Lab
    }
    if (s.includes('civil') || s.includes('struct') || s.includes('mech') || s.includes('truss')) {
        return 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=800'; // Structures
    }
    
    // Generic high-quality engineering workspace if all else fails
    return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800'; 
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
