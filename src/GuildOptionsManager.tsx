'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { IHttpErrorCode } from 'throw-http-errors/dist/httpErrors/HttpErrorCodeInterface';
import {
    type TGuildData,
    TGuildOptionsUpdate,
} from '@discord-dashboard/typings/dist/React';

interface GuildContextType {
    loading: boolean;
    data: TGuildData[] | null;
    guildId: string;
    error: IHttpErrorCode | null;
    updateData: (newData: TGuildOptionsUpdate[]) => Promise<any>;
    editData: (field: keyof TGuildData, value: string) => void;
}

interface GuildOptionsManagerProps {
    children: React.ReactNode;
    id: string;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

const GuildOptionsManager: React.FC<GuildOptionsManagerProps> = ({
    children,
    id,
}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TGuildData[] | null>(null);
    const [error, setError] = useState<IHttpErrorCode | null>(null);
    const [guildId, setGuildId] = useState(id);

    function isGuildData(data: any): data is TGuildData[] {
        return (
            Array.isArray(data) &&
            data.every((item) => typeof item.id === 'string')
        );
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
                const response = await fetch('/api/options/guild/' + guildId);
                const jsonData: TGuildData[] | IHttpErrorCode =
                    await response.json();

                if (isGuildData(jsonData)) {
                    console.debug('JSON Data is valid and set!');
                    setData(jsonData); // Now this is correct
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

    const updateData = async (newData: TGuildOptionsUpdate[]) => {
        const response = await fetch('/api/options/guild/' + guildId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        });

        return await response.json();
    };

    const editData = (field: keyof TGuildData, value: string) => {
        if (data) {
            setData({ ...data, [field]: value });
        }
    };

    return (
        <GuildContext.Provider
            value={{
                loading,
                error,
                data,
                guildId,
                updateData,
                editData,
            }}
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
