import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { v4 as uuid } from 'uuid';

class FirebaseRepository {
    constructor() {
        console.log('[FirebaseRepository] constructor');
        this.phoneCodesCollection = 'phoneCodes';
        this.employeesCollection = 'employees';
        this.tasksCollection = 'tasks';
    }

    // Access code flows - FIXED
    async savePhoneCode(phoneNumber, code) {
        try {
            console.log('[FirebaseRepo] savePhoneCode', phoneNumber, code);
            const docRef = doc(db, this.phoneCodesCollection, phoneNumber);
            await setDoc(docRef, {
                code: code.toString(), // Ensure string consistency
                createdAt: serverTimestamp(),
                phoneNumber,
                isActive: true // Add flag for active codes
            });
            return true;
        } catch (error) {
            console.error('[FirebaseRepo] Error saving phone code:', error);
            throw error;
        }
    }

    async getPhoneCode(phoneNumber) {
        try {
            // REMOVED artificial delays - these were causing unnecessary latency
            const docRef = doc(db, this.phoneCodesCollection, phoneNumber);
            const docSnap = await getDoc(docRef);

            console.log('[FirebaseRepo] getPhoneCode docSnap.exists()', docSnap.exists());

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('[FirebaseRepo] getPhoneCode docSnap.data()', data.code);

                // Check if code is still active
                if (data.isActive !== false) {
                    return data.code?.toString() || '';
                }
            }
            return '';
        } catch (error) {
            console.error('[FirebaseRepo] Error getting phone code:', error);
            throw error; // Changed: throw error instead of returning empty string
        }
    }

    async clearPhoneCode(phoneNumber) {
        try {
            console.log('[FirebaseRepo] clearPhoneCode', phoneNumber);
            const docRef = doc(db, this.phoneCodesCollection, phoneNumber);
            await updateDoc(docRef, {
                code: '',
                isActive: false, // Mark as inactive instead of just clearing
                clearedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('[FirebaseRepo] Error clearing phone code:', error);
            throw error;
        }
    }

    // Employee methods - IMPROVED
    async createEmployee({ name, email, department }) {
        try {
            console.log('[FirebaseRepo] createEmployee', name, email, department);

            // Check if employee already exists
            const existingEmployee = await this.getEmployeeByEmail(email);
            if (existingEmployee) {
                throw new Error('Employee with this email already exists');
            }

            const id = uuid();
            const docRef = doc(db, this.employeesCollection, id);

            const employeeData = {
                id,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                department: department.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isActive: true
            };

            await setDoc(docRef, employeeData);
            return { id, ...employeeData };
        } catch (error) {
            console.error('[FirebaseRepo] Error creating employee:', error);
            throw error;
        }
    }

    async deleteEmployee(id) {
        try {
            console.log('[FirebaseRepo] deleteEmployee', id);

            // Soft delete instead of hard delete
            const docRef = doc(db, this.employeesCollection, id);
            await updateDoc(docRef, {
                isActive: false,
                deletedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('[FirebaseRepo] Error deleting employee:', error);
            throw error; // Changed: throw error instead of returning false
        }
    }

    async getEmployee(id) {
        try {
            console.log('[FirebaseRepo] getEmployee', id);
            const docRef = doc(db, this.employeesCollection, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const employee = docSnap.data();
                // Only return active employees
                if (employee.isActive !== false) {
                    return employee;
                }
            }
            return null;
        } catch (error) {
            console.error('[FirebaseRepo] Error getting employee:', error);
            throw error;
        }
    }

    async updateEmployee(id, updates) {
        try {
            console.log('[FirebaseRepo] updateEmployee', id, updates);

            // Validate employee exists
            const employee = await this.getEmployee(id);
            if (!employee) {
                throw new Error('Employee not found');
            }

            const docRef = doc(db, this.employeesCollection, id);

            // Clean updates object
            const cleanUpdates = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            // Normalize email if provided
            if (cleanUpdates.email) {
                cleanUpdates.email = cleanUpdates.email.toLowerCase().trim();
            }

            await updateDoc(docRef, cleanUpdates);
            return true;
        } catch (error) {
            console.error('[FirebaseRepo] Error updating employee:', error);
            throw error;
        }
    }

    async listEmployees(includeInactive = false) {
        try {
            console.log('[FirebaseRepo] listEmployees');
            const employeesRef = collection(db, this.employeesCollection);
            let querySnapshot;

            if (!includeInactive) {
                // Use query to filter active employees only
                const q = query(employeesRef, where('isActive', '!=', false));
                querySnapshot = await getDocs(q);
            } else {
                querySnapshot = await getDocs(employeesRef);
            }

            const employees = [];
            querySnapshot.forEach((doc) => {
                employees.push(doc.data());
            });

            return employees;
        } catch (error) {
            console.error('[FirebaseRepo] Error listing employees:', error);
            throw error;
        }
    }

    // IMPROVED: Use query instead of fetching all documents
    async getEmployeeByEmail(email) {
        const q = query(
            collection(db, this.employeesCollection),
            where('email', '==', email),
            where('isActive', '==', true)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs[0].data();
        }
        return null;
    }

    // Task management methods - IMPROVED
    async createTask({ employeeId, title, description, priority = 'medium' }) {
        try {
            console.log('[FirebaseRepo] createTask', employeeId, title);

            // Validate employee exists
            const employee = await this.getEmployee(employeeId);
            if (!employee) {
                throw new Error('Employee not found');
            }

            const id = uuid();
            const docRef = doc(db, this.tasksCollection, id);

            const taskData = {
                id,
                employeeId,
                title: title.trim(),
                description: description.trim(),
                priority,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isActive: true
            };

            await setDoc(docRef, taskData);
            return { id, ...taskData };
        } catch (error) {
            console.error('[FirebaseRepo] Error creating task:', error);
            throw error;
        }
    }

    // IMPROVED: Use query instead of filtering in memory
    async getTasksByEmployee(employeeId) {
        try {
            console.log('[FirebaseRepo] getTasksByEmployee', employeeId);

            const tasksRef = collection(db, this.tasksCollection);
            const q = query(
                tasksRef,
                where('employeeId', '==', employeeId),
                where('isActive', '!=', false)
            );
            const querySnapshot = await getDocs(q);

            const tasks = [];
            querySnapshot.forEach((doc) => {
                tasks.push(doc.data());
            });

            return tasks;
        } catch (error) {
            console.error('[FirebaseRepo] Error getting tasks by employee:', error);
            throw error;
        }
    }

    async updateTask(taskId, updates) {
        try {
            console.log('[FirebaseRepo] updateTask', taskId, updates);

            // Validate task exists
            const taskRef = doc(db, this.tasksCollection, taskId);
            const taskDoc = await getDoc(taskRef);

            if (!taskDoc.exists()) {
                throw new Error('Task not found');
            }

            const cleanUpdates = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            await updateDoc(taskRef, cleanUpdates);
            return true;
        } catch (error) {
            console.error('[FirebaseRepo] Error updating task:', error);
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            console.log('[FirebaseRepo] deleteTask', taskId);

            const docRef = doc(db, this.tasksCollection, taskId);
            await updateDoc(docRef, {
                isActive: false,
                deletedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('[FirebaseRepo] Error deleting task:', error);
            throw error;
        }
    }

    // Utility method for batch operations
    async batchUpdateEmployees(updates) {
        try {
            console.log('[FirebaseRepo] batchUpdateEmployees', updates.length);
            const promises = updates.map(({ id, data }) =>
                this.updateEmployee(id, data)
            );

            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('[FirebaseRepo] Error in batch update:', error);
            throw error;
        }
    }
}

export function createRepository() {
    console.log('[repositoryFactory] createRepository -> FirebaseRepository');
    return new FirebaseRepository();
}