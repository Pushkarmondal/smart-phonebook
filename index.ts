import express from "express";
import { ContactType, PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { fetchUserContext, runGemini } from "./query";

const prisma = new PrismaClient();
const app = express();
const PORT = 3009
app.use(express.json());

// NOTE: Auth routes
app.post("/api/auth/signup", async (req, res) => {
    try {
        const {name, email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({error: "Email and password are required!"});
        }
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, 10)
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
                password: false
            }
        })
        return res.status(201).json({message: "User created successfully!", user});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Signup route!"});
    }
})

app.post("/api/auth/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({error: "Email and password are required!"});
        }
        const user = await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                name: true,
                email: true,
                phone: true,
                id: true,
                createdAt: true,
                updatedAt: true,
                password: true
            }
        })
        if(!user) {
            return res.status(404).json({error: "User not found!"});
        }
        if(!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({error: "Invalid password!"});
        }
        const token = jsonwebtoken.sign({id: user.id}, "secret", {expiresIn: "48h"});
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({message: "User logged in successfully!", userWithoutPassword, token});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Login route!"});
    }
})

// NOTE: Contact routes
app.post("/api/contact/create", async (req, res) => {
    try {
        const {name, type, phone, email, location, tags, addedById} = req.body;
        if(!name || !type || !addedById) {
            return res.status(400).json({error: "Name, type and addedById are required!"});
        }
        const contact = await prisma.contact.create({
            data: {
                name,
                type: ContactType.PERSONAL,
                phone,
                email,
                location,
                tags,
                addedById,
            },
            select: {
                id: true,
                name: true,
                type: true,
                phone: true,
                email: true,
                location: true,
                tags: true,
                addedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                relationships: {
                    select: {
                        user: true,
                        relation: true,
                        visibility: true,
                        notes: true
                    }
                },
                createdAt: true,
            }
        })
        return res.status(201).json({message: "Contact created successfully!", contact});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Create Contact route!"});
    }
})

app.get("/api/contact/get-all", async(req, res) => {
    try {
        const contacts = await prisma.contact.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                phone: true,
                email: true,
                location: true,
                tags: true,
                addedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                relationships: {
                    select: {
                        user: true,
                        relation: true,
                        visibility: true,
                        notes: true
                    }
                },
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Contacts fetched successfully!", contacts});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Get All Contacts route!"});
    }
})

app.get("/api/contact/get-by-id/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const contact = await prisma.contact.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                type: true,
                phone: true,
                email: true,
                location: true,
                tags: true,
                addedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                relationships: {
                    select: {
                        user: true,
                        relation: true,
                        visibility: true,
                        notes: true
                    }
                },
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Contact fetched successfully!", contact});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Get Contact by ID route!"});
    }
})

// PUT /contacts/:id
app.put("/api/contact/update/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const contact = await prisma.contact.update({
            where: {
                id
            },
            data: req.body,
            select: {
                id: true,
                name: true,
                type: true,
                phone: true,
                email: true,
                location: true,
                tags: true,
                addedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                relationships: {
                    select: {
                        user: true,
                        relation: true,
                        visibility: true,
                        notes: true
                    }
                },
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Contact updated successfully!", contact});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Update Contact route!"});
    }
})

// DELETE /contacts/:id
app.delete("/api/contact/delete/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const contact = await prisma.contact.delete({
            where: {
                id
            }
        })
        return res.status(200).json({message: "Contact deleted successfully!", contact});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Delete Contact route!"});
    }
})

// GET /contacts/search?q=
app.get("/api/contact/search", async(req, res) => {
    try {
        const {q} = req.query;
        const contacts = await prisma.contact.findMany({
            where: {
                name: {
                    contains: q as string
                }
            },
            select: {
                id: true,
                name: true,
                type: true,
                phone: true,
                email: true,
                location: true,
                tags: true,
                addedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                relationships: {
                    select: {
                        user: true,
                        relation: true,
                        visibility: true,
                        notes: true
                    }
                },
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Contacts fetched successfully!", contacts});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error in Search Contact route!"});
    }
});

// POST /relationships - Create a new relationship
// Supports relationships between User-Contact or User-GlobalEntity
app.post("/api/relationship/create", async (req, res) => {
    try {
        const { 
            userId, 
            contactId, 
            entityId, 
            relation, 
            context, 
            strength = 'WEAK', 
            visibility = 'PRIVATE', 
            isReciprocal = false, 
            notes, 
            metadata 
        } = req.body;

        // Validate input
        if (!userId || !relation) {
            return res.status(400).json({ 
                success: false, 
                error: "userId and relation are required!" 
            });
        }

        // Ensure either contactId or entityId is provided, but not both
        if ((!contactId && !entityId) || (contactId && entityId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Either contactId or entityId must be provided, but not both" 
            });
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });
        
        if (!userExists) {
            return res.status(404).json({ 
                success: false, 
                error: "User not found" 
            });
        }

        // Check if contact exists if contactId is provided
        if (contactId) {
            const contactExists = await prisma.contact.findUnique({
                where: { id: contactId },
                select: { id: true }
            });
            
            if (!contactExists) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Contact not found" 
                });
            }
        }

        // Check if entity exists if entityId is provided
        if (entityId) {
            const entityExists = await prisma.globalEntity.findUnique({
                where: { id: entityId },
                select: { id: true }
            });
            
            if (!entityExists) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Entity not found" 
                });
            }
        }

        // Check for existing relationship to prevent duplicates
        const existingRelationship = await prisma.relationship.findFirst({
            where: {
                userId,
                OR: [
                    { contactId },
                    { entityId }
                ],
                relation
            }
        });

        if (existingRelationship) {
            return res.status(409).json({
                success: false,
                error: "A relationship with these parameters already exists"
            });
        }

        // Create the relationship
        const relationship = await prisma.relationship.create({
            data: {
                userId,
                contactId,
                entityId,
                relation,
                context,
                strength,
                visibility,
                isReciprocal,
                notes,
                metadata
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                contact: contactId ? {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                } : undefined,
                entity: entityId ? {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        categories: true
                    }
                } : undefined
            }
        });

        // Create reciprocal relationship if needed
        if (isReciprocal && contactId) {
            await prisma.relationship.create({
                data: {
                    userId: contactId, // The contact becomes the user in the reciprocal relationship
                    contactId: userId,  // The user becomes the contact
                    relation,
                    context: `Reciprocal: ${context || ''}`,
                    strength,
                    visibility,
                    isReciprocal: false, // Prevent infinite recursion
                    notes: notes ? `Reciprocal relationship: ${notes}` : undefined,
                    metadata: {
                        ...metadata,
                        reciprocalOf: relationship.id
                    }
                }
            });
        }

        return res.status(201).json({
            success: true,
            message: "Relationship created successfully!",
            data: relationship
        });
    } catch (error) {
        console.error("Error creating relationship:", error);
        return res.status(500).json({ 
            success: false,
            error: "Internal server error in Create Relationship route!" 
        });
    }
})

// GET /relationships
app.get("/api/relationship/get-all", async(req, res) => {
    try {
        const relationships = await prisma.relationship.findMany({
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                contact: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        phone: true,
                        email: true,
                        location: true,
                        tags: true,
                        addedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        relationships: {
                            select: {
                                user: true,
                                relation: true,
                                visibility: true,
                                notes: true
                            }
                        },
                        createdAt: true,
                    }
                },
                relation: true,
                visibility: true,
                notes: true,
                createdAt: true,
            }
        })
        
        return res.status(200).json({message: "Relationships fetched successfully!", relationships});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error in Get All Relationships route!"});
    }
});

// GET /relationships/:id
app.get("/api/relationship/get-by-id/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const relationship = await prisma.relationship.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                contact: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        phone: true,
                        email: true,
                        location: true,
                        tags: true,
                        addedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        relationships: {
                            select: {
                                user: true,
                                relation: true,
                                visibility: true,
                                notes: true
                            }
                        },
                        createdAt: true,
                    }
                },
                relation: true,
                visibility: true,
                notes: true,
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Relationship fetched successfully!", relationship});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error in Get Relationship by ID route!"});
    }
});

// PUT /relationships/:id
app.put("/api/relationship/update/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const relationship = await prisma.relationship.update({
            where: {
                id
            },
            data: req.body,
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                contact: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        phone: true,
                        email: true,
                        location: true,
                        tags: true,
                        addedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        relationships: {
                            select: {
                                user: true,
                                relation: true,
                                visibility: true,
                                notes: true
                            }
                        },
                        createdAt: true,
                    }
                },
                relation: true,
                visibility: true,
                notes: true,
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Relationship updated successfully!", relationship});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error in Update Relationship route!"});
    }
})

// DELETE /relationships/:id
app.delete("/api/relationship/delete/:id", async(req, res) => {
    try {
        const {id} = req.params;
        const relationship = await prisma.relationship.delete({
            where: {
                id
            }
        })
        return res.status(200).json({message: "Relationship deleted successfully!", relationship});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error in Delete Relationship route!"});
    }
})

// GET all GlobalEntities
app.get("/api/entity/get-all", async (req, res) => {
    try {
        const entities = await prisma.globalEntity.findMany({
            include: {
                relationships: true,
                interactions: true,
                contacts: true
            }
        });
        return res.status(200).json({ data: entities });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching entities" });
    }
});

// GET GlobalEntity by ID
app.get("/api/entity/get-by-id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const entity = await prisma.globalEntity.findUnique({
            where: { id },
            include: {
                relationships: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                interactions: true,
                contacts: {
                    include: {
                        roles: true
                    }
                }
            }
        });
        
        if (!entity) {
            return res.status(404).json({ error: "Entity not found" });
        }
        
        return res.status(200).json({ data: entity });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error fetching entity" });
    }
});

// SEARCH GlobalEntities
app.get("/api/entity/search", async (req, res) => {
    try {
        const { q, category, type } = req.query;
        
        const where: any = {};
        
        if (q) {
            where.OR = [
                { name: { contains: q as string, mode: 'insensitive' } },
                { description: { contains: q as string, mode: 'insensitive' } },
                { tags: { hasSome: [q as string] } }
            ];
        }
        
        if (category) {
            where.categories = { hasSome: [category as string] };
        }
        
        if (type) {
            where.type = type;
        }
        
        const entities = await prisma.globalEntity.findMany({
            where,
            include: {
                relationships: {
                    include: {
                        user: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });
        
        return res.status(200).json({ data: entities });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error searching entities" });
    }
});

// UPDATE GlobalEntity
app.put("/api/entity/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, categories, phone, email, website, address, location, tags, metadata } = req.body;
        
        const updatedEntity = await prisma.globalEntity.update({
            where: { id },
            data: {
                name,
                description,
                categories,
                phone,
                email,
                website,
                address,
                location,
                tags,
                metadata,
                updatedAt: new Date()
            }
        });
        
        return res.status(200).json({ 
            message: "Entity updated successfully", 
            data: updatedEntity 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error updating entity" });
    }
});

// DELETE GlobalEntity
app.delete("/api/entity/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.relationship.deleteMany({
            where: { entityId: id }
        });
        
        await prisma.interaction.deleteMany({
            where: { entityId: id }
        });
        
        await prisma.contactRole.deleteMany({
            where: { entityId: id }
        });
        
        await prisma.globalEntity.delete({
            where: { id }
        });
        
        return res.status(200).json({ 
            success: true, 
            message: "Entity and all related data deleted successfully" 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            error: "Error deleting entity" 
        });
    }
});

// CREATE GlobalEntity
app.post("/api/entity/create", async(req, res) => {
    try {
        const { name, type, description, categories, phone, email, website, address, location, tags, metadata } = req.body;
        
        if (!name || !type || !categories) {
            return res.status(400).json({
                success: false,
                error: "Name, type, and categories are required!"
            });
        }
        
        const entity = await prisma.globalEntity.create({
            data: {
                name,
                type,
                description,
                categories,
                phone,
                email,
                website,
                address,
                location,
                tags,
                metadata
            }
        });
        
        return res.status(201).json({
            success: true,
            message: "Entity created successfully!",
            data: entity
        });
    } catch (error) {
        console.error("Error creating entity:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Create Entity route!"
        });
    }
});

// ====================================
// INTERACTION ENDPOINTS
// ====================================

// CREATE Interaction
app.post("/api/interaction/create", async (req, res) => {
    try {
        const {
            userId,
            contactId,
            entityId,
            relationshipId,
            type,
            title,
            description,
            timestamp = new Date(),
            metadata = {}
        } = req.body;

        // Validate input
        if (!userId || !type) {
            return res.status(400).json({
                success: false,
                error: "userId and type are required!"
            });
        }

        // Check if either contactId or entityId is provided, but not both
        if ((!contactId && !entityId) || (contactId && entityId)) {
            return res.status(400).json({
                success: false,
                error: "Either contactId or entityId must be provided, but not both"
            });
        }

        // Verify user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });
        
        if (!userExists) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Verify contact exists if provided
        if (contactId) {
            const contactExists = await prisma.contact.findUnique({
                where: { id: contactId },
                select: { id: true }
            });
            
            if (!contactExists) {
                return res.status(404).json({
                    success: false,
                    error: "Contact not found"
                });
            }
        }

        // Verify entity exists if provided
        if (entityId) {
            const entityExists = await prisma.globalEntity.findUnique({
                where: { id: entityId },
                select: { id: true }
            });
            
            if (!entityExists) {
                return res.status(404).json({
                    success: false,
                    error: "Entity not found"
                });
            }
        }

        // Verify relationship exists if provided
        if (relationshipId) {
            const relationshipExists = await prisma.relationship.findUnique({
                where: { id: relationshipId },
                select: { id: true }
            });
            
            if (!relationshipExists) {
                return res.status(404).json({
                    success: false,
                    error: "Relationship not found"
                });
            }
        }

        // Create the interaction
        const interaction = await prisma.interaction.create({
            data: {
                userId,
                contactId,
                entityId,
                relationshipId,
                type,
                title,
                description,
                timestamp: new Date(timestamp),
                metadata
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                contact: contactId ? {
                    select: { id: true, name: true, email: true }
                } : undefined,
                entity: entityId ? {
                    select: { id: true, name: true, type: true }
                } : undefined,
                relationship: relationshipId ? {
                    select: { id: true, relation: true, strength: true }
                } : undefined
            }
        });

        return res.status(201).json({
            success: true,
            message: "Interaction created successfully!",
            data: interaction
        });
    } catch (error) {
        console.error("Error creating interaction:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Create Interaction route!"
        });
    }
});

// GET all interactions with filtering
app.get("/api/interaction/get-all", async (req, res) => {
    try {
        const { 
            userId, 
            contactId, 
            entityId, 
            relationshipId,
            type,
            startDate,
            endDate
        } = req.query;

        const where: any = {};

        if (userId) where.userId = userId;
        if (contactId) where.contactId = contactId;
        if (entityId) where.entityId = entityId;
        if (relationshipId) where.relationshipId = relationshipId;
        if (type) where.type = type;

        // Date range filtering
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate as string);
            if (endDate) where.timestamp.lte = new Date(endDate as string);
        }

        const interactions = await prisma.interaction.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                contact: {
                    select: { id: true, name: true, email: true }
                },
                entity: {
                    select: { id: true, name: true, type: true }
                },
                relationship: {
                    select: { id: true, relation: true, strength: true }
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Interactions fetched successfully!",
            data: interactions,
            meta: {
                count: interactions.length
            }
        });
    } catch (error) {
        console.error("Error fetching interactions:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Get All Interactions route!"
        });
    }
});

// GET interaction by ID
app.get("/api/interaction/get-by-id/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const interaction = await prisma.interaction.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                contact: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                entity: {
                    select: { id: true, name: true, type: true, categories: true }
                },
                relationship: {
                    select: { 
                        id: true, 
                        relation: true, 
                        strength: true,
                        context: true,
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        if (!interaction) {
            return res.status(404).json({
                success: false,
                error: "Interaction not found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Interaction fetched successfully!",
            data: interaction
        });
    } catch (error) {
        console.error("Error fetching interaction:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Get Interaction By ID route!"
        });
    }
});

// UPDATE interaction
app.put("/api/interaction/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type,
            title,
            description,
            timestamp,
            metadata
        } = req.body;

        // Check if interaction exists
        const existing = await prisma.interaction.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: "Interaction not found"
            });
        }

        // Prepare update data
        const updateData: any = {
            ...(type !== undefined && { type }),
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(timestamp !== undefined && { timestamp: new Date(timestamp) }),
            ...(metadata !== undefined && { metadata }),
            updatedAt: new Date()
        };

        // Update the interaction
        const updated = await prisma.interaction.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                contact: existing.contactId ? {
                    select: { id: true, name: true, email: true }
                } : undefined,
                entity: existing.entityId ? {
                    select: { id: true, name: true, type: true }
                } : undefined,
                relationship: existing.relationshipId ? {
                    select: { id: true, relation: true, strength: true }
                } : undefined
            }
        });

        return res.status(200).json({
            success: true,
            message: "Interaction updated successfully!",
            data: updated
        });
    } catch (error) {
        console.error("Error updating interaction:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Update Interaction route!"
        });
    }
});

// DELETE interaction
app.delete("/api/interaction/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if interaction exists
        const interaction = await prisma.interaction.findUnique({
            where: { id }
        });

        if (!interaction) {
            return res.status(404).json({
                success: false,
                error: "Interaction not found"
            });
        }

        // Delete the interaction
        await prisma.interaction.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: "Interaction deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting interaction:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Delete Interaction route!"
        });
    }
});

// ====================================
// CONTACT ROLE ENDPOINTS
// ====================================

// CREATE Contact Role
app.post("/api/contact-role/create", async (req, res) => {
    try {
        const {
            contactId,
            entityId,
            role,
            startDate,
            endDate,
            metadata = {}
        } = req.body;

        // Validate input
        if (!contactId || !entityId || !role) {
            return res.status(400).json({
                success: false,
                error: "contactId, entityId, and role are required!"
            });
        }

        // Verify contact exists
        const contactExists = await prisma.contact.findUnique({
            where: { id: contactId },
            select: { id: true }
        });
        
        if (!contactExists) {
            return res.status(404).json({
                success: false,
                error: "Contact not found"
            });
        }

        // Verify entity exists
        const entityExists = await prisma.globalEntity.findUnique({
            where: { id: entityId },
            select: { id: true }
        });
        
        if (!entityExists) {
            return res.status(404).json({
                success: false,
                error: "Entity not found"
            });
        }

        // Check for existing role to prevent duplicates
        const existingRole = await prisma.contactRole.findFirst({
            where: {
                contactId,
                entityId,
                role,
                endDate: endDate ? new Date(endDate) : null
            }
        });

        if (existingRole) {
            return res.status(409).json({
                success: false,
                error: "A role with these parameters already exists"
            });
        }

        // Create the contact role
        const contactRole = await prisma.contactRole.create({
            data: {
                contactId,
                entityId,
                role,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
                metadata
            },
            include: {
                contact: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                entity: {
                    select: { id: true, name: true, type: true }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: "Contact role created successfully!",
            data: contactRole
        });
    } catch (error) {
        console.error("Error creating contact role:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Create Contact Role route!"
        });
    }
});

// GET all contact roles with filtering
app.get("/api/contact-role/get-all", async (req, res) => {
    try {
        const { 
            contactId, 
            entityId, 
            role,
        } = req.query;

        const where: any = {};

        if (contactId) where.contactId = contactId;
        if (entityId) where.entityId = entityId;
        if (role) where.role = role;

        const contactRoles = await prisma.contactRole.findMany({
            where,
            include: {
                contact: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                entity: {
                    select: { id: true, name: true, type: true, categories: true }
                }
            },
            orderBy: [
                { startDate: 'desc' }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Contact roles fetched successfully!",
            data: contactRoles,
            meta: {
                count: contactRoles.length
            }
        });
    } catch (error) {
        console.error("Error fetching contact roles:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Get All Contact Roles route!"
        });
    }
});

// GET contact role by ID
app.get("/api/contact-role/get-by-id/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const contactRole = await prisma.contactRole.findUnique({
            where: { id },
            include: {
                contact: {
                    select: { 
                        id: true, 
                        name: true, 
                        email: true, 
                        phone: true,
                        location: true
                    }
                },
                entity: {
                    select: { 
                        id: true, 
                        name: true, 
                        type: true, 
                        categories: true,
                        location: true
                    }
                }
            }
        });

        if (!contactRole) {
            return res.status(404).json({
                success: false,
                error: "Contact role not found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact role fetched successfully!",
            data: contactRole
        });
    } catch (error) {
        console.error("Error fetching contact role:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Get Contact Role By ID route!"
        });
    }
});

// UPDATE contact role
app.put("/api/contact-role/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            role,
            startDate,
            endDate,
            metadata
        } = req.body;

        // Check if contact role exists
        const existing = await prisma.contactRole.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: "Contact role not found"
            });
        }

        // Prepare update data
        const updateData: any = {
            ...(role !== undefined && { role }),
            ...(startDate !== undefined && { startDate: new Date(startDate) }),
            ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            ...(metadata !== undefined && { metadata }),
            updatedAt: new Date()
        };

        // Update the contact role
        const updated = await prisma.contactRole.update({
            where: { id },
            data: updateData,
            include: {
                contact: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                entity: {
                    select: { id: true, name: true, type: true }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Contact role updated successfully!",
            data: updated
        });
    } catch (error) {
        console.error("Error updating contact role:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Update Contact Role route!"
        });
    }
});

// DELETE contact role
app.delete("/api/contact-role/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if contact role exists
        const contactRole = await prisma.contactRole.findUnique({
            where: { id }
        });

        if (!contactRole) {
            return res.status(404).json({
                success: false,
                error: "Contact role not found"
            });
        }

        // Delete the contact role
        await prisma.contactRole.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: "Contact role deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting contact role:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error in Delete Contact Role route!"
        });
    }
});

app.post('/api/query', express.json(), async (req, res) => {
    try {
        const { question, userId } = req.body;
        
        if (!question || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Question and userId are required'
            });
        }

        const result = await runGemini(question, userId);
        res.json(result);
    } catch (err) {
        console.error('Query Error:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to process your query',
            details: process.env.NODE_ENV === 'development' ? err : undefined
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});