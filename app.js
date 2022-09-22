const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
const mysql = require('mysql2');
const { promise } = require("./db/connection");


// MAIN MENU
const displayMenu = () => {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'mainMenu',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employee Role',
        'Delete a Department',
        'Delete a Role',
        new inquirer.Separator(),
        'Exit Application',
        new inquirer.Separator(),
      ]
    }
  ]).then(menuResponse => {
    switch (menuResponse.mainMenu) {
      case 'View All Departments':
        viewDepartments();
        break;
      case 'View All Roles':
        viewRoles();
        break;
      case 'View All Employees':
        viewEmployees();
        break;
      case 'Add a Department':
        addDepartment();
        break;
      case 'Add a Role':
        addRole();
        break;
      case 'Add an Employee':
        addEmployee();
        break;
      case 'Update an Employee Role':
        updateEmployee();
        break;
      case 'Delete a Department':
        deleteDepartment();
        break;
      case 'Delete a Role':
        deleteRole();
        break;
      case 'Exit Application':
        console.log('Goodbye!')
      default:
        process.exit();
    }
  });
};


// MENU FUNCTIONALITY
const viewDepartments = () => {
  db.query(`SELECT departments.id, departments.dept_name AS name FROM departments`,
    (err, rows) => {
      if (err) {
        throw err;
      }
      console.table(rows);
      displayMenu();
    }
  );
};

// —————————————————————————————————————————————————————————————————————————————

const viewRoles = () => {
  db.query(
    `SELECT roles.id, roles.title, departments.dept_name AS department, roles.salary
      FROM roles 
      LEFT JOIN departments
      ON roles.department_id=departments.id`,
    (err, rows) => {
      if (err) {
        throw err;
      }
      console.table(rows);
      displayMenu();
    }
  );
};

// —————————————————————————————————————————————————————————————————————————————

const viewEmployees = () => {
  db.query(
    `SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      r.title AS role,
      r.salary AS salary,
      d.dept_name AS department,
      CONCAT (m.first_name, " " ,m.last_name) AS manager
      FROM employees e
      LEFT JOIN roles r
      ON e.role_id = r.id
      LEFT JOIN departments d
      ON r.department_id = d.id
      LEFT JOIN employees m
      ON e.manager_id = m.id`,
    (err, results) => {
      if (err) {
        throw err;
      }
      console.table(results);
      displayMenu();
    }
  );
};

// —————————————————————————————————————————————————————————————————————————————

const addDepartment = () => {
  inquirer.prompt(
    [{
      type: 'input',
      name: 'dept_name',
      message: 'What is the name of the department?',
      validate: (dept_name) => {
        if (dept_name) {
          return true;
        } else {
          console.log("You must enter a name for the department!");
          return false;
        }
      }
    }]
  )
    .then((newDepartment) => {
      db.query(
        `INSERT INTO departments (dept_name) VALUES (?)`,
        newDepartment.dept_name,
        (err, rows) => {
          if (err) {
            throw err;
          }
          console.log('Success! The department has been added to database!');
          displayMenu();
        }
      );
    })
};

// —————————————————————————————————————————————————————————————————————————————

const addRole = () => {
  db.query("SELECT * FROM departments", function (err, rows) {
    if (err) {
      throw err;
    }
    inquirer.prompt(
      [
        {
          type: 'input',
          name: 'title',
          message: 'What is the name of the role?',
          validate: (title) => {
            if (title) {
              return true;
            } else {
              console.log("You must enter a name for the role!");
              return false;
            }
          }
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary for the role?',
          validate: (salary) => {
            if (salary) {
              return true;
            } else {
              console.log("You must enter a salary for the role!");
              return false;
            }
          }
        },
        {
          // USER CAN SELECT A DEPEARTMEMT FROM A LIST
          type: "list",
          name: "department",
          message: "Which department does the role belong to?",
          choices: function () {
            const departmentChoices = [];
            for (let i = 0; i < rows.length; i++) {
              departmentChoices.push(rows[i].dept_name);
            }
            return departmentChoices;
          }
        }
      ]
    )
      .then((newRole) => {
        let departmentSelection;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].dept_name == newRole.department) {
            departmentSelection = rows[i].id;
          }
        }
        db.query(
          `INSERT INTO roles SET ?`,
          {
            title: newRole.title,
            salary: newRole.salary,
            department_id: departmentSelection
          },
          (err, rows) => {
            if (err) {
              throw err;
            }
            console.log('Success! The role has been added to database.');
            displayMenu();
          }
        );
      })
  });
}

// —————————————————————————————————————————————————————————————————————————————

const addEmployee = () => {
  db.query("SELECT * FROM roles", function (err, rows) {
    if (err) {
      throw err;
    }
    inquirer.prompt(
      [
        {
          type: 'input',
          name: 'firstName',
          message: "What is the employee's first name?",
          validate: (firstName) => {
            if (firstName) {
              return true;
            } else {
              console.log("You must enter a first name for the employee!");
              return false;
            }
          }
        },
        {
          type: 'input',
          name: 'lastName',
          message: "What is the employee's last name?",
          validate: (lastName) => {
            if (lastName) {
              return true;
            } else {
              console.log("You must enter a last name for the employee!");
              return false;
            }
          }
        },
        {
          // USER CAN SELECT A ROLE FROM A LIST
          type: "list",
          name: "role",
          message: "What is the employee's role?",
          choices: function () {
            const roleChoices = [];
            for (let i = 0; i < rows.length; i++) {
              roleChoices.push(rows[i].title);
            }
            return roleChoices;
          }
        },
        {
          type: 'input',
          name: 'manager',
          message: "Enter the ID of the employee's manager."
        }
      ]
    )
      .then((newEmployee) => {
        let roleSelection;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].title == newEmployee.role) {
            roleSelection = rows[i].id;
          }
        }
        db.query(
          `INSERT INTO employees SET ?`,
          {
            first_name: newEmployee.firstName,
            last_name: newEmployee.lastName,
            role_id: roleSelection,
            manager_id: newEmployee.manager
          },
          (err, rows) => {
            if (err) {
              throw err;
            }
            console.log('Success! The employee has been added to database.');
            displayMenu();
          }
        );
      })
  });
};

// —————————————————————————————————————————————————————————————————————————————

const updateEmployee = () => {
  db.query("SELECT * FROM roles", function (err, rows) {
    if (err) {
      throw err;
    }
    inquirer.prompt(
      [
        {
          type: 'input',
          name: 'employee',
          message: "Enter the ID of the employee you would like to update.",
          validate: (employee) => {
            if (employee) {
              return true;
            } else {
              console.log("You must enter an employee ID!");
              return false;
            }
          }
        },
        {
          // USER CAN SELECT A ROLE FROM A LIST
          type: "list",
          name: "role",
          message: "What is the employee's new role?",
          choices: function () {
            const roleChoices = [];
            for (let i = 0; i < rows.length; i++) {
              roleChoices.push(rows[i].title);
            }
            return roleChoices;
          }
        }
      ]
    )
      .then((updatedEmployeeInfo) => {
        let roleSelection;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].title == updatedEmployeeInfo.role) {
            roleSelection = rows[i].id;
          }
        }
        db.query(
          `UPDATE employees SET ? WHERE ?`,
          [{
            role_id: roleSelection
          },
          {
            id: updatedEmployeeInfo.employee
          }],
          (err, rows) => {
            if (err) {
              throw err;
            }
            console.log("Success! The employee's role has been updated.");
            displayMenu();
          }
        );
      })
  });
};

// —————————————————————————————————————————————————————————————————————————————

const deleteDepartment = () => {
  db.query("SELECT * FROM departments", function (err, rows) {
    if (err) {
      throw err;
    }
    inquirer.prompt(
      {
        type: "list",
        name: "department",
        message: "Select the department that you would like to delete.",
        choices: function () {
          const departmentChoices = [];
          for (let i = 0; i < rows.length; i++) {
            departmentChoices.push(rows[i].dept_name);
          }
          return departmentChoices;
        }
      }
    )
     .then((deletedDept) => {
      let departmentDeletion;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].dept_name == deletedDept.department) {
          departmentDeletion = rows[i].id;
        }
      }
      db.query(
        `DELETE FROM departments WHERE ?`,
        {
          id: departmentDeletion
        },
        (err, rows) => {
          if (err) {
            throw err;
          }
          console.log("Success! The department has been deleted.");
          displayMenu();
        }
      );
    })
  })
};

// —————————————————————————————————————————————————————————————————————————————

const deleteRole = () => {
  db.query("SELECT * FROM roles", function (err, rows) {
    if (err) {
      throw err;
    }
    inquirer.prompt(
      {
        type: "list",
        name: "role",
        message: "Select the role that you would like to delete.",
        choices: function () {
          const roleChoices = [];
          for (let i = 0; i < rows.length; i++) {
            roleChoices.push(rows[i].title);
          }
          return roleChoices;
        }
      }
    )
     .then((deletedRole) => {
      let roleDeletion;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].title == deletedRole.role) {
          roleDeletion = rows[i].id;
        }
      }
      db.query(
        `DELETE FROM roles WHERE ?`,
        {
          id: roleDeletion
        },
        (err, rows) => {
          if (err) {
            throw err;
          }
          console.log("Success! The role has been deleted.");
          displayMenu();
        }
      );
    })
  })
};



displayMenu();