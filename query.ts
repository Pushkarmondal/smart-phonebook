import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const prisma = new PrismaClient();

interface SearchContext {
    userId: string;
    contacts?: any[];
    relationships?: any[];
    entities?: any[];
    interactions?: any[];
}

export async function runGemini(query: string, userId: string) {
    try {
        // Step 1: Fetch relevant data from the database
        const context = await fetchUserContext(userId);
        
        // Step 2: Create a detailed prompt with the context
        const prompt = createPrompt(query, context);
        
        // Step 3: Get AI response
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return {
            success: true,
            answer: response.text()
        };
    } catch (error) {
        console.error("Error in runGemini:", error);
        return {
            success: false,
            error: "Failed to process your request"
        };
    }
}

export async function fetchUserContext(userId: string): Promise<SearchContext> {
    const [contacts, relationships, entities, interactions] = await Promise.all([
        prisma.contact.findMany({
            where: { addedById: userId },
            include: { relationships: true }
        }),
        prisma.relationship.findMany({
            where: { userId },
            include: { contact: true, entity: true }
        }),
        prisma.globalEntity.findMany({
            include: { relationships: true }
        }),
        prisma.interaction.findMany({
            where: { userId },
            include: { contact: true, entity: true }
        })
    ]);

    return {
        userId,
        contacts,
        relationships,
        entities,
        interactions
    };
}

function createPrompt(query: string, context: SearchContext): string {
    const formatData = (data: any[], fields: string[]) => {
        return data.slice(0, 10).map(item => {  
            const obj: any = {};
            fields.forEach(field => {
                if (item[field] !== undefined) {
                    obj[field] = item[field];
                }
            });
            return obj;
        });
    };

    const contactsData = formatData(context.contacts || [], ['id', 'name', 'phone', 'email', 'type']);
    const entitiesData = formatData(context.entities || [], ['id', 'name', 'type', 'categories', 'phone', 'email']);
    const relationshipsData = formatData(context.relationships || [], ['type', 'relation', 'context']);
    const interactionsData = formatData(context.interactions || [], ['type', 'timestamp', 'notes']);

    return `
    You are a smart phonebook assistant. Your job is to help users find contacts and information from their personal phonebook.

    USER QUERY: "${query}"

    USER'S DATABASE CONTEXT:
    - CONTACTS (${contactsData.length}):
    ${JSON.stringify(contactsData, null, 2)}

    - BUSINESSES/PROFESSIONALS (${entitiesData.length}):
    ${JSON.stringify(entitiesData, null, 2)}

    - RELATIONSHIPS (${relationshipsData.length}):
    ${JSON.stringify(relationshipsData, null, 2)}

    - PAST INTERACTIONS (${interactionsData.length}):
    ${JSON.stringify(interactionsData, null, 2)}

    INSTRUCTIONS:
    1. First, analyze if the query matches any data in the provided context
    2. If no exact matches are found, check for related categories or types
    3. If still no matches, provide a helpful response about what is available
    4. For service requests (like carpenters), suggest the closest matching services
    5. Always be specific about what you found in the database

    CURRENT DATABASE CONTENT:
    - You have ${entitiesData.length} businesses/professionals in your contacts
    - Main categories available: ${[...new Set(entitiesData.flatMap(e => e.categories || []))].join(', ')}
    - Total contacts: ${contactsData.length}

    RESPONSE FORMAT:
    - If matches found:
      "I found [X] matching [service/contact type] in your phonebook:"
      Then list each with relevant details
    
    - If no exact matches:
      "I couldn't find exact matches for '[query]' in your phonebook. 
       However, here are similar services/contacts you have:"
       Then list related items
    
    - If nothing relevant:
      "I couldn't find any related contacts or services for '[query]'. 
       Your phonebook currently has [summary of available data]."

    IMPORTANT: Always be specific about what you found in the database. Never make up information.
    `;
}