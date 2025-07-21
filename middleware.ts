import type { NextFunction, Request, Response } from "express";
import jsonwebtoken from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};