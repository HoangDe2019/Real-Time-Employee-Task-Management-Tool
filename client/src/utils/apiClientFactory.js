import axios from 'axios';
import React from 'react';

class HttpApiClient {
  constructor(baseURL) {
    console.log('[HttpApiClient] constructor', baseURL);
    this.http = axios.create({ baseURL });
  }

  async ownerCreateAccessCode(payload) {
    console.log('[HttpApiClient] ownerCreateAccessCode', payload);
    const { data } = await this.http.post('/api/owner/CreateNewAccessCode', payload);
    return data;
  }

  async ownerValidateAccessCode(payload) {
    console.log('[HttpApiClient] ownerValidateAccessCode', payload);
    const { data } = await this.http.post('/api/owner/ValidateAccessCode', payload);
    return data;
  }

  // Employee auth (email-based access code)
  async employeeLoginEmail(payload) {
    console.log('[HttpApiClient] employeeLoginEmail', payload);
    const { data } = await this.http.post('/api/employee/LoginEmail', payload);
    return data;
  }

  async employeeValidateAccessCode(payload) {
    console.log('[HttpApiClient] employeeValidateAccessCode', payload);
    const { data } = await this.http.post('/api/employee/ValidateAccessCode', payload);
    return data;
  }

  async createEmployee(payload) {
    console.log('[HttpApiClient] createEmployee', payload);
    const { data } = await this.http.post('/api/owner/CreateEmployee', payload);
    return data;
  }

  async deleteEmployee(payload) {
    console.log('[HttpApiClient] deleteEmployee', payload);
    const { data } = await this.http.post('/api/owner/DeleteEmployee', payload);
    return data;
  }

  async listEmployees() {
    console.log('[HttpApiClient] listEmployees');
    const { data } = await this.http.get('/api/owner/ListEmployees');
    return data;
  }

  async updateEmployee(payload) {
    console.log('[HttpApiClient] updateEmployee', payload);
    const { data } = await this.http.post('/api/owner/UpdateEmployee', payload);
    return data;
  }

  async setEmployeeSchedule(payload) {
    console.log('[HttpApiClient] setEmployeeSchedule', payload);
    const { data } = await this.http.post('/api/owner/SetEmployeeSchedule', payload);
    return data;
  }

  // Employee self-service (match backend routes requiring employeeId)
  async getEmployeeProfile(employeeId) {
    console.log('[HttpApiClient] getEmployeeProfile', employeeId);
    const { data } = await this.http.get(`/api/employee/Profile/${employeeId}`);
    return data;
  }

  async updateEmployeeProfile(employeeId, payload) {
    console.log('[HttpApiClient] updateEmployeeProfile', employeeId, payload);
    const { data } = await this.http.put(`/api/employee/Profile/${employeeId}`, payload);
    return data;
  }

  async listEmployeeTasks(employeeId) {
    console.log('[HttpApiClient] listEmployeeTasks', employeeId);
    const { data } = await this.http.get(`/api/employee/Tasks/${employeeId}`);
    return data;
  }

  async updateTaskStatus(taskId, employeeId, status = 'completed') {
    console.log('[HttpApiClient] updateTaskStatus', taskId, employeeId, status);
    const { data } = await this.http.put(`/api/employee/Task/${taskId}`, { status, employeeId });
    return data;
  }
}

export const ApiClientFactory = {
  create() {
    // Use environment variable for API base URL, fallback to localhost for development
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://113.173.154.153:4000';
    console.log('[ApiClientFactory] create with baseURL:', baseURL);
    return new HttpApiClient(baseURL);
  }
};
