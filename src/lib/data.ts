import { Github, Linkedin, Mail } from 'lucide-react';

export const COMMANDS = ['help', 'whoami', 'skills', 'projects', 'project', 'experience', 'contact', 'clear'] as const;

export const WHOAMI_TEXT = `Dev/DevOps Engineer. I build and automate scalable, reliable cloud systems.
Passionate about CI/CD, Infrastructure as Code, and making developers' lives easier.`;

export const PROJECTS = [
  {
    name: 'auto-scaler-cloud',
    title: 'Auto-Scaling Cloud Infrastructure',
    technologies: 'Terraform, AWS (EC2, ASG, ELB), Ansible',
    briefOverview: 'A project to create a self-healing and auto-scaling web server environment on AWS using Infrastructure as Code.',
    link: 'https://github.com'
  },
  {
    name: 'kubernetes-gitops',
    title: 'Kubernetes GitOps Pipeline',
    technologies: 'Kubernetes, Docker, ArgoCD, Helm, GitHub Actions',
    briefOverview: 'Implemented a GitOps workflow for deploying microservices to a Kubernetes cluster.',
    link: 'https://github.com'
  },
  {
    name: 'serverless-api',
    title: 'Serverless REST API',
    technologies: 'AWS Lambda, API Gateway, DynamoDB, Serverless Framework',
    briefOverview: 'Built a highly available and scalable serverless REST API for a social media application backend.',
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
