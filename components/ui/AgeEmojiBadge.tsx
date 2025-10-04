import React from 'react';

interface AgeEmojiBadgeProps {
    age: number | undefined;
}

function getAgeEmoji(age: number | undefined): { emoji: string; label: string } {
    if (!age) {
        return { emoji: '❓', label: 'Podaj wiek' };
    }

    if (age <= 12) {
        return { emoji: '👶', label: 'Dziecko' };
    } else if (age <= 19) {
        return { emoji: '🧒', label: 'Nastolatek' };
    } else if (age <= 29) {
        return { emoji: '🧑', label: 'Młody dorosły' };
    } else if (age <= 44) {
        return { emoji: '🧔', label: 'Dorosły' };
    } else if (age <= 59) {
        return { emoji: '🧓', label: 'Dojrzały' };
    } else {
        return { emoji: '👴', label: 'Senior' };
    }
}

export function AgeEmojiBadge({ age }: AgeEmojiBadgeProps) {
    const { emoji, label } = getAgeEmoji(age);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-zus-green-light rounded-lg transition-all duration-200 ease-in-out">
            <div 
                className="text-6xl mb-3 transition-all duration-200 ease-in-out transform hover:scale-110"
                key={age}
                style={{
                    animation: 'fadeInScale 200ms ease-in-out',
                }}
            >
                {emoji}
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-zus-grey-900">
                    {age !== undefined ? `${age} lat` : '—'}
                </p>
                <p className="text-sm text-zus-grey-700 mt-1">{label}</p>
            </div>
            <style jsx>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0.5;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

