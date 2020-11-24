import { spawn } from "child_process";
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
/**
 * Executes an Process
 *
 * @param {string} executable the application to execute
 * @param {string[]} args the args for the application
 * @param {*} [env] environment variables for child-process
 * @param {boolean} [readStdIO] should stdout be returned as a string? If not. StdOut will be inherited from node process
 * @returns {Promise<void>} resolves the Promise, if the program has exited
 */
export function run(executable: string, args: string[], env?: { [key: string]: string }): Promise<void>;
export function run(executable: string, args: string[], env?: { [key: string]: string }, readStdIO?: false): Promise<void>;
export function run(executable: string, args: string[], env?: { [key: string]: string }, readStdIO?: true): Promise<string>;
export function run(executable: string, args: string[], env?: { [key: string]: string }, readStdIO?: false, stdin?: Observable<string>): Promise<void>
export function run(executable: string, args: string[], env?: { [key: string]: string }, readStdIO?: true, stdin?: Observable<string>): Promise<string>
export function run(executable: string, args: string[], env?: { [key: string]: string }, readStdIO?: boolean, stdin?: Observable<string>): Promise<string | void> {
    let destroy$ = new Subject<void>();
    return (new Promise((resolve, reject) => {
        let childProcess = spawn(executable, args, {
            stdio: [
                "pipe", // StdIn.
                (readStdIO ? "pipe" : "inherit"),    // StdOut.
                "inherit",    // StdErr.
            ],
            env: env ? { ...process.env, ...env } : process.env,
        });
        let result = "";
        if (stdin) {
            if (!childProcess.stdin) {
                reject(new Error('stdin is not open'));
                return;
            }
            // childProcess.stdin.setEncoding('utf-8');
            stdin
                .pipe(takeUntil(destroy$))
                .subscribe({
                    next: x => {
                        childProcess.stdin!.write(x);
                    },
                    complete: () => {
                        childProcess.stdin!.end();
                    }
                })
        }
        if (readStdIO) {
            childProcess.stdout?.on("data", (data) => result += data);
        }
        childProcess.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`The command '${executable}', exited with the unsuccessful statuscode '${code}'.`));
            }
            if (readStdIO) {
                resolve(result);
            }
            resolve(undefined);
        });
    }))
        .finally(() => {
            destroy$.next();
            destroy$.complete();
        }) as Promise<string | undefined>;
}