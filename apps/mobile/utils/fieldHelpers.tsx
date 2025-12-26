import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export function getSportTypeColor(sportType: string): { bg: string; text: string } {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
        'Basketball': { bg: '#FFF3E0', text: '#E65100' },
        'Soccer': { bg: '#E8F5E9', text: '#2E7D32' },
        'Tennis': { bg: '#FFF9C4', text: '#F57F17' },
        'Baseball': { bg: '#F3E5F5', text: '#7B1FA2' },
        'Volleyball': { bg: '#E0F7FA', text: '#00838F' },
        'Multi-sport': { bg: '#EDE7F6', text: '#5E35B1' },
        'Track & Field': { bg: '#E3F2FD', text: '#1565C0' },
        'Fitness': { bg: '#FFEBEE', text: '#C62828' }
    };

    return colorMap[sportType] || { bg: Colors.gray[100], text: Colors.gray[700] };
}

export function renderStars(rating: number): JSX.Element[] {
    const stars: JSX.Element[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Ionicons key={`full-${i}`} name="star" size={16} color="#FFB300" />);
    }
    if (hasHalfStar) {
        stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFB300" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFB300" />);
    }

    return stars;
}
