import React from 'react';
import { useParams } from 'react-router-dom';

const WardGeneric = ({ title }) => {
    const { wardSlug } = useParams();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <p className="text-neutral-600">
                This is the {title} page for {wardSlug || 'the selected ward'}.
            </p>
            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <p>Placeholder content goes here.</p>
            </div>
        </div>
    );
};

export default WardGeneric;
