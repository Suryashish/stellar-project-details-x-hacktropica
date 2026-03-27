import React, { useState } from "react";
import { checkConnection, createOrder, payOrder, confirmOrder, shipOrder, deliverOrder, disputeOrder, getOrder, listOrders } from "../lib.js/stellar.js";

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState({
        id: "order1",
        seller: "",
        buyer: "",
        description: "Custom widget order",
        itemsCount: "3",
        totalAmount: "1500",
        paymentAmount: "1500",
        trackingInfo: "TRACK-12345",
        disputeReason: "",
    });
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);

    const setField = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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

    const onCreateOrder = () => runAction(() => createOrder({
        id: form.id.trim(),
        seller: form.seller.trim(),
        buyer: form.buyer.trim(),
        description: form.description.trim(),
        itemsCount: form.itemsCount.trim(),
        totalAmount: form.totalAmount.trim(),
    }));

    const onPayOrder = () => runAction(() => payOrder(form.id.trim(), form.buyer.trim(), form.paymentAmount.trim()));

    const onConfirmOrder = () => runAction(() => confirmOrder(form.id.trim(), form.seller.trim()));

    const onShipOrder = () => runAction(() => shipOrder(form.id.trim(), form.seller.trim(), form.trackingInfo.trim()));

    const onDeliverOrder = () => runAction(() => deliverOrder(form.id.trim(), form.seller.trim()));

    const onDisputeOrder = () => runAction(() => disputeOrder(form.id.trim(), form.buyer.trim(), form.disputeReason.trim()));

    const onGetOrder = () => runAction(() => getOrder(form.id.trim()));

    const onListOrders = () => runAction(() => listOrders());

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 38</p>
                <h1>Prepaid Orders</h1>
                <p className="subtitle">Create orders, prepay, confirm, ship, deliver, or dispute.</p>
                <button type="button" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <label htmlFor="orderId">Order ID</label>
                <input id="orderId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="seller">Seller Address</label>
                <input id="seller" name="seller" value={form.seller} onChange={setField} placeholder="G..." />

                <label htmlFor="buyer">Buyer Address</label>
                <input id="buyer" name="buyer" value={form.buyer} onChange={setField} placeholder="G..." />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="2" value={form.description} onChange={setField} />

                <label htmlFor="itemsCount">Items Count</label>
                <input id="itemsCount" name="itemsCount" value={form.itemsCount} onChange={setField} type="number" />

                <label htmlFor="totalAmount">Total Amount (i128)</label>
                <input id="totalAmount" name="totalAmount" value={form.totalAmount} onChange={setField} type="number" />

                <label htmlFor="paymentAmount">Payment Amount (i128)</label>
                <input id="paymentAmount" name="paymentAmount" value={form.paymentAmount} onChange={setField} type="number" />

                <label htmlFor="trackingInfo">Tracking Info</label>
                <input id="trackingInfo" name="trackingInfo" value={form.trackingInfo} onChange={setField} />

                <label htmlFor="disputeReason">Dispute Reason</label>
                <textarea id="disputeReason" name="disputeReason" rows="2" value={form.disputeReason} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onCreateOrder} disabled={isBusy}>Create Order</button>
                    <button type="button" onClick={onPayOrder} disabled={isBusy}>Pay Order</button>
                    <button type="button" onClick={onConfirmOrder} disabled={isBusy}>Confirm Order</button>
                    <button type="button" onClick={onShipOrder} disabled={isBusy}>Ship Order</button>
                    <button type="button" onClick={onDeliverOrder} disabled={isBusy}>Deliver Order</button>
                    <button type="button" onClick={onDisputeOrder} disabled={isBusy}>Dispute Order</button>
                    <button type="button" onClick={onGetOrder} disabled={isBusy}>Get Order</button>
                    <button type="button" onClick={onListOrders} disabled={isBusy}>List Orders</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
