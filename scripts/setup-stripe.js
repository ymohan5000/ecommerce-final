#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Stripe Payment Gateway Setup\n');

const questions = [
  {
    name: 'stripeSecretKey',
    message: 'Enter your Stripe Secret Key (starts with sk_test_ or sk_live_): ',
    validate: (input) => input.startsWith('sk_') ? true : 'Invalid Stripe secret key format'
  },
  {
    name: 'stripePublishableKey',
    message: 'Enter your Stripe Publishable Key (starts with pk_test_ or pk_live_): ',
    validate: (input) => input.startsWith('pk_') ? true : 'Invalid Stripe publishable key format'
  },
  {
    name: 'webhookSecret',
    message: 'Enter your Stripe Webhook Secret (optional, can be added later): ',
    validate: (input) => input === '' || input.startsWith('whsec_') ? true : 'Invalid webhook secret format'
  },
  {
    name: 'mongodbUri',
    message: 'Enter your MongoDB connection string: ',
    validate: (input) => input.includes('mongodb') ? true : 'Invalid MongoDB connection string'
  },
  {
    name: 'jwtSecret',
    message: 'Enter a JWT secret (or press enter to generate one): ',
    validate: (input) => input === '' || input.length >= 32 ? true : 'JWT secret must be at least 32 characters'
  }
];

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.message, (answer) => {
      if (question.validate) {
        const validation = question.validate(answer);
        if (validation !== true) {
          console.log(`❌ ${validation}`);
          askQuestion(question).then(resolve);
          return;
        }
      }
      resolve(answer);
    });
  });
}

async function generateJWTSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

async function setup() {
  const answers = {};
  
  for (const question of questions) {
    let answer = await askQuestion(question);
    
    if (question.name === 'jwtSecret' && answer === '') {
      answer = await generateJWTSecret();
      console.log(`✅ Generated JWT secret: ${answer}`);
    }
    
    answers[question.name] = answer;
  }

  const envContent = `# Stripe Configuration
STRIPE_SECRET_KEY=${answers.stripeSecretKey}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${answers.stripePublishableKey}
${answers.webhookSecret ? `STRIPE_WEBHOOK_SECRET=${answers.webhookSecret}` : '# STRIPE_WEBHOOK_SECRET=your_webhook_secret_here'}

# Database Configuration
MONGODB_URI=${answers.mongodbUri}

# JWT Configuration
JWT_SECRET=${answers.jwtSecret}

# Next.js Configuration
NEXTAUTH_SECRET=${answers.jwtSecret}
NEXTAUTH_URL=http://localhost:3001
`;

  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment variables saved to .env.local');
    console.log('\n📋 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the payment flow with Stripe test cards');
    console.log('3. Set up webhooks in your Stripe Dashboard');
    console.log('4. Check the STRIPE_SETUP.md file for detailed instructions');
  } catch (error) {
    console.error('❌ Error saving .env.local file:', error.message);
  }

  rl.close();
}

setup().catch(console.error); 