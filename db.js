const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_eKb2US7WvRfY@ep-still-meadow-b72bil6d-pooler.c-13.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const pool = new Pool({
    connectionString: connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

const db = pool;

// Sample Data Initialization Function
async function initializeSampleData() {
    try {
        console.log('Initializing sample data...');

        // 1. Add sample users
        const userPassword = await bcrypt.hash('password123', 10);
        
        await db.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING", ['admin@organ.com', userPassword]);
        await db.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING", ['doctor@hospital.com', userPassword]);
        await db.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING", ['coordinator@organ.com', userPassword]);
        
        console.log('Sample users added');

        // 2. Add initial sample donors
        const initialDonors = [
            { name: 'John Smith', age: 35, gender: 'Male', blood_group: 'O+', phone: '555-0101' },
            { name: 'Sarah Johnson', age: 42, gender: 'Female', blood_group: 'A+', phone: '555-0102' },
            { name: 'Michael Brown', age: 28, gender: 'Male', blood_group: 'B+', phone: '555-0103' },
            { name: 'Emily Davis', age: 31, gender: 'Female', blood_group: 'AB+', phone: '555-0104' },
            { name: 'Robert Wilson', age: 45, gender: 'Male', blood_group: 'O-', phone: '555-0105' }
        ];

        for (const donor of initialDonors) {
            const personResult = await db.query(
                "INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING person_id",
                [donor.name, donor.age, donor.gender, donor.blood_group, donor.phone]
            );
            
            if (personResult.rows.length > 0) {
                await db.query("INSERT INTO donor (donor_id, consent) VALUES ($1, $2)", [personResult.rows[0].person_id, true]);
            }
        }

        console.log('Initial donors added');

        // 3. Add additional donors
        const additionalDonors = [
            { name: 'William Chen', age: 39, gender: 'Male', blood_group: 'A-', phone: '555-0301' },
            { name: 'Maria Rodriguez', age: 27, gender: 'Female', blood_group: 'B-', phone: '555-0302' },
            { name: 'James Taylor', age: 51, gender: 'Male', blood_group: 'O+', phone: '555-0303' },
            { name: 'Patricia Lee', age: 33, gender: 'Female', blood_group: 'AB-', phone: '555-0304' },
            { name: 'Christopher Kim', age: 44, gender: 'Male', blood_group: 'A+', phone: '555-0305' },
            { name: 'Jennifer White', age: 29, gender: 'Female', blood_group: 'B+', phone: '555-0306' },
            { name: 'Daniel Harris', age: 37, gender: 'Male', blood_group: 'O-', phone: '555-0307' },
            { name: 'Lisa Martin', age: 46, gender: 'Female', blood_group: 'A-', phone: '555-0308' },
            { name: 'Robert Thompson', age: 32, gender: 'Male', blood_group: 'AB+', phone: '555-0309' },
            { name: 'Nancy Garcia', age: 41, gender: 'Female', blood_group: 'B-', phone: '555-0310' },
            { name: 'Michael Clark', age: 35, gender: 'Male', blood_group: 'O+', phone: '555-0311' },
            { name: 'Susan Lewis', age: 48, gender: 'Female', blood_group: 'A+', phone: '555-0312' },
            { name: 'David Walker', age: 26, gender: 'Male', blood_group: 'B+', phone: '555-0313' },
            { name: 'Karen Hall', age: 43, gender: 'Female', blood_group: 'AB-', phone: '555-0314' },
            { name: 'Thomas Allen', age: 38, gender: 'Male', blood_group: 'O-', phone: '555-0315' }
        ];

        for (const donor of additionalDonors) {
            const personResult = await db.query(
                "INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING person_id",
                [donor.name, donor.age, donor.gender, donor.blood_group, donor.phone]
            );
            
            if (personResult.rows.length > 0) {
                await db.query("INSERT INTO donor (donor_id, consent) VALUES ($1, $2)", [personResult.rows[0].person_id, true]);
            }
        }

        console.log('Additional donors added');

        // 4. Add initial sample recipients
        const initialRecipients = [
            { name: 'Alice Thompson', age: 38, gender: 'Female', blood_group: 'O+', phone: '555-0201', organ_needed: 'Kidney', urgency: 4 },
            { name: 'James Miller', age: 52, gender: 'Male', blood_group: 'A+', phone: '555-0202', organ_needed: 'Heart', urgency: 5 },
            { name: 'Linda Garcia', age: 29, gender: 'Female', blood_group: 'B+', phone: '555-0203', organ_needed: 'Liver', urgency: 3 },
            { name: 'David Martinez', age: 41, gender: 'Male', blood_group: 'AB+', phone: '555-0204', organ_needed: 'Kidney', urgency: 2 },
            { name: 'Jennifer Anderson', age: 33, gender: 'Female', blood_group: 'O-', phone: '555-0205', organ_needed: 'Heart', urgency: 5 }
        ];

        for (const recipient of initialRecipients) {
            const personResult = await db.query(
                "INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING person_id",
                [recipient.name, recipient.age, recipient.gender, recipient.blood_group, recipient.phone]
            );
            
            if (personResult.rows.length > 0) {
                await db.query("INSERT INTO recipient (recipient_id, organ_needed, urgency_level) VALUES ($1, $2, $3)", 
                    [personResult.rows[0].person_id, recipient.organ_needed, recipient.urgency]);
            }
        }

        console.log('Initial recipients added');

        // 5. Add additional recipients
        const additionalRecipients = [
            { name: 'Richard Brown', age: 55, gender: 'Male', blood_group: 'A-', phone: '555-0401', organ_needed: 'Kidney', urgency: 3 },
            { name: 'Elizabeth Davis', age: 31, gender: 'Female', blood_group: 'B-', phone: '555-0402', organ_needed: 'Heart', urgency: 5 },
            { name: 'Charles Miller', age: 47, gender: 'Male', blood_group: 'O+', phone: '555-0403', organ_needed: 'Liver', urgency: 2 },
            { name: 'Barbara Wilson', age: 36, gender: 'Female', blood_group: 'AB-', phone: '555-0404', organ_needed: 'Kidney', urgency: 4 },
            { name: 'Joseph Moore', age: 58, gender: 'Male', blood_group: 'A+', phone: '555-0405', organ_needed: 'Heart', urgency: 5 },
            { name: 'Margaret Taylor', age: 42, gender: 'Female', blood_group: 'B+', phone: '555-0406', organ_needed: 'Liver', urgency: 3 },
            { name: 'Thomas Anderson', age: 39, gender: 'Male', blood_group: 'O-', phone: '555-0407', organ_needed: 'Kidney', urgency: 1 },
            { name: 'Dorothy Thomas', age: 51, gender: 'Female', blood_group: 'A-', phone: '555-0408', organ_needed: 'Heart', urgency: 4 },
            { name: 'Paul Jackson', age: 34, gender: 'Male', blood_group: 'AB+', phone: '555-0409', organ_needed: 'Liver', urgency: 2 },
            { name: 'Linda White', age: 45, gender: 'Female', blood_group: 'B-', phone: '555-0410', organ_needed: 'Kidney', urgency: 3 },
            { name: 'Mark Harris', age: 28, gender: 'Male', blood_group: 'O+', phone: '555-0411', organ_needed: 'Heart', urgency: 5 },
            { name: 'Sandra Martin', age: 53, gender: 'Female', blood_group: 'A+', phone: '555-0412', organ_needed: 'Liver', urgency: 4 },
            { name: 'Kevin Thompson', age: 40, gender: 'Male', blood_group: 'B+', phone: '555-0413', organ_needed: 'Kidney', urgency: 2 },
            { name: 'Ashley Garcia', age: 37, gender: 'Female', blood_group: 'AB-', phone: '555-0414', organ_needed: 'Heart', urgency: 5 },
            { name: 'Brian Martinez', age: 49, gender: 'Male', blood_group: 'O-', phone: '555-0415', organ_needed: 'Liver', urgency: 3 }
        ];

        for (const recipient of additionalRecipients) {
            const personResult = await db.query(
                "INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING person_id",
                [recipient.name, recipient.age, recipient.gender, recipient.blood_group, recipient.phone]
            );
            
            if (personResult.rows.length > 0) {
                await db.query("INSERT INTO recipient (recipient_id, organ_needed, urgency_level) VALUES ($1, $2, $3)", 
                    [personResult.rows[0].person_id, recipient.organ_needed, recipient.urgency]);
            }
        }

        console.log('Additional recipients added');

        // 6. Add sample organs (initial set)
        const initialOrgans = [
            { donor_id: 1, organ_type: 'Kidney' },
            { donor_id: 1, organ_type: 'Liver' },
            { donor_id: 2, organ_type: 'Heart' },
            { donor_id: 3, organ_type: 'Kidney' },
            { donor_id: 4, organ_type: 'Liver' }
        ];

        for (const organ of initialOrgans) {
            let hours = organ.organ_type === 'Heart' ? 6 : organ.organ_type === 'Liver' ? 12 : 24;
            await db.query(
                "INSERT INTO organ (donor_id, organ_type, expiry_time) VALUES ($1, $2, NOW() + INTERVAL '1 hour' * $3) ON CONFLICT DO NOTHING",
                [organ.donor_id, organ.organ_type, hours]
            );
        }

        console.log('Initial organs added');

        // 7. Add additional organs
        const organTypes = ['Kidney', 'Liver', 'Heart'];
        const additionalOrgans = [];
        
        // Add organs from donors 6-20 (the new donors)
        for (let donorId = 6; donorId <= 20; donorId++) {
            const organType = organTypes[Math.floor(Math.random() * organTypes.length)];
            additionalOrgans.push({ donor_id: donorId, organ_type: organType });
        }
        
        // Add some additional organs from existing donors
        additionalOrgans.push(
            { donor_id: 2, organ_type: 'Kidney' },
            { donor_id: 3, organ_type: 'Liver' },
            { donor_id: 4, organ_type: 'Heart' },
            { donor_id: 5, organ_type: 'Kidney' },
            { donor_id: 1, organ_type: 'Heart' }
        );

        for (const organ of additionalOrgans) {
            let hours = organ.organ_type === 'Heart' ? 6 : organ.organ_type === 'Liver' ? 12 : 24;
            await db.query(
                "INSERT INTO organ (donor_id, organ_type, expiry_time) VALUES ($1, $2, NOW() + INTERVAL '1 hour' * $3) ON CONFLICT DO NOTHING",
                [organ.donor_id, organ.organ_type, hours]
            );
        }

        console.log('Additional organs added');

        // 8. Add sample hospital
        await db.query("INSERT INTO hospital (hospital_id, name, location) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", 
            [1, 'City General Hospital', 'New York']);

        console.log('Sample hospital added');

        // 9. Check final data counts
        const donorsCount = await db.query("SELECT COUNT(*) as count FROM donor");
        const recipientsCount = await db.query("SELECT COUNT(*) as count FROM recipient");
        const organsCount = await db.query("SELECT COUNT(*) as count FROM organ WHERE availability_status = 'available'");

        console.log('\n=== Sample Data Initialization Complete ===');
        console.log(`Total Donors: ${donorsCount.rows[0].count}`);
        console.log(`Total Recipients: ${recipientsCount.rows[0].count}`);
        console.log(`Available Organs: ${organsCount.rows[0].count}`);
        
        // 10. Show sample potential matches
        const matches = await db.query("SELECT * FROM view_potential_matches LIMIT 5");
        if (matches.rows.length > 0) {
            console.log('\n=== Sample Potential Matches ===');
            matches.rows.forEach(match => {
                console.log(`${match.organ_type}: ${match.donor_name} -> ${match.recipient_name} (Urgency: ${match.urgency_level})`);
            });
        }

        console.log('\nSample data initialized successfully!');
        return {
            donors: donorsCount.rows[0].count,
            recipients: recipientsCount.rows[0].count,
            organs: organsCount.rows[0].count,
            matches: matches.rows.length
        };

    } catch (error) {
        console.error('Error initializing sample data:', error);
        throw error;
    }
}

// Export both the database pool and the initialization function
db.initializeSampleData = initializeSampleData;
module.exports = db;
