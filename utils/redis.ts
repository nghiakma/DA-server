import {Redis} from 'ioredis';
import dotenv from "dotenv";
dotenv.config();

const redisClient = () => {
    if(process.env.REDIS_URL){
        console.log(`Redis đã được kết nối`);
        return process.env.REDIS_URL;
    }
    throw new Error('Redis kết nối thất bại');
};

export const redis = new Redis(redisClient());