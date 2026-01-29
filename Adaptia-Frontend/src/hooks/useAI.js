import { useState } from 'react';
import { getClinicalSummary } from '../api/gemini';

export const useAI = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getSummary = async (text) => {
        setIsLoading(true);
        try {
            const summary = await getClinicalSummary(text);
            return summary;
        } finally {
            setIsLoading(false);
        }
    };

    return { getSummary, isLoading };
};