'use client';
import React from 'react';
import { COMMANDS, WHOAMI_TEXT, PROJECTS, EXPERIENCE, CONTACT_INFO } from './data';
import { generateSkillsList } from '@/ai/flows/generate-skills-list';
import { generateProjectDescription } from '@/ai/flows/generate-project-description';
import { useToast } from "@/hooks/use-toast"

const AiError = () => {
  const { toast } = useToast();
  React.useEffect(() => {
    toast({
      title: "AI Error",
      description: "Failed to get response from AI model. Please check the server console or your API key.",
      variant: "destructive",
    })
  }, [toast]);
  return <p className="text-destructive">Error communicating with AI. See toast for details.</p>;
}


const getHelp = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
    {COMMANDS.map(cmd => <span key={cmd}>{cmd}</span>)}
  </div>
);

const getWhoAmI = () => (
  <p className="whitespace-pre-wrap">{WHOAMI_TEXT}</p>
);

const getSkills = async () => {
  try {
    const skills = await generateSkillsList({});
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
        {skills.map(skill => <span key={skill}>{skill}</span>)}
      </div>
    );
  } catch (error) {
    console.error(error);
    return <AiError />;
  }
};

const getProjects = () => (
  <div>
    <p>Here are my projects. Use 'project &lt;name&gt;' to see details.</p>
    <ul className="list-disc list-inside mt-2">
      {PROJECTS.map(p => (
        <li key={p.name}>
          <span className="font-bold w-36 inline-block">{p.name}</span> - {p.title}
        </li>
      ))}
    </ul>
  </div>
);

const getProjectDetails = async (name: string) => {
  const project = PROJECTS.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!project) {
    return <p>Project not found: {name}. Try 'projects' to see a list of available projects.</p>;
  }
  
  try {
    const { projectDescription } = await generateProjectDescription({
      projectName: project.title,
      technologies: project.technologies,
      briefOverview: project.briefOverview
    });

    return (
        <div>
            <h3 className="text-lg font-bold text-accent">{project.title}</h3>
            <p className="font-mono text-sm text-muted-foreground">{project.technologies}</p>
            <p className="mt-2 whitespace-pre-wrap">{projectDescription}</p>
            {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline mt-2 inline-block">View on GitHub</a>}
        </div>
    );
  } catch (error) {
    console.error(error);
    return <AiError />;
  }
};


const getExperience = () => (
    <div className="space-y-4">
      {EXPERIENCE.map((exp, index) => (
        <div key={index}>
          <h3 className="font-bold text-accent">{exp.role} @ {exp.company}</h3>
          <p className="text-sm text-muted-foreground">{exp.period}</p>
          <p className="mt-1">{exp.description}</p>
        </div>
      ))}
    </div>
);

const getContact = () => (
  <div className="space-y-2">
    {CONTACT_INFO.map(item => (
      <div key={item.name} className="flex items-center gap-4">
        <span className="w-16">{item.name}:</span>
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent hover:underline">
          <item.icon className="w-4 h-4" />
          <span>{item.value}</span>
        </a>
      </div>
    ))}
  </div>
);

export const getCommandOutput = async (commandStr: string): Promise<React.ReactNode> => {
  const [command, ...args] = commandStr.trim().toLowerCase().split(' ');

  switch(command) {
    case 'help':
      return getHelp();
    case 'whoami':
      return getWhoAmI();
    case 'skills':
      return await getSkills();
    case 'projects':
      return getProjects();
    case 'project':
      if (args.length === 0) return <p>Please specify a project name. Use 'projects' to see a list.</p>;
      return await getProjectDetails(args[0]);
    case 'experience':
      return getExperience();
    case 'contact':
      return getContact();
    case 'clear':
      return ''; // special case handled in terminal component
    default:
      if (!command) return '';
      return <p>Command not found: {command}. Type 'help' for a list of commands.</p>;
  }
};
