"use client";

import { useState, cloneElement } from "react";
import Link from "next/link";
import {
  Bookmark,
  Code2,
  FileText,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import type { Item } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ItemCardProps {
  item: Item;
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}

const itemIcons: Record<Item["type"], React.ReactNode> = {
  bookmark: <Bookmark className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  code: <Code2 className="h-4 w-4" />,
};

const getDomain = (url: string) => {
  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    return new URL(url).hostname;
  } catch (e) {
    return "";
  }
};

export function ItemCard({ item, onDelete, onEdit }: ItemCardProps) {
  const { id, type, title, content, url, language, tags, createdAt, color } =
    item;
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!content) return;
    navigator.clipboard
      .writeText(content)
      .then(() => {
        const description =
          type === "code"
            ? "Code snippet copied to clipboard."
            : "Note content copied to clipboard.";
        toast({ title: "Copied!", description });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy content.",
        });
      });
  };

  const iconWithColor = color
    ? cloneElement(itemIcons[type] as React.ReactElement, { style: { color } })
    : itemIcons[type];

  const renderCardHeader = () => (
    <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
      <div className="flex-shrink-0" style={{ color: color }}>
        {iconWithColor}
      </div>
      <div className="flex-1">
        <CardTitle
          className="text-base font-semibold leading-tight"
          style={{ color }}
        >
          {title}
        </CardTitle>
        {type === "bookmark" && url && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Image
              src={`https://www.google.com/s2/favicons?sz=32&domain_url=${getDomain(
                url
              )}`}
              alt={`${getDomain(url)} favicon`}
              width={16}
              height={16}
              className="rounded"
              unoptimized
            />
            <span className="truncate">{getDomain(url)}</span>
          </div>
        )}
        {type === "code" && language && (
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {language}
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <AlertDialog
            open={showDeleteConfirm}
            onOpenChange={(isOpen) => {
              if (isOpen) {
                setShowDeleteConfirm(true);
              } else {
                setTimeout(() => setShowDeleteConfirm(false), 100);
              }
            }}
          >
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your item and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
  );

  const renderCardContent = () => (
    <CardContent className="flex-grow p-4 pt-0">
      {type === "bookmark" && content && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {content}
        </p>
      )}
      {type === "note" && (
        <div className="relative text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6 prose prose-sm dark:prose-invert max-w-none">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-[-8px] right-[-8px] h-7 w-7 z-10"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <p>{isCopied ? "Copied!" : "Copy note"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || ""}
          </ReactMarkdown>
        </div>
      )}
      {type === "code" && content && (
        <div className="relative text-sm bg-muted/50 rounded-md max-h-48 overflow-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 z-10"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <p>{isCopied ? "Copied!" : "Copy code"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <pre className="p-3 pr-10">
            <code className="font-code">{content}</code>
          </pre>
        </div>
      )}
    </CardContent>
  );

  return (
    <Card className="flex flex-col overflow-hidden duration-300">
      {type === "bookmark" && url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
          onClick={(e) => e.stopPropagation()}
        >
          {renderCardHeader()}
          {renderCardContent()}
        </a>
      ) : (
        <>
          <Link href={`/item/${id}`} className="block">
            {renderCardHeader()}
          </Link>
          {/* Note content is rendered outside the link to avoid nesting <a> tags */}
          {renderCardContent()}
        </>
      )}

      <Separator />

      <CardFooter className="flex-wrap gap-2 p-4 text-xs text-muted-foreground">
        <div className="flex-grow flex items-center gap-2">
          {tags &&
            tags.length > 0 &&
            tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                #{tag}
              </Badge>
            ))}
        </div>
        {createdAt && <span>{new Date(createdAt).toLocaleDateString()}</span>}
      </CardFooter>
    </Card>
  );
}
