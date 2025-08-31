export interface JobRole {
  id: string;
  name: string;
  description: string;
  category: 'OFFENSIVE' | 'DEFENSIVE' | 'RESPONSE' | 'CLOUD' | 'ANALYSIS' | 'GOVERNANCE';
  color: string;
  icon: string;
  concepts: number;
  scenarios: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  certifications: string[];
}

export const jobRoles: JobRole[] = [
  {
    id: 'red-team-operator',
    name: 'Red Team Operator',
    description: 'Master advanced persistent threats, social engineering, and full-spectrum attack simulation methodologies.',
    category: 'OFFENSIVE',
    color: 'red',
    icon: 'fas fa-user-ninja',
    concepts: 156,
    scenarios: 89,
    difficulty: 'Advanced',
    skills: ['Social Engineering', 'APT Simulation', 'Evasion Techniques', 'C2 Operations'],
    certifications: ['OSCP', 'OSCE', 'GPEN', 'CRT']
  },
  {
    id: 'soc-analyst',
    name: 'SOC Analyst',
    description: 'Develop skills in threat detection, incident response, and security monitoring in enterprise environments.',
    category: 'DEFENSIVE',
    color: 'blue',
    icon: 'fas fa-shield-alt',
    concepts: 142,
    scenarios: 76,
    difficulty: 'Intermediate',
    skills: ['SIEM Analysis', 'Threat Hunting', 'Log Analysis', 'Alert Triage'],
    certifications: ['GCIH', 'GSOC', 'GCFA', 'CySA+']
  },
  {
    id: 'incident-responder',
    name: 'Incident Responder',
    description: 'Learn rapid threat containment, forensic analysis, and crisis management in high-pressure scenarios.',
    category: 'RESPONSE',
    color: 'yellow',
    icon: 'fas fa-fire-extinguisher',
    concepts: 98,
    scenarios: 54,
    difficulty: 'Advanced',
    skills: ['Digital Forensics', 'Malware Analysis', 'Crisis Management', 'Evidence Collection'],
    certifications: ['GCIH', 'GCFA', 'GNFA', 'CHFI']
  },
  {
    id: 'cloud-security-engineer',
    name: 'Cloud Security Engineer',
    description: 'Secure AWS, Azure, and GCP environments with zero-trust architecture and DevSecOps practices.',
    category: 'CLOUD',
    color: 'purple',
    icon: 'fas fa-cloud-upload-alt',
    concepts: 134,
    scenarios: 67,
    difficulty: 'Advanced',
    skills: ['Zero-Trust Architecture', 'DevSecOps', 'Cloud Compliance', 'Container Security'],
    certifications: ['CCSP', 'AWS Security', 'Azure Security', 'CISSP']
  },
  {
    id: 'malware-analyst',
    name: 'Malware Analyst',
    description: 'Reverse engineer malicious code, understand attack vectors, and develop countermeasures.',
    category: 'ANALYSIS',
    color: 'green',
    icon: 'fas fa-bug',
    concepts: 89,
    scenarios: 45,
    difficulty: 'Advanced',
    skills: ['Reverse Engineering', 'Dynamic Analysis', 'Static Analysis', 'Threat Intelligence'],
    certifications: ['GREM', 'GIAC', 'OSEE', 'CRT']
  },
  {
    id: 'compliance-specialist',
    name: 'Compliance Specialist',
    description: 'Navigate ISO 27001, SOC 2, GDPR, and other frameworks with practical implementation strategies.',
    category: 'GOVERNANCE',
    color: 'orange',
    icon: 'fas fa-clipboard-check',
    concepts: 76,
    scenarios: 32,
    difficulty: 'Intermediate',
    skills: ['Risk Assessment', 'Policy Development', 'Audit Management', 'Framework Implementation'],
    certifications: ['CISSP', 'CISA', 'ISO 27001 LA', 'CRISC']
  }
];

export const getCategoryColors = (category: JobRole['category']) => {
  const colorMap = {
    OFFENSIVE: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-400' },
    DEFENSIVE: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-400' },
    RESPONSE: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-400' },
    CLOUD: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-400' },
    ANALYSIS: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-400' },
    GOVERNANCE: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-400' }
  };
  return colorMap[category];
};

export const getRoleById = (id: string): JobRole | undefined => {
  return jobRoles.find(role => role.id === id);
};
