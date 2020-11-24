import { from } from 'rxjs';
import { run } from "./run";

export namespace Docker {

    export async function version(): Promise<string> {
        return await run("docker", ["version"], undefined, true);
    }

    export namespace Swarm {
        export namespace Secret {

            export interface ISecretMetadata {
                ID: string;
                Version: {
                    Index: number;
                };
                CreatedAt: string;
                UpdatedAt: string;
                Spec: {
                    Name: string;
                    Labels: {};
                }
            }

            export async function create(name: string, content: string): Promise<string> {
                return await run("docker", ["secret", "create", name, "-"], undefined, true, from(content));
            }

            export async function listIds(): Promise<string[]> {
                const result = await run("docker", ["secret", "ls", "-q"], undefined, true);
                return result.split("\n");
            }

            export async function listNames(): Promise<string[]> {
                const result = await run("docker", ["secret", "ls", "--format", "{{.Name}}"], undefined, true);
                return result.split("\n");
            }

            export async function remove(id: string): Promise<void> {
                await run("docker", ["secret", "rm", id], undefined, false);
            }

            export async function removeFromService(secretId: string, serviceName: string): Promise<void> {
                await run("docker", ["service", "update", "--secret-rm", secretId, serviceName], undefined, false);
            }

            export async function addToService(secretId: string, targetSecretId: string, serviceName: string): Promise<void> {
                await run("docker", ["service", "update", "--secret-add", `source=${secretId},target=${targetSecretId}`, serviceName], undefined, false);
            }

            export async function inspect(id: string): Promise<ISecretMetadata> {
                const result = await run("docker", ["secret", "inspect", id], undefined, true);
                return JSON.parse(result);
            }
        }

    }
}
