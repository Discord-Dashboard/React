'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { IHttpErrorCode } from 'throw-http-errors/dist/httpErrors/HttpErrorCodeInterface';

interface GuildData {
    name: string;
    description: string;
}

interface GuildContextType {
    loading: boolean;
    data: GuildData | null;
    error: IHttpErrorCode | null;
    updateData: (newData: GuildData) => void;
    editData: (field: keyof GuildData, value: string) => void;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

const GuildOptionsManager: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<GuildData | null>(null);
    const [error, setError] = useState<IHttpErrorCode | null>(null);

    function isGuildData(data: any): data is GuildData {
        return typeof data.id === 'string' && typeof data.name === 'string';
    }

    function isIHttpErrorCode(data: any): data is IHttpErrorCode {
        return (
            typeof data.statusCode === 'number' &&
            typeof data.code === 'string' &&
            typeof data.error === 'string' &&
            typeof data.message === 'string'
        );
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    '/api/options/guild/787746369036222535',
                );
                const jsonData: GuildData | IHttpErrorCode =
                    await response.json();
                if (isGuildData(jsonData)) {
                    setData(jsonData);
                } else if (isIHttpErrorCode(jsonData)) {
                    setError(jsonData);
                } else {
                    setError({
                        name: 'InternalServerError',
                        status: 500,
                        message: 'InternalServerError',
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }
            } catch (err) {
                setError({
                    name: 'InternalServerError',
                    status: 500,
                    message: 'InternalServerError',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const updateData = async (newData: GuildData) => {
        await fetch('/api/options/guild/787746369036222535', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        });

        setData(newData);
    };

    const editData = (field: keyof GuildData, value: string) => {
        if (data) {
            setData({ ...data, [field]: value });
        }
    };

    return (
        <GuildContext.Provider
            value={{ loading, error, data, updateData, editData }}
        >
            {children}
        </GuildContext.Provider>
    );
};

const useGuildOptionsManager = () => {
    const context = useContext(GuildContext);
    if (!context) {
        throw new Error(
            'useGuildOptionsManager must be used within a GuildOptionsManager',
        );
    }
    return context;
};

export { GuildOptionsManager, useGuildOptionsManager };
