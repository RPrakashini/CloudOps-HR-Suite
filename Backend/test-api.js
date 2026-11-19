
const assert = require('node:assert/strict');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testEmployeeAPI() {
  console.log('Starting Employee API tests...');

  // 1. Check backend health
  let response = await fetch(`${API_URL}/`);
  assert.equal(response.status, 200);
  console.log('PASS: Backend health check');

  // 2. Add an employee
  response = await fetch(`${API_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Employee',
      position: 'Cloud Engineer'
    })
  });

  assert.equal(response.status, 201);
  const employee = await response.json();
  assert.ok(employee.id);
  console.log('PASS: Add employee');

  // 3. Retrieve employees
  response = await fetch(`${API_URL}/employees`);
  assert.equal(response.status, 200);

  let employees = await response.json();
  assert.ok(employees.some(item => item.id === employee.id));
  console.log('PASS: Get employees');

  // 4. Update employee
  response = await fetch(`${API_URL}/employees/${employee.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Updated Employee',
      position: 'DevOps Engineer'
    })
  });

  assert.equal(response.status, 200);
  const updated = await response.json();
  assert.equal(updated.name, 'Updated Employee');
  console.log('PASS: Update employee');

  // 5. Delete employee
  response = await fetch(`${API_URL}/employees/${employee.id}`, {
    method: 'DELETE'
  });

  assert.equal(response.status, 200);
  console.log('PASS: Delete employee');

  console.log('All Employee API tests passed!');
}

testEmployeeAPI().catch(error => {
  console.error('API tests failed:', error);
  process.exitCode = 1;
});
