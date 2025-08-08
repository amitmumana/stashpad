"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search,
  X,
  Frown,
  Bookmark,
  FileText,
  Code2,
  LogOut,
  Filter,
  PanelLeft,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

import type { Item, ItemType } from "@/lib/types";
import { fetchItems, addItem, deleteItem, updateItem } from "@/lib/data";
import { useOnScreen } from "@/hooks/use-on-screen";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { ItemCard } from "./item-card";
import { Loader } from "./loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AddItemDialog } from "./add-item-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function DashboardClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState<QueryDocumentSnapshot<DocumentData> | null>(
    null
  );
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ItemType | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadMoreVisible = useOnScreen(loadMoreRef);

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore || !user) return;
    setIsLoading(true);

    try {
      const { items: newItems, nextPage } = await fetchItems(user.uid, page);
      setItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewItems = newItems.filter(
          (item) => !existingIds.has(item.id)
        );
        return [...prev, ...uniqueNewItems];
      });
      setPage(nextPage);
      if (!nextPage) {
        setHasMore(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch items.",
      });
    } finally {
      setIsLoading(false);
      if (isInitialLoading) setIsInitialLoading(false);
    }
  }, [page, hasMore, isLoading, user, isInitialLoading, toast]);

  useEffect(() => {
    if (user && hasMore && isInitialLoading) {
      loadMoreItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (isLoadMoreVisible && !isLoading && !isInitialLoading && hasMore) {
      loadMoreItems();
    }
  }, [isLoadMoreVisible, isLoading, isInitialLoading, hasMore, loadMoreItems]);

  const handleAddItem = async (
    newItemData: Omit<Item, "id" | "createdAt" | "userId">
  ) => {
    if (!user) return;
    try {
      const fullItem = { ...newItemData, userId: user.uid };
      const newId = await addItem(fullItem);
      const newItem: Item = {
        id: newId,
        createdAt: new Date().toISOString(),
        ...fullItem,
      };
      setItems((prev) => [newItem, ...prev]);
      toast({
        title: "Item Added",
        description: "Your new item has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the item.",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Item Deleted",
        description: "The item has been removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the item.",
      });
    }
  };

  const handleEditItem = async (updatedItem: Item) => {
    try {
      const { id, ...updates } = updatedItem;
      await updateItem(id, updates);
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      toast({
        title: "Item Updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update the item.",
      });
    }
  };

  const openEditDialog = (item: Item) => {
    setItemToEdit(item);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setItemToEdit(null);
    setIsDialogOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => activeFilter === "all" || item.type === activeFilter)
      .filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.content &&
            item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
  }, [items, searchQuery, activeFilter]);

  const filters: {
    name: string;
    value: ItemType | "all";
    icon: React.ReactNode;
  }[] = [
    { name: "All", value: "all", icon: <></> },
    {
      name: "Bookmarks",
      value: "bookmark",
      icon: <Bookmark className="h-4 w-4" />,
    },
    { name: "Notes", value: "note", icon: <FileText className="h-4 w-4" /> },
    { name: "Code", value: "code", icon: <Code2 className="h-4 w-4" /> },
  ];

  const AddItemButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={openAddDialog}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add new item</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2 text-lg font-medium">
              <div className="mb-4">
                <Logo />
              </div>
            </nav>
            <div className="mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full justify-start gap-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="font-display text-base">
                        {user?.displayName?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user?.displayName ?? user?.email}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user?.displayName ?? user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden md:block">
          <Logo />
        </div>

        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-0.5 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 shrink-0">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={activeFilter}
                onValueChange={(value) =>
                  setActiveFilter(value as ItemType | "all")
                }
              >
                {filters.map((filter) => (
                  <DropdownMenuRadioItem
                    key={filter.value}
                    value={filter.value}
                    className="gap-2"
                  >
                    {filter.icon}
                    <span>{filter.name}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <Avatar>
                    <AvatarFallback className="font-display text-lg">
                      {user?.displayName?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.displayName ?? user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {isInitialLoading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              <motion.div
                className="gap-6 [column-count:1] sm:[column-count:2] lg:[column-count:3] xl:[column-count:4]"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    layout
                    className="mb-6 break-inside-avoid"
                  >
                    <ItemCard
                      item={item}
                      onDelete={handleDeleteItem}
                      onEdit={openEditDialog}
                    />
                  </motion.div>
                ))}
              </motion.div>
              <div
                ref={loadMoreRef}
                className="h-10 mt-8 flex justify-center items-center"
              >
                {isLoading && <Loader />}
                {!hasMore && items.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You've reached the end!
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No items found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filters, or add a new item.
              </p>
            </div>
          )}
        </div>
        <div className="fixed bottom-6 right-6 z-40">
          <AddItemButton />
        </div>
        <AddItemDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          itemToEdit={itemToEdit}
        />
      </main>
    </div>
  );
}
