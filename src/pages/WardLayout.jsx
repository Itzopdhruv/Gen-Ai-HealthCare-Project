import React from 'react';
import { Outlet } from 'react-router-dom';

const WardLayout = () => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Common Header or Layout Logic for Wards can go here */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default WardLayout;
