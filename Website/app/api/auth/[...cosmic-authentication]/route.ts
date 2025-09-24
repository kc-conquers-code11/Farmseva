import { createAuthHandler } from 'cosmic-authentication';

const handler = createAuthHandler();

export const GET = handler.GET;
export const POST = handler.POST;