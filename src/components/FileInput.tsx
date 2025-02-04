"use client";

import { ChangeEvent, useRef } from "react";

export default function FileInput({
    onChange,
}: {
    onChange: (event: ChangeEvent<HTMLInputElement>) => void; // eslint-disable-line no-unused-vars
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center">
            <button type="button" className="mr-4 block w-fit px-4 py-2" onClick={() => fileInputRef.current?.click()}>
                Choose File
            </button>
            <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={onChange}
                className="file:hidden"
            />
        </div>
    );
}
