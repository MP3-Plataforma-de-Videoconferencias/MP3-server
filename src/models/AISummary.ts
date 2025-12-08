export interface AISummary {
  id?: string; 
  userId: string;
  meetingId: string;
  summary: string; 
  generatedAt: Date;
  createdAt: Date;
}