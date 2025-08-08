export type ItemType = "bookmark" | "note" | "code";

export interface Item {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  content: string;
  url?: string;
  language?: string;
  tags: string[];
  createdAt: string;
  color?: string;
}
