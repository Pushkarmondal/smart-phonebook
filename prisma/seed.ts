import { PrismaClient, ContactType, RelationType, Visibility, InteractionType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.interaction.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.contactRole.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared');

  // Create test users
  const password = await bcrypt.hash('password123', 10);
  
  const users: User[] = await Promise.all(
    Array(5).fill(0).map(async (_, i) => {
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: `user${i+1}@example.com`,
          password,
          phone: faker.phone.number()
        }
      });
    })
  );

  console.log(`✅ Created ${users.length} users`);

  // Create business contacts
  const businessContacts = await Promise.all(
    Array(10).fill(0).map(() => 
      prisma.contact.create({
        data: {
          name: faker.company.name(),
          type: ContactType.BUSINESS,
          email: faker.internet.email(),
          phone: faker.phone.number(),
          location: `${faker.location.city()}, ${faker.location.state()}`,
          tags: Array(3).fill(0).map(() => faker.commerce.department().toLowerCase()),
          addedBy: { connect: { id: users[0]?.id } } // First user adds all businesses
        }
      })
    )
  );

  // Create personal contacts
  const personalContacts = await Promise.all(
    Array(15).fill(0).map(() => 
      prisma.contact.create({
        data: {
          name: faker.person.fullName(),
          type: ContactType.PERSON,
          email: faker.internet.email(),
          phone: faker.phone.number(),
          tags: [faker.helpers.arrayElement(['friend', 'family', 'colleague', 'service'])],
          addedBy: { 
            connect: { 
              id: faker.helpers.arrayElement(users)?.id 
            } 
          }
        }
      })
    )
  );

  console.log(`✅ Created ${businessContacts.length + personalContacts.length} contacts`);

  // Create relationships
  const relationships = [];
  
  // Add some business relationships
  for (const user of users) {
    const businessCount = faker.number.int({ min: 2, max: 5 });
    const selectedBusinesses = faker.helpers.arrayElements(businessContacts, businessCount);
    
    for (const business of selectedBusinesses) {
      relationships.push(
        await prisma.relationship.create({
          data: {
            user: { connect: { id: user.id } },
            contact: { connect: { id: business.id } },
            relation: RelationType.BUSINESS,
            visibility: Visibility.PUBLIC,
            notes: `Customer since ${faker.date.past().getFullYear()}`
          }
        })
      );
    }
  }

  // Add personal relationships
  for (const user of users) {
    const personalCount = faker.number.int({ min: 3, max: 8 });
    const userContacts = personalContacts.filter(c => c.addedById !== user.id);
    const contactCount = Math.min(personalCount, userContacts.length);
    const selectedContacts = contactCount > 0 
      ? faker.helpers.arrayElements(userContacts, contactCount)
      : [];
    
    for (const contact of selectedContacts) {
      const relationType = faker.helpers.arrayElement([
        RelationType.FAMILY, 
        RelationType.FRIEND, 
        RelationType.HIRED,
        RelationType.BUSINESS
      ]);
      
      relationships.push(
        await prisma.relationship.create({
          data: {
            user: { connect: { id: user.id } },
            contact: { connect: { id: contact.id } },
            relation: relationType,
            visibility: faker.helpers.arrayElement([
              Visibility.PUBLIC, 
              Visibility.PRIVATE
            ]),
            notes: faker.lorem.sentence()
          }
        })
      );
    }
  }

  console.log(`✅ Created ${relationships.length} relationships`);

  // Create interactions
  const interactions = [];
  const interactionTypes = [
    InteractionType.CALL, 
    InteractionType.EMAIL, 
    InteractionType.MESSAGE, 
    InteractionType.HIRE
  ];

  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users);
    const contact = faker.helpers.arrayElement([...businessContacts, ...personalContacts]);
    const type = faker.helpers.arrayElement(interactionTypes);
    
    interactions.push(
      await prisma.interaction.create({
        data: {
          user: { connect: { id: user.id } },
          contact: { connect: { id: contact.id } },
          type,
          timestamp: faker.date.past(),
          duration: type === InteractionType.CALL 
            ? faker.number.int({ min: 30, max: 1800 }) 
            : null,
          notes: faker.lorem.sentence(),
          metadata: {
            subject: type === InteractionType.EMAIL || type === InteractionType.MESSAGE
              ? faker.lorem.sentence(5)
              : null,
            status: faker.helpers.arrayElement(['completed', 'missed', 'scheduled']),
            priority: faker.helpers.arrayElement(['low', 'medium', 'high'])
          }
        }
      })
    );
  }

  console.log(`✅ Created ${interactions.length} interactions`);

  // Create contact roles (for businesses)
  const roles = [];
  
  for (const business of businessContacts) {
    const roleCount = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < roleCount; i++) {
      roles.push(
        await prisma.contactRole.create({
          data: {
            contact: { connect: { id: business.id } },
            role: faker.person.jobTitle(),
            location: faker.location.city()
          }
        })
      );
    }
  }

  console.log(`✅ Created ${roles.length} contact roles`);
  console.log('\n🌱 Seeding completed!');
  console.log('\nTest user credentials:');
  console.log('-------------------');
  users.forEach((user, i) => {
    console.log(`User ${i + 1}: ${user.email} / password123`);
  });
  console.log('-------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
