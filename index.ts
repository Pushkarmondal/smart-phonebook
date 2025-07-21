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
                type: ContactType.PERSON,
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
        console.log(error)
        return res.status(500).json({error: "Internal server error in Search Contact route!"});
    }
})

// POST /relationships
app.post("/api/relationship/create", async(req, res) => {
    try {
        const {userId, contactId, relation, visibility, notes} = req.body;
        if(!userId || !contactId || !relation) {
            return res.status(400).json({error: "User ID, Contact ID and Relation are required!"});
        }
        const relationship = await prisma.relationship.create({
            data: {
                user: {
                    connect: {
                        id: userId
                    }
                },
                contact: {
                    connect: {
                        id: contactId
                    }
                },
                relation,
                visibility,
                notes
            }
        })
        return res.status(201).json({message: "Relationship created successfully!", relationship});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error in Create Relationship route!"});
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

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});