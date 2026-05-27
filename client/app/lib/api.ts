"use client"

type ApiOptions = {
  baseUrl?: string
}

type RequestOptions = RequestInit & {
  auth?: boolean
}

const defaultBaseUrl = () => (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

export const api = {
  baseUrl(options?: ApiOptions) {
    return (options?.baseUrl ?? defaultBaseUrl()).replace(/\/$/, '')
  },

  getAuthToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  },

  setAuthToken(token: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
  },

  clearAuthToken() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  },

  async request<T>(path: string, options?: RequestOptions, apiOptions?: ApiOptions): Promise<T> {
    const base = this.baseUrl(apiOptions)
    const url = `${base}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers ? (options.headers as Record<string, string>) : {}),
    }

    if (options?.auth !== false) {
      const token = this.getAuthToken()
      if (token) headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, { ...options, headers })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || response.statusText)
    }

    return (await response.json()) as T
  },

  async register(username: string, password: string, apiOptions?: ApiOptions) {
    return this.request<{ userId: string; username: string }>(
      '/api/v1/auth/register',
      { method: 'POST', body: JSON.stringify({ username, password }), auth: false },
      apiOptions
    )
  },

  async login(username: string, password: string, apiOptions?: ApiOptions) {
    const result = await this.request<{ token: string }>(
      '/api/v1/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }), auth: false },
      apiOptions
    )
    if (result?.token) {
      this.setAuthToken(result.token)
    }
    return result
  },

  async createAssignment(payload: unknown, apiOptions?: ApiOptions) {
    return this.request<{ assignmentId: string; jobId?: string; status: string }>(
      '/api/v1/assignments',
      { method: 'POST', body: JSON.stringify(payload) },
      apiOptions
    )
  },

  async listAssignments(apiOptions?: ApiOptions) {
    return this.request<any[]>('/api/v1/assignments', { method: 'GET' }, apiOptions)
  },

  async getAssignmentStatus(assignmentId: string, apiOptions?: ApiOptions) {
    return this.request<any>(`/api/v1/assignments/${assignmentId}/status`, { method: 'GET' }, apiOptions)
  },

  async getAssignmentPaper(assignmentId: string, apiOptions?: ApiOptions) {
    return this.request<any>(`/api/v1/assignments/${assignmentId}/paper`, { method: 'GET' }, apiOptions)
  },

  getAssignmentPaperHtmlUrl(assignmentId: string, apiOptions?: ApiOptions) {
    const base = this.baseUrl(apiOptions)
    return `${base}/api/v1/assignments/${assignmentId}/paper/html`
  },

  async exportPdf(assignmentId: string, apiOptions?: ApiOptions) {
    return this.request<{ message: string }>(
      `/api/v1/assignments/${assignmentId}/export-pdf`,
      { method: 'POST' },
      apiOptions
    )
  },

  async deleteAssignment(assignmentId: string, apiOptions?: ApiOptions) {
    return this.request<{ assignmentId: string }>(
      `/api/v1/assignments/${assignmentId}`,
      { method: 'DELETE' },
      apiOptions
    )
  },

  async getUploadUrl(contentType: string, apiOptions?: ApiOptions) {
    return this.request<{ url: string; fileKey: string }>(
      '/api/v1/uploads/presigned-url',
      { method: 'POST', body: JSON.stringify({ contentType }) },
      apiOptions
    )
  },

  async uploadFileToSignedUrl(url: string, file: File) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || response.statusText)
    }
  },
}
