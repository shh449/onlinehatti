import React from 'react';
import loading from "../assets/loading.gif"
export default function Spinner() {
    return (
        <div className="flex justify-center items-center h-screen w-full">
            <img src={loading} style={{ height: "80px", width: "80px" }} />
        </div>
    );
}
