require('dotenv').config();

console.log('Environment variables check:');
console.log('============================');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('');

if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}
