import Redis from 'ioredis';
import { config } from '../../config';

/**
 * Redis Client Manager
 * Handles connection, reconnection, and graceful degradation
 */
class RedisClient {
    private client: Redis | null = null;
    private isConnected: boolean = false;
    private isEnabled: boolean = true;

    async connect(): Promise<void> {
        if (this.client) return;

        try {
            this.client = new Redis({
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password,
                db: config.redis.db,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: false,
            });

            // Event handlers
            this.client.on('connect', () => {
                console.log('🔴 Redis connecting...');
            });

            this.client.on('ready', () => {
                this.isConnected = true;
                console.log('✅ Redis connected and ready');
            });

            this.client.on('error', (error) => {
                this.isConnected = false;
                console.error('❌ Redis error:', error.message);
            });

            this.client.on('close', () => {
                this.isConnected = false;
                console.log('🔴 Redis connection closed');
            });

            this.client.on('reconnecting', () => {
                console.log('🔄 Redis reconnecting...');
            });

            // Wait for connection
            await this.client.ping();

        } catch (error) {
            console.error('❌ Failed to connect to Redis:', (error as Error).message);
            console.warn('⚠️  Running without cache - all requests will hit database');
            this.isEnabled = false;
            this.client = null;
        }
    }

    getClient(): Redis | null {
        if (!this.isEnabled || !this.isConnected || !this.client) {
            return null;
        }
        return this.client;
    }

    isAvailable(): boolean {
        return this.isEnabled && this.isConnected && this.client !== null;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
            console.log('🔴 Redis disconnected');
        }
    }

    async ping(): Promise<boolean> {
        if (!this.client) return false;

        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error) {
            return false;
        }
    }

    async getInfo(): Promise<Record<string, string>> {
        if (!this.client) return {};

        try {
            const info = await this.client.info();
            const lines = info.split('\r\n');
            const result: Record<string, string> = {};

            lines.forEach(line => {
                if (line && !line.startsWith('#')) {
                    const [key, value] = line.split(':');
                    if (key && value) {
                        result[key.trim()] = value.trim();
                    }
                }
            });

            return result;
        } catch (error) {
            return {};
        }
    }
}

// Singleton instance
export const redisClient = new RedisClient();
