import React, { useState } from "react";
import { checkConnection, addProduct, updateStock, updatePrice, discontinueProduct, getProduct, listProducts, getLowStock, getTotalValue } from "../lib.js/stellar.js";

const nowTs = () => Math.floor(Date.now() / 1000);

const initialForm = () => ({
    id: "prod1",
    owner: "",
    name: "Sample Product",
    sku: "SKU-001",
    quantity: "10",
    unitPrice: "1000",
    category: "general",
    quantityChange: "5",
    isAddition: true,
    newPrice: "1500",
    lowStockThreshold: "5",
});

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function App() {
    const [form, setForm] = useState(initialForm);
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState("Wallet: not connected");
    const [isBusy, setIsBusy] = useState(false);

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

    const onAddProduct = () => runAction(async () => addProduct({
        id: form.id.trim(),
        owner: form.owner.trim(),
        name: form.name.trim(),
        sku: form.sku.trim(),
        quantity: form.quantity.trim(),
        unitPrice: form.unitPrice.trim(),
        category: form.category.trim(),
    }));

    const onUpdateStock = () => runAction(async () => updateStock({
        id: form.id.trim(),
        owner: form.owner.trim(),
        quantityChange: form.quantityChange.trim(),
        isAddition: form.isAddition,
    }));

    const onUpdatePrice = () => runAction(async () => updatePrice({
        id: form.id.trim(),
        owner: form.owner.trim(),
        newPrice: form.newPrice.trim(),
    }));

    const onDiscontinue = () => runAction(async () => discontinueProduct({
        id: form.id.trim(),
        owner: form.owner.trim(),
    }));

    const onGetProduct = () => runAction(async () => getProduct(form.id.trim()));
    const onListProducts = () => runAction(async () => listProducts());
    const onGetLowStock = () => runAction(async () => getLowStock(form.lowStockThreshold.trim()));
    const onGetTotalValue = () => runAction(async () => getTotalValue());

    return (
        <main className="app">
            <section className="hero">
                <p className="kicker">Stellar Soroban Project 6</p>
                <h1>Inventory Management System</h1>
                <p className="subtitle">
                    Manage products, track stock levels, update prices, and monitor inventory value.
                </p>
                <button type="button" id="connectWallet" onClick={onConnect} disabled={isBusy}>Connect Freighter</button>
                <p id="walletState">{walletState}</p>
            </section>

            <section className="panel">
                <h2>Product Details</h2>

                <label htmlFor="entryId">Product ID (Symbol)</label>
                <input id="entryId" name="id" value={form.id} onChange={setField} />

                <label htmlFor="owner">Owner Address</label>
                <input id="owner" name="owner" value={form.owner} onChange={setField} placeholder="G..." />

                <label htmlFor="name">Product Name</label>
                <input id="name" name="name" value={form.name} onChange={setField} />

                <label htmlFor="sku">SKU</label>
                <input id="sku" name="sku" value={form.sku} onChange={setField} />

                <label htmlFor="quantity">Quantity (u32)</label>
                <input id="quantity" name="quantity" value={form.quantity} onChange={setField} type="number" />

                <label htmlFor="unitPrice">Unit Price (i128)</label>
                <input id="unitPrice" name="unitPrice" value={form.unitPrice} onChange={setField} type="number" />

                <label htmlFor="category">Category (Symbol)</label>
                <input id="category" name="category" value={form.category} onChange={setField} />

                <div className="actions">
                    <button type="button" onClick={onAddProduct} disabled={isBusy}>Add Product</button>
                    <button type="button" onClick={onGetProduct} disabled={isBusy}>Get Product</button>
                    <button type="button" onClick={onListProducts} disabled={isBusy}>List Products</button>
                </div>
            </section>

            <section className="panel">
                <h2>Stock Management</h2>

                <label htmlFor="quantityChange">Quantity Change (u32)</label>
                <input id="quantityChange" name="quantityChange" value={form.quantityChange} onChange={setField} type="number" />

                <label>
                    <input type="checkbox" name="isAddition" checked={form.isAddition} onChange={setField} />
                    {" "}Add stock (uncheck to remove)
                </label>

                <div className="actions">
                    <button type="button" onClick={onUpdateStock} disabled={isBusy}>Update Stock</button>
                    <button type="button" onClick={onDiscontinue} disabled={isBusy}>Discontinue Product</button>
                </div>
            </section>

            <section className="panel">
                <h2>Pricing and Reports</h2>

                <label htmlFor="newPrice">New Price (i128)</label>
                <input id="newPrice" name="newPrice" value={form.newPrice} onChange={setField} type="number" />

                <label htmlFor="lowStockThreshold">Low Stock Threshold (u32)</label>
                <input id="lowStockThreshold" name="lowStockThreshold" value={form.lowStockThreshold} onChange={setField} type="number" />

                <div className="actions">
                    <button type="button" onClick={onUpdatePrice} disabled={isBusy}>Update Price</button>
                    <button type="button" onClick={onGetLowStock} disabled={isBusy}>Get Low Stock</button>
                    <button type="button" onClick={onGetTotalValue} disabled={isBusy}>Get Total Value</button>
                </div>
            </section>

            <section className="panel output-panel">
                <h2>Result</h2>
                <pre id="output">{output}</pre>
            </section>
        </main>
    );
}
