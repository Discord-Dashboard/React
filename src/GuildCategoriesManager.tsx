'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { IHttpErrorCode } from 'throw-http-errors/dist/httpErrors/HttpErrorCodeInterface';
import { type TGuildData } from '@discord-dashboard/typings/dist/React';

interface GuildCategoriesContextType {
    loading: boolean;
    data: TGuildData[] | null;
    guildId: string;
    error: IHttpErrorCode | null;
}

interface GuildCategoriesManagerProps {
    children: React.ReactNode;
    id: string;
}

const GuildCategoriesContext = createContext<
    GuildCategoriesContextType | undefined
>(undefined);

const GuildCategoriesManager: React.FC<GuildCategoriesManagerProps> = ({
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

    return (
        <GuildCategoriesContext.Provider
            value={{ loading, guildId, error, data }}
        >
            {children}
        </GuildCategoriesContext.Provider>
    );
};

const useGuildCateoriesManager = () => {
    const context = useContext(GuildCategoriesContext);
    if (!context) {
        throw new Error(
            'useGuildCateoriesManager must be used within a GuildOptionsManager',
        );
    }
    return context;
};

export { GuildCategoriesManager, useGuildCateoriesManager };
