import { AcademicCluster, AcademicClusterId, AcademicTrackId } from '../types';

// New DepEd K-12 curriculum academic tracks and TechPro (Technical-Professional)
// career clusters, modeled after the Senor High School curriculum update for
// Cabiao National Senior High School.

export const ACADEMIC_CLUSTERS: AcademicCluster[] = [
  // Academic Track
  {
    id: 'stem',
    track: 'academic',
    name: 'Science, Technology, Engineering, and Mathematics',
    shortLabel: 'STEM'
  },
  {
    id: 'business',
    track: 'academic',
    name: 'Business and Entrepreneurship',
    shortLabel: 'Business & Entrepreneurship'
  },
  {
    id: 'arts-soc-hum',
    track: 'academic',
    name: 'Arts, Social Sciences, and Humanities',
    shortLabel: 'Arts, SocSci & Humanities'
  },
  {
    id: 'sports-health',
    track: 'academic',
    name: 'Sports, Health, and Wellness',
    shortLabel: 'Sports, Health & Wellness'
  },
  // TechPro Track
  {
    id: 'tp-ict',
    track: 'techpro',
    name: 'ICT Support and Computer Programming Technologies',
    shortLabel: 'ICT Support & Computer Programming'
  },
  {
    id: 'tp-creative',
    track: 'techpro',
    name: 'Creative Arts and Design Technology',
    shortLabel: 'Creative Arts & Design Tech'
  },
  {
    id: 'tp-industrial',
    track: 'techpro',
    name: 'Industrial Technologies',
    shortLabel: 'Industrial Tech'
  },
  {
    id: 'tp-construction',
    track: 'techpro',
    name: 'Construction and Building Technology',
    shortLabel: 'Construction & Building Tech'
  },
  {
    id: 'tp-automotive',
    track: 'techpro',
    name: 'Automotive and Small Engine Technologies',
    shortLabel: 'Automotive & Small Engine'
  },
  {
    id: 'tp-hospitality',
    track: 'techpro',
    name: 'Hospitality and Tourism',
    shortLabel: 'Hospitality & Tourism'
  },
  {
    id: 'tp-agri',
    track: 'techpro',
    name: 'Agri-Fishery Business and Food Innovation',
    shortLabel: 'Agri-Fishery & Food Innovation'
  },
  {
    id: 'tp-maritime',
    track: 'techpro',
    name: 'Maritime',
    shortLabel: 'Maritime'
  },
  {
    id: 'tp-artisanry',
    track: 'techpro',
    name: 'Artisanry and Creative Enterprise',
    shortLabel: 'Artisanry & Creative Enterprise'
  },
  {
    id: 'tp-aesthetic',
    track: 'techpro',
    name: 'Aesthetic, Wellness, and Human Care',
    shortLabel: 'Aesthetic, Wellness & Human Care'
  }
];

export const ACADEMIC_TRACK_LABELS: Record<AcademicTrackId, string> = {
  academic: 'Academic Track',
  techpro: 'Technical-Professional (TechPro)'
};

export function getClusterById(id: AcademicClusterId | undefined | null): AcademicCluster | undefined {
  return ACADEMIC_CLUSTERS.find(c => c.id === id);
}

export function getClustersByTrack(track: AcademicTrackId): AcademicCluster[] {
  return ACADEMIC_CLUSTERS.filter(c => c.track === track);
}
