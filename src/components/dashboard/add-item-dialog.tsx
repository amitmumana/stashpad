"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bookmark, Code2, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Item, ItemType } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  content: z.string().optional(),
  url: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  language: z.string().optional(),
  tags: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddItemDialogProps {
  onAddItem: (item: Omit<Item, "id" | "createdAt" | "userId">) => void;
  onEditItem: (item: Item) => void;
  itemToEdit: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const colorOptions = [
  { value: "#FFC0CB", label: "Pink" },
  { value: "#ADD8E6", label: "Blue" },
  { value: "#90EE90", label: "Green" },
  { value: "#FFFFE0", label: "Yellow" },
  { value: "#E6E6FA", label: "Purple" },
];

export function AddItemDialog({
  onAddItem,
  onEditItem,
  itemToEdit,
  open,
  onOpenChange,
  trigger,
}: AddItemDialogProps) {
  const [activeTab, setActiveTab] = useState<ItemType>("bookmark");

  const isEditMode = !!itemToEdit;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isEditMode && itemToEdit) {
      form.reset({
        title: itemToEdit.title,
        content: itemToEdit.content,
        url: itemToEdit.url,
        language: itemToEdit.language,
        tags: itemToEdit.tags.join(", "),
        color: itemToEdit.color,
      });
      setActiveTab(itemToEdit.type);
    } else {
      form.reset({
        title: "",
        content: "",
        url: "",
        language: "",
        tags: "",
        color: colorOptions[0].value,
      });
      setActiveTab("bookmark");
    }
  }, [itemToEdit, isEditMode, form, open]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (activeTab === "bookmark" && !data.url) {
      form.setError("url", {
        type: "manual",
        message: "URL is required for bookmarks.",
      });
      return;
    }
    if (activeTab === "note" && !data.content) {
      form.setError("content", {
        type: "manual",
        message: "Content is required for notes.",
      });
      return;
    }
    if (activeTab === "code" && !data.content) {
      form.setError("content", {
        type: "manual",
        message: "Code snippet is required.",
      });
      return;
    }

    if (isEditMode && itemToEdit) {
      const updatedItem: Item = {
        ...itemToEdit,
        type: activeTab,
        title: data.title,
        content: data.content || "",
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        color: data.color,
        url: activeTab === "bookmark" ? data.url : undefined,
        language: activeTab === "code" ? data.language : undefined,
      };
      onEditItem(updatedItem);
    } else {
      const newItem: Omit<Item, "id" | "createdAt" | "userId"> = {
        type: activeTab,
        title: data.title,
        content: data.content || "",
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        color: data.color,
        ...(activeTab === "bookmark" && { url: data.url }),
        ...(activeTab === "code" && { language: data.language }),
      };
      onAddItem(newItem);
    }

    onOpenChange(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ItemType);
    // Do not reset form when changing tabs in edit mode
    if (!isEditMode) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit item" : "Add a new item"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of your item."
              : "Save a new bookmark, note, or code snippet to your stash."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookmark">
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmark
              </TabsTrigger>
              <TabsTrigger value="note">
                <FileText className="mr-2 h-4 w-4" />
                Note
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code2 className="mr-2 h-4 w-4" />
                Code
              </TabsTrigger>
            </TabsList>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="My awesome item"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              {activeTab === "bookmark" && (
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    {...form.register("url")}
                    placeholder="https://example.com"
                  />
                  {form.formState.errors.url && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.url.message}
                    </p>
                  )}
                </div>
              )}
              {activeTab !== "bookmark" && (
                <div className="space-y-2">
                  <Label htmlFor="content">
                    {activeTab === "note" ? "Content" : "Code Snippet"}
                  </Label>
                  <Textarea
                    id="content"
                    {...form.register("content")}
                    className={
                      activeTab === "code"
                        ? "font-code min-h-[150px]"
                        : "min-h-[150px]"
                    }
                    placeholder={
                      activeTab === "note"
                        ? "Write your note here..."
                        : "Paste your code snippet here..."
                    }
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>
              )}
              {activeTab === "code" && (
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    {...form.register("language")}
                    placeholder="e.g., javascript, python"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  {...form.register("tags")}
                  placeholder="react, inspiration, tutorial"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <RadioGroup
                  value={form.watch("color")}
                  onValueChange={(value) => form.setValue("color", value)}
                  className="flex gap-4 pt-2"
                >
                  {colorOptions.map((color) => (
                    <TooltipProvider key={color.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label
                            className="relative flex cursor-pointer items-center justify-center rounded-full h-8 w-8"
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          >
                            <RadioGroupItem
                              value={color.value}
                              id={color.value}
                              className="sr-only"
                            />
                            {form.watch("color") === color.value && (
                              <div className="h-4 w-4 rounded-full border-2 border-white bg-transparent ring-2 ring-primary" />
                            )}
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{color.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Tabs>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Save changes" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
