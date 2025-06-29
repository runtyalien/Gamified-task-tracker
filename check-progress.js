const axios = require('axios');
const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';
const today = new Date().toISOString().split('T')[0];

axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`)
  .then(response => {
    const tasks = response.data.data;
    console.log('Current progress status:');
    tasks.forEach(task => {
      console.log(`\nTask: ${task.task_name}`);
      task.subtasks.forEach(st => {
        console.log(`  ${st.key}: ${st.completed ? 'COMPLETED' : 'pending'}`);
        if (st.submission) {
          console.log(`    - Has stored URLs: presigned=${!!st.submission.presigned_url}, s3_key=${!!st.submission.s3_key}`);
        }
      });
    });
  })
  .catch(console.error);
