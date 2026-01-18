import { Github, Linkedin, Mail } from 'lucide-react';

export const COMMANDS = [
  'help',
  'ask',
  'aboutme',
  'skills',
  'skill',
  'projects',
  'project',
  'experience',
  'education',
  'resume',
  'contact',
  'clear',
] as const;

export const ABOUTME_TEXT = `Dev/DevOps Engineer. I build and automate scalable, reliable cloud systems.
Passionate about CI/CD, Infrastructure as Code, and making developers' lives easier.`;

export const SKILLS = [
  {
    category: 'Cloud & IaC',
    items: ['AWS', 'Terraform', 'Ansible'],
  },
  {
    category: 'Containers & Orchestration',
    items: ['Docker', 'Kubernetes'],
  },
  {
    category: 'CI/CD & Automation',
    items: ['CI/CD', 'GitHub Actions'],
  },
  {
    category: 'Monitoring & Observability',
    items: ['Prometheus', 'Grafana'],
  },
  {
    category: 'Systems & Platforms',
    items: ['Linux'],
  },
];

export const SKILL_DETAILS = [
  {
    name: 'AWS',
    level: 'Advanced',
    score: 92,
    summary: 'Designing and automating AWS infrastructure (EC2, ASG, ELB, VPC, IAM) with security, reliability, and cost awareness.',
  },
  {
    name: 'Terraform',
    level: 'Advanced',
    score: 90,
    summary: 'Building modular IaC stacks, managing remote state, and standardizing reusable infrastructure patterns.',
  },
  {
    name: 'Ansible',
    level: 'Intermediate',
    score: 78,
    summary: 'Writing playbooks for provisioning, configuration management, and repeatable environment setups.',
  },
  {
    name: 'Docker',
    level: 'Advanced',
    score: 88,
    summary: 'Containerizing applications with multi-stage builds, optimized images, and reproducible dev workflows.',
  },
  {
    name: 'Kubernetes',
    level: 'Intermediate',
    score: 76,
    summary: 'Operating workloads with deployments, services, ingress, and basic cluster troubleshooting.',
  },
  {
    name: 'CI/CD',
    level: 'Advanced',
    score: 91,
    summary: 'Designing pipelines for build, test, and deploy workflows with quality gates and environment promotion.',
  },
  {
    name: 'GitHub Actions',
    level: 'Advanced',
    score: 87,
    summary: 'Authoring reusable workflows, matrix builds, and secure secrets handling for automated delivery.',
  },
  {
    name: 'Prometheus',
    level: 'Intermediate',
    score: 74,
    summary: 'Setting up metrics collection, alert rules, and monitoring baselines for services and infrastructure.',
  },
  {
    name: 'Grafana',
    level: 'Intermediate',
    score: 72,
    summary: 'Building dashboards and alert visualizations for performance and reliability insights.',
  },
  {
    name: 'Linux',
    level: 'Advanced',
    score: 93,
    summary: 'Daily CLI usage, system tuning, service management, and troubleshooting in production environments.',
  },
];

export const PROJECTS = [
  {
    name: 'auto-scaler-cloud',
    title: 'Auto-Scaling Cloud Infrastructure',
    category: 'Infrastructure Automation',
    technologies: 'Terraform, AWS (EC2, ASG, ELB), Ansible',
    description: 'A project to create a self-healing and auto-scaling web server environment on AWS using Infrastructure as Code.',
    link: 'https://github.com'
  },
  {
    name: 'kubernetes-gitops',
    title: 'Kubernetes GitOps Pipeline',
    category: 'Kubernetes & GitOps',
    technologies: 'Kubernetes, Docker, ArgoCD, Helm, GitHub Actions',
    description: 'Implemented a GitOps workflow for deploying microservices to a Kubernetes cluster.',
    link: 'https://github.com'
  },
  {
    name: 'serverless-api',
    title: 'Serverless REST API',
    category: 'Serverless Platforms',
    technologies: 'AWS Lambda, API Gateway, DynamoDB, Serverless Framework',
    description: 'Built a highly available and scalable serverless REST API for a social media application backend.',
    link: 'https://github.com'
  },
];

export const EXPERIENCE = [
    {
      company: 'FutureTech Inc.',
      role: 'Senior DevOps Engineer',
      period: '2020 - Present',
      description: 'Led the migration of on-premise infrastructure to a multi-cloud environment (AWS & GCP). Designed and implemented CI/CD pipelines, reducing deployment times by 70%. Managed Kubernetes clusters and implemented a company-wide monitoring and alerting strategy using Prometheus and Grafana.'
    },
    {
      company: 'Innovate Solutions',
      role: 'Software Engineer',
      period: '2017 - 2020',
      description: 'Developed and maintained backend services for a high-traffic e-commerce platform. Championed the adoption of containerization with Docker, improving developer onboarding and environment consistency. Contributed to infrastructure automation scripts using Python and Bash.'
    }
];

export const EDUCATION = [
  {
    school: 'Bangkok Institute of Technology',
    program: 'B.Sc. in Computer Engineering',
    period: '2013 - 2017',
    highlights: [
      'Focused on distributed systems, networking, and infrastructure automation.',
      'Capstone: built a monitoring dashboard for containerized services.',
    ],
  },
];

export const RESUME = {
  headline: 'Dev/DevOps Engineer',
  summary: 'I build resilient cloud platforms, automate delivery pipelines, and improve developer experience across teams.',
  highlights: [
    'Multi-cloud migrations and IaC-first delivery for AWS/GCP environments.',
    'Kubernetes platform operations with observability and security baselines.',
    'Automation mindset: reducing toil via scripts, workflows, and self-service tooling.',
  ],
  downloadLink: 'https://example.com/resume.pdf',
  lastUpdated: 'Jan 2026',
};

export const CONTACT_INFO = [
  {
    name: 'Email',
    value: 'hello@devterminal.dev',
    href: 'mailto:hello@devterminal.dev',
    icon: Mail,
  },
  {
    name: 'GitHub',
    value: 'github.com/dev-user',
    href: 'https://github.com',
    icon: Github,
  },
  {
    name: 'LinkedIn',
    value: 'linkedin.com/in/dev-user',
    href: 'https://www.linkedin.com',
    icon: Linkedin,
  },
];

export type PortfolioSnapshot = {
  aboutMe: string;
  skills: { category: string; items: string[] }[];
  projects: {
    name: string;
    title: string;
    category: string;
    technologies: string;
    description: string;
    link?: string;
  }[];
  experience: typeof EXPERIENCE;
  education: typeof EDUCATION;
  resume: typeof RESUME;
  contact: { name: string; value: string; href: string }[];
};

export const getPortfolioSnapshot = (): PortfolioSnapshot => ({
  aboutMe: ABOUTME_TEXT,
  skills: SKILLS.map(group => ({
    category: group.category,
    items: group.items,
  })),
  projects: PROJECTS.map(project => ({
    name: project.name,
    title: project.title,
    category: project.category,
    technologies: project.technologies,
    description: project.description,
    link: project.link,
  })),
  experience: EXPERIENCE,
  education: EDUCATION,
  resume: RESUME,
  contact: CONTACT_INFO.map(item => ({
    name: item.name,
    value: item.value,
    href: item.href,
  })),
});
