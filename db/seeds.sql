INSERT INTO departments (dept_name)
VALUES 
  ('Marketing'),
  ('Sales'),
  ('Development'),
  ('Finance'),
  ('Human Resources');

INSERT INTO roles (title, salary, department_id)
VALUES
  ('Creative Director', 125000, 1),
  ('Sales Lead', 90000, 2),
  ('Salesperson', 70000, 2),
  ('Senior Development Lead', 125000, 3),
  ('Web Developer', 100000, 3),
  ('Software Engineer', 100000, 3),
  ('Account Manager', 125000, 4),
  ('Accountant', 100000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
  ('Manuel', 'Mccoy', 1, 1),
  ('Douglas', 'Johnson', 2, NULL ),
  ('Alex', 'Porter', 3, 2),
  ('Shari', 'Dunn', 4, NULL),
  ('Nina', 'Martinez', 5, 4),
  ('Fred', 'Steele', 6, 4),
  ('Mike', 'Wolfe', 7, NULL),
  ('Ellen', 'Price', 8, 7);