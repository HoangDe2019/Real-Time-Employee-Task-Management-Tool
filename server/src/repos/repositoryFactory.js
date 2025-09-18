import { v4 as uuid } from 'uuid';

class InMemoryRepository {
  constructor() {
    console.log('[InMemoryRepository] constructor');
    this.phones = new Map(); // phone -> { code }
    this.employees = new Map(); // id -> { id, name, email, department }
  }

  // Access code flows
  savePhoneCode(phoneNumber, code) {
    console.log('[Repo] savePhoneCode', phoneNumber, code);
    this.phones.set(phoneNumber, { code });
  }
  getPhoneCode(phoneNumber) {
    console.log('[Repo] getPhoneCode', phoneNumber);
    return this.phones.get(phoneNumber)?.code || '';
  }
  clearPhoneCode(phoneNumber) {
    console.log('[Repo] clearPhoneCode', phoneNumber);
    if (this.phones.has(phoneNumber)) this.phones.set(phoneNumber, { code: '' });
  }

  // Employees
  createEmployee({ name, email, department }) {
    console.log('[Repo] createEmployee', name, email, department);
    const id = uuid();
    this.employees.set(id, { id, name, email, department });
    return id;
  }
  deleteEmployee(id) {
    console.log('[Repo] deleteEmployee', id);
    return this.employees.delete(id);
  }
  getEmployee(id) {
    console.log('[Repo] getEmployee', id);
    return this.employees.get(id) || null;
  }
  listEmployees() {
    console.log('[Repo] listEmployees');
    return Array.from(this.employees.values());
  }
}

export function createRepository() {
  console.log('[repositoryFactory] createRepository -> InMemoryRepository');
  return new InMemoryRepository();
}


