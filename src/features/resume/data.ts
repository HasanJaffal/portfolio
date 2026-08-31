// Add resume.pdf to /public, set `available: true`, and update `updatedLabel`.

export interface ResumeInfo {
  available: boolean
  url: string
  updatedLabel: string
}

export const resume: ResumeInfo = {
  available: false,
  url: '/resume.pdf',
  updatedLabel: 'Add resume.pdf to /public',
}
