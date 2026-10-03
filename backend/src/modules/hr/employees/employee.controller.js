import { asyncHandler } from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import * as employeeService from './employee.service.js';

export const listEmployees = asyncHandler(async (req, res) => {
  const employees = await employeeService.listEmployees();
  return success(res, employees);
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  return success(res, employee);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  return success(res, employee, 'Employee registered successfully', 201);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  return success(res, employee, 'Employee details updated');
});
