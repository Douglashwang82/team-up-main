export const SPORT_CATEGORIES = [
    { id: 'basketball', label: '籃球' },
    { id: 'badminton', label: '羽球' },
    { id: 'volleyball', label: '排球' },
    { id: 'tennis', label: '網球' },
    { id: 'table_tennis', label: '桌球' },
    { id: 'billiards', label: '撞球' },
    { id: 'swimming', label: '游泳' },
    { id: 'fitness', label: '健身' }
];

export function getSportLabel(id: string): string {
    const sport = SPORT_CATEGORIES.find(s => s.id === id);
    return sport ? sport.label : id;
}

export function getSportId(label: string): string {
    const sport = SPORT_CATEGORIES.find(s => s.label === label);
    return sport ? sport.id : label;
}
