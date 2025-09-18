import connectDB from './mongodb.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Team from '../models/Team.js';

// Optional: clear old data for reseeding
async function clearDatabase() {
  await User.deleteMany({});
  await Department.deleteMany({});
  await Team.deleteMany({});
  console.log("🗑️ Cleared old data");
}

async function seedDatabase() {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...');

    // Clear old data
    await clearDatabase();

    // --- Departments ---
    const departmentsData = [
      { name: 'Information Technology', code: 'IT', description: 'IT Department responsible for technology infrastructure and development' },
      { name: 'Human Resources', code: 'HR', description: 'HR Department responsible for employee management and policies' },
      { name: 'Finance', code: 'FIN', description: 'Finance Department responsible for financial planning and reporting' },
      { name: 'Marketing', code: 'MKT', description: 'Marketing Department responsible for brand and product promotion' },
      { name: 'Operations', code: 'OPS', description: 'Operations Department responsible for day-to-day business operations' }
    ];

    const createdDepartments = [];
    for (const dept of departmentsData) {
      const newDept = new Department(dept);
      await newDept.save();
      createdDepartments.push(newDept);
      console.log(`✅ Created department: ${dept.name}`);
    }

    // --- Teams ---
    const teamsData = [
      { name: 'Development Team', code: 'DEV', description: 'Software development team', department: createdDepartments[0]._id },
      { name: 'QA Team', code: 'QA', description: 'Quality assurance team', department: createdDepartments[0]._id },
      { name: 'Recruitment Team', code: 'REC', description: 'Employee recruitment team', department: createdDepartments[1]._id },
      { name: 'Payroll Team', code: 'PAY', description: 'Payroll and benefits team', department: createdDepartments[1]._id }
    ];

    const createdTeams = [];
    for (const team of teamsData) {
      const newTeam = new Team(team);
      await newTeam.save();
      createdTeams.push(newTeam);
      console.log(`✅ Created team: ${team.name}`);
    }

    // --- Users helper ---
    async function createUser(userData) {
      const user = new User(userData); // password will hash automatically via schema
      await user.save();
      console.log(`✅ Created user: ${userData.email}`);
      return user;
    }

    // --- Admin ---
    const admin = await createUser({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@company.com',
      password: 'Admin123!',
      role: 'admin',
      employeeId: 'ADM001',
      position: 'System Administrator',
      permissions: ['manage_users', 'manage_departments', 'approve_results', 'view_reports'],
      isActive: true
    });

    // --- Team Leader ---
    const leader = await createUser({
      firstName: 'John',
      lastName: 'Leader',
      email: 'leader@company.com',
      password: 'Leader123!',
      role: 'team-leader',
      department: createdDepartments[0]._id,
      team: createdTeams[0]._id,
      employeeId: 'TL001',
      position: 'Development Team Lead',
      permissions: ['create_task', 'edit_task', 'delete_task', 'evaluate_peer', 'evaluate_self', 'view_reports'],
      isActive: true
    });

    // Assign leader to team
    await Team.findByIdAndUpdate(createdTeams[0]._id, { leader: leader._id });

    // --- Sample Employees ---
    const employeesData = [
      { firstName: 'Alice', lastName: 'Developer', email: 'alice@company.com', password: 'Employee123!', role: 'employee', department: createdDepartments[0]._id, team: createdTeams[0]._id, employeeId: 'EMP001', position: 'Software Developer', permissions: ['evaluate_self', 'evaluate_peer'], isActive: true },
      { firstName: 'Bob', lastName: 'Tester', email: 'bob@company.com', password: 'Employee123!', role: 'employee', department: createdDepartments[0]._id, team: createdTeams[1]._id, employeeId: 'EMP002', position: 'QA Engineer', permissions: ['evaluate_self', 'evaluate_peer'], isActive: true },
      { firstName: 'Carol', lastName: 'Recruiter', email: 'carol@company.com', password: 'Employee123!', role: 'employee', department: createdDepartments[1]._id, team: createdTeams[2]._id, employeeId: 'EMP003', position: 'Recruitment Specialist', permissions: ['evaluate_self', 'evaluate_peer'], isActive: true }
    ];

    for (const emp of employeesData) {
      await createUser(emp);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default login credentials:');
    console.log('Admin: admin@company.com / Admin123!');
    console.log('Team Leader: leader@company.com / Leader123!');
    console.log('Employee: alice@company.com / Employee123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // optional: process.exit(0) if you want to force exit
  }
}

// Run seeder
  seedDatabase();

export default seedDatabase;
