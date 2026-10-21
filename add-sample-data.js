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

async function addSampleData() {
    try {
        console.log('Adding sample data...');

        // 1. Add sample users
        const userPassword = await bcrypt.hash('password123', 10);
        
        await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING", ['admin@organ.com', userPassword]);
        await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING", ['doctor@hospital.com', userPassword]);
        await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING", ['coordinator@organ.com', userPassword]);
        
        console.log('✓ Sample users added');

        // 2. Add initial sample donors
        const initialDonors = [
            { name: 'John Smith', age: 35, gender: 'Male', blood_group: 'O+', phone: '555-0101' },
            { name: 'Sarah Johnson', age: 42, gender: 'Female', blood_group: 'A+', phone: '555-0102' },
            { name: 'Michael Brown', age: 28, gender: 'Male', blood_group: 'B+', phone: '555-0103' },
            { name: 'Emily Davis', age: 31, gender: 'Female', blood_group: 'AB+', phone: '555-0104' },
            { name: 'Robert Wilson', age: 45, gender: 'Male', blood_group: 'O-', phone: '555-0105' }
        ];

        for (const donor of initialDonors) {
            const personResult = await pool.query(
                "INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING person_id",
                [donor.name, donor.age, donor.gender, donor.blood_group, donor.phone]
            );
            
            if (personResult.rows.length > 0) {
                await pool.query("INSERT INTO donor (donor_id, consent) VALUES ($1, $2)", [personResult.rows[0].person_id, true]);
            }
        }

        console.log('✓ Initial donors added');

        // 3. Add sample recipients
        const initialRecipients = [
            { name: 'Alice Thompson', age: 38, gender: 'Female', blood_group: 'O+', phone: '555-0201', organ_needed: 'Kidney', urgency: 4 },
            { name: 'James Miller', age: 52, gender: 'Male', blood_group: 'A+', phone: '555-0202', organ_needed: 'Heart', urgency: 5 },
            { name: 'Linda Garcia', age: 29, gender: 'Female', blood_group: 'B+', phone: '555-0203', organ_needed: 'Liver', urgency: 3 },
            { name: 'David Martinez', age: 41, gender: 'Male', blood_group: 'AB+', phone: '555-0204', organ_needed: 'Kidney', urgency: 2 },
            { name: 'Jennifer Anderson', age: 33, gender: 'Female', blood_group: 'O-', phone: '555-0205', organ_needed: 'Heart', urgency: 5 }
        ];

        for (const recipient of initialRecipients) {
            const personResult = await pool.query(
                "INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING person_id",
                [recipient.name, recipient.age, recipient.gender, recipient.blood_group, recipient.phone]
            );
            
            if (personResult.rows.length > 0) {
                await pool.query("INSERT INTO recipient (recipient_id, organ_needed, urgency_level) VALUES ($1, $2, $3)", 
                    [personResult.rows[0].person_id, recipient.organ_needed, recipient.urgency]);
            }
        }

        console.log('✓ Initial recipients added');

        // 4. Add sample organs
        const initialOrgans = [
            { donor_id: 1, organ_type: 'Kidney' },
            { donor_id: 1, organ_type: 'Liver' },
            { donor_id: 2, organ_type: 'Heart' },
            { donor_id: 2, organ_type: 'Lungs' },
            { donor_id: 3, organ_type: 'Kidney' },
            { donor_id: 3, organ_type: 'Pancreas' },
            { donor_id: 4, organ_type: 'Liver' },
            { donor_id: 4, organ_type: 'Intestine' },
            { donor_id: 5, organ_type: 'Cornea' }
        ];

        for (const organ of initialOrgans) {
            let hours;
            switch(organ.organ_type) {
                case 'Heart': hours = 6; break;
                case 'Lungs': hours = 6; break;
                case 'Liver': hours = 12; break;
                case 'Pancreas': hours = 12; break;
                case 'Kidney': hours = 24; break;
                case 'Intestine': hours = 24; break;
                case 'Cornea': hours = 48; break;
                default: hours = 24;
            }
            await pool.query(
                "INSERT INTO organ (donor_id, organ_type, expiry_time) VALUES ($1, $2, NOW() + INTERVAL '1 hour' * $3) ON CONFLICT DO NOTHING",
                [organ.donor_id, organ.organ_type, hours]
            );
        }

        console.log('✓ Initial organs added');

        // 5. Add sample hospital
        await pool.query("INSERT INTO hospital (hospital_id, name, location) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", 
            [1, 'City General Hospital', 'New York']);

        console.log('✓ Sample hospital added');

        // 6. Check final data counts
        const donorsCount = await pool.query("SELECT COUNT(*) as count FROM donor");
        const recipientsCount = await pool.query("SELECT COUNT(*) as count FROM recipient");
        const organsCount = await pool.query("SELECT COUNT(*) as count FROM organ WHERE availability_status = 'available'");

        console.log('\n=== Sample Data Added Successfully ===');
        console.log(`Total Donors: ${donorsCount.rows[0].count}`);
        console.log(`Total Recipients: ${recipientsCount.rows[0].count}`);
        console.log(`Available Organs: ${organsCount.rows[0].count}`);
        
        console.log('\n✅ Sample data initialized successfully!');
        
    } catch (error) {
        console.error('Error adding sample data:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

addSampleData();
