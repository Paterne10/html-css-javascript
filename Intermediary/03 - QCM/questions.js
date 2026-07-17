const TOPICS = {
  cybersecurity: {
    label: "Cybersecurity",
    emoji: "🛡️",
    desc: "Threats, defenses, and core concepts",
    questions: [
      {
        q: "What does 'XSS' stand for?",
        options: ["Cross-Site Scripting", "Extended Server Security", "XML Site Sync", "Cross-System Signature"],
        correct: 0,
      },
      {
        q: "What is the main purpose of hashing a password before storing it?",
        options: ["Make it shorter", "Make it reversible for support staff", "Prevent it being stored in plain text", "Speed up login"],
        correct: 2,
      },
      {
        q: "Which of these best describes 'phishing'?",
        options: ["A firewall misconfiguration", "Tricking someone into revealing sensitive info", "A type of encryption", "A network scanning tool"],
        correct: 1,
      },
      {
        q: "What does 'MFA' stand for?",
        options: ["Multi-Factor Authentication", "Managed File Access", "Malware Filtering Algorithm", "Mandatory Firewall Audit"],
        correct: 0,
      },
      {
        q: "A 'zero-day' vulnerability refers to a flaw that is...",
        options: ["Fixed within 24 hours", "Unknown to the vendor with no patch yet", "Only affects day-old systems", "Impossible to exploit"],
        correct: 1,
      },
    ],
  },
  webdev: {
    label: "Web Development",
    emoji: "💻",
    desc: "HTML, CSS, JavaScript fundamentals",
    questions: [
      {
        q: "Which HTTP status code means 'Not Found'?",
        options: ["200", "301", "404", "500"],
        correct: 2,
      },
      {
        q: "In CSS, which property controls spacing INSIDE an element's border?",
        options: ["margin", "padding", "gap", "inset"],
        correct: 1,
      },
      {
        q: "Which of these is NOT a JavaScript primitive type?",
        options: ["string", "boolean", "array", "number"],
        correct: 2,
      },
      {
        q: "What does 'DOM' stand for?",
        options: ["Data Object Model", "Document Object Model", "Dynamic Output Method", "Document Order Manager"],
        correct: 1,
      },
      {
        q: "Which CSS layout model is best suited for one-dimensional row/column alignment?",
        options: ["Grid", "Flexbox", "Float", "Table"],
        correct: 1,
      },
    ],
  },
  soc: {
    label: "SOC Analyst",
    emoji: "🖥️",
    desc: "Monitoring, alerts, and incident response",
    questions: [
      {
        q: "What does 'SOC' stand for?",
        options: ["Security Operations Center", "System Output Controller", "Secure Online Channel", "Server Operations Console"],
        correct: 0,
      },
      {
        q: "What is a SIEM primarily used for?",
        options: ["Writing application code", "Aggregating and correlating security logs", "Designing network topology", "Managing user passwords only"],
        correct: 1,
      },
      {
        q: "In incident response, what does 'triage' mean?",
        options: ["Deleting all logs", "Prioritizing alerts by severity and impact", "Rebuilding the network from scratch", "Ignoring low-priority tickets permanently"],
        correct: 1,
      },
      {
        q: "What is a 'false positive' in alert monitoring?",
        options: ["A confirmed real attack", "An alert that incorrectly flags benign activity as malicious", "A missed attack", "A type of malware"],
        correct: 1,
      },
      {
        q: "Which log source is most useful for tracking failed login attempts?",
        options: ["DNS logs", "Authentication logs", "DHCP logs", "Print server logs"],
        correct: 1,
      },
    ],
  },
};
