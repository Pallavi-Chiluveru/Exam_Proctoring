import { User } from '../models/User.js';

/**
 * Generates the next sequential candidate ID for a student.
 * Format: YYPXNNN (e.g., 26PX001)
 */
export async function generateCandidateId() {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // '26'
  const prefix = `${yearSuffix}PX`;

  // Find the user with the highest candidate ID starting with the current prefix
  const lastUser = await User.findOne({
    candidateId: { $regex: `^${prefix}` },
    role: 'student'
  })
    .sort({ candidateId: -1 })
    .collation({ locale: 'en', numericOrdering: true }); // Ensure proper numeric sorting if NNN goes beyond 999

  let nextSequence = 1;

  if (lastUser && lastUser.candidateId) {
    // Extract the numeric part (e.g., from '26PX054' extract '054')
    const lastSequenceStr = lastUser.candidateId.replace(prefix, '');
    const lastSequence = parseInt(lastSequenceStr, 10);
    
    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  // Pad the sequence with leading zeros (e.g., 1 -> '001', 54 -> '054')
  const sequenceStr = nextSequence.toString().padStart(3, '0');
  
  return `${prefix}${sequenceStr}`;
}
