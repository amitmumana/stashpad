import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  getDoc,
} from "firebase/firestore";
import type { Item } from "@/lib/types";

const transformTimestamp = (timestamp: any): string => {
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === "string") {
    return timestamp;
  }
  return new Date().toISOString();
};

export const fetchItems = async (
  userId: string,
  pageParam: QueryDocumentSnapshot<DocumentData> | null = null,
  count = 20
): Promise<{
  items: Item[];
  nextPage: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    const itemsCollection = collection(db, "items");
    let q;

    if (pageParam) {
      q = query(
        itemsCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        startAfter(pageParam),
        limit(count)
      );
    } else {
      q = query(
        itemsCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(count)
      );
    }

    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: transformTimestamp(data.createdAt),
      } as Item;
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      items,
      nextPage: lastVisible || null,
    };
  } catch (error) {
    console.error("Error fetching items: ", error);
    return { items: [], nextPage: null };
  }
};

export const fetchItemById = async (id: string): Promise<Item | null> => {
  try {
    const docRef = doc(db, "items", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: transformTimestamp(data.createdAt),
      } as Item;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching item by ID: ", error);
    return null;
  }
};

export const addItem = async (item: Omit<Item, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "items"), {
      ...item,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding item: ", error);
    throw error;
  }
};

export const deleteItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, "items", id));
  } catch (error) {
    console.error("Error deleting item: ", error);
    throw error;
  }
};

export const updateItem = async (
  id: string,
  updates: Partial<Omit<Item, "id">>
) => {
  try {
    // Firestore does not allow `undefined` values. We need to clean the updates object.
    const cleanedUpdates: { [key: string]: any } = {};
    for (const key in updates) {
      if (updates[key as keyof typeof updates] !== undefined) {
        cleanedUpdates[key] = updates[key as keyof typeof updates];
      }
    }

    await updateDoc(doc(db, "items", id), cleanedUpdates);
  } catch (error) {
    console.error("Error updating item: ", error);
    throw error;
  }
};
