#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Gamified Task Tracker Backend Setup...\n');

const requiredFiles = [
  'server.js',
  'package.json',
  '.env.example',
  'README.md',
  'src/models/User.js',
  'src/models/Task.js',
  'src/models/TaskSubmission.js',
  'src/models/Reward.js',
  'src/controllers/taskController.js',
  'src/controllers/userController.js',
  'src/controllers/s3Controller.js',
  'src/controllers/progressController.js',
  'src/controllers/rewardController.js',
  'src/routes/taskRoutes.js',
  'src/routes/userRoutes.js',
  'src/routes/s3Routes.js',
  'src/routes/progressRoutes.js',
  'src/routes/rewardRoutes.js',
  'src/services/taskService.js',
  'src/middleware/errorHandler.js',
  'src/middleware/validation.js',
  'src/utils/s3Utils.js',
  'src/utils/dateUtils.js',
  'src/utils/seedData.js',
  'scripts/seed.js',
  'scripts/test-api.js'
];

const requiredDependencies = [
  'express',
  'mongoose', 
  'dotenv',
  'aws-sdk',
  'cors',
  'helmet',
  'morgan',
  'express-validator',
  'bcryptjs',
  'jsonwebtoken'
];

let allValid = true;

// Check files
console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allValid = false;
  }
});

// Check package.json and dependencies
console.log('\n📦 Checking package.json and dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.name === 'gamified-task-tracker-backend') {
    console.log('✅ Package name correctly set');
  } else {
    console.log('⚠️  Package name not set to gamified-task-tracker-backend');
  }
  
  if (packageJson.main === 'server.js') {
    console.log('✅ Main entry point correctly set to server.js');
  } else {
    console.log('❌ Main entry point should be server.js');
    allValid = false;
  }
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredDependencies.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} v${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allValid = false;
    }
  });
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allValid = false;
}

// Check .env file
console.log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  console.log('⚠️  Remember to configure AWS credentials and MongoDB URI');
} else {
  console.log('⚠️  .env file not found. Copy from .env.example and configure');
}

if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example file exists');
} else {
  console.log('❌ .env.example file missing');
  allValid = false;
}

// Check scripts
console.log('\n🎯 Available npm scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  Object.keys(packageJson.scripts || {}).forEach(script => {
    console.log(`  npm run ${script}`);
  });
} catch (error) {
  console.log('❌ Error reading scripts from package.json');
}

console.log('\n' + '='.repeat(60));

if (allValid) {
  console.log('🎉 Validation completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Configure .env file with your MongoDB URI and AWS credentials');
  console.log('2. Start MongoDB server');
  console.log('3. Run: npm run seed (to add sample data)');
  console.log('4. Run: npm run dev (to start development server)');
  console.log('5. Run: npm run test:api (to test all endpoints)');
  console.log('\n🔗 API will be available at: http://localhost:3000');
  console.log('🔗 Health check: http://localhost:3000/health');
} else {
  console.log('❌ Validation failed! Some files or dependencies are missing.');
  console.log('\nPlease ensure all required files are created and dependencies are installed.');
  process.exit(1);
}
