import React, { createContext, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface Additive {
    title: string;
    price: string;
}

export interface FoodFormData {
    title: string;
    foodTags: string[];
    category: string;
    code: string;
    restaurant: string;
    description: string;
    time: string;
    price: string;
    additives: Additive[];
    imageUrl: string;
}

interface FoodFormContextType {
    formData: FoodFormData;
    updateFormData: (data: Partial<FoodFormData>) => void;
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    addAdditive: (additive: Additive) => void;
    removeAdditive: (index: number) => void;
    resetForm: () => void;
}



const FoodFormContext = createContext<FoodFormContextType | undefined>(undefined);

export function FoodFormProvider({ children }: { children: React.ReactNode }) {
    const { resId } = useSelector((state: RootState) => state.res);
    const defaultFormData: FoodFormData = {
        title: '',
        foodTags: [],
        category: '',
        code: '',
        restaurant: resId,
        description: '',
        time: '',
        price: '',
        additives: [],
        imageUrl: '',
    };
    const [ formData, setFormData ] = useState<FoodFormData>(defaultFormData);
    const updateFormData = (data: Partial<FoodFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const addTag = (tag: string) => {
        if (!formData.foodTags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                foodTags: [ ...prev.foodTags, tag ],
            }));
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            foodTags: prev.foodTags.filter(t => t !== tag),
        }));
    };

    const addAdditive = (additive: Additive) => {
        setFormData(prev => ({
            ...prev,
            additives: [ ...prev.additives, additive ],
        }));
    };

    const removeAdditive = (index: number) => {
        setFormData(prev => ({
            ...prev,
            additives: prev.additives.filter((_, i) => i !== index),
        }));
    };

    const resetForm = () => {
        setFormData(defaultFormData);
    };

    return (
        <FoodFormContext.Provider
            value={{
                formData,
                updateFormData,
                addTag,
                removeTag,
                addAdditive,
                removeAdditive,
                resetForm,
            }}
        >
            {children}
        </FoodFormContext.Provider>
    );
}

export function useFoodForm() {
    const context = useContext(FoodFormContext);
    if (!context) {
        throw new Error('useFoodForm must be used within a FoodFormProvider');
    }
    return context;
}