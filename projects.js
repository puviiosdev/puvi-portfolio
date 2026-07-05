const localProjects = [
  {
    id: "linarc-construction",
    title: "Linarc - Construction Management",
    category: "Professional Experience",
    role: "Lead iOS Developer",
    timeline: "2022 - 2026",
    description: "Enterprise-grade construction workflow management platform enabling field teams with real-time updates, task tracking, and document coordination.",
    longDescription: "Linarc is a comprehensive enterprise platform designed specifically for job-site environments. The iOS app provides construction managers and field teams with robust mobile tools to manage tasks, coordinate documents, submit daily logs, and track workflow progress. Built to handle complex data structures and low-connectivity environments.",
    features: [
      "Designed scalable architecture using MVVM and Dependency Injection to maximize code reusability.",
      "Implemented an offline-first data model using Realm, enabling seamless data syncing when connections are restored.",
      "Built a suite of custom UI components including reusable buttons, action sheets, and custom views.",
      "Integrated secure credentials management using iOS Keychain services.",
      "Optimized background processing and network tasks to minimize battery drain on-site."
    ],
    technologies: ["Swift", "UIKit", "SwiftUI", "MVVM", "Realm", "REST APIs", "Keychain", "GCD"],
    appStoreUrl: "#",
    githubUrl: null,
    stats: { stars: 0, forks: 0, rating: "4.8", reviews: "1.2k" }
  },
  {
    id: "linarc-timecard",
    title: "Linarc Timecard",
    category: "Professional Experience",
    role: "Lead iOS Developer",
    timeline: "2022 - 2026",
    description: "Workforce time tracking application designed for job sites, supporting attendance logging and offline synchronization.",
    longDescription: "A specialized app focused on workforce management and time tracking on construction sites. It allows workers to clock in/out, log breaks, track hours against specific job codes, and syncs data to the Linarc backend. The app is optimized for extreme conditions, ensuring high reliability offline.",
    features: [
      "Offline-first synchronization structure preventing data loss in dead zones.",
      "Custom multi-date selection calendar for shift planning and time-sheet review.",
      "Jailbreak detection to enforce enterprise security policies and prevent location spoofing.",
      "Debounced search operations with Combine to ensure smooth UI performance with large rosters."
    ],
    technologies: ["Swift", "UIKit", "SwiftUI", "Realm", "Combine", "Keychain", "GCD"],
    appStoreUrl: "#",
    githubUrl: null,
    stats: { stars: 0, forks: 0, rating: "4.7", reviews: "850" }
  },
  {
    id: "journal-app",
    title: "Journal App",
    category: "Personal Project",
    role: "iOS Developer",
    timeline: "2026",
    description: "A beautiful iOS journal application designed to log daily thoughts, moods, and experiences with local persistence.",
    longDescription: "Journal App is a personal iOS application built using SwiftUI and modern architectural design. It features a clean, minimal interface for users to document daily reflections, attach photos, and log mood states. Developed using Swift Concurrency and clean local storage solutions.",
    features: [
      "Built entirely using SwiftUI with a modern, responsive layout.",
      "Utilized Swift Concurrency (async/await) for asynchronous data handling.",
      "Implemented local data persistence to keep user journals secure on-device.",
      "Created custom mood-tracking sliders and charts to visualize user reflections."
    ],
    technologies: ["Swift", "SwiftUI", "Swift Concurrency", "Core Data / SwiftData", "Combine"],
    appStoreUrl: null,
    githubUrl: "https://github.com/puviiosdev/JournalApp",
    stats: { stars: 15, forks: 1, rating: null, reviews: null }
  }
];

// Export to make available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { localProjects };
}
