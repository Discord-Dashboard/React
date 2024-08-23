'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { IHttpErrorCode } from 'throw-http-errors/dist/httpErrors/HttpErrorCodeInterface';
import type { GuildResponse } from '@discord-dashboard/typings/dist/Core/Guilds';
import ErrorCodes from '@discord-dashboard/typings/dist/Core/ErrorCodes';

interface GuildContextType {
    loading: boolean;
    error: IHttpErrorCode | null;
    data: GuildResponse[] | null;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

const GuildsListManager: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<IHttpErrorCode | null>(null);
    const [data, setData] = useState<GuildResponse[] | null>(null);
    const [hasFetched, setHasFetched] = useState(false); // Flaga do kontrolowania fetchu

    function isGuildsData(data: any): data is GuildResponse[] {
        return Array.isArray(data);
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
            if (hasFetched) return; // Sprawdzenie flagi

            try {
                const response = await fetch('/api/guilds');
                const jsonData: GuildResponse[] | IHttpErrorCode =
                    await response.json();

                if (isGuildsData(jsonData)) {
                    setData(jsonData);
                } else if (isIHttpErrorCode(jsonData)) {
                    console.log(jsonData);
                    if (jsonData.code === ErrorCodes.UNAUTHORIZED) {
                        location.href = '/api/auth?back=/dashboard/guild';
                    }
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
                console.log('ERROR', err);
                setError({
                    name: 'InternalServerError',
                    status: 500,
                    message: 'InternalServerError',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            setLoading(false);
            setHasFetched(true); // Ustawienie flagi po zakończeniu fetchu
        };

        fetchData();
    }, [hasFetched]); // Zależność od flagi hasFetched

    return (
        <GuildContext.Provider value={{ loading, error, data }}>
            {children}
        </GuildContext.Provider>
    );
};

const useGuildsListManager = () => {
    const context = useContext(GuildContext);
    if (!context) {
        throw new Error(
            'useGuildsListManager must be used within a GuildsListManager',
        );
    }
    return context;
};

export { GuildsListManager, useGuildsListManager };
