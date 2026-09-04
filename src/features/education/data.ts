// Transcribed from public/resume.pdf. Nothing here is inferred — if the
// resume does not state it (grades, honours, coursework), it is not here.

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  location: string
  start: string
  end: string
  /** Exactly as the resume puts it. */
  status: string
  placeholder: boolean
}

export const education: EducationEntry[] = [
  {
    id: 'lu-computer-science',
    degree: 'Bachelor of Computer Science',
    institution: 'Lebanese University',
    location: 'Al-Hadath, Lebanon',
    start: '2021',
    end: '2024',
    status: 'Graduated',
    placeholder: false,
  },
  {
    id: 'lu-english-literature',
    degree: 'Bachelor of English Literature',
    institution: 'Lebanese University',
    location: 'Saida, Lebanon',
    start: '2022',
    end: '2025',
    status: 'Graduated',
    placeholder: false,
  },
]
