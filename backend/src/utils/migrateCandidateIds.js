import { User } from '../models/User.js';
import { generateCandidateId } from './generateCandidateId.js';

export async function migrateCandidateIds() {
  try {
    // 1. Migrate Admin
    const admins = await User.find({ role: 'admin', candidateId: { $exists: false } });
    for (const admin of admins) {
      admin.candidateId = 'PXADMIN01';
      await admin.save();
      console.log(`Migrated admin ${admin.email} to candidateId PXADMIN01`);
    }

    // 2. Migrate Students
    const students = await User.find({ role: 'student', candidateId: { $exists: false } }).sort({ createdAt: 1 });
    
    for (const student of students) {
      const newId = await generateCandidateId();
      student.candidateId = newId;
      await student.save();
      console.log(`Migrated student ${student.email} to candidateId ${newId}`);
    }

    if (admins.length === 0 && students.length === 0) {
      // console.log('All existing users already have candidate IDs.');
    } else {
      console.log('Candidate ID migration completed successfully.');
    }
  } catch (error) {
    console.error('Error migrating candidate IDs:', error);
  }
}
