import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { login } from '../controllers/authController.js';

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crisisconnect');
  console.log('Connected to MongoDB');

  // Insert test admin document into `admins` collection matching user's exact specification
  await mongoose.connection.db.collection('admins').updateOne(
    { email: 'admin@example.com' },
    {
      $set: {
        email: 'admin@example.com',
        password: 'admin@123',
        department: 'State Emergency Command Center',
        accessLevel: 'SuperAdmin',
        badgeNumber: 'CMD-001',
        permissions: ['ALL_PERMISSIONS', 'MANAGE_REQUESTS', 'MODERATE_DUPLICATES', 'DISPATCH_VOLUNTEERS', 'EXPORT_REPORTS'],
        dutyStatus: 'On Duty'
      }
    },
    { upsert: true }
  );

  const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
  };

  // Test Case A: Correct admin email + correct password
  console.log('\n--- Test Case A: Correct admin email + correct password ---');
  const reqA = { body: { email: 'admin@example.com', password: 'admin@123' } };
  const resA = mockRes();
  await login(reqA, resA, (err) => console.error(err));
  console.log('Result A (Should be Admin, success: true):');
  console.log(JSON.stringify(resA.data, null, 2));

  // Test Case B: Correct admin email + wrong password
  console.log('\n--- Test Case B: Correct admin email + wrong password ---');
  const reqB = { body: { email: 'admin@example.com', password: 'wrongpassword' } };
  const resB = mockRes();
  await login(reqB, resB, (err) => console.error(err));
  console.log('Result B (Should be status 401, success: false):');
  console.log('Status:', resB.statusCode, 'Data:', JSON.stringify(resB.data));

  // Test Case C: Non-admin non-existent email
  console.log('\n--- Test Case C: Non-admin non-existent email ---');
  const reqC = { body: { email: 'random@nobody.com', password: 'anypassword' } };
  const resC = mockRes();
  await login(reqC, resC, (err) => console.error(err));
  console.log('Result C (Should be status 401, success: false):');
  console.log('Status:', resC.statusCode, 'Data:', JSON.stringify(resC.data));

  // Test Case D: Existing non-admin login functionality
  console.log('\n--- Test Case D: Existing non-admin user login ---');
  const reqD = { body: { email: 'testcompass@test.com', password: 'testpassword123' } };
  const resD = mockRes();
  await login(reqD, resD, (err) => console.error(err));
  console.log('Result D (Should be Requester, success: true):');
  console.log('Role:', resD.data?.user?.role, 'Success:', resD.data?.success);

  process.exit(0);
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
