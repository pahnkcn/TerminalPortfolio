'use server';

/**
 * @fileOverview Generates a dynamically augmented list of skills using generative AI.
 *
 * - generateSkillsList - A function that generates the augmented skills list.
 * - GenerateSkillsListInput - The input type for the generateSkillsList function (empty object).
 * - GenerateSkillsListOutput - The return type for the generateSkillsList function (string array).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSkillsListInputSchema = z.object({});
export type GenerateSkillsListInput = z.infer<typeof GenerateSkillsListInputSchema>;

const GenerateSkillsListOutputSchema = z.array(z.string());
export type GenerateSkillsListOutput = z.infer<typeof GenerateSkillsListOutputSchema>;

export async function generateSkillsList(input: GenerateSkillsListInput): Promise<GenerateSkillsListOutput> {
  return generateSkillsListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSkillsListPrompt',
  input: {schema: GenerateSkillsListInputSchema},
  output: {schema: GenerateSkillsListOutputSchema},
  prompt: `You are a DevOps Engineer expert.

  Generate a list of relevant technical skills for a DevOps Engineer. These skills should be suitable to list on a portfolio website.

  Focus on skills related to automation, reliability, scalability, cloud technologies, and monitoring.

  The output should be a JSON array of strings.

  Example:
  ["Docker", "Kubernetes", "CI/CD", "Cloud", "Monitoring", "Terraform", "Ansible", "AWS", "GCP", "Azure"]
  `,
});

const generateSkillsListFlow = ai.defineFlow(
  {
    name: 'generateSkillsListFlow',
    inputSchema: GenerateSkillsListInputSchema,
    outputSchema: GenerateSkillsListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
