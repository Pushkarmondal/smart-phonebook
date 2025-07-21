import express from "express";
import { ContactType, PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

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

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});