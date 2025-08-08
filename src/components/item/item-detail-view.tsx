"use client";

import {
  ArrowLeft,
  Bookmark,
  Code2,
  Copy,
  Check,
  ExternalLink,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, cloneElement } from "react";
import type { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ItemDetailViewProps {
  item: Item;
}

const itemIcons: Record<Item["type"], React.ReactNode> = {
  bookmark: <Bookmark className="h-5 w-5" />,
  note: <FileText className="h-5 w-5" />,
  code: <Code2 className="h-5 w-5" />,
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

export function ItemDetailView({ item }: ItemDetailViewProps) {
  const { type, title, content, url, language, tags, createdAt, color } = item;
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const iconWithColor = color
    ? cloneElement(itemIcons[type] as React.ReactElement, { style: { color } })
    : itemIcons[type];

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Code snippet copied to clipboard.",
        });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy code.",
        });
      });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-6">
          <div className="flex-shrink-0" style={{ color: color }}>
            {iconWithColor}
          </div>
          <div className="flex-1">
            <CardTitle
              className="text-2xl font-bold leading-tight"
              style={{ color }}
            >
              {title}
            </CardTitle>
            {type === "bookmark" && url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground mt-2 hover:underline"
              >
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
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {type === "code" && language && (
              <p className="text-sm text-muted-foreground mt-2 capitalize">
                {language}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {type === "bookmark" && url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block mb-4"
            >
              <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                <Image
                  src={`https://placehold.co/800x450.png`}
                  alt={title}
                  width={800}
                  height={450}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="website screenshot"
                />
              </div>
            </a>
          )}
          {content && (
            <>
              {type === "note" && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80">
                  {content}
                </div>
              )}
              {type === "code" && (
                <div className="relative text-sm bg-muted/50 rounded-md p-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={handleCopy}
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isCopied ? "Copied!" : "Copy code"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <pre className="overflow-auto">
                    <code className="font-code">{content}</code>
                  </pre>
                </div>
              )}
              {type === "bookmark" && content && (
                <p className="text-muted-foreground mt-2">{content}</p>
              )}
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {tags &&
              tags.length > 0 &&
              tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  #{tag}
                </Badge>
              ))}
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Created on: {new Date(createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
