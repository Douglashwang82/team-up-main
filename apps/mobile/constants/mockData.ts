// Mock field data
export const MOCK_FIELDS = [
    {
        id: '1',
        name: 'Central Park Basketball Court',
        sportType: 'Basketball',
        description: 'Outdoor basketball court with great facilities',
        address: 'Central Park Area, Taipei',
        facilities: ['Outdoor Court', 'Night Lighting', 'Free Access'],
        openingHours: '6:00 AM - 10:00 PM',
        rating: 4.5,
        icon: '🏀'
    },
    {
        id: '2',
        name: 'Riverside Soccer Field',
        sportType: 'Soccer',
        description: 'Full-size soccer field with night lighting',
        address: 'Riverside Park, Taipei',
        facilities: ['Full-size Field', 'Night Lighting', 'Changing Rooms'],
        openingHours: '7:00 AM - 9:00 PM',
        rating: 4.7,
        icon: '⚽'
    },
    {
        id: '3',
        name: 'Eastside Tennis Courts',
        sportType: 'Tennis',
        description: '4 tennis courts available for booking',
        address: 'Eastside Sports Complex, Taipei',
        facilities: ['4 Courts', 'Booking Required', 'Equipment Rental'],
        openingHours: '6:00 AM - 10:00 PM',
        rating: 4.3,
        icon: '🎾'
    },
    {
        id: '4',
        name: 'Valley Baseball Diamond',
        sportType: 'Baseball',
        description: 'Community baseball field with bleachers',
        address: 'Valley Park, Taipei',
        facilities: ['Diamond Field', 'Bleacher Seating', 'Dugouts'],
        openingHours: '8:00 AM - 8:00 PM',
        rating: 4.4,
        icon: '⚾'
    },
    {
        id: '5',
        name: 'Mountain View Volleyball Court',
        sportType: 'Volleyball',
        description: 'Beach volleyball court with sand',
        address: 'Mountain View Park, Taipei',
        facilities: ['Sand Court', 'Outdoor', 'Free Access'],
        openingHours: '7:00 AM - 7:00 PM',
        rating: 4.6,
        icon: '🏐'
    },
    {
        id: '6',
        name: 'Downtown Gym Complex',
        sportType: 'Multi-sport',
        description: 'Indoor facility for various sports',
        address: 'Downtown District, Taipei',
        facilities: ['Indoor', 'Multiple Sports', 'Membership Required'],
        openingHours: '6:00 AM - 11:00 PM',
        rating: 4.8,
        icon: '🏟️'
    },
    {
        id: '7',
        name: 'Lakefront Running Track',
        sportType: 'Track & Field',
        description: '400m running track with scenic views',
        address: 'Lakefront Park, Taipei',
        facilities: ['400m Track', 'Scenic Views', 'Free Access'],
        openingHours: '5:00 AM - 10:00 PM',
        rating: 4.9,
        icon: '🏃'
    },
    {
        id: '8',
        name: 'Oakwood Basketball Court',
        sportType: 'Basketball',
        description: 'Half-court basketball with recent upgrades',
        address: 'Oakwood Community Center, Taipei',
        facilities: ['Half Court', 'Recently Renovated', 'Free Access'],
        openingHours: '6:00 AM - 9:00 PM',
        rating: 4.2,
        icon: '🏀'
    },
    {
        id: '9',
        name: 'Community Soccer Complex',
        sportType: 'Soccer',
        description: 'Multiple soccer fields for all skill levels',
        address: 'Community Sports Park, Taipei',
        facilities: ['Multiple Fields', 'Youth Programs', 'Coaching Available'],
        openingHours: '7:00 AM - 10:00 PM',
        rating: 4.5,
        icon: '⚽'
    },
    {
        id: '10',
        name: 'West Park Fitness Area',
        sportType: 'Fitness',
        description: 'Outdoor fitness equipment and training area',
        address: 'West Park, Taipei',
        facilities: ['Outdoor Equipment', 'Training Area', 'Free Access'],
        openingHours: '24/7',
        rating: 4.1,
        icon: '💪'
    }
];

// Mock upcoming events data
export const MOCK_EVENTS = [
    {
        id: '1',
        fieldId: '1',
        title: 'Morning Basketball Practice',
        date: new Date(Date.now() + 86400000), // Tomorrow
        participants: 8,
        maxParticipants: 10,
        organizer: 'John Doe'
    },
    {
        id: '2',
        fieldId: '1',
        title: '3v3 Basketball Tournament',
        date: new Date(Date.now() + 172800000), // 2 days
        participants: 12,
        maxParticipants: 12,
        organizer: 'Sarah Smith'
    },
    {
        id: '3',
        fieldId: '2',
        title: 'Weekly Soccer Match',
        date: new Date(Date.now() + 259200000), // 3 days
        participants: 15,
        maxParticipants: 20,
        organizer: 'Mike Johnson'
    },
    {
        id: '4',
        fieldId: '3',
        title: 'Tennis Doubles',
        date: new Date(Date.now() + 345600000), // 4 days
        participants: 4,
        maxParticipants: 4,
        organizer: 'Emily Chen'
    },
    {
        id: '5',
        fieldId: '7',
        title: 'Morning Run Club',
        date: new Date(Date.now() + 432000000), // 5 days
        participants: 6,
        maxParticipants: 15,
        organizer: 'David Lee'
    }
];
