'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating project descriptions using a generative AI.
 *
 * It includes:
 * - `generateProjectDescription`:  A function that takes project details as input and returns a generated description.
 * - `GenerateProjectDescriptionInput`: The input type for the `generateProjectDescription` function, including project name, technologies used, and a brief overview.
 * - `GenerateProjectDescriptionOutput`: The output type for the `generateProjectDescription` function, containing the generated project description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectDescriptionInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  technologies: z.string().describe('A comma-separated list of technologies used in the project.'),
  briefOverview: z.string().describe('A brief overview of the project.'),
});
export type GenerateProjectDescriptionInput = z.infer<
  typeof GenerateProjectDescriptionInputSchema
>;

const GenerateProjectDescriptionOutputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the project.'),
});
export type GenerateProjectDescriptionOutput = z.infer<
  typeof GenerateProjectDescriptionOutputSchema
>;

export async function generateProjectDescription(
  input: GenerateProjectDescriptionInput
): Promise<GenerateProjectDescriptionOutput> {
  return generateProjectDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectDescriptionPrompt',
  input: {schema: GenerateProjectDescriptionInputSchema},
  output: {schema: GenerateProjectDescriptionOutputSchema},
  prompt: `You are an expert software engineer specializing in creating compelling project descriptions for developer portfolios.

  Based on the project's name, technologies used, and a brief overview, generate a detailed and engaging project description.

  Project Name: {{{projectName}}}
  Technologies Used: {{{technologies}}}
  Brief Overview: {{{briefOverview}}}
  `,
});

const generateProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProjectDescriptionFlow',
    inputSchema: GenerateProjectDescriptionInputSchema,
    outputSchema: GenerateProjectDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
