import React, { useState } from "react";
import { checkConnection, createTask, assignTask, startTask, completeTask, reviewTask, getTask, listTasks, getTaskCount } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "task1",
        creator: "",
        assignee: "",
        reviewer: "",
        title: "Implement login page",
        description: "Build the login UI with form validation",
        priority: "3",
        dueDate: String(nowTs() + 86400 * 7),
        estimatedHours: "8",
        actualHours: "6",
        approved: true,
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);
    const [taskCount, setTaskCount] = useState("-");

    const setField = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const runAction = async (action) => {
        setIsBusy(true);
        try {
            const result = await action();
            setOutput(toOutput(result ?? "No data found"));
        } catch (error) {
            setOutput(error?.message || String(error));
        } finally {
            setIsBusy(false);
        }
    };

    const onConnect = () => runAction(async () => {
        const user = await checkConnection();
        const next = user ? `Wallet: ${user.publicKey}` : "Wallet: not connected";
        setWalletState(next);
        return next;
    });

    const onCreateTask = () => runAction(async () =>
        createTask({
            id: form.id.trim(),
            creator: form.creator.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority.trim(),
            dueDate: form.dueDate.trim(),
            estimatedHours: form.estimatedHours.trim(),
        })
    );

    const onAssignTask = () => runAction(async () =>
        assignTask({
            id: form.id.trim(),
            creator: form.creator.trim(),
            assignee: form.assignee.trim(),
        })
    );

    const onStartTask = () => runAction(async () =>
        startTask({
            id: form.id.trim(),
            assignee: form.assignee.trim(),
        })
    );

    const onCompleteTask = () => runAction(async () =>
        completeTask({
            id: form.id.trim(),
            assignee: form.assignee.trim(),
            actualHours: form.actualHours.trim(),
        })
    );

    const onReviewTask = () => runAction(async () =>
        reviewTask({
            id: form.id.trim(),
            reviewer: form.reviewer.trim(),
            approved: form.approved,
        })
    );

    const onGetTask = () => runAction(async () => getTask(form.id.trim()));

    const onListTasks = () => runAction(async () => listTasks());

    const onGetCount = () => runAction(async () => {
        const value = await getTaskCount();
        setTaskCount(String(value));
        return { taskCount: value };
    });

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 26</p>
                <h1>Task / Project Assignment System</h1>
                <p className="subtitle">
                    Create tasks, assign to team members, track progress through review and approval.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
                <p>Total tasks: {taskCount}</p>
            </section>

            <section className="panel">
                <label htmlFor="id">Task ID (Symbol)</label>
                <input id="id" name="id" value={form.id} onChange={setField} />

                <label htmlFor="creator">Creator Address</label>
                <input id="creator" name="creator" value={form.creator} onChange={setField} placeholder="G..." />

                <label htmlFor="assignee">Assignee Address</label>
                <input id="assignee" name="assignee" value={form.assignee} onChange={setField} placeholder="G..." />

                <label htmlFor="reviewer">Reviewer Address</label>
                <input id="reviewer" name="reviewer" value={form.reviewer} onChange={setField} placeholder="G..." />

                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={setField} />

                <label htmlFor="description">Description</label>
                <input id="description" name="description" value={form.description} onChange={setField} />

                <label htmlFor="priority">Priority (0-5)</label>
                <input id="priority" name="priority" value={form.priority} onChange={setField} type="number" />

                <label htmlFor="dueDate">Due Date (u64 timestamp)</label>
                <input id="dueDate" name="dueDate" value={form.dueDate} onChange={setField} type="number" />

                <label htmlFor="estimatedHours">Estimated Hours</label>
                <input id="estimatedHours" name="estimatedHours" value={form.estimatedHours} onChange={setField} type="number" />

                <label htmlFor="actualHours">Actual Hours (for complete)</label>
                <input id="actualHours" name="actualHours" value={form.actualHours} onChange={setField} type="number" />

                <label htmlFor="approved">
                    <input id="approved" name="approved" type="checkbox" checked={form.approved} onChange={setField} />
                    Approved (for review)
                </label>

                <div className="actions">
                    <button type="button" onClick={onCreateTask} disabled={isBusy}>Create Task</button>
                    <button type="button" onClick={onAssignTask} disabled={isBusy}>Assign Task</button>
                    <button type="button" onClick={onStartTask} disabled={isBusy}>Start Task</button>
                    <button type="button" onClick={onCompleteTask} disabled={isBusy}>Complete Task</button>
                    <button type="button" onClick={onReviewTask} disabled={isBusy}>Review Task</button>
                    <button type="button" onClick={onGetTask} disabled={isBusy}>Get Task</button>
                    <button type="button" onClick={onListTasks} disabled={isBusy}>List Tasks</button>
                    <button type="button" onClick={onGetCount} disabled={isBusy}>Get Count</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
