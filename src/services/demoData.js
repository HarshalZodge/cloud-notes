/**
 * Sample notes data for demonstration mode.
 * Strictly isolated from real Google Drive data.
 */

export const INITIAL_DEMO_NOTES = [
  {
    id: 'demo_note_1',
    title: 'Cloud Computing Notes',
    category: 'Study',
    favorite: true,
    trashed: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    content: `# Cloud Computing Architecture & Models

## Key Service Models
- **IaaS (Infrastructure as a Service)**: AWS EC2, Google Compute Engine, Azure VMs. Raw compute, network, and storage.
- **PaaS (Platform as a Service)**: Google App Engine, Heroku. Runtime environment for applications without OS management.
- **SaaS (Software as a Service)**: Google Drive, Office 365, Slack. Fully functional applications delivered over the web.

## Essential Characteristics (NIST Definition)
1. On-demand self-service
2. Broad network access
3. Resource pooling
4. Rapid elasticity
5. Measured service

> "Cloud computing eliminates capital expenditure (CapEx) in favor of operational expenditure (OpEx), enabling instant elasticity and global distribution."

\`\`\`json
{
  "storageType": "Object Storage",
  "provider": "Google Drive API v3",
  "authMethod": "OAuth 2.0 PKCE / GIS",
  "scope": "https://www.googleapis.com/auth/drive.file"
}
\`\`\`
`,
    tags: ['cloud', 'architecture', 'viva-prep']
  },
  {
    id: 'demo_note_2',
    title: 'Mini Project Ideas',
    category: 'Work',
    favorite: true,
    trashed: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    content: `# Mini Project Engineering Brainstorming

## 1. CloudNotes (Current Project)
- **Concept**: Serverless Personal Knowledge Base using Google Drive API v3 as a decentralized document store.
- **Key Advantage**: Zero database costs, 100% user data ownership, privacy-first architecture.

## 2. Distributed File Sync Monitor
- WebRTC peer-to-peer file transfer with chunk hashing.
- Real-time conflict resolution using vector clocks.

## Priority Checklist
- [x] Finalize Google Identity Services authentication client
- [x] Design light glassmorphic user interface
- [ ] Connect Google Drive folder creation pipeline
- [ ] Prepare viva documentation & system architecture diagrams
`,
    tags: ['projects', 'ideas', 'engineering']
  },
  {
    id: 'demo_note_3',
    title: 'Places to Visit',
    category: 'Personal',
    favorite: false,
    trashed: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    content: `# Travel Itinerary & Backpacking Wishlist

### Himachal & Ladakh Circuit
- **Spiti Valley**: Key Monastery, Chandratal Lake camping
- **Manali to Leh**: Khardung La Pass, Nubra Valley
- **Best time**: June to September

### Gear Checklist
- [x] Thermal base layers
- [x] Portable power bank (20,000 mAh)
- [ ] Trekking poles with quick-lock
- [ ] High-altitude UV protection glasses

> "The mountains are calling and I must go." — John Muir
`,
    tags: ['travel', 'itinerary']
  },
  {
    id: 'demo_note_4',
    title: 'Semester To-Do List',
    category: 'Work',
    favorite: false,
    trashed: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    content: `# Final Semester Milestones

## Academic Deadlines
1. Submit Cloud Computing lab manual and test cases.
2. Complete Software Engineering SRS documentation.
3. Prepare viva presentation slides on OAuth 2.0 authorization flows.

## Action Items
- [x] Review NIST Cloud Architecture documentation
- [x] Test Drive API rate limits (12,000 queries/minute)
- [ ] Submit final project code repository link
- [ ] Conduct peer code review
`,
    tags: ['academics', 'checklist']
  },
  {
    id: 'demo_note_5',
    title: 'Important Topics — Cloud & Security',
    category: 'Study',
    favorite: true,
    trashed: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    content: `# Security & Identity in Cloud Systems

### Authentication vs. Authorization
- **Authentication (AuthN)**: "Who are you?" (e.g., verifying user identity via Google Sign-In).
- **Authorization (AuthZ)**: "What are you allowed to do?" (e.g., OAuth 2.0 granting \`drive.file\` scope).

### Principle of Least Privilege
Why request \`https://www.googleapis.com/auth/drive.file\` instead of full \`drive\`?
- Full \`drive\` scope grants read/write/delete access to **all** files in a user's Google Drive.
- \`drive.file\` **only** grants access to files created or opened by this specific application.
- User data remains completely secure and isolated from third-party exposure.
`,
    tags: ['security', 'oauth', 'viva']
  },
  {
    id: 'demo_note_6',
    title: 'App Features & Architecture Roadmap',
    category: 'Ideas',
    favorite: false,
    trashed: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    content: `# CloudNotes Feature Matrix

### Implemented Capabilities
- Real Google Identity Services (GIS) token client.
- Google Drive v3 REST API file management (\`CloudNotes\` folder).
- UTF-8 Markdown notes with serialized YAML frontmatter.
- Live markdown preview with instant word/character telemetry.
- Light glassmorphic design system with cobalt accents.

### Upcoming Enhancements
- [ ] Offline caching with IndexedDB write-ahead log.
- [ ] Collaborative document sharing via Google Drive Permissions API.
- [ ] Export note as PDF / HTML bundle.
`,
    tags: ['roadmap', 'features']
  }
];

export const DEMO_USER = {
  name: 'Alex Rivera',
  email: 'alex.rivera.demo@gmail.com',
  picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
  isDemo: true
};

const DEMO_STORAGE_KEY = 'cloudnotes_demo_data_v1';

export function getDemoNotes() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading demo notes from local cache:', e);
  }
  // Initialize with initial demo notes
  saveDemoNotes(INITIAL_DEMO_NOTES);
  return [...INITIAL_DEMO_NOTES];
}

export function saveDemoNotes(notes) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving demo notes:', e);
  }
}

export function resetDemoNotes() {
  saveDemoNotes(INITIAL_DEMO_NOTES);
  return [...INITIAL_DEMO_NOTES];
}
