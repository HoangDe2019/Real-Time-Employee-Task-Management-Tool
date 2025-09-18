import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    updateDoc,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebaseAdmin.js';
  import { v4 as uuid } from 'uuid';
  
  class FirebaseRepository {
    constructor() {
      console.log('[FirebaseRepository] constructor');
      this.phoneCodesCollection = 'phoneCodes';
      this.employeesCollection = 'employees';
    }
  
    // Access code flows
    async savePhoneCode(phoneNumber, code) {
      try {
        console.log('[FirebaseRepo] savePhoneCode', phoneNumber, code);
        const docRef = doc(db, this.phoneCodesCollection, phoneNumber);
        await setDoc(docRef, {
          code,
          createdAt: serverTimestamp(),
          phoneNumber
        });
      } catch (error) {
        console.error('[FirebaseRepo] Error saving phone code:', error);
        throw error;
      }
    }
  
    async getPhoneCode(phoneNumber) {
      try {
        console.log('[FirebaseRepo] getPhoneCode', phoneNumber);
        const docRef = doc(db, this.phoneCodesCollection, phoneNumber);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data().code || '';
        }
        return '';
      } catch (error) {
        console.error('[FirebaseRepo] Error getting phone code:', error);
        return '';
      }
    }
  
    async clearPhoneCode(phoneNumber) {
      try {
        console.log('[FirebaseRepo] clearPhoneCode', phoneNumber);
        const docRef = doc(db, this.phoneCodesCollection, phoneNumber);
        await updateDoc(docRef, {
          code: '',
          clearedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('[FirebaseRepo] Error clearing phone code:', error);
        throw error;
      }
    }
  
    // Employees
    async createEmployee({ name, email, department }) {
      try {
        console.log('[FirebaseRepo] createEmployee', name, email, department);
        const id = uuid();
        const docRef = doc(db, this.employeesCollection, id);
        
        const employeeData = {
          id,
          name,
          email,
          department,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(docRef, employeeData);
        return id;
      } catch (error) {
        console.error('[FirebaseRepo] Error creating employee:', error);
        throw error;
      }
    }
  
    async deleteEmployee(id) {
      try {
        console.log('[FirebaseRepo] deleteEmployee', id);
        const docRef = doc(db, this.employeesCollection, id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error('[FirebaseRepo] Error deleting employee:', error);
        return false;
      }
    }
  
    async getEmployee(id) {
      try {
        console.log('[FirebaseRepo] getEmployee', id);
        const docRef = doc(db, this.employeesCollection, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data();
        }
        return null;
      } catch (error) {
        console.error('[FirebaseRepo] Error getting employee:', error);
        return null;
      }
    }
  
    async updateEmployee(id, updates) {
      try {
        console.log('[FirebaseRepo] updateEmployee', id, updates);
        const docRef = doc(db, this.employeesCollection, id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error('[FirebaseRepo] Error updating employee:', error);
        return false;
      }
    }
  
    async listEmployees() {
      try {
        console.log('[FirebaseRepo] listEmployees');
        const querySnapshot = await getDocs(collection(db, this.employeesCollection));
        const employees = [];
        
        querySnapshot.forEach((doc) => {
          employees.push(doc.data());
        });
        
        return employees;
      } catch (error) {
        console.error('[FirebaseRepo] Error listing employees:', error);
        return [];
      }
    }
  
    // Additional methods for employee authentication
    async getEmployeeByEmail(email) {
      try {
        console.log('[FirebaseRepo] getEmployeeByEmail', email);
        const querySnapshot = await getDocs(collection(db, this.employeesCollection));
        
        for (const doc of querySnapshot.docs) {
          const employee = doc.data();
          if (employee.email === email) {
            return employee;
          }
        }
        return null;
      } catch (error) {
        console.error('[FirebaseRepo] Error getting employee by email:', error);
        return null;
      }
    }
  
    // Task management methods (for future use)
    async createTask({ employeeId, title, description, priority = 'medium' }) {
      try {
        console.log('[FirebaseRepo] createTask', employeeId, title);
        const id = uuid();
        const docRef = doc(db, 'tasks', id);
        
        const taskData = {
          id,
          employeeId,
          title,
          description,
          priority,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(docRef, taskData);
        return id;
      } catch (error) {
        console.error('[FirebaseRepo] Error creating task:', error);
        throw error;
      }
    }
  
    async getTasksByEmployee(employeeId) {
      try {
        console.log('[FirebaseRepo] getTasksByEmployee', employeeId);
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        const tasks = [];
        
        querySnapshot.forEach((doc) => {
          const task = doc.data();
          if (task.employeeId === employeeId) {
            tasks.push(task);
          }
        });
        
        return tasks;
      } catch (error) {
        console.error('[FirebaseRepo] Error getting tasks by employee:', error);
        return [];
      }
    }
  
    async updateTask(taskId, updates) {
      try {
        console.log('[FirebaseRepo] updateTask', taskId, updates);
        const docRef = doc(db, 'tasks', taskId);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error('[FirebaseRepo] Error updating task:', error);
        return false;
      }
    }
  }
  
//   export { FirebaseRepository };.

  export function createRepository() {
    console.log('[repositoryFactory] createRepository -> FirebaseRepository');
    return new FirebaseRepository();
  }
  