import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    setDoc,
    Timestamp
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export interface TransactionData {
    amount: number;
    category: string;
    note: string;
    date: Date; // Allow Date object from UI
    type: 'income' | 'expense';
    walletId?: string;
    receiptImage?: string;
}

export interface WalletData {
    id: string;
    name: string;
    icon?: string;
    balance: number;
    createdAt?: Date;
}

export interface UserData {
    email: string;
    createdAt: Timestamp;
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    wallets?: WalletData[];
}

/**
 * Creates a new user document in Firestore.
 */
export const createNewUser = async (uid: string, email: string) => {
    try {
        const userRef = doc(db, "users", uid);
        const userData: UserData = {
            email,
            createdAt: Timestamp.now(),
            totalBalance: 0,
            totalIncome: 0,
            totalExpenses: 0,
        };
        await setDoc(userRef, userData);
        console.log("User document created!");
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

/**
 * Adds a transaction and atomically recalculates the user's total balance, income, and expenses.
 */
export const addTransaction = async (uid: string, transactionData: TransactionData) => {
    try {
        const userRef = doc(db, "users", uid);
        const transactionRef = doc(collection(db, "users", uid, "transactions"));

        await runTransaction(db, async (transaction) => {
            // 1. Read current user data
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User does not exist!";
            }

            const userData = userDoc.data() as UserData;
            const currentBalance = userData.totalBalance || 0;
            const currentIncome = userData.totalIncome || 0;
            const currentExpenses = userData.totalExpenses || 0;

            // 2. Calculate new totals
            let newBalance = currentBalance;
            let newIncome = currentIncome;
            let newExpenses = currentExpenses;
            const amount = Number(transactionData.amount);

            if (transactionData.type === 'income') {
                newIncome += amount;
                newBalance += amount;
            } else {
                newExpenses += amount;
                newBalance -= amount;
            }

            // 3. Write new transaction
            // Convert Date to Timestamp for Firestore
            const dataToWrite = {
                ...transactionData,
                date: Timestamp.fromDate(transactionData.date),
                createdAt: Timestamp.now(),
            };

            transaction.set(transactionRef, dataToWrite);

            // 4. Update user totals
            transaction.update(userRef, {
                totalBalance: newBalance,
                totalIncome: newIncome,
                totalExpenses: newExpenses,
            });
        });

        console.log("Transaction added and totals updated!");
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
    }
};

/**
 * Fetches the most recent transactions for a user.
 */
export const getRecentTransactions = async (uid: string, limitCount: number = 10) => {
    try {
        const transactionsRef = collection(db, "users", uid, "transactions");
        const q = query(transactionsRef, orderBy("date", "desc"), limit(limitCount));

        const querySnapshot = await getDocs(q);
        const transactions: any[] = [];

        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

/**
 * Fetches transactions within a specific date range.
 */
import { where } from "firebase/firestore";

export const getTransactionsByDateRange = async (uid: string, startDate: Date, endDate: Date) => {
    try {
        const transactionsRef = collection(db, "users", uid, "transactions");
        // Firestore can filter by Date objects if they are stored as timestamps
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        const q = query(
            transactionsRef,
            where("date", ">=", startTimestamp),
            where("date", "<=", endTimestamp),
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        const transactions: (TransactionData & { id: string })[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push({
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(), // Convert back to JS Date
            } as any);
        });

        return transactions;
    } catch (error) {
        console.error("Error fetching date range transactions:", error);
        throw error;
    }
};

/**
 * Subscribes to the user's document to get real-time balance updates.
 */
import { onSnapshot } from "firebase/firestore";

export const subscribeToUserData = (uid: string, onUpdate: (data: UserData) => void) => {
    const userRef = doc(db, "users", uid);
    return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            onUpdate(doc.data() as UserData);
        }
    });
};

export interface BillData {
    name: string;
    amount: number;
    dueDate: Timestamp; // Store as timestamp
    frequency: 'Weekly' | 'Monthly' | 'Yearly';
    category?: string;
    isPaid: boolean;
}

export const addBill = async (uid: string, billData: BillData) => {
    try {
        const billsRef = collection(db, "users", uid, "bills");
        await addDoc(billsRef, {
            ...billData,
            createdAt: Timestamp.now(),
        });
        console.log("Bill added successfully!");
    } catch (error) {
        console.error("Error adding bill:", error);
        throw error;
    }
};

export const getUpcomingBills = async (uid: string) => {
    try {
        const billsRef = collection(db, "users", uid, "bills");
        const q = query(billsRef, orderBy("dueDate", "asc")); // Closest due date first
        const querySnapshot = await getDocs(q);
        const bills: (BillData & { id: string })[] = [];

        querySnapshot.forEach((doc) => {
            bills.push({ id: doc.id, ...doc.data() } as any);
        });
        return bills;
    } catch (error) {
        console.error("Error fetching bills:", error);
        throw error;
    }
};

/**
 * Updates user profile data in Firestore.
 */
import { updateDoc } from "firebase/firestore";

export const updateUserProfile = async (uid: string, data: { name?: string, phone?: string, photoURL?: string }) => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
        console.log("User profile updated!");
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

/**
 * Adds a new wallet to user's wallet list.
 */
import { arrayUnion, getDoc } from "firebase/firestore";

export const addWallet = async (uid: string, wallet: Omit<WalletData, 'id' | 'createdAt'>) => {
    try {
        const userRef = doc(db, "users", uid);
        const walletData: WalletData = {
            ...wallet,
            id: `wallet_${Date.now()}`,
            createdAt: new Date(),
        };
        await updateDoc(userRef, {
            wallets: arrayUnion(walletData),
        });
        console.log("Wallet added!");
        return walletData;
    } catch (error) {
        console.error("Error adding wallet:", error);
        throw error;
    }
};

/**
 * Gets user's wallets from Firestore.
 */
export const getUserWallets = async (uid: string): Promise<WalletData[]> => {
    try {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data()?.wallets || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching wallets:", error);
        throw error;
    }
};
